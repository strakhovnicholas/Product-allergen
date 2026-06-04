package ru.productallergen.analytics.service;

import chat.giga.client.GigaChatClient;
import chat.giga.model.completion.ChatMessage;
import chat.giga.model.completion.ChatMessageRole;
import chat.giga.model.completion.CompletionRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import ru.productallergen.analytics.config.GigaChatProperties;
import ru.productallergen.analytics.dto.ai.AnalysisResultDto;
import ru.productallergen.analytics.dto.report.ReportDataDto;

import java.util.ArrayList;
import java.util.List;
@Slf4j
@Service
@RequiredArgsConstructor
public class GigaChatAnalysisService {

    private final ObjectProvider<GigaChatClient> gigaChatClient;
    private final GigaChatProperties gigaChatProperties;
    private final ObjectMapper objectMapper;
    private final ReportAnalysisMapper analysisMapper;

    public ReportDataDto enrichReport(ReportDataDto reportData) {
        log.info("[ReportAI] GigaChat enrichReport start");
        AnalysisResultDto baseline = analysisMapper.fromFoodSymptoms(
                reportData.getFoodSymptoms() != null ? reportData.getFoodSymptoms() : List.of()
        );
        ReportService.logAnalysisResult("baseline", baseline);

        if (gigaChatClient.getIfAvailable() == null || !StringUtils.hasText(gigaChatProperties.getAuthKey())) {
            log.warn("[ReportAI] GigaChat not configured (auth key empty or client bean missing), baseline only");
            reportData.setAnalysis(baseline);
            return reportData;
        }

        try {
            String prompt = buildPrompt(reportData);
            log.info("[ReportAI] GigaChat calling model={} promptChars={}", gigaChatProperties.getModel(), prompt.length());
            String raw = callGigaChat(prompt);
            log.info("[ReportAI] GigaChat response chars={}", raw != null ? raw.length() : 0);
            if (log.isDebugEnabled() && raw != null) {
                log.debug("[ReportAI] GigaChat raw preview: {}", raw.length() > 500 ? raw.substring(0, 500) + "..." : raw);
            }
            AnalysisResultDto aiResult = parseAnalysisResponse(raw, baseline);
            analysisMapper.fillMissingProteinAndTrace(aiResult);
            analysisMapper.supplementProteinAndTrace(aiResult);
            reportData.setAnalysis(aiResult);
            ReportService.logAnalysisResult("gigachat result", aiResult);
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("No such model")) {
                log.error("[ReportAI] GigaChat model '{}' not found — set GIGACHAT_MODEL to a valid id (e.g. GigaChat-2-Max, GigaChat-Max)",
                        gigaChatProperties.getModel(), e);
            } else {
                log.error("[ReportAI] GigaChat analysis failed, using baseline", e);
            }
            reportData.setAnalysis(baseline);
        }
        return reportData;
    }

    private String callGigaChat(String prompt) {
        var response = gigaChatClient.getObject().completions(CompletionRequest.builder()
                .model(gigaChatProperties.getModel())
                .message(ChatMessage.builder()
                        .role(ChatMessageRole.USER)
                        .content(prompt)
                        .build())
                .build());
        return String.valueOf(response);
    }

    private String buildPrompt(ReportDataDto report) throws Exception {
        String payload = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(report);
        return """
                Ты медицинский аналитик. По данным дневника питания, симптомов, самочувствия и лекарств сформируй аналитику для PDF-отчёта.
                Ответь ТОЛЬКО валидным JSON без markdown и комментариев, строго в формате:
                {
                  "symptoms": ["строка"],
                  "products": ["строка"],
                  "dangerousProteins": ["строка"],
                  "traceElements": ["строка"],
                  "doctorRecommendations": "HTML-заключение на русском: <b>, <br/>, <i>, списки через •"
                }
                Правила:
                - symptoms: уникальные симптомы из foodSymptoms и wellbeing.
                - products (поле «Потенциальные продукты» в PDF): включи ВСЕ уникальные foodComponentName из foodSymptoms
                  без сокращения списка (если в данных 14 компонентов — в массиве products должно быть 14 наименований).
                - dangerousProteins (поле «Белки-аллергены»): ОБЯЗАТЕЛЬНО 2–6 конкретных белков-аллергенов, связанных с products.
                - traceElements (поле «Микроэлементы»): ОБЯЗАТЕЛЬНО 2–6 веществ/микроэлементов, связанных с products.
                - doctorRecommendations: HTML-заключение ТОЛЬКО для врача-аллерголога (не инструкция пациенту).
                  Стиль: клиническая справка. Структура:
                  <b>Клинический контекст:</b> период, симптомы, динамика.<br/>
                  <b>Триггеры по данным дневника:</b> перечисление.<br/>
                  <b>Предполагаемый механизм:</b> IgE/не-IgE, перекрёстная реактивность (осторожно).<br/>
                  <b>Тактика для врача:</b> план обследования (IgE-панель, элиминация под контролем), мониторинг, критерии направления.<br/>
                  ЗАПРЕЩЕНО обращение к пациенту: «исключите», «обратитесь к врачу», «проведите тест».
                  Используй: «целесообразно назначить», «рекомендуется рассмотреть», «пациенту может быть предложено».
                Учти user.allergies. Не выдумывай диагнозы, формулируй осторожно.
                Данные:
                """ + payload;
    }

    private AnalysisResultDto parseAnalysisResponse(String raw, AnalysisResultDto baseline) {
        try {
            String json = extractJson(raw);
            JsonNode node = objectMapper.readTree(json);
            List<String> symptoms = readStringList(node, "symptoms", baseline.getSymptoms());
            List<String> productsFromAi = readStringList(node, "products", List.of());
            List<String> products = analysisMapper.mergeProducts(baseline.getProducts(), productsFromAi);
            List<String> proteins = readStringListAny(node, baseline.getDangerousProteins(),
                    "dangerousProteins", "dangerous_proteins", "allergenProteins", "белкиАлергены");
            List<String> trace = readStringListAny(node, baseline.getTraceElements(),
                    "traceElements", "trace_elements", "microelements", "микроэлементы");
            String recommendations = firstNonBlankText(node,
                    baseline.getDoctorRecommendations(),
                    "doctorRecommendations", "recommendations", "doctor_recommendations");
            AnalysisResultDto result = new AnalysisResultDto(symptoms, products, proteins, trace, recommendations);
            if (productsFromAi.size() < products.size()) {
                log.info("[ReportAI] products merged: ai={} baseline+merged={}", productsFromAi.size(), products.size());
            }
            if (proteins.isEmpty() || trace.isEmpty()) {
                log.warn("[ReportAI] GigaChat JSON missing proteins={} or trace={} — will try product-based fill",
                        proteins.size(), trace.size());
            }
            return result;
        } catch (Exception e) {
            log.warn("[ReportAI] Could not parse GigaChat JSON, using baseline (raw may be non-JSON)", e);
            if (StringUtils.hasText(raw)) {
                baseline.setDoctorRecommendations(raw.trim());
            }
            return baseline;
        }
    }

    private List<String> readStringList(JsonNode node, String field, List<String> fallback) {
        if (!node.has(field) || !node.get(field).isArray()) {
            return fallback != null ? fallback : List.of();
        }
        List<String> result = new ArrayList<>();
        node.get(field).forEach(item -> {
            if (item.isTextual() && StringUtils.hasText(item.asText())) {
                result.add(item.asText());
            }
        });
        return result.isEmpty() && fallback != null ? fallback : result;
    }

    private List<String> readStringListAny(JsonNode node, List<String> fallback, String... fields) {
        for (String field : fields) {
            List<String> parsed = readStringList(node, field, List.of());
            if (!parsed.isEmpty()) {
                return parsed;
            }
        }
        return fallback != null ? fallback : List.of();
    }

    private String firstNonBlankText(JsonNode node, String fallback, String... fields) {
        for (String field : fields) {
            String value = node.path(field).asText("");
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return fallback != null ? fallback : "";
    }

    private String extractJson(String raw) {
        if (raw == null) {
            return "{}";
        }
        String trimmed = raw.trim();
        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return trimmed.substring(start, end + 1);
        }
        return trimmed;
    }
}
