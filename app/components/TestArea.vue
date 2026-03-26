<script setup lang="ts">
import { passages } from '~/data/passages'
import type { Difficulty, Category, Duration } from '~/stores/typing'

const store = useTypingStore()

// --- Typing state ---
interface CharState { char: string; status: 'pending' | 'correct' | 'incorrect' }

const inputRef = ref<HTMLTextAreaElement | null>(null)
const passageContainerRef = ref<HTMLDivElement | null>(null)
const cursorEl = ref<HTMLElement | null>(null)

const isFocused = ref(false)
const cursorPos = ref(0)
const charStates = ref<CharState[]>([])

// Stats (non-reactive counters for perf, reactive refs for display)
let totalPresses = 0
let errorPresses = 0
let correctCount = 0
const liveWpm = ref(0)
const liveAccuracy = ref(100)

// --- Timer (owned here, not in store) ---
const elapsedSeconds = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null

const timeDisplay = computed(() => {
  const t = store.mode === 'timed'
    ? Math.max(0, store.testDuration - elapsedSeconds.value)
    : elapsedSeconds.value
  const m = Math.floor(t / 60)
  const s = t % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

const isTimeLow = computed(() =>
  store.mode === 'timed' && (store.testDuration - elapsedSeconds.value) <= 10,
)

// --- Controls ---
const difficulties: Difficulty[] = ['easy', 'medium', 'hard']
const durations: Duration[] = [15, 30, 60, 120]
const categories: { value: Category; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'quotes', label: 'Quotes' },
  { value: 'code', label: 'Code' },
]

// Dropdown options for mobile
const difficultyOptions = computed(() =>
  difficulties.map(d => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) })),
)

const modeOptions = computed(() => [
  ...durations.map(d => ({ value: `timed-${d}`, label: `Timed (${d}s)` })),
  { value: 'passage', label: 'Passage' },
])

const modeDropdownValue = computed(() =>
  store.mode === 'timed' ? `timed-${store.testDuration}` : 'passage',
)

const categoryOptions = computed(() =>
  categories.map(c => ({ value: c.value, label: c.label })),
)

function handleMobileCategory(val: string) {
  changeCategory(val as Category)
}

function handleMobileMode(val: string) {
  if (val === 'passage') {
    changeMode('passage')
  } else if (val.startsWith('timed-')) {
    changeMode('timed')
    const dur = parseInt(val.replace('timed-', ''), 10) as Duration
    if (durations.includes(dur)) changeDuration(dur)
  }
}

function handleMobileDifficulty(val: string) {
  changeDifficulty(val as Difficulty)
}

// --- Passage loading ---
function loadPassage() {
  const cat = store.category
  const pool = cat === 'standard' ? passages[store.difficulty] : passages[cat]
  const entry = pool[Math.floor(Math.random() * pool.length)]!
  charStates.value = entry.text.split('').map(c => ({ char: c, status: 'pending' as const }))
  cursorPos.value = 0
  correctCount = 0
  totalPresses = 0
  errorPresses = 0
  liveWpm.value = 0
  liveAccuracy.value = 100
}

// --- Input focus ---
function handleContainerClick() {
  if (store.phase === 'complete') return
  inputRef.value?.focus()
}

function handleFocus() { isFocused.value = true }
function handleBlur() { isFocused.value = false }

// --- Start ---
function startTest() {
  store.phase = 'running'
  elapsedSeconds.value = 0
  timerInterval = setInterval(() => {
    elapsedSeconds.value++
    recalcStats()
    if (store.mode === 'timed' && elapsedSeconds.value >= store.testDuration) {
      finishTest()
    }
  }, 1000)
  nextTick(() => inputRef.value?.focus())
}

// --- Finish ---
function finishTest() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
  recalcStats()
  store.saveResult({
    wpm: liveWpm.value,
    accuracy: liveAccuracy.value,
    correctChars: correctCount,
    incorrectChars: errorPresses,
    duration: elapsedSeconds.value,
    timestamp: Date.now(),
    difficulty: store.difficulty,
    mode: store.mode,
    category: store.category,
  })
  store.phase = 'complete'
}

