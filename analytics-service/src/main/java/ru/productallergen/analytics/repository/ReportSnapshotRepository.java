package ru.productallergen.analytics.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.productallergen.analytics.entity.ReportSnapshot;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReportSnapshotRepository extends JpaRepository<ReportSnapshot, Long> {

    List<ReportSnapshot> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<ReportSnapshot> findByIdAndUserId(Long id, UUID userId);
}
