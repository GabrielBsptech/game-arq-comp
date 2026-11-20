const terms = [
  {a:'CPU', r:'Executa as instruções dos programas. Reúne UC, ULA e registradores.', n:'CPU, a Unidade Central de Processamento', q:'É o “cérebro” do computador: executa as instruções dos programas e reúne a UC, a ULA e os registradores.'},
  {a:'ULA', r:'Faz cálculos (soma, subtração) e comparações lógicas dentro da CPU.', n:'ULA, a Unidade Lógica e Aritmética', q:'Parte da CPU que faz as contas (soma, subtração) e as comparações lógicas, como E, OU e NÃO.'},
  {a:'UC', r:'Busca e decodifica as instruções e comanda os demais componentes.', n:'UC, a Unidade de Controle', q:'Parte da CPU que busca e decodifica cada instrução e comanda os outros componentes para executá-la.'},
  {a:'REGISTRADORES', r:'Memórias minúsculas dentro da CPU, as mais rápidas que existem.', n:'Registradores', q:'Minúsculas memórias dentro da CPU, as mais rápidas de todas, que guardam os dados usados neste exato momento.'},
  {a:'RAM', r:'Memória rápida e volátil dos programas em uso. Apaga sem energia.', n:'RAM, a memória de acesso aleatório', q:'Memória rápida e volátil: guarda programas e dados em uso e perde tudo quando falta energia.'},
  {a:'ROM', r:'Memória só de leitura e permanente. Guarda instruções básicas, como a inicialização.', n:'ROM, a memória somente de leitura', q:'Memória não volátil gravada de fábrica, que guarda instruções permanentes, como as de inicialização.'},
  {a:'EEPROM', r:'Memória permanente regravável por eletricidade. Guarda configurações.', n:'EEPROM, ROM programável e apagável eletricamente', q:'Memória não volátil que pode ser apagada e regravada por eletricidade, byte a byte. No Arduino guarda configurações.'},
  {a:'FLASH', r:'Memória permanente regravável em blocos. Guarda o programa do Arduino.', n:'Memória Flash', q:'Memória não volátil regravável em blocos. É onde fica o programa do Arduino e o conteúdo de pendrives e SSDs.'},
  {a:'CACHE', r:'Memória pequena e ultrarrápida junto da CPU. Evita idas à RAM.', n:'Memória cache', q:'Memória pequena e muito rápida, perto da CPU, que guarda cópias dos dados mais usados para não precisar ir até a RAM.'},
  {a:'MEMORIADEMASSA', r:'Armazenamento grande e permanente, como HD e SSD.', n:'Memória de massa (armazenamento)', q:'Armazenamento de grande capacidade e não volátil, como HD e SSD, onde arquivos e programas ficam guardados.'},
  {a:'DMA', r:'Transfere dados entre periféricos e memória sem ocupar a CPU.', n:'DMA, o acesso direto à memória', q:'Recurso que deixa periféricos trocarem dados com a memória sem passar pela CPU, que fica livre para outras tarefas.'},
  {a:'ADDRESSBUS', r:'Leva da CPU o endereço da memória. Funciona em um só sentido.', n:'Address bus, o barramento de endereço', q:'Barramento que leva da CPU até a memória o endereço da posição a ser lida ou gravada. Vai em um só sentido.'},
  {a:'DATABUS', r:'Leva os dados entre CPU, memória e periféricos. Funciona nos dois sentidos.', n:'Data bus, o barramento de dados', q:'Barramento que transporta os dados em si entre a CPU, a memória e os periféricos. Funciona nos dois sentidos.'},
  {a:'MICROCONTROLADOR', r:'Computador em um só chip: CPU, memória e pinos de entrada e saída.', n:'Microcontrolador', q:'Um “computador completo” em um único chip: CPU, memória e pinos de entrada e saída, como o ATmega328P do Arduino Uno.'},
  {a:'DUALCORE', r:'Processador com 2 núcleos trabalhando em paralelo.', n:'Dual core', q:'Processador com dois núcleos, capaz de executar duas tarefas ao mesmo tempo, de verdade.'},
  {a:'QUADCORE', r:'Processador com 4 núcleos trabalhando em paralelo.', n:'Quad core', q:'Processador com quatro núcleos, que divide o trabalho em quatro tarefas rodando em paralelo.'}
]

const el = id => document.getElementById(id)
const clean = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z]/g, '').toUpperCase()

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

let order = []
let idx = 0
let score = 0
let streak = 0
let right = 0
let wrong = 0
let hints = 0
let locked = false
let missed = []
let records = []
let confettiFrame = null
let confettiTimer = null
let confettiResize = null

const screens = ['start', 'game', 'end', 'guide']
let current = 'start'
let previous = 'start'

function show(id) {
  current = id
  screens.forEach(s => el(s).classList.toggle('hidden', s !== id))
  el('back').classList.toggle('hidden', id === 'start')
  el('info').classList.toggle('hidden', id === 'guide')
}

function openGuide() {
  previous = current
  show('guide')
  window.scrollTo(0, 0)
}

