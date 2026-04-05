package ru.productallergen.userservice.food.initializer;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import ru.productallergen.userservice.food.entity.FoodEntity;
import ru.productallergen.userservice.food.repository.FoodRepository;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
class FoodDbLoader {
    private final FoodRepository foodRepository;
    private final FoodProvider foodProvider;

    @PostConstruct
    public void loadDefaultFoods() {
        if (foodRepository.count() > 0) {
            log.info("Foods exists");
            return;
        }
        log.info("Getting foods");
        List<FoodEntity> foods = foodProvider.getFoods();
        log.info("Saving foods");
        foodRepository.saveAll(foods);
    }
}
