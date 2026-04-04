package com.agileict.modules.responsable.controller;

import com.agileict.modules.responsable.dto.ResponsableRrhhResponse;
import com.agileict.modules.responsable.service.ResponsableRrhhService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rrhh")
public class ResponsableRrhhController {

    private final ResponsableRrhhService responsableRrhhService;

    public ResponsableRrhhController(ResponsableRrhhService responsableRrhhService) {
        this.responsableRrhhService = responsableRrhhService;
    }

    @GetMapping("/me")
    public ResponsableRrhhResponse me() {
        return responsableRrhhService.me();
    }
}
