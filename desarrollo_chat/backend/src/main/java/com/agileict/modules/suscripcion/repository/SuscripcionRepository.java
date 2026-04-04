package com.agileict.modules.suscripcion.repository;

import com.agileict.modules.suscripcion.entity.Suscripcion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SuscripcionRepository extends JpaRepository<Suscripcion, UUID> {
    List<Suscripcion> findByEmpresaClienteId(UUID empresaClienteId);
}
