const pucca = document.getElementById('pucca')
const garu = document.getElementById('garu')
const heartsContainer = document.getElementById('hearts-container')
const letterOverlay = document.getElementById('letter-overlay')
const envelopeFront = document.getElementById('envelope-front')
const letterContent = document.getElementById('letter-content')
const openBtn = document.getElementById('open-btn')
const closeBtn = document.getElementById('close-btn')

const PROXIMITY_THRESHOLD = 160
const HEART_EMOJIS = ['❤️', '💕', '💗', '💖', '💘', '💝', '💞', '🩷', '😘', '🥰']

let heartInterval = null
let letterShown = false
let hasExploded = false
let isClose = false

// --- Drag & Drop ---

function makeDraggable(el) {
  let isDragging = false
  let offsetX = 0
  let offsetY = 0
  let initialized = false

  function initPosition() {
    if (initialized) return
    const rect = el.getBoundingClientRect()
    el.style.position = 'fixed'
    el.style.left = rect.left + 'px'
    el.style.top = rect.top + 'px'
    el.style.right = 'auto'
    el.style.transform = 'none'
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

    el.style.left = (e.clientX - offsetX) + 'px'
    el.style.top = (e.clientY - offsetY) + 'px'

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
    if (!isClose) {
      isClose = true
      onCharactersMeet(p, g)
    }
  } else {
    if (isClose) {
      isClose = false
      onCharactersSeparate()
    }
  }
}

function onCharactersMeet(p, g) {
  // Wiggle characters
  pucca.classList.add('excited')
  garu.classList.add('excited')
  document.body.classList.add('love-mode')

  // Massive heart explosion
  const cx = (p.x + g.x) / 2
  const cy = (p.y + g.y) / 2
  explodeHearts(cx, cy)
  screenFlash()

  // Continuous floating hearts
  heartInterval = setInterval(() => {
    const pp = getCenter(pucca)
    const gg = getCenter(garu)
    const mx = (pp.x + gg.x) / 2
    const my = (pp.y + gg.y) / 2
    spawnHeart(mx, my, 'float')
    if (Math.random() > 0.6) spawnHeart(mx, my, 'float')
  }, 150)

  // Heart rain from top of screen
  startHeartRain()

  // Show letter after a beat
  if (!letterShown) {
    letterShown = true
    setTimeout(() => showLetter(), 1200)
  }
}

function onCharactersSeparate() {
  pucca.classList.remove('excited')
  garu.classList.remove('excited')
  document.body.classList.remove('love-mode')
  stopHearts()
}

// --- Heart Explosion ---

function explodeHearts(cx, cy) {
  const count = 40
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const heart = document.createElement('div')
      heart.className = 'heart explode'

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
      const distance = 80 + Math.random() * 180
      const dx = Math.cos(angle) * distance
      const dy = Math.sin(angle) * distance
      const rot = (Math.random() - 0.5) * 360

      heart.style.setProperty('--dx', dx + 'px')
      heart.style.setProperty('--dy', dy + 'px')
      heart.style.setProperty('--rot', rot + 'deg')
      heart.style.left = cx + 'px'
      heart.style.top = cy + 'px'
      heart.style.fontSize = (20 + Math.random() * 28) + 'px'
      heart.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)]

      heartsContainer.appendChild(heart)
      heart.addEventListener('animationend', () => heart.remove())
    }, i * 25)
  }
}

function screenFlash() {
  const flash = document.createElement('div')
  flash.className = 'screen-flash'
  document.body.appendChild(flash)
  flash.addEventListener('animationend', () => flash.remove())
}

// --- Floating Hearts ---

function spawnHeart(cx, cy, type) {
  const heart = document.createElement('div')
  heart.className = 'heart ' + type
  heart.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)]

  const spread = 100
  heart.style.left = (cx + (Math.random() - 0.5) * spread) + 'px'
  heart.style.top = (cy + (Math.random() - 0.5) * spread * 0.4) + 'px'
  heart.style.fontSize = (16 + Math.random() * 20) + 'px'

  heartsContainer.appendChild(heart)
  heart.addEventListener('animationend', () => heart.remove())
}

// --- Heart Rain ---

let rainInterval = null

function startHeartRain() {
  if (rainInterval) return
  rainInterval = setInterval(() => {
    if (!isClose) return
    const heart = document.createElement('div')
    heart.className = 'heart rain'
    heart.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)]
    heart.style.left = (Math.random() * window.innerWidth) + 'px'
    heart.style.top = '-30px'
    heart.style.fontSize = (14 + Math.random() * 24) + 'px'
    heart.style.setProperty('--rot', (Math.random() * 360) + 'deg')
    heartsContainer.appendChild(heart)
    heart.addEventListener('animationend', () => heart.remove())
  }, 120)
}

function stopHearts() {
  if (heartInterval) {
    clearInterval(heartInterval)
    heartInterval = null
  }
  if (rainInterval) {
    clearInterval(rainInterval)
    rainInterval = null
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

let hintDismissed = false
document.addEventListener('pointerdown', () => {
  if (!hintDismissed) {
    hintDismissed = true
    setTimeout(() => { hint.style.opacity = '0' }, 1500)
  }
})
