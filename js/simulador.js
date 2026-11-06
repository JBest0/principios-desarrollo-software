// ==========================================================
// Simulador: monolito vs. microservicios
// ==========================================================
// Dos sistemas con los mismos componentes. Puntos amarillos = solicitudes
// de usuarios. Al llegar se pintan de verde (atendida), amarillo (atendida
// con respaldo) o rojo (rechazada). Los valores son ilustrativos.

(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const COMPONENTES = ['Usuarios', 'Catálogo', 'Reproducción', 'Recomendaciones', 'Facturación', 'Base de datos'];
  const DESTINOS = COMPONENTES.slice(0, 5); // la base de datos no recibe usuarios directamente
  const COLOR = {
    ok: '#a6e22e', degradada: '#e6db74', rechazada: '#f92672',
    punto: '#e6db74', azul: '#66d9ef', panel: '#272822', panel2: '#3e3d32',
  };

  const raiz = document.getElementById('s-simulador');
  if (!raiz) return;
  const $ = (s) => raiz.querySelector(s);
  const mensaje = $('#sim-mensaje');

  const mk = (tag, attrs = {}, padre) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (padre) padre.appendChild(el);
    return el;
  };

  // ---------------- Estado ----------------
  const estado = {
    caidos: new Set(),
    estreno: false,
    escalado: false,
    shopify: false,
    activo: false,
    temporizadores: [],
  };

  const despues = (ms, fn) => estado.temporizadores.push(setTimeout(fn, ms));
  const limpiarTemporizadores = () => {
    estado.temporizadores.forEach(clearTimeout);
    estado.temporizadores = [];
  };

  // ---------------- Construcción de los paneles ----------------
  const crearPanel = (id, tipo) => {
    const cont = $(`#${id}`);
    const svg = cont.querySelector('svg');
    const p = { tipo, svg, cont, cajas: {}, atendidas: 0, degradadas: 0, rechazadas: 0, desplegando: false, puntos: [] };

    p.capaFantasmas = mk('g', {}, svg);
    if (tipo === 'mono') {
      p.marco = mk('rect', { x: 90, y: 18, width: 458, height: 264, rx: 14, class: 'sim-marco' }, svg);
    }
    // Usuarios (origen de las solicitudes)
    mk('text', { x: 40, y: 146, class: 'sim-usuarios' }, svg).textContent = '👥';
    mk('text', { x: 40, y: 172, class: 'sim-usuarios-txt' }, svg).textContent = 'usuarios';

    COMPONENTES.forEach((nombre, i) => {
      const c = i % 3, r = Math.floor(i / 3);
      const g = tipo === 'mono'
        ? { x: 100 + c * 148, y: 28 + r * 128, w: 142, h: 116 }
        : { x: 104 + c * 150, y: 26 + r * 140, w: 132, h: 110 };
      const grupo = mk('g', { class: 'sim-caja', 'data-nombre': nombre }, svg);
      const sombra = mk('g', { class: 'sim-sombras' }, grupo);
      const rect = mk('rect', { x: g.x, y: g.y, width: g.w, height: g.h, rx: 10 }, grupo);
      const txt = mk('text', { x: g.x + g.w / 2, y: g.y + g.h / 2 + 2, class: 'sim-nombre-caja' }, grupo);
      txt.textContent = nombre === 'Base de datos' && tipo === 'micro' ? 'BD Facturación' : nombre;
      if (nombre.length > 12) txt.style.fontSize = '12.5px';
      const sub = mk('text', { x: g.x + g.w / 2, y: g.y + g.h / 2 + 24, class: 'sim-sub' }, grupo);
      const barra = mk('rect', { x: g.x + 10, y: g.y + g.h - 16, width: 0, height: 6, rx: 3, class: 'sim-barra' }, grupo);
      const insignia = mk('text', { x: g.x + g.w - 8, y: g.y + 20, class: 'sim-insignia' }, grupo);
      grupo.addEventListener('click', () => romper(nombre));
      p.cajas[nombre] = { ...g, grupo, rect, txt, sub, barra, insignia, sombra, cx: g.x + g.w / 2, cy: g.y + g.h / 2 };
    });

    if (tipo === 'mono') {
      p.aviso = mk('text', { x: 319, y: 156, class: 'sim-aviso' }, svg);
      p.barraGlobal = mk('rect', { x: 110, y: 262, width: 0, height: 8, rx: 4, class: 'sim-barra' }, svg);
    }
    p.capaRastro = mk('g', {}, svg);
    p.capaPuntos = mk('g', {}, svg);
    p.metricas = cont.querySelector('.sim-metricas');
    return p;
  };

  const mono = crearPanel('sim-mono', 'mono');
  const micro = crearPanel('sim-micro', 'micro');
  const paneles = [mono, micro];

  // ---------------- Lógica de resultados ----------------
  const monoCaido = () => estado.caidos.size > 0 || mono.desplegando;

  const microCaido = (nombre) =>
    estado.caidos.has(nombre) ||
    (nombre === 'Facturación' && (estado.caidos.has('Base de datos') || micro.desplegando));

  const resultado = (p, destino) => {
    if (p.tipo === 'mono') {
      if (monoCaido()) return 'rechazada';
      if (estado.estreno && !estado.escalado && Math.random() < 0.55) return 'rechazada';
      return 'ok';
    }
    if (microCaido(destino)) return destino === 'Recomendaciones' ? 'degradada' : 'rechazada';
    if (estado.estreno && !estado.escalado && destino === 'Reproducción' && Math.random() < 0.55) return 'rechazada';
    return 'ok';
  };

  const elegirDestino = () => {
    if (estado.estreno && Math.random() < 0.7) return 'Reproducción';
    return DESTINOS[Math.floor(Math.random() * DESTINOS.length)];
  };

  // ---------------- Puntos (solicitudes) ----------------
  const lanzarPunto = (p, ahora) => {
    const destino = elegirDestino();
    const caja = p.cajas[destino];
    const el = mk('circle', { r: 5, cx: 62, cy: 150, fill: COLOR.punto }, p.capaPuntos);
    p.puntos.push({
      el, destino, t0: ahora, dur: 900,
      x0: 62, y0: 150,
      x1: caja.cx + (Math.random() - 0.5) * 50,
      y1: caja.cy + (Math.random() - 0.5) * 40,
      llegado: false,
    });
  };

  const actualizarPuntos = (p, ahora) => {
    p.puntos = p.puntos.filter((d) => {
      const t = Math.min(1, (ahora - d.t0) / d.dur);
      if (!d.llegado) {
        d.el.setAttribute('cx', d.x0 + (d.x1 - d.x0) * t);
        d.el.setAttribute('cy', d.y0 + (d.y1 - d.y0) * t);
        if (t >= 1) {
          d.llegado = true;
          d.tLlegada = ahora;
          const r = resultado(p, d.destino);
          d.el.setAttribute('fill', COLOR[r]);
          d.el.setAttribute('r', 7);
          if (r === 'ok') p.atendidas++;
          else if (r === 'degradada') { p.atendidas++; p.degradadas++; }
          else p.rechazadas++;
        }
        return true;
      }
      const f = (ahora - d.tLlegada) / 400;
      if (f >= 1) { d.el.remove(); return false; }
      d.el.setAttribute('opacity', 1 - f);
      return true;
    });
  };

  // ---------------- Dibujo de estados ----------------
  const pintarCajas = () => {
    // Monolito
    const mCaido = estado.caidos.size > 0;
    if (mono.marco) {
      mono.marco.classList.toggle('caido', mCaido);
      mono.marco.classList.toggle('desplegando', mono.desplegando);
    }
    mono.aviso.textContent = mCaido ? 'SISTEMA CAÍDO' : mono.desplegando ? 'REDESPLEGANDO TODO…' : '';
    COMPONENTES.forEach((n) => {
      const c = mono.cajas[n];
      c.grupo.classList.toggle('origen', estado.caidos.has(n));
      c.grupo.classList.toggle('apagado', mCaido || mono.desplegando);
      c.grupo.classList.toggle('modulo', estado.shopify);
      c.sub.textContent = estado.caidos.has(n) ? '✗ falla aquí' : '';
    });
    // Microservicios
    COMPONENTES.forEach((n) => {
      const c = micro.cajas[n];
      const caido = estado.caidos.has(n);
      const sinDatos = n === 'Facturación' && estado.caidos.has('Base de datos') && !caido;
      const desplegando = n === 'Facturación' && micro.desplegando;
      c.grupo.classList.toggle('origen', caido || sinDatos);
      c.grupo.classList.toggle('desplegando', desplegando);
      let sub = '';
      if (caido) sub = n === 'Recomendaciones' ? '↺ usa Populares' : '✗ caído';
      else if (sinDatos) sub = '✗ sin su base';
      else if (desplegando) sub = 'desplegando…';
      c.sub.textContent = sub;
      c.grupo.classList.toggle('respaldo', caido && n === 'Recomendaciones');
    });
  };

  const puntos = (n) => '●'.repeat(n) + '○'.repeat(5 - n);

  const pintarMetricas = () => {
    paneles.forEach((p) => {
      const total = p.atendidas + p.rechazadas;
      const disp = total ? Math.round((p.atendidas / total) * 100) : 100;
      let servidores, despliegue, complejidad;
      if (p.tipo === 'mono') {
        servidores = estado.escalado ? '9 servidores (app completa ×3)' : '3 servidores (app completa)';
        despliegue = 'todo el sistema a la vez';
        complejidad = estado.shopify ? 2 : 1;
      } else {
        servidores = estado.escalado ? '8 instancias (+2 de Reproducción)' : '6 instancias pequeñas';
        despliegue = 'cada servicio por separado';
        complejidad = 4;
      }
      p.metricas.innerHTML = `
        <div><span>Atendidas</span><b class="verde">${p.atendidas}</b>${p.degradadas ? ` <small>(${p.degradadas} con respaldo)</small>` : ''}</div>
        <div><span>Rechazadas</span><b class="rosa">${p.rechazadas}</b></div>
        <div><span>Disponibilidad</span><b class="${disp >= 95 ? 'verde' : disp >= 70 ? 'amarillo' : 'rosa'}">${disp}%</b></div>
        <div><span>Servidores</span><b>${servidores}</b></div>
        <div><span>Despliegue</span><b>${despliegue}</b></div>
        <div class="${p.tipo === 'micro' && p.complejidadResaltada ? 'resaltado' : ''}"><span>Complejidad operativa</span><b class="mono">${puntos(complejidad)}</b></div>`;
    });
  };

  const decir = (html) => {
    mensaje.innerHTML = html;
    gsap.fromTo(mensaje, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.3 });
  };

  // ---------------- Escenarios ----------------
  const MENSAJES_ROMPER = {
    'Base de datos':
      '<b>Monolito:</b> una sola base de datos para todo. Como Netflix en agosto de 2008: una base de datos corrupta detuvo los envíos de DVD por tres días. ' +
      '<b>Microservicios:</b> cada servicio tiene sus propios datos; solo Facturación se queda sin su base.',
    Recomendaciones:
      '<b>Monolito:</b> un fallo no aislado tumba todo el proceso. ' +
      '<b>Microservicios:</b> la portada muestra "Populares" como respaldo y el video se sigue reproduciendo (puntos amarillos).',
  };

  function romper(nombre) {
    if (estado.caidos.has(nombre)) {
      estado.caidos.delete(nombre);
      decir(`<b>${nombre}</b> reparado.`);
    } else {
      estado.caidos.add(nombre);
      let txt = MENSAJES_ROMPER[nombre] ||
        `<b>Monolito:</b> un fallo no aislado tumba todo el proceso. <b>Microservicios:</b> solo cae ${nombre}; el resto sigue atendiendo.`;
      if (estado.shopify) txt += ' <i>Modo Shopify: los módulos ordenan el código, pero siguen en el mismo proceso, así que el fallo tumba todo igual.</i>';
      decir(txt);
    }
    raiz.classList.remove('modo-romper');
    pintarCajas();
  }

  const escenarios = {
    romper() {
      raiz.classList.add('modo-romper');
      decir('Hagan clic en <b>cualquier componente</b> (de cualquier lado) para romperlo en los dos sistemas. Clic otra vez para repararlo.');
    },

    estreno(boton) {
      if (estado.estreno) return;
      boton.disabled = true;
      estado.estreno = true;
      decir('<b>¡Estreno de una serie!</b> El tráfico se multiplica y casi todo va a <b>Reproducción</b>. Ambos sistemas empiezan a rechazar solicitudes…');
      despues(2200, () => {
        estado.escalado = true;
        dibujarEscalado(true);
        decir('<b>Monolito:</b> hay que copiar la aplicación <b>completa ×3</b>, aunque solo Reproducción estaba saturada. ' +
          '<b>Microservicios:</b> se escala <b>solo Reproducción</b> ×3. Comparen la fila "Servidores".');
      });
      despues(10000, () => {
        estado.estreno = false;
        estado.escalado = false;
        dibujarEscalado(false);
        boton.disabled = false;
        decir('Terminó el estreno: los servidores extra se apagan.');
      });
    },

    desplegar(boton) {
      if (mono.desplegando) return;
      boton.disabled = true;
      mono.desplegando = true;
      micro.desplegando = true;
      let txt = 'Cambiamos una línea de <b>Facturación</b>. <b>Monolito:</b> hay que redesplegar <b>todo el sistema</b> y mientras tanto nadie es atendido. ' +
        '<b>Microservicios:</b> solo se reinicia Facturación; ver videos sigue funcionando.';
      if (estado.shopify) txt += ' <i>Modo Shopify: el código está separado en módulos, pero el despliegue sigue siendo uno solo.</i>';
      decir(txt);
      pintarCajas();
      gsap.fromTo(mono.barraGlobal, { attr: { width: 0 } }, { attr: { width: 418 }, duration: 4.5, ease: 'none' });
      const b = micro.cajas['Facturación'].barra;
      gsap.fromTo(b, { attr: { width: 0 } }, { attr: { width: micro.cajas['Facturación'].w - 20 }, duration: 2, ease: 'none' });
      despues(2000, () => { micro.desplegando = false; gsap.set(b, { attr: { width: 0 } }); pintarCajas(); });
      despues(4500, () => {
        mono.desplegando = false;
        gsap.set(mono.barraGlobal, { attr: { width: 0 } });
        boton.disabled = false;
        pintarCajas();
        decir('Despliegue terminado. Fíjense cuántas solicitudes rechazó cada sistema mientras tanto.');
      });
    },

    depurar(boton) {
      boton.disabled = true;
      limpiarRastro();
      decir('Un usuario reporta: <b>"No puedo pagar mi suscripción"</b>. ¿Dónde está el error?');

      // Monolito: un solo registro
      const log = mk('g', { class: 'sim-log' }, mono.capaRastro);
      mk('rect', { x: 110, y: 196, width: 420, height: 70, rx: 8 }, log);
      const l1 = mk('text', { x: 122, y: 222 }, log);
      const l2 = mk('text', { x: 122, y: 248, class: 'ok' }, log);
      gsap.set(log, { opacity: 0 });
      despues(900, () => {
        gsap.to(log, { opacity: 1, duration: 0.3 });
        l1.textContent = 'ERROR Facturacion.cobrar() línea 42';
        despues(700, () => (l2.textContent = '✓ encontrado: 1 proceso, 1 registro'));
      });

      // Microservicios: la solicitud cruza 5 servicios por la red
      const ruta = ['Usuarios', 'Catálogo', 'Recomendaciones', 'Facturación', 'Base de datos'];
      const latencias = ['+12 ms', '+18 ms', '+25 ms', '+31 ms', '✗ timeout'];
      ruta.forEach((n, i) => {
        despues(900 + i * 900, () => {
          const c = micro.cajas[n];
          if (i > 0) {
            const a = micro.cajas[ruta[i - 1]];
            const linea = mk('line', { x1: a.cx, y1: a.cy, x2: a.cx, y2: a.cy, class: 'sim-rastro' }, micro.capaRastro);
            gsap.to(linea, { attr: { x2: c.cx, y2: c.cy }, duration: 0.5 });
          }
          const et = mk('text', { x: c.cx, y: c.y - 6, class: i === ruta.length - 1 ? 'sim-latencia error' : 'sim-latencia' }, micro.capaRastro);
          et.textContent = latencias[i];
          gsap.fromTo(c.rect, { attr: { 'stroke-width': 6 } }, { attr: { 'stroke-width': 2 }, duration: 0.8 });
        });
      });
      despues(900 + ruta.length * 900, () => {
        micro.complejidadResaltada = true;
        decir('<b>Monolito:</b> un solo registro, error encontrado rápido. ' +
          '<b>Microservicios:</b> hubo que seguir la solicitud por <b>5 servicios</b> y la red. Se necesita rastreo distribuido y monitoreo: ' +
          'esa es la <b>complejidad operativa</b> que no se ve en los diagramas.');
        boton.disabled = false;
        despues(4000, () => (micro.complejidadResaltada = false));
      });
    },

    shopify(boton) {
      estado.shopify = !estado.shopify;
      boton.classList.toggle('activo', estado.shopify);
      $('#sim-mono .sim-nombre').textContent = estado.shopify ? 'Monolito modular (Shopify)' : 'Monolito';
      decir(estado.shopify
        ? '<b>Monolito modular:</b> un solo despliegue, pero el código dividido en componentes con límites estrictos. Prueben romper o desplegar otra vez: ¿qué cambia y qué no?'
        : 'Volvimos al monolito tradicional.');
      pintarCajas();
    },

    reiniciar() {
      reiniciar();
      decir('Simulador reiniciado. Elijan un escenario.');
    },
  };

  const limpiarRastro = () => {
    mono.capaRastro.innerHTML = '';
    micro.capaRastro.innerHTML = '';
  };

  const dibujarEscalado = (si) => {
    mono.capaFantasmas.innerHTML = '';
    micro.cajas['Reproducción'].sombra.innerHTML = '';
    micro.cajas['Reproducción'].insignia.textContent = si ? '×3' : '';
    mono.cajas['Reproducción'].insignia.textContent = '';
    if (!si) return;
    [2, 1].forEach((k) => {
      const r = mk('rect', { x: 90 + k * 8, y: 18 - k * 8, width: 458, height: 264, rx: 14, class: 'sim-fantasma' }, mono.capaFantasmas);
      gsap.from(r, { opacity: 0, duration: 0.5, delay: (2 - k) * 0.2 });
    });
    const t = mk('text', { x: 540, y: 14, class: 'sim-insignia grande' }, mono.capaFantasmas);
    t.textContent = '×3 todo';
    const c = micro.cajas['Reproducción'];
    [2, 1].forEach((k) => {
      const r = mk('rect', { x: c.x + k * 6, y: c.y - k * 6, width: c.w, height: c.h, rx: 10, class: 'sim-fantasma' }, c.sombra);
      gsap.from(r, { opacity: 0, duration: 0.5, delay: (2 - k) * 0.2 });
    });
  };

  function reiniciar() {
    limpiarTemporizadores();
    gsap.killTweensOf([mono.barraGlobal, micro.cajas['Facturación'].barra]);
    estado.caidos.clear();
    estado.estreno = false;
    estado.escalado = false;
    estado.shopify = false;
    mono.desplegando = false;
    micro.desplegando = false;
    micro.complejidadResaltada = false;
    paneles.forEach((p) => {
      p.atendidas = p.degradadas = p.rechazadas = 0;
      p.puntos.forEach((d) => d.el.remove());
      p.puntos = [];
    });
    gsap.set([mono.barraGlobal, micro.cajas['Facturación'].barra], { attr: { width: 0 } });
    raiz.querySelectorAll('.sim-botones button').forEach((b) => { b.disabled = false; b.classList.remove('activo'); });
    raiz.classList.remove('modo-romper');
    $('#sim-mono .sim-nombre').textContent = 'Monolito';
    limpiarRastro();
    dibujarEscalado(false);
    pintarCajas();
    pintarMetricas();
  }

  raiz.querySelectorAll('.sim-botones button').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      escenarios[b.dataset.esc](b);
      b.blur(); // devolver el teclado a reveal.js para seguir navegando
    });
  });

  // ---------------- Bucle principal ----------------
  let ultimoLanzamiento = 0;
  let ultimasMetricas = 0;
  const bucle = (ahora) => {
    if (!estado.activo) return;
    const intervalo = estado.estreno ? 90 : 260;
    if (ahora - ultimoLanzamiento > intervalo) {
      paneles.forEach((p) => lanzarPunto(p, ahora));
      ultimoLanzamiento = ahora;
    }
    paneles.forEach((p) => actualizarPuntos(p, ahora));
    if (ahora - ultimasMetricas > 200) { pintarMetricas(); ultimasMetricas = ahora; }
    requestAnimationFrame(bucle);
  };

  window.Simulador = {
    iniciar() {
      if (estado.activo) return;
      estado.activo = true;
      requestAnimationFrame(bucle);
    },
    detener() {
      estado.activo = false;
    },
    reiniciar,
  };

  reiniciar();
  decir('Elijan un escenario. Pueden preguntarle a la clase <b>qué romper</b>.');
})();
