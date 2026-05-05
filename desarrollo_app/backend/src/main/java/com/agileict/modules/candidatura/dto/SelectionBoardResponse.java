package com.agileict.modules.candidatura.dto;

import com.agileict.modules.proceso.dto.PuestoTicResponse;

import java.util.List;
import java.util.UUID;

public record SelectionBoardResponse(
        UUID procesoId,
        String procesoTitulo,
        List<PuestoTicResponse> puestos,
        List<ListaCandidatosResponse> candidatosSugeridos,
        List<ListaCandidatosResponse> profesionalesDisponibles,
        List<ListaCandidatosResponse> candidatos,
        List<ListaCandidatosResponse> solicitudesVisibilidad
) {
}
