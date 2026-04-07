package com.agileict.modules.candidatura.dto;

import java.util.List;
import java.util.UUID;

public record SelectionBoardResponse(
        UUID procesoId,
        String procesoTitulo,
        List<ListaCandidatosResponse> profesionalesDisponibles,
        List<ListaCandidatosResponse> candidatos,
        List<ListaCandidatosResponse> solicitudesVisibilidad
) {
}