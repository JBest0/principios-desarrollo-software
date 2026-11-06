// ==========================================================
// Configuración de reveal.js + animaciones propias con GSAP
// ==========================================================
//
// Dos tipos de animación:
//  1. Por pasos: se controlan con fragmentos invisibles
//     <span class="fragment disparador" data-anim="nombre" data-step="1">
//     Cada animación es una función go(paso, instantaneo) que lleva la
//     escena a ese paso. Funciona hacia adelante y hacia atrás.
//  2. Automáticas: arrancan al entrar a la diapositiva (por id) y se
//     detienen al salir.

Reveal.initialize({
  width: 1280,
  height: 720,
  margin: 0.04,
  hash: true,
  slideNumber: 'c/t',
  transition: 'slide',
  autoAnimateDuration: 1.0,
  plugins: [RevealHighlight, RevealNotes, RevealZoom],
});

const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
const dur = (instantaneo, d) => (instantaneo ? 0 : d);

const C = {
  rosa: '#f92672', verde: '#a6e22e', amarillo: '#e6db74', azul: '#66d9ef',
  naranja: '#fd971f', panel: '#272822', panel2: '#3e3d32', comentario: '#75715e',
};

// ----------------------------------------------------------
// 1. Animaciones por pasos
// ----------------------------------------------------------
const pasos = {};

// --- La clase GestorPedidos se divide en tres -------------
pasos.split = (paso, inst) => {
  const st = $('#split-stage');
  const shell = $('.gp-shell', st);
  const piezas = $$('.gp-pieza', st);
  const d = dur(inst, 0.9);
  const mostrar = (el, despues) => {
    $('.t-antes', el).style.display = despues ? 'none' : '';
    $('.t-despues', el).style.display = despues ? 'inline' : 'none';
  };

  if (paso === 0) {
    gsap.to(shell, { left: 300, top: 20, width: 500, height: 440, borderColor: C.rosa, duration: d, ease: 'power2.inOut' });
    piezas.forEach((p, i) => {
      gsap.to(p, { left: 330, top: 90 + i * 120, width: 440, borderColor: C.rosa,
        backgroundColor: 'rgba(249,38,114,0.18)', duration: d, ease: 'power2.inOut' });
      mostrar(p, false);
    });
    mostrar(shell, false);
    gsap.to('#split-stage .badge:not(.badge-d)', { opacity: 0, scale: 0.5, duration: dur(inst, 0.2) });
    gsap.to('#split-stage .split-lineas', { opacity: 0, duration: dur(inst, 0.2) });
  }
  if (paso >= 1) {
    gsap.to(shell, { left: 400, top: 10, width: 300, height: 70, borderColor: C.azul, duration: d, ease: 'back.out(1.2)' });
    mostrar(shell, true);
    piezas.forEach((p, i) => {
      gsap.to(p, { left: 40 + i * 360, top: 200, width: 300, borderColor: C.verde,
        backgroundColor: 'rgba(166,226,46,0.15)', duration: d, delay: inst ? 0 : i * 0.12, ease: 'back.out(1.4)' });
      mostrar(p, true);
    });
    gsap.to('#split-stage .gp-pieza .badge', { opacity: 1, scale: 1, duration: dur(inst, 0.4), delay: inst ? 0 : 0.9, stagger: inst ? 0 : 0.1 });
    gsap.to('#split-stage .split-lineas', { opacity: 1, duration: dur(inst, 0.4), delay: inst ? 0 : 0.8 });
  }
  if (paso < 2) {
    gsap.to('#split-stage .gp-interfaz, #split-stage .gp-d', { opacity: 0, y: 20, duration: dur(inst, 0.3) });
  } else {
    gsap.to('#split-stage .gp-interfaz', { opacity: 1, y: 0, duration: dur(inst, 0.5) });
    gsap.to('#split-stage .gp-interfaz .badge', { opacity: 1, scale: 1, duration: dur(inst, 0.3), delay: inst ? 0 : 0.4 });
    gsap.fromTo('#split-stage .gp-interfaz .chips span', { opacity: inst ? 1 : 0, y: inst ? 0 : 10 },
      { opacity: 1, y: 0, stagger: inst ? 0 : 0.12, duration: dur(inst, 0.3), delay: inst ? 0 : 0.3 });
    gsap.to('#split-stage .gp-d', { opacity: 1, y: 0, duration: dur(inst, 0.5), delay: inst ? 0 : 0.7 });
  }
};
gsap.set('#split-stage .gp-d', { left: 400, top: 330, width: 660 });

