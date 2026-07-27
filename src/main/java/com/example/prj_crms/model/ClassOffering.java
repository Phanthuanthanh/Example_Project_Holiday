package com.example.prj_crms.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "class_offerings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassOffering {
    @Id
    private String id;
    private String semester;
    private String subjectId;
    private String lecturerId;
    private int minStudents;
    private int maxStudents;
    private int enrolled;
    private String room;
    private String schedule;
    private String status;
}
