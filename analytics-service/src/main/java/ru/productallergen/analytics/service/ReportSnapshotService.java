package ru.productallergen.analytics.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.productallergen.analytics.dto.report.ReportDataDto;
import ru.productallergen.analytics.entity.ReportSnapshot;
import ru.productallergen.analytics.repository.ReportSnapshotRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportSnapshotService {

    private final ReportSnapshotRepository repository;

    @Transactional
    public ReportSnapshot save(UUID userId, LocalDateTime from, LocalDateTime to, ReportDataDto reportData) {
        ReportSnapshot snapshot = ReportSnapshot.builder()
                .userId(userId)
                .periodFrom(from)
                .periodTo(to)
                .createdAt(LocalDateTime.now())
                .reportData(reportData)
                .build();
        return repository.save(snapshot);
    }

    @Transactional(readOnly = true)
    public List<ReportSnapshot> listForUser(UUID userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public ReportSnapshot getForUser(Long id, UUID userId) {
        return repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Report snapshot not found: " + id));
    }
}
