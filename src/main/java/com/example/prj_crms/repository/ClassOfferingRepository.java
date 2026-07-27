package com.example.prj_crms.repository;

import com.example.prj_crms.model.ClassOffering;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClassOfferingRepository extends JpaRepository<ClassOffering, String> {
    List<ClassOffering> findBySemester(String semester);
}
