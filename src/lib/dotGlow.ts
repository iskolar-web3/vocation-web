// Flashlight on the dot grid. Outer window follows the pointer; inner dots counter-move so they
// stay aligned with the fixed base grid (see .dot-glow in index.css). Transforms only.
export function initDotGlow() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const el = document.createElement('div');
  el.className = 'dot-glow';
  el.setAttribute('aria-hidden', 'true');
  const dots = document.createElement('i');
  el.appendChild(dots);
  document.body.appendChild(el);

  let x = 0;
  let y = 0;
  let raf = 0;
  const paint = () => {
    raf = 0;
    el.style.transform = `translate3d(${x}px,${y}px,0)`;
    dots.style.transform = `translate3d(${-x}px,${-y}px,0)`;
  };
  addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      el.dataset.on = '';
      if (!raf) raf = requestAnimationFrame(paint);
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => {
    delete el.dataset.on;
  });
}