// --- Reset ---
function resetTest() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
  store.resetForNewTest()
  elapsedSeconds.value = 0
  loadPassage()
  resetInputSeed()
}

// --- Stats ---
function recalcStats() {
  const elapsed = Math.max(1, elapsedSeconds.value)
  liveWpm.value = Math.round((correctCount / 5) / (elapsed / 60))
  liveAccuracy.value = totalPresses > 0
    ? Math.round(((totalPresses - errorPresses) / totalPresses) * 100)
    : 100
}

// --- Input handlers ---
// Seed value: a single space keeps the mobile IME cycle happy.
// We let the textarea accept input naturally, read what changed, then reset.
const SEED = ' '
let lastLen = SEED.length

function resetInputSeed() {
  const el = inputRef.value
  if (!el) return
  el.value = SEED
  el.selectionStart = el.selectionEnd = SEED.length
  lastLen = SEED.length
}

// keydown: only used for Tab prevention
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Tab') e.preventDefault()
}

// input: fires after the textarea has been mutated — reliable on desktop and mobile
function handleInput() {
  const el = inputRef.value
  if (!el) return
  const val = el.value
  const newLen = val.length

  if (store.phase === 'complete') { resetInputSeed(); return }

  if (newLen > lastLen) {
    // Characters were inserted
    const added = val.slice(lastLen)
    if (store.phase === 'idle') startTest()
    if (store.phase === 'running') {
      for (const ch of added) {
        if (cursorPos.value >= charStates.value.length) break
        const expected = charStates.value[cursorPos.value]!.char
        const isCorrect = ch === expected

        if (isCorrect) {
          charStates.value[cursorPos.value]!.status = 'correct'
          correctCount++
        } else {
          charStates.value[cursorPos.value]!.status = 'incorrect'
          errorPresses++
        }

        totalPresses++
        store.trackKey(ch, !isCorrect)
        cursorPos.value++
        recalcStats()
      }
      scrollCursorIntoView()
      if (cursorPos.value >= charStates.value.length) finishTest()
    }
  } else if (newLen < lastLen) {
    // Backspace
    if (store.phase === 'running' && cursorPos.value > 0) {
      cursorPos.value--
      const prev = charStates.value[cursorPos.value]!
      if (prev.status === 'correct') correctCount--
      prev.status = 'pending'
      recalcStats()
      scrollCursorIntoView()
    }
  }

  resetInputSeed()
}

function scrollCursorIntoView() {
  nextTick(() => {
    cursorEl.value?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  })
}

// --- Change settings (resets passage) ---
function changeDifficulty(d: Difficulty) {
  if (store.phase === 'running') return
  store.difficulty = d
  resetTest()
}

function changeCategory(c: Category) {
  if (store.phase === 'running') return
  store.category = c
  resetTest()
}

function changeMode(m: 'timed' | 'passage') {
  if (store.phase === 'running') return
  store.mode = m
}

function changeDuration(d: Duration) {
  if (store.phase === 'running') return
  store.testDuration = d
}

// --- Lifecycle ---
onMounted(() => {
  store.loadFromStorage()
  loadPassage()
  resetInputSeed()
})

// Expose resetTest for parent (app.vue calls this after ReportArea reset)
defineExpose({ resetTest })
</script>

