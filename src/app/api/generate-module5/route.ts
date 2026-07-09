import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface TypingChallenge {
  id: string;
  clippyText: string;
  question: string;
}

const SYSTEM_PROMPT_PT = `Você é o gerador de desafios do firstKodes, um app de ensino de Python.
Gere 5 desafios de programação em Python que o usuário deve resolver escrevendo código do zero. Escreva EM PORTUGUÊS.
Os desafios devem cobrir uma MISTURA dos tópicos: variáveis, condicionais (if/elif/else), loops (while/for), funções (def/return) e listas.
A dificuldade deve ser PROGRESSIVA: do mais simples ao mais complexo.

Cada desafio deve ser um problema claro onde o usuário escreve o código completo.
Seja criativo com cenários do dia a dia tech.

Retorne EXCLUSIVAMENTE um JSON válido neste formato:
{
  "challenges": [
    {
      "clippyText": "Contexto curto e motivacional sobre o desafio EM PORTUGUÊS",
      "question": "Descrição clara do que o usuário deve codificar EM PORTUGUÊS. Inclua o nome da função ou variável esperada."
    }
  ]
}

REGRAS:
- São 5 desafios exatos
- Não forneça código na descrição, apenas o problema
- O usuário precisa escrever o código completo sozinho
- Dificuldade progressiva: 1-2 fáceis, 3-4 médios, 5 difícil`;

const SYSTEM_PROMPT_EN = `You are the challenge generator for firstKodes, a Python teaching app.
Generate 5 Python programming challenges that the user must solve by writing code from scratch. Write IN ENGLISH.
The challenges should cover a MIX of topics: variables, conditionals (if/elif/else), loops (while/for), functions (def/return), and lists.
Difficulty must be PROGRESSIVE: from simplest to most complex.

Each challenge should be a clear problem where the user writes the complete code.
Be creative with everyday tech scenarios.

Return EXCLUSIVELY a valid JSON in this format:
{
  "challenges": [
    {
      "clippyText": "Short motivational context about the challenge IN ENGLISH",
      "question": "Clear description of what the user should code IN ENGLISH. Include the expected function or variable name."
    }
  ]
}

RULES:
- Exactly 5 challenges
- Do not provide code in the description, only the problem
- The user must write the complete code themselves
- Progressive difficulty: 1-2 easy, 3-4 medium, 5 hard`;

const MODULE_NAME_PT = 'Desafios Finais';
const MODULE_NAME_EN = 'Final Challenges';

function msg(locale: string | undefined, pt: string, en: string): string {
  return locale === 'en' ? en : pt;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    const body = await request.json().catch(() => ({}));
    const locale = body.locale;

    if (!apiKey) {
      return NextResponse.json(
        { error: msg(locale, 'Erro interno: chave da API não configurada.', 'Internal error: API key not configured.') },
        { status: 500 },
      );
    }

    const isEn = locale === 'en';
    const systemPrompt = isEn ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_PT;
    const moduleName = isEn ? MODULE_NAME_EN : MODULE_NAME_PT;
    const userMessage = isEn
      ? `Generate 5 Python coding challenges for the module "${moduleName}".`
      : `Gere 5 desafios de codificação Python para o módulo "${moduleName}".`;

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
        { error: msg(locale, `Erro ao contactar o gerador de desafios. (${response.status})`, `Error contacting the challenge generator. (${response.status})`) },
        { status: 502 },
      );
    }

    const data = await response.json();
    const content: string = data?.choices?.[0]?.message?.content ?? '';

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: msg(locale, 'Resposta inválida do gerador de desafios.', 'Invalid response from the challenge generator.') },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed.challenges) || parsed.challenges.length === 0) {
      return NextResponse.json(
        { error: msg(locale, 'Formato inesperado da resposta.', 'Unexpected response format.') },
        { status: 502 },
      );
    }

    const validChallenges: TypingChallenge[] = [];

    for (let i = 0; i < parsed.challenges.length; i++) {
      const c = parsed.challenges[i];
      if (
        typeof c.clippyText === 'string' &&
        typeof c.question === 'string' &&
        c.clippyText.trim() &&
        c.question.trim()
      ) {
        validChallenges.push({
          id: `mod5-fase-${i + 1}`,
          clippyText: c.clippyText.trim(),
          question: c.question.trim(),
        });
      }
    }

    if (validChallenges.length === 0) {
      return NextResponse.json(
        { error: msg(locale, 'Nenhum desafio válido foi gerado. Tente novamente.', 'No valid challenges were generated. Try again.') },
        { status: 502 },
      );
    }

    return NextResponse.json({ challenges: validChallenges });
  } catch (error) {
    return NextResponse.json(
      { error: msg(undefined, 'Erro interno do servidor. Tente novamente.', 'Internal server error. Try again.') },
      { status: 500 },
    );
  }
}
