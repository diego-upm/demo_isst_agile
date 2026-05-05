package com.agileict.modules.profesional.controller;

import com.agileict.modules.profesional.dto.ProfesionalSeniorResponse;
import com.agileict.modules.profesional.dto.UpdateProfesionalSeniorMeRequest;
import com.agileict.modules.profesional.service.ProfesionalSeniorService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/profesionales")
public class ProfesionalSeniorController {

    private final ProfesionalSeniorService profesionalSeniorService;

    public ProfesionalSeniorController(ProfesionalSeniorService profesionalSeniorService) {
        this.profesionalSeniorService = profesionalSeniorService;
    }

    @GetMapping
    public List<ProfesionalSeniorResponse> findVisibleProfiles() {
        return profesionalSeniorService.findVisibleProfiles();
    }

    @GetMapping("/me")
    public ProfesionalSeniorResponse me() {
        return profesionalSeniorService.me();
    }

    @PutMapping("/me")
    public ProfesionalSeniorResponse updateMe(@Valid @RequestBody UpdateProfesionalSeniorMeRequest request) {
        return profesionalSeniorService.updateMe(request);
    }
}
