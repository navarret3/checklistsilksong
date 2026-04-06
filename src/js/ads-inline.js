// Inline ad initialization logic
// Ensures each inserted <ins class="adsbygoogle"> is initialized exactly once.
// Uses IntersectionObserver to delay push until slot is near viewport (reduces unused ad requests).
(function(){
  const FALLBACK_DELAY_MS = 5000; // collapse/fallback after 5s if not expanded
  function initSlot(ins){
    if(ins.dataset.adInitialized) return;
    const frame = ins.closest('.ad-frame, .ad-container');
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      ins.dataset.adInitialized = 'true';
      // Use ResizeObserver for efficient ad-load detection instead of polling
      if('ResizeObserver' in window){
        const observer = new ResizeObserver(()=>{
          if(ins.offsetWidth > 160 || ins.offsetHeight > 60){
            observer.disconnect();
            frame && frame.classList.add('loaded');
          }
        });
        observer.observe(ins);
        // Fallback timeout in case ad never loads
        setTimeout(()=>{
          observer.disconnect();
          if(frame && !frame.classList.contains('loaded') && !frame.classList.contains('error')){
            showFallback(frame, ins);
          }
        }, FALLBACK_DELAY_MS);
      } else {
        // Legacy fallback: single delayed check
        setTimeout(()=>{
          if(ins.offsetWidth > 160 || ins.offsetHeight > 60){
            frame && frame.classList.add('loaded');
          } else {
            showFallback(frame, ins);
          }
        }, FALLBACK_DELAY_MS);
      }
    } catch(e){
      console.warn('[Ads] init error', e);
      showFallback(frame, ins);
    }
  }
  function showFallback(frame, ins){
    if(!frame) return;
    // Collapse .ad-container slots silently (no "Ad not available" text)
    if(frame.classList.contains('ad-container')){
      frame.classList.add('ad-container--empty');
      return;
    }
    // .ad-frame: show fallback text
    frame.classList.add('error');
    if(!frame.querySelector('.ad-fallback')){
      const fb = document.createElement('div');
      fb.className = 'ad-fallback';
      fb.textContent = document.documentElement.lang === 'es' ? 'Publicidad no disponible' : 'Ad not available';
      frame.appendChild(fb);
    }
  }
  function initAll(){
    const slots = Array.from(document.querySelectorAll('.ad-frame ins.adsbygoogle, .ad-container ins.adsbygoogle'));
    slots.forEach(initSlot);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
