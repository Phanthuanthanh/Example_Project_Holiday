package com.example.prj_crms.repository;

import com.example.prj_crms.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, String> {
    List<Registration> findByStudentId(String studentId);
    List<Registration> findByStudentIdAndStatus(String studentId, String status);
    List<Registration> findByClassCodeAndStatus(String classCode, String status);
    Optional<Registration> findByStudentIdAndClassCodeAndStatus(String studentId, String classCode, String status);
    boolean existsByStudentIdAndClassCodeAndStatus(String studentId, String classCode, String status);
}
