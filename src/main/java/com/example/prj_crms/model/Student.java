package com.example.prj_crms.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {
    @Id
    private String studentId;
    private String fullName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String className;
    private String status; // ACTIVE, INACTIVE
}
