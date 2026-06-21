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

export const moduleTwoLevels: LevelData[] = [
  phase(
    'mod2-fase-1',
    'Decisões respondem Verdadeiro ou Falso.',
    'idade [ _____ ] 18:',
    ['maior_que', '>=', '=>'],
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
    ['-', 'menos', '=='],
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
];

export const allModuleLevels: Record<string, LevelData[]> = {
  decisoes: moduleTwoLevels,
  repeticoes: moduleThreeLevels,
  funcoes: moduleFourLevels,
};
