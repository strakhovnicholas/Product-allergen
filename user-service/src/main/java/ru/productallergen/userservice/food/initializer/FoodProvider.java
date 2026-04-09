package ru.productallergen.userservice.food.initializer;

import ru.productallergen.userservice.food.entity.FoodEntity;

import java.util.List;

interface FoodProvider {
    List<FoodEntity> getFoods();
}
