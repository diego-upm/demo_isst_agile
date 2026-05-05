package com.agileict.modules.suscripcion.dto;

import com.agileict.shared.enums.EstadoSuscripcion;
import com.agileict.shared.enums.PlanSuscripcion;

import java.time.LocalDate;
import java.util.UUID;

public record SuscripcionResponse(
        UUID id,
        PlanSuscripcion plan,
        EstadoSuscripcion estado,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        UUID empresaClienteId
) {
}
