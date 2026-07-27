package com.example.prj_crms.repository;

import com.example.prj_crms.model.PaymentReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentReceiptRepository extends JpaRepository<PaymentReceipt, String> {
    List<PaymentReceipt> findByStudentId(String studentId);
}