function goBack() {
  if (current === 'guide') {
    show(previous)
    if (previous === 'game' && !locked) el('answer').focus()
  } else {
    show('start')
  }
}

function buildGuide() {
  const list = el('guideList')
  terms.forEach(t => {
    const d = document.createElement('details')
    const s = document.createElement('summary')
    const p = document.createElement('p')
    s.textContent = t.n
    p.textContent = t.r
    d.appendChild(s)
    d.appendChild(p)
    list.appendChild(d)
  })
}

function bump(id) {
  const e = el(id)
  e.classList.remove('bump')
  void e.offsetWidth
  e.classList.add('bump')
}

function startGame() {
  stopConfetti()
  order = shuffle(terms)
  idx = 0
  score = 0
  streak = 0
  right = 0
  missed = []
  records = order.map(() => ({wrong: 0, hints: 0, locked: false, correct: false, value: ''}))
  el('page').classList.remove('win')
  el('score').textContent = '0'
  el('streak').textContent = '0'
  show('game')
  loadRound('next')
}

function loadRound(direction) {
  const t = order[idx]
  const rec = records[idx]
  wrong = rec.wrong
  hints = rec.hints
  locked = rec.locked
  el('round').textContent = String(idx + 1)
  el('bar').style.width = (idx / order.length * 100) + '%'
  el('question').textContent = t.q
  el('fb').classList.add('hidden')
  el('actions').classList.toggle('hidden', rec.locked)
  el('hint').disabled = rec.locked || rec.hints >= 3
  el('prev').disabled = idx === 0
  const wrap = el('slotsWrap')
  while (wrap.children.length > 1) wrap.removeChild(wrap.lastChild)
  t.a.split('').forEach(() => {
    const d = document.createElement('div')
    d.className = 'cell'
    wrap.appendChild(d)
  })
  const inp = el('answer')
  inp.disabled = rec.locked
  inp.value = rec.value || ''
  inp.maxLength = t.a.length
  const card = el('card')
  card.classList.remove('enter', 'enter-back')
  void card.offsetWidth
  card.classList.add(direction === 'back' ? 'enter-back' : 'enter')
  render()
  if (rec.locked) {
    lock(rec.correct, t, false)
    el('fbTitle').textContent = rec.correct ? 'Você já acertou este termo.' : 'Esse não foi. Veja a resposta:'
  } else {
    const status = []
    if (rec.wrong > 0) status.push('Ainda não. Restam ' + (3 - rec.wrong) + ' tentativas.')
    if (rec.hints > 0) status.push('Dica usada. Cada dica custa 2 pontos.')
    el('status').textContent = status.length ? status.join(' ') : 'Termo com ' + t.a.length + ' letras. Clique nos quadrinhos e digite.'
    inp.focus()
  }
}

function render() {
  const inp = el('answer')
  const val = clean(inp.value)
  inp.value = val
  if (records[idx]) records[idx].value = val
  const cells = el('slotsWrap').children
  order[idx].a.split('').forEach((_, i) => {
    const c = cells[i + 1]
    const had = c.classList.contains('on')
    c.textContent = val[i] || ''
    c.classList.toggle('cur', !locked && i === val.length)
    c.classList.toggle('on', !!val[i])
    if (val[i] && !had) {
      c.style.animation = 'none'
      void c.offsetWidth
      c.style.animation = ''
    }
  })
}

function lock(good, t, focusNext = true) {
  locked = true
  const rec = records[idx]
  if (rec) {
    rec.locked = true
    rec.correct = good
    rec.value = clean(el('answer').value)
  }
  el('answer').disabled = true
  el('actions').classList.add('hidden')
  const cells = el('slotsWrap').children
  t.a.split('').forEach((ch, i) => {
    const c = cells[i + 1]
    c.textContent = ch
    c.classList.remove('cur', 'on')
    c.classList.add(good ? 'ok' : 'miss')
    c.style.animationDelay = (i * 55) + 'ms'
  })
  el('status').textContent = ''
  const fb = el('fb')
  fb.className = 'fb ' + (good ? 'good' : 'bad')
  el('fbText').textContent = t.n + '. No tabuleiro: ' + t.a + '.'
  el('next').textContent = idx === order.length - 1 ? 'Ver resultado' : 'Próximo'
  if (focusNext) el('next').focus()
}

function check() {
  if (locked) return
  const t = order[idx]
  const val = el('answer').value
  if (!val) return
  if (val === t.a) {
    const pts = Math.max(2, 10 - wrong * 3 - hints * 2)
    streak++
    const bonus = Math.min(streak - 1, 5)
    score += pts + bonus
    right++
    if (right > 9) el('page').classList.add('win')
    el('score').textContent = String(score)
    el('streak').textContent = String(streak)
    bump('score')
    bump('streak')
    el('fbTitle').textContent = 'Acertou! +' + (pts + bonus) + ' pontos' + (bonus ? ' (bônus de sequência: ' + bonus + ')' : '')
    lock(true, t)
  } else {
    wrong++
    if (records[idx]) records[idx].wrong = wrong
    const w = el('slotsWrap')
    w.classList.remove('shake')
    void w.offsetWidth
    w.classList.add('shake')
    if (wrong >= 3) {
      giveUp()
    } else {
      el('status').textContent = 'Ainda não. Restam ' + (3 - wrong) + ' tentativas.'
    }
  }
}

