package com.agileict.modules.proceso.service;

import com.agileict.common.exception.BusinessException;
import com.agileict.common.exception.ResourceNotFoundException;
import com.agileict.common.util.SecurityUtils;
import com.agileict.modules.empresa.entity.EmpresaCliente;
import com.agileict.modules.empresa.repository.EmpresaClienteRepository;
import com.agileict.modules.proceso.dto.CreateProcesoRequest;
import com.agileict.modules.proceso.dto.ProcesoHeadhuntingResponse;
import com.agileict.modules.proceso.dto.PuestoTicResponse;
import com.agileict.modules.proceso.entity.ProcesoHeadhunting;
import com.agileict.modules.proceso.repository.ProcesoHeadhuntingRepository;
import com.agileict.modules.puesto.entity.PuestoTIC;
import com.agileict.modules.responsable.entity.ResponsableRrhh;
import com.agileict.modules.responsable.repository.ResponsableRrhhRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ProcesoHeadhuntingService {

    private final ProcesoHeadhuntingRepository procesoHeadhuntingRepository;
    private final EmpresaClienteRepository empresaClienteRepository;
    private final ResponsableRrhhRepository responsableRrhhRepository;

    public ProcesoHeadhuntingService(ProcesoHeadhuntingRepository procesoHeadhuntingRepository,
                                     EmpresaClienteRepository empresaClienteRepository,
                                     ResponsableRrhhRepository responsableRrhhRepository) {
        this.procesoHeadhuntingRepository = procesoHeadhuntingRepository;
        this.empresaClienteRepository = empresaClienteRepository;
        this.responsableRrhhRepository = responsableRrhhRepository;
    }

    @Transactional(readOnly = true)
    public List<ProcesoHeadhuntingResponse> findAll() {
        return procesoHeadhuntingRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProcesoHeadhuntingResponse> findByEmpresa(UUID empresaClienteId) {
        return procesoHeadhuntingRepository.findByEmpresaClienteId(empresaClienteId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ProcesoHeadhuntingResponse create(CreateProcesoRequest request) {
        EmpresaCliente empresa = empresaClienteRepository.findById(request.empresaClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("No existe la empresa cliente indicada."));

        ResponsableRrhh responsable = responsableRrhhRepository.findById(request.responsableRrhhId())
                .orElseThrow(() -> new ResourceNotFoundException("No existe el responsable RRHH indicado."));

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

        return toResponse(procesoHeadhuntingRepository.save(proceso));
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
