<template>
  <div class="fishing-container">
    <FishingHeader />

    <FishingArea
      :fishing-state="fishingState"
      :caught-fish="caughtFish"
      :caught-book="caughtBook"
      @action="handleFishAction"
    />

    <FishingQuizPanel
      :fishing-state="fishingState"
      :quiz-question="quizQuestion"
      :caught-fish="caughtFish"
      @submit-answer="handleQuizAnswer"
    />

    <FishingResult :show-fish-fail="quizResult === false" :fishing-state="fishingState" :caught-fish="caughtFish" @continue="continueFishing" />

    <FishCaughtPanel v-if="fishingState === 'caught'" :caught-fish="caughtFish" @eat="eatFish" @release="releaseFish" />

    <BookCaughtPanel
      :fishing-state="fishingState"
      :caught-book="caughtBook"
      @start-study="startBookStudy"
      @collect="collectBook"
      @submit-study-answer="submitBookStudyAnswer"
      @cancel-study="cancelBookStudy"
      @continue="continueFishing"
    />

    <FishingRecentCatches />
    <FishingCollection :all-fish="allFish" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGameStore, GAME_MODE } from '../stores/game.ts'
import { getQuestions, ensureQuestionsForSpec } from '../data/questions.ts'
import { sfxClick, sfxSplash, sfxItemGet, sfxCorrect, sfxWrong } from '../utils/sfx.ts'
import { logger } from '../utils/logger.js'
import FishingHeader from './fishing/FishingHeader.vue'
import FishingArea from './fishing/FishingArea.vue'
import FishingQuizPanel from './fishing/FishingQuizPanel.vue'
import FishingResult from './fishing/FishingResult.vue'
import FishCaughtPanel from './fishing/FishCaughtPanel.vue'
import BookCaughtPanel from './fishing/BookCaughtPanel.vue'
import FishingRecentCatches from './fishing/FishingRecentCatches.vue'
import FishingCollection from './fishing/FishingCollection.vue'

const store = useGameStore()
const fishingState = ref('idle')
const caughtFish = ref(null)
const caughtBook = ref(null)
const quizQuestion = ref(null)
const quizResult = ref(null)
const allFish = ref([])

onMounted(async () => {
  const { getAllFishes } = await import('../data/fishing.ts')
  allFish.value = await getAllFishes()
})

// 钓鱼次数限制检查
const fishLimitCheck = computed(() => store.canFishToday())

async function handleFishAction() {
  sfxClick()
  if (fishingState.value === 'idle') {
    // 检查钓鱼次数限制
    const check = fishLimitCheck.value
    if (!check.allowed) {
      // 需要答题解锁
      fishingState.value = 'limitQuiz'
      store.enterMode(GAME_MODE.FISHING_QUIZ)
      await ensureQuestionsForSpec('all')
      quizQuestion.value = getQuestions('all', 'medium', 1)[0]
      quizResult.value = null
      return
    }
    startFishing()
  } else if (fishingState.value === 'bite') {
    await reelIn()
  }
}

function startFishing() {
  fishingState.value = 'casting'
  store.enterMode(GAME_MODE.FISHING)
  caughtFish.value = null

  // 随机等待时间 1-3 秒
  const waitTime = 1000 + Math.random() * 2000

  setTimeout(() => {
    if (fishingState.value === 'casting') {
      fishingState.value = 'bite'

      // 咬钩后 2 秒内不收杆就会跑掉
      setTimeout(() => {
        if (fishingState.value === 'bite') {
          fishingState.value = 'idle'
          store.enterMode(GAME_MODE.IDLE)
        }
      }, 2000)
    }
  }, waitTime)
}

async function reelIn() {
  if (fishingState.value !== 'bite') return

  sfxSplash()

  // 增加钓鱼次数
  store.dailyFishCount++

  const { drawFish, drawBook } = await import('../data/fishing.ts')

  // 15% 概率钓到古籍
  if (Math.random() < 0.15) {
    const book = await drawBook(store.fishingLevel)
    if (book) {
      caughtBook.value = book
      fishingState.value = 'book'
      store.enterMode(GAME_MODE.FISHING_BOOK)
      store.addToCyclopedia('books', book.name)
      sfxItemGet()
      return
    }
  }

  // 抽鱼！
  const fish = await drawFish(store.fishingLevel)

  if (!fish) {
    // 没钓到鱼，空杆
    fishingState.value = 'idle'
    store.enterMode(GAME_MODE.IDLE)
    return
  }

  if (fish.rarity === 'legendary' || fish.rarity === 'mythic') {
    // 传说/神话鱼需要答题
    caughtFish.value = fish
    fishingState.value = 'quiz'
    store.enterMode(GAME_MODE.FISHING_QUIZ)
    await ensureQuestionsForSpec('all')
    quizQuestion.value = getQuestions('all', 'hard', 1)[0]
    quizResult.value = null
    return
  }

  caughtFish.value = fish
  fishingState.value = 'caught'
  store.enterMode(GAME_MODE.FISHING_CAUGHT)
  store.recordFishCatch(fish)
  sfxItemGet()
  store.saveGame()
}