<template>
  <div class="test-area">

    <!-- ═══ Stats + Controls Bar — single row matching design ═══ -->
    <div class="sc-bar">

      <!-- Left: live stats -->
      <div class="sc-stats">
        <div class="stat-item">
          <span class="stat-label">WPM:</span>
          <span class="stat-value">{{ liveWpm }}</span>
        </div>
        <div class="sc-sep" aria-hidden="true" />
        <div class="stat-item">
          <span class="stat-label">Accuracy:</span>
          <span
            class="stat-value"
            :class="{ 'val-error': liveAccuracy < 100 && store.phase === 'running' }"
          >{{ liveAccuracy }}%</span>
        </div>
        <div class="sc-sep" aria-hidden="true" />
        <div class="stat-item" :class="{ 'time-low': isTimeLow }">
          <span class="stat-label">{{ store.mode === 'timed' ? 'Time:' : 'Elapsed:' }}</span>
          <span class="stat-value timer-value">{{ timeDisplay }}</span>
        </div>
      </div>

      <!-- Right: difficulty + mode controls (desktop only) -->
      <div class="sc-controls desktop-controls" role="toolbar" aria-label="Test settings">
        <span class="ctrl-label">Difficulty:</span>
        <div class="ctrl-group" role="group" aria-label="Difficulty">
          <button
            v-for="d in difficulties"
            :key="d"
            class="ctrl-btn"
            :class="{ active: store.difficulty === d && store.category === 'standard' }"
            :disabled="store.phase === 'running' || store.category !== 'standard'"
            :aria-pressed="store.difficulty === d && store.category === 'standard'"
            @click="changeDifficulty(d)"
          >{{ d.charAt(0).toUpperCase() + d.slice(1) }}</button>
        </div>

        <div class="ctrl-vsep" aria-hidden="true" />

        <span class="ctrl-label">Mode:</span>
        <div class="ctrl-group" role="group" aria-label="Mode">
          <button
            class="ctrl-btn"
            :class="{ active: store.mode === 'timed' }"
            :disabled="store.phase === 'running'"
            :aria-pressed="store.mode === 'timed'"
            @click="changeMode('timed')"
          >Timed ({{ store.testDuration }}s)</button>
          <button
            class="ctrl-btn"
            :class="{ active: store.mode === 'passage' }"
            :disabled="store.phase === 'running'"
            :aria-pressed="store.mode === 'passage'"
            @click="changeMode('passage')"
          >Passage</button>
        </div>
      </div>

    </div>

    <!-- Mobile dropdowns (below stats on small screens) -->
    <div class="mobile-controls">
      <DropdownSelect
        :options="difficultyOptions"
        :model-value="store.difficulty"
        :disabled="store.phase === 'running' || store.category !== 'standard'"
        @update:model-value="handleMobileDifficulty"
      />
      <DropdownSelect
        :options="modeOptions"
        :model-value="modeDropdownValue"
        :disabled="store.phase === 'running'"
        @update:model-value="handleMobileMode"
      />
      <DropdownSelect
        :options="categoryOptions"
        :model-value="store.category"
        :disabled="store.phase === 'running'"
        @update:model-value="handleMobileCategory"
      />
    </div>

    <hr class="bar-divider" />

    <!-- ═══ Bonus Controls (duration + category) ═══ -->
    <div class="bonus-controls">
      <Transition name="slide-fade">
        <div v-if="store.mode === 'timed'" class="ctrl-group" role="group" aria-label="Duration">
          <button
            v-for="d in durations"
            :key="d"
            class="ctrl-btn ctrl-btn--sm"
            :class="{ active: store.testDuration === d }"
            :disabled="store.phase === 'running'"
            :aria-pressed="store.testDuration === d"
            @click="changeDuration(d)"
          >{{ d }}s</button>
        </div>
      </Transition>
      <div class="ctrl-group" role="group" aria-label="Category">
        <button
          v-for="cat in categories"
          :key="cat.value"
          class="ctrl-btn ctrl-btn--sm"
          :class="{ active: store.category === cat.value }"
          :disabled="store.phase === 'running'"
          :aria-pressed="store.category === cat.value"
          @click="changeCategory(cat.value)"
        >{{ cat.label }}</button>
      </div>
    </div>

    <!-- ═══ Passage Area ═══ -->
    <div
      class="passage-wrapper"
      :class="{ idle: store.phase === 'idle' }"
      role="application"
      aria-label="Typing area"
      @click="handleContainerClick"
    >
      <!-- Hidden textarea for keyboard capture -->
      <textarea
        ref="inputRef"
        class="hidden-input"
        aria-label="Type the passage here"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="none"
        spellcheck="false"
        tabindex="0"
        @keydown="handleKeyDown"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <!-- Start overlay -->
      <Transition name="fade">
        <div v-if="store.phase === 'idle'" class="start-overlay" @click.stop>
          <button class="start-btn" @click="startTest">
            <Icon name="tabler:player-play-filled" aria-hidden="true" />
            Start Typing Test
          </button>
          <p class="start-hint">Or click the text and start typing</p>
        </div>
      </Transition>

      <!-- Passage text -->
      <div ref="passageContainerRef" class="passage" :class="{ blurred: store.phase === 'idle' }">
        <span
          v-for="(item, i) in charStates"
          :key="i"
          :ref="(el) => { if (i === cursorPos) cursorEl = el as HTMLElement | null }"
          class="char"
          :class="[item.status, { cursor: i === cursorPos, 'cursor-active': isFocused && i === cursorPos }]"
        >{{ item.char }}</span>
      </div>
    </div>

    <!-- ═══ Divider + Restart Button (when running) ═══ -->
    <template v-if="store.phase === 'running'">
      <hr class="passage-divider" />
      <div class="test-footer">
        <button class="restart-btn" aria-label="Restart test" @click="resetTest">
          Restart Test
          <Icon name="tabler:refresh" aria-hidden="true" class="restart-icon" />
        </button>
      </div>
    </template>

  </div>