// --- DRY: el cambio que se olvida en dos lugares -----------
pasos.dry = (paso, inst) => {
  const cards = $$('#dry-stage .dry-card');
  const aviso = $('#dry-stage .dry-aviso');
  const d = dur(inst, 0.5);

  if (paso === 0) {
    aviso.textContent = 'El descuento VIP cambia a 20 %…';
    gsap.to(aviso, { opacity: 0, duration: d });
    cards.forEach((c) => {
      $('.valor', c).textContent = '0.9';
      $('.estado', c).textContent = '';
      gsap.to(c, { left: [20, 390, 760][c.dataset.i], opacity: 1, borderColor: C.panel2, x: 0, duration: d });
    });
    gsap.to('#dry-stage .dry-unico', { opacity: 0, scale: 0.9, duration: d });
  }
  if (paso === 1) {
    aviso.textContent = 'El descuento VIP cambia a 20 %…';
    gsap.to(aviso, { opacity: 1, duration: d });
    gsap.to('#dry-stage .dry-unico', { opacity: 0, scale: 0.9, duration: d });
    cards.forEach((c, i) => {
      gsap.to(c, { left: [20, 390, 760][i], opacity: 1, duration: d });
      const estado = $('.estado', c);
      if (i === 0) {
        $('.valor', c).textContent = '0.8';
        estado.textContent = '✓ actualizado';
        estado.style.color = C.verde;
        gsap.to(c, { borderColor: C.verde, duration: d, delay: inst ? 0 : 0.3 });
      } else {
        $('.valor', c).textContent = '0.9';
        estado.textContent = '✗ olvidado: sigue en 0.9';
        estado.style.color = C.rosa;
        gsap.to(c, { borderColor: C.rosa, duration: d, delay: inst ? 0 : 0.8 + i * 0.3 });
        if (!inst) gsap.fromTo(c, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(3, 0.2)', delay: 0.8 + i * 0.3 });
      }
    });
  }
  if (paso === 2) {
    aviso.textContent = 'Corregir en un solo lugar corrige en todos.';
    gsap.to(aviso, { opacity: 1, duration: d });
    cards.forEach((c) => gsap.to(c, { left: 390, opacity: 0, duration: dur(inst, 0.7), ease: 'power2.in' }));
    gsap.to('#dry-stage .dry-unico', { opacity: 1, scale: 1, duration: dur(inst, 0.6), delay: inst ? 0 : 0.6, ease: 'back.out(1.6)' });
  }
};

// --- YAGNI: la clase que crece "por si acaso" ---------------
pasos.yagni = (paso, inst) => {
  const extras = $$('#s-yagni .metodo.extra');
  const caja = $('#s-yagni .yagni-caja');
  const sello = $('#s-yagni .sello');

  if (paso === 0) {
    extras.forEach((e) => (e.style.display = 'none'));
    gsap.to(caja, { borderColor: C.verde, duration: dur(inst, 0.3) });
  } else {
    extras.forEach((e) => (e.style.display = 'block'));
    if (!inst && paso === 1) gsap.from(extras, { opacity: 0, x: 30, stagger: 0.35, duration: 0.4 });
    gsap.to(caja, { borderColor: C.rosa, duration: dur(inst, 1.4) });
  }
  if (paso < 2) gsap.to(sello, { opacity: 0, scale: 1, duration: dur(inst, 0.2) });
  else gsap.fromTo(sello, { opacity: 0, scale: inst ? 1 : 3 }, { opacity: 1, scale: 1, duration: dur(inst, 0.35), ease: 'power4.in' });
};

// --- Balanza de tensiones -----------------------------------
const estadosBalanza = [
  { izq: 'DRY', der: 'KISS', angulo: 9,
    nota: 'Fusionar dos reglas parecidas puede costar más complejidad que la duplicación.' },
  { izq: 'DRY', der: 'YAGNI', angulo: -7,
    nota: 'Regla de tres: esperar a que la lógica se repita por tercera vez antes de abstraerla.' },
  { izq: 'Open/Closed', der: 'YAGNI', angulo: 11,
    nota: 'No diseñar puntos de extensión hasta que aparezca un segundo caso real.' },
];
pasos.balanza = (paso, inst) => {
  const e = estadosBalanza[paso];
  const aplicar = () => {
    $('#b-txt-izq').textContent = e.izq;
    $('#b-txt-der').textContent = e.der;
    $('#b-txt-izq').style.fontSize = e.izq.length > 6 ? '22px' : '30px';
    $('#b-nota').textContent = e.nota;
  };
  gsap.killTweensOf(['#b-brazo', '#b-izq', '#b-der', '#b-nota']);
  if (inst) {
    aplicar();
    gsap.set('#b-brazo', { rotation: e.angulo, svgOrigin: '400 140' });
    gsap.set('#b-izq', { rotation: -e.angulo, svgOrigin: '140 140' });
    gsap.set('#b-der', { rotation: -e.angulo, svgOrigin: '660 140' });
    return;
  }
  const tl = gsap.timeline();
  tl.to('#b-nota', { opacity: 0, duration: 0.2 })
    .to('#b-brazo', { rotation: 0, svgOrigin: '400 140', duration: 0.4 }, 0)
    .to('#b-izq', { rotation: 0, svgOrigin: '140 140', duration: 0.4 }, 0)
    .to('#b-der', { rotation: 0, svgOrigin: '660 140', duration: 0.4 }, 0)
    .add(aplicar)
    .to('#b-brazo', { rotation: e.angulo, svgOrigin: '400 140', duration: 1.2, ease: 'elastic.out(1, 0.4)' })
    .to('#b-izq', { rotation: -e.angulo, svgOrigin: '140 140', duration: 1.2, ease: 'elastic.out(1, 0.4)' }, '<')
    .to('#b-der', { rotation: -e.angulo, svgOrigin: '660 140', duration: 1.2, ease: 'elastic.out(1, 0.4)' }, '<')
    .to('#b-nota', { opacity: 1, duration: 0.3 }, '<0.2');
};

// --- Cohesión y acoplamiento: nodos que se reorganizan ------
const acople = (() => {
  const svg = $('#acople-svg');
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, padre = svg) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    padre.appendChild(el);
    return el;
  };
  const nodos = {
    calc:   { txt: 'calcularTotal()',    a: [150, 80],  b: [170, 150] },
    desc:   { txt: 'aplicarDescuento()', a: [790, 300], b: [170, 260] },
    guard:  { txt: 'guardar()',          a: [850, 90],  b: [500, 150] },
    stock:  { txt: 'consultarStock()',   a: [220, 320], b: [500, 260] },
    correo: { txt: 'enviarCorreo()',     a: [500, 60],  b: [830, 150] },
    sms:    { txt: 'enviarSMS()',        a: [500, 220], b: [830, 260] },
  };
  const grupos = [['Cálculo', 170], ['Datos', 500], ['Notificación', 830]];
  const enlaces = [
    ['calc', 'desc', 'intra'], ['guard', 'stock', 'intra'], ['correo', 'sms', 'intra'],
    ['calc', 'guard', 'queda'], ['guard', 'correo', 'queda'],
    ['calc', 'correo', 'sale'], ['desc', 'stock', 'sale'], ['desc', 'sms', 'sale'],
    ['stock', 'sms', 'sale'], ['calc', 'sms', 'sale'], ['desc', 'guard', 'sale'],
  ];
  const gGrupos = mk('g', {});
  const marcos = grupos.map(([nombre, x]) => {
    mk('text', { x, y: 88, class: 'grupo-txt' }, gGrupos).textContent = nombre;
    return mk('rect', { x: x - 135, y: 100, width: 270, height: 210, rx: 14, class: 'grupo' }, gGrupos);
  });
  const lineas = enlaces.map(([a, b, tipo]) => ({ a, b, tipo, el: mk('line', { stroke: C.rosa }) }));
  Object.values(nodos).forEach((n) => {
    n.x = n.a[0]; n.y = n.a[1];
    n.g = mk('g', { class: 'nodo' });
    n.rect = mk('rect', { x: -112, y: -24, width: 224, height: 48, rx: 8, stroke: C.rosa }, n.g);
    mk('text', { x: 0, y: 7 }, n.g).textContent = n.txt;
  });
  const dibujar = () => {
    Object.values(nodos).forEach((n) => n.g.setAttribute('transform', `translate(${n.x},${n.y})`));
    lineas.forEach((l) => {
      const A = nodos[l.a], B = nodos[l.b];
      l.el.setAttribute('x1', A.x); l.el.setAttribute('y1', A.y);
      l.el.setAttribute('x2', B.x); l.el.setAttribute('y2', B.y);
    });
  };
  dibujar();

  return (paso, inst) => {
    const d = dur(inst, 1.2);
    const fin = paso === 1 ? 'b' : 'a';
    Object.values(nodos).forEach((n) => {
      gsap.to(n, { x: n[fin][0], y: n[fin][1], duration: d, ease: 'power3.inOut', onUpdate: dibujar });
      gsap.to(n.rect, { attr: { stroke: paso ? C.verde : C.rosa }, duration: d });
    });
    lineas.forEach((l) => {
      const visible = paso === 0 || l.tipo !== 'sale';
      gsap.to(l.el, { opacity: visible ? 1 : 0, attr: { stroke: paso ? C.verde : C.rosa },
        strokeDasharray: paso && l.tipo === 'queda' ? '8 6' : 'none', duration: d * 0.6 });
    });
    gsap.to([...marcos, ...$$('.grupo-txt', svg)], { opacity: paso ? 1 : 0, duration: dur(inst, 0.5), delay: paso && !inst ? 0.9 : 0 });
    const e1 = $('#acople-e1');
    e1.textContent = paso ? 'Acoplamiento bajo · Cohesión alta' : 'Acoplamiento alto · Cohesión baja';
    e1.className = paso ? 'verde' : 'rosa';
  };
})();
pasos.acople = acople;

