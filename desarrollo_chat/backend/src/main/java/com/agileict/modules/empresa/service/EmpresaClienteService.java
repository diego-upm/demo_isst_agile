package com.agileict.modules.empresa.service;

import com.agileict.modules.empresa.dto.EmpresaClienteResponse;
import com.agileict.modules.empresa.repository.EmpresaClienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmpresaClienteService {

    private final EmpresaClienteRepository empresaClienteRepository;

    public EmpresaClienteService(EmpresaClienteRepository empresaClienteRepository) {
        this.empresaClienteRepository = empresaClienteRepository;
    }

    public List<EmpresaClienteResponse> findAll() {
        return empresaClienteRepository.findAll()
                .stream()
                .map(empresa -> new EmpresaClienteResponse(
                        empresa.getId(),
                        empresa.getNombre(),
                        empresa.getCif(),
                        empresa.getSector(),
                        empresa.isActiva()
                ))
                .toList();
    }
}
