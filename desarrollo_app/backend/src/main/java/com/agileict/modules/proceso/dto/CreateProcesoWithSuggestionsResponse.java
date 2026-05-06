package com.agileict.modules.proceso.dto;

import com.agileict.modules.candidatura.dto.ListaCandidatosResponse;

import java.util.List;

public record CreateProcesoWithSuggestionsResponse(
        ProcesoHeadhuntingResponse proceso,
        List<ListaCandidatosResponse> candidatosSugeridos
) {
}
