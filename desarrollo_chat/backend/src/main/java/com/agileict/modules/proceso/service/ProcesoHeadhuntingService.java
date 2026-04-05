package com.agileict.modules.proceso.service;

import com.agileict.common.exception.ResourceNotFoundException;
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
        proceso.setTecnologiasRequeridas(request.tecnologiasRequeridas());
        proceso.setNivelExperienciaMinimo(request.nivelExperienciaMinimo());
        proceso.setTipoContrato(request.tipoContrato());
        proceso.setRangoSalarialMinimo(request.rangoSalarialMinimo());
        proceso.setRangoSalarialMaximo(request.rangoSalarialMaximo());

        if (request.puestos() != null) {
            request.puestos().forEach(p -> {
                PuestoTIC puesto = new PuestoTIC();
                puesto.setTitulo(p.titulo());
                puesto.setSenioridad(p.senioridad());
                puesto.setModalidad(p.modalidad());
                puesto.setUbicacion(p.ubicacion());
                puesto.setArea(p.area());
                puesto.setDescripcion(p.descripcion());
                proceso.addPuesto(puesto);
            });
        }

        return toResponse(procesoHeadhuntingRepository.save(proceso));
    }

    private ProcesoHeadhuntingResponse toResponse(ProcesoHeadhunting proceso) {
        return new ProcesoHeadhuntingResponse(
                proceso.getId(),
                proceso.getTitulo(),
                proceso.getDescripcion(),
                proceso.getEstado(),
                proceso.getNivelConfidencialidad(),
                proceso.getTecnologiasRequeridas(),
                proceso.getNivelExperienciaMinimo(),
                proceso.getTipoContrato(),
                proceso.getRangoSalarialMinimo(),
                proceso.getRangoSalarialMaximo(),
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
                                puesto.getDescripcion()
                        ))
                        .toList()
        );
    }
}
