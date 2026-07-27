package com.example.prj_crms.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "registrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Registration {
    @Id
    private String id;
    private String studentId;
    private String classCode;
    private LocalDateTime registerDate;
    private String registerType; // Học mới, Học lại, Học cải thiện
    private String status; // SUCCESS, CANCELLED
}
