package com.agileict.modules.proceso.dto;

import com.agileict.shared.enums.EstadoProceso;
import com.agileict.shared.enums.NivelConfidencialidad;

import java.util.List;
import java.util.UUID;

public record ProcesoHeadhuntingResponse(
        UUID id,
        String titulo,
        String descripcion,
        EstadoProceso estado,
        NivelConfidencialidad nivelConfidencialidad,
        String nivelExperienciaMinimo,
        UUID empresaClienteId,
        UUID responsableRrhhId,
        List<PuestoTicResponse> puestos
) {
}
