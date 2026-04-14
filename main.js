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

const BASE_THRESHOLD = Math.min(160, window.innerWidth * 0.15)

// --- Lives ---
// Each life has its own images, emojis, background, and letter

const LIVES = [
  {
    left: '/assets/garu.png',
    right: '/assets/pucca.png',
    label: 'This Life',
    era: 'Now',

    emojis: ['❤️', '💕', '💗', '💖', '💘', '💝', '💞', '🩷', '😘', '🥰'],
    bg: '#ffffff',
    bgPulse: '#fff5f7',
    flash: 'rgba(255, 150, 180, 0.4)',
    letter: `Dear Alice,<br><br>
      If I had 100 more lives, I'd always choose the one with you.<br><br>
      Happy 1 Year Anniversary!!<br><br>
      From David`,
  },
  {
    left: '/assets/dog-left.png',
    right: '/assets/dog-right.png',
    label: 'Life #12',
    era: 'The Goodest Timeline',

    emojis: ['🐶', '🐾', '🦴', '🐕', '❤️', '💕', '🐩', '🐕‍🦺', '🥺', '🐾'],
    bg: '#f5efe6',
    bgPulse: '#f0e5d3',
    flash: 'rgba(255, 200, 120, 0.4)',
    letter: `Dear Alice,<br><br>
      Grow old along with me, the best is yet to be!!<br><br>
      Happy 1 Year Anniversary!!<br><br>
      From David`,
  },
  {
    left: '/assets/pibble1.png',
    right: '/assets/pibble2.png',
    label: 'Life #7',
    era: 'If We Were Pibbles',

    emojis: ['🐶', '🐾', '💖', '🥺', '😭', '❤️', '🫶', '💕', '🐕', '😍'],
    bg: '#f7f0f5',
    bgPulse: '#f0e0ec',
    flash: 'rgba(200, 150, 180, 0.4)',
    letter: `Dear Alice,<br><br>
      Whatever our souls are made of, yours and mine are the same.<br><br>
      Happy 1 Year Anniversary!!<br><br>
      From David`,
  },
  {
    left: '/assets/cat1.png',
    right: '/assets/cat2.png',
    label: 'Life #42',
    era: 'If We Were Cats',
    emojis: ['🐱', '🐾', '🌹', '💐', '❤️', '😻', '🐈', '💕', '🥀', '😽'],
    bg: '#fff8f0',
    bgPulse: '#ffe8d6',
    flash: 'rgba(255, 180, 100, 0.4)',
    letter: `Dear Alice,<br><br>
      If I had 9 lives, I'd spend all 9 with you.<br><br>
      Happy 1 Year Anniversary!!<br><br>
      From David`,
  },
  {
    left: '/assets/moth.png',
    right: '/assets/candle.png',
    label: 'Life #∞',
    era: 'Moth to a Flame',
    emojis: ['🔥', '🕯️', '✨', '💛', '🦋', '💫', '🌟', '⭐', '💥', '❤️‍🔥'],
    bg: '#0a0a0a',
    bgPulse: '#1a1008',
    flash: 'rgba(255, 180, 50, 0.5)',
    dark: true,
    rightFixed: true,
    letter: `Dear Alice,<br><br>
      My love for you is like a moth to a flame.<br><br>
      Happy 1 Year Anniversary!!<br><br>
      From David`,
  },
  {
    left: '/assets/monkey1.png',
    right: '/assets/monkey2.png',
    label: 'Life #1,000',
    era: 'In Every Age',
    emojis: ['🐒', '🐵', '🍌', '❤️', '💕', '🌴', '💛', '🫶', '🥰', '🌺'],
    bg: '#f5f0e8',
    bgPulse: '#ede5d5',
    flash: 'rgba(200, 180, 100, 0.4)',
    letter: `Dear Alice,<br><br>
      I have loved you in numberless forms, numberless times, in life after life, in age after age, forever.<br><br>
      Happy 1 Year Anniversary!!<br><br>
      From David`,
  },
  {
    left: '/assets/dino1.png',
    right: '/assets/dino2.png',
    label: 'Life #0',
    era: '65 Million Years Ago',
    emojis: ['🦕', '🌋', '🔥', '❤️', '💕', '☄️', '🦖', '🌿', '💛', '🫶'],
    bg: '#2a2018',
    bgPulse: '#3a2820',
    bgImage: '/assets/volcano.jpg',
    flash: 'rgba(255, 100, 30, 0.5)',
    letter: `Dear Alice,<br><br>
      Maybe you've forgotten me, but we loved each other millions of years ago.<br><br>
      Happy 1 Year Anniversary!!<br><br>
      From David`,
  },
  {
    left: '/assets/h1.png',
    right: '/assets/h2.png',
    label: 'Life #33',
    era: 'Somewhere on a Mountain',
    emojis: ['🪨', '⛰️', '❤️', '💕', '🏔️', '🌿', '💛', '🫶', '🐾', '☁️'],
    bg: '#e8ebe5',
    bgPulse: '#dce0d8',
    bgImage: '/assets/mountain.jpg',
    flash: 'rgba(150, 180, 150, 0.4)',
    letter: `Dear Alice,<br><br>
      We were 2 things on a mountain at some point, u just forgot...<br><br>
      Happy 1 Year Anniversary!!<br><br>
      From David`,
  },
]

