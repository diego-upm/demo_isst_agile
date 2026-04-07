package com.agileict.modules.candidatura.repository;

import com.agileict.modules.candidatura.entity.ListaCandidatos;
import com.agileict.shared.enums.EstadoListaCandidato;
import com.agileict.shared.enums.EstadoSolicitudVisibilidad;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ListaCandidatosRepository extends JpaRepository<ListaCandidatos, UUID> {
    List<ListaCandidatos> findByProcesoId(UUID procesoId);

    List<ListaCandidatos> findByProfesionalId(UUID profesionalId);

    List<ListaCandidatos> findByProcesoIdAndEstado(UUID procesoId, EstadoListaCandidato estado);

    List<ListaCandidatos> findByProcesoIdAndSolicitudVisibilidadIn(UUID procesoId, Collection<EstadoSolicitudVisibilidad> solicitudVisibilidad);

    Optional<ListaCandidatos> findByProcesoIdAndProfesionalIdAndPuestoTicId(UUID procesoId, UUID profesionalId, UUID puestoTicId);

    boolean existsByProcesoIdAndProfesionalIdAndPuestoTicId(UUID procesoId, UUID profesionalId, UUID puestoTicId);
}