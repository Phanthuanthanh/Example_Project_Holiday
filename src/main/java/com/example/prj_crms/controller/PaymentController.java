package com.example.prj_crms.controller;

import com.example.prj_crms.service.TuitionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final TuitionService tuitionService;

    public PaymentController(TuitionService tuitionService) {
        this.tuitionService = tuitionService;
    }

    // IPN API: Tiếp nhận kết quả thanh toán từ cổng mô phỏng VNPAY (STUD_04)
    @GetMapping("/vnpay-ipn")
    public ResponseEntity<Map<String, Object>> processVnpayIpn(
            @RequestParam String invoiceId,
            @RequestParam BigDecimal amount,
            @RequestParam String txnCode,
            @RequestParam String responseCode) {
        Map<String, Object> result = tuitionService.processVnpayIpn(invoiceId, amount, txnCode, responseCode);
        return ResponseEntity.ok(result);
    }
}
