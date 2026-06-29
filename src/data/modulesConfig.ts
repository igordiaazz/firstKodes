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
  {
    ...phase('mod2-fase-1', 'Para comparar valores, usamos operadores como >= (maior-ou-igual).', 'idade [ _____ ] 18:', ['>=', '>', '=='], '>='),
    lessonText: 'O operador [>=] compara dois valores. O resultado \u00e9 verdadeiro ou falso.',
  },
  {
    ...phase('mod2-fase-2', 'Se for verdade, entra no bloco if.', '[ _____ ] senha == \'123\':', ['se', 'if', 'quando'], 'if'),
    lessonText: 'O [if] executa um bloco de c\u00f3digo apenas se a condi\u00e7\u00e3o for verdadeira.',
  },
  {
    ...phase('mod2-fase-3', 'Se a senha estiver errada, usamos o else (plano B)!', '[ _____ ]:\n  print(\'Negado\')', ['else', 'senao', 'elif'], 'else'),
    lessonText: 'O [else] captura o caso contr\u00e1rio — executa quando a condi\u00e7\u00e3o do if \u00e9 falsa.',
  },
  {
    ...phase('mod2-fase-4', 'Se n\u00e3o for emerg\u00eancia, verifique a urg\u00eancia!', 'if falha:\n  print(\'Emerg\u00eancia\')\n[ _____ ] erro_tecnico:', ['else if', 'elif', 'if else'], 'elif'),
    lessonText: 'O [elif] adiciona mais condi\u00e7\u00f5es intermedi\u00e1rias entre o if e o else.',
  },
  {
    ...outputPhase('mod2-fase-5', 'Qual mensagem ser\u00e1 exibida?', 'idade = 20\nif idade >= 18:\n    print("Pode entrar")\nelse:\n    print("Volte mais tarde")', ['Pode entrar', 'Volte mais tarde', '20'], 'Pode entrar'),
    lessonText: 'O [if] decide qual bloco executar baseado na condi\u00e7\u00e3o. S\u00f3 um bloco roda.',
  },
];

export const moduleThreeLevels: LevelData[] = [
  {
    ...phase('mod3-fase-1', 'Repita enquanto for verdade com while.', '[ _____ ] bateria > 0:', ['enquanto', 'for', 'while'], 'while'),
    lessonText: 'O [while] repete um bloco enquanto a condi\u00e7\u00e3o for verdadeira. Cuidado com loops infinitos!',
  },
  {
    ...phase('mod3-fase-2', 'Cuidado com o loop infinito! Diminua o valor.', 'bateria = bateria [ _____ ] 1', ['-', '+', '='], '-'),
    lessonText: 'O operador [-=] subtrai e guarda o resultado na pr\u00f3pria vari\u00e1vel. Equivale a bateria = bateria - 1.',
  },
  {
    ...phase('mod3-fase-3', 'Repeti\u00e7\u00e3o exata usa o for com range().', 'for passo in [ _____ ](5):', ['range', 'lista', 'repetir'], 'range'),
    lessonText: 'A fun\u00e7\u00e3o [range] gera uma sequ\u00eancia de n\u00fameros. range(5) gera 0, 1, 2, 3, 4.',
  },
  {
    ...phase('mod3-fase-4', 'Pare o loop na hora com break.', 'if deu_erro:\n  [ _____ ]', ['parar', 'break', 'continue'], 'break'),
    lessonText: 'O [break] interrompe o loop imediatamente, mesmo que a condi\u00e7\u00e3o ainda seja verdadeira.',
  },
  {
    ...outputPhase('mod3-fase-5', 'Quantas vezes "Oi" ser\u00e1 impresso?', 'for i in range(3):\n    print("Oi")', ['0', '3', '2'], '3'),
    lessonText: 'O [for] percorre cada item de uma sequ\u00eancia. Aqui, range(3) gera 3 valores, ent\u00e3o o print roda 3 vezes.',
  },
];

export const moduleFourLevels: LevelData[] = [
  {
    ...phase('mod4-fase-1', 'Empacote c\u00f3digo criando fun\u00e7\u00f5es com def.', '[ _____ ] calcular_nota():', ['funcao', 'def', 'create'], 'def'),
    lessonText: 'O [def] define (cria) uma nova fun\u00e7\u00e3o. O c\u00f3digo dentro dela s\u00f3 roda quando a fun\u00e7\u00e3o for chamada.',
  },
  {
    ...phase('mod4-fase-2', 'A fun\u00e7\u00e3o precisa DEVOLVER o resultado.', '[ _____ ] total', ['return', 'devolver', 'print'], 'return'),
    lessonText: 'O [return] devolve um valor da fun\u00e7\u00e3o para quem a chamou. Sem ele, a fun\u00e7\u00e3o retorna None.',
  },
  {
    ...phase('mod4-fase-3', 'Listas usam colchetes [ ].', 'tarefas = [ _____ ] \'Item 1\', \'Item 2\' ]', ['{', '[', '('], '['),
    lessonText: 'Uma [lista] guarda v\u00e1rios valores ordenados entre colchetes. Pode conter qualquer tipo de dado.',
  },
  {
    ...phase('mod4-fase-4', 'A contagem na programa\u00e7\u00e3o sempre come\u00e7a no zero!', 'primeiro = tarefas[ [ _____ ] ]', ['1', '0', 'primeiro'], '0'),
    lessonText: 'O [\u00edndice] acessa um elemento pela posi\u00e7\u00e3o na lista. A primeira posi\u00e7\u00e3o \u00e9 sempre 0.',
  },
  {
    ...outputPhase('mod4-fase-5', 'O que ser\u00e1 exibido ap\u00f3s chamar a fun\u00e7\u00e3o?', 'def soma(a, b):\n    return a + b\n\nresultado = soma(10, 5)\nprint(resultado)', ['105', 'soma(10, 5)', '15'], '15'),
    lessonText: 'O [return] devolve o valor calculado para quem chamou a fun\u00e7\u00e3o. O print ent\u00e3o exibe esse valor.',
  },
];

export const allModuleLevels: Record<string, LevelData[]> = {
  decisoes: moduleTwoLevels,
  repeticoes: moduleThreeLevels,
  funcoes: moduleFourLevels,
};
