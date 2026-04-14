const charLeft = document.getElementById('char-left')
const charRight = document.getElementById('char-right')
const heartsContainer = document.getElementById('hearts-container')
const letterOverlay = document.getElementById('letter-overlay')
const envelopeFront = document.getElementById('envelope-front')
const letterContent = document.getElementById('letter-content')
const openBtn = document.getElementById('open-btn')
const nextLifeBtn = document.getElementById('next-life-btn')
const lifeLabel = document.getElementById('life-label')
const titleEl = document.getElementById('title')

const PROXIMITY_THRESHOLD = 160
const HEART_EMOJIS = ['❤️', '💕', '💗', '💖', '💘', '💝', '💞', '🩷', '😘', '🥰']

// --- Lives ---

const LIVES = [
  {
    left: '/assets/pucca.png',
    right: '/assets/garu.png',
    label: 'This Life',
    era: 'Now',
    type: 'image',
  },
  {
    left: '🤴',
    right: '👸',
    label: 'Life #217',
    era: 'Medieval England, 1342',
    type: 'emoji',
  },
  {
    left: '🧑‍🚀',
    right: '👩‍🚀',
    label: 'Life #4,081',
    era: 'Mars Colony, 3047',
    type: 'emoji',
  },
  {
    left: '🦊',
    right: '🐰',
    label: 'Life #12',
    era: 'The Enchanted Forest',
    type: 'emoji',
  },
  {
    left: '🧜‍♂️',
    right: '🧜‍♀️',
    label: 'Life #889',
    era: 'Under the Sea, 10000 BC',
    type: 'emoji',
  },
  {
    left: '🤠',
    right: '💃',
    label: 'Life #1,203',
    era: 'Wild West, 1885',
    type: 'emoji',
  },
  {
    left: '🧛',
    right: '🧛‍♀️',
    label: 'Life #∞',
    era: 'Eternal Night, Transylvania',
    type: 'emoji',
  },
  {
    left: '👨‍🎨',
    right: '🩰',
    label: 'Life #621',
    era: 'Renaissance Florence, 1503',
    type: 'emoji',
  },
  {
    left: '⛩️',
    right: '🌸',
    label: 'Life #77',
    era: 'Kyoto, 794',
    type: 'emoji',
  },
  {
    left: '🐧',
    right: '🐧',
    label: 'Life #3',
    era: 'Antarctica, Ice Age',
    type: 'emoji',
  },
  {
    left: '☀️',
    right: '🌙',
    label: 'Life #1',
    era: 'The Beginning of Time',
    type: 'emoji',
  },
  {
    left: '🏴‍☠️',
    right: '🧜‍♀️',
    label: 'Life #505',
    era: 'Caribbean Sea, 1715',
    type: 'emoji',
  },
]

let currentLifeIndex = -1
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
  // Reset state
  stopHearts()
  isClose = false
  letterShown = false
  letterOverlay.classList.add('hidden')
  heartsContainer.innerHTML = ''
  document.body.classList.remove('love-mode')
  charLeft.classList.remove('excited')
  charRight.classList.remove('excited')

  // Clean up old drag listeners
  dragCleanups.forEach(fn => fn())
  dragCleanups = []

  // Set characters
  if (life.type === 'image') {
    charLeft.innerHTML = `<img src="${life.left}" alt="Left" draggable="false" />`
    charRight.innerHTML = `<img src="${life.right}" alt="Right" draggable="false" />`
    charLeft.classList.add('img-char')
    charRight.classList.add('img-char')
    charLeft.classList.remove('emoji-char')
    charRight.classList.remove('emoji-char')
  } else {
    charLeft.textContent = life.left
    charRight.textContent = life.right
    charLeft.classList.add('emoji-char')
    charRight.classList.add('emoji-char')
    charLeft.classList.remove('img-char')
    charRight.classList.remove('img-char')
  }

  // Set label
  lifeLabel.textContent = life.label
  lifeLabel.dataset.era = life.era

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

nextLifeBtn.addEventListener('click', () => {
  letterOverlay.classList.add('hidden')
  stopHearts()
  // Fade out, switch life, fade in
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
