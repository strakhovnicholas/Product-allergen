package ru.productallergen.analytics.kafka;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import ru.productallergen.analytics.dto.report.ReportDataDto;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Slf4j
@Component
public class ReportAiRegistry {

    private final ConcurrentHashMap<UUID, CompletableFuture<ReportDataDto>> pending = new ConcurrentHashMap<>();

    public CompletableFuture<ReportDataDto> register(UUID requestId) {
        CompletableFuture<ReportDataDto> future = new CompletableFuture<>();
        pending.put(requestId, future);
        log.info("[ReportAI] registry register requestId={} pending={}", requestId, pending.size());
        return future;
    }

    public void complete(UUID requestId, ReportDataDto reportData) {
        CompletableFuture<ReportDataDto> future = pending.remove(requestId);
        if (future != null) {
            future.complete(reportData);
            log.info("[ReportAI] registry complete requestId={}", requestId);
        } else {
            log.warn("[ReportAI] registry complete: no pending future for requestId={}", requestId);
        }
    }

    public void fail(UUID requestId, Throwable error) {
        CompletableFuture<ReportDataDto> future = pending.remove(requestId);
        if (future != null) {
            future.completeExceptionally(error);
            log.warn("[ReportAI] registry fail requestId={}", requestId, error);
        } else {
            log.warn("[ReportAI] registry fail: no pending future for requestId={}", requestId);
        }
    }

    public ReportDataDto await(UUID requestId, long timeoutSeconds) throws Exception {
        CompletableFuture<ReportDataDto> future = pending.get(requestId);
        if (future == null) {
            throw new IllegalStateException("No pending report request for id " + requestId);
        }
        log.info("[ReportAI] registry await requestId={} timeoutSec={}", requestId, timeoutSeconds);
        try {
            ReportDataDto result = future.get(timeoutSeconds, TimeUnit.SECONDS);
            log.info("[ReportAI] registry await OK requestId={}", requestId);
            return result;
        } catch (TimeoutException e) {
            pending.remove(requestId);
            log.warn("[ReportAI] registry await TIMEOUT requestId={} after {}s", requestId, timeoutSeconds);
            throw e;
        }
    }
}
