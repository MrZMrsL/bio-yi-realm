<template>
  <div class="review-container">
    <ReviewTabs v-model="activeTab" />

    <!-- 收藏知识页 -->
    <KnowledgeHome v-if="activeTab === 'knowledge'" />

    <!-- 复习模式：答题界面 -->
    <div v-if="activeTab === 'review'">
      <ReviewQuiz v-if="store.reviewMode && store.reviewCurrent" />

      <!-- 复习结果页 -->
      <ReviewResult v-else-if="store.reviewResults.length > 0 && !store.reviewMode" />

      <!-- 错题本主界面 -->
      <ReviewHome v-else @start-review="startReview" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGameStore } from '../stores/game.ts'
import ReviewTabs from './review/ReviewTabs.vue'
import KnowledgeHome from './review/KnowledgeHome.vue'
import ReviewQuiz from './review/ReviewQuiz.vue'
import ReviewResult from './review/ReviewResult.vue'
import ReviewHome from './review/ReviewHome.vue'

const store = useGameStore()
const activeTab = ref('review')

function startReview(subjectFilter) {
  store.startReview(subjectFilter)
}
</script>

<style scoped>
.review-container {
  padding: 16px;
  color: #fff;
  max-height: 70vh;
  overflow-y: auto;
}
</style>
