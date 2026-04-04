package com.agileict.modules.empresa.repository;

import com.agileict.modules.empresa.entity.EmpresaCliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EmpresaClienteRepository extends JpaRepository<EmpresaCliente, UUID> {
    boolean existsByCif(String cif);
}
