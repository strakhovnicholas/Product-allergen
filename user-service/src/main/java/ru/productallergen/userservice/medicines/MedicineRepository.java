package ru.productallergen.userservice.medicines;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<MedicineEntity, Long> {
    List<MedicineEntity> findAll();
}
