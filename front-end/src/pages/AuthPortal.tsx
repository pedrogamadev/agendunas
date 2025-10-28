import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { PageProps } from '../App'
import { useAuth } from '../context/AuthContext'
import { formatCpfForInput, sanitizeCpf } from '../utils/cpf'
import './AuthPortal.css'

type AuthMode = 'login' | 'register'

type AuthVariant = 'admin' | 'customer'

type AuthPortalProps = PageProps & {
  initialMode: AuthMode
  variant: AuthVariant
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg
      className="auth-portal__eye-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 5C6.5 5 2 9.5 2 12s4.5 7 10 7 10-4.5 10-7-4.5-7-10-7Zm0 12c-3.3 0-6.5-2.9-7.9-5 .8-1.3 2-2.5 3.4-3.4L6 7.1l1.1-1.1 12 12-1.1 1.1-1.7-1.7c-1.3.7-2.7 1.1-4.3 1.1Zm5.3-2.1-2.1-2.1a3.5 3.5 0 0 0-4.1-4.1L9 6.8c.9-.3 1.9-.5 3-.5 3.3 0 6.5 2.9 7.9 5-.6 1.1-1.6 2.2-2.6 3.1Z"
        opacity={hidden ? 0.25 : 1}
      />
      {hidden && (
        <path
          d="m4 4 16 16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

function AuthPortal({ navigation, onNavigate, searchParams, initialMode, variant }: AuthPortalProps) {
  const { adminLogin, adminRegister, error, isAuthenticating, user } = useAuth()
  const [activeMode, setActiveMode] = useState<AuthMode>(initialMode)
  const [formError, setFormError] = useState<string | null>(null)
  const [lastSubmission, setLastSubmission] = useState<AuthMode | null>(null)
  const [registerStep, setRegisterStep] = useState<0 | 1>(0)

  const [loginCpf, setLoginCpf] = useState('')
  const [loginSenha, setLoginSenha] = useState('')
  const [isLoginPasswordVisible, setIsLoginPasswordVisible] = useState(false)

  const [registerCpf, setRegisterCpf] = useState('')
  const [registerToken, setRegisterToken] = useState('')
  const [registerNome, setRegisterNome] = useState('')
  const [registerSenha, setRegisterSenha] = useState('')
  const [registerConfirmacao, setRegisterConfirmacao] = useState('')
  const [isRegisterTokenVisible, setIsRegisterTokenVisible] = useState(false)
  const [isRegisterPasswordVisible, setIsRegisterPasswordVisible] = useState(false)
  const [isRegisterConfirmVisible, setIsRegisterConfirmVisible] = useState(false)

  const redirectTarget = useMemo(() => {
    const redirect = searchParams.get('redirect')
    if (redirect && redirect.startsWith('/')) {
      return redirect
    }
    return '/admin'
  }, [searchParams])

  useEffect(() => {
    setActiveMode(initialMode)
  }, [initialMode])

  useEffect(() => {
    if (user) {
      const destination = user.tipo === 'A' ? redirectTarget : '/'
      onNavigate(destination)
    }
  }, [user, redirectTarget, onNavigate])

  useEffect(() => {
    setFormError(null)
    setLastSubmission(null)
    setRegisterStep(0)
  }, [activeMode])

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
      const response = await adminLogin({ cpf: normalizedCpf, senha: loginSenha })
      const destination = response.usuario?.tipo === 'A' ? redirectTarget : '/'
      onNavigate(destination)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível entrar. Tente novamente.'
      setFormError(message)
    }
  }

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const normalizedCpf = sanitizeCpf(registerCpf)

    if (registerStep === 0) {
      if (!registerNome.trim()) {
        setFormError('Informe seu nome completo para continuar.')
        return
      }

      if (normalizedCpf.length !== 11) {
        setFormError('Informe um CPF válido com 11 dígitos.')
        return
      }

      setRegisterStep(1)
      return
    }

    setLastSubmission('register')

    if (normalizedCpf.length !== 11) {
      setFormError('Informe um CPF válido com 11 dígitos.')
      setRegisterStep(0)
      return
    }

    if (!registerToken.trim()) {
      setFormError('Informe o token fornecido pelo administrador.')
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

    try {
      const response = await adminRegister({
        cpf: normalizedCpf,
        token: registerToken.trim(),
        senha: registerSenha,
        confirmacaoSenha: registerConfirmacao,
        nome: registerNome.trim() || undefined,
      })

      const destination = response.usuario?.tipo === 'A' ? redirectTarget : '/'
      onNavigate(destination)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível concluir o cadastro.'
      setFormError(message)
    }
  }

  const isRegisterFirstStep = registerStep === 0

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
            <h2>Faça login</h2>
            <p>Entre com suas credenciais para continuar o trabalho.</p>
            {displayedError && <div className="auth-portal__error" role="alert">{displayedError}</div>}
            <form className="auth-portal__form" onSubmit={handleLoginSubmit}>
              <div className="auth-portal__field">
                <label htmlFor="login-cpf">CPF</label>
                <input
                  id="login-cpf"
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
                <label htmlFor="login-senha">Senha</label>
                <div className="auth-portal__input-wrapper">
                  <input
                    id="login-senha"
                    name="senha"
                    type={isLoginPasswordVisible ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="********"
                    value={loginSenha}
                    onChange={(event) => setLoginSenha(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-portal__toggle-visibility"
                    onClick={() => setIsLoginPasswordVisible((state) => !state)}
                    aria-label={isLoginPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    <EyeIcon hidden={!isLoginPasswordVisible} />
                  </button>
                </div>
              </div>
              <div className="auth-portal__form-actions">
                <label className="auth-portal__remember">
                  <input type="checkbox" disabled />
                  <span>Lembrar-me</span>
                </label>
                <button type="button" className="auth-portal__link" disabled>
                  Esqueci minha senha
                </button>
              </div>
              <button type="submit" className="auth-portal__submit" disabled={isAuthenticating}>
                {isAuthenticating && lastSubmission === 'login' ? 'Entrando…' : 'Entrar'}
              </button>
              <p className="auth-portal__switch">
                Quer fazer parte da equipe?{' '}
                <button type="button" onClick={() => setActiveMode('register')}>
                  Criar conta
                </button>
              </p>
            </form>
          </div>
        </section>
        <section
          className={`auth-portal__pane auth-portal__pane--register ${activeMode === 'register' ? 'is-active' : ''}`}
          aria-hidden={activeMode !== 'register'}
        >
          <div className="auth-portal__form-surface auth-portal__form-surface--register">
            <h2>Crie sua conta fácil</h2>
            <p>Preencha seus dados para liberar o acesso ao painel do AgenDunas de forma simples.</p>
            <div className="auth-portal__stepper" aria-live="polite">
              <span className={isRegisterFirstStep ? 'is-active' : ''}>1. Dados pessoais</span>
              <span className={!isRegisterFirstStep ? 'is-active' : ''}>2. Segurança</span>
            </div>
            {displayedError && <div className="auth-portal__error" role="alert">{displayedError}</div>}
            <form className="auth-portal__form" onSubmit={handleRegisterSubmit}>
              <div className={`auth-portal__step ${isRegisterFirstStep ? 'is-active' : ''}`}>
                <div className="auth-portal__field">
                  <label htmlFor="register-nome">Nome completo</label>
                  <input
                    id="register-nome"
                    name="nome"
                    placeholder="Seu nome"
                    value={registerNome}
                    onChange={(event) => setRegisterNome(event.target.value)}
                    disabled={!isRegisterFirstStep}
                    required
                  />
                </div>
                <div className="auth-portal__field">
                  <label htmlFor="register-cpf">CPF</label>
                  <input
                    id="register-cpf"
                    name="cpf"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    value={formatCpfForInput(registerCpf)}
                    onChange={(event) => setRegisterCpf(sanitizeCpf(event.target.value))}
                    maxLength={14}
                    required
                    disabled={!isRegisterFirstStep}
                  />
                </div>
              </div>
              <div className={`auth-portal__step ${!isRegisterFirstStep ? 'is-active' : ''}`}>
                <div className="auth-portal__field auth-portal__field--password">
                  <label htmlFor="register-token">Token do administrador</label>
                  <div className="auth-portal__input-wrapper">
                    <input
                      id="register-token"
                      name="token"
                      type={isRegisterTokenVisible ? 'text' : 'password'}
                      placeholder="Cole o código recebido"
                      value={registerToken}
                      onChange={(event) => setRegisterToken(event.target.value.trimStart())}
                      required
                      disabled={isRegisterFirstStep}
                    />
                    <button
                      type="button"
                      className="auth-portal__toggle-visibility"
                      onClick={() => setIsRegisterTokenVisible((state) => !state)}
                      aria-label={isRegisterTokenVisible ? 'Ocultar token' : 'Mostrar token'}
                    >
                      <EyeIcon hidden={!isRegisterTokenVisible} />
                    </button>
                  </div>
                </div>
                <div className="auth-portal__field auth-portal__field--password">
                  <label htmlFor="register-senha">Senha</label>
                  <div className="auth-portal__input-wrapper">
                    <input
                      id="register-senha"
                      name="senha"
                      type={isRegisterPasswordVisible ? 'text' : 'password'}
                      placeholder="Crie uma senha segura"
                      value={registerSenha}
                      onChange={(event) => setRegisterSenha(event.target.value)}
                      required
                      disabled={isRegisterFirstStep}
                    />
                    <button
                      type="button"
                      className="auth-portal__toggle-visibility"
                      onClick={() => setIsRegisterPasswordVisible((state) => !state)}
                      aria-label={isRegisterPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      <EyeIcon hidden={!isRegisterPasswordVisible} />
                    </button>
                  </div>
                </div>
                <div className="auth-portal__field auth-portal__field--password">
                  <label htmlFor="register-confirmacao">Confirmar senha</label>
                  <div className="auth-portal__input-wrapper">
                    <input
                      id="register-confirmacao"
                      name="confirmacaoSenha"
                      type={isRegisterConfirmVisible ? 'text' : 'password'}
                      placeholder="Repita a senha"
                      value={registerConfirmacao}
                      onChange={(event) => setRegisterConfirmacao(event.target.value)}
                      required
                      disabled={isRegisterFirstStep}
                    />
                    <button
                      type="button"
                      className="auth-portal__toggle-visibility"
                      onClick={() => setIsRegisterConfirmVisible((state) => !state)}
                      aria-label={isRegisterConfirmVisible ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                    >
                      <EyeIcon hidden={!isRegisterConfirmVisible} />
                    </button>
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
                      setRegisterStep(0)
                    }}
                  >
                    Voltar
                  </button>
                )}
                <button type="submit" className="auth-portal__submit" disabled={isAuthenticating}>
                  {isRegisterFirstStep
                    ? 'Próximo'
                    : isAuthenticating && lastSubmission === 'register'
                      ? 'Criando conta…'
                      : 'Criar conta'}
                </button>
              </div>
              <p className="auth-portal__switch">
                Já possui credenciais?{' '}
                <button type="button" onClick={() => setActiveMode('login')}>
                  Fazer login
                </button>
              </p>
            </form>
          </div>
        </section>
        <aside className={`auth-portal__overlay auth-portal__overlay--${activeMode}`}>
          <div className="auth-portal__overlay-content">
            <img src="/agendunaslogo.png" alt="Agendunas" className="auth-portal__overlay-logo" />
            <h2>{activeMode === 'login' ? 'Seja bem vindo de volta' : 'Crie sua conta agora'}</h2>
            <p>
              {activeMode === 'login'
                ? 'Use suas credenciais para retomar a organização dos atendimentos e manter o fluxo em dia.'
                : 'Basta alguns passos para fazer parte do Agendunas e administrar seus atendimentos com agilidade.'}
            </p>
            <button
              type="button"
              className="auth-portal__overlay-cta"
              onClick={() => setActiveMode(activeMode === 'login' ? 'register' : 'login')}
            >
              {activeMode === 'login' ? 'Criar conta' : 'Fazer login'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default AuthPortal
