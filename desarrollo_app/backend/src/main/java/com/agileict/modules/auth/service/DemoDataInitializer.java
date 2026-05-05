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
import com.agileict.shared.enums.AreaNegocioProfesional;
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
            responsable.setActivo(true);
            responsable.setEmpresaCliente(empresa);
            responsable.setUserAccount(rrhhAccount);
            responsableRrhhRepository.save(responsable);

            Suscripcion suscripcion = new Suscripcion();
            suscripcion.setId(UUID.fromString("44444444-4444-4444-4444-444444444444"));
            suscripcion.setEmpresaCliente(empresa);
            suscripcion.setPlan(PlanSuscripcion.BASICO);
            suscripcion.setEstado(EstadoSuscripcion.ACTIVE);
            suscripcion.setFechaInicio(LocalDate.now());
            suscripcionRepository.save(suscripcion);
        }

        UserAccount professionalAccount = userAccountRepository.findByEmail("pro@agileict.local")
            .orElseGet(() -> {
                UserAccount account = new UserAccount();
                account.setEmail("pro@agileict.local");
                account.setPasswordHash(passwordEncoder.encode("demo1234"));
                account.getRoles().add(professionalRole);
                return userAccountRepository.save(account);
            });

        ProfesionalSenior profesional = profesionalSeniorRepository.findByEmail("pro@agileict.local")
            .orElseGet(ProfesionalSenior::new);
        profesional.setId(profesional.getId() == null ? UUID.fromString("33333333-3333-3333-3333-333333333333") : profesional.getId());
        profesional.setNombre("Carlos");
        profesional.setApellidos("Serrano");
        profesional.setEmail("pro@agileict.local");
        profesional.setTecnologiasClave("Java, Spring Boot, Kubernetes, PostgreSQL");
        profesional.setTitulacionesAcademicas("Grado en Ingenieria Informatica, Master en Desarrollo de Software");
        profesional.setIdiomas("Ingles C1, Frances B2");
        profesional.setSoftSkills("Liderazgo, comunicacion, trabajo en equipo, adaptabilidad");
        profesional.setAniosExperiencia(12);
        profesional.setRangoSalarialEsperadoMin(45000);
        profesional.setRangoSalarialEsperadoMax(60000);
        profesional.setDescripcionPersonal("Profesional senior orientado a arquitectura backend y equipos de alto rendimiento.");
        profesional.setAreaNegocio(AreaNegocioProfesional.TECNOLOGIA_IT);
        profesional.setDisponibilidad(DisponibilidadProfesional.OPEN_TO_OFFERS);
        profesional.setPerfilVisible(true);
        profesional.setActivo(true);
        profesional.setUserAccount(professionalAccount);
        profesionalSeniorRepository.save(profesional);

        // ── Additional demo professionals ──────────────────────────────────────────
        createProfessionalIfAbsent(
                "pro2@agileict.local", "demo1234",
                "Ana", "González",
                "Python, TensorFlow, PyTorch, Scikit-learn, Data Engineering",
                "Grado en Matemáticas, Máster en Inteligencia Artificial",
                "Inglés C2, Alemán B1",
                "Pensamiento analítico, resolución de problemas, comunicación",
                9, 50000, 70000,
                "Especialista en ML y análisis de datos con foco en producción.",
                AreaNegocioProfesional.INTELIGENCIA_ARTIFICIAL,
                DisponibilidadProfesional.AVAILABLE,
                UUID.fromString("55555555-5555-5555-5555-555555555555"),
                professionalRole
        );

        createProfessionalIfAbsent(
                "pro3@agileict.local", "demo1234",
                "Miguel", "Fernández",
                "React, TypeScript, Node.js, AWS, GraphQL",
                "Grado en Ingeniería Informática",
                "Inglés B2",
                "Creatividad, autonomía, adaptabilidad, trabajo en equipo",
                6, 38000, 52000,
                "Desarrollador fullstack especializado en arquitecturas cloud.",
                AreaNegocioProfesional.TECNOLOGIA_IT,
                DisponibilidadProfesional.OPEN_TO_OFFERS,
                UUID.fromString("66666666-6666-6666-6666-666666666666"),
                professionalRole
        );

        createProfessionalIfAbsent(
                "pro4@agileict.local", "demo1234",
                "Sofía", "Martínez",
                "Kubernetes, Docker, Terraform, CI/CD, Azure, GCP",
                "Grado en Sistemas Informáticos, Certificación CKA",
                "Inglés C1, Francés A2",
                "Liderazgo técnico, planificación, metodologías ágiles",
                10, 55000, 75000,
                "Ingeniera DevOps con amplia experiencia en plataformas cloud.",
                AreaNegocioProfesional.TECNOLOGIA_IT,
                DisponibilidadProfesional.AVAILABLE,
                UUID.fromString("77777777-7777-7777-7777-777777777777"),
                professionalRole
        );

        createProfessionalIfAbsent(
                "pro5@agileict.local", "demo1234",
                "Javier", "López",
                "Penetration Testing, SIEM, SOC, Splunk, ISO 27001",
                "Grado en Seguridad Informática, CISSP",
                "Inglés C1",
                "Pensamiento crítico, atención al detalle, ética profesional",
                8, 48000, 65000,
                "Especialista en ciberseguridad ofensiva y defensiva.",
                AreaNegocioProfesional.CIBERSEGURIDAD,
                DisponibilidadProfesional.OPEN_TO_OFFERS,
                UUID.fromString("88888888-8888-8888-8888-888888888888"),
                professionalRole
        );

        createProfessionalIfAbsent(
                "pro6@agileict.local", "demo1234",
                "Laura", "Rodríguez",
                "Spark, Kafka, Hadoop, SQL, dbt, Databricks",
                "Grado en Estadística, Máster en Big Data",
                "Inglés C1, Portugués B2",
                "Analítica, proactividad, gestión de proyectos",
                7, 45000, 62000,
                "Data Engineer especializada en pipelines de datos a gran escala.",
                AreaNegocioProfesional.DATA_ANALYTICS,
                DisponibilidadProfesional.AVAILABLE,
                UUID.fromString("99999999-9999-9999-9999-999999999999"),
                professionalRole
        );

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

    private void createProfessionalIfAbsent(
            String email, String password,
            String nombre, String apellidos,
            String tecnologias, String titulaciones,
            String idiomas, String softSkills,
            int anios, int salMin, int salMax,
            String descripcion,
            AreaNegocioProfesional area,
            DisponibilidadProfesional disponibilidad,
            UUID id, Role role) {

        if (profesionalSeniorRepository.findByEmail(email).isPresent()) {
            return;
        }

        UserAccount account = new UserAccount();
        account.setEmail(email);
        account.setPasswordHash(passwordEncoder.encode(password));
        account.getRoles().add(role);
        userAccountRepository.save(account);

        ProfesionalSenior p = new ProfesionalSenior();
        p.setId(id);
        p.setNombre(nombre);
        p.setApellidos(apellidos);
        p.setEmail(email);
        p.setTecnologiasClave(tecnologias);
        p.setTitulacionesAcademicas(titulaciones);
        p.setIdiomas(idiomas);
        p.setSoftSkills(softSkills);
        p.setAniosExperiencia(anios);
        p.setRangoSalarialEsperadoMin(salMin);
        p.setRangoSalarialEsperadoMax(salMax);
        p.setDescripcionPersonal(descripcion);
        p.setAreaNegocio(area);
        p.setDisponibilidad(disponibilidad);
        p.setPerfilVisible(true);
        p.setActivo(true);
        p.setUserAccount(account);
        profesionalSeniorRepository.save(p);
    }
}
