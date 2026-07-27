package com.example.prj_crms.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "payment_receipts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentReceipt {
    @Id
    private String receiptId;
    private String studentId;
    private String invoiceId;
    private String code;
    private String date;
    private BigDecimal amount;
    private String method;
    private String result; // success, failed
}
