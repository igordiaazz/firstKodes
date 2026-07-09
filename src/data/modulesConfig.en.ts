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

export const moduleTwoLevelsEn: LevelData[] = [
  {
    ...phase('mod2-fase-1', 'To compare values, we use operators like >= (greater-or-equal).', 'age [ _____ ] 18:', ['>=', '>', '=='], '>='),
    lessonText: 'The [>=] operator compares two values. The result is true or false.',
  },
  {
    ...phase('mod2-fase-2', 'If it\'s true, the if block runs.', '[ _____ ] password == \'123\':', ['se', 'if', 'when'], 'if'),
    lessonText: 'The [if] runs a block of code only if the condition is true.',
  },
  {
    ...phase('mod2-fase-3', 'If the password is wrong, we use else (plan B)!', '[ _____ ]:\n  print(\'Denied\')', ['else', 'otherwise', 'elif'], 'else'),
    lessonText: 'The [else] catches the opposite case — runs when the if condition is false.',
  },
  {
    ...phase('mod2-fase-4', 'If it\'s not an emergency, check the urgency!', 'if failure:\n  print(\'Emergency\')\n[ _____ ] tech_error:', ['else if', 'elif', 'if else'], 'elif'),
    lessonText: 'The [elif] adds more intermediate conditions between if and else.',
  },
  {
    ...outputPhase('mod2-fase-5', 'Which message will be displayed?', 'age = 20\nif age >= 18:\n    print("Can enter")\nelse:\n    print("Come back later")', ['Can enter', 'Come back later', '20'], 'Can enter'),
    lessonText: 'The [if] decides which block to run based on the condition. Only one block runs.',
  },
];

export const moduleThreeLevelsEn: LevelData[] = [
  {
    ...phase('mod3-fase-1', 'Repeat while true with while.', '[ _____ ] battery > 0:', ['while', 'for', 'repeat'], 'while'),
    lessonText: 'The [while] repeats a block while the condition is true. Beware of infinite loops!',
  },
  {
    ...phase('mod3-fase-2', 'Watch out for infinite loops! Decrease the value.', 'battery = battery [ _____ ] 1', ['-', '+', '='], '-'),
    lessonText: 'The [-=] operator subtracts and stores the result in the variable itself. Equivalent to battery = battery - 1.',
  },
  {
    ...phase('mod3-fase-3', 'Exact repetition uses for with range().', 'for step in [ _____ ](5):', ['range', 'list', 'repeat'], 'range'),
    lessonText: 'The [range] function generates a sequence of numbers. range(5) generates 0, 1, 2, 3, 4.',
  },
  {
    ...phase('mod3-fase-4', 'Stop the loop immediately with break.', 'if error_happened:\n  [ _____ ]', ['stop', 'break', 'continue'], 'break'),
    lessonText: 'The [break] interrupts the loop immediately, even if the condition is still true.',
  },
  {
    ...outputPhase('mod3-fase-5', 'How many times will "Hi" be printed?', 'for i in range(3):\n    print("Hi")', ['0', '3', '2'], '3'),
    lessonText: 'The [for] iterates through each item of a sequence. Here, range(3) generates 3 values, so print runs 3 times.',
  },
];

export const moduleFourLevelsEn: LevelData[] = [
  {
    ...phase('mod4-fase-1', 'Package code by creating functions with def.', '[ _____ ] calculate_grade():', ['func', 'def', 'create'], 'def'),
    lessonText: 'The [def] defines (creates) a new function. The code inside it only runs when the function is called.',
  },
  {
    ...phase('mod4-fase-2', 'The function needs to RETURN the result.', '[ _____ ] total', ['return', 'giveBack', 'print'], 'return'),
    lessonText: 'The [return] sends a value from the function back to the caller. Without it, the function returns None.',
  },
  {
    ...phase('mod4-fase-3', 'Lists use square brackets [ ].', 'tasks = [ _____ ] \'Item 1\', \'Item 2\' ]', ['{', '[', '('], '['),
    lessonText: 'A [list] stores multiple ordered values inside square brackets. It can contain any data type.',
  },
  {
    ...phase('mod4-fase-4', 'Counting in programming always starts at zero!', 'first = tasks[ [ _____ ] ]', ['1', '0', 'first'], '0'),
    lessonText: 'The [index] accesses an element by its position in the list. The first position is always 0.',
  },
  {
    ...outputPhase('mod4-fase-5', 'What will be displayed after calling the function?', 'def sum(a, b):\n    return a + b\n\nresult = sum(10, 5)\nprint(result)', ['105', 'sum(10, 5)', '15'], '15'),
    lessonText: 'The [return] sends the calculated value back to the caller. The print then displays that value.',
  },
];

export const allModuleLevelsEn: Record<string, LevelData[]> = {
  decisoes: moduleTwoLevelsEn,
  repeticoes: moduleThreeLevelsEn,
  funcoes: moduleFourLevelsEn,
};
