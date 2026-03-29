<script setup lang="ts">
const store = useTypingStore()
const { app } = useRuntimeConfig()
const base = app.baseURL
const testAreaRef = ref<{ resetTest: () => void } | null>(null)
const focusedMode = ref(false)

useHead({
  title: 'Typing Speed Test',
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap' },
  ],
})

function handleReset() {
  testAreaRef.value?.resetTest()
}
</script>

<template>
  <ClientOnly>
    <Confetti v-if="store.isNewPersonalBest && store.phase === 'complete'" />
  </ClientOnly>

  <header>
    <div class="logo-info">
      <img :src="`${base}images/logo-small.svg`" alt="" class="logo-img" aria-hidden="true" />
      <div class="logo-text">
        <span class="logo-title">Typing Speed Test</span>
        <span class="logo-subtitle">Type as fast as you can in 60 seconds</span>
      </div>
    </div>

    <div class="header-right">
      <div class="personal-best">
        <SVGSPersonalBest class="pb-icon" />
        <span class="pb-label desktop-only">Personal best:</span>
        <span class="pb-label mobile-only">Best:</span>
        <span class="pb-value">{{ store.personalBest?.wpm ?? 0 }} WPM</span>
      </div>
      <div class="hdr-divider desktop-only" aria-hidden="true" />
      <div class="desktop-only"><ThemeSelector /></div>
      <button
        class="focus-toggle desktop-only"
        :title="focusedMode ? 'Wide layout' : 'Focused layout'"
        :aria-label="focusedMode ? 'Switch to wide layout' : 'Switch to focused layout'"
        @click="focusedMode = !focusedMode"
      >
        <Icon :name="focusedMode ? 'tabler:layout-sidebar' : 'tabler:layout-distribute-horizontal'" aria-hidden="true" />
      </button>
    </div>
  </header>

  <main :class="{ focused: focusedMode }">
    <TestArea ref="testAreaRef" v-show="store.phase !== 'complete'" />
    <ReportArea v-show="store.phase === 'complete'" @reset="handleReset" />
  </main>

  <!-- Mobile floating theme selector -->
  <div class="mobile-theme-fab">
    <ThemeSelector />
  </div>
</template>

<style lang="scss">
// ─── Responsive utilities ───────────────────────────
.desktop-only { display: flex !important; }
.mobile-only  { display: none !important; }

@media (max-width: 600px) {
  .desktop-only { display: none !important; }
  .mobile-only  { display: inline !important; }
}

header {
  display: flex;
  align-items: center;
  padding: 1.5rem 5rem;
  gap: 1.5rem;

  .logo-info {
    display: flex;
    align-items: center;
    gap: 0.875rem;
  }

  .logo-img {
    width: 48px;
    height: 48px;
  }

  .logo-text {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .logo-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);
    transition: color 0.3s ease;
  }

  .logo-subtitle {
    font-size: 0.75rem;
    color: var(--color-text-dim);
    transition: color 0.3s ease;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 0;
    margin-left: auto;
  }

  .hdr-divider {
    width: 1px;
    height: 1.25rem;
    background-color: var(--color-divider);
    flex-shrink: 0;
    margin: 0 1.5rem;
  }

  .personal-best {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-right: 1.5rem;
  }

  .pb-label {
    font-size: 0.875rem;
    color: var(--color-text-dim);
    transition: color 0.3s ease;
  }

  .pb-value {
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--color-text);
    transition: color 0.3s ease;
  }

  // Override ThemeSelector's own quirky margins so it sits flush in our layout
  .theme-wrapper {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  .focus-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 8px;
    border: 1px solid var(--color-divider);
    background: transparent;
    color: var(--color-text-dim);
    cursor: pointer;
    margin-left: 0.75rem;
    transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;

    &:hover {
      color: var(--color-text);
      border-color: var(--color-text-dim);
      background-color: var(--color-reset-bg);
    }

    &:focus-visible {
      outline: 2px solid var(--color-cursor);
      outline-offset: 2px;
    }

    .iconify {
      width: 1.125rem;
      height: 1.125rem;
    }
  }

  // ─── Mobile header ──────────────────────────────────
  @media (max-width: 600px) {
    padding: 1rem 1.25rem;
    gap: 0.5rem;

    .logo-img {
      width: 36px;
      height: 36px;
    }

    .logo-text { display: none; }

    .personal-best {
      padding-right: 0;
    }

    .pb-value {
      font-weight: 700;
    }
  }

  @media (min-width: 601px) and (max-width: 900px) {
    padding: 1rem 1.5rem;
    gap: 0.75rem;

    .logo-subtitle { display: none; }
    .pb-label.desktop-only { display: none !important; }
    .pb-label.mobile-only { display: inline !important; }
  }
}

// Focused mode: constrain layout to a narrower width
main.focused {
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;

  .test-area,
  .report-area {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

// ─── Mobile floating theme selector ──────────────────
.mobile-theme-fab {
  display: none;

  @media (max-width: 600px) {
    display: block;
    position: fixed;
    bottom: 1.25rem;
    right: 1.25rem;
    z-index: 50;

    // Override the theme-wrapper styles for this context
    .theme-wrapper {
      margin: 0 !important;
      width: 40px !important;
      height: 40px !important;
    }

    .theme-menu {
      bottom: 100%;
      right: 0;
      top: auto;
      margin-bottom: 0.5rem;
    }

    .theme-wrapper > span { display: none; }
  }
}
</style>