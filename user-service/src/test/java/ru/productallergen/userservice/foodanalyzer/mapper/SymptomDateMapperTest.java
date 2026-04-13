package ru.productallergen.userservice.foodanalyzer.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.productallergen.userservice.foodanalyzer.dto.SymptomDate;
import ru.productallergen.userservice.userInfo.dto.SymptomsDto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class SymptomDateMapperTest {

    private SymptomDateMapper underTest;

    @BeforeEach
    void setUp() {
        underTest = new SymptomDateMapper();
    }

    @Test
    void map_SingleSymptomsDto_ShouldReturnCorrectSymptomDate() {
        LocalDateTime startTime = LocalDateTime.of(2024, 1, 1, 10, 0, 0, 0);
        LocalDateTime endTime = LocalDateTime.of(2024, 1, 1, 12, 0, 0, 0);

        SymptomsDto dto = SymptomsDto.builder()
                .symptomsId(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .symptomName("Headache")
                .severity(5)
                .startTime(startTime)
                .endTime(endTime)
                .possibleCause("Stress")
                .build();

        SymptomDate expected = new SymptomDate("Headache", startTime, endTime);
        SymptomDate result = underTest.map(dto);

        assertEquals(expected, result);
    }

    @Test
    void map_SingleSymptomsDtoWithNullEndTime_ShouldReturnSymptomDateWithNullEndTime() {
        LocalDateTime startTime = LocalDateTime.now();

        SymptomsDto dto = SymptomsDto.builder()
                .symptomsId(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .symptomName("Nausea")
                .severity(3)
                .startTime(startTime)
                .endTime(null)
                .possibleCause("Food poisoning")
                .build();

        SymptomDate expected = new SymptomDate("Nausea", startTime, null);
        SymptomDate result = underTest.map(dto);

        assertEquals(expected, result);
    }

    @Test
    void map_SingleSymptomsDtoWithNullStartTime_ShouldReturnSymptomDateWithNullStartTime() {
        LocalDateTime endTime = LocalDateTime.now();

        SymptomsDto dto = SymptomsDto.builder()
                .symptomsId(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .symptomName("Rash")
                .severity(4)
                .startTime(null)
                .endTime(endTime)
                .possibleCause("Allergy")
                .build();

        SymptomDate expected = new SymptomDate("Rash", null, endTime);
        SymptomDate result = underTest.map(dto);

        assertEquals(expected, result);
    }

    @Test
    void map_ListOfSymptomsDto_ShouldReturnListOfSymptomDates() {
        LocalDateTime time1Start = LocalDateTime.of(2024, 1, 1, 9, 0, 0, 0);
        LocalDateTime time1End = LocalDateTime.of(2024, 1, 1, 10, 0, 0, 0);

        LocalDateTime time2Start = LocalDateTime.of(2024, 1, 1, 14, 0, 0, 0);
        LocalDateTime time2End = LocalDateTime.of(2024, 1, 1, 15, 30, 0, 0);

        SymptomsDto dto1 = SymptomsDto.builder()
                .symptomsId(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .symptomName("Fever")
                .severity(7)
                .startTime(time1Start)
                .endTime(time1End)
                .possibleCause("Infection")
                .build();

        SymptomsDto dto2 = SymptomsDto.builder()
                .symptomsId(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .symptomName("Cough")
                .severity(3)
                .startTime(time2Start)
                .endTime(time2End)
                .possibleCause("Cold")
                .build();

        List<SymptomsDto> dtos = List.of(dto1, dto2);

        List<SymptomDate> expected = List.of(
                new SymptomDate("Fever", time1Start, time1End),
                new SymptomDate("Cough", time2Start, time2End)
        );

        List<SymptomDate> result = underTest.map(dtos);

        assertEquals(expected, result);
    }

    @Test
    void map_ListOfSymptomsDtoWithNullValues_ShouldHandleGracefully() {
        // given
        LocalDateTime startTime = LocalDateTime.now();

        SymptomsDto dto1 = SymptomsDto.builder()
                .symptomsId(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .symptomName("Dizziness")
                .severity(4)
                .startTime(startTime)
                .endTime(null)
                .possibleCause("Dehydration")
                .build();

        SymptomsDto dto2 = SymptomsDto.builder()
                .symptomsId(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .symptomName(null)
                .severity(2)
                .startTime(null)
                .endTime(null)
                .possibleCause(null)
                .build();

        List<SymptomsDto> dtos = List.of(dto1, dto2);

        List<SymptomDate> expected = List.of(
                new SymptomDate("Dizziness", startTime, null),
                new SymptomDate(null, null, null)
        );

        List<SymptomDate> result = underTest.map(dtos);

        assertEquals(expected, result);
    }

    @Test
    void map_EmptyListOfSymptomsDto_ShouldReturnEmptyList() {
        List<SymptomsDto> dtos = List.of();

        List<SymptomDate> result = underTest.map(dtos);

        assertThat(result).isEmpty();
    }

    @Test
    void map_SingleSymptomsDtoWithSameStartAndEndTime_ShouldReturnSymptomDateWithEqualTimes() {
        LocalDateTime time = LocalDateTime.of(2024, 1, 1, 12, 0, 0, 0);

        SymptomsDto dto = SymptomsDto.builder()
                .symptomsId(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .symptomName("Itching")
                .severity(2)
                .startTime(time)
                .endTime(time)
                .possibleCause("Allergic reaction")
                .build();

        SymptomDate expected = new SymptomDate("Itching", time, time);
        SymptomDate result = underTest.map(dto);

        assertEquals(expected, result);
    }
}