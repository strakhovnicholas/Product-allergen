package ru.productallergen.analytics.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import ru.productallergen.analytics.dto.report.ReportDataDto;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "report_snapshots", indexes = {
        @Index(name = "idx_report_snapshots_user_id", columnList = "user_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "period_from", nullable = false)
    private LocalDateTime periodFrom;

    @Column(name = "period_to", nullable = false)
    private LocalDateTime periodTo;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "report_data", columnDefinition = "jsonb", nullable = false)
    private ReportDataDto reportData;
}
