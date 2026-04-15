package ru.productallergen.userservice.foodanalyzer.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.productallergen.userservice.foodanalyzer.dto.FoodComponentDate;
import ru.productallergen.userservice.userInfo.dto.FoodIntakeDto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class FoodComponentDateMapperTest {

    private FoodComponentDateMapper underTest;

    @BeforeEach
    void setUp() {
        underTest = new FoodComponentDateMapper();
    }

    @Test
    void map_SingleFoodIntakeDtoWithMultipleComponents_ShouldReturnCorrectFoodComponentDates() {
        LocalDateTime intakeTime = LocalDateTime.now();
        List<String> components = List.of("Component1", "Component2", "Component3");

        FoodIntakeDto dto = FoodIntakeDto.builder()
                .foodIntakeId(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .foodName("Test Food")
                .intakeTime(intakeTime)
                .components(components)
                .build();

        List<FoodComponentDate> expected = List.of(
                new FoodComponentDate("Component1", intakeTime),
                new FoodComponentDate("Component2", intakeTime),
                new FoodComponentDate("Component3", intakeTime)
        );

        List<FoodComponentDate> result = underTest.map(dto);

        assertEquals(expected, result);
    }

    @Test
    void map_SingleFoodIntakeDtoWithEmptyComponents_ShouldReturnEmptyList() {
        FoodIntakeDto dto = FoodIntakeDto.builder()
                .foodIntakeId(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .foodName("Test Food")
                .intakeTime(LocalDateTime.now())
                .components(List.of())
                .build();

        List<FoodComponentDate> result = underTest.map(dto);

        assertThat(result).isEmpty();
    }

    @Test
    void map_ListOfFoodIntakeDtoWithMultipleComponents_ShouldReturnAllFoodComponentDates() {
        LocalDateTime time1 = LocalDateTime.of(2024, 1, 1, 10, 0, 0, 0);
        LocalDateTime time2 = LocalDateTime.of(2024, 1, 1, 14, 0, 0, 0);

        FoodIntakeDto dto1 = FoodIntakeDto.builder()
                .foodIntakeId(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .foodName("Breakfast")
                .intakeTime(time1)
                .components(List.of("Egg", "Bread"))
                .build();

        FoodIntakeDto dto2 = FoodIntakeDto.builder()
                .foodIntakeId(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .foodName("Lunch")
                .intakeTime(time2)
                .components(List.of("Rice", "Chicken", "Vegetables"))
                .build();

        List<FoodIntakeDto> dtos = List.of(dto1, dto2);

        List<FoodComponentDate> expected = List.of(
                new FoodComponentDate("Egg", time1),
                new FoodComponentDate("Bread", time1),
                new FoodComponentDate("Rice", time2),
                new FoodComponentDate("Chicken", time2),
                new FoodComponentDate("Vegetables", time2)
        );
        List<FoodComponentDate> result = underTest.map(dtos);

        assertEquals(expected, result);
    }

    @Test
    void map_EmptyListOfFoodIntakeDto_ShouldReturnEmptyList() {
        List<FoodIntakeDto> dtos = List.of();

        List<FoodComponentDate> result = underTest.map(dtos);

        assertThat(result).isEmpty();
    }
}