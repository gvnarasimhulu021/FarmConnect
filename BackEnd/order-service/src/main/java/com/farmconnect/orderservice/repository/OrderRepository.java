package com.farmconnect.orderservice.repository;

import com.farmconnect.orderservice.entity.Order;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByIdDesc(Long userId);

    List<Order> findDistinctByOrderItemsFarmerIdOrderByIdDesc(Long farmerId);

    List<Order> findAllByOrderByIdDesc();
}
