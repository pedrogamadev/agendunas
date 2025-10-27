import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { PageProps } from '../App'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

function sanitizeCpf(value: string) {
  return value.replace(/\D/g, '').slice(0, 11)
}

function RegisterPage({ navigation, onNavigate, searchParams }: PageProps) {
  const { register, error, isAuthenticating, user } = useAuth()
  const [cpf, setCpf] = useState('')
  const [token, setToken] = useState('')
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('')
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
      onNavigate(user.tipo === 'A' ? redirectTarget : '/')
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

    if (!token.trim()) {
      setFormError('Informe o token fornecido pelo administrador.')
      return
    }

    if (senha.trim().length < 8) {
      setFormError('A senha deve ter no mínimo 8 caracteres.')
      return
    }

    if (senha !== confirmacaoSenha) {
      setFormError('As senhas informadas não conferem.')
      return
    }

    try {
      const response = await register({
        cpf: normalizedCpf,
        token: token.trim(),
        senha,
        confirmacaoSenha,
        nome: nome.trim() || undefined,
      })

      const destination = response.usuario?.tipo === 'A' ? redirectTarget : '/'
      onNavigate(destination)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível concluir o cadastro.'
      setFormError(message)
    }
  }

  const feedbackMessage = formError ?? error

  return (
    <div className="auth-page">
      {navigation}
      <div className="auth-page__content">
        <section className="auth-page__headline" aria-label="Mensagem para novos colaboradores">
          <h1>
            Construa experiências.
            <span> Compartilhe o parque com mais pessoas.</span>
          </h1>
          <p>
            Use o token enviado pelo administrador para ativar sua conta. Em poucos passos, você estará
            pronto para colaborar com o cuidado das trilhas e visitantes.
          </p>
        </section>
        <section className="auth-page__card" aria-label="Formulário de cadastro">
          <h2>Ativar convite</h2>
          <p>Confirme seu convite com o CPF e token recebidos e defina a sua senha.</p>
          {feedbackMessage && <div className="auth-form__error">{feedbackMessage}</div>}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__field">
              <label htmlFor="register-cpf">CPF</label>
              <input
                id="register-cpf"
                name="cpf"
                inputMode="numeric"
                placeholder="00000000000"
                value={cpf}
                onChange={(event) => setCpf(sanitizeCpf(event.target.value))}
                required
              />
            </div>
            <div className="auth-form__field">
              <label htmlFor="register-token">Token de convite</label>
              <input
                id="register-token"
                name="token"
                placeholder="Cole o código recebido"
                value={token}
                onChange={(event) => setToken(event.target.value.trimStart())}
                required
              />
            </div>
            <div className="auth-form__field">
              <label htmlFor="register-nome">Nome completo (opcional)</label>
              <input
                id="register-nome"
                name="nome"
                placeholder="Como você quer ser chamado"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
              />
            </div>
            <div className="auth-form__field">
              <label htmlFor="register-senha">Senha</label>
              <input
                id="register-senha"
                name="senha"
                type="password"
                placeholder="Crie uma senha segura"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
              />
            </div>
            <div className="auth-form__field">
              <label htmlFor="register-confirmacao">Confirmar senha</label>
              <input
                id="register-confirmacao"
                name="confirmacaoSenha"
                type="password"
                placeholder="Repita a senha"
                value={confirmacaoSenha}
                onChange={(event) => setConfirmacaoSenha(event.target.value)}
                required
              />
            </div>
            <div className="auth-form__actions">
              <button type="submit" className="auth-form__submit" disabled={isAuthenticating}>
                {isAuthenticating ? 'Cadastrando…' : 'Criar conta'}
              </button>
              <p className="auth-form__link">
                Já tem acesso?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate(`/login?redirect=${encodeURIComponent(redirectTarget)}`)}
                >
                  Entre aqui
                </button>
              </p>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}

export default RegisterPage