function giveUp() {
  if (locked) return
  const t = order[idx]
  streak = 0
  el('streak').textContent = '0'
  missed.push(t)
  el('fbTitle').textContent = 'Esse não foi. Veja a resposta:'
  lock(false, t)
}

function hint() {
  if (locked || hints >= 3) return
  const t = order[idx]
  hints++
  if (records[idx]) records[idx].hints = hints
  const have = clean(el('answer').value).length
  el('answer').value = t.a.slice(0, Math.min(t.a.length - 1, Math.max(hints, have + 1)))
  render()
  el('status').textContent = 'Dica usada. Cada dica custa 2 pontos.'
  if (hints >= 3) el('hint').disabled = true
  el('answer').focus()
}

function syncRound() {
  const rec = records[idx]
  if (!rec) return
  rec.value = clean(el('answer').value)
  rec.wrong = wrong
  rec.hints = hints
  rec.locked = locked
}

function goPrev() {
  if (idx === 0) return
  syncRound()
  idx--
  loadRound('back')
}

function next() {
  syncRound()
  idx++
  if (idx >= order.length) {
    endGame()
  } else {
    loadRound('next')
  }
}

function endGame() {
  el('bar').style.width = '100%'
  const ranks = [[14, 'Arquiteto de chips'], [10, 'Engenheiro de sistemas'], [6, 'Técnico em formação'], [0, 'Bit curioso']]
  el('rank').textContent = ranks.find(r => right >= r[0])[1]
  el('final').textContent = score + ' pts'
  el('summary').textContent = 'Você acertou ' + right + ' de ' + order.length + ' termos.'
  const list = el('missed')
  while (list.firstChild) list.removeChild(list.firstChild)
  missed.forEach(t => {
    const li = document.createElement('li')
    li.textContent = t.a + ': ' + t.n
    list.appendChild(li)
  })
  el('missedBox').classList.toggle('hidden', missed.length === 0)
  show('end')
  if (right > 9) launchConfetti()
}

function stopConfetti() {
  if (confettiFrame) {
    cancelAnimationFrame(confettiFrame)
    confettiFrame = null
  }
  if (confettiTimer) {
    clearTimeout(confettiTimer)
    confettiTimer = null
  }
  if (confettiResize) {
    window.removeEventListener('resize', confettiResize)
    confettiResize = null
  }
  const canvas = document.getElementById('confetti')
  if (canvas) canvas.remove()
}

function launchConfetti() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  stopConfetti()
  const canvas = document.createElement('canvas')
  canvas.id = 'confetti'
  canvas.setAttribute('aria-hidden', 'true')
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  let w = 0
  let h = 0
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = window.innerWidth
    h = window.innerHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  confettiResize = resize
  window.addEventListener('resize', resize)
  const colors = ['#e6004e', '#ffb020', '#0f9d68', '#3488ff', '#9b5cff', '#ff7aad']
  const pieces = Array.from({length: 180}, () => ({
    x: Math.random() * w,
    y: -20 - Math.random() * h * 0.6,
    w: 5 + Math.random() * 8,
    h: 8 + Math.random() * 10,
    vx: (Math.random() - 0.5) * 2.2,
    vy: 2.5 + Math.random() * 4,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    color: colors[Math.floor(Math.random() * colors.length)],
    sway: Math.random() * Math.PI * 2
  }))
  const start = performance.now()
  const frame = now => {
    const elapsed = now - start
    ctx.clearRect(0, 0, w, h)
    pieces.forEach(p => {
      p.x += p.vx + Math.sin(now / 450 + p.sway) * 0.7
      p.y += p.vy
      p.rot += p.vr
      if (p.y > h + 40) {
        p.y = -40
        p.x = Math.random() * w
      }
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    })
    if (elapsed < 5500) {
      confettiFrame = requestAnimationFrame(frame)
    } else {
      stopConfetti()
    }
  }
  confettiFrame = requestAnimationFrame(frame)
  confettiTimer = setTimeout(stopConfetti, 6500)
}

buildGuide()
el('play').addEventListener('click', startGame)
el('back').addEventListener('click', goBack)
el('info').addEventListener('click', openGuide)
el('again').addEventListener('click', startGame)
el('check').addEventListener('click', check)
el('hint').addEventListener('click', hint)
el('skip').addEventListener('click', giveUp)
el('next').addEventListener('click', next)
el('prev').addEventListener('click', goPrev)
el('answer').addEventListener('input', render)
el('slotsWrap').addEventListener('click', () => el('answer').focus())
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || e.target.tagName === 'BUTTON') return
  if (el('game').classList.contains('hidden')) return
  if (locked) {
    next()
  } else {
    check()
  }
})