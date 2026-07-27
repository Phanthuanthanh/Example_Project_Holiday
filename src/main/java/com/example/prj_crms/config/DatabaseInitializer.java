package com.example.prj_crms.config;

import com.example.prj_crms.model.*;
import com.example.prj_crms.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final LecturerRepository lecturerRepository;
    private final SubjectRepository subjectRepository;
    private final ClassOfferingRepository classOfferingRepository;
    private final ClassScheduleRepository classScheduleRepository;
    private final RegistrationRepository registrationRepository;
    private final TuitionInvoiceRepository tuitionInvoiceRepository;
    private final PaymentReceiptRepository paymentReceiptRepository;
    private final RegistrationPeriodRepository registrationPeriodRepository;

    public DatabaseInitializer(StudentRepository studentRepository, LecturerRepository lecturerRepository,
                               SubjectRepository subjectRepository, ClassOfferingRepository classOfferingRepository,
                               ClassScheduleRepository classScheduleRepository, RegistrationRepository registrationRepository,
                               TuitionInvoiceRepository tuitionInvoiceRepository, PaymentReceiptRepository paymentReceiptRepository,
                               RegistrationPeriodRepository registrationPeriodRepository) {
        this.studentRepository = studentRepository;
        this.lecturerRepository = lecturerRepository;
        this.subjectRepository = subjectRepository;
        this.classOfferingRepository = classOfferingRepository;
        this.classScheduleRepository = classScheduleRepository;
        this.registrationRepository = registrationRepository;
        this.tuitionInvoiceRepository = tuitionInvoiceRepository;
        this.paymentReceiptRepository = paymentReceiptRepository;
        this.registrationPeriodRepository = registrationPeriodRepository;
    }

    @Override
    public void run(String... args) throws Exception {
//        if (studentRepository.count() > 1 && classOfferingRepository.count() > 0) {
//            return;
//        }

        System.out.println(">>> CLEARING OLD CRMS DATABASE DATA...");
        paymentReceiptRepository.deleteAll();
        tuitionInvoiceRepository.deleteAll();
        registrationRepository.deleteAll();
        classScheduleRepository.deleteAll();
        classOfferingRepository.deleteAll();
        subjectRepository.deleteAll();
        lecturerRepository.deleteAll();
        studentRepository.deleteAll();
        registrationPeriodRepository.deleteAll();

        System.out.println(">>> SEEDING CRMS DATABASE (MYSQL)...");

        // 1. Sinh viên
        Student student1 = Student.builder().studentId("22110001").fullName("Nguyễn Văn An").email("22110001@student.edu.vn").phone("0901 234 567").dateOfBirth(LocalDate.of(2004, 3, 15)).className("CNTT-K24A").status("ACTIVE").build();
        Student student2 = Student.builder().studentId("22110002").fullName("Trần Thị Bình").email("22110002@student.edu.vn").phone("0902 345 678").dateOfBirth(LocalDate.of(2004, 5, 20)).className("CNTT-K24A").status("ACTIVE").build();
        Student student3 = Student.builder().studentId("22110003").fullName("Lê Văn Cường").email("22110003@student.edu.vn").phone("0903 456 789").dateOfBirth(LocalDate.of(2004, 8, 10)).className("CNTT-K24B").status("ACTIVE").build();
        Student student4 = Student.builder().studentId("22110004").fullName("Phạm Minh Đức").email("22110004@student.edu.vn").phone("0904 567 890").dateOfBirth(LocalDate.of(2004, 11, 25)).className("CNTT-K24B").status("ACTIVE").build();
        Student student5 = Student.builder().studentId("22110005").fullName("Hoàng Thị Hải").email("22110005@student.edu.vn").phone("0905 678 901").dateOfBirth(LocalDate.of(2004, 12, 5)).className("CNTT-K24A").status("ACTIVE").build();
        Student student6 = Student.builder().studentId("22110006").fullName("Nguyễn Hoàng Nam").email("22110006@student.edu.vn").phone("0906 789 012").dateOfBirth(LocalDate.of(2004, 1, 18)).className("CNTT-K24A").status("ACTIVE").build();
        Student student7 = Student.builder().studentId("22110007").fullName("Phan Thanh Tùng").email("22110007@student.edu.vn").phone("0907 890 123").dateOfBirth(LocalDate.of(2004, 7, 22)).className("CNTT-K24B").status("ACTIVE").build();
        Student student8 = Student.builder().studentId("22110008").fullName("Vũ Thị Vy").email("22110008@student.edu.vn").phone("0908 901 234").dateOfBirth(LocalDate.of(2004, 9, 30)).className("CNTT-K24A").status("ACTIVE").build();
        Student student9 = Student.builder().studentId("22110009").fullName("Đặng Văn Dũng").email("22110009@student.edu.vn").phone("0909 012 345").dateOfBirth(LocalDate.of(2004, 2, 14)).className("CNTT-K24B").status("ACTIVE").build();
        Student student10 = Student.builder().studentId("22110010").fullName("Bùi Thị Hoa").email("22110010@student.edu.vn").phone("0910 123 456").dateOfBirth(LocalDate.of(2004, 6, 8)).className("CNTT-K24A").status("ACTIVE").build();
        Student student11 = Student.builder().studentId("21110001").fullName("Ngô Quốc Khánh").email("21110001@student.edu.vn").phone("0911 234 567").dateOfBirth(LocalDate.of(2003, 4, 12)).className("CNTT-K23A").status("ACTIVE").build();
        Student student12 = Student.builder().studentId("21110002").fullName("Trịnh Thu Trang").email("21110002@student.edu.vn").phone("0912 345 678").dateOfBirth(LocalDate.of(2003, 10, 5)).className("CNTT-K23A").status("ACTIVE").build();
        Student student13 = Student.builder().studentId("21110003").fullName("Đỗ Hùng Dũng").email("21110003@student.edu.vn").phone("0913 456 789").dateOfBirth(LocalDate.of(2003, 12, 28)).className("CNTT-K23B").status("ACTIVE").build();
        Student student14 = Student.builder().studentId("20110001").fullName("Nguyễn Quang Hải").email("20110001@student.edu.vn").phone("0914 567 890").dateOfBirth(LocalDate.of(2002, 11, 20)).className("CNTT-K22A").status("ACTIVE").build();
        Student student15 = Student.builder().studentId("20110002").fullName("Nguyễn Văn Quyết").email("20110002@student.edu.vn").phone("0915 678 901").dateOfBirth(LocalDate.of(2002, 8, 3)).className("CNTT-K22B").status("INACTIVE").build();
        Student student16 = Student.builder().studentId("22120001").fullName("Nguyễn Thị Mai").email("22120001@student.edu.vn").phone("0916 789 012").dateOfBirth(LocalDate.of(2004, 5, 17)).className("NNA-K24A").status("ACTIVE").build();
        Student student17 = Student.builder().studentId("22120002").fullName("Lê Minh Triết").email("22120002@student.edu.vn").phone("0917 890 123").dateOfBirth(LocalDate.of(2004, 1, 9)).className("NNA-K24B").status("ACTIVE").build();

        studentRepository.saveAll(Arrays.asList(
                student1, student2, student3, student4, student5, student6, student7, student8,
                student9, student10, student11, student12, student13, student14, student15, student16, student17
        ));

        // 2. Giảng viên
        Lecturer gv001 = Lecturer.builder().lecturerId("GV001").fullName("TS. Trần Minh Khoa").email("khoatm@lecturer.edu.vn").departmentId("CNTT").build();
        Lecturer gv002 = Lecturer.builder().lecturerId("GV002").fullName("ThS. Nguyễn Lan Anh").email("anhnl@lecturer.edu.vn").departmentId("CNTT").build();
        Lecturer gv003 = Lecturer.builder().lecturerId("GV003").fullName("PGS. TS. Nguyễn Văn Hùng").email("hungnv@lecturer.edu.vn").departmentId("CNTT").build();
        Lecturer gv004 = Lecturer.builder().lecturerId("GV004").fullName("TS. Lê Thị Thanh").email("thanhlt@lecturer.edu.vn").departmentId("CNTT").build();
        Lecturer gv005 = Lecturer.builder().lecturerId("GV005").fullName("ThS. Phạm Minh Tuấn").email("tuanpm@lecturer.edu.vn").departmentId("CNTT").build();
        Lecturer gv006 = Lecturer.builder().lecturerId("GV006").fullName("ThS. Hoàng Thị Kim Chi").email("chithk@lecturer.edu.vn").departmentId("Ngoại ngữ").build();
        Lecturer gv007 = Lecturer.builder().lecturerId("GV007").fullName("TS. Vũ Đức Thắng").email("thangvd@lecturer.edu.vn").departmentId("Cơ bản").build();
        lecturerRepository.saveAll(Arrays.asList(gv001, gv002, gv003, gv004, gv005, gv006, gv007));

        // 3. Môn học
        Subject sub1 = Subject.builder().id("CNTT001").name("Lập trình hướng đối tượng").credits(3).dept("CNTT").prereq("—").status("ACTIVE").build();
        Subject sub2 = Subject.builder().id("CNTT002").name("Cơ sở dữ liệu").credits(3).dept("CNTT").prereq("—").status("ACTIVE").build();
        Subject sub3 = Subject.builder().id("CNTT003").name("Cấu trúc dữ liệu và GT").credits(4).dept("CNTT").prereq("CNTT001").status("ACTIVE").build();
        Subject sub4 = Subject.builder().id("MATH101").name("Giải tích 1").credits(4).dept("CNTT").prereq("—").status("ACTIVE").build();
        Subject sub5 = Subject.builder().id("CNTT004").name("Mạng máy tính").credits(3).dept("CNTT").prereq("—").status("ACTIVE").build();
        Subject sub6 = Subject.builder().id("CNTT005").name("Lập trình Web").credits(3).dept("CNTT").prereq("CNTT001").status("ACTIVE").build();
        Subject sub7 = Subject.builder().id("CNTT006").name("Phát triển ứng dụng di động").credits(3).dept("CNTT").prereq("CNTT001").status("ACTIVE").build();
        Subject sub8 = Subject.builder().id("ENG101").name("Anh văn giao tiếp 1").credits(2).dept("Ngoại ngữ").prereq("—").status("ACTIVE").build();
        Subject sub9 = Subject.builder().id("CNTT008").name("Phân tích và thiết kế hệ thống").credits(3).dept("CNTT").prereq("CNTT001").status("ACTIVE").build();
        Subject sub10 = Subject.builder().id("CNTT009").name("Trí tuệ nhân tạo").credits(4).dept("CNTT").prereq("CNTT003").status("ACTIVE").build();
        Subject sub11 = Subject.builder().id("CNTT010").name("Điện toán đám mây").credits(3).dept("CNTT").prereq("CNTT004").status("ACTIVE").build();
        Subject sub12 = Subject.builder().id("MATH102").name("Giải tích 2").credits(4).dept("CNTT").prereq("MATH101").status("ACTIVE").build();
        Subject sub13 = Subject.builder().id("ENG102").name("Anh văn giao tiếp 2").credits(2).dept("Ngoại ngữ").prereq("ENG101").status("ACTIVE").build();
        Subject sub14 = Subject.builder().id("CNTT011").name("An toàn thông tin").credits(3).dept("CNTT").prereq("CNTT004").status("ACTIVE").build();
        subjectRepository.saveAll(Arrays.asList(sub1, sub2, sub3, sub4, sub5, sub6, sub7, sub8, sub9, sub10, sub11, sub12, sub13, sub14));

        // 4. Lớp học phần
        // HK2 2025-2026 (Hiện tại)
        ClassOffering c1 = ClassOffering.builder().id("CNTT001.1").semester("HK2 2025-2026").subjectId("CNTT001").lecturerId("GV001").minStudents(15).maxStudents(50).enrolled(10).room("A201").schedule("Thứ 2, Tiết 1-3").status("open").build();
        ClassOffering c2 = ClassOffering.builder().id("CNTT001.2").semester("HK2 2025-2026").subjectId("CNTT001").lecturerId("GV002").minStudents(15).maxStudents(50).enrolled(0).room("B305").schedule("Thứ 5, Tiết 7-9").status("open").build();
        ClassOffering c3 = ClassOffering.builder().id("CNTT002.1").semester("HK2 2025-2026").subjectId("CNTT002").lecturerId("GV001").minStudents(15).maxStudents(60).enrolled(10).room("C102").schedule("Thứ 4, Tiết 4-6").status("open").build();
        ClassOffering c4 = ClassOffering.builder().id("CNTT003.1").semester("HK2 2025-2026").subjectId("CNTT003").lecturerId("GV002").minStudents(15).maxStudents(50).enrolled(0).room("D101").schedule("Thứ 2, Tiết 1-3 & Thứ 6, Tiết 4-6").status("open").build();
        ClassOffering c5 = ClassOffering.builder().id("MATH101.1").semester("HK2 2025-2026").subjectId("MATH101").lecturerId("GV007").minStudents(15).maxStudents(50).enrolled(10).room("A1-305").schedule("Thứ 3, Tiết 1-3").status("open").build();

        ClassOffering c6 = ClassOffering.builder().id("CNTT001.3").semester("HK2 2025-2026").subjectId("CNTT001").lecturerId("GV003").minStudents(15).maxStudents(50).enrolled(0).room("A302").schedule("Thứ 3, Tiết 4-6").status("open").build();
        ClassOffering c7 = ClassOffering.builder().id("CNTT002.2").semester("HK2 2025-2026").subjectId("CNTT002").lecturerId("GV004").minStudents(15).maxStudents(50).enrolled(0).room("B204").schedule("Thứ 6, Tiết 7-9").status("open").build();
        ClassOffering c8 = ClassOffering.builder().id("CNTT004.1").semester("HK2 2025-2026").subjectId("CNTT004").lecturerId("GV005").minStudents(15).maxStudents(60).enrolled(3).room("C201").schedule("Thứ 4, Tiết 7-9").status("open").build();
        ClassOffering c9 = ClassOffering.builder().id("CNTT005.1").semester("HK2 2025-2026").subjectId("CNTT005").lecturerId("GV002").minStudents(15).maxStudents(50).enrolled(2).room("D202").schedule("Thứ 5, Tiết 1-3").status("open").build();
        ClassOffering c10 = ClassOffering.builder().id("ENG101.1").semester("HK2 2025-2026").subjectId("ENG101").lecturerId("GV006").minStudents(15).maxStudents(40).enrolled(1).room("B102").schedule("Thứ 6, Tiết 1-2").status("open").build();
        ClassOffering c11 = ClassOffering.builder().id("MATH101.2").semester("HK2 2025-2026").subjectId("MATH101").lecturerId("GV007").minStudents(15).maxStudents(60).enrolled(0).room("A1-205").schedule("Thứ 4, Tiết 1-3").status("open").build();
        ClassOffering c12 = ClassOffering.builder().id("CNTT008.1").semester("HK2 2025-2026").subjectId("CNTT008").lecturerId("GV003").minStudents(15).maxStudents(50).enrolled(1).room("C302").schedule("Thứ 3, Tiết 7-9").status("open").build();

        // HK1 2025-2026 (Quá khứ)
        ClassOffering c13 = ClassOffering.builder().id("CNTT001.HK2").semester("HK1 2025-2026").subjectId("CNTT001").lecturerId("GV001").minStudents(15).maxStudents(50).enrolled(10).room("A201").schedule("Thứ 2, Tiết 1-3").status("closed").build();
        ClassOffering c14 = ClassOffering.builder().id("CNTT002.HK2").semester("HK1 2025-2026").subjectId("CNTT002").lecturerId("GV002").minStudents(15).maxStudents(50).enrolled(10).room("B305").schedule("Thứ 5, Tiết 7-9").status("closed").build();
        ClassOffering c15 = ClassOffering.builder().id("MATH101.HK2").semester("HK1 2025-2026").subjectId("MATH101").lecturerId("GV007").minStudents(15).maxStudents(60).enrolled(10).room("A1-305").schedule("Thứ 3, Tiết 1-3").status("closed").build();
        ClassOffering c16 = ClassOffering.builder().id("ENG101.HK2").semester("HK1 2025-2026").subjectId("ENG101").lecturerId("GV006").minStudents(15).maxStudents(40).enrolled(10).room("B102").schedule("Thứ 6, Tiết 3-4").status("closed").build();

        classOfferingRepository.saveAll(Arrays.asList(c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15, c16));

        // 5. Lịch học chi tiết (ClassSchedule)
        classScheduleRepository.save(ClassSchedule.builder().classCode("CNTT001.1").dayOfWeek(2).startPeriod(1).endPeriod(3).roomName("A201").scheduleType("WEEKLY").build());
        classScheduleRepository.save(ClassSchedule.builder().classCode("CNTT001.2").dayOfWeek(5).startPeriod(7).endPeriod(9).roomName("B305").scheduleType("WEEKLY").build());
        classScheduleRepository.save(ClassSchedule.builder().classCode("CNTT002.1").dayOfWeek(4).startPeriod(4).endPeriod(6).roomName("C102").scheduleType("WEEKLY").build());
        classScheduleRepository.save(ClassSchedule.builder().classCode("CNTT003.1").dayOfWeek(2).startPeriod(1).endPeriod(3).roomName("D101").scheduleType("WEEKLY").build());
        classScheduleRepository.save(ClassSchedule.builder().classCode("CNTT003.1").dayOfWeek(6).startPeriod(4).endPeriod(6).roomName("D101").scheduleType("WEEKLY").build());
        classScheduleRepository.save(ClassSchedule.builder().classCode("MATH101.1").dayOfWeek(3).startPeriod(1).endPeriod(3).roomName("A1-305").scheduleType("WEEKLY").build());

        classScheduleRepository.save(ClassSchedule.builder().classCode("CNTT001.3").dayOfWeek(3).startPeriod(4).endPeriod(6).roomName("A302").scheduleType("WEEKLY").build());
        classScheduleRepository.save(ClassSchedule.builder().classCode("CNTT002.2").dayOfWeek(6).startPeriod(7).endPeriod(9).roomName("B204").scheduleType("WEEKLY").build());
        classScheduleRepository.save(ClassSchedule.builder().classCode("CNTT004.1").dayOfWeek(4).startPeriod(7).endPeriod(9).roomName("C201").scheduleType("WEEKLY").build());
        classScheduleRepository.save(ClassSchedule.builder().classCode("CNTT005.1").dayOfWeek(5).startPeriod(1).endPeriod(3).roomName("D202").scheduleType("WEEKLY").build());
        classScheduleRepository.save(ClassSchedule.builder().classCode("ENG101.1").dayOfWeek(6).startPeriod(1).endPeriod(2).roomName("B102").scheduleType("WEEKLY").build());
        classScheduleRepository.save(ClassSchedule.builder().classCode("MATH101.2").dayOfWeek(4).startPeriod(1).endPeriod(3).roomName("A1-205").scheduleType("WEEKLY").build());
        classScheduleRepository.save(ClassSchedule.builder().classCode("CNTT008.1").dayOfWeek(3).startPeriod(7).endPeriod(9).roomName("C302").scheduleType("WEEKLY").build());

        classScheduleRepository.save(ClassSchedule.builder().classCode("CNTT001.HK2").dayOfWeek(2).startPeriod(1).endPeriod(3).roomName("A201").scheduleType("WEEKLY").build());
        classScheduleRepository.save(ClassSchedule.builder().classCode("CNTT002.HK2").dayOfWeek(5).startPeriod(7).endPeriod(9).roomName("B305").scheduleType("WEEKLY").build());
        classScheduleRepository.save(ClassSchedule.builder().classCode("MATH101.HK2").dayOfWeek(3).startPeriod(1).endPeriod(3).roomName("A1-305").scheduleType("WEEKLY").build());
        classScheduleRepository.save(ClassSchedule.builder().classCode("ENG101.HK2").dayOfWeek(6).startPeriod(3).endPeriod(4).roomName("B102").scheduleType("WEEKLY").build());

        // 6. Đăng ký học phần & Cập nhật enrolled tương ứng
        // Học kỳ HK1 2026-2027
        registrationRepository.save(Registration.builder().id("REG-22110001-CNTT001.1").studentId("22110001").classCode("CNTT001.1").registerDate(LocalDateTime.now().minusDays(3)).registerType("Học mới").status("SUCCESS").build());
        registrationRepository.save(Registration.builder().id("REG-22110001-CNTT002.1").studentId("22110001").classCode("CNTT002.1").registerDate(LocalDateTime.now().minusDays(3)).registerType("Học mới").status("SUCCESS").build());
        registrationRepository.save(Registration.builder().id("REG-22110001-MATH101.1").studentId("22110001").classCode("MATH101.1").registerDate(LocalDateTime.now().minusDays(3)).registerType("Học mới").status("SUCCESS").build());
        registrationRepository.save(Registration.builder().id("REG-22110001-ENG101.1").studentId("22110001").classCode("ENG101.1").registerDate(LocalDateTime.now().minusDays(2)).registerType("Học mới").status("SUCCESS").build());
        registrationRepository.save(Registration.builder().id("REG-22110001-CNTT008.1").studentId("22110001").classCode("CNTT008.1").registerDate(LocalDateTime.now().minusDays(1)).registerType("Học mới").status("SUCCESS").build());

        // Đăng ký cho 9 sinh viên K24 khác vào CNTT001.1, CNTT002.1, MATH101.1
        String[] studentsK24 = {"22110002", "22110003", "22110004", "22110005", "22110006", "22110007", "22110008", "22110009", "22110010"};
        for (String sId : studentsK24) {
            registrationRepository.save(Registration.builder().id("REG-" + sId + "-CNTT001.1").studentId(sId).classCode("CNTT001.1").registerDate(LocalDateTime.now().minusDays(4)).registerType("Học mới").status("SUCCESS").build());
            registrationRepository.save(Registration.builder().id("REG-" + sId + "-CNTT002.1").studentId(sId).classCode("CNTT002.1").registerDate(LocalDateTime.now().minusDays(4)).registerType("Học mới").status("SUCCESS").build());
            registrationRepository.save(Registration.builder().id("REG-" + sId + "-MATH101.1").studentId(sId).classCode("MATH101.1").registerDate(LocalDateTime.now().minusDays(4)).registerType("Học mới").status("SUCCESS").build());
        }

        // Đăng ký lớp HK1 2026-2027 khác
        registrationRepository.save(Registration.builder().id("REG-21110001-CNTT004.1").studentId("21110001").classCode("CNTT004.1").registerDate(LocalDateTime.now().minusDays(2)).registerType("Học mới").status("SUCCESS").build());
        registrationRepository.save(Registration.builder().id("REG-21110001-CNTT005.1").studentId("21110001").classCode("CNTT005.1").registerDate(LocalDateTime.now().minusDays(2)).registerType("Học mới").status("SUCCESS").build());

        registrationRepository.save(Registration.builder().id("REG-21110002-CNTT004.1").studentId("21110002").classCode("CNTT004.1").registerDate(LocalDateTime.now().minusDays(2)).registerType("Học mới").status("SUCCESS").build());
        registrationRepository.save(Registration.builder().id("REG-21110002-CNTT005.1").studentId("21110002").classCode("CNTT005.1").registerDate(LocalDateTime.now().minusDays(2)).registerType("Học mới").status("SUCCESS").build());

        registrationRepository.save(Registration.builder().id("REG-20110001-CNTT004.1").studentId("20110001").classCode("CNTT004.1").registerDate(LocalDateTime.now().minusDays(1)).registerType("Học mới").status("SUCCESS").build());

        // Đăng ký lớp HK2 2025-2026 (Quá khứ) cho cả 10 sinh viên K24 (bao gồm An)
        String[] allK24 = {"22110001", "22110002", "22110003", "22110004", "22110005", "22110006", "22110007", "22110008", "22110009", "22110010"};
        for (String sId : allK24) {
            registrationRepository.save(Registration.builder().id("REG-" + sId + "-CNTT001.HK2").studentId(sId).classCode("CNTT001.HK2").registerDate(LocalDateTime.now().minusDays(150)).registerType("Học mới").status("SUCCESS").build());
            registrationRepository.save(Registration.builder().id("REG-" + sId + "-CNTT002.HK2").studentId(sId).classCode("CNTT002.HK2").registerDate(LocalDateTime.now().minusDays(150)).registerType("Học mới").status("SUCCESS").build());
            registrationRepository.save(Registration.builder().id("REG-" + sId + "-MATH101.HK2").studentId(sId).classCode("MATH101.HK2").registerDate(LocalDateTime.now().minusDays(150)).registerType("Học mới").status("SUCCESS").build());
            registrationRepository.save(Registration.builder().id("REG-" + sId + "-ENG101.HK2").studentId(sId).classCode("ENG101.HK2").registerDate(LocalDateTime.now().minusDays(150)).registerType("Học mới").status("SUCCESS").build());
        }

        // 7. Hóa đơn học phí & 8. Lịch sử giao dịch
        // Nguyễn Văn An (22110001):
        // HK2 2025-2026: 15 tín chỉ = 7.500.000 (Chưa thanh toán)
        tuitionInvoiceRepository.save(TuitionInvoice.builder().invoiceId("INV-22110001-HK2_2025-2026").studentId("22110001").semester("HK2 2025-2026").required(BigDecimal.valueOf(7500000)).paid(BigDecimal.ZERO).debt(BigDecimal.valueOf(7500000)).deadline("31/10/2026").status("unpaid").build());
        // HK1 2025-2026: 12 tín chỉ = 6.000.000 (Đã thanh toán)
        tuitionInvoiceRepository.save(TuitionInvoice.builder().invoiceId("INV-22110001-HK1_2025-2026").studentId("22110001").semester("HK1 2025-2026").required(BigDecimal.valueOf(6000000)).paid(BigDecimal.valueOf(6000000)).debt(BigDecimal.ZERO).deadline("31/03/2026").status("paid").build());
        paymentReceiptRepository.save(PaymentReceipt.builder().receiptId("REC-22110001-01").studentId("22110001").invoiceId("INV-22110001-HK1_2025-2026").code("VNP15487623").date("2026-02-15 09:22:15").amount(BigDecimal.valueOf(6000000)).method("VNPAY (ATM)").result("success").build());

        // Các sinh viên khác:
        // Đã thanh toán HK2: 22110002, 22110003, 22110004 (10 tín chỉ = 5.000.000)
        String[] paidStudents = {"22110002", "22110003", "22110004"};
        int recIdCounter = 100;
        for (String sId : paidStudents) {
            tuitionInvoiceRepository.save(TuitionInvoice.builder().invoiceId("INV-" + sId + "-HK2_2025-2026").studentId(sId).semester("HK2 2025-2026").required(BigDecimal.valueOf(5000000)).paid(BigDecimal.valueOf(5000000)).debt(BigDecimal.ZERO).deadline("31/10/2026").status("paid").build());
            paymentReceiptRepository.save(PaymentReceipt.builder().receiptId("REC-" + sId + "-HK2").studentId(sId).invoiceId("INV-" + sId + "-HK2_2025-2026").code("VNP98" + recIdCounter++).date("2026-07-10 10:30:00").amount(BigDecimal.valueOf(5000000)).method("VNPAY (ATM)").result("success").build());
        }

        // Thanh toán một phần HK2: 22110005, 22110006
        String[] partStudents = {"22110005", "22110006"};
        for (String sId : partStudents) {
            tuitionInvoiceRepository.save(TuitionInvoice.builder().invoiceId("INV-" + sId + "-HK2_2025-2026").studentId(sId).semester("HK2 2025-2026").required(BigDecimal.valueOf(5000000)).paid(BigDecimal.valueOf(2000000)).debt(BigDecimal.valueOf(3000000)).deadline("31/10/2026").status("partially_paid").build());
            paymentReceiptRepository.save(PaymentReceipt.builder().receiptId("REC-" + sId + "-HK2").studentId(sId).invoiceId("INV-" + sId + "-HK2_2025-2026").code("VNP98" + recIdCounter++).date("2026-07-12 14:15:20").amount(BigDecimal.valueOf(2000000)).method("VNPAY (ATM)").result("success").build());
        }

        // Chưa thanh toán HK2: 22110007, 22110008, 22110009, 22110010
        String[] unpaidStudents = {"22110007", "22110008", "22110009", "22110010"};
        for (String sId : unpaidStudents) {
            tuitionInvoiceRepository.save(TuitionInvoice.builder().invoiceId("INV-" + sId + "-HK2_2025-2026").studentId(sId).semester("HK2 2025-2026").required(BigDecimal.valueOf(5000000)).paid(BigDecimal.ZERO).debt(BigDecimal.valueOf(5000000)).deadline("31/10/2026").status("unpaid").build());
        }

        // Tất cả K24 đã thanh toán HK1 2025-2026 (12 tín chỉ = 6.000.000)
        for (String sId : allK24) {
            if ("22110001".equals(sId)) continue; // An đã được lưu ở trên
            tuitionInvoiceRepository.save(TuitionInvoice.builder().invoiceId("INV-" + sId + "-HK1_2025-2026").studentId(sId).semester("HK1 2025-2026").required(BigDecimal.valueOf(6000000)).paid(BigDecimal.valueOf(6000000)).debt(BigDecimal.ZERO).deadline("31/03/2026").status("paid").build());
            paymentReceiptRepository.save(PaymentReceipt.builder().receiptId("REC-" + sId + "-HK1").studentId(sId).invoiceId("INV-" + sId + "-HK1_2025-2026").code("VNP76" + recIdCounter++).date("2026-02-20 11:45:12").amount(BigDecimal.valueOf(6000000)).method("VNPAY (ATM)").result("success").build());
        }

        // 9. Đợt đăng ký
        RegistrationPeriod period1 = RegistrationPeriod.builder()
                .name("Đợt 1 - Khóa CNTT K24 & K23")
                .startTime(LocalDateTime.now().minusDays(5))
                .endTime(LocalDateTime.now().plusDays(10))
                .targetBatches("K24,K23")
                .targetDepartments("CNTT")
                .status("OPEN")
                .build();

        RegistrationPeriod period2 = RegistrationPeriod.builder()
                .name("Đợt đăng ký bổ sung - HK2 2025-2026")
                .startTime(LocalDateTime.now().plusDays(15))
                .endTime(LocalDateTime.now().plusDays(20))
                .targetBatches("K24,K23")
                .targetDepartments("CNTT")
                .status("CLOSED")
                .build();

        RegistrationPeriod period3 = RegistrationPeriod.builder()
                .name("Đợt học kỳ hè - HK3 2024-2025")
                .startTime(LocalDateTime.now().minusDays(40))
                .endTime(LocalDateTime.now().minusDays(30))
                .targetBatches("K24,K23,K22")
                .targetDepartments("CNTT,NNA")
                .status("CLOSED")
                .build();

        registrationPeriodRepository.saveAll(Arrays.asList(period1, period2, period3));

        System.out.println(">>> SEEDING CRMS DATABASE COMPLETED!");
    }
}