// --- Netflix y Shopify: el monolito -------------------------
const crearTiles = (stage, nombres) =>
  nombres.map((nombre, i) => {
    const t = document.createElement('div');
    t.className = 'tile';
    t.innerHTML = `<span>${nombre}</span>`;
    t.style.left = 250 + (i % 3) * 200 + 'px';
    t.style.top = 80 + Math.floor(i / 3) * 120 + 'px';
    stage.appendChild(t);
    return t;
  });

const tilesNetflix = crearTiles($('#netflix-stage'),
  ['Reproducción', 'Recomendaciones', 'Facturación', 'Usuarios', 'Búsqueda', 'Streaming']);
pasos.netflix = (paso, inst) => {
  const etiqueta = $('#netflix-stage .bloque-etiqueta');
  const nota = $('#netflix-nota');
  gsap.killTweensOf(tilesNetflix);
  if (paso === 0) {
    nota.textContent = '2008: una base de datos corrupta detiene los envíos de DVD por tres días.';
    gsap.to(tilesNetflix, { x: 0, y: 0, rotation: 0, borderColor: C.rosa, duration: dur(inst, 0.6) });
    gsap.to($$('span', $('#netflix-stage')), { opacity: 0, duration: dur(inst, 0.2) });
    gsap.to(etiqueta, { opacity: 1, duration: dur(inst, 0.4) });
    return;
  }
  nota.textContent = '2009–2012: migración gradual a cientos de microservicios en AWS.';
  const tl = gsap.timeline();
  if (!inst) tl.to(tilesNetflix, { x: () => gsap.utils.random(-4, 4), rotation: () => gsap.utils.random(-2, 2), duration: 0.06, repeat: 7, yoyo: true });
  tl.to(etiqueta, { opacity: 0, duration: dur(inst, 0.2) })
    .to(tilesNetflix, {
      x: (i) => ((i % 3) - 1) * 100,
      y: (i) => (Math.floor(i / 3) ? 50 : -50),
      rotation: 0, borderColor: C.verde,
      duration: dur(inst, 0.9), ease: 'back.out(1.5)', stagger: inst ? 0 : 0.05,
    })
    .to($$('span', $('#netflix-stage')), { opacity: 1, duration: dur(inst, 0.3), stagger: inst ? 0 : 0.05 }, '<0.4');
};

