<script setup lang="ts">
const store = useTypingStore()

const emit = defineEmits<{ reset: [] }>()

const resultHeadline = computed(() => {
  if (store.isFirstTest) return 'Baseline Established!'
  if (store.isNewPersonalBest) return 'High Score Smashed!'
  return 'Test Complete!'
})

const resultSubtext = computed(() => {
  if (store.isFirstTest) return 'Your first result is now your personal best. Keep typing to beat it!'
  if (store.isNewPersonalBest) return `New personal best of ${store.personalBest?.wpm ?? 0} WPM. You're on fire!`
  return `Nice work! Your personal best is ${store.personalBest?.wpm ?? 0} WPM. Keep pushing!`
})

const resultIcon = computed(() => {
  if (store.isNewPersonalBest) return '/images/icon-new-pb.svg'
  return '/images/icon-completed.svg'
})

const iconTheme = computed(() => store.isNewPersonalBest ? 'icon-pb' : 'icon-complete')

const correctCharsDisplay = computed(() => store.lastResult?.correctChars ?? 0)
const incorrectCharsDisplay = computed(() => store.lastResult?.incorrectChars ?? 0)

// --- Config PB display ---
const configPBDisplay = computed(() => {
  const pb = store.currentConfigPB
  if (!pb) return null
  const r = store.lastResult
  if (!r) return null
  return {
    wpm: pb.wpm,
    label: `${r.difficulty} · ${r.mode === 'timed' ? r.duration + 's' : 'passage'} · ${r.category}`,
  }
})

// --- History browsing ---
const showHistory = ref(false)
const historyFilter = ref<'all' | 'current'>('all')

const filteredHistory = computed(() => {
  const list = [...store.history].reverse()
  if (historyFilter.value === 'current' && store.lastResult) {
    const r = store.lastResult
    return list.filter(h =>
      h.difficulty === r.difficulty &&
      h.mode === r.mode &&
      h.category === r.category,
    )
  }
  return list
})

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function downloadShareCard() {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 420
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, 800, 420)

  // Accent line top
  const grad = ctx.createLinearGradient(0, 0, 800, 0)
  grad.addColorStop(0, '#4ca6ff')
  grad.addColorStop(1, '#f4dc73')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 800, 4)

  // Title
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 28px Sora, sans-serif'
  ctx.fillText('Typing Speed Test', 50, 64)

  // WPM Big
  ctx.fillStyle = '#4ca6ff'
  ctx.font = 'bold 96px Sora, sans-serif'
  ctx.fillText(String(store.lastResult?.wpm ?? 0), 50, 200)
  ctx.fillStyle = '#888'
  ctx.font = '600 20px Sora, sans-serif'
  ctx.fillText('WPM', 50, 230)

  // Accuracy
  ctx.fillStyle = '#7bcc8d'
  ctx.font = 'bold 48px Sora, sans-serif'
  ctx.fillText(`${store.lastResult?.accuracy ?? 0}%`, 280, 190)
  ctx.fillStyle = '#888'
  ctx.font = '600 20px Sora, sans-serif'
  ctx.fillText('Accuracy', 280, 220)

  // Characters
  const correct = store.lastResult?.correctChars ?? 0
  const incorrect = store.lastResult?.incorrectChars ?? 0
  ctx.fillStyle = '#7bcc8d'
  ctx.font = 'bold 36px Sora, sans-serif'
  ctx.fillText(String(correct), 460, 175)
  ctx.fillStyle = '#888'
  ctx.font = '600 18px Sora, sans-serif'
  ctx.fillText('/', 460 + ctx.measureText(String(correct)).width + 4, 175)
  ctx.fillStyle = '#e07070'
  ctx.font = 'bold 36px Sora, sans-serif'
  ctx.fillText(String(incorrect), 460 + ctx.measureText(String(correct)).width + 20, 175)
  ctx.fillStyle = '#888'
  ctx.font = '600 18px Sora, sans-serif'
  ctx.fillText('Characters', 460, 205)

  // Footer
  ctx.fillStyle = '#555'
  ctx.font = '400 14px Sora, sans-serif'
  ctx.fillText(`${store.lastResult?.difficulty ?? ''} · ${store.lastResult?.category ?? ''} · ${store.lastResult?.duration ?? 0}s`, 50, 380)
  ctx.fillStyle = '#333'
  ctx.font = '400 13px Sora, sans-serif'
  ctx.fillText(new Date().toLocaleDateString(), 700, 400)

  const url = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = `typing-test-${store.lastResult?.wpm ?? 0}wpm.png`
  link.href = url
  link.click()
}
</script>

