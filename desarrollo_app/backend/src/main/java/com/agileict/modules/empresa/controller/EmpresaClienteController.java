package com.agileict.modules.empresa.controller;

import com.agileict.modules.empresa.dto.EmpresaClienteResponse;
import com.agileict.modules.empresa.service.EmpresaClienteService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/empresas")
public class EmpresaClienteController {

    private final EmpresaClienteService empresaClienteService;

    public EmpresaClienteController(EmpresaClienteService empresaClienteService) {
        this.empresaClienteService = empresaClienteService;
    }

    @GetMapping
    public List<EmpresaClienteResponse> findAll() {
        return empresaClienteService.findAll();
    }
}
