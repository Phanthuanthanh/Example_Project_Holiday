package com.example.prj_crms.repository;

import com.example.prj_crms.model.RegistrationPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegistrationPeriodRepository extends JpaRepository<RegistrationPeriod, Long> {
}
