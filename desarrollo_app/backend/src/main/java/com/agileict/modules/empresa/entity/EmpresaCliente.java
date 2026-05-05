package com.agileict.modules.empresa.entity;

import com.agileict.shared.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "empresa_cliente")
public class EmpresaCliente extends BaseEntity {

    @Column(nullable = false, length = 160)
    private String nombre;

    @Column(nullable = false, unique = true, length = 32)
    private String cif;

    @Column(length = 80)
    private String sector;

    @Column(nullable = false)
    private boolean activa = true;

    public String getNombre() {
        return nombre;
    }

    public String getCif() {
        return cif;
    }

    public String getSector() {
        return sector;
    }

    public boolean isActiva() {
        return activa;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setCif(String cif) {
        this.cif = cif;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    public void setActiva(boolean activa) {
        this.activa = activa;
    }
}
