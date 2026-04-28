package com.farmconnect.userservice.repository;

import com.farmconnect.userservice.entity.UserProfile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    Optional<UserProfile> findByEmail(String email);

    List<UserProfile> findAllByOrderByNameAsc();
}
