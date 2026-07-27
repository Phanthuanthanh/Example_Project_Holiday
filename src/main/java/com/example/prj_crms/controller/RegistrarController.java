package com.example.prj_crms.controller;

import com.example.prj_crms.model.ClassOffering;
import com.example.prj_crms.model.RegistrationPeriod;
import com.example.prj_crms.model.Subject;
import com.example.prj_crms.service.RegistrarService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/registrar")
public class RegistrarController {

    private final RegistrarService registrarService;

    public RegistrarController(RegistrarService registrarService) {
        this.registrarService = registrarService;
    }

    // ─── QUẢN LÝ MÔN HỌC (REG_01) ───

    @GetMapping("/subjects")
    public ResponseEntity<List<Subject>> getAllSubjects() {
        return ResponseEntity.ok(registrarService.getAllSubjects());
    }

    @PostMapping("/subjects")
    public ResponseEntity<?> addSubject(@RequestBody Subject subject) {
        try {
            return ResponseEntity.ok(registrarService.addSubject(subject));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/subjects/{id}")
    public ResponseEntity<?> updateSubject(@PathVariable String id, @RequestBody Subject subject) {
        try {
            return ResponseEntity.ok(registrarService.updateSubject(id, subject));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<?> deleteSubject(@PathVariable String id) {
        try {
            registrarService.deleteSubject(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa môn học thành công."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/subjects/{id}/status")
    public ResponseEntity<?> patchSubjectStatus(@PathVariable String id, @RequestParam String status) {
        try {
            return ResponseEntity.ok(registrarService.patchSubjectStatus(id, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ─── QUẢN LÝ MỞ LỚP HỌC PHẦN (REG_02) ───

    @GetMapping("/classes")
    public ResponseEntity<List<Map<String, Object>>> getAllClasses() {
        return ResponseEntity.ok(registrarService.getAllClasses());
    }

    @PostMapping("/classes")
    public ResponseEntity<?> openClass(@RequestBody Map<String, String> form) {
        try {
            return ResponseEntity.ok(registrarService.openClass(form));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/classes/{classCode}/cancel")
    public ResponseEntity<?> cancelClass(@PathVariable String classCode) {
        try {
            registrarService.cancelClass(classCode);
            return ResponseEntity.ok(Map.of("message", "Đã hủy lớp học phần và hoàn trả học phí cho sinh viên."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/classes/{classCode}")
    public ResponseEntity<?> deleteClass(@PathVariable String classCode) {
        try {
            registrarService.deleteClass(classCode);
            return ResponseEntity.ok(Map.of("message", "Đã xóa lớp học phần thành công."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ─── CẤU HÌNH ĐỢT ĐĂNG KÝ (REG_03) ───

    @GetMapping("/periods")
    public ResponseEntity<List<RegistrationPeriod>> getAllPeriods() {
        return ResponseEntity.ok(registrarService.getAllPeriods());
    }

    @PostMapping("/periods")
    public ResponseEntity<?> addPeriod(@RequestBody Map<String, String> form) {
        try {
            return ResponseEntity.ok(registrarService.addPeriod(form));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/periods/{id}/status")
    public ResponseEntity<?> togglePeriodStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            return ResponseEntity.ok(registrarService.togglePeriodStatus(id, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ─── THỐNG KÊ BÁO CÁO (REG_04) ───

    @GetMapping("/reports/finance")
    public ResponseEntity<Map<String, Object>> getFinanceReport() {
        return ResponseEntity.ok(registrarService.getFinanceReport());
    }

    @GetMapping("/reports/enrolled")
    public ResponseEntity<List<Map<String, Object>>> getLowEnrolledClasses() {
        return ResponseEntity.ok(registrarService.getLowEnrolledClasses());
    }
}
