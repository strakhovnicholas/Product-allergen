package ru.productallergen.analytics.service;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import ru.productallergen.analytics.dto.ai.AnalysisResultDto;
import ru.productallergen.analytics.dto.internal.FoodComponentSymptomsResponse;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Component
public class ReportAnalysisMapper {

    public AnalysisResultDto fromFoodSymptoms(List<FoodComponentSymptomsResponse> analyzeResponse) {
        List<String> products = analyzeResponse.stream()
                .map(FoodComponentSymptomsResponse::getFoodComponentName)
                .distinct()
                .toList();

        List<String> symptoms = analyzeResponse.stream()
                .filter(response -> response.getSymptomsName() != null)
                .filter(response -> !response.getSymptomsName().isEmpty())
                .flatMap(response -> response.getSymptomsName().stream())
                .distinct()
                .toList();

        return new AnalysisResultDto(
                symptoms,
                products,
                inferDangerousProteins(products),
                inferTraceElements(products),
                ""
        );
    }

    /**
     * Заполняет белки-аллергены и микроэлементы, если GigaChat вернул пустые массивы.
     */
    public List<String> mergeProducts(List<String> baseline, List<String> fromAi) {
        Set<String> merged = new LinkedHashSet<>();
        if (baseline != null) {
            baseline.stream().filter(StringUtils::hasText).map(String::trim).forEach(merged::add);
        }
        if (fromAi != null) {
            fromAi.stream().filter(StringUtils::hasText).map(String::trim).forEach(merged::add);
        }
        return new ArrayList<>(merged);
    }

    public void fillMissingProteinAndTrace(AnalysisResultDto analysis) {
        if (analysis == null) {
            return;
        }
        List<String> products = analysis.getProducts() != null ? analysis.getProducts() : List.of();
        if (analysis.getDangerousProteins() == null || analysis.getDangerousProteins().isEmpty()) {
            analysis.setDangerousProteins(inferDangerousProteins(products));
        }
        if (analysis.getTraceElements() == null || analysis.getTraceElements().isEmpty()) {
            analysis.setTraceElements(inferTraceElements(products));
        }
    }

    /** Дополняет белки/микроэлементы по полному списку продуктов (после merge с foodSymptoms). */
    public void supplementProteinAndTrace(AnalysisResultDto analysis) {
        if (analysis == null) {
            return;
        }
        List<String> products = analysis.getProducts() != null ? analysis.getProducts() : List.of();
        Set<String> proteins = new LinkedHashSet<>();
        if (analysis.getDangerousProteins() != null) {
            proteins.addAll(analysis.getDangerousProteins());
        }
        proteins.addAll(inferDangerousProteins(products));
        analysis.setDangerousProteins(new ArrayList<>(proteins));

        Set<String> trace = new LinkedHashSet<>();
        if (analysis.getTraceElements() != null) {
            trace.addAll(analysis.getTraceElements());
        }
        trace.addAll(inferTraceElements(products));
        analysis.setTraceElements(new ArrayList<>(trace));
    }

    public List<String> inferDangerousProteins(List<String> products) {
        Set<String> proteins = new LinkedHashSet<>();
        for (String product : products) {
            if (!StringUtils.hasText(product)) {
                continue;
            }
            String p = product.toLowerCase(Locale.ROOT);
            if (containsAny(p, "молок", "молоч", "сыр", "йогурт", "сливк")) {
                proteins.add("Казеин");
                proteins.add("β-лактоглобулин");
                proteins.add("α-лактальбумин");
            }
            if (containsAny(p, "яйц", "яичн")) {
                proteins.add("Овомукоид");
                proteins.add("Овальбумин");
            }
            if (containsAny(p, "арахис")) {
                proteins.add("Ara h 1");
                proteins.add("Ara h 2");
            }
            if (containsAny(p, "сельдер", "celery")) {
                proteins.add("Api g 1");
            }
            if (containsAny(p, "пшен", "глютен", "хлеб", "мук")) {
                proteins.add("Глиадин");
                proteins.add("Глютенин");
            }
            if (containsAny(p, "рыб", "лосос", "треск")) {
                proteins.add("Парвалбумин");
            }
            if (containsAny(p, "соя")) {
                proteins.add("Глицинин");
                proteins.add("β-конглицинин");
            }
            if (containsAny(p, "орех", "миндал", "фундук", "грецк")) {
                proteins.add("2S-альбумин");
                proteins.add("11S-глобулин");
            }
            if (containsAny(p, "лимон", "цитрус", "апельсин")) {
                proteins.add("Лимонен (профиль перекрестной чувствительности)");
            }
            if (containsAny(p, "овсян", "овес", "хлопья")) {
                proteins.add("Авенин");
            }
            if (containsAny(p, "виноград")) {
                proteins.add("Липовый белок (Vitis v 1)");
            }
            if (containsAny(p, "йогурт", "сливк", "кефир")) {
                proteins.add("Казеин");
                proteins.add("β-лактоглобулин");
            }
        }
        if (proteins.isEmpty() && !products.isEmpty()) {
            proteins.add("Требуется уточнение по IgE-панели");
        }
        return new ArrayList<>(proteins);
    }

    public List<String> inferTraceElements(List<String> products) {
        Set<String> trace = new LinkedHashSet<>();
        for (String product : products) {
            if (!StringUtils.hasText(product)) {
                continue;
            }
            String p = product.toLowerCase(Locale.ROOT);
            if (containsAny(p, "молок", "молоч", "лакт", "сыр")) {
                trace.add("Лактоза");
                trace.add("Кальций");
            }
            if (containsAny(p, "лимон", "цитрус")) {
                trace.add("Лимонная кислота");
                trace.add("Салицилаты");
            }
            if (containsAny(p, "сельдер")) {
                trace.add("Фуранокумарины");
                trace.add("Нитраты");
            }
            if (containsAny(p, "ароматизатор", "краситель", "консервант", "добавк")) {
                trace.add("Глутамат натрия");
                trace.add("Бензоаты");
                trace.add("Сульфиты");
            }
            if (containsAny(p, "закваск", "дрожж")) {
                trace.add("Гистамин");
                trace.add("Тиамин");
            }
            if (containsAny(p, "шоколад", "какао")) {
                trace.add("Теобромин");
                trace.add("Гистамин");
            }
            if (containsAny(p, "морепродукт", "рыб", "кревет", "миди")) {
                trace.add("Гистамин");
                trace.add("Йод");
            }
            if (containsAny(p, "виноград")) {
                trace.add("Салицилаты");
                trace.add("Танины");
            }
            if (containsAny(p, "овсян", "хлопья")) {
                trace.add("Авенин (пептиды)");
            }
            if (containsAny(p, "сахар", "сироп", "глюкоз")) {
                trace.add("Сахароза");
            }
        }
        if (trace.isEmpty() && !products.isEmpty()) {
            trace.add("Гистамин (неспецифический триггер)");
        }
        return new ArrayList<>(trace);
    }

    private static boolean containsAny(String text, String... parts) {
        for (String part : parts) {
            if (text.contains(part)) {
                return true;
            }
        }
        return false;
    }
}
