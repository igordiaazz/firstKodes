import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface CheckCodeRequest {
  challenge: string;
  code: string;
  lives: number;
}

interface ClippyResponse {
  isCorrect: boolean;
  feedback: string;
}

const SYSTEM_PROMPT = `Você é o Clippy, um tutor de programação Python amigável. Analise o código do usuário para o desafio fornecido. 
Regras de feedback baseadas nas vidas restantes:
- Se vidas == 3 (primeiro erro): Dê apenas uma dica CONCEITUAL amigável. Não dê código.
- Se vidas == 2 (segundo erro): Aponte o ERRO DE SINTAXE ou lógica exato.
- Se vidas <= 1 (último erro): Explique que o jogo acabou e forneça o CÓDIGO CORRETO completo.
- Se o código estiver correto: Comemore! Mas não use emojis de forma alguma, use emoticons de texto como :) ou :D.

Retorne EXCLUSIVAMENTE um JSON válido neste formato:
{
  "isCorrect": boolean,
  "feedback": "Sua mensagem de tutor aqui"
}`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { isCorrect: false, feedback: 'Erro interno: chave da API não configurada.' },
        { status: 500 },
      );
    }

    const body: CheckCodeRequest = await request.json();

    if (!body.challenge || typeof body.code !== 'string' || typeof body.lives !== 'number') {
      return NextResponse.json(
        { isCorrect: false, feedback: 'Requisição inválida. Envie challenge, code e lives.' },
        { status: 400 },
      );
    }

    const userMessage = `Desafio: ${body.challenge}\n\nCódigo do usuário:\n\`\`\`python\n${body.code}\n\`\`\`\n\nVidas restantes (antes deste erro): ${body.lives}`;

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
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown error');
      return NextResponse.json(
        { isCorrect: false, feedback: `Erro ao contactar o tutor. (${response.status})` },
        { status: 502 },
      );
    }

    const data = await response.json();
    const content: string = data?.choices?.[0]?.message?.content ?? '';

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { isCorrect: false, feedback: 'Resposta inválida do tutor.' },
        { status: 502 },
      );
    }

    const parsed: ClippyResponse = JSON.parse(jsonMatch[0]);

    if (typeof parsed.isCorrect !== 'boolean' || typeof parsed.feedback !== 'string') {
      return NextResponse.json(
        { isCorrect: false, feedback: 'Formato inesperado da resposta do tutor.' },
        { status: 502 },
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json(
      {
        isCorrect: false,
        feedback: 'Erro interno do servidor. Tente novamente.',
      },
      { status: 500 },
    );
  }
}
