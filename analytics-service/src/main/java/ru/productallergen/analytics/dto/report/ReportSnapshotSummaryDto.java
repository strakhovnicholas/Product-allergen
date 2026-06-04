package ru.productallergen.analytics.dto.report;

import ru.productallergen.analytics.entity.ReportSnapshot;

import java.time.LocalDateTime;

public record ReportSnapshotSummaryDto(
        Long id,
        LocalDateTime periodFrom,
        LocalDateTime periodTo,
        LocalDateTime createdAt
) {
    public static ReportSnapshotSummaryDto from(ReportSnapshot snapshot) {
        return new ReportSnapshotSummaryDto(
                snapshot.getId(),
                snapshot.getPeriodFrom(),
                snapshot.getPeriodTo(),
                snapshot.getCreatedAt()
        );
    }
}
