const pucca = document.getElementById('pucca')
const garu = document.getElementById('garu')
const heartsContainer = document.getElementById('hearts-container')
const letterOverlay = document.getElementById('letter-overlay')
const envelopeFront = document.getElementById('envelope-front')
const letterContent = document.getElementById('letter-content')
const openBtn = document.getElementById('open-btn')
const closeBtn = document.getElementById('close-btn')

const PROXIMITY_THRESHOLD = 150
let heartInterval = null
let letterShown = false

// --- Drag & Drop ---

function makeDraggable(el) {
  let isDragging = false
  let offsetX = 0
  let offsetY = 0
  let currentX = 0
  let currentY = 0
  let startLeft = 0
  let startTop = 0
  let initialized = false

  function initPosition() {
    if (initialized) return
    const rect = el.getBoundingClientRect()
    startLeft = rect.left
    startTop = rect.top
    // Remove CSS positioning and use transform
    el.style.position = 'fixed'
    el.style.left = startLeft + 'px'
    el.style.top = startTop + 'px'
    el.style.right = 'auto'
    el.style.transform = el.id === 'pucca' ? 'scaleX(-1)' : 'none'
    currentX = 0
    currentY = 0
    initialized = true
  }

  function onPointerDown(e) {
    initPosition()
    isDragging = true
    el.classList.add('dragging')
    el.setPointerCapture(e.pointerId)

    const rect = el.getBoundingClientRect()
    offsetX = e.clientX - rect.left
    offsetY = e.clientY - rect.top
  }

  function onPointerMove(e) {
    if (!isDragging) return
    e.preventDefault()

    const newLeft = e.clientX - offsetX
    const newTop = e.clientY - offsetY

    el.style.left = newLeft + 'px'
    el.style.top = newTop + 'px'

    checkProximity()
  }

  function onPointerUp() {
    isDragging = false
    el.classList.remove('dragging')
  }

  el.addEventListener('pointerdown', onPointerDown)
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerup', onPointerUp)
  el.addEventListener('pointercancel', onPointerUp)
}

makeDraggable(pucca)
makeDraggable(garu)

// --- Proximity Detection ---

function getCenter(el) {
  const rect = el.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

function checkProximity() {
  const p = getCenter(pucca)
  const g = getCenter(garu)
  const dist = Math.hypot(p.x - g.x, p.y - g.y)

  if (dist < PROXIMITY_THRESHOLD) {
    if (!heartInterval) {
      startHearts(p, g)
    }
    if (!letterShown) {
      letterShown = true
      showLetter()
    }
  } else {
    stopHearts()
  }
}

// --- Heart Particles ---

function spawnHeart(cx, cy) {
  const heart = document.createElement('div')
  heart.className = 'heart'
  heart.textContent = ['❤️', '💕', '💗', '💖', '💘'][Math.floor(Math.random() * 5)]

  const spread = 80
  const x = cx + (Math.random() - 0.5) * spread
  const y = cy + (Math.random() - 0.5) * spread * 0.5

  heart.style.left = x + 'px'
  heart.style.top = y + 'px'
  heart.style.fontSize = (18 + Math.random() * 16) + 'px'

  heartsContainer.appendChild(heart)

  heart.addEventListener('animationend', () => heart.remove())
}

function startHearts(p, g) {
  const cx = (p.x + g.x) / 2
  const cy = (p.y + g.y) / 2

  // Initial burst
  for (let i = 0; i < 12; i++) {
    setTimeout(() => spawnHeart(cx, cy), i * 60)
  }

  // Continuous hearts
  heartInterval = setInterval(() => {
    const pp = getCenter(pucca)
    const gg = getCenter(garu)
    const mx = (pp.x + gg.x) / 2
    const my = (pp.y + gg.y) / 2
    spawnHeart(mx, my)
  }, 250)
}

function stopHearts() {
  if (heartInterval) {
    clearInterval(heartInterval)
    heartInterval = null
  }
}

// --- Letter ---

function showLetter() {
  letterOverlay.classList.remove('hidden')
  envelopeFront.style.display = 'block'
  letterContent.classList.add('hidden')
}

openBtn.addEventListener('click', () => {
  envelopeFront.style.display = 'none'
  letterContent.classList.remove('hidden')
})

closeBtn.addEventListener('click', () => {
  letterOverlay.classList.add('hidden')
  letterShown = false
})

// --- Hint ---

const hint = document.createElement('div')
hint.className = 'hint'
hint.textContent = 'drag them together'
document.body.appendChild(hint)

// Fade hint after first drag
let hintDismissed = false
document.addEventListener('pointerdown', () => {
  if (!hintDismissed) {
    hintDismissed = true
    setTimeout(() => { hint.style.opacity = '0' }, 1500)
  }
})
