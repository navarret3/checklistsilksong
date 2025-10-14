// Inline ad initialization logic
// Ensures each inserted <ins class="adsbygoogle"> inside .ad-frame is initialized exactly once.
// Uses IntersectionObserver to delay push until slot is near viewport (reduces unused ad requests).
(function(){
  const CLIENT = 'ca-pub-9707168065012640';
  function initSlot(ins){
    if(ins.dataset.adInitialized) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      ins.dataset.adInitialized = 'true';
      const frame = ins.closest('.ad-frame');
      if(frame) frame.classList.add('loaded');
    } catch(e){
      console.warn('[Ads] init error', e);
    }
  }
  function observeSlots(){
    const slots = Array.from(document.querySelectorAll('.ad-frame ins.adsbygoogle'));
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
      slots.forEach(s=> io.observe(s));
    } else {
      slots.forEach(initSlot);
    }
  }
  // Defer until DOMContentLoaded in case module loaded early
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', observeSlots);
  } else {
    observeSlots();
  }
})();
