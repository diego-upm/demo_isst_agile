package com.agileict.modules.proceso.service;

import com.agileict.modules.candidatura.dto.ListaCandidatosResponse;
import com.agileict.modules.proceso.entity.ProcesoHeadhunting;
import com.agileict.modules.profesional.entity.ProfesionalSenior;
import com.agileict.modules.profesional.repository.ProfesionalSeniorRepository;
import com.agileict.modules.puesto.entity.PuestoTIC;
import com.agileict.shared.enums.AreaNegocioProfesional;
import com.agileict.shared.enums.DisponibilidadProfesional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * Computes a simple matching score between active professionals and a proceso,
 * and returns the top N suggested candidates.
 *
 * Scoring heuristic (higher = better match):
 *  +3  if professional's areaNegocio matches any puesto's sectorRequerido
 *  +2  if professional has AVAILABLE disponibilidad
 *  +1  if professional has OPEN_TO_OFFERS disponibilidad
 *  +2  if any required technology keyword appears in professional's tecnologiasClave
 *  +1  per matched technology keyword (up to +4 extra)
 *  +1  if professional's aniosExperiencia >= nivelExperienciaMinimo parsed as int
 */
@Service
public class CandidatosSugeridosService {

    private static final int MAX_SUGGESTIONS = 3;

    private final ProfesionalSeniorRepository profesionalSeniorRepository;

    public CandidatosSugeridosService(ProfesionalSeniorRepository profesionalSeniorRepository) {
        this.profesionalSeniorRepository = profesionalSeniorRepository;
    }

    @Transactional(readOnly = true)
    public List<ListaCandidatosResponse> getSuggestions(ProcesoHeadhunting proceso) {
        List<ProfesionalSenior> candidates = profesionalSeniorRepository.findByActivoTrueAndPerfilVisibleTrue();

        if (candidates.isEmpty()) {
            return List.of();
        }

        List<AreaNegocioProfesional> requiredSectors = proceso.getPuestos().stream()
                .map(PuestoTIC::getSectorRequerido)
                .filter(s -> s != null)
                .distinct()
                .toList();

        List<String> requiredTechKeywords = proceso.getPuestos().stream()
                .map(PuestoTIC::getTecnologiasRequeridas)
                .filter(t -> t != null && !t.isBlank())
                .flatMap(t -> List.of(t.split("[,;\\s]+")).stream())
                .map(k -> k.trim().toLowerCase(Locale.ROOT))
                .filter(k -> !k.isEmpty())
                .distinct()
                .toList();

        Integer minExperience = parseMinExperience(proceso.getNivelExperienciaMinimo());

        record Scored(ProfesionalSenior professional, int score) {}

        List<Scored> scored = new ArrayList<>();
        for (ProfesionalSenior p : candidates) {
            int score = 0;

            // Sector / area match
            if (!requiredSectors.isEmpty() && p.getAreaNegocio() != null
                    && requiredSectors.contains(p.getAreaNegocio())) {
                score += 3;
            }

            // Availability
            if (p.getDisponibilidad() == DisponibilidadProfesional.AVAILABLE) {
                score += 2;
            } else if (p.getDisponibilidad() == DisponibilidadProfesional.OPEN_TO_OFFERS) {
                score += 1;
            }

            // Technology keywords
            if (!requiredTechKeywords.isEmpty() && p.getTecnologiasClave() != null) {
                String techLower = p.getTecnologiasClave().toLowerCase(Locale.ROOT);
                int techMatches = 0;
                for (String keyword : requiredTechKeywords) {
                    if (techLower.contains(keyword)) {
                        techMatches++;
                    }
                }
                if (techMatches > 0) {
                    score += 2; // base bonus for any match
                    score += Math.min(techMatches - 1, 4); // up to 4 extra
                }
            }

            // Experience
            if (minExperience != null && p.getAniosExperiencia() != null
                    && p.getAniosExperiencia() >= minExperience) {
                score += 1;
            }

            scored.add(new Scored(p, score));
        }

        return scored.stream()
                .sorted(Comparator.comparingInt(Scored::score).reversed())
                .limit(MAX_SUGGESTIONS)
                .map(s -> toAvailableResponse(s.professional()))
                .toList();
    }

    private Integer parseMinExperience(String nivelExperienciaMinimo) {
        if (nivelExperienciaMinimo == null || nivelExperienciaMinimo.isBlank()) {
            return null;
        }
        // Try to extract the first number found in the string (e.g. "5 años" -> 5)
        String digits = nivelExperienciaMinimo.replaceAll("[^0-9]", "");
        if (digits.isEmpty()) {
            return null;
        }
        try {
            return Integer.parseInt(digits.substring(0, Math.min(digits.length(), 3)));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private ListaCandidatosResponse toAvailableResponse(ProfesionalSenior p) {
        return new ListaCandidatosResponse(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                p.getId(),
                anonymousLabel(p.getId()),
                null,
                null,
                null,
                null,
                p.getTecnologiasClave(),
                p.getTitulacionesAcademicas(),
                p.getIdiomas(),
                p.getSoftSkills(),
                p.getAniosExperiencia(),
                null,
                null,
                p.getAreaNegocio(),
                p.getAreaNegocio() == null ? null : p.getAreaNegocio().name(),
                p.isActivo(),
                p.getDisponibilidad(),
                null,
                null,
                null,
                null,
                true
        );
    }

    private String anonymousLabel(UUID id) {
        return "Candidato anónimo #" + id.toString().substring(0, 8).toUpperCase(Locale.ROOT);
    }
}
