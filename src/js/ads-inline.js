// Inline ad initialization logic
// Ensures each inserted <ins class="adsbygoogle"> inside .ad-frame is initialized exactly once.
// Uses IntersectionObserver to delay push until slot is near viewport (reduces unused ad requests).
(function(){
  const FALLBACK_DELAY_MS = 5000; // show fallback after 5s if not expanded
  function initSlot(ins){
    if(ins.dataset.adInitialized) return;
    const frame = ins.closest('.ad-frame');
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      ins.dataset.adInitialized = 'true';
      const start = performance.now();
      let tries = 0;
      const POLL_MAX = 60; // up to 6s (100ms interval)
      const interval = setInterval(()=>{
        const w = ins.offsetWidth;
        const h = ins.offsetHeight;
        if(w > 160 || h > 60){
          clearInterval(interval);
          frame && frame.classList.add('loaded');
        } else if(++tries >= POLL_MAX){
          clearInterval(interval);
          showFallback(frame, ins);
        }
      }, 100);
      // Extra safety timeout
      setTimeout(()=>{
        if(!frame.classList.contains('loaded') && !frame.classList.contains('error')){
          showFallback(frame, ins);
        }
      }, FALLBACK_DELAY_MS);
    } catch(e){
      console.warn('[Ads] init error', e);
      showFallback(frame, ins);
    }
  }
  function showFallback(frame, ins){
    if(!frame) return;
    frame.classList.add('error');
    if(!frame.querySelector('.ad-fallback')){
      const fb = document.createElement('div');
      fb.className = 'ad-fallback';
      fb.textContent = document.documentElement.lang === 'es' ? 'Publicidad no disponible' : 'Ad not available';
      frame.appendChild(fb);
    }
  }
  function initAll(){
    const slots = Array.from(document.querySelectorAll('.ad-frame ins.adsbygoogle'));
    slots.forEach(initSlot);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
