package ru.productallergen.userservice.medicines.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.productallergen.userservice.medicines.entity.IntakeMedicineEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface IntakeMedicineRepository extends JpaRepository<IntakeMedicineEntity, Long> {
    List<IntakeMedicineEntity> findAllByUserIdAndIntakeDateBetween(UUID userId, LocalDateTime from, LocalDateTime to);
}