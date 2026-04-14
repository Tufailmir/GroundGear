package com.groundgear.controller;

import com.groundgear.model.BorrowRequest;
import com.groundgear.service.BorrowService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/borrow")
public class BorrowController {

    private final BorrowService borrowService;

    public BorrowController(BorrowService borrowService) {
        this.borrowService = borrowService;
    }

    @PostMapping("/request/{equipmentId}")
    public ResponseEntity<?> requestBorrow(@PathVariable Long equipmentId,
                                           @RequestBody Map<String, String> body,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        try {
            BorrowRequest request = borrowService.createRequest(
                    equipmentId,
                    userDetails.getUsername(),
                    body.get("aadhaarNumber"),
                    body.get("fullName"),
                    body.get("phoneNumber")
            );
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/approve/{requestId}")
    public ResponseEntity<?> approveRequest(@PathVariable Long requestId) {
        try {
            BorrowRequest request = borrowService.approveRequest(requestId);
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/return/{requestId}")
    public ResponseEntity<?> returnEquipment(@PathVariable Long requestId) {
        try {
            BorrowRequest request = borrowService.returnEquipment(requestId);
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<BorrowRequest>> getAllRequests() {
        return ResponseEntity.ok(borrowService.getAllRequests());
    }

    @GetMapping("/my")
    public ResponseEntity<List<BorrowRequest>> getMyRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(borrowService.getUserRequests(userDetails.getUsername()));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<BorrowRequest>> getPendingRequests() {
        return ResponseEntity.ok(borrowService.getPendingRequests());
    }
}