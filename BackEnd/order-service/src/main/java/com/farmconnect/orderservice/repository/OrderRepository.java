package com.farmconnect.orderservice.repository;

import com.farmconnect.orderservice.entity.Order;
import java.util.Optional;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByIdDesc(Long userId);

    List<Order> findDistinctByOrderItemsFarmerIdOrderByIdDesc(Long farmerId);

    List<Order> findAllByOrderByIdDesc();

    Page<Order> findByUserIdOrderByIdDesc(Long userId, Pageable pageable);

    Page<Order> findDistinctByOrderItemsFarmerIdOrderByIdDesc(Long farmerId, Pageable pageable);

    Page<Order> findAllByOrderByIdDesc(Pageable pageable);

    Optional<Order> findByRazorpayOrderId(String razorpayOrderId);
}
