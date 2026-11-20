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

let order = []
let idx = 0
let score = 0
let streak = 0
let right = 0
let wrong = 0
let hints = 0
let locked = false
let missed = []

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
  order = terms.slice().sort(() => Math.random() - 0.5)
  idx = 0
  score = 0
  streak = 0
  right = 0
  missed = []
  el('page').classList.remove('win')
  el('score').textContent = '0'
  el('streak').textContent = '0'
  show('game')
  loadRound()
}

function loadRound() {
  const t = order[idx]
  wrong = 0
  hints = 0
  locked = false
  el('round').textContent = String(idx + 1)
  el('bar').style.width = (idx / order.length * 100) + '%'
  el('question').textContent = t.q
  el('status').textContent = 'Termo com ' + t.a.length + ' letras. Clique nos quadrinhos e digite.'
  el('fb').classList.add('hidden')
  el('actions').classList.remove('hidden')
  el('hint').disabled = false
  const wrap = el('slotsWrap')
  while (wrap.children.length > 1) wrap.removeChild(wrap.lastChild)
  t.a.split('').forEach(() => {
    const d = document.createElement('div')
    d.className = 'cell'
    wrap.appendChild(d)
  })
  const inp = el('answer')
  inp.disabled = false
  inp.value = ''
  inp.maxLength = t.a.length
  const card = el('card')
  card.classList.remove('enter')
  void card.offsetWidth
  card.classList.add('enter')
  render()
  inp.focus()
}

function render() {
  const inp = el('answer')
  const val = clean(inp.value)
  inp.value = val
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

function lock(good, t) {
  locked = true
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
  el('next').focus()
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
    if (right > 10) el('page').classList.add('win')
    el('score').textContent = String(score)
    el('streak').textContent = String(streak)
    bump('score')
    bump('streak')
    el('fbTitle').textContent = 'Acertou! +' + (pts + bonus) + ' pontos' + (bonus ? ' (bônus de sequência: ' + bonus + ')' : '')
    lock(true, t)
  } else {
    wrong++
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
  const have = clean(el('answer').value).length
  el('answer').value = t.a.slice(0, Math.min(t.a.length - 1, Math.max(hints, have + 1)))
  render()
  el('status').textContent = 'Dica usada. Cada dica custa 2 pontos.'
  if (hints >= 3) el('hint').disabled = true
  el('answer').focus()
}

function next() {
  idx++
  if (idx >= order.length) {
    endGame()
  } else {
    loadRound()
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