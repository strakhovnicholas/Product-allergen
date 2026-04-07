package ru.productallergen.userservice.food.initializer;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import ru.productallergen.userservice.food.entity.FoodEntity;
import ru.productallergen.userservice.userInfo.FoodCategory;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
class JsonFoodProvider implements FoodProvider {
    @Value("classpath:init_data/default_foods.json")
    private Resource jsonResource;

    @Override
    public List<FoodEntity> getFoods() {
        try {
            InputStream inputStream = jsonResource.getInputStream();
            return parseFoods(inputStream);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read JSON file", e);
        }
    }

    private List<FoodEntity> parseFoods(InputStream inputStream) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        Map<String, List<Map<String, Object>>> jsonMap = objectMapper.readValue(
                inputStream,
                new TypeReference<>() {
                }
        );

        List<Map<String, Object>> foodsList = jsonMap.get("foods");
        if (foodsList == null || foodsList.isEmpty()) {
            return Collections.emptyList();
        }

        List<FoodEntity> result = new ArrayList<>();
        for (Map<String, Object> foodMap : foodsList) {
            FoodEntity entity = new FoodEntity();
            entity.setFoodName((String) foodMap.get("name"));

            String categoryStr = (String) foodMap.get("category");
            if (categoryStr != null) {
                entity.setCategory(FoodCategory.valueOf(categoryStr));
            }

            @SuppressWarnings("unchecked")
            List<String> components = (List<String>) foodMap.get("components");
            entity.setComponents(components != null ? components : new ArrayList<>());

            result.add(entity);
        }

        return result;
    }
}
