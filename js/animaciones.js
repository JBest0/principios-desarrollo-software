// Inicialización de reveal.js y animaciones propias con GSAP

Reveal.initialize({
  hash: true,
  slideNumber: 'c/t',
  plugins: [RevealHighlight, RevealNotes, RevealZoom],
});

gsap.registerPlugin(Flip);

// Ciclo Red → Green → Refactor cuando se llega a la diapositiva #demo-tdd
Reveal.on('slidechanged', (evento) => {
  if (evento.currentSlide.id !== 'demo-tdd') return;
  const pasos = evento.currentSlide.querySelectorAll('.paso');
  gsap.set(pasos, { opacity: 0.25, scale: 1 });
  gsap.timeline({ repeat: 1 })
    .to(pasos[0], { opacity: 1, scale: 1.2, duration: 0.5 })
    .to(pasos[0], { opacity: 0.25, scale: 1, duration: 0.3 }, '+=0.4')
    .to(pasos[1], { opacity: 1, scale: 1.2, duration: 0.5 })
    .to(pasos[1], { opacity: 0.25, scale: 1, duration: 0.3 }, '+=0.4')
    .to(pasos[2], { opacity: 1, scale: 1.2, duration: 0.5 })
    .to(pasos[2], { opacity: 0.25, scale: 1, duration: 0.3 }, '+=0.4');
});
