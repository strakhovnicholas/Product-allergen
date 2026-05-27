package ru.productallergen.analytics.dto.internal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoDto {
    private String fullName;
    private Integer age;
    private Double weight;
    private String gender;
    private Boolean smoker;
    private Boolean alcohol;
    private Boolean sports;
    private List<String> chronicDiseases;
    private List<String> allergies;
}