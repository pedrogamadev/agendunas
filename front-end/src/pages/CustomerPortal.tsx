import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import type { PageProps } from '../App'
import { useAuth } from '../context/AuthContext'
import { formatCpfForInput, sanitizeCpf } from '../utils/cpf'
import { fetchBrazilianStates, fetchCitiesByState } from '../api/locations'
import './AuthPortal.css'
import { Eye, EyeOff } from 'lucide-react'

type AuthMode = 'login' | 'register'

type CustomerPortalVariant = 'admin' | 'customer'

type OverlayStyle = CSSProperties & Record<'--auth-overlay-image', string>

type CustomerPortalProps = PageProps & {
  initialMode?: AuthMode
  variant?: CustomerPortalVariant
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  if (hidden) {
    return <EyeOff className="auth-portal__eye-icon" size={24} />
  }

  return <Eye className="auth-portal__eye-icon" size={24} />
}

function CustomerPortal({
  navigation,
  onNavigate,
  searchParams,
  initialMode = 'login',
  variant = 'customer',
}: CustomerPortalProps) {
  const { customerLogin, customerRegister, error, isAuthenticating, usuario, cliente } = useAuth()
  const [activeMode, setActiveMode] = useState<AuthMode>(initialMode)
  const [formError, setFormError] = useState<string | null>(null)
  const [lastSubmission, setLastSubmission] = useState<AuthMode | null>(null)

  const [loginCpf, setLoginCpf] = useState('')
  const [loginSenha, setLoginSenha] = useState('')
  const [isLoginPasswordVisible, setIsLoginPasswordVisible] = useState(false)

  const [registerStep, setRegisterStep] = useState(0)
  const [registerCpf, setRegisterCpf] = useState('')
  const [registerNome, setRegisterNome] = useState('')
  const [registerSobrenome, setRegisterSobrenome] = useState('')
  const [registerNascimento, setRegisterNascimento] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerEstado, setRegisterEstado] = useState('')
  const [registerCidade, setRegisterCidade] = useState('')
  const [registerSenha, setRegisterSenha] = useState('')
  const [registerConfirmacao, setRegisterConfirmacao] = useState('')
  const [isRegisterPasswordVisible, setIsRegisterPasswordVisible] = useState(false)
  const [isRegisterConfirmVisible, setIsRegisterConfirmVisible] = useState(false)
  const [stateOptions, setStateOptions] = useState<Awaited<ReturnType<typeof fetchBrazilianStates>>>([])
  const [cityOptions, setCityOptions] = useState<Awaited<ReturnType<typeof fetchCitiesByState>>>([])
  const [isLoadingStates, setIsLoadingStates] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const isRegisterFirstStep = registerStep === 0

  const overlayStyle = useMemo<OverlayStyle>(() => {
    const image =
      activeMode === 'login'
        ? "url('/images/guias/Turma_duninho_trilha.png')"
        : "url('/images/guias/tuma_duninho_fogueira.png')"
    return {
      '--auth-overlay-image': image,
    }
  }, [activeMode])

  const redirectTarget = useMemo(() => {
    const redirect = searchParams.get('redirect')
    if (redirect && redirect.startsWith('/')) {
      return redirect
    }
    return '/'
  }, [searchParams])

  useEffect(() => {
    setActiveMode(initialMode)
  }, [initialMode])

  useEffect(() => {
    const account = usuario ?? cliente
    if (!account) {
      return
    }

    if (usuario?.tipo === 'A') {
      onNavigate('/admin')
      return
    }

    onNavigate(redirectTarget)
  }, [cliente, onNavigate, redirectTarget, usuario])

  useEffect(() => {
    setFormError(null)
    setLastSubmission(null)
    setRegisterStep(0)
  }, [activeMode])

  useEffect(() => {
    let cancelled = false

    async function loadStates() {
      setIsLoadingStates(true)
      try {
        const states = await fetchBrazilianStates()
        if (!cancelled) {
          setStateOptions(states)
          setLocationError(null)
        }
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          setLocationError('Não foi possível carregar os estados. Tente novamente mais tarde.')
        }
      } finally {
        if (!cancelled) {
          setIsLoadingStates(false)
        }
      }
    }

    loadStates()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    if (!registerEstado) {
      setCityOptions([])
      setRegisterCidade('')
      setLocationError(null)
      return () => {
        cancelled = true
      }
    }

    async function loadCities() {
      setIsLoadingCities(true)
      setLocationError(null)
      try {
        const cities = await fetchCitiesByState(registerEstado)
        if (!cancelled) {
          setCityOptions(cities)
        }
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          setCityOptions([])
          setLocationError('Não foi possível carregar as cidades. Tente novamente mais tarde.')
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCities(false)
        }
      }
    }

    setCityOptions([])
    setRegisterCidade('')
    loadCities()

    return () => {
      cancelled = true
    }
  }, [registerEstado])

  const displayedError = formError ?? (lastSubmission === activeMode ? error : null)

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setLastSubmission('login')

    const normalizedCpf = sanitizeCpf(loginCpf)

    if (normalizedCpf.length !== 11) {
      setFormError('Informe um CPF válido com 11 dígitos.')
      return
    }

    if (loginSenha.trim().length < 8) {
      setFormError('A senha deve ter no mínimo 8 caracteres.')
      return
    }

    try {
      const response = await customerLogin({ cpf: normalizedCpf, senha: loginSenha })
      const destination = response.usuario?.tipo === 'A' ? '/admin' : redirectTarget
      onNavigate(destination)
    } catch (err) {
      // O ERRO ESTAVA AQUI: Antes você usava 'apiError' que não existia.
      // Agora estamos pegando a mensagem corretamente da variável 'err'.
      const message = err instanceof Error ? err.message : 'Não foi possível entrar. Tente novamente.'
      setFormError(message)
    }
  }

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    const normalizedCpf = sanitizeCpf(registerCpf)
    const trimmedNome = registerNome.trim()
    const trimmedSobrenome = registerSobrenome.trim()

    if (registerStep === 0) {
      if (trimmedNome.length < 2) {
        setFormError('Informe seu nome.')
        return
      }

      if (trimmedSobrenome.length < 2) {
        setFormError('Informe seu sobrenome.')
        return
      }

      if (normalizedCpf.length !== 11) {
        setFormError('Informe um CPF válido com 11 dígitos.')
        return
      }

      setRegisterStep(1)
      setLastSubmission(null)
      return
    }

    const trimmedEmail = registerEmail.trim()
    const trimmedCidade = registerCidade.trim()

    if (!registerNascimento) {
      setFormError('Informe sua data de nascimento.')
      return
    }

    const birthDate = new Date(registerNascimento)
    if (Number.isNaN(birthDate.getTime())) {
      setFormError('Informe uma data de nascimento válida.')
      return
    }

    if (birthDate > new Date()) {
      setFormError('A data de nascimento não pode estar no futuro.')
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setFormError('Informe um e-mail válido.')
      return
    }

    if (!registerEstado) {
      setFormError('Selecione o estado de origem.')
      return
    }

    if (trimmedCidade.length < 2) {
      setFormError('Selecione sua cidade de origem.')
      return
    }

    if (registerSenha.trim().length < 8) {
      setFormError('A senha deve ter no mínimo 8 caracteres.')
      return
    }

    if (registerSenha !== registerConfirmacao) {
      setFormError('As senhas informadas não conferem.')
      return
    }

    setLastSubmission('register')

    try {
      const response = await customerRegister({
        cpf: normalizedCpf,
        nome: trimmedNome,
        sobrenome: trimmedSobrenome,
        dataNascimento: registerNascimento,
        email: trimmedEmail,
        cidadeOrigem: `${trimmedCidade} - ${registerEstado.toUpperCase()}`,
        senha: registerSenha,
        confirmacaoSenha: registerConfirmacao,
      })

      const destination = response.usuario?.tipo === 'A' ? '/admin' : redirectTarget
      onNavigate(destination)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível concluir o cadastro.'
      setFormError(message)
    }
  }

  return (
    <div className={`auth-portal auth-portal--${variant} auth-portal--${activeMode}`}>
      {navigation}
      <div className="auth-portal__backdrop" aria-hidden="true" />
      <div className="auth-portal__card">
        <section
          className={`auth-portal__pane auth-portal__pane--login ${activeMode === 'login' ? 'is-active' : ''}`}
          aria-hidden={activeMode !== 'login'}
        >
          <div className="auth-portal__form-surface auth-portal__form-surface--login">
            <h2>Bem-vindo de volta</h2>
            <p>Entre com seu CPF e senha para acessar o espaço do cliente.</p>
            {displayedError && <div className="auth-portal__error" role="alert">{displayedError}</div>}
            <form className="auth-portal__form" onSubmit={handleLoginSubmit}>
              <div className="auth-portal__field">
                <label htmlFor="customer-login-cpf">CPF</label>
                <input
                  id="customer-login-cpf"
                  name="cpf"
                  inputMode="numeric"
                  autoComplete="username"
                  placeholder="000.000.000-00"
                  value={formatCpfForInput(loginCpf)}
                  onChange={(event) => setLoginCpf(sanitizeCpf(event.target.value))}
                  maxLength={14}
                  required
                />
              </div>
              <div className="auth-portal__field auth-portal__field--password">
                <label htmlFor="customer-login-password">Senha</label>
                <div className="auth-portal__password-wrapper">
                  <input
                    id="customer-login-password"
                    name="senha"
                    type={isLoginPasswordVisible ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={loginSenha}
                    onChange={(event) => setLoginSenha(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-portal__password-toggle"
                    aria-label={isLoginPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                    onClick={() => setIsLoginPasswordVisible((current) => !current)}
                  >
                    <EyeIcon hidden={!isLoginPasswordVisible} />
                  </button>
                </div>
              </div>
              <button className="auth-portal__submit" type="submit" disabled={isAuthenticating}>
                {isAuthenticating && lastSubmission === 'login' ? 'Entrando…' : 'Entrar'}
              </button>
            </form>
          </div>
        </section>
        <section
          className={`auth-portal__pane auth-portal__pane--register ${activeMode === 'register' ? 'is-active' : ''}`}
          aria-hidden={activeMode !== 'register'}
        >
          <div className="auth-portal__form-surface auth-portal__form-surface--register">
            <h2>Crie sua conta</h2>
            <p>Cadastre-se para acompanhar agendamentos e novidades do parque.</p>
            <div className="auth-portal__stepper" aria-live="polite">
              <span className={isRegisterFirstStep ? 'is-active' : ''}>1. Dados pessoais</span>
              <span className={!isRegisterFirstStep ? 'is-active' : ''}>2. Acesso</span>
            </div>
            {displayedError && <div className="auth-portal__error" role="alert">{displayedError}</div>}
            <form className="auth-portal__form" onSubmit={handleRegisterSubmit}>
              <div className={`auth-portal__step ${isRegisterFirstStep ? 'is-active' : ''}`}>
                <div className="auth-portal__field-group">
                  <div className="auth-portal__field">
                    <label htmlFor="customer-register-nome">Nome</label>
                    <input
                      id="customer-register-nome"
                      name="nome"
                      value={registerNome}
                      onChange={(event) => setRegisterNome(event.target.value)}
                      autoComplete="given-name"
                      disabled={!isRegisterFirstStep}
                      required
                    />
                  </div>
                  <div className="auth-portal__field">
                    <label htmlFor="customer-register-sobrenome">Sobrenome</label>
                    <input
                      id="customer-register-sobrenome"
                      name="sobrenome"
                      value={registerSobrenome}
                      onChange={(event) => setRegisterSobrenome(event.target.value)}
                      autoComplete="family-name"
                      disabled={!isRegisterFirstStep}
                      required
                    />
                  </div>
                </div>
                <div className="auth-portal__field">
                  <label htmlFor="customer-register-cpf">CPF</label>
                  <input
                    id="customer-register-cpf"
                    name="cpf"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    value={formatCpfForInput(registerCpf)}
                    onChange={(event) => setRegisterCpf(sanitizeCpf(event.target.value))}
                    maxLength={14}
                    disabled={!isRegisterFirstStep}
                    required
                  />
                </div>
              </div>
              <div className={`auth-portal__step ${!isRegisterFirstStep ? 'is-active' : ''}`}>
                <div className="auth-portal__field-group">
                  <div className="auth-portal__field">
                    <label htmlFor="customer-register-birth">Data de nascimento</label>
                    <input
                      id="customer-register-birth"
                      name="dataNascimento"
                      type="date"
                      value={registerNascimento}
                      onChange={(event) => setRegisterNascimento(event.target.value)}
                      disabled={isRegisterFirstStep}
                      required
                    />
                  </div>
                  <div className="auth-portal__field">
                    <label htmlFor="customer-register-email">E-mail</label>
                    <input
                      id="customer-register-email"
                      name="email"
                      type="email"
                      value={registerEmail}
                      onChange={(event) => setRegisterEmail(event.target.value)}
                      autoComplete="email"
                      disabled={isRegisterFirstStep}
                      required
                    />
                  </div>
                </div>
                <div className="auth-portal__field-group">
                  <div className="auth-portal__field">
                    <label htmlFor="customer-register-estado">Estado de origem</label>
                    <select
                      id="customer-register-estado"
                      name="estado"
                      value={registerEstado}
                      onChange={(event) => setRegisterEstado(event.target.value)}
                      disabled={isRegisterFirstStep || isLoadingStates}
                      required
                    >
                      <option value="">
                        {isLoadingStates ? 'Carregando estados…' : 'Selecione um estado'}
                      </option>
                      {stateOptions.map((state) => (
                        <option key={state.id} value={state.abbreviation}>
                          {state.name} ({state.abbreviation})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="auth-portal__field">
                    <label htmlFor="customer-register-cidade">Cidade de origem</label>
                    <select
                      id="customer-register-cidade"
                      name="cidadeOrigem"
                      value={registerCidade}
                      onChange={(event) => setRegisterCidade(event.target.value)}
                      disabled={
                        isRegisterFirstStep || !registerEstado || isLoadingCities || cityOptions.length === 0
                      }
                      required
                    >
                      <option value="">
                        {registerEstado
                          ? isLoadingCities
                            ? 'Carregando cidades…'
                            : 'Selecione uma cidade'
                          : 'Selecione um estado primeiro'}
                      </option>
                      {cityOptions.map((city) => (
                        <option key={city.id} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {locationError && <p className="auth-portal__inline-error">{locationError}</p>}
                <div className="auth-portal__field-group">
                  <div className="auth-portal__field auth-portal__field--password">
                    <label htmlFor="customer-register-senha">Senha</label>
                    <div className="auth-portal__password-wrapper">
                      <input
                        id="customer-register-senha"
                        name="senha"
                        type={isRegisterPasswordVisible ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={registerSenha}
                        onChange={(event) => setRegisterSenha(event.target.value)}
                        disabled={isRegisterFirstStep}
                        required
                      />
                      <button
                        type="button"
                        className="auth-portal__password-toggle"
                        aria-label={isRegisterPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                        onClick={() => setIsRegisterPasswordVisible((current) => !current)}
                      >
                        <EyeIcon hidden={!isRegisterPasswordVisible} />
                      </button>
                    </div>
                  </div>
                  <div className="auth-portal__field auth-portal__field--password">
                    <label htmlFor="customer-register-confirmacao">Confirmar senha</label>
                    <div className="auth-portal__password-wrapper">
                      <input
                        id="customer-register-confirmacao"
                        name="confirmacaoSenha"
                        type={isRegisterConfirmVisible ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={registerConfirmacao}
                        onChange={(event) => setRegisterConfirmacao(event.target.value)}
                        disabled={isRegisterFirstStep}
                        required
                      />
                      <button
                        type="button"
                        className="auth-portal__password-toggle"
                        aria-label={
                          isRegisterConfirmVisible
                            ? 'Ocultar confirmação de senha'
                            : 'Mostrar confirmação de senha'
                        }
                        onClick={() => setIsRegisterConfirmVisible((current) => !current)}
                      >
                        <EyeIcon hidden={!isRegisterConfirmVisible} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="auth-portal__step-actions">
                {!isRegisterFirstStep && (
                  <button
                    type="button"
                    className="auth-portal__ghost"
                    onClick={() => {
                      setFormError(null)
                      setLocationError(null)
                      setLastSubmission(null)
                      setRegisterStep(0)
                    }}
                  >
                    Voltar
                  </button>
                )}
                <button className="auth-portal__submit" type="submit" disabled={isAuthenticating}>
                  {isRegisterFirstStep
                    ? 'Próximo'
                    : isAuthenticating && lastSubmission === 'register'
                      ? 'Cadastrando…'
                      : 'Criar conta'}
                </button>
              </div>
            </form>
          </div>
        </section>
        <aside
          className={`auth-portal__overlay auth-portal__overlay--${activeMode}`}
          aria-hidden="true"
          style={overlayStyle}
        >
          <div className="auth-portal__overlay-content">
            <img className="auth-portal__overlay-logo" src="/agendunaslogo.png" alt="Logo AgenDunas" />
            <h2>{activeMode === 'login' ? 'Ainda não tem conta?' : 'Já possui cadastro?'}</h2>
            <p>
              {activeMode === 'login'
                ? 'Crie uma conta para aproveitar ao máximo as experiências da AgenDunas.'
                : 'Acesse o espaço do cliente e continue explorando com a gente.'}
            </p>
            <button
              type="button"
              className="auth-portal__overlay-cta"
              onClick={() => setActiveMode((mode) => (mode === 'login' ? 'register' : 'login'))}
            >
              {activeMode === 'login' ? 'Quero me cadastrar' : 'Já tenho conta'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default CustomerPortal
