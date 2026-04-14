package com.groundgear.repository;

import com.groundgear.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByAvailable(boolean available);
    List<Equipment> findByCategory(String category);
}
