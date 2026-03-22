package ru.productallergen.userservice.symptoms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.productallergen.userservice.symptoms.entity.SymptomEntity;

import java.util.List;
import java.util.UUID;

@Repository
public interface SymptomRepository extends JpaRepository<SymptomEntity, Long> {
    List<SymptomEntity> findAllByUserId(UUID userId);
}