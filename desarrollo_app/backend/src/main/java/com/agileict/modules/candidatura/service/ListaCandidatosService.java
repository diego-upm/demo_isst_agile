package com.agileict.modules.candidatura.service;

import com.agileict.common.exception.BusinessException;
import com.agileict.common.exception.ResourceNotFoundException;
import com.agileict.common.util.SecurityUtils;
import com.agileict.modules.candidatura.dto.CambiarEstadoCandidaturaRequest;
import com.agileict.modules.candidatura.dto.CambiarSolicitudVisibilidadRequest;
import com.agileict.modules.candidatura.dto.CrearCandidaturaRequest;
import com.agileict.modules.candidatura.dto.ListaCandidatosResponse;
import com.agileict.modules.candidatura.dto.SelectionBoardResponse;
import com.agileict.modules.candidatura.entity.ListaCandidatos;
import com.agileict.modules.candidatura.repository.ListaCandidatosRepository;
import com.agileict.modules.proceso.dto.PuestoTicResponse;
import com.agileict.modules.proceso.entity.ProcesoHeadhunting;
import com.agileict.modules.proceso.repository.ProcesoHeadhuntingRepository;
import com.agileict.modules.proceso.service.CandidatosSugeridosService;
import com.agileict.modules.profesional.entity.ProfesionalSenior;
import com.agileict.modules.profesional.repository.ProfesionalSeniorRepository;
import com.agileict.modules.puesto.entity.PuestoTIC;
import com.agileict.modules.responsable.entity.ResponsableRrhh;
import com.agileict.modules.responsable.repository.ResponsableRrhhRepository;
import com.agileict.shared.enums.EstadoListaCandidato;
import com.agileict.shared.enums.EstadoSolicitudVisibilidad;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ListaCandidatosService {

    private final ListaCandidatosRepository listaCandidatosRepository;
    private final ProcesoHeadhuntingRepository procesoHeadhuntingRepository;
    private final ResponsableRrhhRepository responsableRrhhRepository;
    private final ProfesionalSeniorRepository profesionalSeniorRepository;
    private final CandidatosSugeridosService candidatosSugeridosService;

    public ListaCandidatosService(ListaCandidatosRepository listaCandidatosRepository,
                                  ProcesoHeadhuntingRepository procesoHeadhuntingRepository,
                                  ResponsableRrhhRepository responsableRrhhRepository,
                                  ProfesionalSeniorRepository profesionalSeniorRepository,
                                  CandidatosSugeridosService candidatosSugeridosService) {
        this.listaCandidatosRepository = listaCandidatosRepository;
        this.procesoHeadhuntingRepository = procesoHeadhuntingRepository;
        this.responsableRrhhRepository = responsableRrhhRepository;
        this.profesionalSeniorRepository = profesionalSeniorRepository;
        this.candidatosSugeridosService = candidatosSugeridosService;
    }

    @Transactional(readOnly = true)
    public SelectionBoardResponse getBoard(UUID procesoId, String search) {
        ProcesoHeadhunting proceso = findAccessibleProceso(procesoId);
        String normalizedSearch = normalizeSearch(search);

        List<ListaCandidatos> candidaturas = listaCandidatosRepository.findByProcesoId(procesoId);
        Map<UUID, ListaCandidatos> candidaturasPorProfesional = candidaturas.stream()
                .collect(Collectors.toMap(candidatura -> candidatura.getProfesional().getId(), Function.identity()));

        List<ListaCandidatosResponse> candidatos = candidaturas.stream()
                .sorted(Comparator.comparing(ListaCandidatos::getFechaInclusion).reversed())
                .map(this::toResponse)
                .toList();

        List<ListaCandidatosResponse> solicitudesVisibilidad = candidaturas.stream()
                .filter(candidatura -> candidatura.getSolicitudVisibilidad() != EstadoSolicitudVisibilidad.NO_SOLICITADO)
                .sorted(Comparator.comparing(ListaCandidatos::getFechaActualizacion).reversed())
                .map(this::toResponse)
                .toList();

        // candidatosSugeridos: always the top matches, excluding already added candidates
        List<ListaCandidatosResponse> sugeridos = candidatosSugeridosService.getSuggestions(proceso)
                .stream()
                .filter(s -> !candidaturasPorProfesional.containsKey(s.profesionalId()))
                .toList();

        // profesionalesDisponibles: only populated when there is an active search
        List<ListaCandidatosResponse> profesionalesDisponibles;
        if (normalizedSearch != null) {
            profesionalesDisponibles = profesionalSeniorRepository.searchActiveProfessionals(normalizedSearch)
                    .stream()
                    .filter(profesional -> !candidaturasPorProfesional.containsKey(profesional.getId()))
                    .sorted(Comparator.comparing(ProfesionalSenior::getApellidos).thenComparing(ProfesionalSenior::getNombre))
                    .map(this::toAvailableResponse)
                    .toList();
        } else {
            profesionalesDisponibles = List.of();
        }

        return new SelectionBoardResponse(
                proceso.getId(),
                proceso.getTitulo(),
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
                    .toList(),
                sugeridos,
                profesionalesDisponibles,
                candidatos,
                solicitudesVisibilidad
        );
    }

    @Transactional
    public ListaCandidatosResponse addCandidate(UUID procesoId, CrearCandidaturaRequest request) {
        ProcesoHeadhunting proceso = findAccessibleProceso(procesoId);
        ProfesionalSenior profesional = profesionalSeniorRepository.findById(request.profesionalId())
                .orElseThrow(() -> new ResourceNotFoundException("No existe el profesional indicado."));

        if (!profesional.isActivo()) {
            throw new BusinessException("El profesional indicado no está activo.");
        }

        PuestoTIC puesto = proceso.getPuestos().stream()
                .filter(p -> p.getId().equals(request.puestoTicId()))
                .findFirst()
                .orElseThrow(() -> new BusinessException("El puesto seleccionado no pertenece al proceso."));

        if (listaCandidatosRepository.existsByProcesoIdAndProfesionalIdAndPuestoTicId(procesoId, profesional.getId(), puesto.getId())) {
            throw new BusinessException("Ese profesional ya está asociado al puesto seleccionado.");
        }

        ListaCandidatos candidatura = new ListaCandidatos();
        candidatura.setProceso(proceso);
        candidatura.setProfesional(profesional);
        candidatura.setPuestoTic(puesto);
        candidatura.setEstado(EstadoListaCandidato.PENDIENTE);
        candidatura.setSolicitudVisibilidad(EstadoSolicitudVisibilidad.NO_SOLICITADO);

        return toResponse(listaCandidatosRepository.save(candidatura));
    }

    @Transactional
    public ListaCandidatosResponse requestVisibility(UUID procesoId, UUID candidaturaId) {
        ListaCandidatos candidatura = findAccessibleCandidate(procesoId, candidaturaId);

        if (candidatura.getEstado() != EstadoListaCandidato.ACEPTADO) {
            throw new BusinessException("No se puede solicitar visibilidad hasta que el candidato acepte la candidatura.");
        }

        if (candidatura.getSolicitudVisibilidad() != EstadoSolicitudVisibilidad.NO_SOLICITADO) {
            throw new BusinessException("La solicitud de visibilidad ya fue gestionada para este candidato.");
        }

        candidatura.setSolicitudVisibilidad(EstadoSolicitudVisibilidad.SOLICITADO);
        return toResponse(candidatura);
    }

    @Transactional
    public void deleteCandidate(UUID procesoId, UUID candidaturaId) {
        ListaCandidatos candidatura = findAccessibleCandidate(procesoId, candidaturaId);
        listaCandidatosRepository.delete(candidatura);
    }

    @Transactional(readOnly = true)
    public List<ListaCandidatosResponse> findMyCandidatures() {
        String email = SecurityUtils.currentUserEmail();
        ProfesionalSenior profesional = profesionalSeniorRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No existe el profesional autenticado."));

        return listaCandidatosRepository.findByProfesionalId(profesional.getId())
                .stream()
                .sorted(Comparator.comparing(ListaCandidatos::getFechaActualizacion).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ListaCandidatosResponse> findMyPendingVisibilityRequests() {
        String email = SecurityUtils.currentUserEmail();
        ProfesionalSenior profesional = profesionalSeniorRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No existe el profesional autenticado."));

        return listaCandidatosRepository.findByProfesionalId(profesional.getId())
                .stream()
                .filter(candidatura -> candidatura.getSolicitudVisibilidad() == EstadoSolicitudVisibilidad.SOLICITADO)
                .sorted(Comparator.comparing(ListaCandidatos::getFechaActualizacion).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ListaCandidatosResponse updateMyCandidateState(UUID candidaturaId, CambiarEstadoCandidaturaRequest request) {
        ListaCandidatos candidatura = findMyCandidate(candidaturaId);
        candidatura.setEstado(request.estado());
        return toResponse(candidatura);
    }

    @Transactional
    public ListaCandidatosResponse updateMyVisibilityRequest(UUID candidaturaId, CambiarSolicitudVisibilidadRequest request) {
        ListaCandidatos candidatura = findMyCandidate(candidaturaId);

        if (request.solicitudVisibilidad() == EstadoSolicitudVisibilidad.NO_SOLICITADO) {
            throw new BusinessException("La solicitud de visibilidad no puede volver a NO_SOLICITADO desde esta acción.");
        }

        candidatura.setSolicitudVisibilidad(request.solicitudVisibilidad());
        return toResponse(candidatura);
    }

    @Transactional
    public ListaCandidatosResponse acceptMyVisibilityRequest(UUID candidaturaId) {
        return updatePendingVisibilityDecision(candidaturaId, EstadoSolicitudVisibilidad.ACEPTADO);
    }

    @Transactional
    public ListaCandidatosResponse rejectMyVisibilityRequest(UUID candidaturaId) {
        return updatePendingVisibilityDecision(candidaturaId, EstadoSolicitudVisibilidad.RECHAZADO);
    }

    private ListaCandidatos findAccessibleCandidate(UUID procesoId, UUID candidaturaId) {
        ListaCandidatos candidatura = listaCandidatosRepository.findById(candidaturaId)
                .orElseThrow(() -> new ResourceNotFoundException("No existe la candidatura indicada."));

        if (!candidatura.getProceso().getId().equals(procesoId)) {
            throw new BusinessException("La candidatura no pertenece al proceso indicado.");
        }

        findAccessibleProceso(procesoId);
        return candidatura;
    }

    private ListaCandidatos findMyCandidate(UUID candidaturaId) {
        String email = SecurityUtils.currentUserEmail();
        boolean isAdmin = SecurityUtils.currentUserHasRole("ROLE_ADMIN");

        ListaCandidatos candidatura = listaCandidatosRepository.findById(candidaturaId)
                .orElseThrow(() -> new ResourceNotFoundException("No existe la candidatura indicada."));

        if (!isAdmin && !candidatura.getProfesional().getEmail().equalsIgnoreCase(email)) {
            throw new BusinessException("No tienes permiso para modificar esta candidatura.");
        }

        return candidatura;
    }

    private ListaCandidatosResponse updatePendingVisibilityDecision(UUID candidaturaId, EstadoSolicitudVisibilidad nextState) {
        ListaCandidatos candidatura = findMyCandidate(candidaturaId);

        if (candidatura.getSolicitudVisibilidad() != EstadoSolicitudVisibilidad.SOLICITADO) {
            throw new BusinessException("Solo puedes responder solicitudes de visibilidad pendientes.");
        }

        candidatura.setSolicitudVisibilidad(nextState);
        return toResponse(candidatura);
    }

    private ProcesoHeadhunting findAccessibleProceso(UUID procesoId) {
        ProcesoHeadhunting proceso = procesoHeadhuntingRepository.findById(procesoId)
                .orElseThrow(() -> new ResourceNotFoundException("No existe el proceso indicado."));

        if (SecurityUtils.currentUserHasRole("ROLE_ADMIN")) {
            return proceso;
        }

        String email = SecurityUtils.currentUserEmail();
        ResponsableRrhh responsable = responsableRrhhRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("No tienes permisos para acceder a este proceso."));

        if (!responsable.getEmpresaCliente().getId().equals(proceso.getEmpresaCliente().getId())) {
            throw new BusinessException("No tienes permisos para acceder a este proceso.");
        }

        return proceso;
    }

    private ListaCandidatosResponse toAvailableResponse(ProfesionalSenior profesional) {
        return new ListaCandidatosResponse(
                null, null, null, null, null, null, null, null,
                profesional.getId(),
                anonymousLabel(profesional.getId()),
                null, null, null, null,
                profesional.getTecnologiasClave(),
                profesional.getTitulacionesAcademicas(),
                profesional.getIdiomas(),
                profesional.getSoftSkills(),
                profesional.getAniosExperiencia(),
                profesional.getRangoSalarialEsperadoMin(),
                profesional.getRangoSalarialEsperadoMax(),
                profesional.getAreaNegocio(),
                profesional.getAreaNegocio() == null ? null : profesional.getAreaNegocio().name(),
                profesional.isActivo(),
                profesional.getDisponibilidad(),
                null, null, null, null,
                true
        );
    }

    private ListaCandidatosResponse toResponse(ListaCandidatos candidatura) {
        ProfesionalSenior profesional = candidatura.getProfesional();
        PuestoTIC puesto = candidatura.getPuestoTic();
        boolean identityVisible = candidatura.getSolicitudVisibilidad() == EstadoSolicitudVisibilidad.ACEPTADO;

        return new ListaCandidatosResponse(
                candidatura.getId(),
                candidatura.getProceso().getId(),
                candidatura.getProceso().getTitulo(),
                candidatura.getProceso().getDescripcion(),
                candidatura.getProceso().getEstado(),
                candidatura.getProceso().getNivelConfidencialidad(),
                candidatura.getProceso().getNivelExperienciaMinimo(),
                new PuestoTicResponse(
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
                ),
                profesional.getId(),
                identityVisible ? fullName(profesional) : anonymousLabel(profesional.getId()),
                identityVisible ? profesional.getNombre() : null,
                identityVisible ? profesional.getApellidos() : null,
                identityVisible ? profesional.getEmail() : null,
                identityVisible ? profesional.getDescripcionPersonal() : null,
                profesional.getTecnologiasClave(),
                profesional.getTitulacionesAcademicas(),
                profesional.getIdiomas(),
                profesional.getSoftSkills(),
                profesional.getAniosExperiencia(),
                identityVisible ? profesional.getRangoSalarialEsperadoMin() : null,
                identityVisible ? profesional.getRangoSalarialEsperadoMax() : null,
                profesional.getAreaNegocio(),
                profesional.getAreaNegocio() == null ? null : profesional.getAreaNegocio().name(),
                profesional.isActivo(),
                profesional.getDisponibilidad(),
                candidatura.getEstado(),
                candidatura.getSolicitudVisibilidad(),
                candidatura.getFechaInclusion(),
                candidatura.getFechaActualizacion(),
                !identityVisible
        );
    }

    private String fullName(ProfesionalSenior profesional) {
        return (profesional.getNombre() + " " + profesional.getApellidos()).trim();
    }

    private String anonymousLabel(UUID id) {
        return "Candidato anónimo #" + id.toString().substring(0, 8).toUpperCase(Locale.ROOT);
    }

    private String normalizeSearch(String search) {
        if (search == null) return null;
        String trimmed = search.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