const stShopify = $('#shopify-stage');
const bordeShopify = document.createElement('div');
bordeShopify.className = 'shopify-borde';
stShopify.prepend(bordeShopify);
const tilesShopify = crearTiles(stShopify, ['Checkout', 'Envíos', 'Pagos', 'Catálogo', 'Impuestos', 'Cuentas']);
const divisores = [
  Object.assign(document.createElement('div'), { className: 'divisor v' }),
  Object.assign(document.createElement('div'), { className: 'divisor v' }),
  Object.assign(document.createElement('div'), { className: 'divisor h' }),
];
divisores[0].style.left = '450px';
divisores[1].style.left = '650px';
divisores.forEach((d) => stShopify.appendChild(d));
gsap.set(divisores.slice(0, 2), { scaleY: 0 });
gsap.set(divisores[2], { scaleX: 0 });

pasos.shopify = (paso, inst) => {
  const etiqueta = $('#shopify-stage .bloque-etiqueta');
  const nota = $('#shopify-nota');
  const spans = $$('.tile span', stShopify);
  if (paso === 0) {
    nota.textContent = 'Uno de los monolitos de Rails más grandes del mundo… y decidió no romperlo.';
    gsap.to(divisores.slice(0, 2), { scaleY: 0, duration: dur(inst, 0.3) });
    gsap.to(divisores[2], { scaleX: 0, duration: dur(inst, 0.3) });
    gsap.to(spans, { opacity: 0, duration: dur(inst, 0.2) });
    gsap.to(etiqueta, { opacity: 1, duration: dur(inst, 0.3) });
    return;
  }
  nota.textContent = 'Una sola base de código y un solo despliegue, con límites estrictos entre componentes.';
  const tl = gsap.timeline();
  tl.to(etiqueta, { opacity: 0, duration: dur(inst, 0.3) })
    .to(divisores.slice(0, 2), { scaleY: 1, duration: dur(inst, 0.6), stagger: inst ? 0 : 0.2, ease: 'power2.out' })
    .to(divisores[2], { scaleX: 1, duration: dur(inst, 0.6), ease: 'power2.out' })
    .to(spans, { opacity: 1, duration: dur(inst, 0.3), stagger: inst ? 0 : 0.08 });
};