<template>
  <div class="report-area">

    <!-- Decorative stars (positioned fixed, outside content flow) -->
    <img src="/images/pattern-star-1.svg" alt="" aria-hidden="true" class="decor-star star-left" />
    <img src="/images/pattern-star-2.svg" alt="" aria-hidden="true" class="decor-star star-right" />

    <!-- ═══ Result Icon with glow rings ═══ -->
    <div class="result-icon-wrapper" :class="iconTheme">
      <img :src="resultIcon" :alt="resultHeadline" class="result-icon" />
    </div>

    <!-- ═══ Result Message ═══ -->
    <h2 class="result-headline">{{ resultHeadline }}</h2>
    <p class="result-subtext">{{ resultSubtext }}</p>

    <!-- ═══ Stat Cards ═══ -->
    <div class="result-stats">
      <div class="stat-card">
        <span class="stat-card-label">WPM:</span>
        <span class="stat-card-value">{{ store.lastResult?.wpm ?? 0 }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card-label">Accuracy:</span>
        <span class="stat-card-value accuracy-val">{{ store.lastResult?.accuracy ?? 0 }}%</span>
      </div>
      <div class="stat-card">
        <span class="stat-card-label">Characters</span>
        <span class="stat-card-value chars-value">
          <span class="chars-correct">{{ correctCharsDisplay }}</span>/<span class="chars-incorrect">{{ incorrectCharsDisplay }}</span>
        </span>
      </div>
    </div>

    <!-- ═══ Actions ═══ -->
    <div class="result-actions">
      <button class="cta-btn" @click="emit('reset')">
        {{ store.isFirstTest || store.isNewPersonalBest ? 'Beat This Score' : 'Go Again' }}
        <Icon name="tabler:refresh" aria-hidden="true" />
      </button>
      <button class="share-btn" @click="downloadShareCard">
        <Icon name="tabler:download" aria-hidden="true" />
        Save Result
      </button>
    </div>

    <!-- ═══ Config-specific PB ═══ -->
    <div v-if="configPBDisplay" class="config-pb">
      <span class="config-pb-label">Best for {{ configPBDisplay.label }}:</span>
      <span class="config-pb-value">{{ configPBDisplay.wpm }} WPM</span>
    </div>

    <!-- ═══ History Browser ═══ -->
    <div v-if="store.history.length > 0" class="history-browser">
      <button class="history-toggle" @click="showHistory = !showHistory">
        <Icon :name="showHistory ? 'tabler:chevron-up' : 'tabler:chevron-down'" aria-hidden="true" />
        {{ showHistory ? 'Hide' : 'View' }} Score History ({{ store.history.length }})
      </button>

      <Transition name="slide-fade">
        <div v-if="showHistory" class="history-panel">
          <div class="history-filters">
            <button
              class="filter-btn"
              :class="{ active: historyFilter === 'all' }"
              @click="historyFilter = 'all'"
            >All Tests</button>
            <button
              class="filter-btn"
              :class="{ active: historyFilter === 'current' }"
              @click="historyFilter = 'current'"
            >This Config</button>
          </div>

          <div class="history-list">
            <div v-for="(h, i) in filteredHistory" :key="h.timestamp + '-' + i" class="history-row">
              <span class="h-wpm">{{ h.wpm }} <small>WPM</small></span>
              <span class="h-acc">{{ h.accuracy }}%</span>
              <span class="h-config">{{ h.difficulty }} · {{ h.mode === 'timed' ? h.duration + 's' : 'passage' }} · {{ h.category }}</span>
              <span class="h-date">{{ formatDate(h.timestamp) }}</span>
            </div>
            <p v-if="filteredHistory.length === 0" class="history-empty">No tests match this configuration.</p>
          </div>
        </div>
      </Transition>
    </div>

    <!-- ═══ Bonus: Performance History ═══ -->
    <template v-if="store.history.length >= 2">
      <div class="bonus-section">
        <h3 class="bonus-title">Performance History</h3>
        <HistoryChart />
      </div>
    </template>

    <!-- ═══ Bonus: Keyboard Heatmap ═══ -->
    <template v-if="Object.keys(store.keyPressCount).length > 0">
      <div class="bonus-section">
        <h3 class="bonus-title">Keystroke Heatmap</h3>
        <KeyboardHeatmap />
      </div>
    </template>

  </div>
</template>

<style lang="scss" scoped>
.report-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.75rem;
  width: 100%;
  padding: 3rem 5rem 5rem;
  animation: slide-up 0.35s ease;

  @media (max-width: 860px) {
    padding: 2rem 1.5rem 4rem;
  }

  @media (max-width: 600px) {
    padding: 1.5rem 1.25rem 3rem;
    gap: 1.25rem;
  }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

// ─── Decorative stars ────────────────────────────────
.decor-star {
  position: fixed;
  pointer-events: none;
  z-index: 0;
}
.star-left  { left: 6%;  top: 38%; }
.star-right { right: 6%; bottom: 28%; }

@media (max-width: 600px) {
  .decor-star {
    position: absolute;
    width: 20px;
    height: 20px;
  }
  .star-left  { left: 4%;  top: 8%; }
  .star-right { right: 4%; bottom: 2%; }
}

// ─── Result icon with glow rings ─────────────────────
.result-icon-wrapper {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.icon-complete {
    background-color: hsl(140, 63%, 40%);
    box-shadow:
      0 0 0 14px hsl(140, 55%, 20%),
      0 0 0 28px hsl(140, 50%, 11%);
  }

  &.icon-pb {
    background-color: hsl(49, 85%, 52%);
    box-shadow:
      0 0 0 14px hsl(49, 70%, 25%),
      0 0 0 28px hsl(49, 65%, 13%);
  }
}

.result-icon {
  width: 46px;
  height: 46px;
}

// ─── Headline + subtext ───────────────────────────────
.result-headline {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
  transition: color 0.3s ease;

  @media (max-width: 600px) {
    font-size: 1.5rem;
  }
}

.result-subtext {
  font-size: 1rem;
  color: var(--color-text-dim);
  margin: -0.75rem 0 0;
  line-height: 1.5;
  max-width: 480px;
  transition: color 0.3s ease;

  @media (max-width: 600px) {
    font-size: 0.875rem;
    max-width: 300px;
  }
}

// ─── Stat Cards (bordered, no fill) ──────────────────
.result-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 600px) {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
  }
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.375rem;
  border: 1px solid var(--color-divider);
  border-radius: 8px;
  padding: 1.25rem 1.75rem;
  min-width: 150px;
  transition: border-color 0.3s ease;

  @media (max-width: 600px) {
    width: 100%;
    min-width: unset;
    padding: 1rem 1.25rem;
  }
}

