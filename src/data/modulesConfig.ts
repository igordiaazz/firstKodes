import type { LevelData } from './moduleOneLevels';

function phase(
  id: string,
  clippyText: string,
  codigo: string,
  options: string[],
  answer: string,
): LevelData {
  const [prefix = '', suffix = ''] = codigo.split('[ _____ ]');
  return { id, clippyText, codePrefix: prefix, codeSuffix: suffix, options, answer };
}

function outputPhase(
  id: string,
  clippyText: string,
  codigo: string,
  options: string[],
  answer: string,
): LevelData {
  return { id, type: 'output', clippyText, codePrefix: codigo, codeSuffix: '', options, answer };
}

export const moduleTwoLevels: LevelData[] = [
  phase(
    'mod2-fase-1',
    'Para comparar valores, usamos operadores como >= (maior-ou-igual).',
    'idade [ _____ ] 18:',
    ['>=', '>', '=='],
    '>=',
  ),
  phase(
    'mod2-fase-2',
    'Se for verdade, entra no bloco if.',
    '[ _____ ] senha == \'123\':',
    ['se', 'if', 'quando'],
    'if',
  ),
  phase(
    'mod2-fase-3',
    'Se a senha estiver errada, usamos o else (plano B)!',
    '[ _____ ]:\n  print(\'Negado\')',
    ['else', 'senao', 'elif'],
    'else',
  ),
  phase(
    'mod2-fase-4',
    'Se não for emergência, verifique a urgência!',
    'if falha:\n  print(\'Emergência\')\n[ _____ ] erro_tecnico:',
    ['else if', 'elif', 'if else'],
    'elif',
  ),
  outputPhase(
    'mod2-fase-5',
    'Qual mensagem ser\u00e1 exibida?',
    'idade = 20\nif idade >= 18:\n    print("Pode entrar")\nelse:\n    print("Volte mais tarde")',
    ['Pode entrar', 'Volte mais tarde', '20'],
    'Pode entrar',
  ),
];

export const moduleThreeLevels: LevelData[] = [
  phase(
    'mod3-fase-1',
    'Repita enquanto for verdade com while.',
    '[ _____ ] bateria > 0:',
    ['enquanto', 'for', 'while'],
    'while',
  ),
  phase(
    'mod3-fase-2',
    'Cuidado com o loop infinito! Diminua o valor.',
    'bateria = bateria [ _____ ] 1',
    ['-', '+', '='],
    '-',
  ),
  phase(
    'mod3-fase-3',
    'Repetição exata usa o for com range().',
    'for passo in [ _____ ](5):',
    ['range', 'lista', 'repetir'],
    'range',
  ),
  phase(
    'mod3-fase-4',
    'Pare o loop na hora com break.',
    'if deu_erro:\n  [ _____ ]',
    ['parar', 'break', 'continue'],
    'break',
  ),
  outputPhase(
    'mod3-fase-5',
    'Quantas vezes "Oi" ser\u00e1 impresso?',
    'for i in range(3):\n    print("Oi")',
    ['0', '3', '2'],
    '3',
  ),
];

export const moduleFourLevels: LevelData[] = [
  phase(
    'mod4-fase-1',
    'Empacote código criando funções com def.',
    '[ _____ ] calcular_nota():',
    ['funcao', 'def', 'create'],
    'def',
  ),
  phase(
    'mod4-fase-2',
    'A função precisa DEVOLVER o resultado.',
    '[ _____ ] total',
    ['return', 'devolver', 'print'],
    'return',
  ),
  phase(
    'mod4-fase-3',
    'Listas usam colchetes [ ].',
    'tarefas = [ _____ ] \'Item 1\', \'Item 2\' ]',
    ['{', '[', '('],
    '[',
  ),
  phase(
    'mod4-fase-4',
    'A contagem na programação sempre começa no zero!',
    'primeiro = tarefas[ [ _____ ] ]',
    ['1', '0', 'primeiro'],
    '0',
  ),
  outputPhase(
    'mod4-fase-5',
    'O que ser\u00e1 exibido ap\u00f3s chamar a fun\u00e7\u00e3o?',
    'def soma(a, b):\n    return a + b\n\nresultado = soma(10, 5)\nprint(resultado)',
    ['105', 'soma(10, 5)', '15'],
    '15',
  ),
];

export const allModuleLevels: Record<string, LevelData[]> = {
  decisoes: moduleTwoLevels,
  repeticoes: moduleThreeLevels,
  funcoes: moduleFourLevels,
};