// ----------------------------------------------------------
// 2. Animaciones automáticas al entrar a una diapositiva
// ----------------------------------------------------------
const automaticas = {};
let lineaActiva = null;

// --- Portada: título escrito como en una terminal ------------
automaticas.portada = () => {
  const destino = $('#tipeo');
  const texto = 'Principios de Desarrollo de Software';
  const estado = { n: 0 };
  destino.textContent = '';
  gsap.set('.terminal-sub', { opacity: 0 });
  return gsap.timeline({ delay: 0.4 })
    .to(estado, { n: texto.length, duration: 2.2, ease: 'none',
      onUpdate: () => (destino.textContent = texto.slice(0, Math.round(estado.n))) })
    .to('.terminal-sub', { opacity: 1, duration: 0.6 });
};

// --- Scrum: sprint con reloj y trabajo en bloque -------------
const crearTarjetas = (tablero, nombres) =>
  nombres.map((nombre) => {
    const t = document.createElement('div');
    t.className = 'tarjeta';
    t.textContent = nombre;
    tablero.appendChild(t);
    return t;
  });
const colX = (c) => 20 + c * 340;
const filaY = (f, paso = 54) => 84 + f * paso;

const tarjetasScrum = crearTarjetas($('#scrum-tablero'),
  ['Login de usuarios', 'Carrito de compras', 'Pago con tarjeta', 'Historial de pedidos', 'Notificación por correo']);
automaticas['s-scrum'] = () => {
  const reloj = $('#scrum-reloj');
  const dia = { v: 0 };
  tarjetasScrum.forEach((t, i) => gsap.set(t, { left: colX(0), top: filaY(i), opacity: 1 }));
  reloj.textContent = 'Sprint 1 · planificación';
  const tl = gsap.timeline({ delay: 0.6 });
  tl.to(tarjetasScrum, { left: colX(1), duration: 0.8, ease: 'power2.inOut' })
    .add(() => (reloj.textContent = 'Sprint 1 · día 0/10'))
    .to(dia, { v: 10, duration: 5.5, ease: 'none',
      onUpdate: () => (reloj.textContent = `Sprint 1 · día ${Math.round(dia.v)}/10`) });
  [0, 1, 2, 3].forEach((i) =>
    tl.to(tarjetasScrum[i], { left: colX(2), top: filaY(i), duration: 0.6, ease: 'power2.out' }, 2.0 + i * 1.2));
  tl.add(() => (reloj.textContent = 'Sprint 1 · revisión y retrospectiva'))
    .to(tarjetasScrum[4], { left: colX(0), top: filaY(0), duration: 0.8, ease: 'power2.inOut' }, '+=0.2');
  return tl;
};

