package ru.productallergen.userservice.symptoms.initializer;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import ru.productallergen.userservice.symptoms.entity.SymptomEntity;
import ru.productallergen.userservice.symptoms.repository.SymptomRepository;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
class SymptomDbLoader {
    private final SymptomRepository symptomRepository;
    private final SymptomProvider symptomProvider;

    @PostConstruct
    public void loadDefaultSymptoms() {
        if (symptomRepository.count() > 0) {
            log.info("Symptoms exists");
            return;
        }
        log.info("Getting symptoms");
        List<SymptomEntity> symptoms = symptomProvider.getSymptoms();
        log.info("Saving symptoms");
        symptomRepository.saveAll(symptoms);
    }
}
