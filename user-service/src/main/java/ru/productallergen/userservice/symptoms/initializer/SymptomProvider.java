package ru.productallergen.userservice.symptoms.initializer;

import ru.productallergen.userservice.symptoms.entity.SymptomEntity;

import java.util.List;

interface SymptomProvider {
    List<SymptomEntity> getSymptoms();
}
