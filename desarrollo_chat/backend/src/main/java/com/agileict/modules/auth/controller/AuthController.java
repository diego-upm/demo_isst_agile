package com.agileict.modules.auth.controller;

import com.agileict.modules.auth.dto.AuthResponse;
import com.agileict.modules.auth.dto.CreateCompanyRequest;
import com.agileict.modules.auth.dto.LoginRequest;
import com.agileict.modules.auth.dto.RegisterCompanyRequest;
import com.agileict.modules.auth.dto.RegisterProfessionalRequest;
import com.agileict.modules.auth.dto.RegisterRrhhRequest;
import com.agileict.modules.empresa.dto.EmpresaClienteResponse;
import com.agileict.modules.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register-professional")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse registerProfessional(@Valid @RequestBody RegisterProfessionalRequest request) {
        return authService.registerProfessional(request);
    }

    @PostMapping("/register-company")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse registerCompany(@Valid @RequestBody RegisterCompanyRequest request) {
        return authService.registerCompany(request);
    }

    @GetMapping("/companies")
    public List<EmpresaClienteResponse> listCompanies() {
        return authService.listCompanies();
    }

    @PostMapping("/companies")
    @ResponseStatus(HttpStatus.CREATED)
    public EmpresaClienteResponse createCompany(@Valid @RequestBody CreateCompanyRequest request) {
        return authService.createCompany(request);
    }

    @PostMapping("/register-rrhh")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse registerRrhh(@Valid @RequestBody RegisterRrhhRequest request) {
        return authService.registerRrhh(request);
    }
}
