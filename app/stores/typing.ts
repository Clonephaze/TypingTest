import { defineStore } from 'pinia'

export type Phase = 'idle' | 'running' | 'complete'
export type TestMode = 'timed' | 'passage'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type Category = 'standard' | 'quotes' | 'code'
export type Duration = 15 | 30 | 60 | 120

export interface TestResult {
  wpm: number
  accuracy: number
  correctChars: number
  incorrectChars: number
  duration: number
  timestamp: number
  difficulty: Difficulty
  mode: TestMode
  category: Category
}

export interface PersonalBest {
  wpm: number
  accuracy: number
  timestamp: number
}

// Compound key for per-configuration personal bests
function pbKey(difficulty: Difficulty, mode: TestMode, duration: Duration, category: Category): string {
  return `${difficulty}-${mode}-${duration}-${category}`
}

export const useTypingStore = defineStore('typing', () => {
  // --- Settings ---
  const difficulty = ref<Difficulty>('medium')
  const mode = ref<TestMode>('timed')
  const testDuration = ref<Duration>(60)
  const category = ref<Category>('standard')

  // --- Phase ---
  const phase = ref<Phase>('idle')

  // --- Heatmap data (written by TestArea, read by KeyboardHeatmap) ---
  const keyPressCount = ref<Record<string, number>>({})
  const keyErrorCount = ref<Record<string, number>>({})

  // --- Result & history (persisted to localStorage) ---
  const lastResult = ref<TestResult | null>(null)
  const personalBest = ref<PersonalBest | null>(null)
  const personalBests = ref<Record<string, PersonalBest>>({})
  const history = ref<TestResult[]>([])

  // --- Completion flags (read by ReportArea / Confetti) ---
  const isNewPersonalBest = ref(false)
  const isFirstTest = ref(false)

  /** The PB for the current configuration */
  const currentConfigPB = computed(() => {
    const key = pbKey(difficulty.value, mode.value, testDuration.value, category.value)
    return personalBests.value[key] ?? null
  })

  // --- Bootstrap from localStorage ---
  function loadFromStorage() {
    if (!import.meta.client) return
    try {
      const pb = localStorage.getItem('tt-personal-best')
      if (pb) personalBest.value = JSON.parse(pb)
      const pbs = localStorage.getItem('tt-personal-bests')
      if (pbs) personalBests.value = JSON.parse(pbs)
      const hist = localStorage.getItem('tt-history')
      if (hist) history.value = JSON.parse(hist)
    } catch { /* ignore corrupted data */ }
  }

  // --- Called by TestArea when a test finishes ---
  function saveResult(result: TestResult) {
    lastResult.value = result

    // Global PB
    if (!personalBest.value) {
      isFirstTest.value = true
      personalBest.value = { wpm: result.wpm, accuracy: result.accuracy, timestamp: result.timestamp }
    } else if (result.wpm > personalBest.value.wpm) {
      isNewPersonalBest.value = true
      personalBest.value = { wpm: result.wpm, accuracy: result.accuracy, timestamp: result.timestamp }
    }

    // Per-config PB
    const key = pbKey(result.difficulty, result.mode, result.duration as Duration, result.category)
    const existing = personalBests.value[key]
    if (!existing || result.wpm > existing.wpm) {
      personalBests.value = {
        ...personalBests.value,
        [key]: { wpm: result.wpm, accuracy: result.accuracy, timestamp: result.timestamp },
      }
    }

    if (import.meta.client) {
      try {
        localStorage.setItem('tt-personal-best', JSON.stringify(personalBest.value))
        localStorage.setItem('tt-personal-bests', JSON.stringify(personalBests.value))
        history.value = [...history.value, result].slice(-100)
        localStorage.setItem('tt-history', JSON.stringify(history.value))
      } catch { /* storage full / private browsing */ }
    }
  }

  // --- Called by TestArea on reset ---
  function resetForNewTest() {
    phase.value = 'idle'
    lastResult.value = null
    isNewPersonalBest.value = false
    isFirstTest.value = false
    keyPressCount.value = {}
    keyErrorCount.value = {}
  }

  // --- Heatmap tracking ---
  function trackKey(key: string, isError: boolean) {
    keyPressCount.value = { ...keyPressCount.value, [key]: (keyPressCount.value[key] ?? 0) + 1 }
    if (isError) {
      keyErrorCount.value = { ...keyErrorCount.value, [key]: (keyErrorCount.value[key] ?? 0) + 1 }
    }
  }

  return {
    difficulty, mode, testDuration, category,
    phase,
    keyPressCount, keyErrorCount,
    lastResult, personalBest, personalBests, currentConfigPB, history,
    isNewPersonalBest, isFirstTest,
    loadFromStorage, saveResult, resetForNewTest, trackKey,
  }
})
