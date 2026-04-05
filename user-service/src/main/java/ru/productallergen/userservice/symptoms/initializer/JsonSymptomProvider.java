package ru.productallergen.userservice.symptoms.initializer;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import ru.productallergen.userservice.symptoms.entity.SymptomEntity;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
public class JsonSymptomProvider implements SymptomProvider {
    @Value("classpath:init_data/default_symptoms.json")
    private Resource jsonResource;

    @Override
    public List<SymptomEntity> getSymptoms() {
        try {
            InputStream inputStream = jsonResource.getInputStream();
            return parseSymptoms(inputStream);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read JSON file", e);
        }
    }

    private List<SymptomEntity> parseSymptoms(InputStream inputStream) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        Map<String, List<Map<String, Object>>> jsonMap = objectMapper.readValue(
                inputStream,
                new TypeReference<>() {
                }
        );

        List<Map<String, Object>> symptomsList = jsonMap.get("symptoms");
        if (symptomsList == null || symptomsList.isEmpty()) {
            return Collections.emptyList();
        }

        List<SymptomEntity> result = new ArrayList<>();
        for (Map<String, Object> symptom : symptomsList) {
            SymptomEntity entity = new SymptomEntity();
            entity.setSymptomName((String) symptom.get("name"));
            entity.setSeverity((Integer) symptom.get("severity"));
            result.add(entity);
        }

        return result;
    }
}
