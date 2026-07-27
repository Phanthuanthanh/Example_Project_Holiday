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
import java.time.LocalDate;

@Entity
@Table(name = "class_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String classCode;
    private int dayOfWeek;
    private int startPeriod;
    private int endPeriod;
    private String roomName;
    private LocalDate specificDate;
    private String scheduleType; // WEEKLY, MAKEUP
}
