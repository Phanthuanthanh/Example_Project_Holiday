package com.example.prj_crms.repository;

import com.example.prj_crms.model.TuitionInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TuitionInvoiceRepository extends JpaRepository<TuitionInvoice, String> {
    List<TuitionInvoice> findByStudentId(String studentId);
    Optional<TuitionInvoice> findByStudentIdAndSemester(String studentId, String semester);
}
