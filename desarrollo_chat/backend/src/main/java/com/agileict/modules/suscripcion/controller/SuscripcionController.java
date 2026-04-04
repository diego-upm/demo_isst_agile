package com.agileict.modules.suscripcion.controller;

import com.agileict.modules.suscripcion.dto.SuscripcionResponse;
import com.agileict.modules.suscripcion.service.SuscripcionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/suscripciones")
public class SuscripcionController {

    private final SuscripcionService suscripcionService;

    public SuscripcionController(SuscripcionService suscripcionService) {
        this.suscripcionService = suscripcionService;
    }

    @GetMapping
    public List<SuscripcionResponse> myCompanySubscriptions() {
        return suscripcionService.myCompanySubscriptions();
    }
}
