import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { listCompaniesWithBackend, registerRrhhWithBackend, type CompanyOption } from '../services/authService';
import { PATHS } from '../../../routes/paths';

export function RegisterRrhhPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [companySearch, setCompanySearch] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [responsableNombre, setResponsableNombre] = useState('');
  const [responsableApellidos, setResponsableApellidos] = useState('');
  const [responsableEmail, setResponsableEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCompanies() {
      setIsLoadingCompanies(true);
      try {
        const loadedCompanies = await listCompaniesWithBackend();
        if (!isMounted) {
          return;
        }

        setCompanies(loadedCompanies.filter((company) => company.activa));
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(err instanceof Error ? err.message : 'No se pudieron cargar las empresas.');
      } finally {
        if (isMounted) {
          setIsLoadingCompanies(false);
        }
      }
    }

    void loadCompanies();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const createdCompany = (location.state as { createdCompany?: CompanyOption } | null)?.createdCompany;
    if (!createdCompany) {
      return;
    }

    setCompanies((current) => {
      const alreadyExists = current.some((company) => company.id === createdCompany.id);
      const next = alreadyExists
        ? current.map((company) => (company.id === createdCompany.id ? createdCompany : company))
        : [createdCompany, ...current];

      return next.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
    });

    setSelectedCompanyId(createdCompany.id);
    setCompanySearch(createdCompany.nombre);
    setIsCompanyMenuOpen(false);
    navigate(PATHS.registerRrhh, { replace: true });
  }, [location.state, navigate]);

  const filteredCompanies = useMemo(() => {
    const query = companySearch.trim().toLowerCase();
    if (!query) {
      return companies;
    }

    return companies.filter((company) => {
      return company.nombre.toLowerCase().includes(query) || company.cif.toLowerCase().includes(query);
    });
  }, [companies, companySearch]);

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId],
  );

  function handleSearchChange(nextValue: string) {
    setCompanySearch(nextValue);
    setIsCompanyMenuOpen(true);

    if (!nextValue.trim() && selectedCompanyId) {
      setSelectedCompanyId('');
      return;
    }

    if (selectedCompany && !selectedCompany.nombre.toLowerCase().includes(nextValue.trim().toLowerCase())) {
      setSelectedCompanyId('');
    }
  }

  function handleSelectCompany(company: CompanyOption) {
    setSelectedCompanyId(company.id);
    setCompanySearch(company.nombre);
    setIsCompanyMenuOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('La confirmacion de contrasena no coincide.');
      return;
    }

    if (!selectedCompanyId) {
      setError('Debes seleccionar una empresa del listado o crear una nueva.');
      return;
    }

    setIsSubmitting(true);

    try {
      await registerRrhhWithBackend({
        empresaClienteId: selectedCompanyId,
        responsableNombre: responsableNombre.trim(),
        responsableApellidos: responsableApellidos.trim(),
        responsableEmail: responsableEmail.trim(),
        password,
      });

      navigate(PATHS.login, {
        replace: true,
        state: { registrationSuccess: 'Usuario RRHH creado correctamente. Ya puedes iniciar sesion.' },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el usuario RRHH.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="centered-screen auth-screen">
      <div className="card auth-card">
        <span className="badge">Alta RRHH</span>
        <h1>Crear usuario RRHH</h1>
        <p>Selecciona primero la empresa y luego completa los datos del responsable RRHH.</p>

        <form onSubmit={handleSubmit} className="form-stack">
          <article className="card">
            <h3>Empresa asociada</h3>
            <p>Busca por nombre o CIF y selecciona la empresa para asociar la cuenta RRHH.</p>

            <label>
              <span>Empresa</span>
              <div className="company-combobox">
                <input
                  value={companySearch}
                  onFocus={() => setIsCompanyMenuOpen(true)}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Escribe para buscar empresa por nombre o CIF"
                />
                <button
                  type="button"
                  className="button button-secondary button-small"
                  onClick={() => setIsCompanyMenuOpen((current) => !current)}
                  aria-label="Mostrar empresas"
                >
                  {isCompanyMenuOpen ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </label>

            {isLoadingCompanies ? <div className="selection-empty">Cargando empresas...</div> : null}

            {!isLoadingCompanies && isCompanyMenuOpen ? (
              <div className="company-combobox-menu">
                {filteredCompanies.length ? (
                  filteredCompanies.map((company) => (
                    <button
                      key={company.id}
                      type="button"
                      className={selectedCompanyId === company.id ? 'company-option company-option-selected' : 'company-option'}
                      onClick={() => handleSelectCompany(company)}
                    >
                      <strong>{company.nombre}</strong>
                      <span>{company.cif}</span>
                    </button>
                  ))
                ) : (
                  <div className="selection-empty">No se encontraron empresas para el filtro actual.</div>
                )}
              </div>
            ) : null}

            <div className="page-actions">
              <button type="button" className="button button-secondary" onClick={() => navigate(PATHS.registerCompany)}>
                Crear empresa
              </button>
            </div>

            {selectedCompany ? (
              <p>
                Empresa seleccionada: <strong>{selectedCompany.nombre}</strong> ({selectedCompany.cif})
              </p>
            ) : null}
          </article>

          <label>
            <span>Nombre del responsable</span>
            <input
              value={responsableNombre}
              onChange={(event) => setResponsableNombre(event.target.value)}
              required
            />
          </label>

          <label>
            <span>Apellidos del responsable</span>
            <input
              value={responsableApellidos}
              onChange={(event) => setResponsableApellidos(event.target.value)}
              required
            />
          </label>

          <label>
            <span>Email del responsable</span>
            <input
              type="email"
              value={responsableEmail}
              onChange={(event) => setResponsableEmail(event.target.value)}
              required
            />
          </label>

          <label>
            <span>Contrasena</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </label>

          <label>
            <span>Confirmar contrasena</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
            />
          </label>

          {error ? <div className="alert alert-error">{error}</div> : null}

          <button type="submit" className="button" disabled={isSubmitting}>
            {isSubmitting ? 'Creando...' : 'Crear usuario RRHH'}
          </button>
        </form>
      </div>

      <div className="return-actions">
        <Link to={PATHS.login} className="button button-secondary">
          Volver
        </Link>
      </div>
    </div>
  );
}
