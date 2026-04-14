package com.groundgear.service;

import com.groundgear.model.Equipment;
import com.groundgear.repository.EquipmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    public EquipmentService(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    public List<Equipment> getAvailableEquipment() {
        return equipmentRepository.findByAvailable(true);
    }

    public List<Equipment> getEquipmentByCategory(String category) {
        return equipmentRepository.findByCategory(category);
    }

    public Equipment addEquipment(Equipment equipment) {
        equipment.setAvailable(true);
        equipment.setAvailableQuantity(equipment.getTotalQuantity());
        return equipmentRepository.save(equipment);
    }

    public Equipment getEquipmentById(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
    }

    public void deleteEquipment(Long id) {
        equipmentRepository.deleteById(id);
    }

    public Equipment saveEquipment(Equipment equipment) {
        return equipmentRepository.save(equipment);
    }

    public Equipment updateEquipment(Long id, Equipment updated) {
        Equipment existing = getEquipmentById(id);
        existing.setName(updated.getName());
        existing.setCategory(updated.getCategory());
        existing.setDescription(updated.getDescription());
        existing.setAvailable(updated.isAvailable());
        existing.setEmoji(updated.getEmoji());
        existing.setDepositAmount(updated.getDepositAmount());
        existing.setTotalQuantity(updated.getTotalQuantity());
        existing.setAvailableQuantity(updated.getAvailableQuantity());
        return equipmentRepository.save(existing);
    }
}