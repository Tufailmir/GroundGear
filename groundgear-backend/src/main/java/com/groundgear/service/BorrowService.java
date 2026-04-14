package com.groundgear.service;

import com.groundgear.model.BorrowRequest;
import com.groundgear.model.Equipment;
import com.groundgear.model.User;
import com.groundgear.repository.BorrowRequestRepository;
import com.groundgear.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BorrowService {

    private final BorrowRequestRepository borrowRequestRepository;
    private final EquipmentService equipmentService;
    private final UserRepository userRepository;

    public BorrowService(BorrowRequestRepository borrowRequestRepository,
                         EquipmentService equipmentService,
                         UserRepository userRepository) {
        this.borrowRequestRepository = borrowRequestRepository;
        this.equipmentService = equipmentService;
        this.userRepository = userRepository;
    }

    public BorrowRequest createRequest(Long equipmentId, String username,
                                        String aadhaarNumber, String fullName,
                                        String phoneNumber) {
        Equipment equipment = equipmentService.getEquipmentById(equipmentId);
        if (equipment.getAvailableQuantity() <= 0) {
            throw new RuntimeException("Equipment is not available");
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BorrowRequest request = new BorrowRequest(
                user, equipment, LocalDateTime.now(),
                "PENDING", aadhaarNumber, fullName, phoneNumber
        );

        equipment.setAvailableQuantity(equipment.getAvailableQuantity() - 1);
        if (equipment.getAvailableQuantity() == 0) {
            equipment.setAvailable(false);
        }
        equipmentService.saveEquipment(equipment);
        return borrowRequestRepository.save(request);
    }

    public BorrowRequest approveRequest(Long requestId) {
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus("APPROVED");
        return borrowRequestRepository.save(request);
    }

    public BorrowRequest returnEquipment(Long requestId) {
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus("RETURNED");
        request.setReturnTime(LocalDateTime.now());
        Equipment equipment = request.getEquipment();
        equipment.setAvailableQuantity(equipment.getAvailableQuantity() + 1);
        equipment.setAvailable(true);
        equipmentService.saveEquipment(equipment);
        return borrowRequestRepository.save(request);
    }

    public List<BorrowRequest> getAllRequests() {
        return borrowRequestRepository.findAll();
    }

    public List<BorrowRequest> getUserRequests(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return borrowRequestRepository.findByUser(user);
    }

    public List<BorrowRequest> getPendingRequests() {
        return borrowRequestRepository.findByStatus("PENDING");
    }
}