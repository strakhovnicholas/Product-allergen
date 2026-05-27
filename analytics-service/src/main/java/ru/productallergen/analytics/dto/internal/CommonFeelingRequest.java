package ru.productallergen.analytics.dto.internal;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CommonFeelingRequest {
    private UUID feelingId;
    private LocalDateTime dateTime;

    @JsonAlias({"score", "wellbeingScore"})
    private Integer score;
}