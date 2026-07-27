package com.example.prj_crms.repository;

import com.example.prj_crms.model.Lecturer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LecturerRepository extends JpaRepository<Lecturer, String> {
}
