import type { Question } from '../../types.ts'

import { CHEM_EASY } from '../chem_easy.ts'
import { CHEM_MEDIUM_1 } from '../chem_medium_1.ts'
import { CHEM_MEDIUM_2 } from '../chem_medium_2.ts'
import { CHEM_HARD } from '../chem_hard.ts'
import { CHEM_EXP_MEDIUM } from '../chem_exp_medium.ts'
import { CHEM_EXP_HARD } from '../chem_exp_hard.ts'

export const CHEM_QUESTIONS: Question[] = [
  ...CHEM_EASY,
  ...CHEM_MEDIUM_1,
  ...CHEM_MEDIUM_2,
  ...CHEM_HARD,
  ...CHEM_EXP_MEDIUM,
  ...CHEM_EXP_HARD,
]
