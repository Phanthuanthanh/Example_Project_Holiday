package com.example.prj_crms;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class PrjCrmsApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    // 1. Kiểm thử chức năng Đăng nhập (AUTH_01)
    @Test
    void testAuthLogin() throws Exception {
        // Đăng nhập thành công vai trò Sinh viên
        String studentLoginJson = "{\"username\":\"22110001\",\"password\":\"123456\",\"role\":\"student\"}";
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(studentLoginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("22110001"))
                .andExpect(jsonPath("$.name").value("Nguyễn Văn An"))
                .andExpect(jsonPath("$.role").value("student"));

        // Đăng nhập thất bại do sai mật khẩu
        String badLoginJson = "{\"username\":\"22110001\",\"password\":\"wrong_pass\",\"role\":\"student\"}";
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(badLoginJson))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Mật khẩu không chính xác."));
    }

    // 2. Kiểm thử chức năng Tra cứu lớp học phần mở (STUD_01)
    @Test
    void testSearchOpenClasses() throws Exception {
        mockMvc.perform(get("/api/student/classes/open")
                        .param("keyword", "Lập trình")
                        .param("department", "CNTT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4))) // Có 4 lớp có từ khóa "Lập trình" khoa CNTT trong seed data
                .andExpect(jsonPath("$[0].subject").value(containsString("Lập trình hướng đối tượng")));
    }

    // 3. Kiểm thử Ràng buộc Đăng ký môn học - Trùng thời khóa biểu (STUD_02)
    @Test
    void testRegisterOverlapConstraint() throws Exception {
        // Lớp 'CNTT003.1' học Thứ 2 Tiết 1-3. Sinh viên '22110001' đã đăng ký 'CNTT001.1' học Thứ 2 Tiết 1-3.
        // Đăng ký sẽ bị hệ thống từ chối do trùng thời khóa biểu.
        String regJson = "{\"studentId\":\"22110001\",\"classCode\":\"CNTT003.1\"}";
        mockMvc.perform(post("/api/student/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(regJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("trùng Thứ 2, Tiết 1-3")));
    }

    // 4. Kiểm thử Ràng buộc Hủy đăng ký môn học - Giới hạn tối thiểu 12 Tín chỉ (STUD_02)
    @Test
    void testUnregisterMinimumCreditsConstraint() throws Exception {
        // Sinh viên '22110001' đang có 10 TC đã đăng ký trong seed data.
        // Cố gắng hủy lớp 'MATH101.1' (4 TC) sẽ làm giảm số tín chỉ xuống còn 6 TC (< 12 TC tối thiểu).
        // Hệ thống sẽ từ chối và báo lỗi.
        mockMvc.perform(delete("/api/student/registrations")
                        .param("studentId", "22110001")
                        .param("classCode", "MATH101.1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("tụt dưới giới hạn tối thiểu quy định (12 tín chỉ)")));
    }

    // 5. Kiểm thử chức năng Thống kê tình hình đăng ký của Phòng Đào tạo (REG_04)
    @Test
    void testRegistrarReports() throws Exception {
        mockMvc.perform(get("/api/registrar/reports/finance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCredits").isNumber())
                .andExpect(jsonPath("$.totalTuition").isNumber())
                .andExpect(jsonPath("$.fillRates").isArray());
    }

    @Autowired
    private com.example.prj_crms.service.RegistrarService registrarService;

    @Test
    void testScheduleConflictOpenClass() {
        // Lớp CNTT001.1 đã học Thứ 2, Tiết 1-3 do GV001 dạy ở phòng A201.
        // Ta mở lớp mới CNTT002.4 trùng lịch này.
        java.util.Map<String, String> form = new java.util.HashMap<>();
        form.put("classCode", "CNTT002.4");
        form.put("subjectId", "CNTT002");
        form.put("semester", "HK2 2025-2026");
        form.put("lecturerId", "GV001");
        form.put("minStudents", "15");
        form.put("maxStudents", "50");
        form.put("dayOfWeek", "2");
        form.put("startPeriod", "1");
        form.put("endPeriod", "3");
        form.put("roomName", "A201");

        org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class, () -> {
            registrarService.openClass(form);
        });
    }

    @Test
    void testOpenClassInvalidPeriods() {
        java.util.Map<String, String> form = new java.util.HashMap<>();
        form.put("classCode", "CNTT002.5");
        form.put("subjectId", "CNTT002");
        form.put("semester", "HK2 2025-2026");
        form.put("lecturerId", "GV001");
        form.put("minStudents", "15");
        form.put("maxStudents", "50");
        form.put("dayOfWeek", "2");
        form.put("startPeriod", "5");
        form.put("endPeriod", "3"); // Tiết bắt đầu > Tiết kết thúc
        form.put("roomName", "A201");

        org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class, () -> {
            registrarService.openClass(form);
        });
    }

    @Test
    void testAddPeriodInvalidTimeRange() {
        java.util.Map<String, String> form = new java.util.HashMap<>();
        form.put("name", "Đợt Test Lỗi");
        form.put("targetBatches", "K24");
        form.put("targetDepartments", "CNTT");
        form.put("startTime", "2026-08-10T08:00");
        form.put("endTime", "2026-08-01T17:00"); // Ngày kết thúc trước ngày bắt đầu

        org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class, () -> {
            registrarService.addPeriod(form);
        });
    }
}
