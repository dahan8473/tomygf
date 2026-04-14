const charLeft = document.getElementById('char-left')
const charRight = document.getElementById('char-right')
const heartsContainer = document.getElementById('hearts-container')
const letterOverlay = document.getElementById('letter-overlay')
const envelopeFront = document.getElementById('envelope-front')
const letterContent = document.getElementById('letter-content')
const openBtn = document.getElementById('open-btn')
const nextLifeBtn = document.getElementById('next-life-btn')
const lifeLabel = document.getElementById('life-label')
const letterText = document.getElementById('letter-text')

const PROXIMITY_THRESHOLD = 160

// --- Lives ---
// Each life has its own images, emojis, background, and letter

const LIVES = [
  {
    left: '/assets/pucca.png',
    right: '/assets/garu.png',
    label: 'This Life',
    era: 'Now',
    flipLeft: false,
    flipRight: false,
    emojis: ['❤️', '💕', '💗', '💖', '💘', '💝', '💞', '🩷', '😘', '🥰'],
    bg: '#ffffff',
    bgPulse: '#fff5f7',
    flash: 'rgba(255, 150, 180, 0.4)',
    letter: `Dear [Name],<br><br>
      Happy anniversary! This is a placeholder for your heartfelt message.
      Replace this text with whatever you want to say.<br><br>
      Every moment with you is my favorite moment.<br><br>
      Love always,<br>
      [Your Name]`,
  },
  {
    left: '/assets/dog-left.png',
    right: '/assets/dog-right.png',
    label: 'Life #12',
    era: 'The Goodest Timeline',
    flipLeft: false,
    flipRight: true,
    emojis: ['🐶', '🐾', '🦴', '🐕', '❤️', '💕', '🐩', '🐕‍🦺', '🥺', '🐾'],
    bg: '#f5efe6',
    bgPulse: '#f0e5d3',
    flash: 'rgba(255, 200, 120, 0.4)',
    letter: `Dear [Name],<br><br>
      In this life we had four paws and the purest hearts.<br>
      We didn't need words. A tail wag said everything.<br><br>
      I'd find you in every dog park, in every life.<br><br>
      Woof always,<br>
      [Your Name]`,
  },
  {
    left: '/assets/pibble1.png',
    right: '/assets/pibble2.png',
    label: 'Life #7',
    era: 'If We Were Pibbles',
    flipLeft: false,
    flipRight: true,
    emojis: ['🐶', '🐾', '💖', '🥺', '😭', '❤️', '🫶', '💕', '🐕', '😍'],
    bg: '#f7f0f5',
    bgPulse: '#f0e0ec',
    flash: 'rgba(200, 150, 180, 0.4)',
    letter: `Dear [Name],<br><br>
      In this life we were the squishiest pibbles.<br>
      Wrinkly faces, tiny paws, one shared brain cell.<br><br>
      I'd still choose you. Every nap, every zoomie, every life.<br><br>
      Bork bork,<br>
      [Your Name]`,
  },
]

let currentLifeIndex = -1
let currentLife = null
let heartInterval = null
let letterShown = false
let isClose = false
let rainInterval = null
let dragCleanups = []

// --- Life Management ---

function pickRandomLife() {
  let idx
  do {
    idx = Math.floor(Math.random() * LIVES.length)
  } while (idx === currentLifeIndex && LIVES.length > 1)
  currentLifeIndex = idx
  return LIVES[idx]
}

