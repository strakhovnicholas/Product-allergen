package ru.productallergen.userservice.medicines.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.productallergen.userservice.medicines.entity.MedicineEntity;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicineRepository extends JpaRepository<MedicineEntity, Long> {
    List<MedicineEntity> findAllByUserId(UUID userId);
}
