package com.agileict.modules.proceso.entity;

import com.agileict.modules.empresa.entity.EmpresaCliente;
import com.agileict.modules.puesto.entity.PuestoTIC;
import com.agileict.modules.responsable.entity.ResponsableRrhh;
import com.agileict.shared.enums.EstadoProceso;
import com.agileict.shared.enums.NivelConfidencialidad;
import com.agileict.shared.persistence.BaseEntity;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "proceso_headhunting")
public class ProcesoHeadhunting extends BaseEntity {

    @Column(nullable = false, length = 160)
    private String titulo;

    @Column(nullable = false, length = 2000)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private EstadoProceso estado = EstadoProceso.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private NivelConfidencialidad nivelConfidencialidad = NivelConfidencialidad.CONFIDENTIAL;

    @Column(length = 500)
    private String tecnologiasRequeridas;

    @Column(length = 120)
    private String nivelExperienciaMinimo;

    @Column(length = 80)
    private String tipoContrato;

    @Column
    private Integer rangoSalarialMinimo;

    @Column
    private Integer rangoSalarialMaximo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_cliente_id", nullable = false)
    private EmpresaCliente empresaCliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "responsable_rrhh_id", nullable = false)
    private ResponsableRrhh responsableRrhh;

    @OneToMany(mappedBy = "procesoHeadhunting", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PuestoTIC> puestos = new ArrayList<>();

    public void addPuesto(PuestoTIC puesto) {
        puesto.setProcesoHeadhunting(this);
        this.puestos.add(puesto);
    }

    public String getTitulo() {
        return titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public EstadoProceso getEstado() {
        return estado;
    }

    public NivelConfidencialidad getNivelConfidencialidad() {
        return nivelConfidencialidad;
    }

    public String getTecnologiasRequeridas() {
        return tecnologiasRequeridas;
    }

    public String getNivelExperienciaMinimo() {
        return nivelExperienciaMinimo;
    }

    public String getTipoContrato() {
        return tipoContrato;
    }

    public Integer getRangoSalarialMinimo() {
        return rangoSalarialMinimo;
    }

    public Integer getRangoSalarialMaximo() {
        return rangoSalarialMaximo;
    }

    public EmpresaCliente getEmpresaCliente() {
        return empresaCliente;
    }

    public ResponsableRrhh getResponsableRrhh() {
        return responsableRrhh;
    }

    public List<PuestoTIC> getPuestos() {
        return puestos;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public void setEstado(EstadoProceso estado) {
        this.estado = estado;
    }

    public void setNivelConfidencialidad(NivelConfidencialidad nivelConfidencialidad) {
        this.nivelConfidencialidad = nivelConfidencialidad;
    }

    public void setTecnologiasRequeridas(String tecnologiasRequeridas) {
        this.tecnologiasRequeridas = tecnologiasRequeridas;
    }

    public void setNivelExperienciaMinimo(String nivelExperienciaMinimo) {
        this.nivelExperienciaMinimo = nivelExperienciaMinimo;
    }

    public void setTipoContrato(String tipoContrato) {
        this.tipoContrato = tipoContrato;
    }

    public void setRangoSalarialMinimo(Integer rangoSalarialMinimo) {
        this.rangoSalarialMinimo = rangoSalarialMinimo;
    }

    public void setRangoSalarialMaximo(Integer rangoSalarialMaximo) {
        this.rangoSalarialMaximo = rangoSalarialMaximo;
    }

    public void setEmpresaCliente(EmpresaCliente empresaCliente) {
        this.empresaCliente = empresaCliente;
    }

    public void setResponsableRrhh(ResponsableRrhh responsableRrhh) {
        this.responsableRrhh = responsableRrhh;
    }
}
