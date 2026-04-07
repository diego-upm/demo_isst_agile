package com.agileict.modules.suscripcion.service;

import com.agileict.common.util.SecurityUtils;
import com.agileict.modules.responsable.entity.ResponsableRrhh;
import com.agileict.modules.responsable.repository.ResponsableRrhhRepository;
import com.agileict.modules.suscripcion.dto.SuscripcionResponse;
import com.agileict.modules.suscripcion.repository.SuscripcionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SuscripcionService {

    private final SuscripcionRepository suscripcionRepository;
    private final ResponsableRrhhRepository responsableRrhhRepository;

    public SuscripcionService(SuscripcionRepository suscripcionRepository,
                              ResponsableRrhhRepository responsableRrhhRepository) {
        this.suscripcionRepository = suscripcionRepository;
        this.responsableRrhhRepository = responsableRrhhRepository;
    }

    public List<SuscripcionResponse> myCompanySubscriptions() {
        ResponsableRrhh responsable = responsableRrhhRepository.findByEmail(SecurityUtils.currentUserEmail())
                .orElseThrow();

        return suscripcionRepository.findByEmpresaClienteId(responsable.getEmpresaCliente().getId())
                .stream()
                .map(s -> new SuscripcionResponse(
                        s.getId(),
                        s.getPlan(),
                        s.getEstado(),
                        s.getFechaInicio(),
                        s.getFechaFin(),
                        s.getEmpresaCliente().getId()
                ))
                .toList();
    }
}
