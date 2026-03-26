<script setup lang="ts">
const store = useTypingStore()

// QWERTY layout rows. Each entry: [displayLabel, lookupKey]
const rows: [string, string][][] = [
  [['1','1'],['2','2'],['3','3'],['4','4'],['5','5'],['6','6'],['7','7'],['8','8'],['9','9'],['0','0'],['-','-'],['=','=']],
  [['Q','q'],['W','w'],['E','e'],['R','r'],['T','t'],['Y','y'],['U','u'],['I','i'],['O','o'],['P','p'],['[','['],  [']',']']],
  [['A','a'],['S','s'],['D','d'],['F','f'],['G','g'],['H','h'],['J','j'],['K','k'],['L','l'],[';',';'],['\'',"'"]],
  [['Z','z'],['X','x'],['C','c'],['V','v'],['B','b'],['N','n'],['M','m'],[',',','],['.','.'],['/','/']],
  [['Space',' ']],
]

const maxPress = computed(() =>
  Math.max(...Object.values(store.keyPressCount), 1),
)

function pressIntensity(key: string): number {
  return (store.keyPressCount[key] ?? 0) / maxPress.value
}

function errorRate(key: string): number {
  const presses = store.keyPressCount[key] ?? 0
  if (presses === 0) return 0
  return (store.keyErrorCount[key] ?? 0) / presses
}

function keyStyle(key: string) {
  const intensity = pressIntensity(key)
  const errRate = errorRate(key)
  if (intensity === 0) return {}

  // Blend between btn color (lots of correct) and error color (lots of errors)
  const r = errRate
  // Use CSS color-mix via inline style won't work easily; use opacity layers instead
  return {
    '--intensity': intensity,
    '--error-rate': r,
  }
}

const hoveredKey = ref<string | null>(null)
</script>

<template>
  <div class="heatmap">
    <div
      v-for="(row, ri) in rows"
      :key="ri"
      class="heatmap-row"
      :class="{ 'row-indent': ri === 1, 'row-indent-2': ri === 2, 'row-indent-3': ri === 3 }"
    >
      <div
        v-for="([label, key]) in row"
        :key="key"
        class="heatmap-key"
        :class="{
          'key-space': label === 'Space',
          'key-active': pressIntensity(key) > 0,
          'key-hovered': hoveredKey === key,
        }"
        :style="keyStyle(key)"
        :title="`${label}: ${store.keyPressCount[key] ?? 0} presses, ${store.keyErrorCount[key] ?? 0} errors`"
        @mouseenter="hoveredKey = key"
        @mouseleave="hoveredKey = null"
      >
        <span class="key-label">{{ label }}</span>
        <span v-if="hoveredKey === key && (store.keyPressCount[key] ?? 0) > 0" class="key-tooltip">
          {{ store.keyPressCount[key] ?? 0 }}p / {{ store.keyErrorCount[key] ?? 0 }}e
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.heatmap {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.75rem;
  padding-bottom: 0.25rem;
  width: 100%;
}

.heatmap-row {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.heatmap-key {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 0;
  max-width: 2.75rem;
  aspect-ratio: 1;
  border-radius: 5px;
  border: 1px solid var(--color-divider);
  background-color: var(--color-bg);
  color: var(--color-text-dim);
  cursor: default;
  transition: background-color 0.2s, border-color 0.2s;

  &.key-space {
    flex: 0 0 35%;
    max-width: 14rem;
    aspect-ratio: auto;
    height: 2.25rem;

    @media (max-width: 600px) {
      height: 2rem;
    }
  }

  // Heat overlay via a layered approach using opacity
  &.key-active {
    background-color: color-mix(
      in oklch,
      var(--color-btn) calc(var(--intensity, 0) * 60%),
      var(--color-reset-bg)
    );
    border-color: color-mix(
      in oklch,
      var(--color-error) calc(var(--error-rate, 0) * 100%),
      var(--color-divider)
    );
    color: color-mix(in oklch, var(--color-text) calc(var(--intensity, 0) * 100%), var(--color-text-dim));
  }

  &.key-hovered {
    border-color: var(--color-cursor);
    z-index: 10;
  }
}

.key-label {
  font-size: clamp(0.5rem, 1.8vw, 0.7rem);
  font-weight: 600;
  line-height: 1;
  user-select: none;
}

.key-tooltip {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-reset-bg);
  border: 1px solid var(--color-divider);
  border-radius: 4px;
  padding: 0.2rem 0.4rem;
  font-size: 0.6rem;
  white-space: nowrap;
  color: var(--color-text);
  pointer-events: none;
  z-index: 20;
}
</style>
