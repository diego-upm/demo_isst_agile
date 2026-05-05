package com.agileict.modules.responsable.repository;

import com.agileict.modules.responsable.entity.ResponsableRrhh;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ResponsableRrhhRepository extends JpaRepository<ResponsableRrhh, UUID> {
    Optional<ResponsableRrhh> findByEmail(String email);
}
