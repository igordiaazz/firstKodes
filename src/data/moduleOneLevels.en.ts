import type { LevelData } from './moduleOneLevels';

export const moduleOneLevelsEn: LevelData[] = [
  {
    id: 'fase-1',
    clippyText:
      'For the computer to speak, we use the print command.',
    lessonText:
      'The [print] command displays something on the screen. Text goes inside quotes — this is called a [string].',
    codePrefix: '',
    codeSuffix: '("Hello, World!")',
    options: ['show', 'print', 'write'],
    answer: 'print',
    explanation:
      'print is the command that displays text on the screen. The quotes delimit the string "Hello, World!".',
  },
  {
    id: 'fase-2',
    clippyText:
      "We store text in variables. The = symbol means 'receives'.",
    lessonText:
      'A [variable] stores a value. The [=] sign (assignment) puts the value into it.',
    codePrefix: 'name ',
    codeSuffix: ' "Clippy"',
    options: ['=', '->', 'store'],
    answer: '=',
    explanation:
      'The = symbol is the assignment operator: it stores the value "Clippy" inside the variable name.',
  },
  {
    id: 'fase-3',
    clippyText:
      'Numbers for calculations don\'t use quotes!',
    lessonText:
      '[Numbers] for calculations don\'t use quotes. [Strings] use quotes. Python distinguishes between the two types.',
    codePrefix: 'lives_left = ',
    codeSuffix: '',
    options: ['"3"', 'three', '3'],
    answer: '3',
    explanation:
      'Numbers used in calculations don\'t use quotes. 3 is an integer; "3" would be treated as text.',
  },
  {
    id: 'fase-4',
    clippyText:
      'Variables can change their value. Update the points!',
    lessonText:
      'A [variable] can change its value. The last value is what counts — it overwrites the previous one.',
    codePrefix: 'points = 10 \n',
    codeSuffix: ' = 20',
    options: ['new_point', '20', 'points'],
    answer: 'points',
    explanation:
      'To update an existing variable, we repeat its name (points) and assign the new value (20).',
  },
  {
    id: 'fase-5',
    type: 'output',
    clippyText:
      'What will be displayed on the screen?',
    lessonText:
      'Inside [print] we can do calculations. Python computes the result before displaying it.',
    codePrefix: 'print(8 - 3)',
    codeSuffix: '',
    options: ['83', '5', '8 - 3'],
    answer: '5',
    explanation:
      'print(8 - 3) computes the calculation first and displays the result: 5.',
  },
];
