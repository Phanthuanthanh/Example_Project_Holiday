package com.example.prj_crms.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lecturers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lecturer {
    @Id
    private String lecturerId;
    private String fullName;
    private String email;
    private String departmentId;
}
