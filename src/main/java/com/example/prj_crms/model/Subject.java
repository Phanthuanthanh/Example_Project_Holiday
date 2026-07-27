package com.example.prj_crms.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subjects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject {
    @Id
    private String id;
    private String name;
    private int credits;
    private String dept;
    private String prereq; // Môn học tiên quyết
    private String status; // ACTIVE, INACTIVE
}
