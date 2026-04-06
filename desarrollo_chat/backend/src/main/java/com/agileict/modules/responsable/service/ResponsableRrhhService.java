package com.agileict.modules.responsable.service;

import com.agileict.common.exception.ResourceNotFoundException;
import com.agileict.common.util.SecurityUtils;
import com.agileict.modules.responsable.dto.ResponsableRrhhResponse;
import com.agileict.modules.responsable.entity.ResponsableRrhh;
import com.agileict.modules.responsable.repository.ResponsableRrhhRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ResponsableRrhhService {

    private final ResponsableRrhhRepository responsableRrhhRepository;

    public ResponsableRrhhService(ResponsableRrhhRepository responsableRrhhRepository) {
        this.responsableRrhhRepository = responsableRrhhRepository;
    }

    @Transactional(readOnly = true)
    public ResponsableRrhhResponse me() {
        String email = SecurityUtils.currentUserEmail();
        ResponsableRrhh responsable = responsableRrhhRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No existe el responsable RRHH autenticado."));

        return new ResponsableRrhhResponse(
                responsable.getId(),
                responsable.getNombre(),
                responsable.getApellidos(),
                responsable.getEmail(),
                responsable.getCargo(),
                responsable.getEmpresaCliente().getId(),
            responsable.getEmpresaCliente().getNombre(),
            responsable.getEmpresaCliente().getSector()
        );
    }
}
