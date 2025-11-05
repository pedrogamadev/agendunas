export type TrailGuide = {
  id: string;
  nome: string;
  ativo: boolean;
};

export type TrailSessionInfo = {
  id: string;
  inicio: string;
  fim?: string | null;
  status?: string;
  capacidade?: number;
  vagas?: number;
  participantes?: number;
  guia?: string | null;
  pontoEncontro?: string | null;
};

export type Trail = {
  id: string;
  nome: string;
  duracao: string;
  capacidade: number;
  proximaSessao?: string;
  imagemUrl?: string;
  slug?: string;
  resumo?: string;
  descricao?: string;
  dificuldade?: string;
  status?: string;
  precoBase?: string;
  badge?: string | null;
  destaque?: boolean;
  visivelNaHome?: boolean;
  proximasSessoes?: number;
  pontoEncontro?: string | null;
  ultimaSessao?: string | null;
  criadaEm?: string;
  atualizadaEm?: string;
  duracaoMinutos?: number;
  capacidadeMaxima?: number;
  guias?: TrailGuide[];
  sessoes?: TrailSessionInfo[];
};
