package com.agileict.modules.profesional.repository;

import com.agileict.modules.profesional.entity.ProfesionalSenior;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfesionalSeniorRepository extends JpaRepository<ProfesionalSenior, UUID> {
    Optional<ProfesionalSenior> findByEmail(String email);
    List<ProfesionalSenior> findByActivoTrueAndPerfilVisibleTrue();

    List<ProfesionalSenior> findByActivoTrueOrderByApellidosAscNombreAsc();

    @Query("""
            select p from ProfesionalSenior p
            where p.activo = true and (
                :query is null or :query = '' or
                lower(p.nombre) like lower(concat('%', :query, '%')) or
                lower(p.apellidos) like lower(concat('%', :query, '%')) or
                lower(p.email) like lower(concat('%', :query, '%')) or
                lower(coalesce(p.tecnologiasClave, '')) like lower(concat('%', :query, '%'))
            )
            order by p.apellidos asc, p.nombre asc
            """)
    List<ProfesionalSenior> searchActiveProfessionals(@Param("query") String query);
}
