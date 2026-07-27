package com.example.prj_crms.controller;

import com.example.prj_crms.model.Lecturer;
import com.example.prj_crms.model.Student;
import com.example.prj_crms.repository.LecturerRepository;
import com.example.prj_crms.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final StudentRepository studentRepository;
    private final LecturerRepository lecturerRepository;

    public AuthController(StudentRepository studentRepository, LecturerRepository lecturerRepository) {
        this.studentRepository = studentRepository;
        this.lecturerRepository = lecturerRepository;
    }

    // API Đăng nhập phân quyền (AUTH_01)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        String role = body.get("role");

        // Mô phỏng kiểm tra mật khẩu (mặc định '123456' cho toàn bộ tài khoản demo)
        if (!"123456".equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Mật khẩu không chính xác."));
        }

        Map<String, Object> response = new HashMap<>();

        if ("student".equalsIgnoreCase(role)) {
            Optional<Student> studentOpt = studentRepository.findById(username);
            if (studentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Không tìm thấy mã số sinh viên."));
            }
            Student s = studentOpt.get();
            response.put("id", s.getStudentId());
            response.put("name", s.getFullName());
            response.put("role", "student");
            response.put("department", "CNTT");
            response.put("className", s.getClassName());
            return ResponseEntity.ok(response);

        } else if ("lecturer".equalsIgnoreCase(role)) {
            Optional<Lecturer> lecturerOpt = lecturerRepository.findById(username);
            if (lecturerOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Không tìm thấy mã giảng viên."));
            }
            Lecturer l = lecturerOpt.get();
            response.put("id", l.getLecturerId());
            response.put("name", l.getFullName());
            response.put("role", "lecturer");
            response.put("department", l.getDepartmentId());
            return ResponseEntity.ok(response);

        } else if ("registrar".equalsIgnoreCase(role)) {
            // Phòng Đào tạo (PDT) tài khoản mặc định PDT001
            if ("PDT001".equalsIgnoreCase(username)) {
                response.put("id", "PDT001");
                response.put("name", "Phòng Đào Tạo");
                response.put("role", "registrar");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Tài khoản Phòng Đào Tạo không hợp lệ."));
            }
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Vai trò đăng nhập không hợp lệ."));
    }
}
