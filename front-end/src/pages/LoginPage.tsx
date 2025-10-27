import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { PageProps } from '../App'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

function sanitizeCpf(value: string) {
  return value.replace(/\D/g, '').slice(0, 11)
}

function LoginPage({ navigation, onNavigate, searchParams }: PageProps) {
  const { login, error, isAuthenticating, user } = useAuth()
  const [cpf, setCpf] = useState('')
  const [senha, setSenha] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const redirectTarget = useMemo(() => {
    const redirect = searchParams.get('redirect')
    if (redirect && redirect.startsWith('/')) {
      return redirect
    }
    return '/admin'
  }, [searchParams])

  useEffect(() => {
    if (user) {
      onNavigate(redirectTarget)
    }
  }, [user, redirectTarget, onNavigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const normalizedCpf = sanitizeCpf(cpf)

    if (normalizedCpf.length !== 11) {
      setFormError('Informe um CPF válido com 11 dígitos.')
      return
    }

    if (senha.trim().length < 8) {
      setFormError('A senha deve ter no mínimo 8 caracteres.')
      return
    }

    try {
      const response = await login({ cpf: normalizedCpf, senha })
      const destination = response.usuario?.tipo === 'A' ? redirectTarget : '/'
      onNavigate(destination)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível entrar. Tente novamente.'
      setFormError(message)
    }
  }

  const feedbackMessage = formError ?? error

  return (
    <div className="auth-page">
      {navigation}
      <div className="auth-page__content">
        <section className="auth-page__headline" aria-label="Mensagem de boas-vindas">
          <h1>
            A natureza inspira.
            <span> Conecte-se ao coração das dunas.</span>
          </h1>
          <p>
            Administre experiências inesquecíveis com uma interface fluida e inspirada na paisagem do
            Parque das Dunas. Entre para renovar agendas, trilhas e histórias.
          </p>
        </section>
        <section className="auth-page__card" aria-label="Formulário de login">
          <h2>Entrar no painel</h2>
          <p>Acesse com seu CPF e senha para gerenciar o AgenDunas.</p>
          {feedbackMessage && <div className="auth-form__error">{feedbackMessage}</div>}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__field">
              <label htmlFor="login-cpf">CPF</label>
              <input
                id="login-cpf"
                name="cpf"
                inputMode="numeric"
                autoComplete="username"
                placeholder="00000000000"
                value={cpf}
                onChange={(event) => setCpf(sanitizeCpf(event.target.value))}
                required
              />
            </div>
            <div className="auth-form__field">
              <label htmlFor="login-senha">Senha</label>
              <input
                id="login-senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                placeholder="Sua senha secreta"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
              />
            </div>
            <div className="auth-form__actions">
              <button type="submit" className="auth-form__submit" disabled={isAuthenticating}>
                {isAuthenticating ? 'Entrando…' : 'Entrar'}
              </button>
              <p className="auth-form__link">
                Não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onNavigate(`/cadastro?redirect=${encodeURIComponent(redirectTarget)}`)
                  }}
                >
                  Cadastre-se
                </button>
              </p>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}

export default LoginPage
