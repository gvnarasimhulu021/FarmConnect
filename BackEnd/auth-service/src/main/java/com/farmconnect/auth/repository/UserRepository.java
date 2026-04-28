package com.farmconnect.auth.repository;

import com.farmconnect.auth.entity.Role;
import com.farmconnect.auth.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByVerificationToken(String verificationToken);

    boolean existsByEmail(String email);

    List<User> findAllByOrderByIdAsc();

    List<User> findAllByEnabledTrueOrderByIdAsc();

    long countByRole(Role role);

    long countByEnabledTrue();

    long countByRoleAndEnabledTrue(Role role);
}