function collectBook() {
  sfxClick()
  // 直接收下：将古籍加入收藏列表（自习室可见）
  if (caughtBook.value && !store.collectedKnowledge.some(k => k.name === caughtBook.value.name)) {
    store.collectedKnowledge.push({ ...caughtBook.value, learnedAt: Date.now() })
  }
  caughtBook.value = null
  fishingState.value = 'idle'
  store.enterMode(GAME_MODE.IDLE)
  store.saveGame()
}

async function startBookStudy() {
  sfxClick()
  if (!caughtBook.value) return
  const ok = await store.startBookStudy(caughtBook.value)
  if (!ok) {
    // 题库加载失败，直接收下古籍
    sfxItemGet()
    collectBook()
    return
  }
  fishingState.value = 'bookStudyQuiz'
  store.enterMode(GAME_MODE.FISHING_BOOK_QUIZ)
  quizResult.value = null
}

function submitBookStudyAnswer(index) {
  sfxClick()
  const result = store.submitBookStudyAnswer(index)
  // 防御性处理：确保result是对象
  if (!result || typeof result !== 'object') {
    logger.error('submitBookStudyAnswer返回异常:', result)
    fishingState.value = 'idle'
    store.enterMode(GAME_MODE.IDLE)
    caughtBook.value = null
    return
  }
  if (result.correct) {
    sfxCorrect()
    fishingState.value = 'bookStudySuccess'
    store.enterMode(GAME_MODE.FISHING_CAUGHT)
  } else {
    sfxWrong()
    fishingState.value = 'bookStudyFail'
    store.enterMode(GAME_MODE.IDLE)
  }
}

function cancelBookStudy() {
  sfxClick()
  store.cancelBookStudy()
  caughtBook.value = null
  fishingState.value = 'idle'
  store.enterMode(GAME_MODE.IDLE)
}

function handleQuizAnswer(index) {
  if (fishingState.value === 'quiz') {
    submitQuizAnswer(index)
  } else if (fishingState.value === 'limitQuiz') {
    submitLimitQuizAnswer(index)
  }
}

function submitQuizAnswer(index) {
  if (!quizQuestion.value) return
  const correct = index === quizQuestion.value.answer
  quizResult.value = correct
  if (correct) {
    // 答对，成功钓起
    fishingState.value = 'caught'
    store.enterMode(GAME_MODE.FISHING_CAUGHT)
    store.recordFishCatch(caughtFish.value)
    sfxItemGet()
  } else {
    // 答错，鱼跑了
    caughtFish.value = null
    fishingState.value = 'idle'
    store.enterMode(GAME_MODE.IDLE)
    quizQuestion.value = null
  }
  store.saveGame()
}

function submitLimitQuizAnswer(index) {
  if (!quizQuestion.value) return
  const correct = index === quizQuestion.value.answer
  if (correct) {
    sfxCorrect()
    store.unlockFishLimit()
    fishingState.value = 'idle'
    store.enterMode(GAME_MODE.IDLE)
    quizQuestion.value = null
    quizResult.value = null
    // 短暂延迟后自动开始钓鱼，确保状态切换完成
    setTimeout(() => {
      if (fishingState.value === 'idle') {
        startFishing()
      }
    }, 300)
  } else {
    sfxWrong()
    fishingState.value = 'limitLocked'
    store.enterMode(GAME_MODE.IDLE)
  }
}

function eatFish() {
  sfxClick()
  if (!caughtFish.value) return

  store.eatFish(caughtFish.value)

  caughtFish.value = null
  fishingState.value = 'idle'
  store.enterMode(GAME_MODE.IDLE)
}

function releaseFish() {
  sfxClick()
  if (!caughtFish.value) return

  store.releaseFish(caughtFish.value)

  caughtFish.value = null
  fishingState.value = 'idle'
  store.enterMode(GAME_MODE.IDLE)
}

function continueFishing() {
  sfxClick()
  fishingState.value = 'idle'
  store.enterMode(GAME_MODE.IDLE)
  quizResult.value = null
  quizQuestion.value = null
  caughtFish.value = null
  caughtBook.value = null
}
</script>

<style scoped>
.fishing-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 4px;
}
</style>
