package com.agileict.modules.suscripcion.entity;

import com.agileict.modules.empresa.entity.EmpresaCliente;
import com.agileict.shared.enums.EstadoSuscripcion;
import com.agileict.shared.enums.PlanSuscripcion;
import com.agileict.shared.persistence.BaseEntity;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "suscripcion")
public class Suscripcion extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PlanSuscripcion plan;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private EstadoSuscripcion estado;

    @Column(nullable = false)
    private LocalDate fechaInicio;

    @Column
    private LocalDate fechaFin;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_cliente_id", nullable = false)
    private EmpresaCliente empresaCliente;

    public PlanSuscripcion getPlan() {
        return plan;
    }

    public EstadoSuscripcion getEstado() {
        return estado;
    }

    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public EmpresaCliente getEmpresaCliente() {
        return empresaCliente;
    }

    public void setPlan(PlanSuscripcion plan) {
        this.plan = plan;
    }

    public void setEstado(EstadoSuscripcion estado) {
        this.estado = estado;
    }

    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }

    public void setEmpresaCliente(EmpresaCliente empresaCliente) {
        this.empresaCliente = empresaCliente;
    }
}
