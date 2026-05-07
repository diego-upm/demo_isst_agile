package com.agileict.modules.proceso.dto;

import com.agileict.modules.candidatura.dto.ListaCandidatosResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record CreateProcesoWithSuggestionsResponse(
        ProcesoHeadhuntingResponse proceso,
        Map<UUID, List<ListaCandidatosResponse>> candidatosSugeridosPorPuesto
) {
}
