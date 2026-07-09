import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface GeneratePracticeRequest {
  moduleName: string;
  locale?: string;
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

const SYSTEM_PROMPT_PT = `Você é o motor de geração de exercícios do firstKodes, um app de ensino de Python.
Sua tarefa é gerar 5 questões de múltipla escolha em PORTUGUÊS focadas EXCLUSIVAMENTE no módulo solicitado pelo usuário.
- Módulo 'Fundamentos': foco em print e variáveis.
- Módulo 'Decisões': foco em if, elif, else.
- Módulo 'Repetições': foco em while, for, break.
- Módulo 'Funções e Listas': foco em def, return, listas e índices.

Crie historinhas curtas e divertidas (estilo cotidiano tech) EM PORTUGUÊS.
Retorne EXCLUSIVAMENTE um JSON válido neste formato:
{
  "practiceName": "Nome divertido para a sessão",
  "questions": [
    {
      "type": "complete",
      "context": "Texto curto da historinha/enunciado EM PORTUGUÊS",
      "codeSnippet": "Código Python com uma lacuna [ _____ ] no local a ser preenchido",
      "options": ["opcao 1", "opcao 2", "opcao 3"],
      "correctAnswer": "A opção correta exatamente como escrita na lista"
    },
    {
      "type": "output",
      "context": "Texto curto da historinha/enunciado EM PORTUGUÊS",
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

const SYSTEM_PROMPT_EN = `You are the exercise generation engine for firstKodes, a Python teaching app.
Your task is to generate 5 multiple-choice questions in ENGLISH focused EXCLUSIVELY on the requested module.
- Module 'Fundamentals': focus on print and variables.
- Module 'Decisions': focus on if, elif, else.
- Module 'Loops': focus on while, for, break.
- Module 'Functions & Lists': focus on def, return, lists, and indexes.

Create short, fun stories (everyday tech style) IN ENGLISH.
Return EXCLUSIVELY a valid JSON in this format:
{
  "practiceName": "Fun name for the session",
  "questions": [
    {
      "type": "complete",
      "context": "Short story/question text IN ENGLISH",
      "codeSnippet": "Python code with a [ _____ ] gap where the user must complete",
      "options": ["option 1", "option 2", "option 3"],
      "correctAnswer": "The correct option exactly as written in the list"
    },
    {
      "type": "output",
      "context": "Short story/question text IN ENGLISH",
      "codeSnippet": "Complete Python code (no [ _____ ]), the user must predict the output",
      "options": ["option 1", "option 2", "option 3"],
      "correctAnswer": "The correct option exactly as written in the list"
    }
  ]
}

IMPORTANT RULES:
- type "complete": codeSnippet MUST contain [ _____ ] where the user should complete the code
- type "output": codeSnippet MUST NOT contain [ _____ ], show the full code
- Mix both types: 2-3 "complete" and 2-3 "output"
- IMPORTANT: Each question must have UNIQUE and DISTINCT options. Do NOT reuse options from one question in another.`;

function msg(locale: string | undefined, pt: string, en: string): string {
  return locale === 'en' ? en : pt;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    let body: GeneratePracticeRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 },
      );
    }

    const locale = body.locale;

    if (!apiKey) {
      return NextResponse.json(
        { error: msg(locale, 'Erro interno: chave da API não configurada.', 'Internal error: API key not configured.') },
        { status: 500 },
      );
    }

    if (!body.moduleName || typeof body.moduleName !== 'string') {
      return NextResponse.json(
        { error: msg(locale, 'Requisição inválida. Envie moduleName.', 'Invalid request. Send moduleName.') },
        { status: 400 },
      );
    }

    const isEn = locale === 'en';
    const systemPrompt = isEn ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_PT;
    const userMessage = isEn
      ? `Generate 5 multiple-choice questions for the module "${body.moduleName}".`
      : `Gere 5 questões de múltipla escolha para o módulo "${body.moduleName}".`;

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown error');
      return NextResponse.json(
        { error: msg(locale, `Erro ao contactar o gerador de exercícios. (${response.status})`, `Error contacting the exercise generator. (${response.status})`) },
        { status: 502 },
      );
    }

    const data = await response.json();
    const content: string = data?.choices?.[0]?.message?.content ?? '';

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: msg(locale, 'Resposta inválida do gerador de exercícios.', 'Invalid response from the exercise generator.') },
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
        { error: msg(locale, 'Formato inesperado da resposta do gerador de exercícios.', 'Unexpected response format from the exercise generator.') },
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
        { error: msg(locale, 'Nenhuma questão válida foi gerada. Tente novamente.', 'No valid questions were generated. Try again.') },
        { status: 502 },
      );
    }

    return NextResponse.json({
      practiceName: parsed.practiceName,
      questions: validQuestions,
    });
  } catch (error) {
    return NextResponse.json(
      { error: msg(undefined, 'Erro interno do servidor. Tente novamente.', 'Internal server error. Try again.') },
      { status: 500 },
    );
  }
}
