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

    @Column(name = "titulaciones_academicas", length = 1500)
    private String titulacionesAcademicas;

    @Column(length = 1000)
    private String idiomas;

    @Column(name = "soft_skills", length = 1000)
    private String softSkills;

    @Column
    private Integer aniosExperiencia;

    @Column(name = "rango_salarial_esperado_min")
    private Integer rangoSalarialEsperadoMin;

    @Column(name = "rango_salarial_esperado_max")
    private Integer rangoSalarialEsperadoMax;

    @Column(name = "descripcion_personal", length = 2000)
    private String descripcionPersonal;

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

    public String getTitulacionesAcademicas() {
        return titulacionesAcademicas;
    }

    public String getIdiomas() {
        return idiomas;
    }

    public String getSoftSkills() {
        return softSkills;
    }

    public Integer getAniosExperiencia() {
        return aniosExperiencia;
    }

    public Integer getRangoSalarialEsperadoMin() {
        return rangoSalarialEsperadoMin;
    }

    public Integer getRangoSalarialEsperadoMax() {
        return rangoSalarialEsperadoMax;
    }

    public String getDescripcionPersonal() {
        return descripcionPersonal;
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

    public void setTitulacionesAcademicas(String titulacionesAcademicas) {
        this.titulacionesAcademicas = titulacionesAcademicas;
    }

    public void setIdiomas(String idiomas) {
        this.idiomas = idiomas;
    }

    public void setSoftSkills(String softSkills) {
        this.softSkills = softSkills;
    }

    public void setAniosExperiencia(Integer aniosExperiencia) {
        this.aniosExperiencia = aniosExperiencia;
    }

    public void setRangoSalarialEsperadoMin(Integer rangoSalarialEsperadoMin) {
        this.rangoSalarialEsperadoMin = rangoSalarialEsperadoMin;
    }

    public void setRangoSalarialEsperadoMax(Integer rangoSalarialEsperadoMax) {
        this.rangoSalarialEsperadoMax = rangoSalarialEsperadoMax;
    }

    public void setDescripcionPersonal(String descripcionPersonal) {
        this.descripcionPersonal = descripcionPersonal;
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
