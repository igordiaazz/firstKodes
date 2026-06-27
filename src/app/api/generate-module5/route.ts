import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface TypingChallenge {
  id: string;
  clippyText: string;
  question: string;
}

const SYSTEM_PROMPT = `Você é o gerador de desafios do firstKodes, um app de ensino de Python.
Gere 5 desafios de programação em Python que o usuário deve resolver escrevendo código do zero.
Os desafios devem cobrir uma MISTURA dos tópicos: variáveis, condicionais (if/elif/else), loops (while/for), funções (def/return) e listas.
A dificuldade deve ser PROGRESSIVA: do mais simples ao mais complexo.

Cada desafio deve ser um problema claro onde o usuário escreve o código completo.
Seja criativo com cenários do dia adia tech.

Retorne EXCLUSIVAMENTE um JSON válido neste formato:
{
  "challenges": [
    {
      "clippyText": "Contexto curto e motivacional sobre o desafio",
      "question": "Descrição clara do que o usuário deve codificar. Inclua o nome da função ou variável esperada."
    }
  ]
}

REGRAS:
- São 5 desafios exatos
- Não forneça código na descrição, apenas o problema
- O usuário precisa escrever o código completo sozinho
- Dificuldade progressiva: 1-2 fáceis, 3-4 médios, 5 difícil`;
const MODULE_NAME = 'Desafios Finais';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Erro interno: chave da API não configurada.' },
        { status: 500 },
      );
    }

    const userMessage = `Gere 5 desafios de codificação Python para o módulo "${MODULE_NAME}".`;

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
        { error: `Erro ao contactar o gerador de desafios. (${response.status})` },
        { status: 502 },
      );
    }

    const data = await response.json();
    const content: string = data?.choices?.[0]?.message?.content ?? '';

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Resposta inválida do gerador de desafios.' },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed.challenges) || parsed.challenges.length === 0) {
      return NextResponse.json(
        { error: 'Formato inesperado da resposta.' },
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
        { error: 'Nenhum desafio válido foi gerado. Tente novamente.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ challenges: validChallenges });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 },
    );
  }
}