function loadLife(life) {
  currentLife = life

  // Reset state
  stopHearts()
  isClose = false
  letterShown = false
  letterOverlay.classList.add('hidden')
  heartsContainer.innerHTML = ''
  charLeft.classList.remove('excited')
  charRight.classList.remove('excited')

  // Clean up old drag listeners
  dragCleanups.forEach(fn => fn())
  dragCleanups = []

  // Set characters with facing direction
  charLeft.innerHTML = `<img src="${life.left}" alt="Left" draggable="false" style="${life.flipLeft ? 'transform: scaleX(-1)' : ''}" />`
  charRight.innerHTML = `<img src="${life.right}" alt="Right" draggable="false" style="${life.flipRight ? 'transform: scaleX(-1)' : ''}" />`

  // Set label
  lifeLabel.textContent = life.label
  lifeLabel.dataset.era = life.era

  // Set background
  document.body.style.backgroundColor = life.bg
  document.body.classList.remove('love-mode')
  document.documentElement.style.setProperty('--bg', life.bg)
  document.documentElement.style.setProperty('--bg-pulse', life.bgPulse)
  document.documentElement.style.setProperty('--flash-color', life.flash)

  // Set letter text
  letterText.innerHTML = life.letter

  // Reset positions
  charLeft.style.cssText = ''
  charRight.style.cssText = ''
  charLeft.removeAttribute('data-initialized')
  charRight.removeAttribute('data-initialized')

  // Fade in
  document.getElementById('stage').classList.add('fade-in')
  lifeLabel.classList.add('fade-in')
  setTimeout(() => {
    document.getElementById('stage').classList.remove('fade-in')
    lifeLabel.classList.remove('fade-in')
  }, 600)

  // Make draggable
  makeDraggable(charLeft)
  makeDraggable(charRight)
}

function getEmoji() {
  const emojis = currentLife ? currentLife.emojis : ['❤️']
  return emojis[Math.floor(Math.random() * emojis.length)]
}

// --- Drag & Drop ---

function makeDraggable(el) {
  let isDragging = false
  let offsetX = 0
  let offsetY = 0

  function initPosition() {
    if (el.dataset.initialized) return
    const rect = el.getBoundingClientRect()
    el.style.position = 'fixed'
    el.style.left = rect.left + 'px'
    el.style.top = rect.top + 'px'
    el.style.right = 'auto'
    el.style.bottom = 'auto'
    el.dataset.initialized = '1'
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

  dragCleanups.push(() => {
    el.removeEventListener('pointerdown', onPointerDown)
    el.removeEventListener('pointermove', onPointerMove)
    el.removeEventListener('pointerup', onPointerUp)
    el.removeEventListener('pointercancel', onPointerUp)
  })
}

// --- Proximity Detection ---

function getCenter(el) {
  const rect = el.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

function checkProximity() {
  const p = getCenter(charLeft)
  const g = getCenter(charRight)
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
  charLeft.classList.add('excited')
  charRight.classList.add('excited')
  document.body.classList.add('love-mode')

  const cx = (p.x + g.x) / 2
  const cy = (p.y + g.y) / 2
  explodeHearts(cx, cy)
  screenFlash()

  heartInterval = setInterval(() => {
    const pp = getCenter(charLeft)
    const gg = getCenter(charRight)
    const mx = (pp.x + gg.x) / 2
    const my = (pp.y + gg.y) / 2
    spawnHeart(mx, my, 'float')
    if (Math.random() > 0.6) spawnHeart(mx, my, 'float')
  }, 150)

  startHeartRain()

  if (!letterShown) {
    letterShown = true
    setTimeout(() => showLetter(), 1200)
  }
}

function onCharactersSeparate() {
  charLeft.classList.remove('excited')
  charRight.classList.remove('excited')
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
      heart.textContent = getEmoji()

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
  heart.textContent = getEmoji()

  const spread = 100
  heart.style.left = (cx + (Math.random() - 0.5) * spread) + 'px'
  heart.style.top = (cy + (Math.random() - 0.5) * spread * 0.4) + 'px'
  heart.style.fontSize = (16 + Math.random() * 20) + 'px'

  heartsContainer.appendChild(heart)
  heart.addEventListener('animationend', () => heart.remove())
}

// --- Heart Rain ---

function startHeartRain() {
  if (rainInterval) return
  rainInterval = setInterval(() => {
    if (!isClose) return
    const heart = document.createElement('div')
    heart.className = 'heart rain'
    heart.textContent = getEmoji()
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

nextLifeBtn.addEventListener('click', () => {
  letterOverlay.classList.add('hidden')
  stopHearts()
  document.getElementById('stage').style.opacity = '0'
  setTimeout(() => {
    loadLife(pickRandomLife())
    document.getElementById('stage').style.opacity = '1'
  }, 400)
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

// --- Init ---

loadLife(pickRandomLife())
