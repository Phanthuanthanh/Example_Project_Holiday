package com.example.prj_crms.service;

import com.example.prj_crms.model.*;
import com.example.prj_crms.repository.*;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class LecturerService {

    private final ClassOfferingRepository classOfferingRepository;
    private final ClassScheduleRepository classScheduleRepository;
    private final SubjectRepository subjectRepository;
    private final RegistrationRepository registrationRepository;
    private final StudentRepository studentRepository;

    public LecturerService(ClassOfferingRepository classOfferingRepository,
                           ClassScheduleRepository classScheduleRepository,
                           SubjectRepository subjectRepository,
                           RegistrationRepository registrationRepository,
                           StudentRepository studentRepository) {
        this.classOfferingRepository = classOfferingRepository;
        this.classScheduleRepository = classScheduleRepository;
        this.subjectRepository = subjectRepository;
        this.registrationRepository = registrationRepository;
        this.studentRepository = studentRepository;
    }

    // Lấy thời khóa biểu giảng dạy của giảng viên
    public List<Map<String, Object>> getLecturerTimetable(String lecturerId) {
        List<ClassOffering> offerings = classOfferingRepository.findAll();
        List<Map<String, Object>> timetable = new ArrayList<>();

        String[] colors = {
                "bg-blue-100 border-blue-300 text-blue-700",
                "bg-purple-100 border-purple-300 text-purple-700",
                "bg-green-100 border-green-300 text-green-700",
                "bg-amber-100 border-amber-300 text-amber-700"
        };
        int colorIdx = 0;

        for (ClassOffering co : offerings) {
            if (!co.getLecturerId().equalsIgnoreCase(lecturerId)) {
                continue;
            }
            if (!"HK2 2025-2026".equalsIgnoreCase(co.getSemester())) {
                continue; // Lịch dạy chỉ hiển thị học kỳ hiện tại
            }

            Optional<Subject> subjectOpt = subjectRepository.findById(co.getSubjectId());
            if (subjectOpt.isEmpty()) continue;
            Subject subject = subjectOpt.get();

            List<ClassSchedule> schedules = classScheduleRepository.findByClassCode(co.getId());
            String color = colors[colorIdx % colors.length];
            colorIdx++;

            for (ClassSchedule cs : schedules) {
                Map<String, Object> map = new HashMap<>();
                map.put("classId", co.getId());
                map.put("subject", subject.getName());
                map.put("schedule", co.getSchedule());
                map.put("room", co.getRoom());
                map.put("students", co.getEnrolled());
                map.put("enrolled", co.getEnrolled()); // dự phòng
                map.put("day", cs.getDayOfWeek());
                map.put("period", cs.getStartPeriod() + "-" + cs.getEndPeriod());
                map.put("color", color);
                timetable.add(map);
            }
        }
        return timetable;
    }

    // Lấy danh sách sinh viên đăng ký của một lớp học phần phụ trách
    public List<Map<String, Object>> getClassStudents(String classCode) {
        List<Registration> regs = registrationRepository.findByClassCodeAndStatus(classCode, "SUCCESS");
        List<Map<String, Object>> studentsList = new ArrayList<>();
        int stt = 1;

        for (Registration reg : regs) {
            Optional<Student> studentOpt = studentRepository.findById(reg.getStudentId());
            if (studentOpt.isEmpty()) continue;
            Student s = studentOpt.get();

            Map<String, Object> map = new HashMap<>();
            map.put("stt", stt++);
            map.put("mssv", s.getStudentId());
            map.put("name", s.getFullName());
            map.put("dob", s.getDateOfBirth().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
            map.put("class", s.getClassName());
            map.put("email", s.getEmail());
            studentsList.add(map);
        }
        return studentsList;
    }
}
