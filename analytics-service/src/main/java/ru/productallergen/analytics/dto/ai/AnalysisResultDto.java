package ru.productallergen.analytics.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResultDto {
    private List<String> symptoms;
    private List<String> products;
    private List<String> dangerousProteins;
    private List<String> traceElements;
    private String doctorRecommendations;
}