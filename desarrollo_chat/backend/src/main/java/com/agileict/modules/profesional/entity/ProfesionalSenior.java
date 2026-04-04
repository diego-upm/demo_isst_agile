package com.agileict.modules.profesional.entity;

import com.agileict.modules.auth.entity.UserAccount;
import com.agileict.shared.enums.DisponibilidadProfesional;
import com.agileict.shared.persistence.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "profesional_senior")
public class ProfesionalSenior extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 120)
    private String apellidos;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 1000)
    private String tecnologiasClave;

    @Column
    private Integer aniosExperiencia;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private DisponibilidadProfesional disponibilidad = DisponibilidadProfesional.OPEN_TO_OFFERS;

    @Column(nullable = false)
    private boolean perfilVisible = false;

    @Column(nullable = false)
    private boolean activo = true;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_account_id", unique = true)
    private UserAccount userAccount;

    public String getNombre() {
        return nombre;
    }

    public String getApellidos() {
        return apellidos;
    }

    public String getEmail() {
        return email;
    }

    public String getTecnologiasClave() {
        return tecnologiasClave;
    }

    public Integer getAniosExperiencia() {
        return aniosExperiencia;
    }

    public DisponibilidadProfesional getDisponibilidad() {
        return disponibilidad;
    }

    public boolean isPerfilVisible() {
        return perfilVisible;
    }

    public boolean isActivo() {
        return activo;
    }

    public UserAccount getUserAccount() {
        return userAccount;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setTecnologiasClave(String tecnologiasClave) {
        this.tecnologiasClave = tecnologiasClave;
    }

    public void setAniosExperiencia(Integer aniosExperiencia) {
        this.aniosExperiencia = aniosExperiencia;
    }

    public void setDisponibilidad(DisponibilidadProfesional disponibilidad) {
        this.disponibilidad = disponibilidad;
    }

    public void setPerfilVisible(boolean perfilVisible) {
        this.perfilVisible = perfilVisible;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public void setUserAccount(UserAccount userAccount) {
        this.userAccount = userAccount;
    }
}
