package ru.productallergen.userservice.foodanalyzer.mapper;

import org.springframework.stereotype.Component;
import ru.productallergen.userservice.foodanalyzer.dto.SymptomDate;
import ru.productallergen.userservice.userInfo.dto.SymptomsDto;

import java.util.ArrayList;
import java.util.List;

@Component
public class SymptomDateMapper {
    public List<SymptomDate> map(List<SymptomsDto> symptomsDto) {
        List<SymptomDate> symptomDates = new ArrayList<>(symptomsDto.size());
        for (SymptomsDto symptomDto : symptomsDto) {
            symptomDates.add(map(symptomDto));
        }
        return symptomDates;
    }

    public SymptomDate map(SymptomsDto symptomDto) {
        return new SymptomDate(
                symptomDto.getSymptomName(),
                symptomDto.getStartTime(),
                symptomDto.getEndTime());
    }
}
