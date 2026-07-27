package com.example.prj_crms.controller;

import com.example.prj_crms.model.PaymentReceipt;
import com.example.prj_crms.model.TuitionInvoice;
import com.example.prj_crms.service.StudentService;
import com.example.prj_crms.service.TuitionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    private final StudentService studentService;
    private final TuitionService tuitionService;

    public StudentController(StudentService studentService, TuitionService tuitionService) {
        this.studentService = studentService;
        this.tuitionService = tuitionService;
    }

    // Tra cứu lớp học phần đang mở (STUD_01)
    @GetMapping("/classes/open")
    public ResponseEntity<List<Map<String, Object>>> getOpenClasses(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(required = false, defaultValue = "Tất cả") String department) {
        return ResponseEntity.ok(studentService.getOpenClasses(keyword, department));
    }

    // Xem danh sách lớp đã đăng ký thành công
    @GetMapping("/registrations")
    public ResponseEntity<List<Map<String, Object>>> getStudentRegistrations(@RequestParam String studentId) {
        return ResponseEntity.ok(studentService.getStudentRegistrations(studentId));
    }

    // Đăng ký mới lớp học phần (STUD_02)
    @PostMapping("/registrations")
    public ResponseEntity<?> registerClass(@RequestBody Map<String, String> body) {
        String studentId = body.get("studentId");
        String classCode = body.get("classCode");
        try {
            return ResponseEntity.ok(studentService.registerClass(studentId, classCode));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Hủy đăng ký lớp học phần (STUD_02)
    @DeleteMapping("/registrations")
    public ResponseEntity<?> unregisterClass(@RequestParam String studentId, @RequestParam String classCode) {
        try {
            return ResponseEntity.ok(studentService.unregisterClass(studentId, classCode));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Xem thời khóa biểu cá nhân của sinh viên (STUD_03)
    @GetMapping("/timetable")
    public ResponseEntity<List<Map<String, Object>>> getStudentTimetable(@RequestParam String studentId) {
        return ResponseEntity.ok(studentService.getStudentTimetable(studentId));
    }

    // Xem công nợ học phí của sinh viên (STUD_04)
    @GetMapping("/invoices")
    public ResponseEntity<List<TuitionInvoice>> getInvoices(@RequestParam String studentId) {
        return ResponseEntity.ok(tuitionService.getInvoices(studentId));
    }

    // Xem chi tiết học phí của hóa đơn (STUD_04)
    @GetMapping("/invoices/{invoiceId}/breakdown")
    public ResponseEntity<List<Map<String, Object>>> getInvoiceBreakdown(@PathVariable String invoiceId) {
        return ResponseEntity.ok(tuitionService.getInvoiceBreakdown(invoiceId));
    }

    // Xem lịch sử giao dịch đóng tiền (STUD_04)
    @GetMapping("/payment-receipts")
    public ResponseEntity<List<PaymentReceipt>> getPaymentReceipts(@RequestParam String studentId) {
        return ResponseEntity.ok(tuitionService.getPaymentReceipts(studentId));
    }

    // Thanh toán học phí (Kết nối cổng VNPAY giả lập) (STUD_04)
    @PostMapping("/pay")
    public ResponseEntity<Map<String, String>> payTuition(@RequestBody Map<String, Object> body) {
        String invoiceId = (String) body.get("invoiceId");
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        return ResponseEntity.ok(tuitionService.generatePaymentUrl(invoiceId, amount));
    }
}
