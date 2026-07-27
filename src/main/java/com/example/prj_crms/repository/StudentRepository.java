package com.example.prj_crms.repository;

import com.example.prj_crms.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {
}
