package com.agileict.modules.proceso.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agileict.common.exception.BusinessException;
import com.agileict.common.exception.ResourceNotFoundException;
import com.agileict.common.util.SecurityUtils;
import com.agileict.modules.empresa.entity.EmpresaCliente;
import com.agileict.modules.empresa.repository.EmpresaClienteRepository;
import com.agileict.modules.proceso.dto.CreateProcesoRequest;
import com.agileict.modules.proceso.dto.CreateProcesoWithSuggestionsResponse;
import com.agileict.modules.proceso.dto.ProcesoHeadhuntingResponse;
import com.agileict.modules.proceso.dto.PuestoTicResponse;
import com.agileict.modules.proceso.entity.ProcesoHeadhunting;
import com.agileict.modules.proceso.repository.ProcesoHeadhuntingRepository;
import com.agileict.modules.puesto.entity.PuestoTIC;
import com.agileict.modules.responsable.entity.ResponsableRrhh;
import com.agileict.modules.responsable.repository.ResponsableRrhhRepository;

@Service
public class ProcesoHeadhuntingService {

    private final ProcesoHeadhuntingRepository procesoHeadhuntingRepository;
    private final EmpresaClienteRepository empresaClienteRepository;
    private final ResponsableRrhhRepository responsableRrhhRepository;
    private final CandidatosSugeridosService candidatosSugeridosService;

    public ProcesoHeadhuntingService(ProcesoHeadhuntingRepository procesoHeadhuntingRepository,
                                     EmpresaClienteRepository empresaClienteRepository,
                                     ResponsableRrhhRepository responsableRrhhRepository,
                                     CandidatosSugeridosService candidatosSugeridosService) {
        this.procesoHeadhuntingRepository = procesoHeadhuntingRepository;
        this.empresaClienteRepository = empresaClienteRepository;
        this.responsableRrhhRepository = responsableRrhhRepository;
        this.candidatosSugeridosService = candidatosSugeridosService;
    }

    @Transactional(readOnly = true)
    public List<ProcesoHeadhuntingResponse> findAll() {
        if (!SecurityUtils.currentUserHasRole("ROLE_ADMIN")) {
            String email = SecurityUtils.currentUserEmail();
            ResponsableRrhh responsable = responsableRrhhRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("No tienes permisos para consultar procesos."));

            return procesoHeadhuntingRepository.findByEmpresaClienteId(responsable.getEmpresaCliente().getId())
                .stream()
                .map(this::toResponse)
                .toList();
        }

        return procesoHeadhuntingRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProcesoHeadhuntingResponse> findByEmpresa(UUID empresaClienteId) {
        ensureCanAccessEmpresa(empresaClienteId, "No tienes permisos para consultar procesos de esta empresa.");

        return procesoHeadhuntingRepository.findByEmpresaClienteId(empresaClienteId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CreateProcesoWithSuggestionsResponse create(CreateProcesoRequest request) {
        EmpresaCliente empresa = empresaClienteRepository.findById(request.empresaClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("No existe la empresa cliente indicada."));

        ResponsableRrhh responsable = responsableRrhhRepository.findById(request.responsableRrhhId())
                .orElseThrow(() -> new ResourceNotFoundException("No existe el responsable RRHH indicado."));

        if (!responsable.getEmpresaCliente().getId().equals(empresa.getId())) {
            throw new BusinessException("El responsable RRHH no pertenece a la empresa indicada.");
        }

        if (!SecurityUtils.currentUserHasRole("ROLE_ADMIN")) {
            String email = SecurityUtils.currentUserEmail();
            ResponsableRrhh currentResponsable = responsableRrhhRepository.findByEmail(email)
                    .orElseThrow(() -> new BusinessException("No tienes permisos para crear procesos."));

            if (!currentResponsable.getId().equals(responsable.getId())) {
                throw new BusinessException("No puedes crear procesos en nombre de otro responsable RRHH.");
            }
        }

        ProcesoHeadhunting proceso = new ProcesoHeadhunting();
        proceso.setEmpresaCliente(empresa);
        proceso.setResponsableRrhh(responsable);
        proceso.setTitulo(request.titulo());
        proceso.setDescripcion(request.descripcion());
        proceso.setNivelConfidencialidad(request.nivelConfidencialidad());
        proceso.setNivelExperienciaMinimo(request.nivelExperienciaMinimo());

        if (request.puestos() != null) {
            request.puestos().forEach(p -> {
                PuestoTIC puesto = new PuestoTIC();
                puesto.setTitulo(p.titulo());
                puesto.setSenioridad(p.senioridad());
                puesto.setModalidad(p.modalidad());
                puesto.setUbicacion(p.ubicacion());
                puesto.setArea(p.area());
                puesto.setDescripcion(p.descripcion());
                puesto.setTecnologiasRequeridas(p.tecnologiasRequeridas());
                puesto.setTipoContrato(p.tipoContrato());
                puesto.setSectorRequerido(p.sectorRequerido());
                proceso.addPuesto(puesto);
            });
        }

        ProcesoHeadhunting saved = procesoHeadhuntingRepository.save(proceso);
        var sugeridos = candidatosSugeridosService.getSuggestionsByPuesto(saved);

        return new CreateProcesoWithSuggestionsResponse(toResponse(saved), sugeridos);
    }

    @Transactional
    public void delete(UUID procesoId) {
        ProcesoHeadhunting proceso = procesoHeadhuntingRepository.findById(procesoId)
                .orElseThrow(() -> new ResourceNotFoundException("No existe el proceso indicado."));

        if (!SecurityUtils.currentUserHasRole("ROLE_ADMIN")) {
            String email = SecurityUtils.currentUserEmail();
            ResponsableRrhh responsable = responsableRrhhRepository.findByEmail(email)
                    .orElseThrow(() -> new BusinessException("No tienes permisos para eliminar este proceso."));

            UUID empresaResponsable = responsable.getEmpresaCliente().getId();
            UUID empresaProceso = proceso.getEmpresaCliente().getId();

            if (!empresaResponsable.equals(empresaProceso)) {
                throw new BusinessException("No tienes permisos para eliminar este proceso.");
            }
        }

        procesoHeadhuntingRepository.delete(proceso);
    }

    private void ensureCanAccessEmpresa(UUID empresaClienteId, String errorMessage) {
        if (SecurityUtils.currentUserHasRole("ROLE_ADMIN")) {
            return;
        }

        String email = SecurityUtils.currentUserEmail();
        ResponsableRrhh responsable = responsableRrhhRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(errorMessage));

        if (!responsable.getEmpresaCliente().getId().equals(empresaClienteId)) {
            throw new BusinessException(errorMessage);
        }
    }

    private ProcesoHeadhuntingResponse toResponse(ProcesoHeadhunting proceso) {
        return new ProcesoHeadhuntingResponse(
                proceso.getId(),
                proceso.getTitulo(),
                proceso.getDescripcion(),
                proceso.getEstado(),
                proceso.getNivelConfidencialidad(),
                proceso.getNivelExperienciaMinimo(),
                proceso.getEmpresaCliente().getId(),
                proceso.getResponsableRrhh().getId(),
                proceso.getPuestos().stream()
                        .map(puesto -> new PuestoTicResponse(
                                puesto.getId(),
                                puesto.getTitulo(),
                                puesto.getSenioridad(),
                                puesto.getModalidad(),
                                puesto.getUbicacion(),
                                puesto.getArea(),
                                puesto.getDescripcion(),
                                puesto.getTecnologiasRequeridas(),
                                puesto.getTipoContrato(),
                                puesto.getSectorRequerido()
                        ))
                        .toList()
        );
    }
}
