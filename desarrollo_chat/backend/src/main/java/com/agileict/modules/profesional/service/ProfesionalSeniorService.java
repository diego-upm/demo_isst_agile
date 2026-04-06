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
        profesional.setTitulacionesAcademicas(request.titulacionesAcademicas() == null ? null : request.titulacionesAcademicas().trim());
        profesional.setIdiomas(request.idiomas() == null ? null : request.idiomas().trim());
        profesional.setSoftSkills(request.softSkills() == null ? null : request.softSkills().trim());
        profesional.setAniosExperiencia(request.aniosExperiencia());
        profesional.setRangoSalarialEsperadoMin(request.rangoSalarialEsperadoMin());
        profesional.setRangoSalarialEsperadoMax(request.rangoSalarialEsperadoMax());
        profesional.setDescripcionPersonal(request.descripcionPersonal() == null ? null : request.descripcionPersonal().trim());
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
                profesional.getTitulacionesAcademicas(),
                profesional.getIdiomas(),
                profesional.getSoftSkills(),
                profesional.getAniosExperiencia(),
                profesional.getRangoSalarialEsperadoMin(),
                profesional.getRangoSalarialEsperadoMax(),
                profesional.getDescripcionPersonal(),
                profesional.getDisponibilidad(),
                profesional.isPerfilVisible(),
                profesional.isActivo()
        );
    }
}
