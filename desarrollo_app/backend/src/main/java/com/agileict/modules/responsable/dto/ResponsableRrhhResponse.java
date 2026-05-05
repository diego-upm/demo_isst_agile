package com.agileict.modules.responsable.dto;

import java.util.UUID;

public record ResponsableRrhhResponse(
        UUID id,
        String nombre,
        String apellidos,
        String email,
        UUID empresaClienteId,
        String empresaClienteNombre,
        String empresaClienteSector
) {
}
