// Lightweight AdSense helper: lazy-initialize ad units when they enter viewport
// Usage: Place <ins class="adsbygoogle" data-ad-slot="XXXX" ...></ins> with data-ad-status! Once visible we push.
// We avoid pushing before visibility to reduce layout shifts and respect performance.

const ADS_ATTR = 'data-ad-slot';
let observer; let initialized = false;

function pushAd(ins){
  if(!window.adsbygoogle) return; // script maybe blocked
  if(ins.dataset.adProcessed) return; // idempotent
  try {
    window.adsbygoogle.push({});
    ins.dataset.adProcessed = '1';
  } catch(e){
    // Ignore; AdSense sometimes throws if double-pushed
  }
}

function scan(){
  const nodes = document.querySelectorAll('ins.adsbygoogle');
  nodes.forEach(ins => {
    if(!ins.getAttribute(ADS_ATTR)) return; // slot missing
    if(observer) observer.observe(ins);
  });
}

export function initAds(){
  if(initialized) return; initialized = true;
  if(!('IntersectionObserver' in window)){
    // Fallback: push all after a small delay
    setTimeout(()=>{
      document.querySelectorAll('ins.adsbygoogle['+ADS_ATTR+']').forEach(pushAd);
    }, 1200);
    return;
  }
  observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        observer.unobserve(e.target);
        pushAd(e.target);
      }
    });
  }, { rootMargin: '120px 0px 120px 0px', threshold: 0.01 });
  scan();
  // Rescan after dynamic content renders (categories render) - micro + delayed
  requestAnimationFrame(scan);
  setTimeout(scan, 2500);
}

// Expose manual trigger (debug)
if(typeof window !== 'undefined') window._adsInit = initAds;
