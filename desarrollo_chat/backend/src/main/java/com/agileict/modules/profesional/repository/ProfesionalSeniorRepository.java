package com.agileict.modules.profesional.repository;

import com.agileict.modules.profesional.entity.ProfesionalSenior;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfesionalSeniorRepository extends JpaRepository<ProfesionalSenior, UUID> {
    Optional<ProfesionalSenior> findByEmail(String email);
    List<ProfesionalSenior> findByActivoTrueAndPerfilVisibleTrue();
}
