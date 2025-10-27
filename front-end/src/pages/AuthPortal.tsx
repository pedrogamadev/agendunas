import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { PageProps } from '../App'
import { useAuth } from '../context/AuthContext'
import './AuthPortal.css'

type AuthMode = 'login' | 'register'

type AuthPortalProps = PageProps & {
  initialMode: AuthMode
}

function sanitizeCpf(value: string) {
  return value.replace(/\D/g, '').slice(0, 11)
}

function AuthPortal({ navigation, onNavigate, searchParams, initialMode }: AuthPortalProps) {
  const { login, register, error, isAuthenticating, user } = useAuth()
  const [activeMode, setActiveMode] = useState<AuthMode>(initialMode)
  const [formError, setFormError] = useState<string | null>(null)
  const [lastSubmission, setLastSubmission] = useState<AuthMode | null>(null)

  const [loginCpf, setLoginCpf] = useState('')
  const [loginSenha, setLoginSenha] = useState('')

  const [registerCpf, setRegisterCpf] = useState('')
  const [registerToken, setRegisterToken] = useState('')
  const [registerNome, setRegisterNome] = useState('')
  const [registerSenha, setRegisterSenha] = useState('')
  const [registerConfirmacao, setRegisterConfirmacao] = useState('')

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
      const response = await login({ cpf: normalizedCpf, senha: loginSenha })
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
    setLastSubmission('register')

    const normalizedCpf = sanitizeCpf(registerCpf)

    if (normalizedCpf.length !== 11) {
      setFormError('Informe um CPF válido com 11 dígitos.')
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
      const response = await register({
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

  const toggleMode = () => {
    setActiveMode((current) => (current === 'login' ? 'register' : 'login'))
  }

  return (
    <div className={`auth-portal auth-portal--${activeMode}`}>
      {navigation}
      <div className="auth-portal__backdrop" aria-hidden="true" />
      <div className="auth-portal__card">
        <div className="auth-portal__viewport">
          <div
            className="auth-portal__slider"
            style={{ transform: activeMode === 'login' ? 'translateX(0)' : 'translateX(-50%)' }}
          >
            <section className="auth-portal__pane auth-portal__pane--login" aria-hidden={activeMode !== 'login'}>
              <div className="auth-portal__column auth-portal__column--visual">
                <div className="auth-portal__overlay" />
                <div className="auth-portal__copy">
                  <span className="auth-portal__badge">Seja bem-vindo</span>
                  <h1>
                    Pronto para começar sua jornada? <span>Entre e explore um mundo de possibilidades.</span>
                  </h1>
                  <p>
                    Acompanhe reservas, personalize experiências e conecte-se com quem ama o Parque das Dunas.
                  </p>
                  <button type="button" className="auth-portal__cta" onClick={() => setActiveMode('register')}>
                    Criar conta
                  </button>
                </div>
              </div>
              <div className="auth-portal__column auth-portal__column--form">
                <div className="auth-portal__form-surface auth-portal__form-surface--login">
                  <h2>Faça login</h2>
                  <p>Acesse sua conta para administrar trilhas, agendas e a equipe do AgenDunas.</p>
                  {displayedError && <div className="auth-portal__error" role="alert">{displayedError}</div>}
                  <form className="auth-portal__form" onSubmit={handleLoginSubmit}>
                    <div className="auth-portal__field">
                      <label htmlFor="login-cpf">E-mail ou usuário</label>
                      <input
                        id="login-cpf"
                        name="cpf"
                        inputMode="numeric"
                        autoComplete="username"
                        placeholder="00000000000"
                        value={loginCpf}
                        onChange={(event) => setLoginCpf(sanitizeCpf(event.target.value))}
                        required
                      />
                    </div>
                    <div className="auth-portal__field">
                      <label htmlFor="login-senha">Senha</label>
                      <input
                        id="login-senha"
                        name="senha"
                        type="password"
                        autoComplete="current-password"
                        placeholder="********"
                        value={loginSenha}
                        onChange={(event) => setLoginSenha(event.target.value)}
                        required
                      />
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
              </div>
            </section>
            <section
              className="auth-portal__pane auth-portal__pane--register"
              aria-hidden={activeMode !== 'register'}
            >
              <div className="auth-portal__column auth-portal__column--form">
                <div className="auth-portal__form-surface auth-portal__form-surface--register">
                  <h2>Crie sua conta</h2>
                  <p>Vamos criar sua conta. Sua nova aventura começa aqui — preencha seus dados e junte-se a nós.</p>
                  {displayedError && <div className="auth-portal__error" role="alert">{displayedError}</div>}
                  <form className="auth-portal__form" onSubmit={handleRegisterSubmit}>
                    <div className="auth-portal__field">
                      <label htmlFor="register-nome">Nome completo</label>
                      <input
                        id="register-nome"
                        name="nome"
                        placeholder="Seu nome"
                        value={registerNome}
                        onChange={(event) => setRegisterNome(event.target.value)}
                      />
                    </div>
                    <div className="auth-portal__field">
                      <label htmlFor="register-cpf">CPF</label>
                      <input
                        id="register-cpf"
                        name="cpf"
                        inputMode="numeric"
                        placeholder="00000000000"
                        value={registerCpf}
                        onChange={(event) => setRegisterCpf(sanitizeCpf(event.target.value))}
                        required
                      />
                    </div>
                    <div className="auth-portal__field">
                      <label htmlFor="register-token">Token do administrador</label>
                      <input
                        id="register-token"
                        name="token"
                        placeholder="Cole o código recebido"
                        value={registerToken}
                        onChange={(event) => setRegisterToken(event.target.value.trimStart())}
                        required
                      />
                    </div>
                    <div className="auth-portal__field">
                      <label htmlFor="register-senha">Senha</label>
                      <input
                        id="register-senha"
                        name="senha"
                        type="password"
                        placeholder="Crie uma senha segura"
                        value={registerSenha}
                        onChange={(event) => setRegisterSenha(event.target.value)}
                        required
                      />
                    </div>
                    <div className="auth-portal__field">
                      <label htmlFor="register-confirmacao">Confirmar senha</label>
                      <input
                        id="register-confirmacao"
                        name="confirmacaoSenha"
                        type="password"
                        placeholder="Repita a senha"
                        value={registerConfirmacao}
                        onChange={(event) => setRegisterConfirmacao(event.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="auth-portal__submit" disabled={isAuthenticating}>
                      {isAuthenticating && lastSubmission === 'register' ? 'Criando conta…' : 'Criar conta'}
                    </button>
                    <p className="auth-portal__switch">
                      Já possui credenciais?{' '}
                      <button type="button" onClick={() => setActiveMode('login')}>
                        Fazer login
                      </button>
                    </p>
                  </form>
                </div>
              </div>
              <div className="auth-portal__column auth-portal__column--visual">
                <div className="auth-portal__overlay" />
                <div className="auth-portal__copy">
                  <span className="auth-portal__badge">Equipe em expansão</span>
                  <h1>
                    Compartilhe o parque com mais pessoas. <span>Faça parte da nossa rede de especialistas.</span>
                  </h1>
                  <p>
                    Ative seu convite com o token recebido e ajude a guiar visitantes com experiências únicas e seguras.
                  </p>
                  <button type="button" className="auth-portal__cta" onClick={() => setActiveMode('login')}>
                    Fazer login
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
        <div className="auth-portal__mode-toggle">
          <button type="button" onClick={toggleMode} aria-label="Alternar entre login e cadastro">
            <span aria-hidden="true">⇆</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthPortal
