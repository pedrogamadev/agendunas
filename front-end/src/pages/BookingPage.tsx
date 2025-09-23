import type { PageProps } from '../App'

type TrailOption = {
  id: string
  label: string
  description: string
  duration: string
}

const trailOptions: TrailOption[] = [
  {
    id: 'cachoeira',
    label: 'Trilha da Cachoeira',
    description: 'Percurso com banho de cachoeira e observação de aves.',
    duration: '5h30',
  },
  {
    id: 'mirante',
    label: 'Trilha do Mirante',
    description: 'Subida com vista panorâmica da costa potiguar.',
    duration: '4h',
  },
  {
    id: 'ecologica',
    label: 'Trilha Ecológica',
    description: 'Experiência educativa com foco em fauna e flora.',
    duration: '3h30',
  },
  {
    id: 'noturna',
    label: 'Trilha Noturna',
    description: 'Vivencie os sons da mata sob o céu estrelado.',
    duration: '2h',
  },
]

function BookingPage({ navigation }: PageProps) {
  return (
    <div className="booking-page">
      <header className="page-hero booking-hero">
        {navigation}
        <div className="page-hero-content">
          <span className="section-tag">Agende sua Aventura</span>
          <h1>
            Agende sua <span>Aventura</span>
          </h1>
          <p>
            Reserve sua trilha e prepare-se para uma experiência única na natureza. Preencha o formulário abaixo e
            nossa equipe entrará em contato para confirmar todos os detalhes.
          </p>
        </div>
      </header>

      <main className="page-main booking-main">
        <section className="booking-layout">
          <form className="booking-form">
            <h2>Formulário de Agendamento</h2>
            <div className="booking-grid">
              <label className="input-field">
                <span>Nome Completo</span>
                <input type="text" name="name" placeholder="Seu nome completo" required />
              </label>
              <label className="input-field">
                <span>E-mail</span>
                <input type="email" name="email" placeholder="nome@email.com" required />
              </label>
              <label className="input-field">
                <span>Telefone/WhatsApp</span>
                <input type="tel" name="phone" placeholder="(84) 90000-0000" required />
              </label>
              <label className="input-field">
                <span>Trilha desejada</span>
                <select name="trail" required defaultValue="">
                  <option value="" disabled>
                    Selecione uma opção
                  </option>
                  {trailOptions.map((trail) => (
                    <option key={trail.id} value={trail.id}>
                      {trail.label} · {trail.duration}
                    </option>
                  ))}
                </select>
                <small className="field-help">
                  As trilhas disponíveis podem ser atualizadas pelos administradores a qualquer momento.
                </small>
              </label>
              <label className="input-field">
                <span>Data preferida</span>
                <input type="date" name="date" required />
              </label>
              <label className="input-field">
                <span>Horário</span>
                <input type="time" name="time" required />
              </label>
              <label className="input-field">
                <span>Quantidade de participantes</span>
                <input type="number" name="participants" min={1} max={20} defaultValue={1} required />
              </label>
              <label className="input-field input-full">
                <span>Observações (opcional)</span>
                <textarea name="notes" rows={4} placeholder="Alguma informação adicional, necessidades especiais ou preferências?" />
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn solid">
                Enviar Solicitação de Agendamento
              </button>
              <p className="form-disclaimer">
                Nossa equipe retornará em até 24h com a confirmação e instruções completas para sua experiência.
              </p>
            </div>
          </form>

          <aside className="booking-sidebar">
            <div className="booking-map">
              <h2>Nossa Localização</h2>
              <div className="map-frame">
                <iframe
                  title="Mapa Parque das Dunas"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57470.49387760395!2d-35.250735867600305!3d-5.829495663855279!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7b2ffe742b9133f%3A0xec2b60cecae02a3c!2sParque%20das%20Dunas%20-%20Bosque%20dos%20Namorados!5e1!3m2!1spt-BR!2sbr!4v1758663217483!5m2!1spt-BR!2sbr"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <address>
                <strong>Estrada da Serra, km 15 · Verde, MG</strong>
                <span>Entrada Principal · Portão 1</span>
              </address>
            </div>

            <div className="contact-card">
              <h3>Informações de Contato</h3>
              <ul>
                <li>
                  <span>Telefone</span>
                  <strong>(31) 3456-7890</strong>
                </li>
                <li>
                  <span>WhatsApp</span>
                  <strong>(84) 99876-5432</strong>
                </li>
                <li>
                  <span>E-mail</span>
                  <strong>contato@agendunas.com.br</strong>
                </li>
                <li>
                  <span>Horário de atendimento</span>
                  <strong>Seg a Dom · 7h às 17h</strong>
                </li>
              </ul>
            </div>

            <div className="info-card">
              <h3>Informações Importantes</h3>
              <ul>
                <li>Confirmaremos sua vaga assim que validarmos a disponibilidade da trilha escolhida.</li>
                <li>Chegue com 20 minutos de antecedência para o briefing de segurança obrigatório.</li>
                <li>Recomendações: roupas leves, calçado fechado, repelente e garrafa d&apos;água reutilizável.</li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}

export default BookingPage
