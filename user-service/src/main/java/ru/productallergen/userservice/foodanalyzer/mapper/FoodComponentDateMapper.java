package ru.productallergen.userservice.foodanalyzer.mapper;

import org.springframework.stereotype.Component;
import ru.productallergen.userservice.foodanalyzer.dto.FoodComponentDate;
import ru.productallergen.userservice.userInfo.dto.FoodIntakeDto;

import java.util.ArrayList;
import java.util.List;

@Component
public class FoodComponentDateMapper {
    public List<FoodComponentDate> map(List<FoodIntakeDto> foodsIntakeDto) {
        List<FoodComponentDate> foodComponentDates = new ArrayList<>();
        for (FoodIntakeDto foodIntakeDto : foodsIntakeDto) {
            foodComponentDates.addAll(map(foodIntakeDto));
        }

        return foodComponentDates;
    }

    public List<FoodComponentDate> map(FoodIntakeDto foodIntakeDto) {
        List<FoodComponentDate> foodComponentDates = new ArrayList<>();
        for (String component : foodIntakeDto.getComponents()) {
            foodComponentDates.add(new FoodComponentDate(component, foodIntakeDto.getIntakeTime()));
        }

        return foodComponentDates;
    }
}
