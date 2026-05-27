package ru.productallergen.analytics.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.productallergen.analytics.dto.internal.CommonFeelingRequest;
import ru.productallergen.analytics.dto.internal.FoodComponentSymptomsResponse;
import ru.productallergen.analytics.dto.internal.MedicineDto;
import ru.productallergen.analytics.dto.internal.UserInfoDto;
import ru.productallergen.analytics.dto.ai.AnalysisResultDto;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportDataDto {
    private UserInfoDto user;
    private List<MedicineDto> medicine;
    private List<CommonFeelingRequest> wellbeing;
    private List<FoodComponentSymptomsResponse> foodSymptoms;
    private AnalysisResultDto analysis;
}