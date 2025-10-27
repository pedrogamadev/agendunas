type Language = 'pt' | 'en'

type HighlightedTitle = {
  prefix: string
  highlight: string
  suffix?: string
}

type WeatherConditionKey =
  | 'clear'
  | 'mostlyClear'
  | 'partlyCloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'freezingDrizzle'
  | 'rainLight'
  | 'rainHeavy'
  | 'freezingRain'
  | 'snow'
  | 'thunderstorm'
  | 'unknown'

type HomeTranslation = {
  hero: {
    tag: string
    title: HighlightedTitle
    description: string
    primaryCta: string
    secondaryCta: string
  }
  about: {
    tag: string
    title: HighlightedTitle
    description: string
    impactValue: string
    impactDescription: string
    highlights: { title: string; description: string; icon: string }[]
    mediaAriaLabel: string
  }
  trails: {
    tag: string
    title: string
    description: string
    items: {
      name: string
      description: string
      duration: string
      difficulty: string
      groups: string
      badge: string
      image: string
    }[]
    cta: string
  }
  wildlife: {
    tag: string
    title: HighlightedTitle
    description: string
    items: { name: string; image: string }[]
    cta: string
  }
  testimonials: {
    tag: string
    title: string
    items: { quote: string; name: string; trail: string }[]
    ratingLabel: string
    location: string
    navLabelPrefix: string
    navAriaLabel: string
  }
  stats: { value: string; label: string }[]
}

type GuideTranslation = {
  header: {
    tag: string
    title: string
    description: string
    photo: string
  }
  guides: {
    id: string
    name: string
    photo: string
    speciality: string
    description: string
    trails: number
    experience: string
    rating: number
    certifications: string[]
    languages: string[]
    curiosities: string[]
    featuredTrailId: string
  }[]
  meta: {
    openProfileLabel: string
    closeProfileLabel: string
    featuredGuideLabel: string
    trailsLabel: string
    experienceLabel: string
    languagesLabel: string
    cta: string
    ratingAriaLabel: string
    photoAltTemplate: string
  }
  gridAriaLabel: string
}

type BookingTermsSection = {
  heading?: string
  paragraphs: string[]
  list?: string[]
}

type BookingTranslation = {
  hero: {
    tag: string
    title: HighlightedTitle
    description: string
    photo: string
  }
  guideSummary: {
    title: string
    trailLabel: string
    changeMessage: string
    emptyMessage: string
  }
  form: {
    title: string
    name: string
    namePlaceholder: string
    email: string
    emailPlaceholder: string
    phone: string
    phonePlaceholder: string
    trail: string
    selectPlaceholder: string
    date: string
    time: string
    participants: string
    notes: string
    notesPlaceholder: string
    submit: string
    disclaimer: string
    helpText: string
  }
  terms: {
    checkboxLabel: string
    openModal: string
    modalTitle: string
    modalIntro?: string
    acceptLabel: string
    closeLabel: string
    sections: BookingTermsSection[]
  }
  trails: {
    id: string
    label: string
    description: string
    duration: string
  }[]
  sidebar: {
    locationTitle: string
    mapTitle: string
    address: string
    addressComplement: string
    contactTitle: string
    phone: string
    phoneValue: string
    whatsapp: string
    whatsappValue: string
    email: string
    emailValue: string
    schedule: string
    scheduleValue: string
    infoTitle: string
    infoItems: string[]
  }
  weather: {
    title: string
    subtitle: string
    selectDatePrompt: string
    loading: string
    error: string
    empty: string
    forecastFor: string
    temperatureLabel: string
    maxLabel: string
    minLabel: string
    precipitationLabel: string
    precipitationFallback: string
    sourceLabel: string
    conditions: Record<WeatherConditionKey, string>
  }
  rainWarningModal: {
    tag: string
    title: string
    description: string
    highlight: string
    changeDate: string
    proceed: string
  }
}

type FaunaFloraTranslation = {
  hero: {
    tag: string
    title: string
    description: string
    searchPlaceholder: string
    filterGroupLabel: string
    photo: string
  }
  filters: { id: 'all' | 'fauna' | 'flora'; label: string }[]
  gallery: {
    id: string
    name: string
    scientificName: string
    type: 'fauna' | 'flora'
    description: string
    image: string
    status: string
  }[]
  labels: {
    fauna: string
    flora: string
    emptyState: string
  }
}

type NavigationTranslation = {
  links: {
    home: string
    guides: string
    booking: string
    faunaFlora: string
    admin: string
  }
  scheduleButton: string
  translationToggle: {
    label: string
    tooltip: string
    ariaLabel: string
  }
  menuToggle: {
    openLabel: string
    closeLabel: string
  }
}

type FooterLink = {
  label: string
  href: string
}

type FooterTranslation = {
  text: string
  linksLabel: string
  links: FooterLink[]
  adminArea: { label: string; href: string }
}

type TranslationContent = {
  navigation: NavigationTranslation
  footer: FooterTranslation
  home: HomeTranslation
  guides: GuideTranslation
  booking: BookingTranslation
  faunaFlora: FaunaFloraTranslation
}

const withBasePath = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

