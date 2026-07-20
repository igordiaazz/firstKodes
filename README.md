<div align="center">
  <br />
  <img src="./src/app/icon.svg" alt="firstKodes logo" width="120" height="120" />
  <h1>firstKodes</h1>
  <p><strong>Plataforma gamificada de ensino de programação para quem está começando.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-14.2-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 14" />
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
    <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5.7" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 3.4" />
    <img src="https://img.shields.io/badge/Framer_Motion-11.15-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
    <img src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/OpenRouter_API-FF6B6B?style=for-the-badge&logo=openai&logoColor=white" alt="OpenRouter API" />
    <img src="https://img.shields.io/badge/ESLint-8.57-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint" />
  </p>
</div>

---

## Sobre

**firstKodes** é uma aplicação web interativa que ensina lógica de programação com Python de forma divertida e progressiva. Através de fases temáticas, desafios "chefão" e um sistema de progresso gamificado (vidas, streaks, desbloqueio de módulos), o iniciante é guiado por conceitos fundamentais da programação.

### Módulos

| | Módulo | Conteúdo |
|---|--------|----------|
| 🔤 | **Fundamentos** | Variáveis, tipos de dados, `print` e operadores básicos |
| 🔀 | **Decisões** | Estruturas condicionais (`if`/`elif`/`else`) |
| 🔁 | **Repetições** | Laços (`while`, `for`, `break`) |
| 📦 | **Funções e Listas** | Definição de funções (`def`/`return`), listas e índices |
| 🏆 | **Desafio Chefão** | Editor de código livre com tutoria do Clippy |

### Sistema de Pontuação (KodeScore)

Cada módulo tem um valor base de pontos por fase de escolha; fases de digitação (boss) valem o dobro:

| Módulo | Base | 5 escolhas | 1 boss | Total |
|--------|------|-----------|--------|-------|
| 🔤 Fundamentos | 2 | 10 | 4 | 14 |
| 🔀 Decisões | 2 | 10 | 4 | 14 |
| 🔁 Repetições | 3 | 15 | 6 | 21 |
| 📦 Funções e Listas | 3 | 15 | 6 | 21 |
| 🏆 Desafios Finais | 4 | 20 | 8 | 28 |
| **Total geral** | | | | **98** |

Os pontos são acumulados ao longo de toda a jornada e exibidos no **card de perfil** (ao clicar em Perfil), com animação (NumberTicker). No cabeçalho, permanece visível apenas a **Ofensiva (streak)** em tamanho normal.

---

## Funcionalidades

- 🎮 **Fases Interativas** — Complete códigos selecionando palavras-chave ou descubra a saída do código
- ❤️ **Sistema de Vidas** — 3 vidas por módulo; erre e aprenda com o feedback
- ⭐ **Sistema de Pontos (KodeScore)** — Ganhe pontos a cada fase concluída (2 a 4 por escolha, dobro na digitação)
- 🔐 **Autenticação** — Login com Google ou GitHub via Supabase para salvar progresso na nuvem
- 💾 **Progresso Persistente** — Salvo no `localStorage` (anônimo) ou no banco Supabase (logado), com streaks, desbloqueio progressivo e KodeScore
- 🤖 **Modo Prática** — Gera 5 questões personalizadas por módulo via IA (completar código ou prever saída)
- 👑 **Desafio Chefão** — Fase final com editor de código livre e tutoria do Clippy
- 🦎 **Tutor IA (Clippy)** — Feedback contextual que se adapta ao número de vidas restantes
- 🎠 **Carrossel de Módulos** — Navegação intuitiva com animações suaves
- 🔥 **Sistema de Streak (Ofensiva)** — Ao concluir uma fase por dia, a chama cinza se transforma em laranja (cresce e muda de cor) ao "acender" (arraste para cima). Cresce +1 por dia consecutivo e zera se um dia for pulado
- 🌐 **Internacionalização (i18n)** — Suporte a Português e Inglês com roteamento por locale (`/[locale]`) via `next-intl`
- ⚙️ **Configurações** — Painel com troca de idioma, reset de progresso com confirmação animada (botão cinza → vermelho) e saída da conta
- 📋 **Questionário de Onboarding** — Na primeira vez que o usuário cria a conta, uma tela dedicada (estilo fase de módulo no mobile, estilo login no desktop) com 6 perguntas: nível de conhecimento, motivação, tempo diário, meta, momento profissional e "superpoder". A pergunta é digitada caractere a caractere com a palavra-chave em destaque roxo. As respostas são salvas no perfil Supabase e a tela não reaparece. Fluxo: login → onboarding → splash de boas-vindas → menu
- 👋 **Tela de Boas-vindas** — Exibida após login com conta ativa: animação sequencial (fade-in/slide-up) com nome e "Membro desde [mês/ano]". Contas novas veem "Bem-vindo! / Aproveite!" sem o "Membro desde". No desktop some sozinha em 5s; no mobile fecha ao tocar em "Continuar"
- 🔙 **Revisão entre Fases** — Botão de fase anterior no cabeçalho para voltar e revisar fases já feitas; ao revisitá-las entra em **modo revisão** (selo "Revisão"), sem conceder pontos ou alterar o progresso salvo. Navegação suave com animação de entrada a cada fase
- 💡 **Explicação ao Acertar** — Ao acertar, um popup desliza de baixo (≈25% da tela, verde/vermelho) com a explicação do "porquê está correto" e o botão de avanço. O conteúdo rola internamente, sem scrollbar da janela
- 📖 **Tooltips de Termos** — Palavras sublinhadas abrem a definição; o tooltip vira para cima/baixo e se posiciona para **sempre ficar dentro da tela** (mobile incluso)
- 🎠 **Carrossel de Módulos** — Navegação intuitiva com animações suaves; no mobile, cards não selecionados são empurrados para fora da tela (com peek lateral); no desktop, cards vizinhos ficam visíveis com redução de brilho e blur
- 🤖 **Dica do Mascote** — O Clippy inclui a dica "Toque nas palavras sublinhadas para saber o que são!"
- 🎯 **Avanço Manual** — Após acertar, botão "Próxima fase" para avançar no seu ritmo
- 💜 **Design Responsivo** — Interface adaptada para mobile e desktop com animações suaves entre fases

