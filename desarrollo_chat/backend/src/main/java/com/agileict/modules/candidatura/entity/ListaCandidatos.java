package com.agileict.modules.candidatura.entity;

import com.agileict.modules.proceso.entity.ProcesoHeadhunting;
import com.agileict.modules.profesional.entity.ProfesionalSenior;
import com.agileict.shared.enums.EstadoListaCandidato;
import com.agileict.shared.enums.EstadoSolicitudVisibilidad;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Entity
@Table(
        name = "lista_candidatos",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_lista_candidatos_proceso_profesional",
                columnNames = {"proceso_id", "profesional_id"}
        )
)
public class ListaCandidatos {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "proceso_id", nullable = false)
    private ProcesoHeadhunting proceso;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profesional_id", nullable = false)
    private ProfesionalSenior profesional;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private EstadoListaCandidato estado = EstadoListaCandidato.PENDIENTE;

    @Enumerated(EnumType.STRING)
    @Column(name = "solicitud_visibilidad", nullable = false, length = 32)
    private EstadoSolicitudVisibilidad solicitudVisibilidad = EstadoSolicitudVisibilidad.NO_SOLICITADO;

    @Column(name = "fecha_inclusion", nullable = false)
    private OffsetDateTime fechaInclusion;

    @Column(name = "fecha_actualizacion", nullable = false)
    private OffsetDateTime fechaActualizacion;

    @PrePersist
    public void prePersist() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.fechaInclusion == null) {
            this.fechaInclusion = now;
        }
        this.fechaActualizacion = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.fechaActualizacion = OffsetDateTime.now(ZoneOffset.UTC);
    }

    public UUID getId() {
        return id;
    }

    public ProcesoHeadhunting getProceso() {
        return proceso;
    }

    public ProfesionalSenior getProfesional() {
        return profesional;
    }

    public EstadoListaCandidato getEstado() {
        return estado;
    }

    public EstadoSolicitudVisibilidad getSolicitudVisibilidad() {
        return solicitudVisibilidad;
    }

    public OffsetDateTime getFechaInclusion() {
        return fechaInclusion;
    }

    public OffsetDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public void setProceso(ProcesoHeadhunting proceso) {
        this.proceso = proceso;
    }

    public void setProfesional(ProfesionalSenior profesional) {
        this.profesional = profesional;
    }

    public void setEstado(EstadoListaCandidato estado) {
        this.estado = estado;
    }

    public void setSolicitudVisibilidad(EstadoSolicitudVisibilidad solicitudVisibilidad) {
        this.solicitudVisibilidad = solicitudVisibilidad;
    }

    public void setFechaInclusion(OffsetDateTime fechaInclusion) {
        this.fechaInclusion = fechaInclusion;
    }

    public void setFechaActualizacion(OffsetDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
}