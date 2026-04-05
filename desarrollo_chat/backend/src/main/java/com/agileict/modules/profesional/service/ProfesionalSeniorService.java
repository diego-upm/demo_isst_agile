package com.agileict.modules.profesional.service;

import com.agileict.common.exception.ResourceNotFoundException;
import com.agileict.common.util.SecurityUtils;
import com.agileict.modules.profesional.dto.ProfesionalSeniorResponse;
import com.agileict.modules.profesional.dto.UpdateProfesionalSeniorMeRequest;
import com.agileict.modules.profesional.entity.ProfesionalSenior;
import com.agileict.modules.profesional.repository.ProfesionalSeniorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProfesionalSeniorService {

    private final ProfesionalSeniorRepository profesionalSeniorRepository;

    public ProfesionalSeniorService(ProfesionalSeniorRepository profesionalSeniorRepository) {
        this.profesionalSeniorRepository = profesionalSeniorRepository;
    }

    public List<ProfesionalSeniorResponse> findVisibleProfiles() {
        return profesionalSeniorRepository.findByActivoTrueAndPerfilVisibleTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ProfesionalSeniorResponse me() {
        String email = SecurityUtils.currentUserEmail();
        ProfesionalSenior profesional = profesionalSeniorRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No existe el profesional autenticado."));

        return toResponse(profesional);
    }

    @Transactional
    public ProfesionalSeniorResponse updateMe(UpdateProfesionalSeniorMeRequest request) {
        String email = SecurityUtils.currentUserEmail();
        ProfesionalSenior profesional = profesionalSeniorRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No existe el profesional autenticado."));

        profesional.setNombre(request.nombre().trim());
        profesional.setApellidos(request.apellidos().trim());
        profesional.setTecnologiasClave(request.tecnologiasClave() == null ? null : request.tecnologiasClave().trim());
        profesional.setAniosExperiencia(request.aniosExperiencia());
        profesional.setDisponibilidad(request.disponibilidad());
        profesional.setPerfilVisible(Boolean.TRUE.equals(request.perfilVisible()));

        return toResponse(profesional);
    }

    private ProfesionalSeniorResponse toResponse(ProfesionalSenior profesional) {
        return new ProfesionalSeniorResponse(
                profesional.getId(),
                profesional.getNombre(),
                profesional.getApellidos(),
                profesional.getEmail(),
                profesional.getTecnologiasClave(),
                profesional.getAniosExperiencia(),
                profesional.getDisponibilidad(),
                profesional.isPerfilVisible(),
                profesional.isActivo()
        );
    }
}