</template>

<style lang="scss" scoped>
.test-area {
  width: 100%;
  padding: 2rem 5rem 4rem;
  display: flex;
  flex-direction: column;

  @media (max-width: 860px) {
    padding: 1.5rem 1.5rem 3rem;
  }

  @media (max-width: 600px) {
    padding: 1rem 1rem 2rem;
  }
}

// ─── Mobile controls (dropdowns) ─────────────────────
.mobile-controls {
  display: none;

  @media (max-width: 600px) {
    display: flex;
    justify-content: center;
    gap: 0.625rem;
    padding: 0.5rem 0 0.75rem;
  }
}

// ─── Stats + Controls Bar ────────────────────────────
.sc-bar {
  display: flex;
  align-items: center;
  padding: 1.5rem 0;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 600px) {
    padding: 0.75rem 0;
  }
}

.sc-stats {
  display: flex;
  align-items: center;
  flex-shrink: 0;

  @media (max-width: 600px) {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0;

    .sc-sep { display: none; }
  }
}

.stat-item {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;

  &.time-low .stat-value { color: var(--color-timer); }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}

.stat-label {
  font-size: 1rem;
  color: var(--color-text-dim);
  transition: color 0.3s ease;

  @media (max-width: 600px) {
    font-size: 0.8125rem;
  }
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
  transition: color 0.3s ease;

  &.val-error { color: var(--color-error); }

  @media (max-width: 600px) {
    font-size: 1.5rem;
  }
}

.timer-value { color: var(--color-timer); }

.sc-sep {
  width: 1px;
  height: 1.5rem;
  background-color: var(--color-divider);
  margin: 0 1.5rem;
  flex-shrink: 0;
}

// Desktop controls (hidden on mobile)
.desktop-controls {
  @media (max-width: 600px) {
    display: none !important;
  }
}

.sc-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-left: auto;
}

.ctrl-label {
  font-size: 1rem;
  color: var(--color-text-dim);
  white-space: nowrap;
  transition: color 0.3s ease;
}

.ctrl-group {
  display: flex;
  align-items: center;
}

.ctrl-vsep {
  width: 1px;
  height: 1.25rem;
  background-color: var(--color-divider);
  margin: 0 0.5rem;
  flex-shrink: 0;
}

