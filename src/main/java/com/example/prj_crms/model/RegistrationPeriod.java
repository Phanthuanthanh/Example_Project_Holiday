package com.example.prj_crms.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "registration_periods")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationPeriod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String targetBatches;
    private String targetDepartments;
    private String status; // OPEN, CLOSED
}
