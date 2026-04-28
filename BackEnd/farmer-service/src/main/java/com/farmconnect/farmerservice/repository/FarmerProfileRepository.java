package com.farmconnect.farmerservice.repository;

import com.farmconnect.farmerservice.entity.FarmerProfile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FarmerProfileRepository extends JpaRepository<FarmerProfile, Long> {

    Optional<FarmerProfile> findByEmail(String email);

    List<FarmerProfile> findAllByOrderByFarmNameAsc();
}