.ctrl-btn {
  padding: 0.375rem 0.875rem;
  border: 1px solid var(--color-divider);
  background: transparent;
  color: var(--color-text-dim);
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  white-space: nowrap;
  border-radius: 0;

  &:first-child { border-radius: 6px 0 0 6px; }
  &:last-child  { border-radius: 0 6px 6px 0; }
  &:first-child:last-child { border-radius: 6px; }
  &:not(:first-child) { margin-left: -1px; }

  &:hover:not(:disabled) {
    color: var(--color-text);
    border-color: hsl(210, 100%, 65%);
    z-index: 1;
    position: relative;
  }

  // Active: blue border + blue text, no fill
  &.active {
    border-color: hsl(214, 100%, 55%);
    color: hsl(214, 100%, 55%);
    background: transparent;
    z-index: 1;
    position: relative;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--color-cursor);
    outline-offset: 2px;
    z-index: 2;
    position: relative;
  }

  &--sm {
    font-size: 0.8125rem;
    padding: 0.25rem 0.625rem;
  }
}

.bar-divider {
  border: none;
  border-top: 1px solid var(--color-divider);
  margin: 0;
}

// ─── Bonus Controls ──────────────────────────────────
.bonus-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.75rem 0 1rem;
  min-height: 2.5rem;

  @media (max-width: 600px) {
    display: none;
  }
}

// ─── Passage ─────────────────────────────────────────
.passage-wrapper {
  position: relative;
  cursor: text;
  padding: 1.5rem 2rem;

  @media (max-width: 600px) {
    padding: 1rem 0.35rem;
  }
}

.hidden-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 1px;
  height: 1px;
  overflow: hidden;
  resize: none;
  border: none;
  padding: 0;
}

.start-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.875rem;
  z-index: 2;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    color-mix(in oklch, var(--color-bg) 55%, transparent) 20%,
    color-mix(in oklch, var(--color-bg) 90%, transparent) 50%
  );
}

.start-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2.5rem;
  border-radius: 100px;
  border: none;
  background-color: hsl(214, 100%, 55%);
  color: #fff;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;

  &:hover { background-color: hsl(210, 100%, 65%); }
  &:active { transform: scale(0.97); }
  &:focus-visible { outline: 2px solid var(--color-cursor); outline-offset: 2px; }

  .iconify { width: 1rem; height: 1rem; }
}

.start-hint {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text);
}

.passage {
  font-size: 2rem;
  line-height: 1.65;
  letter-spacing: 0.01em;

  &.blurred {
    filter: blur(4px);
    user-select: none;
    pointer-events: none;
  }

  @media (max-width: 600px) {
    font-size: 1.375rem;
    line-height: 1.6;
  }
}

.char {
  white-space: pre-wrap;
  color: var(--color-text-dim);
  transition: color 0.05s;

  &.correct { color: var(--color-correct); }

  &.incorrect {
    color: var(--color-error);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 1px;
  }

  // Block cursor — matches design exactly
  &.cursor {
    background-color: var(--color-text-dim);
    color: var(--color-bg);
    border-radius: 2px;
  }

  &.cursor.cursor-active {
    animation: cursor-block-blink 1s step-end infinite;
  }
}

@keyframes cursor-block-blink {
  0%, 100% { background-color: var(--color-cursor); color: var(--color-bg); }
  50%       { background-color: transparent; color: inherit; }
}

// ─── Passage Divider + Footer ─────────────────────────
.passage-divider {
  border: none;
  border-top: 1px solid var(--color-divider);
  margin: 0;
}

.test-footer {
  display: flex;
  justify-content: center;
  padding: 1.5rem 0;
}

.restart-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 2rem;
  border-radius: 100px;
  border: 2px solid var(--color-text);
  background-color: var(--color-text);
  color: var(--color-bg);
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease;

  &:hover { background-color: transparent; color: var(--color-text); }
  &:active { transform: scale(0.97); }
  &:focus-visible { outline: 2px solid var(--color-cursor); outline-offset: 2px; }

  .restart-icon.iconify { width: 1.125rem; height: 1.125rem; }
}

// ─── Transitions ─────────────────────────────────────
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-fade-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.slide-fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { opacity: 0; transform: translateX(-8px); }
</style>
