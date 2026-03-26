<script setup lang="ts">
const store = useTypingStore()

const W = 600
const H = 160
const PAD_L = 40
const PAD_R = 16
const PAD_T = 16
const PAD_B = 32

const recent = computed(() => store.history.slice(-30))

const maxWpm = computed(() => Math.max(...recent.value.map(r => r.wpm), 1))
const minWpm = computed(() => Math.min(...recent.value.map(r => r.wpm), 0))

function xPos(i: number) {
  const n = recent.value.length
  return PAD_L + (i / (n - 1)) * (W - PAD_L - PAD_R)
}

function yPos(wpm: number) {
  const range = maxWpm.value - minWpm.value || 1
  return PAD_T + (1 - (wpm - minWpm.value) / range) * (H - PAD_T - PAD_B)
}

const polylinePoints = computed(() =>
  recent.value.map((r, i) => `${xPos(i)},${yPos(r.wpm)}`).join(' '),
)

const dots = computed(() =>
  recent.value.map((r, i) => ({ cx: xPos(i), cy: yPos(r.wpm), wpm: r.wpm })),
)

// Y grid lines (max, mid, min)
const gridY = computed(() => {
  const mid = Math.round((maxWpm.value + minWpm.value) / 2)
  return [
    { y: yPos(maxWpm.value), label: String(maxWpm.value) },
    { y: yPos(mid), label: String(mid) },
    { y: yPos(minWpm.value), label: String(minWpm.value) },
  ]
})

const hoveredIndex = ref<number | null>(null)
</script>

<template>
  <div class="history-chart">
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      preserveAspectRatio="xMidYMid meet"
      class="chart-svg"
      role="img"
      aria-label="WPM performance chart over last tests"
    >
      <!-- Grid lines -->
      <line
        v-for="g in gridY"
        :key="g.label"
        :x1="PAD_L"
        :y1="g.y"
        :x2="W - PAD_R"
        :y2="g.y"
        class="grid-line"
      />
      <!-- Y axis labels -->
      <text
        v-for="g in gridY"
        :key="'lbl-' + g.label"
        :x="PAD_L - 6"
        :y="g.y + 4"
        class="axis-label"
        text-anchor="end"
      >{{ g.label }}</text>

      <!-- Area fill -->
      <defs>
        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--color-btn)" stop-opacity="0.3" />
          <stop offset="100%" stop-color="var(--color-btn)" stop-opacity="0" />
        </linearGradient>
      </defs>
      <polygon
        v-if="recent.length >= 2"
        :points="`${PAD_L},${H - PAD_B} ${polylinePoints} ${xPos(recent.length - 1)},${H - PAD_B}`"
        fill="url(#area-grad)"
      />

      <!-- Line -->
      <polyline
        v-if="recent.length >= 2"
        :points="polylinePoints"
        class="chart-line"
        fill="none"
      />

      <!-- Dots -->
      <g v-for="(d, i) in dots" :key="i">
        <circle
          :cx="d.cx"
          :cy="d.cy"
          r="5"
          class="chart-dot"
          :class="{ hovered: hoveredIndex === i }"
          @mouseenter="hoveredIndex = i"
          @mouseleave="hoveredIndex = null"
        />
        <!-- Tooltip -->
        <g v-if="hoveredIndex === i">
          <rect
            :x="d.cx - 24"
            :y="d.cy - 28"
            width="48"
            height="20"
            rx="4"
            class="tooltip-bg"
          />
          <text :x="d.cx" :y="d.cy - 14" class="tooltip-text" text-anchor="middle">
            {{ d.wpm }} WPM
          </text>
        </g>
      </g>

      <!-- X label -->
      <text :x="W / 2" :y="H - 4" class="axis-label" text-anchor="middle">
        Last {{ recent.length }} tests
      </text>
    </svg>
  </div>
</template>

<style lang="scss" scoped>
.history-chart {
  width: 100%;
  overflow-x: auto;
}

.chart-svg {
  width: 100%;
  height: auto;
  min-width: 300px;
}

.grid-line {
  stroke: var(--color-divider);
  stroke-width: 1;
}

.chart-line {
  stroke: var(--color-btn);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart-dot {
  fill: var(--color-btn);
  cursor: pointer;
  transition: r 0.1s ease;

  &.hovered {
    r: 7;
    fill: var(--color-btn-hover);
  }
}

.axis-label {
  fill: var(--color-text-dim);
  font-family: Sora, sans-serif;
  font-size: 10px;
}

.tooltip-bg {
  fill: var(--color-reset-bg);
  stroke: var(--color-divider);
  stroke-width: 1;
}

.tooltip-text {
  fill: var(--color-text);
  font-family: Sora, sans-serif;
  font-size: 10px;
  font-weight: 600;
}
</style>
