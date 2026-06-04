package ru.productallergen.analytics;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.JRException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.productallergen.analytics.dto.report.ReportDataDto;
import ru.productallergen.analytics.dto.report.ReportSnapshotSummaryDto;
import ru.productallergen.analytics.service.ReportService;
import ru.productallergen.analytics.service.ReportSnapshotService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final ReportSnapshotService reportSnapshotService;

    @GetMapping("/generate")
    public ResponseEntity<byte[]> generateReport(@RequestAttribute("currentUserId") String userId,
                                                 @RequestParam("from") LocalDateTime from,
                                                 @RequestParam("to") LocalDateTime to) throws JRException {
        UUID id = UUID.fromString(userId);
        log.info("[ReportAI] GET /reports/generate userId={} from={} to={}", id, from, to);
        ReportService.ReportGenerationResult result = reportService.buildAndPersistReport(id, from, to);
        byte[] pdf = reportService.generateMedicalReport(result.reportData());
        log.info("[ReportAI] GET /reports/generate done snapshotId={} pdfBytes={}", result.snapshotId(), pdf.length);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header("Content-Disposition", "inline; filename=medical_analysis_full.pdf")
                .header("X-Report-Snapshot-Id", String.valueOf(result.snapshotId()))
                .body(pdf);
    }

    @GetMapping("/snapshots")
    public List<ReportSnapshotSummaryDto> listSnapshots(@RequestAttribute("currentUserId") String userId) {
        UUID id = UUID.fromString(userId);
        return reportSnapshotService.listForUser(id).stream()
                .map(ReportSnapshotSummaryDto::from)
                .toList();
    }

    @GetMapping("/snapshots/{snapshotId}")
    public ReportDataDto getSnapshot(@RequestAttribute("currentUserId") String userId,
                                     @PathVariable Long snapshotId) {
        UUID id = UUID.fromString(userId);
        return reportService.loadSnapshotData(snapshotId, id);
    }

    @GetMapping("/snapshots/{snapshotId}/pdf")
    public ResponseEntity<byte[]> generatePdfFromSnapshot(@RequestAttribute("currentUserId") String userId,
                                                          @PathVariable Long snapshotId) throws JRException {
        UUID id = UUID.fromString(userId);
        ReportDataDto data = reportService.loadSnapshotData(snapshotId, id);
        byte[] pdf = reportService.generateMedicalReport(data);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=medical_report_" + snapshotId + ".pdf")
                .body(pdf);
    }

    @PostMapping("/download")
    public ResponseEntity<byte[]> downloadReport(@RequestBody ReportDataDto reportData) throws JRException {
        byte[] reportBytes = reportService.generateMedicalReport(reportData);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"medical_report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(reportBytes.length)
                .body(reportBytes);
    }
}
