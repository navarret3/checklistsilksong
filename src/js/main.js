import { loadData } from './dataLoader.js';
import { loadProgress, saveProgress, clearProgress, loadCollapsedCategories, saveCollapsedCategories, clearUIState } from './storage.js';
import { toggle } from './progress.js';
import { renderCategories, updatePercent, updateCategoryCounts } from './ui.js';
import { computePercent } from './progress.js';
import { setLocale, t, activeLocale } from './i18n.js';

(async function init(){
  try {
    // Determine initial locale earlier (HTML bootstrap may have set data-locale)
    const LOCALE_KEY = 'silksongChecklistLocale_v1';
    const bootLocale = document.documentElement.getAttribute('data-locale') || localStorage.getItem(LOCALE_KEY) || 'en';
    await setLocale(bootLocale);
    document.documentElement.lang = bootLocale;
    const dataset = await loadData();
    const items = dataset.items;
    const progress = loadProgress(items.map(i=>i.id));

  const container = document.getElementById('categories');
  const percentValue = document.getElementById('progressPercentText');
  const progressFill = document.querySelector('.progress-bar__fill');
  // Removed header(topbar) progress elements
  // const topbarProgressFill = document.getElementById('topbarProgressFill');
  // const topbarProgressPercent = document.getElementById('topbarProgressPercent');
  // Added floating progress references
  const floatingProgress = document.getElementById('floatingProgress');
  const floatingProgressFill = document.getElementById('floatingProgressFill');
  const floatingProgressPercent = document.getElementById('floatingProgressPercent');
  const itemsRemainingEl = document.getElementById('itemsRemaining');
  const percentValueFloating = document.getElementById('progressPercentTextFloating'); // legacy (removed visually)
  const itemsRemainingFloating = document.getElementById('itemsRemainingFloating');
  const progressFillFloating = document.querySelector('.progress-bar__fill--floating');
  // Removed compact topbar progress elements (redundant)
  const topbarFill = null;
  const percentCompact = null;
  const floatingWrap = null; // removed
  // Language dropdown elements
  const langToggle = document.getElementById('langToggle');
  const langMenu = document.getElementById('langMenu');
  // LOCALE_KEY defined above
  const resetBtn = document.getElementById('resetBtn');
  const importBtn = document.getElementById('importBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importFileInput = document.getElementById('importFileInput');
  const infoBtn = document.getElementById('infoBtn');
  const infoModal = document.getElementById('infoModal');
  const expandAllBtn = document.getElementById('expandAllBtn');
  const collapseAllBtn = document.getElementById('collapseAllBtn');
  const issuesBox = document.getElementById('datasetIssues');
  const issuesList = document.getElementById('datasetIssuesList');
  const dismissIssues = document.getElementById('dismissIssues');
  const searchInput = document.getElementById('searchInput');
  // Celebration flag must be declared early to avoid TDZ if user already at 100% before later definitions
  let celebrationShown = false;

    // Validate dataset first
    validateDataset(items, issuesBox, issuesList, dismissIssues);

  // Precompute once (avoid recalculation during renders)
  const globalTotalWeight = items.reduce((s,it)=> s + (typeof it.weight==='number' && it.weight>0 ? it.weight : 1), 0);

    // Centralized toggle handler for items
    const handleItemToggle = (id) => {
      const changed = toggle(id, progress);
      if (changed) {
        // Batch save operations using microtask to collapse rapid toggles
        queueMicrotask(()=> saveProgress(progress));
        updateBothPercents();
        
        // GA4 Tracking: Item toggle
  const item = items.find(i => i.id === id);
  const { completed, total, completedWeight, totalWeight, percent } = computePercent(items, progress);
        const currentPercent = totalWeight ? (completedWeight / totalWeight) * 100 : 0;
        
  if (typeof window.trackChecklistProgress === 'function') {
          const action = progress[id] ? 'item_completed' : 'item_unchecked';
          window.trackChecklistProgress(
            action,
            item?.category || 'Unknown',
            item?.name || id,
            currentPercent
          );
          
          // Check if category is now complete
          if (progress[id] && item?.category && !(item.optional || item.weight===0)) {
            const categoryItems = items.filter(i => i.category === item.category);
            const categoryCompleted = categoryItems.filter(ci => !(ci.optional || ci.weight===0)).every(i => progress[i.id]);
            if (categoryCompleted) {
              window.trackCompletion('category_complete', categoryItems.length);
              gtag('event', 'category_completed', {
                event_category: 'Checklist',
                event_label: item.category,
                custom_parameter_1: currentPercent,
                value: categoryItems.length
              });
            }
          }
          
          // Track milestone achievements
          if (!(item?.optional || item?.weight===0)) {
            if (percent === 100 && progress[id]) {
              window.trackCompletion('full_checklist', total);
            } else if (percent >= 25 && percent < 30 && progress[id]) {
              window.trackChecklistProgress('milestone_25', 'Progress', '25% Completed', 25);
            } else if (percent >= 50 && percent < 55 && progress[id]) {
              window.trackChecklistProgress('milestone_50', 'Progress', '50% Completed', 50);
            } else if (percent >= 75 && percent < 80 && progress[id]) {
              window.trackChecklistProgress('milestone_75', 'Progress', '75% Completed', 75);
            }
          }
        }
      }
      return changed;
    };

    const allItems = items.slice();
    let lastQuery = '';

    // Centralized function to render the item list based on current filters/language
    const collapsedSet = new Set(loadCollapsedCategories());

    function applyCollapsedState(){
      // Only apply stored collapsed when no active search filter
      if(searchInput && searchInput.value.trim()) return;
      document.querySelectorAll('.cat').forEach(catEl => {
        const id = catEl.dataset.category;
        if(id && collapsedSet.has(id)) catEl.classList.add('collapsed');
      });
    }

    function rerenderList() {
      const lang = activeLocale();
      const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
      lastQuery = q;

      const itemsToRender = !q
        ? allItems
        : allItems.filter(it => (it.name?.[lang] || it.name?.en || '').toLowerCase().includes(q));

      renderCategories(container, itemsToRender, progress, handleItemToggle, globalTotalWeight);
      updateBothPercents();

      if (q) {
        document.querySelectorAll('.cat').forEach(c => c.classList.remove('collapsed'));
      } else {
        applyCollapsedState();
        // Re-apply in microtask in case CSS/layout or late inserted nodes appear
        queueMicrotask(applyCollapsedState);
      }
    }

  // Initial render (after locale set)
  rerenderList();
  document.body.classList.remove('pre-init');
    if(floatingProgress) floatingProgress.hidden = false;

    // Event listeners
    if (searchInput) {
      const SEARCH_DEBOUNCE = 180; // ms
      let searchTimer;
      searchInput.addEventListener('input', () => {
        const newQuery = searchInput.value.trim().toLowerCase();
        if (newQuery === lastQuery) return;
        clearTimeout(searchTimer);
        searchTimer = setTimeout(()=>{
          rerenderList();
          if (newQuery && typeof window.trackSearch === 'function') {
            clearTimeout(searchInput._searchTimeout);
            searchInput._searchTimeout = setTimeout(() => {
              const visibleItems = document.querySelectorAll('.item').length; // simplified count
              window.trackSearch(newQuery, visibleItems);
            }, 700);
          }
        }, SEARCH_DEBOUNCE);
      });
    }

    // Locale already applied before first render
    // Sync toggle visuals with current locale
    function syncLangVisual(locale){
      if(!langToggle) return;
      langToggle.dataset.lang = locale;
      const flag = langToggle.querySelector('.flag');
      const code = langToggle.querySelector('.lang-code');
      if(flag){ flag.classList.toggle('flag-en', locale==='en'); flag.classList.toggle('flag-es', locale==='es'); }
      if(code) code.textContent = locale.toUpperCase();
      if(langMenu){
        langMenu.querySelectorAll('[role="option"]').forEach(opt => {
          const optLang = opt.getAttribute('data-lang');
          opt.setAttribute('aria-selected', optLang === locale ? 'true' : 'false');
        });
      }
    }
    syncLangVisual(activeLocale());

    function closeMenu(){
      if(!langMenu || langMenu.hidden) return;
      langMenu.hidden = true;
      langToggle?.setAttribute('aria-expanded','false');
    }
    function openMenu(){
      if(!langMenu || !langMenu.hidden) return;
      langMenu.hidden = false;
      langToggle?.setAttribute('aria-expanded','true');
      // focus first selected or first option
      const selected = langMenu.querySelector('[aria-selected="true"]') || langMenu.querySelector('[role="option"]');
      selected && selected.focus?.();
    }

    if (langToggle) {
      langToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if(!langMenu) return;
        if(langMenu.hidden) openMenu(); else closeMenu();
      });
    }
    if (langMenu) {
      langMenu.addEventListener('click', async (e) => {
        const li = e.target.closest('[role="option"][data-lang]');
        if(!li) return;
        const next = li.getAttribute('data-lang');
        if(next && next !== activeLocale()){
          await setLocale(next);
          document.documentElement.lang = next;
          localStorage.setItem(LOCALE_KEY, next);
          syncLangVisual(next);
          applyI18n();
          rerenderList();
          gtag('event', 'language_change', { event_category:'User Interaction', event_label: next, custom_parameter_2: next });
        }
        closeMenu();
      });
      // Keyboard navigation
      langMenu.addEventListener('keydown', async (e) => {
        const options = Array.from(langMenu.querySelectorAll('[role="option"]'));
        const currentIndex = options.findIndex(o => o.getAttribute('aria-selected')==='true');
        if(['ArrowDown','ArrowUp'].includes(e.key)){
          e.preventDefault();
          let nextIndex = currentIndex;
          if(e.key==='ArrowDown') nextIndex = (currentIndex+1) % options.length; else nextIndex = (currentIndex-1+options.length)%options.length;
          options[nextIndex].focus?.();
        } else if(e.key==='Enter' || e.key===' '){
          e.preventDefault();
          const focused = document.activeElement;
            if(focused && focused.matches('[role="option"]')){
              focused.click();
            }
        } else if(e.key==='Escape'){
          e.preventDefault();
          closeMenu();
          langToggle?.focus();
        }
      });
    }
    // Global click to close menu
    document.addEventListener('click', (e) => {
      if(!langMenu || langMenu.hidden) return;
      if(e.target === langToggle || langToggle.contains(e.target)) return;
      if(e.target === langMenu || langMenu.contains(e.target)) return;
      closeMenu();
    });

    resetBtn.onclick = () => {
      if (!confirm(t('reset.confirm1') || 'Confirm reset?')) return;
      if (!confirm(t('reset.confirm2') || 'Really reset?')) return;
      
      // GA4 Tracking: Reset action
      const completedCount = Object.values(progress).filter(Boolean).length;
      gtag('event', 'checklist_reset', {
        event_category: 'User Interaction',
        event_label: 'Reset Progress',
        custom_parameter_3: completedCount,
        value: completedCount
      });
      
      clearProgress();
      clearUIState();
      collapsedSet.clear();
      for (const k of Object.keys(progress)) progress[k] = false;
      saveProgress(progress);

      // Reset search and re-render
      if (searchInput) searchInput.value = '';
      rerenderList();
    };

    // Expand / Collapse All
    if (expandAllBtn) expandAllBtn.onclick = () => {
      document.querySelectorAll('.cat').forEach(c => c.classList.remove('collapsed'));
      collapsedSet.clear();
      saveCollapsedCategories([...collapsedSet]);
    };
    if (collapseAllBtn) collapseAllBtn.onclick = () => {
      document.querySelectorAll('.cat').forEach(c => c.classList.add('collapsed'));
      collapsedSet.clear();
      document.querySelectorAll('.cat').forEach(c => { const id = c.dataset.category; if(id) collapsedSet.add(id); });
      saveCollapsedCategories([...collapsedSet]);
    };

    // Export
    if (exportBtn) exportBtn.onclick = () => {
      try {
        const exportObj = {
          format: 'silksong-checklist-v1',
          exportedAt: new Date().toISOString(),
          locale: activeLocale(),
          progress,
          collapsed: [...collapsedSet]
        };
        const blob = new Blob([JSON.stringify(exportObj,null,2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'silksong-checklist-backup.json';
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
      } catch(e){
        alert('Export failed: '+ e.message);
      }
    };

    // Import
    if (importBtn && importFileInput){
      importBtn.onclick = () => importFileInput.click();
      importFileInput.onchange = (ev) => {
        const file = ev.target.files && ev.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(reader.result);
            if(!data || typeof data !== 'object') throw new Error('Invalid file');
            if(data.progress && typeof data.progress === 'object'){
              // merge only existing ids
              let changed = 0;
              for(const id of Object.keys(progress)){
                if(Object.prototype.hasOwnProperty.call(data.progress,id)){
                  const val = !!data.progress[id];
                  if(progress[id] !== val){ progress[id]=val; changed++; }
                }
              }
              if(Array.isArray(data.collapsed)){
                collapsedSet.clear();
                data.collapsed.filter(v=> typeof v==='string').forEach(v=> collapsedSet.add(v));
                saveCollapsedCategories([...collapsedSet]);
              }
              saveProgress(progress);
              rerenderList();
              updateBothPercents();
              alert('Import OK ('+changed+' items applied).');
            } else {
              throw new Error('Missing progress object');
            }
          } catch(e){
            alert('Import failed: '+ e.message);
          } finally {
            importFileInput.value='';
          }
        };
        reader.readAsText(file);
      };
    }

    // Info Modal
    if(infoBtn && infoModal){
      const closeElementsHandler = (ev) => {
        const target = ev.target;
        if(target.matches('[data-close="infoModal"], .info-modal__backdrop')){
          infoModal.hidden = true;
          document.removeEventListener('keydown', escListener);
        }
      };
      const escListener = (e) => { if(e.key==='Escape'){ infoModal.hidden = true; document.removeEventListener('keydown', escListener); } };
      infoBtn.onclick = () => {
        infoModal.hidden = false;
        document.addEventListener('keydown', escListener);
        const focusable = infoModal.querySelector('button, [href], input, select, textarea');
        if(focusable) focusable.focus();
      };
      infoModal.addEventListener('click', closeElementsHandler);
    }

    function applyI18n(){
      document.querySelectorAll('[data-i18n]').forEach(el=>{
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
      });
    }
    applyI18n();

    /* ===== Service Worker update notice (Option A) ===== */
    // Creates (once) a small fixed banner prompting user to refresh when a new SW is waiting.
    function ensureUpdateBanner(){
      let banner = document.getElementById('updateAvailableBanner');
      if(!banner){
        banner = document.createElement('div');
        banner.id = 'updateAvailableBanner';
        banner.style.cssText = 'position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:400;display:flex;align-items:center;gap:.65rem;background:#1d262d;border:1px solid #32424d;padding:.6rem .85rem .65rem;border-radius:12px;font-size:.62rem;letter-spacing:.8px;font-weight:600;color:#d6e4ed;box-shadow:0 8px 28px -10px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.04);';
        banner.setAttribute('role','status');
        banner.setAttribute('aria-live','polite');
        banner.innerHTML = '<span data-i18n="update.available">New version available</span><button type="button" style="background:#25313a;color:#fff;border:1px solid #39576a;font-size:.6rem;font-weight:600;letter-spacing:.8px;padding:.4rem .65rem .45rem;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;gap:.35rem" data-action="reload"><span data-i18n="update.reload">Reload</span></button><button type="button" aria-label="Dismiss" data-action="dismiss" style="background:none;border:none;color:#9fb2c0;font-size:1rem;line-height:1;cursor:pointer;padding:.2rem .3rem .25rem">×</button>';
        document.body.appendChild(banner);
        applyI18n();
        banner.addEventListener('click', (e)=>{
          const btn = e.target.closest('[data-action]');
          if(!btn) return;
          const action = btn.getAttribute('data-action');
          if(action==='reload'){
            // Attempt to tell waiting SW to skip waiting then reload
            if(window._waitingServiceWorker){ window._waitingServiceWorker.postMessage({ type:'SKIP_WAITING' }); }
            setTimeout(()=> window.location.reload(), 120);
          } else if(action==='dismiss'){
            banner.remove();
          }
        });
      }
    }

    if('serviceWorker' in navigator){
      navigator.serviceWorker.getRegistration().then(reg => {
        if(!reg) return;
        // Listen for updates after initial load
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if(!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if(newWorker.state === 'installed' && navigator.serviceWorker.controller){
              window._waitingServiceWorker = newWorker;
              ensureUpdateBanner();
            }
          });
        });
        // If a waiting worker already exists (page opened during update)
        if(reg.waiting && navigator.serviceWorker.controller){
          window._waitingServiceWorker = reg.waiting;
          ensureUpdateBanner();
        }
      });
      // Handle SKIP_WAITING -> controllerchange
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // If we already triggered reload manually skip
      });
      // Message channel from SW (optional future use)
      navigator.serviceWorker.addEventListener('message', (e)=>{
        if(!e.data) return;
        if(e.data.type === 'SW_READY'){ /* could log or show debug */ }
      });
    }

    function spawnCelebration(){
      if(celebrationShown) return;
      celebrationShown = true;
      const root = document.createElement('div');
      root.className = 'celebration-confetti';
      root.setAttribute('aria-hidden','true');
      const COUNT = 42;
      for(let i=0;i<COUNT;i++){
        const p = document.createElement('span');
        p.className='confetti-piece';
        p.style.setProperty('--rx', (Math.random()*100)+'vw');
        p.style.setProperty('--delay', (Math.random()*0.6)+'s');
        p.style.setProperty('--hue', Math.floor(20+Math.random()*40));
        root.appendChild(p);
      }
      document.body.appendChild(root);
      setTimeout(()=>{ root.classList.add('fade'); }, 3200);
      setTimeout(()=>{ root.remove(); }, 5200);
      // Title pulse highlight
      const title = document.querySelector('.app-title');
      if(title){
        title.classList.add('celebrate');
        setTimeout(()=> title.classList.remove('celebrate'), 4500);
      }
    }
    function updateBothPercents(){
      const { completed, total, completedWeight, totalWeight } = computePercent(items, progress);
      const rawPercent = totalWeight ? (completedWeight / totalWeight) * 100 : 0;
      const formattedPercent = formatWeightedPercent(rawPercent);
  const doneLabel = t('done.label') || 'Done';
  percentValue.textContent = formattedPercent + '% ' + doneLabel;
  if(floatingProgressPercent) floatingProgressPercent.textContent = formattedPercent + '%';
  if(percentValueFloating) percentValueFloating.textContent = formattedPercent + '% ' + doneLabel;
      const remaining = total - completed;
      let remText;
      if(remaining === 1){
        remText = t('items.remaining.singular') || '1 item remaining';
      } else {
        const plural = t('items.remaining.plural') || '{n} items remaining';
        remText = plural.replace('{n}', remaining);
      }
      itemsRemainingEl.textContent = remText;
  if(itemsRemainingFloating) itemsRemainingFloating.textContent = remText;
  if(progressFill) progressFill.style.width = rawPercent + '%';
  if(progressFillFloating) progressFillFloating.style.width = rawPercent + '%';
  if(floatingProgressFill) floatingProgressFill.style.width = rawPercent + '%';
  // topbarFill / percentCompact removed
  percentValue.title = (percentValueFloating||percentValue).title = formattedPercent + '% (' + completedWeight.toFixed(2).replace(/\.00$/,'') + ' / ' + totalWeight.toFixed(2).replace(/\.00$/,'') + ' weight)';
      // Refresh per-category counts each time global progress updates
      updateCategoryCounts(items, progress);
      if(rawPercent >= 100 && totalWeight > 0){
        spawnCelebration();
      }
    }

    /* ===== Feedback Modal & Submission (Discord Webhook) ===== */
    (function setupFeedback(){
      const feedbackBtn = document.getElementById('feedbackBtn');
      const feedbackModal = document.getElementById('feedbackModal');
      if(!feedbackBtn || !feedbackModal) return;
      const form = document.getElementById('feedbackForm');
      const msgEl = document.getElementById('fbMsg');
      const typeEl = document.getElementById('fbType');
      const statusEl = document.getElementById('fbStatus');
      const sendBtn = document.getElementById('fbSendBtn');
      const webhookMeta = document.querySelector('meta[name="feedback-webhook"]');
      const webhookBase = (webhookMeta && webhookMeta.content || '').trim();
      let activeSending = false;

      function openFb(){
        feedbackModal.hidden = false;
        statusEl.hidden = true;
        statusEl.className = 'fb-status';
        form.reset();
        msgEl.focus();
        gtag('event','feedback_open',{ event_category:'Feedback' });
      }
      function closeFb(){
        feedbackModal.hidden = true;
      }
      feedbackBtn.addEventListener('click', openFb);
      feedbackModal.addEventListener('click', (e)=>{
        if(e.target.matches('[data-close="feedbackModal"], .feedback-modal__backdrop')) closeFb();
      });
      document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && !feedbackModal.hidden) closeFb(); });

      async function submitFeedback(e){
        e.preventDefault();
        if(activeSending) return;
        const raw = (msgEl.value||'').trim();
        if(raw.length < 10){
          statusEl.hidden = false; statusEl.textContent = t('feedback.status.tooShort') || 'Message too short.'; statusEl.className='fb-status fb-status--err'; return;
        }
        if(!webhookBase){
          statusEl.hidden = false; statusEl.textContent = 'Webhook not configured.'; statusEl.className='fb-status fb-status--err'; return;
        }
        activeSending = true;
        sendBtn.disabled = true; sendBtn.style.opacity='.6';
        statusEl.hidden = false; statusEl.textContent = t('feedback.status.sending') || 'Sending...'; statusEl.className='fb-status';
        const { completedWeight, totalWeight } = computePercent(items, progress);
        const percent = totalWeight ? Math.round((completedWeight/totalWeight)*100) : 0;
        const locale = activeLocale();
        const type = typeEl.value || 'other';
        const prefixKey = 'feedback.type.prefix.'+type;
        const prefix = t(prefixKey) || `[${type.toUpperCase()}]`;
        const ua = navigator.userAgent.split(')')[0]+')';
        const bodyLines = [
          `${prefix} ${raw}`,
          `Progress: ${percent}%`,
          `Locale: ${locale}`,
          `UA: ${ua}`
        ];
        const payload = { content: bodyLines.join('\n') };
        try {
          const res = await fetch(webhookBase, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
          if(!res.ok) throw new Error('HTTP '+res.status);
          statusEl.textContent = t('feedback.status.sent') || 'Feedback sent. Thank you!';
          statusEl.className = 'fb-status fb-status--ok';
          gtag('event','feedback_submit',{ event_category:'Feedback', event_label:type, value: percent });
          setTimeout(()=>{ closeFb(); }, 1400);
        } catch(err){
          statusEl.textContent = t('feedback.status.error') || 'Error sending feedback.';
          statusEl.className = 'fb-status fb-status--err';
        } finally {
          activeSending = false; sendBtn.disabled = false; sendBtn.style.opacity='';
        }
      }
      form.addEventListener('submit', submitFeedback);
    })();

    function formatWeightedPercent(v){
      if(v >= 100) return '100';
      // Keep up to 2 decimals, trim trailing zeros
      const r = Math.round(v * 100) / 100; // 2 decimals rounding
      const s = r.toFixed(2).replace(/0+$/,'').replace(/\.$/,'');
      return s;
    }

    function validateDataset(items, box, list, dismissBtn){
      if(!box || !list) return;
      const issues = [];
      const ids = new Set();
      const allowedCats = new Set();
      // We can decide whether to enforce a category allow-list; for now gather.
      for(const it of items){
        if(!it.id) issues.push('Item without id');
        else if(ids.has(it.id)) issues.push('Duplicate id: '+it.id); else ids.add(it.id);
        if(!it.category) issues.push('Item '+it.id+' missing category'); else allowedCats.add(it.category);
        if(!it.name || !it.name.en) issues.push('Item '+(it.id||'?')+' missing name.en');
      }
      if(items.length === 0) issues.push('No items loaded');
      // Additional cross checks (example: effect or requirements formatting) - simple length guard
      items.forEach(it=>{ if(it.effect && it.effect.length>300) issues.push('Effect too long on '+it.id); });
      if(issues.length){
        list.innerHTML='';
        for(const msg of issues.slice(0,40)){
          const li = document.createElement('li'); li.textContent = msg; list.appendChild(li);
        }
        if(issues.length>40){
          const li = document.createElement('li'); li.textContent = '...'+(issues.length-40)+' more'; list.appendChild(li);
        }
        box.style.display='block';
        dismissBtn.onclick = () => { box.style.display='none'; };
      }
    }

    // Floating progress removed: topbar always shows compact progress

    // Listen for category collapse/expand events to persist state
    container.addEventListener('categoryToggle', (e) => {
      const { category, collapsed } = e.detail || {};
      if(!category) return;
      if(collapsed) collapsedSet.add(category); else collapsedSet.delete(category);
      if(typeof console!== 'undefined') console.log('[UI STATE] categoryToggle', category, '=>', collapsed ? 'collapsed' : 'expanded');
      // Persist (low frequency) using microtask to batch if user clicks fast
      queueMicrotask(()=> saveCollapsedCategories([...collapsedSet]));
    });

    // Service worker removed during cleanup for simplicity (offline support disabled)
    
    // Advanced GA4 Tracking Setup
    // Lazy-init heavy tracking after first idle period for faster FCP
    requestIdleCallback?.(setupAdvancedTracking) || setTimeout(setupAdvancedTracking, 1200);
    function setupAdvancedTracking() {
      // Track session engagement
      let sessionStart = Date.now();
      let isEngaged = false;
      
      // Track engagement after 30 seconds or first interaction
      setTimeout(() => {
        if (!isEngaged) {
          gtag('event', 'session_engaged', {
            event_category: 'Engagement',
            engagement_time_msec: Date.now() - sessionStart
          });
          isEngaged = true;
        }
      }, 30000);
      
      // Track page visibility changes
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          gtag('event', 'page_hidden', {
            event_category: 'Engagement',
            value: Math.round((Date.now() - sessionStart) / 1000)
          });
        } else {
          sessionStart = Date.now();
          gtag('event', 'page_visible', {
            event_category: 'Engagement'
          });
        }
      });
      
      // Track scroll depth
      let maxScrollDepth = 0;
      const trackScrollDepth = () => {
        const scrollPercent = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
        if (scrollPercent > maxScrollDepth && scrollPercent >= 25) {
          maxScrollDepth = Math.floor(scrollPercent / 25) * 25; // Track in 25% increments
          gtag('event', 'scroll_depth', {
            event_category: 'Engagement',
            event_label: `${maxScrollDepth}%`,
            value: maxScrollDepth
          });
        }
      };
      
      window.addEventListener('scroll', trackScrollDepth, { passive: true });
      
      // Track performance metrics
      if ('performance' in window && 'getEntriesByType' in performance) {
        window.addEventListener('load', () => {
          setTimeout(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
              gtag('event', 'page_load_timing', {
                event_category: 'Performance',
                custom_parameter_1: Math.round(navigation.loadEventEnd - navigation.fetchStart),
                value: Math.round(navigation.loadEventEnd - navigation.fetchStart)
              });
            }
          }, 0);
        });
      }
    }

  } catch(e){
    console.error('[INIT] Failure', e);
  const container = document.getElementById('categories');
    if(container) container.innerHTML = `<p style="color:#f66">Init error: ${e.message}</p>`;
  }
})();
