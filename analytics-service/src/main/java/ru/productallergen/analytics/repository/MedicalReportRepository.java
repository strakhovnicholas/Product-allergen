package ru.productallergen.analytics.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.productallergen.analytics.entity.MedicalReport;

public interface MedicalReportRepository extends JpaRepository<MedicalReport, Long> {
}
