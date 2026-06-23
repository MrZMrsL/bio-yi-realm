import type { Question } from '../../types.ts'

import { BIO_EASY } from '../bio_easy.ts'
import { BIO_MEDIUM } from '../bio_medium.ts'
import { BIO_HARD } from '../bio_hard.ts'
import { BIO_EXP_MEDIUM } from '../bio_exp_medium.ts'
import { BIO_EXP_HARD } from '../bio_exp_hard.ts'

export const BIO_QUESTIONS: Question[] = [
  ...BIO_EASY,
  ...BIO_MEDIUM,
  ...BIO_HARD,
  ...BIO_EXP_MEDIUM,
  ...BIO_EXP_HARD,
]
