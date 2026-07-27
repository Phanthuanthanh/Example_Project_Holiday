package com.example.prj_crms.controller;

import com.example.prj_crms.service.LecturerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lecturer")
public class LecturerController {

    private final LecturerService lecturerService;

    public LecturerController(LecturerService lecturerService) {
        this.lecturerService = lecturerService;
    }

    // Lấy thời khóa biểu dạy của giảng viên (LECT_01)
    @GetMapping("/timetable")
    public ResponseEntity<List<Map<String, Object>>> getLecturerTimetable(@RequestParam String lecturerId) {
        return ResponseEntity.ok(lecturerService.getLecturerTimetable(lecturerId));
    }

    // Xem danh sách sinh viên đăng ký của lớp học phần phụ trách (LECT_02)
    @GetMapping("/classes/{classCode}/students")
    public ResponseEntity<List<Map<String, Object>>> getClassStudents(@PathVariable String classCode) {
        return ResponseEntity.ok(lecturerService.getClassStudents(classCode));
    }
}