let currentLifeIndex = -1
let currentLife = null
let heartInterval = null
let letterShown = false
let isClose = false
let rainInterval = null
let dragCleanups = []
let proximityReady = false

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

  // Set characters
  charLeft.innerHTML = `<img src="${life.left}" alt="Left" draggable="false" />`
  charRight.innerHTML = `<img src="${life.right}" alt="Right" draggable="false" />`

  // Set label
  lifeLabel.textContent = life.label
  lifeLabel.dataset.era = life.era

  // Set background
  document.body.style.backgroundColor = life.bg
  document.body.classList.remove('love-mode')
  document.documentElement.style.setProperty('--bg', life.bg)
  document.documentElement.style.setProperty('--bg-pulse', life.bgPulse)
  document.documentElement.style.setProperty('--flash-color', life.flash)

  // Background image
  if (life.bgImage) {
    document.body.style.backgroundImage = `url(${life.bgImage})`
    document.body.style.backgroundSize = 'cover'
    document.body.style.backgroundPosition = 'center'
    document.body.classList.add('has-bg-image')
  } else {
    document.body.style.backgroundImage = 'none'
    document.body.classList.remove('has-bg-image')
  }

  // Dark mode (moth/candle)
  if (life.dark) {
    document.body.classList.add('dark-life')
    charRight.classList.add('candle-glow')
    charLeft.classList.add('moth-dark')
  } else {
    document.body.classList.remove('dark-life')
    charRight.classList.remove('candle-glow')
    charLeft.classList.remove('moth-dark')
  }

  // Set letter text
  letterText.innerHTML = life.letter

  // Reset positions
  charLeft.style.cssText = ''
  charRight.style.cssText = ''
  charLeft.removeAttribute('data-initialized')
  charRight.removeAttribute('data-initialized')

  // Fixed right character (candle): center-right, no cursor change
  if (life.rightFixed) {
    charRight.style.cursor = 'default'
    charRight.style.right = '10%'
  } else {
    charRight.style.cursor = 'grab'
  }

  // Fade in, delay proximity checking
  proximityReady = false
  document.getElementById('stage').classList.add('fade-in')
  lifeLabel.classList.add('fade-in')
  setTimeout(() => {
    document.getElementById('stage').classList.remove('fade-in')
    lifeLabel.classList.remove('fade-in')
    proximityReady = true
  }, 800)

  // Make draggable (candle stays fixed in moth life)
  makeDraggable(charLeft)
  if (!life.rightFixed) {
    makeDraggable(charRight)
  }
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
  let startX = 0
  let startY = 0
  let hasMoved = false

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
    hasMoved = false
    startX = e.clientX
    startY = e.clientY
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

    // Only check proximity after user has actually dragged
    if (!hasMoved) {
      const moved = Math.hypot(e.clientX - startX, e.clientY - startY)
      if (moved < 15) return
      hasMoved = true
    }

    checkProximity()
  }

  function onPointerUp() {
    isDragging = false
    hasMoved = false
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
  if (!proximityReady) return

  const p = getCenter(charLeft)
  const g = getCenter(charRight)
  const dist = Math.hypot(p.x - g.x, p.y - g.y)
  const threshold = (currentLife && currentLife.dark) ? 80 : BASE_THRESHOLD

  // Gradual moth brightness as it approaches candle
  if (currentLife && currentLife.dark) {
    const maxDist = 500
    const brightness = Math.min(1, Math.max(0.15, 1 - (dist / maxDist)))
    charLeft.style.filter = `brightness(${brightness})`
  }

  if (dist < threshold) {
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
