import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface GeneratePracticeRequest {
  moduleName: string;
}

export interface PracticeQuestion {
  type: 'complete' | 'output';
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
      "type": "complete",
      "context": "Texto curto da historinha/enunciado",
      "codeSnippet": "Código Python com uma lacuna [ _____ ] no local a ser preenchido",
      "options": ["opcao 1", "opcao 2", "opcao 3"],
      "correctAnswer": "A opção correta exatamente como escrita na lista"
    },
    {
      "type": "output",
      "context": "Texto curto da historinha/enunciado",
      "codeSnippet": "Código Python completo (sem [ _____ ]), o usuário deve prever a saída",
      "options": ["opcao 1", "opcao 2", "opcao 3"],
      "correctAnswer": "A opção correta exatamente como escrita na lista"
    }
  ]
}

REGRAS IMPORTANTES:
- type "complete": o codeSnippet DEVE conter [ _____ ] no local onde o usuário deve completar o código (ex: "print([ _____ ])")
- type "output": o codeSnippet NÃO DEVE conter [ _____ ], mostre o código completo
- Use type "output" para perguntas como: "O que esse código imprime?", "Qual o valor final de x?"
- Use type "complete" para perguntas como: "Qual comando completa o código?", "Preencha a lacuna"
- Misture os dois tipos nas 5 questões: 2-3 do tipo "complete" e 2-3 do tipo "output"
- IMPORTANTE: Cada questão deve ter opções ÚNICAS e DISTINTAS. NÃO reutilize opções de uma questão em outra.
- As opções de cada questão devem ser diferentes das demais questões.`;

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

    const validQuestions: PracticeQuestion[] = [];

    for (const q of parsed.questions) {
      if (
        (q.type === 'complete' || q.type === 'output') &&
        typeof q.context === 'string' &&
        typeof q.codeSnippet === 'string' &&
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        typeof q.correctAnswer === 'string'
      ) {
        if (q.type === 'complete' && !q.codeSnippet.includes('[ _____ ]')) {
          continue;
        }
        if (q.type === 'output' && q.codeSnippet.includes('[ _____ ]')) {
          continue;
        }
        validQuestions.push({
          type: q.type,
          context: q.context.trim(),
          codeSnippet: q.codeSnippet.trim(),
          options: q.options.map((o: string) => o.trim()),
          correctAnswer: q.correctAnswer.trim(),
        });
      }
    }

    if (validQuestions.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma questão válida foi gerada. Tente novamente.' },
        { status: 502 },
      );
    }

    return NextResponse.json({
      practiceName: parsed.practiceName,
      questions: validQuestions,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 },
    );
  }
}
