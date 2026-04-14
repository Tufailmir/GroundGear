package com.groundgear.repository;

import com.groundgear.model.BorrowRequest;
import com.groundgear.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Long> {
    List<BorrowRequest> findByUser(User user);
    List<BorrowRequest> findByStatus(String status);
}