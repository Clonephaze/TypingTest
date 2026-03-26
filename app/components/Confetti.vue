<script setup lang="ts">
const canvasRef = ref<HTMLCanvasElement | null>(null)

interface Particle {
  x: number; y: number
  vx: number; vy: number
  color: string
  w: number; h: number
  rotation: number; rotSpeed: number
}

const COLORS = ['#4ca6ff', '#f4dc73', '#7bcc8d', '#ff7b7b', '#c084fc', '#fb923c', '#34d399']
const COUNT = 200

let particles: Particle[] = []
let animId = 0
let startTime = 0

function createParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: -20 - Math.random() * 80,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 3 + 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    w: Math.random() * 10 + 5,
    h: Math.random() * 6 + 3,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.15,
  }
}

function tick() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  const cw = canvas.width
  const ch = canvas.height

  const elapsed = (Date.now() - startTime) / 1000
  const globalAlpha = elapsed > 3 ? Math.max(0, 1 - (elapsed - 3) / 2.5) : 1

  ctx.clearRect(0, 0, cw, ch)

  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.04
    p.rotation += p.rotSpeed

    ctx.save()
    ctx.globalAlpha = globalAlpha
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rotation)
    ctx.fillStyle = p.color
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
    ctx.restore()
  }

  particles = particles.filter(p => p.y < ch + 40)

  if (elapsed < 5.5 && particles.length > 0) {
    animId = requestAnimationFrame(tick)
  }
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
  const canvas = canvasRef.value!
  startTime = Date.now()
  for (let i = 0; i < COUNT; i++) particles.push(createParticle(canvas.width, canvas.height))
  animId = requestAnimationFrame(tick)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <canvas ref="canvasRef" class="confetti-canvas" aria-hidden="true" />
</template>

<style scoped>
.confetti-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
}
</style>
