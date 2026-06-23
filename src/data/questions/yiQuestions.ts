import type { Question } from '../../types.ts'

import { YI_EASY } from '../yi_easy.ts'
import { YI_MEDIUM } from '../yi_medium.ts'
import { YI_HARD } from '../yi_hard.ts'

export const YI_QUESTIONS: Question[] = [...YI_EASY, ...YI_MEDIUM, ...YI_HARD]
