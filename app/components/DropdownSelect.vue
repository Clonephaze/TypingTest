<script setup lang="ts">
interface Option {
  value: string
  label: string
}

const props = defineProps<{
  options: Option[]
  modelValue: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(() =>
  props.options.find(o => o.value === props.modelValue)?.label ?? '',
)

function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function select(value: string) {
  emit('update:modelValue', value)
  isOpen.value = false
}

function handleClickOutside(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

const { app } = useRuntimeConfig()
const base = app.baseURL
</script>

<template>
  <div ref="wrapperRef" class="dropdown-select" :class="{ open: isOpen, disabled }">
    <button class="dropdown-trigger" :disabled="disabled" @click="toggle">
      <span class="dropdown-trigger-text">{{ selectedLabel }}</span>
      <img :src="`${base}images/icon-down-arrow.svg`" alt="" aria-hidden="true" class="dropdown-arrow" />
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu">
        <button
          v-for="opt in options"
          :key="opt.value"
          class="dropdown-option"
          :class="{ selected: modelValue === opt.value }"
          @click="select(opt.value)"
        >
          <span class="radio-dot" />
          <span>{{ opt.label }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.dropdown-select {
  position: relative;
  display: inline-flex;

  &.disabled { opacity: 0.4; pointer-events: none; }
}

.dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 100px;
  border: 1px solid var(--color-divider);
  background: transparent;
  color: var(--color-text);
  font-family: inherit;
  font-size: clamp(0.75rem, 2.5vw, 0.875rem);
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s ease;
  white-space: nowrap;

  &:hover { border-color: var(--color-text-dim); }
  &:focus-visible { outline: 2px solid var(--color-cursor); outline-offset: 2px; }

  @media (max-width: 400px) {
    padding: 0.375rem 0.75rem;
    gap: 0.375rem;
  }
}

.dropdown-arrow {
  width: 12px;
  height: 12px;
  transition: transform 0.2s ease;

  .open & { transform: rotate(180deg); }
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 100%;
  background-color: var(--color-reset-bg);
  border: 1px solid var(--color-divider);
  border-radius: 12px;
  padding: 0.375rem 0;
  z-index: 20;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.dropdown-option {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.625rem 1rem;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover { background-color: color-mix(in oklch, var(--color-divider) 30%, transparent); }
}

.radio-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--color-divider);
  flex-shrink: 0;
  position: relative;
  transition: border-color 0.15s ease;

  .selected & {
    border-color: hsl(214, 100%, 55%);

    &::after {
      content: '';
      position: absolute;
      inset: 2px;
      border-radius: 50%;
      background-color: hsl(214, 100%, 55%);
    }
  }
}

// Transition
.dropdown-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.dropdown-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
