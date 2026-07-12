export interface LevelData {
  id: string;
  type?: 'complete' | 'output';
  clippyText: string;
  lessonText?: string;
  explanation?: string;
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
    lessonText:
      'O comando [print] exibe algo na tela. O texto fica entre aspas \u2014 isso \u00e9 uma [string].',
    codePrefix: '',
    codeSuffix: '("Olá, Mundo!")',
    options: ['mostrar', 'print', 'escrever'],
    answer: 'print',
    explanation:
      'print é o comando que exibe textos na tela. As aspas delimitam a string "Olá, Mundo!".',
  },
  {
    id: 'fase-2',
    clippyText:
      'Guardamos textos em vari\u00e1veis. O s\u00edmbolo = significa \'recebe\'.',
    lessonText:
      'Uma [vari\u00e1vel] guarda um valor. O sinal [=] (atribui\u00e7\u00e3o) coloca o valor dentro dela.',
    codePrefix: 'nome ',
    codeSuffix: ' "Clippy"',
    options: ['=', '->', 'guardar'],
    answer: '=',
    explanation:
      'O símbolo = é o operador de atribuição: ele guarda o valor "Clippy" dentro da variável nome.',
  },
  {
    id: 'fase-3',
    clippyText:
      'N\u00fameros para contas n\u00e3o usam aspas!',
    lessonText:
      '[N\u00fameros] para contas n\u00e3o usam aspas. [Strings] usam aspas. O Python diferencia os dois tipos.',
    codePrefix: 'vidas_restantes = ',
    codeSuffix: '',
    options: ['"3"', 'três', '3'],
    answer: '3',
    explanation:
      'Números usados em contas não levam aspas. 3 é um número inteiro; "3" seria tratado como texto.',
  },
  {
    id: 'fase-4',
    clippyText:
      'Vari\u00e1veis podem mudar de valor. Atualize os pontos!',
    lessonText:
      'Uma [vari\u00e1vel] pode mudar de valor. O \u00faltimo valor \u00e9 o que vale — ele substitui o anterior.',
    codePrefix: 'pontos = 10 \n',
    codeSuffix: ' = 20',
    options: ['novo_ponto', '20', 'pontos'],
    answer: 'pontos',
    explanation:
      'Para atualizar uma variável existente, repetimos o seu nome (pontos) e atribuímos o novo valor (20).',
  },
  {
    id: 'fase-5',
    type: 'output',
    clippyText:
      'Qual ser\u00e1 o resultado exibido na tela?',
    lessonText:
      'Dentro do [print] podemos fazer contas. O Python calcula o resultado antes de exibir.',
    codePrefix: 'print(8 - 3)',
    codeSuffix: '',
    options: ['83', '5', '8 - 3'],
    answer: '5',
    explanation:
      'print(8 - 3) calcula a conta primeiro e exibe o resultado: 5.',
  },
];
