package com.example.prj_crms.service;

import com.example.prj_crms.model.*;
import com.example.prj_crms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class RegistrarService {

    private final SubjectRepository subjectRepository;
    private final ClassOfferingRepository classOfferingRepository;
    private final ClassScheduleRepository classScheduleRepository;
    private final RegistrationPeriodRepository registrationPeriodRepository;
    private final RegistrationRepository registrationRepository;
    private final TuitionInvoiceRepository tuitionInvoiceRepository;
    private final LecturerRepository lecturerRepository;

    public RegistrarService(SubjectRepository subjectRepository,
                            ClassOfferingRepository classOfferingRepository,
                            ClassScheduleRepository classScheduleRepository,
                            RegistrationPeriodRepository registrationPeriodRepository,
                            RegistrationRepository registrationRepository,
                            TuitionInvoiceRepository tuitionInvoiceRepository,
                            LecturerRepository lecturerRepository) {
        this.subjectRepository = subjectRepository;
        this.classOfferingRepository = classOfferingRepository;
        this.classScheduleRepository = classScheduleRepository;
        this.registrationPeriodRepository = registrationPeriodRepository;
        this.registrationRepository = registrationRepository;
        this.tuitionInvoiceRepository = tuitionInvoiceRepository;
        this.lecturerRepository = lecturerRepository;
    }

    // ─── QUẢN LÝ MÔN HỌC ───

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    public Subject addSubject(Subject subject) {
        if (subjectRepository.existsById(subject.getId())) {
            throw new RuntimeException("Mã môn học " + subject.getId() + " đã tồn tại.");
        }
        subject.setStatus("ACTIVE");
        return subjectRepository.save(subject);
    }

    public Subject updateSubject(String id, Subject subjectData) {
        Optional<Subject> subjectOpt = subjectRepository.findById(id);
        if (subjectOpt.isEmpty()) {
            throw new RuntimeException("Môn học không tồn tại.");
        }
        Subject s = subjectOpt.get();
        s.setName(subjectData.getName());
        s.setCredits(subjectData.getCredits());
        s.setDept(subjectData.getDept());
        s.setPrereq(subjectData.getPrereq());
        return subjectRepository.save(s);
    }

    public void deleteSubject(String id) {
        // Kiểm tra xem môn học đã được lên lịch mở lớp nào chưa
        List<ClassOffering> offerings = classOfferingRepository.findAll();
        boolean isUsed = offerings.stream().anyMatch(o -> o.getSubjectId().equals(id));
        if (isUsed) {
            throw new RuntimeException("Môn học này đã được sử dụng mở lớp. Bạn không thể xóa vật lý khỏi hệ thống.");
        }
        subjectRepository.deleteById(id);
    }

    public Subject patchSubjectStatus(String id, String status) {
        Optional<Subject> subjectOpt = subjectRepository.findById(id);
        if (subjectOpt.isEmpty()) {
            throw new RuntimeException("Môn học không tồn tại.");
        }
        Subject s = subjectOpt.get();
        s.setStatus(status.toUpperCase());
        return subjectRepository.save(s);
    }

    // ─── QUẢN LÝ LỚP HỌC PHẦN ───

    public List<Map<String, Object>> getAllClasses() {
        List<ClassOffering> offerings = classOfferingRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (ClassOffering offering : offerings) {
            Optional<Subject> subjectOpt = subjectRepository.findById(offering.getSubjectId());
            if (subjectOpt.isEmpty()) continue;
            Subject subject = subjectOpt.get();

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
            map.put("min", offering.getMinStudents());
            map.put("status", offering.getStatus());
            result.add(map);
        }
        return result;
    }

    @Transactional
    public ClassOffering openClass(Map<String, String> form) {
        String classCode = form.get("classCode");
        String subjectId = form.get("subjectId");
        String semester = form.get("semester");
        String lecturerId = form.get("lecturerId");
        int minStudents = Integer.parseInt(form.get("minStudents"));
        int maxStudents = Integer.parseInt(form.get("maxStudents"));
        int dayOfWeek = Integer.parseInt(form.get("dayOfWeek"));
        int startPeriod = Integer.parseInt(form.get("startPeriod"));
        int endPeriod = Integer.parseInt(form.get("endPeriod"));
        String roomName = form.get("roomName");

        if (minStudents <= 0) {
            throw new RuntimeException("Sĩ số tối thiểu phải lớn hơn 0.");
        }
        if (maxStudents < minStudents) {
            throw new RuntimeException("Sĩ số tối đa không được nhỏ hơn sĩ số tối thiểu.");
        }
        if (startPeriod < 1 || startPeriod > 12 || endPeriod < 1 || endPeriod > 12) {
            throw new RuntimeException("Tiết học phải nằm trong khoảng từ tiết 1 đến tiết 12.");
        }
        if (startPeriod > endPeriod) {
            throw new RuntimeException("Tiết bắt đầu không được lớn hơn tiết kết thúc.");
        }
        if (dayOfWeek < 2 || dayOfWeek > 7) {
            throw new RuntimeException("Thứ học phải nằm trong khoảng từ Thứ 2 đến Thứ 7.");
        }

        // Kiểm tra xem classCode đã tồn tại chưa
        if (classOfferingRepository.existsById(classCode)) {
            throw new RuntimeException("Mã lớp học phần " + classCode + " đã tồn tại.");
        }

        // 1. Kiểm tra sức chứa phòng học
        int roomCapacity = 50; // Mặc định
        if ("C102".equalsIgnoreCase(roomName)) {
            roomCapacity = 40;
        } else if ("D101".equalsIgnoreCase(roomName) || "A1-305".equalsIgnoreCase(roomName)) {
            roomCapacity = 60;
        }
        if (maxStudents > roomCapacity) {
            throw new RuntimeException("Sĩ số tối đa (" + maxStudents + " SV) vượt quá sức chứa tối đa của phòng " + roomName + " (" + roomCapacity + " SV).");
        }

        // 2. Kiểm tra trùng lịch giảng viên và trùng lịch phòng học trong cùng học kỳ
        List<ClassOffering> activeOfferings = classOfferingRepository.findBySemester(semester);
        for (ClassOffering offering : activeOfferings) {
            if ("cancelled".equalsIgnoreCase(offering.getStatus())) {
                continue;
            }
            List<ClassSchedule> schedules = classScheduleRepository.findByClassCode(offering.getId());
            for (ClassSchedule schedule : schedules) {
                if (schedule.getDayOfWeek() == dayOfWeek) {
                    // Kiểm tra giao tiết học
                    boolean isOverlap = !(endPeriod < schedule.getStartPeriod() || schedule.getEndPeriod() < startPeriod);
                    if (isOverlap) {
                        // Trùng lịch giảng viên
                        if (offering.getLecturerId().equalsIgnoreCase(lecturerId)) {
                            String lecturerName = lecturerRepository.findById(lecturerId)
                                    .map(Lecturer::getFullName)
                                    .orElse(lecturerId);
                            throw new RuntimeException("Giảng viên " + lecturerName + " đã bị trùng lịch dạy lớp " + offering.getId() + " vào Thứ " + dayOfWeek + ", Tiết " + schedule.getStartPeriod() + "-" + schedule.getEndPeriod() + ".");
                        }
                        // Trùng lịch phòng học
                        if (offering.getRoom().equalsIgnoreCase(roomName)) {
                            throw new RuntimeException("Phòng học " + roomName + " đã bị trùng lịch sử dụng cho lớp " + offering.getId() + " vào Thứ " + dayOfWeek + ", Tiết " + schedule.getStartPeriod() + "-" + schedule.getEndPeriod() + ".");
                        }
                    }
                }
            }
        }

        // Tạo định nghĩa lớp học phần mới
        ClassOffering co = ClassOffering.builder()
                .id(classCode)
                .semester(semester)
                .subjectId(subjectId)
                .lecturerId(lecturerId)
                .minStudents(minStudents)
                .maxStudents(maxStudents)
                .enrolled(0)
                .room(roomName)
                .schedule("Thứ " + dayOfWeek + ", Tiết " + startPeriod + "-" + endPeriod)
                .status("open")
                .build();
        classOfferingRepository.save(co);

        // Tạo lịch học chi tiết trong ClassSchedule
        ClassSchedule cs = ClassSchedule.builder()
                .classCode(classCode)
                .dayOfWeek(dayOfWeek)
                .startPeriod(startPeriod)
                .endPeriod(endPeriod)
                .roomName(roomName)
                .scheduleType("WEEKLY")
                .build();
        classScheduleRepository.save(cs);

        return co;
    }

    @Transactional
    public void cancelClass(String classCode) {
        Optional<ClassOffering> coOpt = classOfferingRepository.findById(classCode);
        if (coOpt.isEmpty()) {
            throw new RuntimeException("Lớp học phần không tồn tại.");
        }
        ClassOffering co = coOpt.get();
        co.setStatus("cancelled");
        classOfferingRepository.save(co);

        // Hủy tất cả các đăng ký của sinh viên trong lớp này và hoàn tiền
        List<Registration> regs = registrationRepository.findByClassCodeAndStatus(classCode, "SUCCESS");
        Optional<Subject> subjectOpt = subjectRepository.findById(co.getSubjectId());
        int credits = subjectOpt.map(Subject::getCredits).orElse(0);

        for (Registration r : regs) {
            r.setStatus("CANCELLED");
            registrationRepository.save(r);

            // Giảm trừ công nợ học phí cho sinh viên tương ứng
            Optional<TuitionInvoice> invoiceOpt = tuitionInvoiceRepository.findByStudentIdAndSemester(r.getStudentId(), co.getSemester());
            if (invoiceOpt.isPresent()) {
                TuitionInvoice inv = invoiceOpt.get();
                BigDecimal refund = BigDecimal.valueOf(credits * 500000L);
                inv.setRequired(inv.getRequired().subtract(refund));
                inv.setDebt(inv.getRequired().subtract(inv.getPaid()));
                if (inv.getDebt().compareTo(BigDecimal.ZERO) <= 0) {
                    inv.setStatus("paid");
                } else if (inv.getPaid().compareTo(BigDecimal.ZERO) > 0) {
                    inv.setStatus("partially_paid");
                } else {
                    inv.setStatus("unpaid");
                }
                tuitionInvoiceRepository.save(inv);
            }
        }
    }

    public void deleteClass(String classCode) {
        Optional<ClassOffering> coOpt = classOfferingRepository.findById(classCode);
        if (coOpt.isEmpty()) {
            throw new RuntimeException("Lớp học phần không tồn tại.");
        }
        if (coOpt.get().getEnrolled() > 0) {
            throw new RuntimeException("Lớp học phần đã có sinh viên đăng ký, không thể xóa.");
        }
        // Xóa lịch học
        List<ClassSchedule> schedules = classScheduleRepository.findByClassCode(classCode);
        classScheduleRepository.deleteAll(schedules);
        classOfferingRepository.deleteById(classCode);
    }

    // ─── QUẢN LÝ ĐỢT ĐĂNG KÝ ───

    public List<RegistrationPeriod> getAllPeriods() {
        return registrationPeriodRepository.findAll();
    }

    public RegistrationPeriod addPeriod(Map<String, String> form) {
        String name = form.get("name");
        String targetBatches = form.get("targetBatches");
        String targetDepartments = form.get("targetDepartments");

        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Tên đợt đăng ký không được để trống.");
        }
        if (targetBatches == null || targetBatches.trim().isEmpty()) {
            throw new RuntimeException("Khóa áp dụng không được để trống.");
        }
        if (targetDepartments == null || targetDepartments.trim().isEmpty()) {
            throw new RuntimeException("Khoa áp dụng không được để trống.");
        }

        LocalDateTime start;
        LocalDateTime end;
        try {
            start = LocalDateTime.parse(form.get("startTime"));
            end = LocalDateTime.parse(form.get("endTime"));
        } catch (Exception e) {
            throw new RuntimeException("Định dạng thời gian không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DDTHH:mm.");
        }

        if (end.isBefore(start) || end.isEqual(start)) {
            throw new RuntimeException("Thời gian kết thúc đợt đăng ký phải diễn ra sau thời gian bắt đầu.");
        }

        RegistrationPeriod period = RegistrationPeriod.builder()
                .name(name)
                .targetBatches(targetBatches)
                .targetDepartments(targetDepartments)
                .startTime(start)
                .endTime(end)
                .status("CLOSED") // Mặc định là đóng cho tới khi kích hoạt mở cổng
                .build();
        return registrationPeriodRepository.save(period);
    }

    public RegistrationPeriod togglePeriodStatus(Long id, String status) {
        Optional<RegistrationPeriod> pOpt = registrationPeriodRepository.findById(id);
        if (pOpt.isEmpty()) {
            throw new RuntimeException("Đợt đăng ký không tồn tại.");
        }
        RegistrationPeriod p = pOpt.get();
        p.setStatus(status.toUpperCase());
        return registrationPeriodRepository.save(p);
    }

    // ─── THỐNG KÊ BÁO CÁO ───

    // Lấy thống kê tình hình tài chính & tỷ lệ lấp đầy (REG_04)
    public Map<String, Object> getFinanceReport() {
        List<Registration> regs = registrationRepository.findAll();
        int totalCredits = 0;
        for (Registration r : regs) {
            if ("SUCCESS".equalsIgnoreCase(r.getStatus())) {
                Optional<ClassOffering> coOpt = classOfferingRepository.findById(r.getClassCode());
                if (coOpt.isPresent() && "HK2 2025-2026".equalsIgnoreCase(coOpt.get().getSemester())) {
                    Optional<Subject> sOpt = subjectRepository.findById(coOpt.get().getSubjectId());
                    if (sOpt.isPresent()) {
                        totalCredits += sOpt.get().getCredits();
                    }
                }
            }
        }

        BigDecimal totalTuition = BigDecimal.valueOf(totalCredits * 500000L);
        List<TuitionInvoice> invoices = tuitionInvoiceRepository.findAll();
        BigDecimal totalPaid = BigDecimal.ZERO;
        for (TuitionInvoice invoice : invoices) {
            if ("HK2 2025-2026".equalsIgnoreCase(invoice.getSemester())) {
                totalPaid = totalPaid.add(invoice.getPaid());
            }
        }

        // Tỷ lệ lấp đầy của từng lớp
        List<ClassOffering> offerings = classOfferingRepository.findAll();
        List<Map<String, Object>> fillRates = new ArrayList<>();
        for (ClassOffering co : offerings) {
            if ("HK2 2025-2026".equalsIgnoreCase(co.getSemester())) {
                double rate = co.getMaxStudents() > 0 ? (co.getEnrolled() * 100.0 / co.getMaxStudents()) : 0.0;
                Map<String, Object> row = new HashMap<>();
                row.put("name", co.getId());
                row.put("rate", Math.round(rate));
                fillRates.add(row);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("totalCredits", totalCredits);
        result.put("totalTuition", totalTuition);
        result.put("totalPaid", totalPaid);
        result.put("fillRates", fillRates);
        return result;
    }

    // Lấy danh sách các lớp học phần sĩ số thấp dưới mức min (ví dụ: <15 SV) trong học kỳ hiện tại
    public List<Map<String, Object>> getLowEnrolledClasses() {
        List<ClassOffering> offerings = classOfferingRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (ClassOffering co : offerings) {
            if ("HK2 2025-2026".equalsIgnoreCase(co.getSemester())) {
                if (co.getEnrolled() < co.getMinStudents()) {
                    Optional<Subject> sOpt = subjectRepository.findById(co.getSubjectId());
                    if (sOpt.isEmpty()) continue;

                    Map<String, Object> map = new HashMap<>();
                    map.put("id", co.getId());
                    map.put("subject", sOpt.get().getName());
                    String lecturerName = lecturerRepository.findById(co.getLecturerId())
                            .map(Lecturer::getFullName)
                            .orElse(co.getLecturerId());
                    map.put("lecturer", lecturerName);
                    map.put("enrolled", co.getEnrolled());
                    map.put("min", co.getMinStudents());
                    map.put("status", co.getStatus());
                    result.add(map);
                }
            }
        }
        return result;
    }
}
