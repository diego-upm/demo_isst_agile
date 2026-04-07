package com.agileict.modules.puesto.entity;

import com.agileict.modules.proceso.entity.ProcesoHeadhunting;
import com.agileict.shared.enums.SenioridadPuesto;
import com.agileict.shared.persistence.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "puesto_tic")
public class PuestoTIC extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String titulo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private SenioridadPuesto senioridad;

    @Column(length = 100)
    private String modalidad;

    @Column(length = 100)
    private String ubicacion;

    @Column(length = 100)
    private String area;

    @Column(length = 1500)
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "proceso_headhunting_id", nullable = false)
    private ProcesoHeadhunting procesoHeadhunting;

    public String getTitulo() {
        return titulo;
    }

    public SenioridadPuesto getSenioridad() {
        return senioridad;
    }

    public String getModalidad() {
        return modalidad;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public String getArea() {
        return area;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public ProcesoHeadhunting getProcesoHeadhunting() {
        return procesoHeadhunting;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public void setSenioridad(SenioridadPuesto senioridad) {
        this.senioridad = senioridad;
    }

    public void setModalidad(String modalidad) {
        this.modalidad = modalidad;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public void setProcesoHeadhunting(ProcesoHeadhunting procesoHeadhunting) {
        this.procesoHeadhunting = procesoHeadhunting;
    }
}
