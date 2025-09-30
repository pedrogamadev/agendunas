type Language = 'pt' | 'en'

type HighlightedTitle = {
  prefix: string
  highlight: string
  suffix?: string
}

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
  }[]
  meta: {
    trailsLabel: string
    experienceLabel: string
    languagesLabel: string
    cta: string
    ratingAriaLabel: string
    photoAltTemplate: string
  }
  gridAriaLabel: string
}

type BookingTranslation = {
  hero: {
    tag: string
    title: HighlightedTitle
    description: string
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
}

type FaunaFloraTranslation = {
  hero: {
    tag: string
    title: string
    description: string
    searchPlaceholder: string
    filterGroupLabel: string
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
  }
  scheduleButton: string
  translationToggle: {
    label: string
    tooltip: string
    ariaLabel: string
  }
}

type FooterTranslation = {
  text: string
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
      },
      scheduleButton: 'Agendar Trilha',
      translationToggle: {
        label: 'PT',
        tooltip: 'Ver site em inglês',
        ariaLabel: 'Alterar idioma para inglês',
      },
    },
    footer: {
      text: '© {year} AgenDunas. Todos os direitos reservados.',
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
      },
      guides: [
        {
          id: 'davi-brito',
          name: 'Davi Brito',
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
        },
      ],
      meta: {
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
        address: 'Estrada da Serra, km 15 · Verde, MG',
        addressComplement: 'Entrada Principal · Portão 1',
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
    },
    faunaFlora: {
      hero: {
        tag: 'Fauna & Flora',
        title: 'Mural da Fauna & Flora',
        description:
          'Descubra a rica biodiversidade da mata atlântica. Uma coleção fotográfica dos habitantes mais fascinantes da nossa floresta.',
        searchPlaceholder: 'Buscar por nome comum ou científico...',
        filterGroupLabel: 'Filtros do mural',
      },
      filters: [
        { id: 'all', label: 'Todos' },
        { id: 'fauna', label: 'Fauna' },
        { id: 'flora', label: 'Flora' },
      ],
      gallery: [
        {
          id: 'tucano-toco',
          name: 'Tucano-toco',
          scientificName: 'Ramphastos toco',
          type: 'fauna',
          description:
            'Ave símbolo das matas atlânticas com bico colorido marcante. Observado pela manhã nas áreas abertas.',
          image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80',
          status: 'Pouco Preocupante',
        },
        {
          id: 'mico-leao-dourado',
          name: 'Mico-leão-dourado',
          scientificName: 'Leontopithecus rosalia',
          type: 'fauna',
          description:
            'Primata endêmico da Mata Atlântica que participa de programas de reintrodução nas nossas trilhas.',
          image: 'https://images.unsplash.com/photo-1507666405895-422eee7d5172?auto=format&fit=crop&w=1200&q=80',
          status: 'Em perigo',
        },
        {
          id: 'bromelia-imperial',
          name: 'Bromélia Imperial',
          scientificName: 'Vriesea regina',
          type: 'flora',
          description:
            'Planta epífita que colore as trilhas com tons vibrantes. Floresce entre novembro e janeiro.',
          image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=80',
          status: 'Protegida',
        },
        {
          id: 'preguica',
          name: 'Bicho-preguiça',
          scientificName: 'Bradypus variegatus',
          type: 'fauna',
          description:
            'Mamífero arborícola avistado em áreas de bromélias. Costuma ser visto em grupos familiares no entardecer.',
          image: 'https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=1200&q=80',
          status: 'Pouco Preocupante',
        },
        {
          id: 'orquidea-lua',
          name: 'Orquídea-da-lua',
          scientificName: 'Cattleya walkeriana',
          type: 'flora',
          description:
            'Orquídea de perfume adocicado muito buscada pelos visitantes. Cultivamos um viveiro para conservação.',
          image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80',
          status: 'Vulnerável',
        },
        {
          id: 'jararaca',
          name: 'Jararaca-das-dunas',
          scientificName: 'Bothrops erythromelas',
          type: 'fauna',
          description:
            'Serpente discreta e essencial para o equilíbrio ecológico. Guias treinam visitantes a identificar rastros com segurança.',
          image: 'https://images.unsplash.com/photo-1617831489119-471b33e49d5a?auto=format&fit=crop&w=1200&q=80',
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
      },
      scheduleButton: 'Book a Trail',
      translationToggle: {
        label: 'EN',
        tooltip: 'View site in Portuguese',
        ariaLabel: 'Switch language to Portuguese',
      },
    },
    footer: {
      text: '© {year} AgenDunas. All rights reserved.',
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
      },
      guides: [
        {
          id: 'davi-brito',
          name: 'Davi Brito',
          photo: withBasePath('images/guias/davi-brito.jpg'),
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
        },
        {
          id: 'matheus-brasileiro',
          name: 'Matheus Brasileiro',
          photo: withBasePath('images/guias/matheus-brasileiro.jpg'),
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
        },
        {
          id: 'carrara-luis',
          name: 'Carrara Luis',
          photo: withBasePath('images/guias/carrara-luis.jpg'),
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
        },
      ],
      meta: {
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
        address: 'Estrada da Serra, km 15 · Verde, MG',
        addressComplement: 'Main Entrance · Gate 1',
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
    },
    faunaFlora: {
      hero: {
        tag: 'Wildlife & Flora',
        title: 'Wildlife & Flora Showcase',
        description:
          'Discover the rich biodiversity of the Atlantic Forest. A photographic collection of the most fascinating inhabitants of our trails.',
        searchPlaceholder: 'Search by common or scientific name...',
        filterGroupLabel: 'Showcase filters',
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
