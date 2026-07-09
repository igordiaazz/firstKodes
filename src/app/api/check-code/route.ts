import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface CheckCodeRequest {
  challenge: string;
  code: string;
  lives: number;
  locale?: string;
}

interface ClippyResponse {
  isCorrect: boolean;
  feedback: string;
}

const SYSTEM_PROMPT_PT = `Você é o Clippy, um tutor de programação Python amigável. Analise o código do usuário para o desafio fornecido. 
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

const SYSTEM_PROMPT_EN = `You are Clippy, a friendly Python programming tutor. Analyze the user's code for the given challenge.
Feedback rules based on remaining lives:
- If lives == 3 (first error): Give only a friendly CONCEPTUAL hint. Do not provide code.
- If lives == 2 (second error): Point out the exact SYNTAX or logic error.
- If lives <= 1 (last error): Explain that the game is over and provide the full CORRECT CODE.
- If the code is correct: Celebrate! But don't use emojis at all, use text emoticons like :) or :D.

Return EXCLUSIVELY a valid JSON in this format:
{
  "isCorrect": boolean,
  "feedback": "Your tutor message here"
}`;

function msg(locale: string | undefined, pt: string, en: string): string {
  return locale === 'en' ? en : pt;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    let body: CheckCodeRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { isCorrect: false, feedback: 'Invalid request body.' },
        { status: 400 },
      );
    }

    const locale = body.locale;

    if (!apiKey) {
      return NextResponse.json(
        { isCorrect: false, feedback: msg(locale, 'Erro interno: chave da API não configurada.', 'Internal error: API key not configured.') },
        { status: 500 },
      );
    }

    if (!body.challenge || typeof body.code !== 'string' || typeof body.lives !== 'number') {
      return NextResponse.json(
        { isCorrect: false, feedback: msg(locale, 'Requisição inválida. Envie challenge, code e lives.', 'Invalid request. Send challenge, code and lives.') },
        { status: 400 },
      );
    }

    const systemPrompt = locale === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_PT;
    const userMessage = locale === 'en'
      ? `Challenge: ${body.challenge}\n\nUser code:\n\`\`\`python\n${body.code}\n\`\`\`\n\nRemaining lives (before this error): ${body.lives}`
      : `Desafio: ${body.challenge}\n\nCódigo do usuário:\n\`\`\`python\n${body.code}\n\`\`\`\n\nVidas restantes (antes deste erro): ${body.lives}`;

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
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown error');
      return NextResponse.json(
        { isCorrect: false, feedback: msg(locale, `Erro ao contactar o tutor. (${response.status})`, `Error contacting the tutor. (${response.status})`) },
        { status: 502 },
      );
    }

    const data = await response.json();
    const content: string = data?.choices?.[0]?.message?.content ?? '';

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { isCorrect: false, feedback: msg(locale, 'Resposta inválida do tutor.', 'Invalid response from the tutor.') },
        { status: 502 },
      );
    }

    const parsed: ClippyResponse = JSON.parse(jsonMatch[0]);

    if (typeof parsed.isCorrect !== 'boolean' || typeof parsed.feedback !== 'string') {
      return NextResponse.json(
        { isCorrect: false, feedback: msg(locale, 'Formato inesperado da resposta do tutor.', 'Unexpected response format from the tutor.') },
        { status: 502 },
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json(
      {
        isCorrect: false,
        feedback: msg(undefined, 'Erro interno do servidor. Tente novamente.', 'Internal server error. Try again.'),
      },
      { status: 500 },
    );
  }
}
