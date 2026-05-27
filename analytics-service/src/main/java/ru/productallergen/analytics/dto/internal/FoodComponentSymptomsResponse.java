package ru.productallergen.analytics.dto.internal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoodComponentSymptomsResponse {
    private String foodComponentName;
    private List<String> symptomsName;
}
