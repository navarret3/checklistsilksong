// Inline ad initialization logic
// Ensures each inserted <ins class="adsbygoogle"> inside .ad-frame is initialized exactly once.
// Uses IntersectionObserver to delay push until slot is near viewport (reduces unused ad requests).
(function(){
  const CLIENT = 'ca-pub-9707168065012640';
  function initSlot(ins){
    if(ins.dataset.adInitialized) return;
    const frame = ins.closest('.ad-frame');
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      ins.dataset.adInitialized = 'true';
      // Poll for width expansion (AdSense will rewrite styles asynchronously)
      let tries = 0;
      const POLL_MAX = 40; // ~4s at 100ms interval
      const interval = setInterval(()=>{
        const w = ins.offsetWidth;
        const h = ins.offsetHeight;
        if(w > 160 || h > 60){ // heuristic: ad has rendered a reasonable size
          clearInterval(interval);
          frame && frame.classList.add('loaded');
        } else if(++tries >= POLL_MAX){
          clearInterval(interval);
          console.warn('[Ads] render timeout for slot', ins.getAttribute('data-ad-slot'));
          frame && frame.classList.add('error');
        }
      }, 100);
    } catch(e){
      console.warn('[Ads] init error', e);
      frame && frame.classList.add('error');
    }
  }
  function observeSlots(){
    const slots = Array.from(document.querySelectorAll('.ad-frame ins.adsbygoogle'));
    // Filter out those that already have a sibling inline <script> push (we assume immediate init)
    const filtered = slots.filter(ins => {
      const hasInlinePush = !!ins.parentElement?.querySelector('script:not([src])');
      if(hasInlinePush){
        // Mark loaded quickly (poller will still verify size but avoid double push)
        ins.dataset.adInitialized = 'true';
        const frame = ins.closest('.ad-frame');
        frame && frame.classList.add('loaded');
        return false;
      }
      return true;
    });
    if(!slots.length) return;
    if('IntersectionObserver' in window){
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(en=>{
          if(en.isIntersecting){
            io.unobserve(en.target);
            initSlot(en.target);
          }
        });
      }, { root:null, rootMargin:'180px 0px 180px 0px', threshold:0 });
      filtered.forEach(s=> io.observe(s));
    } else {
      filtered.forEach(initSlot);
    }
  }
  // Defer until DOMContentLoaded in case module loaded early
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', observeSlots);
  } else {
    observeSlots();
  }
})();
