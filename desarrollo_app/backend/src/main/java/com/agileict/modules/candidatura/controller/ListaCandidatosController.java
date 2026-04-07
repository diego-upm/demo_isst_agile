package com.agileict.modules.candidatura.controller;

import com.agileict.modules.candidatura.dto.CambiarEstadoCandidaturaRequest;
import com.agileict.modules.candidatura.dto.CambiarSolicitudVisibilidadRequest;
import com.agileict.modules.candidatura.dto.CrearCandidaturaRequest;
import com.agileict.modules.candidatura.dto.ListaCandidatosResponse;
import com.agileict.modules.candidatura.dto.SelectionBoardResponse;
import com.agileict.modules.candidatura.service.ListaCandidatosService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class ListaCandidatosController {

    private final ListaCandidatosService listaCandidatosService;

    public ListaCandidatosController(ListaCandidatosService listaCandidatosService) {
        this.listaCandidatosService = listaCandidatosService;
    }

    @GetMapping("/procesos/{procesoId}/candidatos")
    public SelectionBoardResponse getBoard(@PathVariable UUID procesoId,
                                           @RequestParam(required = false) String search) {
        return listaCandidatosService.getBoard(procesoId, search);
    }

    @PostMapping("/procesos/{procesoId}/candidatos")
    public ListaCandidatosResponse addCandidate(@PathVariable UUID procesoId,
                                                 @Valid @RequestBody CrearCandidaturaRequest request) {
        return listaCandidatosService.addCandidate(procesoId, request);
    }

    @PutMapping("/procesos/{procesoId}/candidatos/{candidaturaId}/solicitud-visibilidad")
    public ListaCandidatosResponse requestVisibility(@PathVariable UUID procesoId,
                                                     @PathVariable UUID candidaturaId) {
        return listaCandidatosService.requestVisibility(procesoId, candidaturaId);
    }

    @DeleteMapping("/procesos/{procesoId}/candidatos/{candidaturaId}")
    public void deleteCandidate(@PathVariable UUID procesoId,
                                @PathVariable UUID candidaturaId) {
        listaCandidatosService.deleteCandidate(procesoId, candidaturaId);
    }

    @GetMapping("/profesionales/me/candidaturas")
    public List<ListaCandidatosResponse> myCandidatures() {
        return listaCandidatosService.findMyCandidatures();
    }

    @GetMapping("/profesionales/me/solicitudes-visibilidad")
    public List<ListaCandidatosResponse> myPendingVisibilityRequests() {
        return listaCandidatosService.findMyPendingVisibilityRequests();
    }

    @PutMapping("/profesionales/me/candidaturas/{candidaturaId}/estado")
    public ListaCandidatosResponse updateMyCandidateState(@PathVariable UUID candidaturaId,
                                                          @Valid @RequestBody CambiarEstadoCandidaturaRequest request) {
        return listaCandidatosService.updateMyCandidateState(candidaturaId, request);
    }

    @PutMapping("/profesionales/me/candidaturas/{candidaturaId}/solicitud-visibilidad")
    public ListaCandidatosResponse updateMyVisibilityRequest(@PathVariable UUID candidaturaId,
                                                             @Valid @RequestBody CambiarSolicitudVisibilidadRequest request) {
        return listaCandidatosService.updateMyVisibilityRequest(candidaturaId, request);
    }

    @PutMapping("/profesionales/me/candidaturas/{candidaturaId}/solicitud-visibilidad/aceptar")
    public ListaCandidatosResponse acceptMyVisibilityRequest(@PathVariable UUID candidaturaId) {
        return listaCandidatosService.acceptMyVisibilityRequest(candidaturaId);
    }

    @PutMapping("/profesionales/me/candidaturas/{candidaturaId}/solicitud-visibilidad/rechazar")
    public ListaCandidatosResponse rejectMyVisibilityRequest(@PathVariable UUID candidaturaId) {
        return listaCandidatosService.rejectMyVisibilityRequest(candidaturaId);
    }
}