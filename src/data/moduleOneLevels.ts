export interface LevelData {
  id: string;
  clippyText: string;
  codePrefix: string;
  codeSuffix: string;
  options: string[];
  answer: string;
}

export const moduleOneLevels: LevelData[] = [
  {
    id: 'fase-1',
    clippyText:
      'Para o computador falar, usamos o comando print.',
    codePrefix: '',
    codeSuffix: '("Ol\u00e1, Mundo!")',
    options: ['mostrar', 'print', 'escrever'],
    answer: 'print',
  },
  {
    id: 'fase-2',
    clippyText:
      'Guardamos textos em vari\u00e1veis. O s\u00edmbolo = significa \'recebe\'.',
    codePrefix: 'nome ',
    codeSuffix: ' "Clippy"',
    options: ['=', '->', 'guardar'],
    answer: '=',
  },
  {
    id: 'fase-3',
    clippyText:
      'N\u00fameros para contas n\u00e3o usam aspas!',
    codePrefix: 'vidas_restantes = ',
    codeSuffix: '',
    options: ['"3"', 'tr\u00eas', '3'],
    answer: '3',
  },
  {
    id: 'fase-4',
    clippyText:
      'Vari\u00e1veis podem mudar de valor. Atualize os pontos!',
    codePrefix: 'pontos = 10 \n',
    codeSuffix: ' = 20',
    options: ['novo_ponto', '20', 'pontos'],
    answer: 'pontos',
  },
];
