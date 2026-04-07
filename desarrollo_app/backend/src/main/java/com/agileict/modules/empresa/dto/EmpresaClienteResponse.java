package com.agileict.modules.empresa.dto;

import java.util.UUID;

public record EmpresaClienteResponse(
        UUID id,
        String nombre,
        String cif,
        String sector,
        boolean activa
) {
}
