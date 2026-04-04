package com.agileict.modules.auth.service;

import com.agileict.modules.auth.entity.Role;
import com.agileict.modules.auth.entity.UserAccount;
import com.agileict.modules.auth.repository.RoleRepository;
import com.agileict.modules.auth.repository.UserAccountRepository;
import com.agileict.modules.empresa.entity.EmpresaCliente;
import com.agileict.modules.empresa.repository.EmpresaClienteRepository;
import com.agileict.modules.profesional.entity.ProfesionalSenior;
import com.agileict.modules.profesional.repository.ProfesionalSeniorRepository;
import com.agileict.modules.responsable.entity.ResponsableRrhh;
import com.agileict.modules.responsable.repository.ResponsableRrhhRepository;
import com.agileict.modules.suscripcion.entity.Suscripcion;
import com.agileict.modules.suscripcion.repository.SuscripcionRepository;
import com.agileict.shared.enums.DisponibilidadProfesional;
import com.agileict.shared.enums.EstadoSuscripcion;
import com.agileict.shared.enums.PlanSuscripcion;
import com.agileict.shared.enums.RoleName;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Component
@Profile({"dev", "docker"})
public class DemoDataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserAccountRepository userAccountRepository;
    private final EmpresaClienteRepository empresaClienteRepository;
    private final ResponsableRrhhRepository responsableRrhhRepository;
    private final ProfesionalSeniorRepository profesionalSeniorRepository;
    private final SuscripcionRepository suscripcionRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataInitializer(RoleRepository roleRepository,
                               UserAccountRepository userAccountRepository,
                               EmpresaClienteRepository empresaClienteRepository,
                               ResponsableRrhhRepository responsableRrhhRepository,
                               ProfesionalSeniorRepository profesionalSeniorRepository,
                               SuscripcionRepository suscripcionRepository,
                               PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userAccountRepository = userAccountRepository;
        this.empresaClienteRepository = empresaClienteRepository;
        this.responsableRrhhRepository = responsableRrhhRepository;
        this.profesionalSeniorRepository = profesionalSeniorRepository;
        this.suscripcionRepository = suscripcionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        Role rrhhRole = ensureRole(RoleName.ROLE_RRHH);
        Role professionalRole = ensureRole(RoleName.ROLE_PROFESSIONAL);
        Role adminRole = ensureRole(RoleName.ROLE_ADMIN);

        if (!userAccountRepository.existsByEmail("rrhh@agileict.local")) {
            EmpresaCliente empresa = new EmpresaCliente();
            empresa.setId(UUID.fromString("11111111-1111-1111-1111-111111111111"));
            empresa.setNombre("AgileICT Demo Client");
            empresa.setCif("B12345678");
            empresa.setSector("Tecnología");
            empresa.setActiva(true);
            empresaClienteRepository.save(empresa);

            UserAccount rrhhAccount = new UserAccount();
            rrhhAccount.setEmail("rrhh@agileict.local");
            rrhhAccount.setPasswordHash(passwordEncoder.encode("demo1234"));
            rrhhAccount.setRoles(Set.of(rrhhRole));
            userAccountRepository.save(rrhhAccount);

            ResponsableRrhh responsable = new ResponsableRrhh();
            responsable.setId(UUID.fromString("22222222-2222-2222-2222-222222222222"));
            responsable.setNombre("Laura");
            responsable.setApellidos("Martín");
            responsable.setEmail("rrhh@agileict.local");
            responsable.setCargo("HR Manager");
            responsable.setActivo(true);
            responsable.setEmpresaCliente(empresa);
            responsable.setUserAccount(rrhhAccount);
            responsableRrhhRepository.save(responsable);

            Suscripcion suscripcion = new Suscripcion();
            suscripcion.setId(UUID.fromString("44444444-4444-4444-4444-444444444444"));
            suscripcion.setEmpresaCliente(empresa);
            suscripcion.setPlan(PlanSuscripcion.BRONZE);
            suscripcion.setEstado(EstadoSuscripcion.ACTIVE);
            suscripcion.setFechaInicio(LocalDate.now());
            suscripcionRepository.save(suscripcion);
        }

        if (!userAccountRepository.existsByEmail("pro@agileict.local")) {
            UserAccount professionalAccount = new UserAccount();
            professionalAccount.setEmail("pro@agileict.local");
            professionalAccount.setPasswordHash(passwordEncoder.encode("demo1234"));
            professionalAccount.setRoles(Set.of(professionalRole));
            userAccountRepository.save(professionalAccount);

            ProfesionalSenior profesional = new ProfesionalSenior();
            profesional.setId(UUID.fromString("33333333-3333-3333-3333-333333333333"));
            profesional.setNombre("Carlos");
            profesional.setApellidos("Serrano");
            profesional.setEmail("pro@agileict.local");
            profesional.setTecnologiasClave("Java, Spring Boot, Kubernetes, PostgreSQL");
            profesional.setAniosExperiencia(12);
            profesional.setDisponibilidad(DisponibilidadProfesional.OPEN_TO_OFFERS);
            profesional.setPerfilVisible(true);
            profesional.setActivo(true);
            profesional.setUserAccount(professionalAccount);
            profesionalSeniorRepository.save(profesional);
        }

        if (!userAccountRepository.existsByEmail("admin@agileict.local")) {
            UserAccount adminAccount = new UserAccount();
            adminAccount.setEmail("admin@agileict.local");
            adminAccount.setPasswordHash(passwordEncoder.encode("demo1234"));
            adminAccount.setRoles(Set.of(adminRole));
            userAccountRepository.save(adminAccount);
        }
    }

    private Role ensureRole(RoleName roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(roleName)));
    }
}