const translations: Record<Language, TranslationContent> = {
  pt: {
    navigation: {
      links: {
        home: 'Home',
        guides: 'Guias',
        booking: 'Agendamento',
        faunaFlora: 'Fauna & Flora',
        admin: 'Admin',
      },
      scheduleButton: 'Agendar Trilha',
      translationToggle: {
        label: 'PT',
        tooltip: 'Ver site em inglês',
        ariaLabel: 'Alterar idioma para inglês',
      },
      menuToggle: {
        openLabel: 'Abrir menu de navegação',
        closeLabel: 'Fechar menu de navegação',
      },
    },
    footer: {
      text: '© {year} AgenDunas. Todos os direitos reservados.',
      linksLabel: 'Links institucionais',
      links: [
        { label: 'Trilhas e agendamento', href: '/agendamento' },
        { label: 'Guias credenciados', href: '/guias' },
        { label: 'Fauna & Flora', href: '/fauna-e-flora' },
      ],
      adminArea: { label: 'Área ADM', href: '/login?redirect=/admin' },
    },
    home: {
      hero: {
        tag: 'Conecte-se com a natureza',
        title: { prefix: 'Trilhas que ', highlight: 'despertam', suffix: ' a alma' },
        description:
          'Descubra os segredos da mata atlântica através de experiências únicas e inesquecíveis. Cada trilha é uma jornada de descoberta e conexão com a natureza selvagem.',
        primaryCta: 'Agendar Aventura',
        secondaryCta: 'Explorar Fauna & Flora',
      },
      about: {
        tag: 'Quem Somos',
        title: { prefix: 'Quem ', highlight: 'Somos' },
        description:
          'Somos uma empresa familiar apaixonada pela preservação da mata atlântica. Há mais de 15 anos, conduzimos visitantes através dos caminhos mais selvagens e preservados com respeito e cuidado pela natureza.',
        impactValue: '1.500+',
        impactDescription: 'Trilhas realizadas com sucesso',
        highlights: [
          { title: 'Paixão', description: 'Amor genuíno pela natureza', icon: '🌿' },
          { title: 'Experiência', description: '15+ anos de aventura', icon: '🧭' },
          { title: 'Segurança', description: 'Protocolos rigorosos', icon: '🛡️' },
          { title: 'Comunidade', description: 'Conexão com moradores locais', icon: '🤝' },
        ],
        mediaAriaLabel: 'Exploradores caminhando nas dunas',
      },
      trails: {
        tag: 'Nossas Trilhas',
        title: 'Nossas Trilhas',
        description:
          'Três experiências únicas para conectar-se com a natureza, cada uma oferecendo uma perspectiva diferente da nossa floresta.',
        items: [
          {
            name: 'Trilha da Cachoeira',
            description:
              'Caminhada que te conecta até as majestosas cachoeiras da Mata Atlântica. Paradas para contemplar a fauna local.',
            duration: '5h30',
            difficulty: 'Moderada',
            groups: 'Até 12 pessoas',
            badge: 'Destaques',
            image: 'https://images.unsplash.com/photo-1458442310124-dde6edb43d10?auto=format&fit=crop&w=900&q=80',
          },
          {
            name: 'Trilha do Mirante',
            description:
              'Subida íngreme recompensada com vista panorâmica de 360° e mar atlântico. Ideal para apreciar o pôr do sol.',
            duration: '4h',
            difficulty: 'Desafiadora',
            groups: 'Até 8 pessoas',
            badge: 'Aventura',
            image: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&w=900&q=80',
          },
          {
            name: 'Trilha Ecológica',
            description:
              'Caminhada educativa com nossos guias biólogos apresentando espécies endêmicas e histórias da mata.',
            duration: '3h30',
            difficulty: 'Leve',
            groups: 'Até 15 pessoas',
            badge: 'Famílias',
            image: 'https://images.unsplash.com/photo-1455218873509-8097305ee378?auto=format&fit=crop&w=900&q=80',
          },
        ],
        cta: 'Ver detalhes',
      },
      wildlife: {
        tag: 'Vida Selvagem',
        title: { prefix: 'Habitantes da ', highlight: 'Floresta' },
        description:
          'Conheça alguns dos moradores mais carismáticos da nossa mata. Cada trilha é uma oportunidade de avistar essas criaturas em seu habitat natural.',
        items: [
          {
            name: 'Tucano',
            image: 'https://images.unsplash.com/photo-1518799175674-ef795e70e1f6?auto=format&fit=crop&w=900&q=80',
          },
          {
            name: 'Macaco Prego',
            image: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&w=900&q=80',
          },
          {
            name: 'Cutia',
            image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=900&q=80',
          },
          {
            name: 'Tamanduá',
            image: 'https://images.unsplash.com/photo-1574851459476-3eb3fb9d1357?auto=format&fit=crop&w=900&q=80',
          },
        ],
        cta: 'Ver Galeria Completa',
      },
      testimonials: {
        tag: 'O que dizem nossos aventureiros',
        title: 'Experiências reais de quem viveu a magia das nossas trilhas',
        items: [
          {
            quote:
              'Organização impecável e guias muito atenciosos. A trilha do mirante rendeu memórias incríveis ao pôr do sol!',
            name: 'Clara Mendonça',
            trail: 'Trilha do Mirante',
          },
          {
            quote:
              'Foi emocionante observar a vida selvagem de tão perto. Voltarei para explorar outras trilhas em breve!',
            name: 'Rafael Albuquerque',
            trail: 'Trilha Ecológica',
          },
          {
            quote:
              'Equipe super preparada, equipamentos de qualidade e cenários de tirar o fôlego. Experiência inesquecível.',
            name: 'Larissa Souza',
            trail: 'Trilha da Cachoeira',
          },
          {
            quote:
              'Perfeito para sair da rotina e se conectar com a natureza. Cada parada tinha uma história fascinante!',
            name: 'Eduardo Campos',
            trail: 'Trilha do Mirante',
          },
        ],
        ratingLabel: 'Avaliação 5 de 5',
        location: 'Natal, RN',
        navLabelPrefix: 'Depoimento de',
        navAriaLabel: 'Navegação de depoimentos',
      },
      stats: [
        { value: '4.9', label: 'Avaliação média' },
        { value: '500+', label: 'Aventuras guiadas' },
        { value: '98%', label: 'Recomendariam' },
      ],
    },
    guides: {
      header: {
        tag: 'Guias Especializados',
        title: 'Nossos Guias',
        description:
          'Conheça os especialistas que transformarão sua aventura inesquecível. Cada guia traz uma paixão única pela natureza e anos de experiência nas trilhas da mata atlântica.',
        photo: withBasePath('images/capas/guias-capa.png'),
      },
      guides: [
        {
          id: 'davi-brito',
          name: 'David Calab',
          photo: withBasePath('images/guias/davi.jpg'),
          speciality: 'Resiliência & Culinária Baiana',
          description:
            'Soteropolitano que une superação e afeto em cada história, guiando experiências regadas aos sabores marcantes da Bahia.',
          trails: 420,
          experience: '5 anos',
          rating: 4.9,
          certifications: ['Culinária Baiana Profissional', 'Comunicação Empática'],
          languages: ['Português'],
        curiosities: [
          'Conhece Salvador como poucos após anos como motorista de aplicativo',
          'Responsável por banquetes que aproximaram comunidades inteiras',
          'Especialista em menus afetivos baianos servidos nas trilhas',
        ],
        featuredTrailId: 'cachoeira',
      },
      {
        id: 'matheus-brasileiro',
        name: 'Matheus Brasileiro',
          photo: withBasePath('images/guias/matue.jpg'),
          speciality: 'Ervas naturais e músicas na trilha',
          description:
            'Guia que revela a biodiversidade do Nordeste explicando usos tradicionais das plantas ao som de composições autorais.',
          trails: 720,
          experience: '10 anos',
          rating: 4.8,
          certifications: ['Fitoterapia Aplicada', 'Cultivo Sustentável'],
          languages: ['Português', 'Inglês'],
        curiosities: [
          'Mantém um acervo vivo de espécies medicinais regionais',
          'Fundador de projetos de conscientização sobre uso responsável de plantas',
          'Criador de métodos inovadores de extração de essências naturais',
        ],
        featuredTrailId: 'ecologica',
      },
      {
        id: 'carrara-luis',
        name: 'Carrara Luis',
          photo: withBasePath('images/guias/agostinho.jpg'),
          speciality: 'Logística Urbana & Otimização de Rotas',
          description:
            'Mestre dos atalhos urbanos, transforma o corre diário em tours cheios de humor, estratégia e oportunidades.',
          trails: 1300,
          experience: '20 anos',
          rating: 5,
          certifications: ['Condução Defensiva Avançada', 'Negociação Rápida'],
          languages: ['Português'],
        curiosities: [
          'Foi proprietário da lendária “Carrara Táxis”',
          'Conhece as principais “panelas” e bastidores da cidade grande',
          'Sempre encontra atalhos criativos para driblar o trânsito',
        ],
        featuredTrailId: 'mirante',
      },
      ],
      meta: {
        openProfileLabel: 'Ver detalhes do guia {name}',
        closeProfileLabel: 'Fechar detalhes do guia',
        featuredGuideLabel: 'Guia destaque',
        trailsLabel: 'trilhas guiadas',
        experienceLabel: 'Tempo de atuação',
        languagesLabel: 'Idiomas',
        cta: 'Solicitar este guia',
        ratingAriaLabel: 'Avaliação {rating} de 5',
        photoAltTemplate: 'Foto do guia {name}',
      },
      gridAriaLabel: 'Guias disponíveis para condução de trilhas',
    },
    booking: {
      hero: {
        tag: 'Agende sua Aventura',
        title: { prefix: 'Agende sua ', highlight: 'Aventura' },
        description:
          'Reserve sua trilha e prepare-se para uma experiência única na natureza. Preencha o formulário abaixo e nossa equipe entrará em contato para confirmar todos os detalhes.',
        photo: withBasePath('images/capas/agendamento-capa.png'),
      },
      guideSummary: {
        title: 'Guia selecionado',
        trailLabel: 'Trilha conduzida',
        changeMessage: 'Para alterar, volte à página de guias e escolha outro profissional.',
        emptyMessage: 'Escolha seu guia favorito na página de guias para vê-lo aqui.',
      },
      form: {
        title: 'Formulário de Agendamento',
        name: 'Nome Completo',
        namePlaceholder: 'Seu nome completo',
        email: 'E-mail',
        emailPlaceholder: 'nome@email.com',
        phone: 'Telefone/WhatsApp',
        phonePlaceholder: '(84) 90000-0000',
        trail: 'Trilha desejada',
        selectPlaceholder: 'Selecione uma opção',
        date: 'Data preferida',
        time: 'Horário',
        participants: 'Quantidade de participantes',
        notes: 'Observações (opcional)',
        notesPlaceholder: 'Alguma informação adicional, necessidades especiais ou preferências?',
        submit: 'Enviar Solicitação de Agendamento',
        disclaimer:
          'Nossa equipe retornará em até 24h com a confirmação e instruções completas para sua experiência.',
        helpText: 'As trilhas disponíveis podem ser atualizadas pelos administradores a qualquer momento.',
      },
      terms: {
        checkboxLabel:
          'Li e concordo com o Termo de Serviço e Consentimento para Tratamento de Dados Pessoais.',
        openModal: 'Ler o termo completo',
        modalTitle: 'Termo de Serviço e Consentimento para Tratamento de Dados Pessoais',
        modalIntro:
          'Leia atentamente o Termo de Serviço antes de prosseguir com sua reserva. A aceitação é necessária para a continuidade do agendamento.',
        acceptLabel: 'Li e concordo',
        closeLabel: 'Fechar',
        sections: [
          {
            paragraphs: [
              'Pelo presente instrumento, pessoa jurídica de direito privado, doravante denominada Agendunas e, de outro lado, titular dos dados doravante denominado IDEMA, têm entre si justo e contratado o que segue:',
            ],
          },
          {
            heading: '1. Objeto',
            paragraphs: [
              '1.1. Este Termo tem como finalidade regular o uso dos serviços disponibilizados pela Controladora por meio do site/portal/aplicativo da Agendunas, bem como obter o consentimento do Titular para o tratamento dos seus dados pessoais necessários à prestação do serviço.',
              '1.2. O Titular declara estar ciente de que, para que o serviço funcione corretamente (cadastro, agendamento, notificações, suporte etc.), será necessário o fornecimento de determinados dados pessoais.',
            ],
          },
          {
            heading: '2. Dados Pessoais Coletados e Finalidade',
            paragraphs: [
              '2.1. A Controladora poderá coletar, dentre outros, os seguintes dados pessoais do Titular: nome completo, e-mail, telefone, dados de identificação (CPF/RG ou equivalente), e outros que se façam necessários para cadastro e uso do serviço.',
              '2.2. As finalidades do tratamento de dados incluem: (I) cadastro e identificação do usuário; (II) agendamento e envio de notificações; (III) atendimento e suporte; (IV) comunicações relativas ao serviço; (V) cumprimento de obrigações legais; (VI) outras finalidades informadas ao Titular no momento da coleta.',
              '2.3. O tratamento dos dados será pautado pelas bases legais previstas na LGPD, especialmente (quando aplicável) o consentimento do Titular (art. 7º, I da LGPD) e/ou execução de contrato ou de medidas pré-contratuais, cumprimento de obrigação legal, interesse legítimo, entre outras.',
            ],
          },
          {
            heading: '3. Consentimento',
            paragraphs: [
              '3.1. O Titular manifesta, de forma livre, informada e inequívoca, seu consentimento para que a Controladora realize o tratamento de seus dados pessoais conforme as finalidades acima descritas.',
              '3.2. O Titular poderá revogar o consentimento a qualquer tempo, mediante solicitação à Controladora, por meio de [e-mail, contato] indicado. A revogação poderá implicar na impossibilidade de utilização de parte ou totalidade dos serviços oferecidos.',
              '3.3. O Titular confirma que foi informado sobre (I) quais dados são coletados; (II) para que finalidades; (III) por quanto tempo os dados serão armazenados; (IV) com quem poderão ser compartilhados; (V) quais são os seus direitos como titular de dados.',
            ],
          },
          {
            heading: '4. Compartilhamento de Dados',
            paragraphs: [
              '4.1. A Controladora poderá compartilhar os dados pessoais do Titular com terceiros (fornecedores, parceiros, prestadores de serviço) somente para as finalidades descritas neste Termo e sob compromisso destes terceiros de observar os mesmos padrões de segurança e privacidade.',
              '4.2. Em hipótese alguma serão compartilhados os dados pessoais para finalidades diversas não informadas ou sem a base legal adequada ao tratamento.',
            ],
          },
          {
            heading: '5. Armazenamento e Segurança',
            paragraphs: [
              '5.1. Os dados pessoais serão armazenados pelo período necessário para cumprimento das finalidades descritas ou conforme exigido por lei, regulamento ou autoridade competente.',
              '5.2. A Controladora se compromete a adotar medidas técnicas e organizacionais adequadas para proteger os dados pessoais contra acesso não autorizado, vazamento, alteração ou destruição.',
              '5.3. Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos Titulares, a Controladora comunicará o Titular e a autoridade competente, quando exigido pela legislação.',
            ],
          },
          {
            heading: '6. Direitos do Titular',
            paragraphs: ['6.1. Em conformidade com o art. 18 da LGPD, o Titular tem direito a:'],
            list: [
              'confirmar a existência de tratamento;',
              'acessar os seus dados;',
              'corrigir dados incompletos, inexatos ou desatualizados;',
              'solicitar anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade;',
              'solicitar a portabilidade dos dados a outro fornecedor de serviço, mediante requisição;',
              'revogar seu consentimento e solicitar a eliminação dos dados tratados com base no consentimento;',
              'ser informado sobre as entidades públicas e privadas com as quais a Controladora compartilhou seus dados.',
            ],
          },
          {
            paragraphs: [
              '6.2. Para exercer seus direitos, o Titular poderá entrar em contato com a Controladora através de [e-mail de contato / endereço / telefone]. A Controladora poderá exigir comprovação de identidade para atender à solicitação.',
            ],
          },
          {
            heading: '7. Alterações do Termo',
            paragraphs: [
              '7.1. A Controladora reserva-se o direito de modificar este Termo a qualquer momento, mediante publicação da versão atualizada em seu site/portal ou envio de comunicação ao Titular.',
              '7.2. A continuidade do uso dos serviços após alterações constitui aceitação pelo Titular da nova versão.',
            ],
          },
          {
            heading: '8. Vigência e Foro',
            paragraphs: [
              '8.1. Este Termo entra em vigor na data da aceitação (por exemplo, quando o Titular clicar em “Aceito” ou “Concordo”) e permanecerá em vigor enquanto houver tratamento dos dados conforme as finalidades aqui previstas.',
              '8.2. Para dirimir quaisquer controvérsias oriundas deste Termo será aplicado o direito brasileiro, e fica eleito o foro da comarca de [Natal/RN], com renúncia expressa a qualquer outro, por mais privilegiado que seja.',
            ],
          },
        ],
      },
      trails: [
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
      ],
      sidebar: {
        locationTitle: 'Nossa Localização',
        mapTitle: 'Mapa Parque das Dunas',
        address: 'Av. Alm. Alexandrino de Alencar, s/n · Tirol, Natal - RN',
        addressComplement: 'Parque das Dunas · Bosque dos Namorados',
        contactTitle: 'Informações de Contato',
        phone: 'Telefone',
        phoneValue: '(31) 3456-7890',
        whatsapp: 'WhatsApp',
        whatsappValue: '(84) 99876-5432',
        email: 'E-mail',
        emailValue: 'contato@agendunas.com.br',
        schedule: 'Horário de atendimento',
        scheduleValue: 'Seg a Dom · 7h às 17h',
        infoTitle: 'Informações Importantes',
        infoItems: [
          'Confirmaremos sua vaga assim que validarmos a disponibilidade da trilha escolhida.',
          'Chegue com 20 minutos de antecedência para o briefing de segurança obrigatório.',
          'Recomendações: roupas leves, calçado fechado, repelente e garrafa d’água reutilizável.',
        ],
      },
      weather: {
        title: 'Condições Climáticas',
        subtitle: 'Previsão para Parque das Dunas - Bosque dos Namorados',
        selectDatePrompt: 'Escolha uma data no formulário para conferir a previsão.',
        loading: 'Carregando previsão...',
        error: 'Não foi possível carregar a previsão do tempo. Tente novamente mais tarde.',
        empty:
          'Não encontramos previsão para este dia. Escolha outra data ou verifique mais perto da visita.',
        forecastFor: 'Previsão para {date}',
        temperatureLabel: 'Temperatura',
        maxLabel: 'Máx.',
        minLabel: 'Mín.',
        precipitationLabel: 'Probabilidade de chuva',
        precipitationFallback: 'Sem dados',
        sourceLabel: 'Fonte: Open-Meteo (atualizado diariamente)',
        conditions: {
          clear: 'Céu limpo',
          mostlyClear: 'Predomínio de sol',
          partlyCloudy: 'Parcialmente nublado',
          overcast: 'Céu encoberto',
          fog: 'Nevoeiro',
          drizzle: 'Garoa',
          freezingDrizzle: 'Garoa congelante',
          rainLight: 'Chuva fraca a moderada',
          rainHeavy: 'Chuva forte',
          freezingRain: 'Chuva congelante',
          snow: 'Neve ou granizo leve',
          thunderstorm: 'Tempestade com raios',
          unknown: 'Condição climática indisponível',
        },
      },
      rainWarningModal: {
        tag: 'Atenção ao clima',
        title: 'Chuva prevista para esta data',
        description:
          'A previsão indica {percentage} de chance de chuva em {date}. Deseja escolher outra data ou continuar mesmo assim?',
        highlight: 'Probabilidade de chuva de {percentage}.',
        changeDate: 'Trocar data',
        proceed: 'Prosseguir mesmo assim',
      },
    },
    faunaFlora: {
      hero: {
        tag: 'Fauna & Flora',
        title: 'Mural da Fauna & Flora',
        description:
          'Descubra a rica biodiversidade da mata atlântica. Uma coleção fotográfica dos habitantes mais fascinantes da nossa floresta.',
        searchPlaceholder: 'Buscar por nome comum ou científico...',
        filterGroupLabel: 'Filtros do mural',
        photo: withBasePath('images/capas/flora-capa.png'),
      },
      filters: [
        { id: 'all', label: 'Todos' },
        { id: 'fauna', label: 'Fauna' },
        { id: 'flora', label: 'Flora' },
      ],
      gallery: [
        {
          id: 'orquidea-lua',
          name: 'Orquídea-da-lua',
          scientificName: 'Cattleya walkeriana',
          type: 'flora',
          description:
            'Orquídea de perfume adocicado muito buscada pelos visitantes. Cultivamos um viveiro para conservação.',
          image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTEhMVFRUXGBgXGBgYFRcYFxoaFxcXFxcaFxcYHSggGB0lHRcVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy0lHyUtLS8rLS0tLS0tLS0tLS0tLS0tLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIALcBEwMBIgACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAFBgMEAAIHAQj/xAA9EAACAQIFAgUCAwcDAwQDAAABAhEAAwQFEiExQVEGEyJhcYGRMqGxByNCUsHR4RQV8GJyghYzkrIkQ1P/xAAaAQADAQEBAQAAAAAAAAAAAAABAgMEAAUG/8QALREAAgICAgEDAgUEAwAAAAAAAAECEQMhEjEEIkFRE2EycYGRoRRCseEFM/D/2gAMAwEAAhEDEQA/AFBGdi3mX9JttG0+oCo7uYJ/qxcLysQSaA2sSGB1NB6VthcJ5jQTI9qySgltgVpJHQcPjrF9SnmDaTzFLGMwrKSyepSY29qZfDXgfDPbDXCdR7EjmqueZOcM0YedI3g7xUPf0s5yt7Pcnza2xFsmI2g/5o3i2K3ANQKsIPcT1FIGMvPcvAlQpI2I2G1GcPm16yyi8kE7Kx4I+alLClWjnFNDVczCzAtXfWybb9qWMyxVpboNkHY9K0zm8vnKEOpmG8H/AJFVsXltxCHkfr+dU4v3F6Q53s4m2gBIU/iJ5qy+dWUtsFiY6Ac0vnAXLSKSfM1cr1+lEMHlMKtwJAJ3Uz1pI5JdI6wH/tdx1/1BgEGQKK/+pEe2LLg6/b2q+ckfVu8ITOnp8VczDIEID21AcVuhhmlsRNp2xOxmc2VEAyxkQRxzTFhMSLeE1ndTP1mYpHzPKHOIkiN96K47MDoCcKvT3rDlx8pxRrm41pi9ibKpLNuxmB2oSmHkn3otijraTR7KPCV66NTabaxI1zqI7hBv94rZ6npEO+hDxAKgjvU2W3bjEW1TzCxgLEkn2inrF/s3Z4K4pZ7G0R+Yc03+CPCC4S3JhrzD1uN//FZ4X9a0Ri62NWxf8O+G8UpW5dt2xpG41L5hG+n7E8TXO8wwbo7LdUq4O4IgzXeLtl1nt3oP4p8PDF4ckD99bBKN1YDcofY9OxoLEk3JDNHGSSABNV4333qy6gnt9a009qUBCqb1sOedhUypE9dqrk9KFnGtxImogk/NWnEgVoluDNFMAQyvDgK5O5C7QJ5olgjba1Y8wwq3GVvg7g1QF17dlSDBZvyFWckYXPNw7f8A7N1PZhuIqMvkddjp4isaMOWtXNdvQNPEjvv2rlzJqNMmb3f9KPLtXHYMvqVxweoiKVtbTXYINIbLK2RukGKt5cULBbn4TUenfmpDhST6d6s3oixqwOECyLTaAetCcUXVyLhMj35q9lOpU/ebRUObWhejTII69xWa0nsmnT2CnzMzwKypDlhG1ZVOeMfkjBiApg2wfmmHJra3YZbegg8jiqGKw6l4inXLMtNvD2zI77e/elnO0UhHVhbB3m0cDUOoqN83surgt69JEH/NC86xb22S9a6QLi9CPivM3wgvgXrMK+mY6EUvFrszlHIMAt9GtuYZZKmdwaMaVxth7N4Bblnae8cEVR8GeH/P/ea2Rlbpxt0qn4ws3rGJPkmCR6vep1GU6GiwV4YyS5exDAHa2RO/Sf8AFdMbB2mUIyikzwDmIsvc89HXV/GASv1IpwGKtapDyDwea0cL2NJpuiyuCt6laN1q/wCdOwH5VX8y3AMzVrD7kt0HFHFjXLoGiG5algO1em+YYRxUiud2PWoUI3nqK2ydIDWgHnWFDrIEOOtIuYhtZBBkxsP6Cum3bg06R161FgsmQ3BfIkqCF+TyfpuPrWRw5aQsV6gJ4Y8Li3F2+Jucqp4T3Pdv0pnKVZKVnl1ojFRRoSohRKJ4BwBvVRUrfFGEH/coP3pmFBO9hgw2qg1s25irllvTQt7hYEdiY/KgEEXMLbA0+Xb09tCx+lBM48L4e6DpQWn6MgAE/wDUvBH2PvTHetmoGtmuaRxx/McsuYe4UuiDyCN1Yd1NDgnJiuyZrliYi2bdxfdW/iU9x/brXMs3yl8PcKPBI3BHDKeCPsdu4NQnGmCgfYUMIA/KvbuFKFhHSfeKvo4FsOKr4rFyp29TCPpU0wMq4kzatmdt/vRLw3lZd/ML6GT1LI5jeh2FxOgCUDhGBg9ZohhMde1lymm2enYdqSXKqQY8b2Z47xVy5iAXIPpEECBH/JpbZTNMGb3Bdsq/VGKfQ7igLHpVMX4aBPs3sWtRAq82YIuyqT7mqcgCBzG9E7OTJcUMjwY3B710mvcnKvcr/wC7PG21HsvGq3q9qWsVl72jB3niKZfC+KRbdy0wM6ZE96hnS42ic16bRjADpWVSuq5JM1lZ+K+QUvkMYDLbdy5u8DqOv0otfwYUHybz6RyCZFJmX50y37bsv4GBI7966Gc8w164AVNvUN9tvyrRNNSTNUXpgG7evgQIuLEEEbxUlnMh5RBUqQIijWLuojQkHbY0uZvdO6kc1ppSMzGvwhijbsqREMZP1r3xm1sm3cjeYPwaiy3LmW0oU76eD8UNzd9VpAx9QMEdt6yzxL8Q0E7Qz+GAhtNsCCT0qultf9S+nYBRAHQ1H4KJ8pgR/EYq6cLpuu4/i6fFWUbhGiku2DMXlyudbX2UzGxCxRbA3DbBtG8LoP4TIn4MUu2fDj3bpu4lpXVJtg7R0+aKYi7hbRC20UdAFG5P960Y1Vsj12H79yFEUKu5ioJ36UqZ3m2LSNSabc7Hkn2PamDD2E9DNywnf3FOpXoEm2tFS7jCeKdsJY0W0U/yifmN/wA5pFv3TrZEA6/FP+Au67NtuZUT8xB/Oa6ktIbCRla2CVItok7VILdE0IiWOtZeVSjLIM8exBkH71IUjpQbN8yKRoCg9DAn3/rUsmRRVsZKwvaY+WAQFnrP9Imtlw6gQKUMd4vay1u0y60uuVYk7quwlTHO4P0pmuWAACCYPFLjyqQZKib/AE6+1athV9vvQ68hHU1We8w6n71dChO/glPDCkn9oOVg4fzBu1ph/wDBiAwPtMH6Uw/6o8A70O8T3icHiAxH/tPvHtt+dCStHWcjxeLGjSOh4rSxjBtqFU7piowKhwVE3sPNglcakO9WsntNLBzqUifigmAxBmAD80xZO5lreqWdTvG4FZ53EWl02UbmHCLiEB9JUOPkGluDzTdfssnmFhqHllfrQOzlruJ2AqmOXYU/SgWSZmimU4gghSeeK1u5WR/GK2wVoi9bkbah8UZuLQraaGdsPCk9R3qlj8yt6Sun18bCjeLUEQO9JubPF4xzWPDcnTJY3YXs4gaRMTWUtlid6yq/033KfTJcwt+okcTTd4MzlVAa/b1qPTMcVTveXcADLpJ6iswyLoNpTwZ96q3yVFFKmddu5NYvWzoAUkSpH3FIVzLLlx1tMsOj6WboeoP2ol4ZzHyVBuOegVT06CKIeIMeLbpiFIgkK4/Q15U83kYsjjBWn1+ZCXdIIPgLiwAJ2oB4mwLeStwjhvUPrFMuC8QWm3LCYoVnd5rttxsEnvRx+bln6ZRrY8ZbRc8O4T/8cMGAHaocxW5/ACYoZ4KxzANZO5RvyO9NiYm2s6oWdoMVfB5OT6jxNdf4DJSlPQJy7BOyFrjR7CgeMyK4rC+h/CZANMuNziwtsgOo6RNLuMzq3cNtTcIWRq3j71605JQ1sMMScqkRY3xNb0FLy7nbTHJ9qsW7jXFGqAwGwHbpVDxXltq81sWWGoc79KhxGEXCjULkuOFJn5BoKaT2Dg9h7CYc3G0ad4nUOg7mmvKLItWxb1EwSQT77kfHP3oT4bwpS1qaddz1NPI22HtA6e5owBVux4xSLLNpM1u7zQ/GYsWrbO26jnfjeK9s4kMNqRjovhgdqTfFOBuoQwMrJCmCQ2rYqwHB7GmRJBqwGVwUcA/8/I1nz4PqK+muv9lYT4s5Zcy4QAzaVFyST2UcD+1P2HxhZF29MAj4PH5R96F53ndjDreXS0ppDKB+IvGkFjtBDDb34rzwljvOsKxVVIJUqvA0mF26DTp2rF42DJCdN/t/6ymTLGe0MCiRUV3D1LqionvGvXRmKtyyF3G9KHj3FhbHlA+q4RsP5VMn8wB96N51n9qxszSxEhAdz2n+Ue5/OuZZvmbXHa48Fj9gBwB7UmSfsgpADHiCFqXAgAM38vE9arsZJJ5qwiwk+9TfVE/cns4oG5JgT24FWsqxcYtTPpmD8daBv+KpGO40nf8AvU3jT/YDVjnm+c2lQlZOtio9wOTSo9xwxbcA9Olb5kArLbP8CgfU7mjWBww0DVzHBqWsUbElUAVYZ230EirLXBbgsCIg0UBHShWYYO5ePoAge+5+lTTUnXQsabDS4vUPMSOCd+OKU7jlmLE7tVi1iLlgMjjYjg96N5basYsAQLTgbdATTRX07ft8jRjxA1vL1gS+9ZUuMytkdlMyDFZT8vuH9Q5lFq3fGmdLxt70NxLG1cYR7GhYxRtsGWRFHLTJiULagHA69aZWt+wEa4LOWUEGHXsat3r9u6pHmshP8LcUJwmWeqXkDsK9uZc2rmVpHKDl9wUifDY3QQryYMSO1GM8t3bVsOjM9thMgzHzSzgr+i4fTqA6Gj2BzVdLKrQj7G228fFdNNO0jqIPDGPvC8GTcsY3McU95kUxGFJuhgdXTkQedunvXNb+DdGDKTzIHH50Ts5ndtqp1EqZlJn70soJy5LsrjaUrZLm+XItxRZYOQs9/vQzAhJuHEFgV4A71PgMWquX0me3tW2MV7g1sIUkkbc03KS0yk3jpNPfweWs6ZLRVUAJH4jyazw1hvPxFoPLywLSei+o/kKGg+rc7dvanXwP5d3Fs9tNAW2dvckCftNWj3RN0zodirAWtLSRW13g1sboK2QZthFuWnssY8xSo+o2P3rMFbW0iWyZKqqj30gChGOkDUSdusn8698/zLQ9cNEhhyDxMGsss/qplFClYWe6x4Fa2wZ3Na4C/cFq3rjzCo16eNUbx7VctmeeasgCp+0RdNpL2kMpYW7w7qQ0fXcwe+mkLDPdwt1vKcgiII3Dqd1JHBBBFda8TZWcRhblkQC2mJ2EqwIn7Ui47wm4tBEuh3thpUghiDB0oZ6QYHuax55xxzW+ykFaYVyfxbauqBcPkv1n8B9w3T4P3q3icdbA1PiLWjuLi/lpO9cwxDEHqPpHG2/vVfzOBG/vVVJgoM+JsTavYhrtmSCF1MREsBBMdoC/nSvjHlqI4hyFO0ChYtzRj8snN+xrbSWFTZi+lQvBMVdwuD0mSelDcyMua67YtUiC3bkSTVzA2Bq1jcIC324oapo3llk+QxHLsFn2G9CekdZUsYJ2bW3Uye9MliwzmFEnpQhxdQSQCO9WcLj/AN0dWx1fpWefJ7BjxqcvU9EtrC3S7W2JtkdI3oTjsJesNr1HnkUUw2M03NZMgwCSZmav5wyFHB4PFTWRxl1onk9MqXTLGSYm3i00X1GqOe9Bc+yZsK6lSdBMg9j2oZl+O8u5sfTNMfifGObVtHE6vUD7U1ShOl0wU1LQLGd99z3NZQ8Wk7msqvGPwPRZuZPf8vW1sx+dUMLd0sNMjeIrrNxwW24PQ/pS1ivDAa+zrEATHvWHxv8AkPqNqaoTkjXLrYZW80kbemBye1CMRdZSQ0ijWwQndTG49xQTQ90hUlmJq0K5OTAjLWXsEe8GVY7nc/AqljsmupoYkHVuI6fNOWCw2HsKXxDB3UccgH9CaG33uYk/ubehCZJbb7Ckh5UnP0rXu3pfocpEGSYl7ymzcAJBEHqPrTlgMNh7FtjdtgwN2O8+1BMrwDWCJAI5J/zQ7xdmjuQoBW2OQazZlLyMvCLqPYVJWUc1uAsXtroUnYdhUX+uVl0Qxjjfahl1jp52rbK2BcFyQoPSvU4VH8hkvkJPl5Z1VDuRJnpTl4FBt4hrbLBNs/XSy/3pWNi65JszudpG5niKfcnyBrRt3b9wtdUTCwEEiCD1b8q7FyckyiUXdMcLRrZ15jmO231oS+YsOAD9Kp4nMLrCJj4rXkaaoKTTNswsXIKsVYHkRH/P8UHt4RxwCACIkxA6z3EVft3G61aILAA/H3O9eZk8KLqm9fqaY5mlVBjCmFH61veuxUDGABUiYUH8RPxXprqiBbbGKFUneeRS5i7ei60KXncNqA2P137ccijF9PLSdOsDmNmAntwffiguJdmu7wq7hR+pPuf7Vg81Rkly7RXEyrivAtzEMb5dVLQSux3gCTtyeTSjn/hNrJ9d1LRY+k3VZEPsLi6kn2kGusZHjCQRKkBiux7d+x9qL3bVq4jLcCsrbFWAIPyDV8eJcU03/AHNnzlmeT37YBuQbZMB0dXQmJiVJg+xirGT5K2IdbVgDUdzJgADkk9BXTMR4Kwlk3ECv5d2JGsmNLagBxEGIPNe+FfD1vDMXSWZpGo8hSZCjtwJPWhCfKbg/YRxS2IOd+EsTYUuwVwOShLafcggGPekzF2yDvX0Zi7Z6Vynx94WFsC/ZBCEw6n+EtwV/wCknaOm1aOFdCSEKzYLMFHJo3i8tuhFRWHp3PyarZPZ/fICY33pidpkj5rLnnKMlRGcnEXcA7hjbuTB5n+lSYzAQNm9O5opctA+qNxVvJ3F0m0VBgTPb5rPPO4rlX5gUxVOLgKFH4T96P4LDW8UVDXCmoR7BveiOMybDSFuwjMNiNqgt+FtIkEsvcHelWfHkVrTDzXuAs/8OXcK4D7qeGHBqFMW7hQd9IgT2pxxOIF+02GNwE211Bj+Lb+E0ti2igCZY9R0q0MraqfaGTsiREjcb1lF7Vu1A4rKX6qDyGQ3t5O5A56VTzF2VoBjUAwPvRvCZWLqkvsSNgOKWHuMXZWIOkkAnpXl+LKLtL2IOJpmuKQW3/iZo/4KqZCHMKgIJ2nsOteYjDI1zZpHX2o75yW7cqApI0rHtya2ZJ8cdJW2N0tEn+3WXIB3CcCdie571rmGZW7Xp/DtVfKLeoSx2Xkx/Wk/PsaLtxonmBWfx/H+pkqTbSAsdvZcu5zee4CXIRTss1l3Etechhzt7Vpg8Ax0kwWnirWPBtKQFPmN07V6XoUvStj9FbB4S2ZQuO0dfpUpw9qyQYk+9UsHlxB1Od+R81BjLrE+rc9I4qvbqwfiY0+FsabmLtKxkAlo6elSR9iBXTWea494dxJtMl3T+FpjuOGH1E11jCYhHUOjBlYSpHUGr4VFWkUi0tImK+1erhwfapLYmpyVUSTVGilka5aDwZoCuDu/7mJnyksah/KGZtJ277UeuZhbUTqCjuZ+gFXgwChidXcgfpU7T6C0yvatFm34FXIqS2VZQVIg8RULiqx6FZsWpD8U4/8A0lyWYux9VsROoBhIPQRI+Yp3NB/F+UDE4ZgB609afIG4+okfbtUPI8eOZJS9h4yroU/2Z5pcD3TdMq7gz2uNM/QwPyrq9lg4muSeEcLFpmuMoTWSTI3AUQB+ddK8H40X8MtxZ0lnA+FdlH6UMU7k4hapFnxJZLWta/iTdh1K9f7/AErTIkD2pHU0YuWSYK/iHfgjsagyzDLZDKNgTqC7emRuo7ieK54qy818Uxb1RIMIKF5xk1u7be28aXBU/Xr9KvYzHkbCFHcmoAmoaiZFaEA+fnyhrV64lz8SMUHvBjV8Eb/WryWAOvFM/wC0LABcWtwfx29/lDE/Yr9qWLjQJPAry/Jk+dGPI3yoq4y/wvE1rgrPl3PMDshI5G/5ULzPFEnbar+BIKgTJ6/5pXFxhfyPTjGynmt25cuS9ySBAPG3xRPw7mV6w4lgyHlSf0re7l4Yb/5ofiMkvOYQau3euU4TjwdJHKSemMviLKheQ4nDwpiHXafnag2T5Ug9VyZ7DpVTBLiMOxUqSGEEEmCKOWMjdwbtpyrDfQ3X4pH6I8HLXyM/sG7OHwOkSqg+4M1lAjmOnZ0IYciKyofQn8v9yPGQ8YO8AAOJFIeepDuo5Bk05YFoZREwKRM+uDznYH+IzWTwI1kkaKuiFL/pJiG4q3g0e6VJPpXqeBQoNJ1MYFWbmIOn0gx2Feq8fI6gpmWYC44s22i2o3jqfel/GlRdhV3Gw/vRvLMhvafSkM2/qMR961ueHHtAu7Ix9mk70mPJjg+Kl/sFFK3iYARV13Seh4qPE5e6y95zJB2nimfKMLbw1nzCsuSTMTSb4ix7XHO/Jo4czy5GoLS9zqBpuMeGY963w9m4TqVSYrMvxflzKzNE0zIspFsEewFehJtewX9jfF3Wa2OjdaJeFc+fDHS0taP4lHIP8y+/t1pWOIad553ovliBwSKFuOxXpWdfy7Mbd1NdtwwPUdPYjkH2NS4vGKqFiwUASS2w+vauINfa3cJRmVuCQSNvkUYy7E3b9wJduFxpYItxyUNwqfLBk7y0D5IqkpXEopVsd80ul0IO4JAACMx5HYcVY8OZneRhZu+pWYqNiSpPEnqCT+dSeEsPdGGU37eh5MKQQQvCyCZH1r3H4m1Zu2vWouTKoTuxO34Rv352mDXj1mwyTfzurZuUoSjQV8Or5K3VuXAym7ca2P5VZiYmd9yfiaMnuDQLLsJJnlek0ZIAECvZxt8TK0YTWBor1NxNa3aomccxxOIt2WuYc2h5aswIkkQCYJHvANP/AOy3MUvYUhVCBLjLpHABhh95Ncrz3HA3sSdTAm4wWN1IBIkn4FH/ANkOZFMU1o7LcXf2Zfwn82H1FZMWKMJuS/yxmlR20MAKBm4zXbhJ4aB7CB/mi5EilvMMTctXdk1KYJ9jx/arZpqEeT6QIq3RVzDMbesqTuDED8/zorhW9A2IncSNxPcUPw3mIzPsiF9bbDVuZYE9pn6VLiM2BgWw1xphtMFVHJZuwjpyTtWbxsspycm9e2q/2/4HyRS0IX7QszU4oJ//ACt7/wDc5Bj7BaSMRcZuftUGaYu7fJe4PUzFie8+3T4q7ZtSgPtU81XzZgnXYNuW5pj/APTum2GQmSBI79aDYhCCscyPtNGM7z9yNNkxtBP9qjOU5UonbrRrgL3C3BEGAw6fNG8ZZKEOnyY/UUtYByFE7mN60seJ3smGGtOx6VOWFzfpE4tvQ9r5WIQC4sE8H39jU2T4I2XIdhA3BPUUDybNbV9SoGn2PSe1EkvA2blu8Q2gEqe4FZ3B/hkc0+i1mLYRrjMXWTE8dhWUCt5SjgOrLB43rKl/T41/dIal9yDO80Nq2FBjUY1DmKT8ddAYbyOZrzPscS2mZUcVVt2dSSSYFep4/jrHFMv0WMXeUMIaVjatsJi+xIE0PvLIGkGimAwQ0nXtAkVolGKWzro3fxE4J1FmPA32qGxmcnU5+lT5blFq/auMGi6smO4pfYRtXRx43cUjjpLZmHtaRCrG5G+9A8RlC3ATbJJHNWcrwzLYQlCydY5HvVjCEedoBhd2Yn44rBCKxt8Cbk7E29YJuaCIPFNmCsi2mlAvpEtPNCMz9OLUjqaP4vGeYQvlAOBEjn61ozycor8gt2AvE2HQabigAkbihOWZiUfjY7RR/PbYNgMx9QY0sK8GQOu1W8b1Y6YVtB29l7XbwS0pa4+8dAO7HoPenvJvC1qwqkqty6IJdhIB/wChTsI781F4IwkWmvOIe6e38K7AffUaa8Phh2rTCHpQ8VrZUZHPLNv7msbAKygMAYMj2I3BHvNFRY9q3WzVPpoazXBP6AV6ip0k0KyJyDftNzbuGPdLn7xfoNTL/wCNErY2PzQSDZKcSqINbKvP4iB+tLHifxXbtoVssHdpGpd1T3ngnsKM5rl9rEWjavLK8g/xKejKehFcvzvJ7mHuC0xkH8LdGHcdj3HSkm3FaCD8dGw5B6imT9nFmcQ532tGP/klbJYRbfqAJ2mr/hq+qYxR/MCn0bcfmBXm4vLTkotfqKsn2Or5Xiw67/iGx/v9a2xFkFgaR87zO7hmt3bXJchlPDIBuD23IM9KsYj9ouHS3ruW7qt/KAGBPs0xHzB9q9FZ4cuDew2gV408V3MJiGtotvTpVgTqJEjcEA9waV8VnWIxCh3vPEEgKdAHxp/rQvP8zOKuXLrABrnT+UAAAfQAVXw13TaNmZPT461hzttel+/8EJyb9wImKeY3Inkj+tGslxauCpiRx8VRxV4i2VAAgUMyxj5gjY1WcFkiwuKkg/dwuslp2BgVWuro5En9K9uYxlUgDcnmtcJcLHRzI3PWpcWhFHey1hL67gwJEVUzfKNlKGZ/Wq+a4PqpO3SqWHxTH0liANx8iqY4f3RHUfcK5JiPKfy7ogg7Gt82x7m96SdIBHtBrBg3xQ1IJKrz3r3KdtmXjmaWSV862dGNyJreHuwIJArKIK5IkTFZSfU+xo5r4Yl3ASe4NHcJgyyaTso3NCsMNxH2piwrNDA8Eb1bNPiqM8no9OCthCTtp4ml/HZizehdwKtZ3jNUIhhRySaq4Sx6Tp37muxxpXIME1tlSybiHUpInY/BrzSBzuaMLhG/CRJPC0IzDB3LRi4INWjJSdBQ85fjbosA22kRDDmPeh2ILXHUbSTyNvvUXhTU1o6GhxwJ59q1xjNqAAhpiRWHhxm0SZaxOBW5iEK8KYn4olmGIAeNMPESP6ih6XVTylB4PqPcnmr2a3DtqXfo46j3qc27R3sAPEl1fKRJ3mf70KyzQHDOdh0opm2ENwJoHEzQF7cE7RW7Al9OisVo7R4Tv68NaK/yn8mIphsyK5r+zfO1AOHcwJlCTA35Wem+4+TXTLK1thVUE3F1uwIqW1f7qa0Y1Vu47TMqY+YmlnNQVt6HSsuWrVsu91fxEKjf+JYr9tbferIsCNt6CZbntu4WtNpUyY32eSZj67RXj3hhnDTFp2CsOis5hWHaWIB+QelJDKpLktoLjQWexVbMMrt308u4NuVPVW6Mv/N6u+YfkVIm9WaUlQpzXE5Y9u8yFh/1A9R0ZfYioL1nTiFZdhAII6R705eMsp8xFups6ek+6nifg/8A2NLDYW55TApB4kHpXznlY3hy66EozH5rcu3ER2DKJjYDmJJjngVLjMIrDQRyP0odbsFbiKem5ojir4Lpp4rPkm5bb2EU85yhrUXFkqDv7UJRi10sOAIrpWOsArpI2YEUgYjBnD3GB/CwJU/HStnjZ3JOEu1/Iko/AIzXEkNA+tV8uVjcGmvcVaYgtHWa1wGJKGV52FerFVCkPEZMbh4GkgA96HYbEeWTpg9J/tRLEXPMHq50/nzQ21Z0sC427Vlv5OyaYVw2FZrYLDkzQXG5aTeITg7/AN6Yr2a6tKW1jgVE6qb46BYk0uOcoyJcqL2WW3toXsR6Nnn8jQy9jVuPATSTPHWmzMcBbAd1ebTKouBeQRx96WLKK19Esrydp5A966Mr2LF+7KiuV2Bbb3rKbsVka6zx/mN68pPqwLfXkKGV4cLa1/xNV/EjybJdiPUIC9aMYbJLYSC0lRxNR4nJrFxdck6eVnj6VH60ZSt3RK02c9x0uJO3tRLAYQraDMxCzuBz1plxWW2NIIEp3HT5qpfy7yv/AGiCGG3WtUvIuNItzjdE+W5tg7Khgxa57jce1B8/W5inDojHruI/KmDDeDLmJQNbVVI31E9fijeN8J4sWQ6MA6xGnsP161KGaClyj39y+PHB/iYm4LMFOm09oWyOWGxmo8Unq/Ht361viMO73WN/Yqd42oumRG8NgVWBu3X4ppyhjXJukZ8/GMgEEF51S0YK7gdD3JNWhj5HllpKkyOn0o4PCNkadOsEckHmob3g9IOlnU/eoPzfHlq3+xJ5cfQvMpIPqjfgGqOY4lY0rEdT1o/mOS+TaMAuTtI6fNLdzDKrqo6kTW/BkhNXFl4rkuS6DuUYdrVnUFDFjuSJimbJPFN5AQ4FxVMbmG+Fb+h/KhuJwly2iPaO5EFfb4qPCWXe6oK6ET1ccmprN6m0yHLdjrl/jHDXNQOtCvIZZ/8ArNUc5zu3c3tCUBGpmYqo9gIJLGDtFIzi4mJZl3U7H3ozgkt3itgsbRa4CjadShmGkhhI2MLB6R77dnm8vodUy8clbTGnL8js3VF4AnWNiSZH34NDP2gllwoQtKhxqk+oqANPz6v0onjc+w+DsLbtt5hQRIO0jmW+egrmHiDNHvt5twknhZ4A7AdKXFgcWuMvz97LSy2qZ2LwXm3n4ZGY+oDS3yvX6iD9aOk1x3wj4lOGVQV1I53jZgQIkdD02PaunZZnFq+uq24JHI4YfKnevSxz1TJ1oJYwE2boG58t4+dJI/OucJmDOR6tJGxBp9xmYratszHcqQq9SSOAKT7a2bg9XP2NeT/yji2lYrPcfa0jUYLEcjtVWxb9SDrVvXbK6d9uJqK2PLOs7/y14yfsFFrHXf3iLVPPsuFy0ynmCVPuK9RjcvTVvGXvUQOgottS5Ls5I5cuKKgyJiqdhwbgIXneKJ+IML5T3B33H1qlky/vUbYx3r6ODi4c17gaSCFxTKauSJqFbZJgSTVrES17UfpVfW2r0zPtUm96EyO5BexZWwNTmXI2X+9WcDlhuYd2/iMn6jeKFJgXlWc7sQN+aOpm/wDpLjoVkFQy/Mb0tOvT2SZt4UDsGJI8thouT0I4JFBzmK4a6fIOozHmEdOsCidvDK9i7ftAw/4kB3VuvyKXcPgzdcJaUsaeKTcmxUG7viaSTBPvWUYwvhK2EAcjVG9e1HnhQ+wdgnbRMS5G2/51lzBXQDdaFHWDuaysqD1OqBJUwdbxWmY3U8g0e8KZQt0B7n4Q3pH/ADpWVlL5cnDHcfkZIacZNhT5EL0g8VpiM/uIgLsFAXeFJrysrB4s3KfF9WaccuKZzY49xcuMUDhmn1RxRnC+KWIgWl26TWVle5k8fHkrkroySXLbI/8Af7l1HhyrDhQP61tl+Ku3HebjEooPPWsrKnmwY8eN8Yr9joJJk+Eyhi5Ny6zA/wAM7H5mrWAs2bpZQizbaAdPbrWVleS5ynCcm+kqr8wZJNtk2b4jylViAfVEEfoagTHpeBWCj8g8g+1e1lHFijLDz99ghtArFW9YJGzD86DLfnmsrK9Lx1cWmGC0ynmjMSpYyg6UWS0ly1EbEbe1ZWVql+BDy6AOqQEG0TRHC4osoWYZeo617WVZmjGEPD2ZEXvLYk6uOTBp2OXpdEj0t3FZWV4/nRSzL7oEuyvdwVxNyFYfnUN8d+nArKyvPlqdHE2XAIjXDz0rTLxq1MayspuwiZ46Oq6nbT/WlHWQ0zxWVlfQ+D/0xX2FY1WkkK/SK0wtxwf3fPfasrKjW2SYUwOEYNruNJ5HWrvinDC/ZXE2+V2YcfNeVlFOmn9xX2B8qxjWrdwqdjGx4qBc9uqZQhP+0RXlZV+KbdgSPXz7EMZ1VlZWV3GPwNR//9k=',
          status: 'Vulnerável',
        },
        {
          id: 'tamandua-mirim',
          name: 'Tamanduá-mirim',
          scientificName: 'Tamandua tetradactyla',
          type: 'fauna',
          description:
            'Tamanduá arborícola de hábitos crepusculares que percorre as árvores e ocos das dunas em busca de formigas e cupins.',
          image: 'https://static.biologianet.com/2019/09/mirim.jpg',
          status: 'Pouco Preocupante',
        },
        {
          id: 'tatu-peba',
          name: 'Tatu-peba',
          scientificName: 'Euphractus sexcinctus',
          type: 'fauna',
          description:
            'Das restingas às clareiras abertas, este tatu escava galerias rasas e se alimenta de invertebrados, raízes e frutos caídos.',
          image: 'https://xenarthrans.org/wp-content/uploads/2023/12/Euphractus_Guillermo-Ferraris.jpg',
          status: 'Pouco Preocupante',
        },
        {
          id: 'codorna-amarela',
          name: 'Codorna-amarela',
          scientificName: 'Nothura minor',
          type: 'fauna',
          description:
            'Ave corredora de pequeno porte que ocupa campos limpos entre dunas e tabuleiros. Busca sementes e insetos ao amanhecer.',
          image: 'https://www.ecoregistros.org/site/images/dataimages/2021/12/09/474347/DSCN9287S.jpg',
          status: 'Vulnerável',
        },
        {
          id: 'gaviao-carijo',
          name: 'Gavião-carijó',
          scientificName: 'Rupornis magnirostris',
          type: 'fauna',
          description:
            'Rapina adaptável que patrulha as bordas da mata em busca de pequenos vertebrados. Vocaliza com frequência ao longo do dia.',
          image: 'https://s2.glbimg.com/xrkqJaRNRx7rcHklgF66qiLiXis=/s.glbimg.com/jo/g1/f/original/2015/09/02/557-162-c.jpg',
          status: 'Pouco Preocupante',
        },
        {
          id: 'briba-rabo-grosso',
          name: 'Briba-de-rabo-grosso',
          scientificName: 'Tyrannus melancholicus',
          type: 'fauna',
          description:
            'Passarinho insectívoro que usa poleiros altos para capturar insetos em voo e acompanhar bandos mistos pelas restinga.',
          image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh7pPJvC0aM7OImMAAMXK9LJ_JVYolovg47EFZ4PVVKILFO3ktAW6y57hYPRt83RBxOsIHXcdrN9UN5n8X2cZKr3UF663vacS65VlbKIPGYO9mCrCs5bvB-gTym6_CM2vjN1GFokcluSjk/s1600/IMG_9506-s001.jpg',
          status: 'Pouco Preocupante',
        },
        {
          id: 'iguana',
          name: 'Iguana',
          scientificName: 'Iguana iguana',
          type: 'fauna',
          description:
            'Lagarto de grande porte que utiliza áreas ensolaradas das dunas para termorregular e se alimenta de folhas novas e frutos.',
          image: 'https://f.i.uol.com.br/fotografia/2023/08/24/169290799664e7b9dce3ef3_1692907996_3x2_rt.jpg',
          status: 'Pouco Preocupante',
        },
        {
          id: 'olho-pavao-diurno',
          name: 'Olho-de-pavão-diurno',
          scientificName: 'Junonia evarete',
          type: 'fauna',
          description:
            'Borboleta comum nas clareiras arenosas. As asas com manchas oceladas confundem predadores enquanto visita flores nativas.',
          image: 'https://www.coisasdaroca.com/wp-content/uploads/2023/06/Borboleta-olho-de-pavao-diurno.jpg',
          status: 'Pouco Preocupante',
        },
        {
          id: 'abelha-orquidea',
          name: 'Abelha-de-orquídea',
          scientificName: 'Euglossa cordata',
          type: 'fauna',
          description:
            'Polinizadora especializada que coleta fragrâncias florais para atrair parceiras, garantindo a reprodução de diversas orquídeas.',
          image: 'https://s2-g1.glbimg.com/HPFwBbXHzCtjTKtmuCXC-rKMCVk=/0x0:1598x900/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2023/p/f/xZYGAbQ2aFVQkgBeoPAw/macho.png',
          status: 'Pouco Preocupante',
        },
        {
          id: 'guajiru',
          name: 'Guajiru',
          scientificName: 'Chrysobalanus icaco',
          type: 'flora',
          description:
            'Arbusto costeiro resistente à salinidade, forma moitas que estabilizam dunas e oferecem frutos adocicados à fauna.',
          image: 'https://unidunas.com.br/wp-content/uploads/2020/09/106910490_102228328201853_3280822873499638605_n.jpg',
          status: 'Pouco Preocupante',
        },
        {
          id: 'pau-brasil',
          name: 'Pau-brasil',
          scientificName: 'Paubrasilia echinata',
          type: 'flora',
          description:
            'Árvore símbolo da Mata Atlântica, possui cerne avermelhado valioso e flores amarelas que atraem polinizadores na primavera.',
          image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjNedTkMbM6S4sIJpp_HEKMBYauag1hjSiU1obtbWKKf7i-Mlg_pw-I6osweUl3i8_DqA5zulajE8RMJoI9qow3TG_jrpdSfuKsSwy4Bi8OGivV6AHDpuy6afR0yRiqTZlz2l97Rtgz6w/s1600/curi%25C3%25B3+006.JPG',
          status: 'Em perigo',
        },
        {
          id: 'manilkara-triflora',
          name: 'Manilkara triflora',
          scientificName: 'Manilkara triflora',
          type: 'flora',
          description:
            'Árvore rara da mata litorânea, reconhecida pelas folhas brilhantes e pelos frutos que sustentam aves frugívoras.',
          image: 'https://live.staticflickr.com/4412/37248864126_9fb96d2e24_b.jpg',
          status: 'Em perigo',
        },
        {
          id: 'macaranduba',
          name: 'Maçaranduba',
          scientificName: 'Manilkara huberi',
          type: 'flora',
          description:
            'Gigante da floresta atlântica com látex comestível e madeira densa muito procurada, exigindo manejo responsável.',
          image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgxLSHeJ0zHRGOeo10QF95-qZzkaQzZSNFjdH9m-wrfZESN00Ppd6GJaq_vmfG1LMCTIFgiScl-_u716xw0uhNlCm14BBvKSDB1QsP4jIHc66IwyHqZbKyF8vMw93AUigrffn5jjqZAK6Qy/s1600/ma%C3%A7aaramduba.JPG',
          status: 'Quase ameaçada',
        },
        {
          id: 'guabiraba-pau',
          name: 'Guabiraba-de-pau',
          scientificName: 'Campomanesia dichotoma',
          type: 'flora',
          description:
            'Mirtácea aromática que floresce no início das chuvas, fornecendo néctar para abelhas nativas e frutos ácidos.',
          image: 'https://live.staticflickr.com/23/38716722_f6266f209a_z.jpg',
          status: 'Pouco Preocupante',
        },
        {
          id: 'pororoca',
          name: 'Pororoca',
          scientificName: 'Clusia nemorosa',
          type: 'flora',
          description:
            'Árvore de casca espessa adaptada às dunas úmidas, sustenta epífitas e oferece refúgio para aves nas bordas da mata.',
          image: 'https://www.sidol.com.br/versao1.0/wp-content/uploads/2018/04/a-120.jpg',
          status: 'Pouco Preocupante',
        },
        {
          id: 'mirindiba',
          name: 'Mirindiba',
          scientificName: 'Buchenavia tomentosa',
          type: 'flora',
          description:
            'Espécie nativa de copa ampla que produz frutos apreciados por mamíferos e aves, auxiliando na regeneração da mata.',
          image: 'https://florestaexclusiva.com.br/wp-content/uploads/2025/06/Mirindiba-Uma-Joia-Pouco-Conhecida-da-Flora-Brasileira.png',
          status: 'Pouco Preocupante',
        },
        {
          id: 'sucupira',
          name: 'Sucupira',
          scientificName: 'Bowdichia virgilioides',
          type: 'flora',
          description:
            'Leguminosa de flores roxas perfumadas, importante para abelhas e tradicionalmente usada pela medicina popular.',
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdX82u8zTKsvaWk0xPvPepYqmq6fM61Ik5bg&s',
          status: 'Pouco Preocupante',
        },
      ],
      labels: {
        fauna: 'Fauna',
        flora: 'Flora',
        emptyState: 'Nenhum registro encontrado com os filtros selecionados.',
      },
    },
  },
  en: {
    navigation: {
      links: {
        home: 'Home',
        guides: 'Guides',
        booking: 'Booking',
        faunaFlora: 'Wildlife & Flora',
        admin: 'Admin',
      },
      scheduleButton: 'Book a Trail',
      translationToggle: {
        label: 'EN',
        tooltip: 'View site in Portuguese',
        ariaLabel: 'Switch language to Portuguese',
      },
      menuToggle: {
        openLabel: 'Open navigation menu',
        closeLabel: 'Close navigation menu',
      },
    },
    footer: {
      text: '© {year} AgenDunas. All rights reserved.',
      linksLabel: 'Institutional links',
      links: [
        { label: 'Book a trail', href: '/agendamento' },
        { label: 'Meet our guides', href: '/guias' },
        { label: 'Fauna & Flora', href: '/fauna-e-flora' },
      ],
      adminArea: { label: 'Admin area', href: '/login?redirect=/admin' },
    },
    home: {
      hero: {
        tag: 'Connect with nature',
        title: { prefix: 'Trails that ', highlight: 'awaken', suffix: ' your soul' },
        description:
          'Uncover the secrets of the Atlantic Forest through unique and unforgettable experiences. Each trail is a journey of discovery and connection with the wild.',
        primaryCta: 'Book an Adventure',
        secondaryCta: 'Explore Wildlife & Flora',
      },
      about: {
        tag: 'About Us',
        title: { prefix: 'Who ', highlight: 'We Are' },
        description:
          'We are a family business devoted to preserving the Atlantic Forest. For over 15 years we have guided visitors through the most pristine paths with respect and care for nature.',
        impactValue: '1,500+',
        impactDescription: 'Successful guided hikes',
        highlights: [
          { title: 'Passion', description: 'Genuine love for nature', icon: '🌿' },
          { title: 'Experience', description: '15+ years of adventures', icon: '🧭' },
          { title: 'Safety', description: 'Strict safety protocols', icon: '🛡️' },
          { title: 'Community', description: 'Strong ties with local residents', icon: '🤝' },
        ],
        mediaAriaLabel: 'Explorers hiking across the dunes',
      },
      trails: {
        tag: 'Our Trails',
        title: 'Our Trails',
        description:
          'Three unique experiences to reconnect with nature, each offering a different perspective of our forest.',
        items: [
          {
            name: 'Waterfall Trail',
            description:
              'A hike that leads you to the Atlantic Forest waterfalls with stops to observe the local wildlife.',
            duration: '5h30',
            difficulty: 'Moderate',
            groups: 'Up to 12 people',
            badge: 'Highlights',
            image: 'https://images.unsplash.com/photo-1458442310124-dde6edb43d10?auto=format&fit=crop&w=900&q=80',
          },
          {
            name: 'Overlook Trail',
            description:
              'A steep ascent rewarded with a 360° panoramic view of the Atlantic Ocean. Perfect for sunset lovers.',
            duration: '4h',
            difficulty: 'Challenging',
            groups: 'Up to 8 people',
            badge: 'Adventure',
            image: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&w=900&q=80',
          },
          {
            name: 'Ecological Trail',
            description:
              'An educational walk guided by our biologists featuring endemic species and forest storytelling.',
            duration: '3h30',
            difficulty: 'Easy',
            groups: 'Up to 15 people',
            badge: 'Families',
            image: 'https://images.unsplash.com/photo-1455218873509-8097305ee378?auto=format&fit=crop&w=900&q=80',
          },
        ],
        cta: 'See details',
      },
      wildlife: {
        tag: 'Wildlife',
        title: { prefix: 'Forest ', highlight: 'Residents' },
        description:
          'Meet some of the most charismatic inhabitants of our forest. Every trail is an opportunity to spot them in their natural habitat.',
        items: [
          {
            name: 'Toucan',
            image: 'https://images.unsplash.com/photo-1518799175674-ef795e70e1f6?auto=format&fit=crop&w=900&q=80',
          },
          {
            name: 'Capuchin Monkey',
            image: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&w=900&q=80',
          },
          {
            name: 'Agouti',
            image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=900&q=80',
          },
          {
            name: 'Anteater',
            image: 'https://images.unsplash.com/photo-1574851459476-3eb3fb9d1357?auto=format&fit=crop&w=900&q=80',
          },
        ],
        cta: 'View full gallery',
      },
      testimonials: {
        tag: 'What our adventurers say',
        title: 'Real experiences from people who felt the magic of our trails',
        items: [
          {
            quote:
              'Impeccable organization and very attentive guides. The overlook trail gave us unforgettable sunset memories!',
            name: 'Clara Mendonça',
            trail: 'Overlook Trail',
          },
          {
            quote:
              'It was thrilling to observe wildlife so closely. I will be back soon to explore other trails!',
            name: 'Rafael Albuquerque',
            trail: 'Ecological Trail',
          },
          {
            quote:
              'A very prepared team, great equipment, and breathtaking landscapes. Truly unforgettable.',
            name: 'Larissa Souza',
            trail: 'Waterfall Trail',
          },
          {
            quote:
              'Perfect to break the routine and reconnect with nature. Every stop came with a fascinating story!',
            name: 'Eduardo Campos',
            trail: 'Overlook Trail',
          },
        ],
        ratingLabel: 'Rating 5 out of 5',
        location: 'Natal, RN',
        navLabelPrefix: 'Testimonial from',
        navAriaLabel: 'Testimonial navigation',
      },
      stats: [
        { value: '4.9', label: 'Average rating' },
        { value: '500+', label: 'Guided adventures' },
        { value: '98%', label: 'Would recommend' },
      ],
    },
    guides: {
      header: {
        tag: 'Specialised Guides',
        title: 'Our Guides',
        description:
          'Meet the experts who will turn your adventure into an unforgettable story. Each guide brings a unique passion for nature and years of experience on the trails of the Atlantic Forest.',
        photo: withBasePath('images/capas/guias-capa.png'),
      },
      guides: [
        {
          id: 'davi-brito',
          name: 'Davi Brito',
          photo: withBasePath('images/guias/davi.jpg'),
          speciality: 'Resilience & Bahian Cuisine',
          description:
            'Salvador native who blends perseverance and hospitality, guiding experiences seasoned with the iconic flavours of Bahia.',
          trails: 420,
          experience: '5 years',
          rating: 4.9,
          certifications: ['Professional Bahian Cuisine', 'Empathetic Communication'],
          languages: ['Portuguese'],
        curiosities: [
          'Knows Salvador like few others after years as a ride-share driver',
          'Creates banquets that bring whole communities together',
          'Specialises in comfort menus served along the trails',
        ],
        featuredTrailId: 'cachoeira',
      },
      {
        id: 'matheus-brasileiro',
        name: 'Matheus Brasileiro',
          photo: withBasePath('images/guias/matue.jpg'),
          speciality: 'Natural Herbs & Music on the Trail',
          description:
            'Guide who unveils Northeastern biodiversity, teaching traditional plant uses accompanied by original musical compositions.',
          trails: 720,
          experience: '10 years',
          rating: 4.8,
          certifications: ['Applied Phytotherapy', 'Sustainable Cultivation'],
          languages: ['Portuguese', 'English'],
        curiosities: [
          'Maintains a living collection of regional medicinal species',
          'Founded initiatives that raise awareness about responsible plant use',
          'Developed innovative methods to extract natural essences',
        ],
        featuredTrailId: 'ecologica',
      },
      {
        id: 'carrara-luis',
        name: 'Carrara Luis',
          photo: withBasePath('images/guias/agostinho.jpg'),
          speciality: 'Urban Logistics & Route Optimisation',
          description:
            'Shortcut master who turns daily hustle into tours filled with humour, strategy, and streetwise tips.',
          trails: 1300,
          experience: '20 years',
          rating: 5,
          certifications: ['Advanced Defensive Driving', 'Rapid Negotiation'],
          languages: ['Portuguese'],
        curiosities: [
          'Former owner of the iconic “Carrara Taxis” fleet',
          'Knows every insider circle across the city',
          'Always finds creative shortcuts to outsmart traffic',
        ],
        featuredTrailId: 'mirante',
      },
      ],
      meta: {
        openProfileLabel: 'View full profile for {name}',
        closeProfileLabel: 'Close guide details',
        featuredGuideLabel: 'Featured guide',
        trailsLabel: 'guided hikes',
        experienceLabel: 'Experience',
        languagesLabel: 'Languages',
        cta: 'Request this guide',
        ratingAriaLabel: 'Rating {rating} out of 5',
        photoAltTemplate: 'Photo of guide {name}',
      },
      gridAriaLabel: 'Guides available to lead hikes',
    },
    booking: {
      hero: {
        tag: 'Plan Your Adventure',
        title: { prefix: 'Book your ', highlight: 'Adventure' },
        description:
          'Reserve your trail and get ready for a unique nature experience. Fill in the form and our team will reach out to confirm every detail.',
        photo: withBasePath('images/capas/agendamento-capa.png'),
      },
      guideSummary: {
        title: 'Selected guide',
        trailLabel: 'Lead trail',
        changeMessage: 'To change, return to the guides page and pick another expert.',
        emptyMessage: 'Choose your favourite guide on the guides page to see them here.',
      },
      form: {
        title: 'Booking Form',
        name: 'Full Name',
        namePlaceholder: 'Your full name',
        email: 'Email',
        emailPlaceholder: 'name@email.com',
        phone: 'Phone/WhatsApp',
        phonePlaceholder: '(84) 90000-0000',
        trail: 'Desired trail',
        selectPlaceholder: 'Select an option',
        date: 'Preferred date',
        time: 'Time',
        participants: 'Number of participants',
        notes: 'Notes (optional)',
        notesPlaceholder: 'Any additional information, special needs, or preferences?',
        submit: 'Send Booking Request',
        disclaimer:
          'Our team will get back to you within 24h with confirmation and full instructions for your experience.',
        helpText: 'Available trails may be updated by administrators at any time.',
      },
      terms: {
        checkboxLabel:
          'I have read and agree with the Service Terms and Consent for Personal Data Processing.',
        openModal: 'Read the full terms',
        modalTitle: 'Service Terms and Consent for Personal Data Processing',
        modalIntro:
          'Please review the Service Terms carefully before continuing with your booking. Acceptance is required to move forward.',
        acceptLabel: 'I have read and agree',
        closeLabel: 'Close',
        sections: [
          {
            paragraphs: [
              'By this instrument, a private legal entity, hereinafter referred to as Agendunas, and, on the other side, the data subject hereinafter referred to as IDEMA, agree to the following:',
            ],
          },
          {
            heading: '1. Purpose',
            paragraphs: [
              '1.1. These Terms regulate the use of the services made available by the Controller through Agendunas’ website/portal/application, as well as obtain the Data Subject’s consent for processing the personal data required to provide the service.',
              '1.2. The Data Subject understands that, for the service to operate properly (registration, scheduling, notifications, support, etc.), it will be necessary to provide certain personal data.',
            ],
          },
          {
            heading: '2. Collected Personal Data and Purpose',
            paragraphs: [
              '2.1. The Controller may collect, among others, the following personal data from the Data Subject: full name, email, phone number, identification data (CPF/RG or equivalent), and other information required for registration and use of the service.',
              '2.2. The purposes for data processing include: (I) user registration and identification; (II) booking and sending notifications; (III) customer service and support; (IV) communications related to the service; (V) compliance with legal obligations; (VI) other purposes informed to the Data Subject at the time of collection.',
              '2.3. Data processing will be based on the legal grounds set forth in the LGPD, especially (when applicable) the Data Subject’s consent (Art. 7, I of the LGPD) and/or the execution of a contract or pre-contractual procedures, compliance with legal obligations, legitimate interest, among others.',
            ],
          },
          {
            heading: '3. Consent',
            paragraphs: [
              '3.1. The Data Subject freely, expressly, and unequivocally consents to the Controller processing their personal data for the purposes described above.',
              '3.2. The Data Subject may revoke consent at any time by requesting it from the Controller through the indicated [email/contact]. Revocation may result in the partial or total impossibility of using the services provided.',
              '3.3. The Data Subject confirms having been informed about (I) which data are collected; (II) for which purposes; (III) how long the data will be stored; (IV) with whom they may be shared; (V) their rights as a data subject.',
            ],
          },
          {
            heading: '4. Data Sharing',
            paragraphs: [
              '4.1. The Controller may share the Data Subject’s personal data with third parties (suppliers, partners, service providers) solely for the purposes described in these Terms and under the commitment that such third parties observe the same security and privacy standards.',
              '4.2. Under no circumstances will personal data be shared for different purposes that have not been disclosed or without the appropriate legal basis for processing.',
            ],
          },
          {
            heading: '5. Storage and Security',
            paragraphs: [
              '5.1. Personal data will be stored for the period necessary to fulfil the purposes described herein or as required by law, regulation, or competent authority.',
              '5.2. The Controller undertakes to adopt appropriate technical and organisational measures to protect personal data against unauthorised access, leakage, alteration, or destruction.',
              '5.3. In the event of a security incident that may pose risk or significant damage to Data Subjects, the Controller will notify the Data Subject and the competent authority, when required by law.',
            ],
          },
          {
            heading: '6. Rights of the Data Subject',
            paragraphs: ['6.1. In accordance with Art. 18 of the LGPD, the Data Subject is entitled to:'],
            list: [
              'confirm the existence of processing;',
              'access their data;',
              'correct incomplete, inaccurate, or outdated data;',
              'request anonymisation, blocking, or deletion of unnecessary, excessive, or unlawfully processed data;',
              'request data portability to another service provider upon request;',
              'revoke consent and request deletion of data processed on the basis of consent;',
              'be informed about public and private entities with whom the Controller has shared their data.',
            ],
          },
          {
            paragraphs: [
              '6.2. To exercise their rights, the Data Subject may contact the Controller through [contact email / address / phone number]. The Controller may require proof of identity to meet the request.',
            ],
          },
          {
            heading: '7. Changes to the Terms',
            paragraphs: [
              '7.1. The Controller reserves the right to modify these Terms at any time by publishing the updated version on its website/portal or by sending a notice to the Data Subject.',
              '7.2. Continued use of the services after any changes constitutes acceptance of the new version by the Data Subject.',
            ],
          },
          {
            heading: '8. Term and Jurisdiction',
            paragraphs: [
              '8.1. These Terms take effect on the date of acceptance (for example, when the Data Subject clicks “I agree” or “I accept”) and remain in force as long as data processing continues for the purposes set forth herein.',
              '8.2. Brazilian law governs any disputes arising from these Terms, and the parties elect the courts of [Natal/RN], expressly waiving any other, however privileged it may be.',
            ],
          },
        ],
      },
      trails: [
        {
          id: 'cachoeira',
          label: 'Waterfall Trail',
          description: 'Route with a refreshing waterfall break and birdwatching.',
          duration: '5h30',
        },
        {
          id: 'mirante',
          label: 'Overlook Trail',
          description: 'Climb with panoramic views of the coastline.',
          duration: '4h',
        },
        {
          id: 'ecologica',
          label: 'Ecological Trail',
          description: 'Educational experience focused on wildlife and flora.',
          duration: '3h30',
        },
        {
          id: 'noturna',
          label: 'Night Trail',
          description: 'Experience the sounds of the forest beneath the starry sky.',
          duration: '2h',
        },
      ],
      sidebar: {
        locationTitle: 'Our Location',
        mapTitle: 'Parque das Dunas Map',
        address: 'Av. Alm. Alexandrino de Alencar, s/n · Tirol, Natal - RN',
        addressComplement: 'Parque das Dunas · Bosque dos Namorados',
        contactTitle: 'Contact Information',
        phone: 'Phone',
        phoneValue: '(31) 3456-7890',
        whatsapp: 'WhatsApp',
        whatsappValue: '(84) 99876-5432',
        email: 'Email',
        emailValue: 'contato@agendunas.com.br',
        schedule: 'Service hours',
        scheduleValue: 'Daily · 7 a.m. to 5 p.m.',
        infoTitle: 'Important Information',
        infoItems: [
          'We will confirm your spot as soon as we validate the availability of the chosen trail.',
          'Arrive 20 minutes early for the mandatory safety briefing.',
          'Recommendations: light clothing, closed shoes, repellent, and a reusable water bottle.',
        ],
      },
      weather: {
        title: 'Weather Outlook',
        subtitle: 'Forecast for Parque das Dunas - Bosque dos Namorados',
        selectDatePrompt: 'Pick a date in the form to see the forecast.',
        loading: 'Loading forecast...',
        error: 'We could not load the weather forecast. Please try again later.',
        empty:
          'No forecast available for this day. Choose another date or check closer to your visit.',
        forecastFor: 'Forecast for {date}',
        temperatureLabel: 'Temperature',
        maxLabel: 'High',
        minLabel: 'Low',
        precipitationLabel: 'Chance of rain',
        precipitationFallback: 'No data',
        sourceLabel: 'Source: Open-Meteo (updated daily)',
        conditions: {
          clear: 'Clear sky',
          mostlyClear: 'Mostly sunny',
          partlyCloudy: 'Partly cloudy',
          overcast: 'Overcast',
          fog: 'Fog',
          drizzle: 'Drizzle',
          freezingDrizzle: 'Freezing drizzle',
          rainLight: 'Light to moderate rain',
          rainHeavy: 'Heavy rain',
          freezingRain: 'Freezing rain',
          snow: 'Snow or sleet',
          thunderstorm: 'Thunderstorm',
          unknown: 'Weather information unavailable',
        },
      },
      rainWarningModal: {
        tag: 'Weather alert',
        title: 'High chance of rain',
        description:
          'The forecast shows a {percentage} chance of rain on {date}. Would you like to pick another day or continue anyway?',
        highlight: 'Rain probability: {percentage}.',
        changeDate: 'Choose another date',
        proceed: 'Continue anyway',
      },
    },
    faunaFlora: {
      hero: {
        tag: 'Wildlife & Flora',
        title: 'Wildlife & Flora Showcase',
        description:
          'Discover the rich biodiversity of the Atlantic Forest. A photographic collection of the most fascinating inhabitants of our trails.',
        searchPlaceholder: 'Search by common or scientific name...',
        filterGroupLabel: 'Showcase filters',
        photo: withBasePath('images/capas/flora-capa.png'),
      },
      filters: [
        { id: 'all', label: 'All' },
        { id: 'fauna', label: 'Wildlife' },
        { id: 'flora', label: 'Flora' },
      ],
      gallery: [
        {
          id: 'tucano-toco',
          name: 'Toco Toucan',
          scientificName: 'Ramphastos toco',
          type: 'fauna',
          description:
            'Iconic Atlantic Forest bird with a striking colourful beak. Often seen in the morning over open areas.',
          image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80',
          status: 'Least Concern',
        },
        {
          id: 'mico-leao-dourado',
          name: 'Golden Lion Tamarin',
          scientificName: 'Leontopithecus rosalia',
          type: 'fauna',
          description:
            'Endemic primate of the Atlantic Forest taking part in reintroduction programs along our trails.',
          image: 'https://images.unsplash.com/photo-1507666405895-422eee7d5172?auto=format&fit=crop&w=1200&q=80',
          status: 'Endangered',
        },
        {
          id: 'bromelia-imperial',
          name: 'Imperial Bromeliad',
          scientificName: 'Vriesea regina',
          type: 'flora',
          description:
            'Epiphytic plant that paints the trails with vibrant colours. It blooms from November to January.',
          image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=80',
          status: 'Protected',
        },
        {
          id: 'preguica',
          name: 'Brown-throated Sloth',
          scientificName: 'Bradypus variegatus',
          type: 'fauna',
          description:
            'Tree-dwelling mammal spotted near bromeliad groves. Frequently seen in family groups by dusk.',
          image: 'https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=1200&q=80',
          status: 'Least Concern',
        },
        {
          id: 'orquidea-lua',
          name: 'Moon Orchid',
          scientificName: 'Cattleya walkeriana',
          type: 'flora',
          description:
            'A sweet-scented orchid highly admired by visitors. We maintain a nursery dedicated to its conservation.',
          image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80',
          status: 'Vulnerable',
        },
        {
          id: 'jararaca',
          name: 'Dune Lancehead',
          scientificName: 'Bothrops erythromelas',
          type: 'fauna',
          description:
            'Discreet snake essential for ecological balance. Guides teach visitors how to identify tracks safely.',
          image: 'https://images.unsplash.com/photo-1617831489119-471b33e49d5a?auto=format&fit=crop&w=1200&q=80',
          status: 'Least Concern',
        },
        {
          id: 'tamandua-mirim',
          name: 'Southern Tamandua',
          scientificName: 'Tamandua tetradactyla',
          type: 'fauna',
          description:
            'Tree-climbing anteater with crepuscular habits, roaming hollow trunks and canopy vines in search of ants and termites.',
          image: 'https://static.biologianet.com/2019/09/mirim.jpg',
          status: 'Least Concern',
        },
        {
          id: 'tatu-peba',
          name: 'Six-banded Armadillo',
          scientificName: 'Euphractus sexcinctus',
          type: 'fauna',
          description:
            'Digging mammal that opens shallow burrows across sandy clearings while foraging for invertebrates, roots, and fallen fruit.',
          image: 'https://xenarthrans.org/wp-content/uploads/2023/12/Euphractus_Guillermo-Ferraris.jpg',
          status: 'Least Concern',
        },
        {
          id: 'codorna-amarela',
          name: 'Yellow Tinamou',
          scientificName: 'Nothura minor',
          type: 'fauna',
          description:
            'Small ground bird of open grasslands among dunes and tablelands. Forages for seeds and insects during dawn walks.',
          image: 'https://www.ecoregistros.org/site/images/dataimages/2021/12/09/474347/DSCN9287S.jpg',
          status: 'Vulnerable',
        },
        {
          id: 'gaviao-carijo',
          name: 'Roadside Hawk',
          scientificName: 'Rupornis magnirostris',
          type: 'fauna',
          description:
            'Versatile raptor that patrols forest edges for small vertebrates, often calling loudly throughout the day.',
          image: 'https://s2.glbimg.com/xrkqJaRNRx7rcHklgF66qiLiXis=/s.glbimg.com/jo/g1/f/original/2015/09/02/557-162-c.jpg',
          status: 'Least Concern',
        },
        {
          id: 'briba-rabo-grosso',
          name: 'Short-tailed Kingbird',
          scientificName: 'Tyrannus melancholicus',
          type: 'fauna',
          description:
            'Insectivorous flycatcher that uses exposed perches to snatch prey on the wing and accompanies mixed flocks through the restinga.',
          image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh7pPJvC0aM7OImMAAMXK9LJ_JVYolovg47EFZ4PVVKILFO3ktAW6y57hYPRt83RBxOsIHXcdrN9UN5n8X2cZKr3UF663vacS65VlbKIPGYO9mCrCs5bvB-gTym6_CM2vjN1GFokcluSjk/s1600/IMG_9506-s001.jpg',
          status: 'Least Concern',
        },
        {
          id: 'iguana',
          name: 'Green Iguana',
          scientificName: 'Iguana iguana',
          type: 'fauna',
          description:
            'Large arboreal lizard that basks on sunny dune perches and feeds mainly on tender leaves and seasonal fruits.',
          image: 'https://f.i.uol.com.br/fotografia/2023/08/24/169290799664e7b9dce3ef3_1692907996_3x2_rt.jpg',
          status: 'Least Concern',
        },
        {
          id: 'olho-pavao-diurno',
          name: 'Mangrove Peacock',
          scientificName: 'Junonia evarete',
          type: 'fauna',
          description:
            'Day-flying butterfly common in sandy glades. Eye-like spots on the wings deter predators while it visits native blooms.',
          image: 'https://www.coisasdaroca.com/wp-content/uploads/2023/06/Borboleta-olho-de-pavao-diurno.jpg',
          status: 'Least Concern',
        },
        {
          id: 'abelha-orquidea',
          name: 'Orchid Bee',
          scientificName: 'Euglossa cordata',
          type: 'fauna',
          description:
            'Specialised pollinator that gathers floral fragrances to attract mates, ensuring the reproduction of many orchids.',
          image: 'https://s2-g1.glbimg.com/HPFwBbXHzCtjTKtmuCXC-rKMCVk=/0x0:1598x900/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2023/p/f/xZYGAbQ2aFVQkgBeoPAw/macho.png',
          status: 'Least Concern',
        },
        {
          id: 'guajiru',
          name: 'Coco-plum',
          scientificName: 'Chrysobalanus icaco',
          type: 'flora',
          description:
            'Coastal shrub tolerant to salt spray that stabilises dunes with dense thickets and offers sweet fruit for wildlife.',
          image: 'https://unidunas.com.br/wp-content/uploads/2020/09/106910490_102228328201853_3280822873499638605_n.jpg',
          status: 'Least Concern',
        },
        {
          id: 'pau-brasil',
          name: 'Brazilwood',
          scientificName: 'Paubrasilia echinata',
          type: 'flora',
          description:
            'Iconic Atlantic Forest tree with valuable reddish heartwood and yellow blossoms that attract pollinators in spring.',
          image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjNedTkMbM6S4sIJpp_HEKMBYauag1hjSiU1obtbWKKf7i-Mlg_pw-I6osweUl3i8_DqA5zulajE8RMJoI9qow3TG_jrpdSfuKsSwy4Bi8OGivV6AHDpuy6afR0yRiqTZlz2l97Rtgz6w/s1600/curi%25C3%25B3+006.JPG',
          status: 'Endangered',
        },
        {
          id: 'manilkara-triflora',
          name: 'Manilkara triflora',
          scientificName: 'Manilkara triflora',
          type: 'flora',
          description:
            'Rare coastal forest tree recognised by glossy foliage and fruit that sustains many frugivorous birds.',
          image: 'https://live.staticflickr.com/4412/37248864126_9fb96d2e24_b.jpg',
          status: 'Endangered',
        },
        {
          id: 'macaranduba',
          name: 'Macaranduba',
          scientificName: 'Manilkara huberi',
          type: 'flora',
          description:
            'Massive Atlantic Forest tree yielding edible latex and dense timber, demanding careful management to avoid overharvest.',
          image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgxLSHeJ0zHRGOeo10QF95-qZzkaQzZSNFjdH9m-wrfZESN00Ppd6GJaq_vmfG1LMCTIFgiScl-_u716xw0uhNlCm14BBvKSDB1QsP4jIHc66IwyHqZbKyF8vMw93AUigrffn5jjqZAK6Qy/s1600/ma%C3%A7aaramduba.JPG',
          status: 'Near Threatened',
        },
        {
          id: 'guabiraba-pau',
          name: 'Guabiraba',
          scientificName: 'Campomanesia dichotoma',
          type: 'flora',
          description:
            'Aromatic myrtle that flowers with the first rains, providing nectar to native bees and acidic berries.',
          image: 'https://live.staticflickr.com/23/38716722_f6266f209a_z.jpg',
          status: 'Least Concern',
        },
        {
          id: 'pororoca',
          name: 'Pororoca Clusia',
          scientificName: 'Clusia nemorosa',
          type: 'flora',
          description:
            'Thick-barked tree adapted to moist dunes, supporting epiphytes and offering shelter for birds at forest edges.',
          image: 'https://www.sidol.com.br/versao1.0/wp-content/uploads/2018/04/a-120.jpg',
          status: 'Least Concern',
        },
        {
          id: 'mirindiba',
          name: 'Mirindiba',
          scientificName: 'Buchenavia tomentosa',
          type: 'flora',
          description:
            'Native canopy tree with fruit relished by mammals and birds, aiding natural forest regeneration.',
          image: 'https://florestaexclusiva.com.br/wp-content/uploads/2025/06/Mirindiba-Uma-Joia-Pouco-Conhecida-da-Flora-Brasileira.png',
          status: 'Least Concern',
        },
        {
          id: 'sucupira',
          name: 'Sucupira',
          scientificName: 'Bowdichia virgilioides',
          type: 'flora',
          description:
            'Fragrant purple-flowered legume valued by native bees and widely used in traditional medicine.',
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdX82u8zTKsvaWk0xPvPepYqmq6fM61Ik5bg&s',
          status: 'Least Concern',
        },
      ],
      labels: {
        fauna: 'Wildlife',
        flora: 'Flora',
        emptyState: 'No records found for the selected filters.',
      },
    },
  },
}

export type {
  Language,
  TranslationContent,
  HomeTranslation,
  BookingTranslation,
  GuideTranslation,
  FaunaFloraTranslation,
  NavigationTranslation,
  FooterTranslation,
}
export { translations }
