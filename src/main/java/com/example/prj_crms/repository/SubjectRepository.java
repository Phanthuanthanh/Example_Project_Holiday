package com.example.prj_crms.repository;

import com.example.prj_crms.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, String> {
}
