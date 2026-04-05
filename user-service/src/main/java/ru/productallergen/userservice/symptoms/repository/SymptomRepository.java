package ru.productallergen.userservice.symptoms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.productallergen.userservice.symptoms.entity.SymptomEntity;

import java.util.List;
import java.util.UUID;

@Repository
public interface SymptomRepository extends JpaRepository<SymptomEntity, Long> {
    @Query("SELECT s FROM SymptomEntity s WHERE s.userId = :userId OR s.userId IS NULL")
    List<SymptomEntity> findAllByUserIdOrNull(@Param("userId") UUID userId);
}