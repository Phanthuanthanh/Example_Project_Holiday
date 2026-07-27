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
@Table(name = "tuition_invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TuitionInvoice {
    @Id
    private String invoiceId;
    private String studentId;
    private String semester;
    private BigDecimal required;
    private BigDecimal paid;
    private BigDecimal debt;
    private String deadline;
    private String status; // unpaid, paid, partially_paid, overdue
}