// --- かんばん: 看板 → かんばん → Kanban, y flujo continuo ------
const tarjetasKanban = crearTarjetas($('#kanban-tablero'),
  ['Bug en checkout', 'Ticket de soporte', 'Nueva API', 'Mejora de búsqueda', 'Bug en login', 'Reporte mensual']);
automaticas['s-kanban'] = () => {
  const [k1, k2, k3] = $$('#s-kanban .k');
  gsap.set(k1, { opacity: 1, y: 0 });
  gsap.set([k2, k3], { opacity: 0, y: 20 });
  tarjetasKanban.forEach((t, i) => gsap.set(t, { left: colX(0), top: filaY(i, 50), opacity: 0, y: -40 }));

  const tl = gsap.timeline({ delay: 0.5 });
  tl.to(k1, { opacity: 0, y: -20, duration: 0.5 }, 1.0)
    .to(k2, { opacity: 1, y: 0, duration: 0.5 }, 1.2)
    .to(k2, { opacity: 0, y: -20, duration: 0.5 }, 2.6)
    .to(k3, { opacity: 1, y: 0, duration: 0.5 }, 2.8)
    .to(tarjetasKanban, { opacity: 1, y: 0, stagger: 0.12, duration: 0.5, ease: 'bounce.out' }, 3.0);

  // Cada tarjeta entra a "En curso" cada 1.3 s y tarda 2.4 s:
  // nunca hay más de 2 en curso al mismo tiempo (límite WIP).
  tarjetasKanban.forEach((t, i) => {
    const inicio = 4.4 + i * 1.3;
    tl.to(t, { left: colX(1), top: filaY(i % 2, 50), duration: 0.5, ease: 'power2.inOut' }, inicio)
      .to(t, { left: colX(2), top: filaY(i, 50), duration: 0.5, ease: 'power2.inOut' }, inicio + 2.4);
  });
  return tl;
};

// --- TDD: el ciclo gira --------------------------------------
automaticas['s-tdd'] = () => {
  const nodos = ['#tdd-red', '#tdd-green', '#tdd-ref'];
  gsap.set('#tdd-flecha', { rotation: 60, svgOrigin: '200 200' });
  gsap.set(nodos, { scale: 1, transformOrigin: '50% 50%' });
  const tl = gsap.timeline({ delay: 0.4, repeat: 2 });
  nodos.forEach((n) => {
    tl.to(n, { scale: 1.15, duration: 0.3, ease: 'back.out(3)' })
      .to(n, { scale: 1, duration: 0.3 }, '+=0.4')
      .to('#tdd-flecha', { rotation: '+=120', svgOrigin: '200 200', duration: 0.7, ease: 'power2.inOut' }, '<');
  });
  return tl;
};

// ----------------------------------------------------------
// 3. Conexión con los eventos de reveal.js
// ----------------------------------------------------------
const pasoVisible = (slide, nombre) =>
  $$(`.disparador[data-anim="${nombre}"].visible`, slide)
    .reduce((max, el) => Math.max(max, +el.dataset.step), 0);

const sincronizarDiapositiva = (slide) => {
  // Animaciones por pasos: llevar la escena al paso actual sin animar
  const nombres = new Set($$('.disparador', slide).map((el) => el.dataset.anim));
  nombres.forEach((n) => pasos[n] && pasos[n](pasoVisible(slide, n), true));

  // Animaciones automáticas: detener la anterior y arrancar la nueva
  if (lineaActiva) { lineaActiva.kill(); lineaActiva = null; }
  if (slide.id && automaticas[slide.id]) lineaActiva = automaticas[slide.id]();
};

Reveal.on('ready', (e) => sincronizarDiapositiva(e.currentSlide));
Reveal.on('slidechanged', (e) => sincronizarDiapositiva(e.currentSlide));

Reveal.on('fragmentshown', (e) => {
  const f = e.fragment;
  if (f.classList.contains('disparador') && pasos[f.dataset.anim]) pasos[f.dataset.anim](+f.dataset.step, false);
});
Reveal.on('fragmenthidden', (e) => {
  const f = e.fragment;
  if (f.classList.contains('disparador') && pasos[f.dataset.anim]) pasos[f.dataset.anim](+f.dataset.step - 1, false);
});
