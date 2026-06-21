import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface GeneratePracticeRequest {
  moduleName: string;
}

export interface PracticeQuestion {
  context: string;
  codeSnippet: string;
  options: string[];
  correctAnswer: string;
}

interface PracticeResponse {
  practiceName: string;
  questions: PracticeQuestion[];
}

const SYSTEM_PROMPT = `Você é o motor de geração de exercícios do firstKodes, um app de ensino de Python.
Sua tarefa é gerar 5 questões de múltipla escolha focadas EXCLUSIVAMENTE no módulo solicitado pelo usuário.
- Módulo 'Fundamentos': foco em print e variáveis.
- Módulo 'Decisões': foco em if, elif, else.
- Módulo 'Repetições': foco em while, for, break.
- Módulo 'Funções e Listas': foco em def, return, listas e índices.

Crie historinhas curtas e divertidas (estilo cotidiano tech).
Retorne EXCLUSIVAMENTE um JSON válido neste formato:
{
  "practiceName": "Nome divertido para a sessão",
  "questions": [
    {
      "context": "Texto curto da historinha/enunciado",
      "codeSnippet": "Código Python com uma lacuna [ _____ ] ou pedindo o resultado (opcional)",
      "options": ["opcao 1", "opcao 2", "opcao 3"],
      "correctAnswer": "A opção correta exatamente como escrita na lista"
    }
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Erro interno: chave da API não configurada.' },
        { status: 500 },
      );
    }

    const body: GeneratePracticeRequest = await request.json();

    if (!body.moduleName || typeof body.moduleName !== 'string') {
      return NextResponse.json(
        { error: 'Requisição inválida. Envie moduleName.' },
        { status: 400 },
      );
    }

    const userMessage = `Gere 5 questões de múltipla escolha para o módulo "${body.moduleName}".`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL ?? 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown error');
      return NextResponse.json(
        { error: `Erro ao contactar o gerador de exercícios. (${response.status})` },
        { status: 502 },
      );
    }

    const data = await response.json();
    const content: string = data?.choices?.[0]?.message?.content ?? '';

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Resposta inválida do gerador de exercícios.' },
        { status: 502 },
      );
    }

    const parsed: PracticeResponse = JSON.parse(jsonMatch[0]);

    if (
      typeof parsed.practiceName !== 'string' ||
      !Array.isArray(parsed.questions) ||
      parsed.questions.length === 0
    ) {
      return NextResponse.json(
        { error: 'Formato inesperado da resposta do gerador de exercícios.' },
        { status: 502 },
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 },
    );
  }
}
