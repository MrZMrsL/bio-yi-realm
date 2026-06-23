<template>
  <div class="leaderboard-container">
    <LeaderboardHeader />

    <MyRankCard :my-rank="myRank" :my-name="myName" :my-record="myRecord" />

    <LeaderboardEmpty
      v-if="loading"
      icon="⏳"
      text="正在加载排行榜..."
      hint="全球勇士数据同步中"
    />
    <LeaderboardEmpty
      v-else-if="error"
      icon="⚠️"
      :text="error"
      show-retry
      @retry="loadLeaderboard"
    />
    <LeaderboardEmpty
      v-else-if="leaderboard.length === 0"
      icon="📭"
      text="暂无排名数据"
      hint="快去PVP对战，成为第一个上榜的勇士！"
    />
    <LeaderboardList
      v-else
      v-model:expanded-row="expandedRow"
      :leaderboard="leaderboard"
      :top-n="topN"
      :total-battles="totalBattles"
      :my-name="myName"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '../stores/game.ts'
import { getLeaderboard, getMyRank, getTotalBattles, getTopN } from '../composables/useLeaderboard.js'
import { logger } from '../utils/logger.js'
import LeaderboardHeader from './leaderboard/LeaderboardHeader.vue'
import MyRankCard from './leaderboard/MyRankCard.vue'
import LeaderboardList from './leaderboard/LeaderboardList.vue'
import LeaderboardEmpty from './leaderboard/LeaderboardEmpty.vue'

const store = useGameStore()

const props = defineProps({
  topN: { type: Number, default: 20 },
})

const leaderboard = ref([])
const myRank = ref(-1)
const myRecord = ref({ wins: 0, losses: 0, streak: 0 })
const totalBattles = ref(0)
const expandedRow = ref(-1)
const loading = ref(false)
const error = ref('')

const myName = computed(() => store.playerName || '')

async function loadLeaderboard() {
  loading.value = true
  error.value = ''
  try {
    leaderboard.value = await getTopN(props.topN)
    myRank.value = myName.value ? await getMyRank(myName.value) : -1
    totalBattles.value = await getTotalBattles()

    if (myName.value) {
      const all = await getLeaderboard()
      const me = all.find(r => r.name === myName.value)
      if (me) {
        myRecord.value = { wins: me.wins, losses: me.losses, streak: me.streak }
      } else {
        myRecord.value = { wins: 0, losses: 0, streak: 0 }
      }
    }
  } catch (e) {
    logger.error('[Leaderboard] 加载排行榜失败:', e)
    error.value = '排行榜加载失败，请检查网络或稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadLeaderboard()
})
</script>

<style scoped>
.leaderboard-container {
  padding: 16px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>