---

## Stack

| | Tecnologia | Versão | Finalidade |
|---|------------|--------|------------|
| ⚡ | [Next.js](https://nextjs.org/) | 14.2 | Framework React com App Router |
| ⚛️ | [React](https://react.dev/) | 18.3 | Biblioteca de UI |
| 🛡️ | [TypeScript](https://www.typescriptlang.org/) | 5.7 | Tipagem estática |
| 🎨 | [Tailwind CSS](https://tailwindcss.com/) | 3.4 | Estilização utilitária |
| 🌀 | [Framer Motion](https://www.framer.com/motion/) | 11.15 | Animações e transições |
| 🌐 | [next-intl](https://next-intl.dev/) | 3.x | Internacionalização (i18n) e roteamento por locale |
| 🎯 | [Lucide React](https://lucide.dev/) | 0.468 | Ícones |
| 🗄️ | [Supabase](https://supabase.com/) | — | Autenticação e banco de dados |
| 🧠 | [OpenRouter API](https://openrouter.ai/) | — | Integração com modelos de IA |
| 🧩 | [shadcn/ui](https://ui.shadcn.com/) | — | Componentes de UI reutilizáveis |
| 📐 | [ESLint](https://eslint.org/) | 8.57 | Linting |
| 🎨 | [PostCSS](https://postcss.org/) / [Autoprefixer](https://github.com/postcss/autoprefixer) | — | Processamento CSS |

---

## Começando

### Pré-requisitos

- Node.js 18+
- npm, yarn ou pnpm

### Instalação

```bash
# Clone o repositório
git clone https://github.com/igordiaazz/firstkodes.git
cd firstkodes

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas chaves
```

### Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `OPENROUTER_API_KEY` | Sim | Chave da API OpenRouter para o tutor IA |
| `OPENROUTER_MODEL` | Não | Modelo OpenRouter (padrão: `google/gemini-2.5-flash`) |
| `NEXT_PUBLIC_SITE_URL` | Sim | URL do site (`http://localhost:3000` em dev) |
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave anônima do Supabase |

### Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Produção

```bash
npm run build
npm start
```

---

## Banco de Dados (Supabase)

As migrações SQL ficam em `supabase/migrations/`. Para aplicar, rode no SQL Editor do Supabase ou via Supabase CLI:

- `001_initial.sql` — Tabelas `profiles` e `progress` + trigger de criação de perfil no signup
- `002_streak_date.sql` — Coluna `last_activity_date` na tabela `progress`
- `003_onboarding.sql` — Colunas `onboarding_completed` (boolean) e `onboarding` (jsonb) na tabela `profiles`, usadas pelo questionário de onboarding

---

## Deploy na Vercel

O projeto está configurado para deploy na [Vercel](https://vercel.com).

### Passo a passo

1. Conecte o repositório do GitHub à Vercel
2. Adicione as variáveis de ambiente no dashboard da Vercel:

   | Nome | Valor |
   |------|-------|
   | `NEXT_PUBLIC_SITE_URL` | `https://seu-site.vercel.app` |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://oknxuqavmbpsshkzpnfn.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(sua chave anônima)* |
   | `OPENROUTER_API_KEY` | *(sua chave OpenRouter)* |

3. Faça o deploy

### Configuração dos Provedores OAuth

Após o deploy, configure os provedores de login no Supabase e nos serviços externos:

**No Supabase Dashboard** → Authentication → Providers:

- **GitHub**: Copie a Callback URL gerada e registre no [GitHub OAuth Apps](https://github.com/settings/developers)
- **Google**: Copie a Callback URL gerada e registre no [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

> As URLs de callback seguem o padrão: `https://<project>.supabase.co/auth/v1/callback`

No GitHub OAuth App, configure:
- **Homepage URL**: `https://seu-site.vercel.app`
- **Authorization callback URL**: URL do Supabase

No Google Cloud Console, configure:
- **Authorized JavaScript origins**: `https://seu-site.vercel.app`
- **Authorized redirect URIs**: URL do Supabase

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── [locale]/                      # Rotas internacionalizadas (pt, en)
│   │   ├── (auth)/
│   │   │   └── login/page.tsx         # Página de login (Google / GitHub)
│   │   ├── layout.tsx                 # Layout do locale (providers, fonte)
│   │   └── page.tsx                   # Página principal (carrossel, streak)
│   ├── api/
│   │   ├── check-code/route.ts         # API de tutoria IA
│   │   ├── generate-module5/route.ts   # Geração de desafio chefão IA
│   │   ├── generate-practice/route.ts  # Geração de exercícios IA
│   │   ├── onboarding/route.ts          # API do questionário de onboarding (GET/POST)
│   │   └── progress/route.ts           # API de progresso do usuário
│   ├── auth/
│   │   └── callback/route.ts           # Callback OAuth (troca código por sessão)
│   ├── layout.tsx                      # Layout raiz (AuthProvider, fonte Inter)
│   └── globals.css                     # Estilos globais + Tailwind
├── components/
│   ├── BossPhase.tsx                   # Fase chefão (editor livre)
│   ├── Carousel.tsx                    # Carrossel de módulos
│   ├── Footer.tsx                      # Rodapé
│   ├── GameLevel.tsx                   # Fase principal (seleção de palavras)
│   ├── GameLevelEn.ts                  # Fase principal (versão EN)
│   ├── Mascot.tsx                      # Mascote / Clippy (tutor IA)
│   ├── OnboardingScreen.tsx             # Tela do questionário de onboarding
│   ├── Module5Game.tsx                  # Desafio chefão
│   ├── ModuleComplete.tsx              # Tela de módulo concluído
│   ├── PhaseContainer.tsx              # Container de fases
│   ├── StreakPending.tsx               # Chama de streak (arraste p/ acender)
│   ├── StreakLost.tsx                  # Tela de streak perdida
│   ├── TermTooltip.tsx                 # Tooltip de termos
│   ├── User3DCard.tsx                  # Card do perfil do usuário
│   ├── WelcomeSplash.tsx               # Tela de boas-vindas (pós-login)
│   └── ui/                             # Componentes de UI (button, number-ticker, …)
├── contexts/
│   └── AuthContext.tsx                 # Contexto de autenticação
├── data/
│   ├── moduleOneLevels.ts              # Fases do módulo 1 (PT)
│   ├── moduleOneLevels.en.ts           # Fases do módulo 1 (EN)
│   ├── modulesConfig.ts                # Fases dos módulos 2-4 (PT)
│   ├── modulesConfig.en.ts             # Fases dos módulos 2-4 (EN)
│   ├── termsDictionary.ts              # Glossário de termos (PT)
│   └── termsDictionary.en.ts           # Glossário de termos (EN)
├── hooks/
│   ├── useProgress.ts                  # Hook de progresso (streak, vidas, score)
│   └── useSound.ts                     # Efeitos sonoros da streak
├── i18n/
│   ├── navigation.ts                   # Helpers de navegação i18n
│   ├── request.ts                      # Config de locale da requisição
│   └── routing.ts                      # Locales suportados
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Cliente Supabase (browser)
│   │   └── server.ts                   # Cliente Supabase (server)
│   └── utils.ts                        # Utilitários gerais
├── messages/
│   ├── pt.json                         # Traduções (Português)
│   └── en.json                         # Traduções (Inglês)
├── middleware.ts                       # Proteção de rotas + i18n
└── types/
    └── css.d.ts                        # Declaração de tipos CSS
```

---

## API

### `POST /api/check-code`

🧑‍🏫 Envia o código do usuário para o tutor IA e retorna feedback.

```json
{
  "challenge": "string",
  "code": "string",
  "lives": 3
}
```

### `POST /api/generate-practice`

📝 Gera 5 questões de múltipla escolha para um módulo.

```json
{
  "moduleName": "Fundamentos"
}
```

### `POST /api/generate-module5`

👑 Gera o desafio chefão (editor livre com enunciado).

```json
{
  "moduleName": "Desafio Chefão"
}
```

### `GET/POST /api/onboarding`

📋 Gerencia o questionário de onboarding do usuário autenticado no Supabase (tabela `profiles`). `GET` retorna se o onboarding já foi concluído; `POST` salva as respostas e marca como concluído.

```json
// GET -> { "onboardingCompleted": false, "onboarding": null }
// POST body -> { "onboarding": { "knowledge": "basic", "motivation": "school", ... } }
```

### `GET/POST /api/progress`

💾 Gerencia o progresso do usuário autenticado no banco Supabase. Inclui `kode_score` (pontuação total acumulada).

```json
{
  "lives": 3,
  "unlocked_modules": [1, 2],
  "phases_completed": { "fundamentos": 6 },
  "streak": 3,
  "module_start_time": 1747000000000,
  "kode_score": 245
}
```

---

## Licença

📄 Este projeto é privado.

---

<div align="center">
  <sub>Feito com amor por <a href="https://github.com/igordiaazz">Igor Dias</a></sub>
</div>
