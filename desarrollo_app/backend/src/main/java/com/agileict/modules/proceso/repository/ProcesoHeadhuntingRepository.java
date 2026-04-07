package com.agileict.modules.proceso.repository;

import com.agileict.modules.proceso.entity.ProcesoHeadhunting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProcesoHeadhuntingRepository extends JpaRepository<ProcesoHeadhunting, UUID> {
    List<ProcesoHeadhunting> findByEmpresaClienteId(UUID empresaClienteId);
}
