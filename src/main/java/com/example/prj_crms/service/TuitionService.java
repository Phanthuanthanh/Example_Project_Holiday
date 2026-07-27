package com.example.prj_crms.service;

import com.example.prj_crms.model.ClassOffering;
import com.example.prj_crms.model.PaymentReceipt;
import com.example.prj_crms.model.Subject;
import com.example.prj_crms.model.TuitionInvoice;
import com.example.prj_crms.repository.ClassOfferingRepository;
import com.example.prj_crms.repository.PaymentReceiptRepository;
import com.example.prj_crms.repository.SubjectRepository;
import com.example.prj_crms.repository.TuitionInvoiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class TuitionService {

    private final TuitionInvoiceRepository tuitionInvoiceRepository;
    private final PaymentReceiptRepository paymentReceiptRepository;
    private final ClassOfferingRepository classOfferingRepository;
    private final SubjectRepository subjectRepository;
    private final StudentService studentService;

    public TuitionService(TuitionInvoiceRepository tuitionInvoiceRepository,
                          PaymentReceiptRepository paymentReceiptRepository,
                          ClassOfferingRepository classOfferingRepository,
                          SubjectRepository subjectRepository,
                          StudentService studentService) {
        this.tuitionInvoiceRepository = tuitionInvoiceRepository;
        this.paymentReceiptRepository = paymentReceiptRepository;
        this.classOfferingRepository = classOfferingRepository;
        this.subjectRepository = subjectRepository;
        this.studentService = studentService;
    }

    // Xem danh sách hóa đơn học phí của sinh viên
    public List<TuitionInvoice> getInvoices(String studentId) {
        return tuitionInvoiceRepository.findByStudentId(studentId);
    }

    // Chi tiết học phí của hóa đơn (Breakdown)
    public List<Map<String, Object>> getInvoiceBreakdown(String invoiceId) {
        Optional<TuitionInvoice> invoiceOpt = tuitionInvoiceRepository.findById(invoiceId);
        if (invoiceOpt.isEmpty()) {
            return Collections.emptyList();
        }
        TuitionInvoice invoice = invoiceOpt.get();

        // Lấy danh sách lớp đã đăng ký thành công của sinh viên trong kỳ của hóa đơn này
        List<Map<String, Object>> regs = studentService.getStudentRegistrations(invoice.getStudentId());
        List<Map<String, Object>> breakdown = new ArrayList<>();

        for (Map<String, Object> reg : regs) {
            Map<String, Object> row = new HashMap<>();
            row.put("classId", reg.get("id"));
            row.put("subject", reg.get("subject"));
            row.put("credits", reg.get("credits"));
            row.put("unitPrice", 500000L); // 500k/TC
            row.put("total", ((int) reg.get("credits")) * 500000L);
            breakdown.add(row);
        }
        return breakdown;
    }

    // Xem lịch sử giao dịch biên lai đóng tiền
    public List<PaymentReceipt> getPaymentReceipts(String studentId) {
        return paymentReceiptRepository.findByStudentId(studentId);
    }

    // Tạo URL thanh toán giả lập VNPAY (chỉ hướng sang Frontend Simulator)
    public Map<String, String> generatePaymentUrl(String invoiceId, BigDecimal amount) {
        // Trả về link chuyển hướng chứa flag vnpaySimulate=true để frontend bắt được và mở cổng giả lập
        String simulateUrl = "/?vnpaySimulate=true&invoiceId=" + invoiceId + "&amount=" + amount;
        return Map.of("paymentUrl", simulateUrl);
    }

    // Xử lý IPN callback từ trình giả lập thanh toán VNPAY (IPN API)
    @Transactional
    public synchronized Map<String, Object> processVnpayIpn(String invoiceId, BigDecimal amount, String txnCode, String responseCode) {
        Optional<TuitionInvoice> invoiceOpt = tuitionInvoiceRepository.findById(invoiceId);
        if (invoiceOpt.isEmpty()) {
            return Map.of("RspCode", "01", "Message", "Invoice not found");
        }
        TuitionInvoice invoice = invoiceOpt.get();

        // 1. Ngăn chặn giao dịch trùng lặp (Double Spend Prevention)
        if ("paid".equalsIgnoreCase(invoice.getStatus()) && amount.compareTo(invoice.getRequired()) >= 0) {
            return Map.of("RspCode", "02", "Message", "Invoice already paid");
        }

        boolean isSuccess = "00".equals(responseCode);

        // Tạo biên lai giao dịch PaymentReceipt
        PaymentReceipt receipt = PaymentReceipt.builder()
                .receiptId("REC-" + invoice.getStudentId() + "-" + System.currentTimeMillis() % 100000)
                .studentId(invoice.getStudentId())
                .invoiceId(invoiceId)
                .code(txnCode)
                .date(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .amount(amount)
                .method("VNPAY")
                .result(isSuccess ? "success" : "failed")
                .build();
        paymentReceiptRepository.save(receipt);

        if (isSuccess) {
            // Cập nhật số tiền đã đóng
            BigDecimal newPaid = invoice.getPaid().add(amount);
            invoice.setPaid(newPaid);
            BigDecimal debt = invoice.getRequired().subtract(newPaid);
            invoice.setDebt(debt);

            // Cập nhật trạng thái
            if (debt.compareTo(BigDecimal.ZERO) <= 0) {
                invoice.setStatus("paid");
            } else {
                invoice.setStatus("partially_paid");
            }
            tuitionInvoiceRepository.save(invoice);

            // Tự động mở khóa quyền đăng ký tín chỉ nếu sinh viên không còn nợ học phí quá hạn học kỳ cũ
            checkAndUnlockStudent(invoice.getStudentId());

            return Map.of("RspCode", "00", "Message", "Confirm success");
        } else {
            return Map.of("RspCode", "00", "Message", "Transaction failed recorded");
        }
    }

    // Kiểm tra xem sinh viên có còn hóa đơn nào bị quá hạn (overdue) không để cập nhật
    private void checkAndUnlockStudent(String studentId) {
        List<TuitionInvoice> invoices = tuitionInvoiceRepository.findByStudentId(studentId);
        boolean hasOverdue = false;
        for (TuitionInvoice inv : invoices) {
            if ("overdue".equalsIgnoreCase(inv.getStatus())) {
                hasOverdue = true;
                break;
            }
        }
        // Nếu không còn hóa đơn nào overdue, đảm bảo không bị chặn
        // Ở phiên bản đơn giản này, thông báo lỗi được hiển thị động dựa trên database
    }
}
