package com.agileict.modules.proceso.controller;

import com.agileict.modules.proceso.dto.CreateProcesoRequest;
import com.agileict.modules.proceso.dto.CreateProcesoWithSuggestionsResponse;
import com.agileict.modules.proceso.dto.ProcesoHeadhuntingResponse;
import com.agileict.modules.proceso.service.ProcesoHeadhuntingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/procesos")
public class ProcesoHeadhuntingController {

    private final ProcesoHeadhuntingService procesoHeadhuntingService;

    public ProcesoHeadhuntingController(ProcesoHeadhuntingService procesoHeadhuntingService) {
        this.procesoHeadhuntingService = procesoHeadhuntingService;
    }

    @GetMapping
    public List<ProcesoHeadhuntingResponse> findAll(@RequestParam(required = false) UUID empresaClienteId) {
        if (empresaClienteId != null) {
            return procesoHeadhuntingService.findByEmpresa(empresaClienteId);
        }
        return procesoHeadhuntingService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreateProcesoWithSuggestionsResponse create(@Valid @RequestBody CreateProcesoRequest request) {
        return procesoHeadhuntingService.create(request);
    }

    @DeleteMapping("/{procesoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID procesoId) {
        procesoHeadhuntingService.delete(procesoId);
    }
}
