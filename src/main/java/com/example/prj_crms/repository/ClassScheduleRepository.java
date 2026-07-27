package com.example.prj_crms.repository;

import com.example.prj_crms.model.ClassSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClassScheduleRepository extends JpaRepository<ClassSchedule, Long> {
    List<ClassSchedule> findByClassCode(String classCode);
}
