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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * Computes a matching score between active professionals and each individual puesto,
 * returning the top N suggested candidates per puesto.
 *
 * Scoring heuristic per puesto (higher = better match):
 *  +4  if professional's areaNegocio matches puesto's sectorRequerido
 *  +2  if professional has AVAILABLE disponibilidad
 *  +1  if professional has OPEN_TO_OFFERS disponibilidad
 *  +2  base bonus if any required technology keyword matches professional's tecnologiasClave
 *  +1  per additional matched technology keyword (up to +4 extra)
 *  +2  if puesto area matches professional's areaNegocio name
 *  +1  if any word from puesto descripcion or titulo appears in professional's tecnologiasClave or softSkills
 */
@Service
public class CandidatosSugeridosService {

    private static final int MAX_SUGGESTIONS_PER_PUESTO = 3;

    private final ProfesionalSeniorRepository profesionalSeniorRepository;

    public CandidatosSugeridosService(ProfesionalSeniorRepository profesionalSeniorRepository) {
        this.profesionalSeniorRepository = profesionalSeniorRepository;
    }

    @Transactional(readOnly = true)
    public Map<UUID, List<ListaCandidatosResponse>> getSuggestionsByPuesto(ProcesoHeadhunting proceso) {
        List<ProfesionalSenior> candidates = profesionalSeniorRepository.findByActivoTrueAndPerfilVisibleTrue();

        Map<UUID, List<ListaCandidatosResponse>> result = new LinkedHashMap<>();

        for (PuestoTIC puesto : proceso.getPuestos()) {
            List<ListaCandidatosResponse> sugeridos = scoreCandidatesForPuesto(candidates, puesto);
            result.put(puesto.getId(), sugeridos);
        }

        return result;
    }

    // Keep old method for backward compatibility if needed
    @Transactional(readOnly = true)
    public List<ListaCandidatosResponse> getSuggestions(ProcesoHeadhunting proceso) {
        List<ProfesionalSenior> candidates = profesionalSeniorRepository.findByActivoTrueAndPerfilVisibleTrue();
        if (candidates.isEmpty() || proceso.getPuestos().isEmpty()) {
            return List.of();
        }
        return scoreCandidatesForPuesto(candidates, proceso.getPuestos().get(0));
    }

    private List<ListaCandidatosResponse> scoreCandidatesForPuesto(List<ProfesionalSenior> candidates, PuestoTIC puesto) {
        if (candidates.isEmpty()) return List.of();

        // Build keyword sets from the puesto
        List<String> techKeywords = parseTechKeywords(puesto.getTecnologiasRequeridas());
        List<String> contextKeywords = parseContextKeywords(puesto.getTitulo(), puesto.getDescripcion(), puesto.getArea());
        AreaNegocioProfesional requiredSector = puesto.getSectorRequerido();
        String puestoAreaLower = puesto.getArea() != null ? puesto.getArea().trim().toLowerCase(Locale.ROOT) : null;

        record Scored(ProfesionalSenior professional, int score) {}

        List<Scored> scored = new ArrayList<>();
        for (ProfesionalSenior p : candidates) {
            int score = 0;

            // Sector / area match — strongest signal
            if (requiredSector != null && p.getAreaNegocio() != null
                    && requiredSector.equals(p.getAreaNegocio())) {
                score += 4;
            }

            // Puesto area text match against professional's areaNegocio name
            if (puestoAreaLower != null && p.getAreaNegocio() != null) {
                String areaNegocioLower = p.getAreaNegocio().name().toLowerCase(Locale.ROOT).replace('_', ' ');
                if (areaNegocioLower.contains(puestoAreaLower) || puestoAreaLower.contains(areaNegocioLower)) {
                    score += 2;
                }
            }

            // Availability
            if (p.getDisponibilidad() == DisponibilidadProfesional.AVAILABLE) {
                score += 2;
            } else if (p.getDisponibilidad() == DisponibilidadProfesional.OPEN_TO_OFFERS) {
                score += 1;
            }

            // Technology keyword match
            if (!techKeywords.isEmpty() && p.getTecnologiasClave() != null) {
                String techLower = p.getTecnologiasClave().toLowerCase(Locale.ROOT);
                int techMatches = 0;
                for (String keyword : techKeywords) {
                    if (techLower.contains(keyword)) {
                        techMatches++;
                    }
                }
                if (techMatches > 0) {
                    score += 2; // base bonus
                    score += Math.min(techMatches - 1, 4); // up to 4 extra
                }
            }

            // Context keyword match (titulo + descripcion + area) against tecnologiasClave + softSkills
            if (!contextKeywords.isEmpty()) {
                String profText = ((p.getTecnologiasClave() != null ? p.getTecnologiasClave() : "") + " "
                        + (p.getSoftSkills() != null ? p.getSoftSkills() : "")).toLowerCase(Locale.ROOT);
                for (String keyword : contextKeywords) {
                    if (profText.contains(keyword)) {
                        score += 1;
                        break; // one point max from context
                    }
                }
            }

            scored.add(new Scored(p, score));
        }

        return scored.stream()
                .sorted(Comparator.comparingInt(Scored::score).reversed())
                .limit(MAX_SUGGESTIONS_PER_PUESTO)
                .map(s -> toAvailableResponse(s.professional()))
                .toList();
    }

    private List<String> parseTechKeywords(String tecnologiasRequeridas) {
        if (tecnologiasRequeridas == null || tecnologiasRequeridas.isBlank()) return List.of();
        return List.of(tecnologiasRequeridas.split("[,;\\s]+")).stream()
                .map(k -> k.trim().toLowerCase(Locale.ROOT))
                .filter(k -> k.length() > 1)
                .distinct()
                .toList();
    }

    private List<String> parseContextKeywords(String titulo, String descripcion, String area) {
        String combined = ((titulo != null ? titulo : "") + " "
                + (descripcion != null ? descripcion : "") + " "
                + (area != null ? area : "")).toLowerCase(Locale.ROOT);
        // Only keep words longer than 3 chars to avoid noise
        return List.of(combined.split("[\\s,;.\\-_/()]+")).stream()
                .map(String::trim)
                .filter(k -> k.length() > 3)
                .distinct()
                .toList();
    }

    private ListaCandidatosResponse toAvailableResponse(ProfesionalSenior p) {
        return new ListaCandidatosResponse(
                null, null, null, null, null, null, null, null,
                p.getId(),
                anonymousLabel(p.getId()),
                null, null, null, null,
                p.getTecnologiasClave(),
                p.getTitulacionesAcademicas(),
                p.getIdiomas(),
                p.getSoftSkills(),
                p.getAniosExperiencia(),
                null, null,
                p.getAreaNegocio(),
                p.getAreaNegocio() == null ? null : p.getAreaNegocio().name(),
                p.isActivo(),
                p.getDisponibilidad(),
                null, null, null, null,
                true
        );
    }

    private String anonymousLabel(UUID id) {
        return "Candidato anónimo #" + id.toString().substring(0, 8).toUpperCase(Locale.ROOT);
    }
}

