package com.example.prj_crms.service;

import com.example.prj_crms.model.*;
import com.example.prj_crms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final ClassOfferingRepository classOfferingRepository;
    private final ClassScheduleRepository classScheduleRepository;
    private final RegistrationRepository registrationRepository;
    private final TuitionInvoiceRepository tuitionInvoiceRepository;
    private final RegistrationPeriodRepository registrationPeriodRepository;
    private final LecturerRepository lecturerRepository;

    public StudentService(StudentRepository studentRepository, SubjectRepository subjectRepository,
                          ClassOfferingRepository classOfferingRepository, ClassScheduleRepository classScheduleRepository,
                          RegistrationRepository registrationRepository, TuitionInvoiceRepository tuitionInvoiceRepository,
                          RegistrationPeriodRepository registrationPeriodRepository, LecturerRepository lecturerRepository) {
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.classOfferingRepository = classOfferingRepository;
        this.classScheduleRepository = classScheduleRepository;
        this.registrationRepository = registrationRepository;
        this.tuitionInvoiceRepository = tuitionInvoiceRepository;
        this.registrationPeriodRepository = registrationPeriodRepository;
        this.lecturerRepository = lecturerRepository;
    }

    // Lấy danh sách các lớp học phần đang mở (Kèm bộ lọc khoa và từ khóa)
    public List<Map<String, Object>> getOpenClasses(String keyword, String department) {
        List<ClassOffering> offerings = classOfferingRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (ClassOffering offering : offerings) {
            if (!"open".equalsIgnoreCase(offering.getStatus())) {
                continue; // Chỉ hiển thị các lớp đang mở đăng ký cho sinh viên
            }
            if (!"HK2 2025-2026".equalsIgnoreCase(offering.getSemester())) {
                continue; // Chỉ hiển thị lớp của học kỳ hiện tại đang đăng ký
            }

            Optional<Subject> subjectOpt = subjectRepository.findById(offering.getSubjectId());
            if (subjectOpt.isEmpty()) continue;
            Subject subject = subjectOpt.get();

            // Lọc theo Khoa
            if (department != null && !department.isEmpty() && !"Tất cả".equalsIgnoreCase(department)) {
                if (!department.equalsIgnoreCase(subject.getDept())) {
                    continue;
                }
            }

            // Lọc theo từ khóa (Mã lớp, tên môn học, mã môn học)
            if (keyword != null && !keyword.isEmpty()) {
                String kw = keyword.toLowerCase();
                boolean matchesId = offering.getId().toLowerCase().contains(kw);
                boolean matchesSubject = subject.getName().toLowerCase().contains(kw) || subject.getId().toLowerCase().contains(kw);
                if (!matchesId && !matchesSubject) {
                    continue;
                }
            }

            Map<String, Object> map = new HashMap<>();
            map.put("id", offering.getId());
            map.put("subject", subject.getName());
            map.put("credits", subject.getCredits());
            String lecturerName = lecturerRepository.findById(offering.getLecturerId())
                    .map(Lecturer::getFullName)
                    .orElse(offering.getLecturerId());
            map.put("lecturer", lecturerName);
            map.put("schedule", offering.getSchedule());
            map.put("room", offering.getRoom());
            map.put("enrolled", offering.getEnrolled());
            map.put("max", offering.getMaxStudents());
            map.put("fee", subject.getCredits() * 500000); // 500k/tín chỉ
            map.put("status", offering.getStatus());
            result.add(map);
        }

        return result;
    }

    // Xem danh sách đăng ký hiện tại của sinh viên
    public List<Map<String, Object>> getStudentRegistrations(String studentId) {
        List<Registration> regs = registrationRepository.findByStudentIdAndStatus(studentId, "SUCCESS");
        List<Map<String, Object>> result = new ArrayList<>();

        for (Registration reg : regs) {
            Optional<ClassOffering> offeringOpt = classOfferingRepository.findById(reg.getClassCode());
            if (offeringOpt.isEmpty()) continue;
            ClassOffering offering = offeringOpt.get();

            if (!"HK2 2025-2026".equalsIgnoreCase(offering.getSemester())) {
                continue; // Giỏ đăng ký học phần chỉ hiển thị học kỳ hiện tại
            }

            Optional<Subject> subjectOpt = subjectRepository.findById(offering.getSubjectId());
            if (subjectOpt.isEmpty()) continue;
            Subject subject = subjectOpt.get();

            Map<String, Object> map = new HashMap<>();
            map.put("id", offering.getId());
            map.put("subject", subject.getName());
            map.put("credits", subject.getCredits());
            map.put("schedule", offering.getSchedule());
            map.put("room", offering.getRoom());
            map.put("fee", subject.getCredits() * 500000);
            map.put("status", reg.getStatus());
            result.add(map);
        }
        return result;
    }

    // Đăng ký lớp học phần mới với đầy đủ ràng buộc (STUD_02)
    @Transactional
    public synchronized Map<String, Object> registerClass(String studentId, String classCode) {
        // 0. Kiểm tra tài khoản sinh viên
        Optional<Student> studentOpt = studentRepository.findById(studentId);
        if (studentOpt.isEmpty()) {
            throw new RuntimeException("Tài khoản sinh viên không tồn tại.");
        }
        Student student = studentOpt.get();
        if (!"ACTIVE".equalsIgnoreCase(student.getStatus())) {
            throw new RuntimeException("Tài khoản sinh viên đang bị khóa hoặc ngưng học.");
        }

        // Tìm lớp học phần trước để biết học kỳ
        Optional<ClassOffering> offeringOpt = classOfferingRepository.findById(classCode);
        if (offeringOpt.isEmpty()) {
            throw new RuntimeException("Mã lớp học phần không tồn tại.");
        }
        ClassOffering offering = offeringOpt.get();

        if (!"open".equalsIgnoreCase(offering.getStatus())) {
            throw new RuntimeException("Lớp học phần này không ở trạng thái mở đăng ký.");
        }

        // 1. Kiểm tra đợt đăng ký đang mở phù hợp với Khóa/Ngành
        List<RegistrationPeriod> periods = registrationPeriodRepository.findAll();
        String className = student.getClassName();
        String[] classParts = className.split("-");
        String studentDept = classParts[0];
        String studentBatch = classParts.length > 1 ? classParts[1].substring(0, 3) : "";

        boolean isTargetPeriodOpen = false;
        for (RegistrationPeriod p : periods) {
            if ("OPEN".equalsIgnoreCase(p.getStatus())) {
                List<String> targetDepts = Arrays.asList(p.getTargetDepartments().split(","));
                List<String> targetBatches = Arrays.asList(p.getTargetBatches().split(","));
                if (targetDepts.contains(studentDept) && targetBatches.contains(studentBatch)) {
                    isTargetPeriodOpen = true;
                    break;
                }
            }
        }
        if (!isTargetPeriodOpen) {
            throw new RuntimeException("Hiện không có đợt đăng ký tín chỉ nào mở cho Khóa/Ngành của bạn.");
        }

        // 2. Kiểm tra nợ học phí quá hạn học kỳ cũ
        List<TuitionInvoice> invoices = tuitionInvoiceRepository.findByStudentId(studentId);
        for (TuitionInvoice invoice : invoices) {
            if ("overdue".equalsIgnoreCase(invoice.getStatus())) {
                throw new RuntimeException("Tài khoản của bạn đã bị khóa quyền đăng ký tín chỉ trực tuyến do nợ học phí quá hạn học kỳ trước.");
            }
        }

        // 4. Kiểm tra sĩ số lớp
        if (offering.getEnrolled() >= offering.getMaxStudents()) {
            throw new RuntimeException("Lớp học phần " + classCode + " đã đạt giới hạn sĩ số tối đa.");
        }

        Optional<Subject> subjectOpt = subjectRepository.findById(offering.getSubjectId());
        if (subjectOpt.isEmpty()) {
            throw new RuntimeException("Không tìm thấy thông tin môn học.");
        }
        Subject subject = subjectOpt.get();

        // 5. Kiểm tra xem đã đăng ký lớp này chưa
        boolean alreadyReg = registrationRepository.existsByStudentIdAndClassCodeAndStatus(studentId, classCode, "SUCCESS");
        if (alreadyReg) {
            throw new RuntimeException("Bạn đã đăng ký lớp học phần này rồi.");
        }

        // Lấy danh sách đăng ký thành công của học kỳ hiện tại
        List<Registration> allRegs = registrationRepository.findByStudentIdAndStatus(studentId, "SUCCESS");
        List<Registration> currentSemesterRegs = new ArrayList<>();
        for (Registration r : allRegs) {
            Optional<ClassOffering> coOpt = classOfferingRepository.findById(r.getClassCode());
            if (coOpt.isPresent() && coOpt.get().getSemester().equalsIgnoreCase(offering.getSemester())) {
                currentSemesterRegs.add(r);
            }
        }

        // Kiểm tra xem đã đăng ký môn học này ở lớp khác trong học kỳ này chưa
        for (Registration ar : currentSemesterRegs) {
            Optional<ClassOffering> coOpt = classOfferingRepository.findById(ar.getClassCode());
            if (coOpt.isPresent() && coOpt.get().getSubjectId().equals(offering.getSubjectId())) {
                throw new RuntimeException("Bạn đã đăng ký một lớp học phần khác của môn học này trong học kỳ hiện tại.");
            }
        }

        // 6. Kiểm tra môn tiên quyết (Prerequisite Check) - vẫn tìm trên toàn bộ lịch sử các kỳ
        if (subject.getPrereq() != null && !subject.getPrereq().equals("—")) {
            String prereqSubjectId = subject.getPrereq();
            boolean hasPrereq = false;
            for (Registration r : allRegs) {
                Optional<ClassOffering> coOpt = classOfferingRepository.findById(r.getClassCode());
                if (coOpt.isPresent() && coOpt.get().getSubjectId().equals(prereqSubjectId)) {
                    hasPrereq = true;
                    break;
                }
            }
            if (!hasPrereq) {
                Optional<Subject> prereqSubOpt = subjectRepository.findById(prereqSubjectId);
                String prereqName = prereqSubOpt.map(Subject::getName).orElse(prereqSubjectId);
                throw new RuntimeException("Bạn chưa đạt môn học tiên quyết " + prereqSubjectId + " - " + prereqName + " của môn học này.");
            }
        }

        // 7. Kiểm tra trùng lịch học trong cùng học kỳ
        List<ClassSchedule> newSchedules = classScheduleRepository.findByClassCode(classCode);
        for (Registration ar : currentSemesterRegs) {
            List<ClassSchedule> currentSchedules = classScheduleRepository.findByClassCode(ar.getClassCode());
            for (ClassSchedule ns : newSchedules) {
                for (ClassSchedule cs : currentSchedules) {
                    if (ns.getDayOfWeek() == cs.getDayOfWeek()) {
                        // Kiểm tra giao tiết [start, end]
                        int maxStart = Math.max(ns.getStartPeriod(), cs.getStartPeriod());
                        int minEnd = Math.min(ns.getEndPeriod(), cs.getEndPeriod());
                        if (maxStart <= minEnd) {
                            throw new RuntimeException("Lịch học lớp này trùng Thứ " + ns.getDayOfWeek() + ", Tiết " + ns.getStartPeriod() + "-" + ns.getEndPeriod() + " với lớp " + ar.getClassCode() + " đã có trong thời khóa biểu.");
                        }
                    }
                }
            }
        }

        // 8. Kiểm tra hạn mức tín chỉ tối đa (25 tín chỉ) trong cùng học kỳ
        int currentCredits = 0;
        for (Registration ar : currentSemesterRegs) {
            Optional<ClassOffering> coOpt = classOfferingRepository.findById(ar.getClassCode());
            if (coOpt.isPresent()) {
                Optional<Subject> sOpt = subjectRepository.findById(coOpt.get().getSubjectId());
                if (sOpt.isPresent()) {
                    currentCredits += sOpt.get().getCredits();
                }
            }
        }
        if (currentCredits + subject.getCredits() > 25) {
            throw new RuntimeException("Tổng số tín chỉ đăng ký học kỳ vượt quá hạn mức tối đa cho phép (25 tín chỉ).");
        }

        // 9. Xác định loại đăng ký (Học mới, Học cải thiện, Học lại)
        // Hiện tại giả định mặc định là Học mới, trong thực tế sẽ kiểm tra lịch sử học tập
        String registerType = "Học mới";

        // 10. Tiến hành đăng ký
        Registration newReg = Registration.builder()
                .id("REG-" + studentId + "-" + classCode)
                .studentId(studentId)
                .classCode(classCode)
                .registerDate(LocalDateTime.now())
                .registerType(registerType)
                .status("SUCCESS")
                .build();
        registrationRepository.save(newReg);

        // Cập nhật sĩ số lớp học phần
        offering.setEnrolled(offering.getEnrolled() + 1);
        classOfferingRepository.save(offering);

        // Tính toán lại hóa đơn học phí của học kỳ
        recalculateInvoice(studentId, offering.getSemester());

        return Map.of("message", "Đăng ký thành công lớp học phần " + classCode);
    }

    // Hủy đăng ký học phần (Kiểm tra ràng buộc tín chỉ tối thiểu 12 TC)
    @Transactional
    public synchronized Map<String, Object> unregisterClass(String studentId, String classCode) {
        // Kiểm tra đợt đăng ký đang mở
        List<RegistrationPeriod> periods = registrationPeriodRepository.findAll();
        boolean isPeriodOpen = periods.stream().anyMatch(p -> "OPEN".equalsIgnoreCase(p.getStatus()));
        if (!isPeriodOpen) {
            throw new RuntimeException("Cổng đăng ký học phần đã đóng, không thể hủy.");
        }

        Optional<Registration> regOpt = registrationRepository.findByStudentIdAndClassCodeAndStatus(studentId, classCode, "SUCCESS");
        if (regOpt.isEmpty()) {
            throw new RuntimeException("Không tìm thấy bản ghi đăng ký hợp lệ.");
        }
        Registration reg = regOpt.get();

        Optional<ClassOffering> offeringOpt = classOfferingRepository.findById(classCode);
        if (offeringOpt.isEmpty()) {
            throw new RuntimeException("Mã lớp học phần không tồn tại.");
        }
        ClassOffering offering = offeringOpt.get();

        Optional<Subject> subjectOpt = subjectRepository.findById(offering.getSubjectId());
        if (subjectOpt.isEmpty()) {
            throw new RuntimeException("Không tìm thấy thông tin môn học.");
        }
        Subject subject = subjectOpt.get();

        // Kiểm tra hạn mức tín chỉ tối thiểu (12 TC) trong cùng học kỳ
        List<Registration> activeRegs = registrationRepository.findByStudentIdAndStatus(studentId, "SUCCESS");
        int currentCredits = 0;
        for (Registration ar : activeRegs) {
            Optional<ClassOffering> coOpt = classOfferingRepository.findById(ar.getClassCode());
            if (coOpt.isPresent() && coOpt.get().getSemester().equalsIgnoreCase(offering.getSemester())) {
                Optional<Subject> sOpt = subjectRepository.findById(coOpt.get().getSubjectId());
                if (sOpt.isPresent()) {
                    currentCredits += sOpt.get().getCredits();
                }
            }
        }
        if (currentCredits - subject.getCredits() < 12) {
            throw new RuntimeException("Không thể hủy lớp học phần này vì tổng số tín chỉ đăng ký còn lại trong học kỳ chính (" + (currentCredits - subject.getCredits()) + " TC) sẽ bị tụt dưới giới hạn tối thiểu quy định (12 tín chỉ).");
        }

        // Hủy đăng ký
        reg.setStatus("CANCELLED");
        registrationRepository.save(reg);

        // Giảm sĩ số lớp
        if (offering.getEnrolled() > 0) {
            offering.setEnrolled(offering.getEnrolled() - 1);
            classOfferingRepository.save(offering);
        }

        // Tính toán lại hóa đơn học phí
        recalculateInvoice(studentId, offering.getSemester());

        return Map.of("message", "Đã hủy đăng ký lớp học phần " + classCode);
    }

    // Tính toán lại hóa đơn học phí sau khi thay đổi số lượng tín chỉ
    private void recalculateInvoice(String studentId, String semester) {
        List<Registration> activeRegs = registrationRepository.findByStudentIdAndStatus(studentId, "SUCCESS");
        int totalCredits = 0;
        for (Registration ar : activeRegs) {
            Optional<ClassOffering> coOpt = classOfferingRepository.findById(ar.getClassCode());
            if (coOpt.isPresent() && coOpt.get().getSemester().equals(semester)) {
                Optional<Subject> sOpt = subjectRepository.findById(coOpt.get().getSubjectId());
                if (sOpt.isPresent()) {
                    totalCredits += sOpt.get().getCredits();
                }
            }
        }

        BigDecimal requiredAmount = BigDecimal.valueOf(totalCredits * 500000L); // 500k/tín chỉ
        Optional<TuitionInvoice> invoiceOpt = tuitionInvoiceRepository.findByStudentIdAndSemester(studentId, semester);

        TuitionInvoice invoice;
        if (invoiceOpt.isPresent()) {
            invoice = invoiceOpt.get();
            invoice.setRequired(requiredAmount);
            invoice.setDebt(requiredAmount.subtract(invoice.getPaid()));
        } else {
            invoice = TuitionInvoice.builder()
                    .invoiceId("INV-" + studentId + "-" + semester.replace(" ", "_"))
                    .studentId(studentId)
                    .semester(semester)
                    .required(requiredAmount)
                    .paid(BigDecimal.ZERO)
                    .debt(requiredAmount)
                    .deadline("31/10/2026")
                    .status("unpaid")
                    .build();
        }

        // Cập nhật trạng thái hóa đơn
        if (invoice.getDebt().compareTo(BigDecimal.ZERO) <= 0) {
            invoice.setStatus("paid");
        } else if (invoice.getPaid().compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatus("partially_paid");
        } else {
            invoice.setStatus("unpaid");
        }

        tuitionInvoiceRepository.save(invoice);
    }

    // Xem thời khóa biểu cá nhân của sinh viên
    public List<Map<String, Object>> getStudentTimetable(String studentId) {
        List<Registration> regs = registrationRepository.findByStudentIdAndStatus(studentId, "SUCCESS");
        List<Map<String, Object>> timetable = new ArrayList<>();

        String[] colors = {"bg-blue-100 border-blue-300 text-blue-700", "bg-purple-100 border-purple-300 text-purple-700", "bg-green-100 border-green-300 text-green-700", "bg-amber-100 border-amber-300 text-amber-700"};
        int colorIdx = 0;

        for (Registration reg : regs) {
            Optional<ClassOffering> offeringOpt = classOfferingRepository.findById(reg.getClassCode());
            if (offeringOpt.isEmpty()) continue;
            ClassOffering offering = offeringOpt.get();

            if (!"HK2 2025-2026".equalsIgnoreCase(offering.getSemester())) {
                continue; // Thời khóa biểu cá nhân chỉ hiển thị học kỳ hiện tại
            }

            Optional<Subject> subjectOpt = subjectRepository.findById(offering.getSubjectId());
            if (subjectOpt.isEmpty()) continue;
            Subject subject = subjectOpt.get();

            List<ClassSchedule> schedules = classScheduleRepository.findByClassCode(offering.getId());
            String color = colors[colorIdx % colors.length];
            colorIdx++;

            for (ClassSchedule cs : schedules) {
                Map<String, Object> map = new HashMap<>();
                map.put("day", cs.getDayOfWeek());
                map.put("period", cs.getStartPeriod() + "-" + cs.getEndPeriod());
                map.put("room", cs.getRoomName());
                String lecturerName = lecturerRepository.findById(offering.getLecturerId())
                        .map(Lecturer::getFullName)
                        .orElse(offering.getLecturerId());
                map.put("lecturer", lecturerName);
                map.put("subject", subject.getName());
                map.put("makeup", "MAKEUP".equalsIgnoreCase(cs.getScheduleType()));
                map.put("color", color);
                timetable.add(map);
            }
        }

        return timetable;
    }
}
