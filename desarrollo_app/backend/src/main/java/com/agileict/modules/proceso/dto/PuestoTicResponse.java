package com.agileict.modules.proceso.dto;

import com.agileict.shared.enums.AreaNegocioProfesional;
import com.agileict.shared.enums.SenioridadPuesto;

import java.util.UUID;

public record PuestoTicResponse(
        UUID id,
        String titulo,
        SenioridadPuesto senioridad,
        String modalidad,
        String ubicacion,
        String area,
        String descripcion,
        String tecnologiasRequeridas,
        String tipoContrato,
        AreaNegocioProfesional sectorRequerido
) {
}
