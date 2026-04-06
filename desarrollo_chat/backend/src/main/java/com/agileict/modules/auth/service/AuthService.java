package com.agileict.modules.auth.service;

import com.agileict.common.exception.BusinessException;
import com.agileict.modules.auth.dto.AuthResponse;
import com.agileict.modules.auth.dto.CreateCompanyRequest;
import com.agileict.modules.auth.dto.LoginRequest;
import com.agileict.modules.auth.dto.RegisterCompanyRequest;
import com.agileict.modules.auth.dto.RegisterProfessionalRequest;
import com.agileict.modules.auth.dto.RegisterRrhhRequest;
import com.agileict.modules.auth.entity.Role;
import com.agileict.modules.auth.entity.UserAccount;
import com.agileict.modules.auth.repository.RoleRepository;
import com.agileict.modules.auth.repository.UserAccountRepository;
import com.agileict.modules.empresa.dto.EmpresaClienteResponse;
import com.agileict.modules.empresa.entity.EmpresaCliente;
import com.agileict.modules.empresa.repository.EmpresaClienteRepository;
import com.agileict.modules.profesional.entity.ProfesionalSenior;
import com.agileict.modules.profesional.repository.ProfesionalSeniorRepository;
import com.agileict.modules.responsable.entity.ResponsableRrhh;
import com.agileict.modules.responsable.repository.ResponsableRrhhRepository;
import com.agileict.modules.suscripcion.entity.Suscripcion;
import com.agileict.modules.suscripcion.repository.SuscripcionRepository;
import com.agileict.security.jwt.JwtService;
import com.agileict.shared.enums.DisponibilidadProfesional;
import com.agileict.shared.enums.EstadoSuscripcion;
import com.agileict.shared.enums.PlanSuscripcion;
import com.agileict.shared.enums.RoleName;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserAccountRepository userAccountRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmpresaClienteRepository empresaClienteRepository;
    private final ResponsableRrhhRepository responsableRrhhRepository;
    private final ProfesionalSeniorRepository profesionalSeniorRepository;
    private final SuscripcionRepository suscripcionRepository;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       UserAccountRepository userAccountRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       EmpresaClienteRepository empresaClienteRepository,
                       ResponsableRrhhRepository responsableRrhhRepository,
                       ProfesionalSeniorRepository profesionalSeniorRepository,
                       SuscripcionRepository suscripcionRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userAccountRepository = userAccountRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.empresaClienteRepository = empresaClienteRepository;
        this.responsableRrhhRepository = responsableRrhhRepository;
        this.profesionalSeniorRepository = profesionalSeniorRepository;
        this.suscripcionRepository = suscripcionRepository;
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        UserAccount user = userAccountRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("No existe el usuario indicado."));

        Set<String> roles = user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet());
        String token = jwtService.generateToken(user.getEmail(), Map.of("roles", roles));

        return new AuthResponse(token, new AuthResponse.UserSummary(user.getId(), user.getEmail(), roles));
    }

    @Transactional
    public AuthResponse registerProfessional(RegisterProfessionalRequest request) {
        ensureEmailAvailable(request.email());

        UserAccount account = new UserAccount();
        account.setEmail(request.email());
        account.setPasswordHash(passwordEncoder.encode(request.password()));
        account.getRoles().add(findRole(RoleName.ROLE_PROFESSIONAL));
        userAccountRepository.save(account);

        ProfesionalSenior profesional = new ProfesionalSenior();
        profesional.setNombre(request.nombre());
        profesional.setApellidos(request.apellidos());
        profesional.setEmail(request.email());
        profesional.setTecnologiasClave(request.tecnologiasClave());
        profesional.setTitulacionesAcademicas(request.titulacionesAcademicas());
        profesional.setIdiomas(request.idiomas());
        profesional.setSoftSkills(request.softSkills());
        profesional.setAniosExperiencia(request.aniosExperiencia());
        profesional.setRangoSalarialEsperadoMin(request.rangoSalarialEsperadoMin());
        profesional.setRangoSalarialEsperadoMax(request.rangoSalarialEsperadoMax());
        profesional.setDescripcionPersonal(request.descripcionPersonal());
        profesional.setDisponibilidad(DisponibilidadProfesional.OPEN_TO_OFFERS);
        profesional.setPerfilVisible(false);
        profesional.setActivo(true);
        profesional.setUserAccount(account);
        profesionalSeniorRepository.save(profesional);

        return login(new LoginRequest(request.email(), request.password()));
    }

    @Transactional
    public AuthResponse registerCompany(RegisterCompanyRequest request) {
        ensureEmailAvailable(request.responsableEmail());

        if (empresaClienteRepository.existsByCif(request.cif())) {
            throw new BusinessException("Ya existe una empresa registrada con ese CIF.");
        }

        EmpresaCliente empresa = new EmpresaCliente();
        empresa.setNombre(request.empresaNombre());
        empresa.setCif(request.cif());
        empresa.setSector(request.sector());
        empresa.setActiva(true);
        empresaClienteRepository.save(empresa);

        UserAccount account = new UserAccount();
        account.setEmail(request.responsableEmail());
        account.setPasswordHash(passwordEncoder.encode(request.password()));
        account.getRoles().add(findRole(RoleName.ROLE_RRHH));
        userAccountRepository.save(account);

        ResponsableRrhh responsable = new ResponsableRrhh();
        responsable.setNombre(request.responsableNombre());
        responsable.setApellidos(request.responsableApellidos());
        responsable.setEmail(request.responsableEmail());
        responsable.setCargo(request.cargo());
        responsable.setActivo(true);
        responsable.setEmpresaCliente(empresa);
        responsable.setUserAccount(account);
        responsableRrhhRepository.save(responsable);

        Suscripcion suscripcion = new Suscripcion();
        suscripcion.setEmpresaCliente(empresa);
        suscripcion.setPlan(PlanSuscripcion.BRONZE);
        suscripcion.setEstado(EstadoSuscripcion.ACTIVE);
        suscripcion.setFechaInicio(LocalDate.now());
        suscripcionRepository.save(suscripcion);

        return login(new LoginRequest(request.responsableEmail(), request.password()));
    }

    @Transactional(readOnly = true)
    public List<EmpresaClienteResponse> listCompanies() {
        return empresaClienteRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(EmpresaCliente::getNombre, String.CASE_INSENSITIVE_ORDER))
                .map(empresa -> new EmpresaClienteResponse(
                        empresa.getId(),
                        empresa.getNombre(),
                        empresa.getCif(),
                        empresa.getSector(),
                        empresa.isActiva()
                ))
                .toList();
    }

    @Transactional
    public EmpresaClienteResponse createCompany(CreateCompanyRequest request) {
        if (empresaClienteRepository.existsByCif(request.cif())) {
            throw new BusinessException("Ya existe una empresa registrada con ese CIF.");
        }

        EmpresaCliente empresa = new EmpresaCliente();
        empresa.setNombre(request.nombre());
        empresa.setCif(request.cif());
        empresa.setSector(request.sector());
        empresa.setActiva(true);
        EmpresaCliente saved = empresaClienteRepository.save(empresa);

        return new EmpresaClienteResponse(
                saved.getId(),
                saved.getNombre(),
                saved.getCif(),
                saved.getSector(),
                saved.isActiva()
        );
    }

    @Transactional
    public AuthResponse registerRrhh(RegisterRrhhRequest request) {
        ensureEmailAvailable(request.responsableEmail());

        EmpresaCliente empresa = empresaClienteRepository.findById(request.empresaClienteId())
                .orElseThrow(() -> new BusinessException("No existe la empresa seleccionada."));

        UserAccount account = new UserAccount();
        account.setEmail(request.responsableEmail());
        account.setPasswordHash(passwordEncoder.encode(request.password()));
        account.getRoles().add(findRole(RoleName.ROLE_RRHH));
        userAccountRepository.save(account);

        ResponsableRrhh responsable = new ResponsableRrhh();
        responsable.setNombre(request.responsableNombre());
        responsable.setApellidos(request.responsableApellidos());
        responsable.setEmail(request.responsableEmail());
        responsable.setCargo(request.cargo());
        responsable.setActivo(true);
        responsable.setEmpresaCliente(empresa);
        responsable.setUserAccount(account);
        responsableRrhhRepository.save(responsable);

        if (suscripcionRepository.findByEmpresaClienteId(empresa.getId()).isEmpty()) {
            Suscripcion suscripcion = new Suscripcion();
            suscripcion.setEmpresaCliente(empresa);
            suscripcion.setPlan(PlanSuscripcion.BRONZE);
            suscripcion.setEstado(EstadoSuscripcion.ACTIVE);
            suscripcion.setFechaInicio(LocalDate.now());
            suscripcionRepository.save(suscripcion);
        }

        return login(new LoginRequest(request.responsableEmail(), request.password()));
    }

    private Role findRole(RoleName roleName) {
        return roleRepository.findByName(roleName)
                .orElseThrow(() -> new BusinessException("No existe el rol " + roleName + "."));
    }

    private void ensureEmailAvailable(String email) {
        if (userAccountRepository.existsByEmail(email)) {
            throw new BusinessException("Ya existe una cuenta con ese email.");
        }
    }
}