.stat-card-label {
  font-size: 0.9375rem;
  color: var(--color-text-dim);
  transition: color 0.3s ease;
}

.stat-card-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
  transition: color 0.3s ease;
}

.accuracy-val { color: var(--color-error); }

.chars-value {
  display: flex;
  align-items: baseline;
  gap: 0.1em;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.chars-correct  { color: var(--color-correct); }
.chars-incorrect { color: var(--color-error); }

// ─── CTA Button ──────────────────────────────────────
.result-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 2.25rem;
  border-radius: 100px;
  border: 2px solid var(--color-text);
  background-color: var(--color-text);
  color: var(--color-bg);
  font-family: inherit;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease;

  &:hover { background-color: transparent; color: var(--color-text); }
  &:active { transform: scale(0.97); }
  &:focus-visible { outline: 2px solid var(--color-cursor); outline-offset: 2px; }
  .iconify { width: 1.125rem; height: 1.125rem; }
}

.share-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 100px;
  border: 1px solid var(--color-divider);
  background: transparent;
  color: var(--color-text-dim);
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;

  &:hover { color: var(--color-text); border-color: var(--color-text-dim); }
  &:focus-visible { outline: 2px solid var(--color-cursor); outline-offset: 2px; }
  .iconify { width: 1rem; height: 1rem; }
}

// ─── Bonus Sections ──────────────────────────────────
// ─── Bonus Sections ──────────────────────────────────

// Config-specific PB
.config-pb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-dim);
  transition: color 0.3s ease;
}

.config-pb-value {
  font-weight: 700;
  color: var(--color-timer);
}

// History browser
.history-browser {
  width: 100%;
  max-width: 760px;
}

.history-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-divider);
  border-radius: 100px;
  background: transparent;
  color: var(--color-text-dim);
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;

  &:hover { color: var(--color-text); border-color: var(--color-text-dim); }
  &:focus-visible { outline: 2px solid var(--color-cursor); outline-offset: 2px; }

  .iconify { width: 0.875rem; height: 0.875rem; }
}

.history-panel {
  margin-top: 1rem;
  text-align: left;
}

.history-filters {
  display: flex;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
}

.filter-btn {
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--color-divider);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-dim);
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;

  &.active {
    border-color: hsl(214, 100%, 55%);
    color: hsl(214, 100%, 55%);
  }

  &:hover:not(.active) { color: var(--color-text); }
}

.history-list {
  max-height: 280px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-divider) transparent;
}

.history-row {
  display: grid;
  grid-template-columns: 80px 60px 1fr auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.8125rem;
  border-bottom: 1px solid color-mix(in oklch, var(--color-divider) 40%, transparent);

  @media (max-width: 600px) {
    grid-template-columns: 70px 50px 1fr;
    .h-date { display: none; }
  }
}

.h-wpm {
  font-weight: 700;
  color: var(--color-text);

  small {
    font-weight: 400;
    color: var(--color-text-dim);
    font-size: 0.6875rem;
  }
}

.h-acc    { color: var(--color-correct); font-weight: 600; }
.h-config { color: var(--color-text-dim); font-size: 0.75rem; }
.h-date   { color: var(--color-text-dim); font-size: 0.6875rem; text-align: right; }

.history-empty {
  color: var(--color-text-dim);
  font-size: 0.8125rem;
  padding: 1rem 0;
}

// Transition for history panel
.slide-fade-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.slide-fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { opacity: 0; transform: translateY(-8px); }

.bonus-section {
  width: 100%;
  max-width: 760px;
  background-color: var(--color-reset-bg);
  border-radius: 12px;
  padding: 1.5rem 2rem;
  text-align: left;
  transition: background-color 0.3s ease;

  @media (max-width: 600px) {
    padding: 1rem 1rem;
    border-radius: 8px;
  }
}

.bonus-title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-dim);
  margin: 0 0 1.25rem;
}
</style>
