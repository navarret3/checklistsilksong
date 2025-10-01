import { loadData } from './dataLoader.js';
import { loadProgress, saveProgress, clearProgress, loadCollapsedCategories, saveCollapsedCategories, clearUIState } from './storage.js';
import { toggle } from './progress.js';
import { renderCategories, updatePercent, updateCategoryCounts } from './ui.js';
import { computePercent } from './progress.js';
import { setLocale, t, activeLocale } from './i18n.js';

(async function init(){
  try {
    await setLocale('en');
    const dataset = await loadData();
    const items = dataset.items;
    const progress = loadProgress(items.map(i=>i.id));

  const container = document.getElementById('categories');
  const percentValue = document.getElementById('progressPercentText');
  const progressFill = document.querySelector('.progress-bar__fill');
  const itemsRemainingEl = document.getElementById('itemsRemaining');
  const percentValueFloating = document.getElementById('progressPercentTextFloating');
  const itemsRemainingFloating = document.getElementById('itemsRemainingFloating');
  const progressFillFloating = document.querySelector('.progress-bar__fill--floating');
  const floatingWrap = document.getElementById('progressFloating');
  const langSel = document.getElementById('langSel');
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

    // Initial render
    rerenderList();

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

    langSel.onchange = async () => {
      const newLang = langSel.value.toLowerCase();
      await setLocale(newLang);
      applyI18n();
      rerenderList();
      
      // GA4 Tracking: Language change
      gtag('event', 'language_change', {
        event_category: 'User Interaction',
        event_label: newLang,
        custom_parameter_2: newLang
      });
    };

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

    // Theme toggle removed (design decision): default dark theme retained


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

    function updateBothPercents(){
      const { completed, total, completedWeight, totalWeight } = computePercent(items, progress);
      const rawPercent = totalWeight ? (completedWeight / totalWeight) * 100 : 0;
      const formattedPercent = formatWeightedPercent(rawPercent);
      const doneLabel = t('done.label') || 'Done';
      percentValue.textContent = formattedPercent + '% ' + doneLabel;
      percentValueFloating.textContent = formattedPercent + '% ' + doneLabel;
      const remaining = total - completed;
      let remText;
      if(remaining === 1){
        remText = t('items.remaining.singular') || '1 item remaining';
      } else {
        const plural = t('items.remaining.plural') || '{n} items remaining';
        remText = plural.replace('{n}', remaining);
      }
      itemsRemainingEl.textContent = remText;
      itemsRemainingFloating.textContent = remText;
      if(progressFill) progressFill.style.width = rawPercent + '%';
      if(progressFillFloating) progressFillFloating.style.width = rawPercent + '%';
      percentValue.title = percentValueFloating.title = formattedPercent + '% (' + completedWeight.toFixed(2).replace(/\.00$/,'') + ' / ' + totalWeight.toFixed(2).replace(/\.00$/,'') + ' weight)';
      // Refresh per-category counts each time global progress updates
      updateCategoryCounts(items, progress);
    }

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

    // Floating progress visibility logic (also adjust CSS var for height)
    (function(){
      const hero = document.querySelector('.hero');
      const controls = document.querySelector('.controls');
      if(!hero || !floatingWrap || !controls) return;
      function measure(){
        const floatH = floatingWrap.getBoundingClientRect().height || 60;
        document.documentElement.style.setProperty('--floating-total', (floatH + 8) + 'px');
        floatingWrap.style.top = '0px';
      }
      const showAfter = hero.offsetHeight * 0.55; // a bit earlier
      let visible = false;
      function onScroll(){
        const y = window.scrollY || document.documentElement.scrollTop;
        const should = y > showAfter;
        if(should !== visible){
          floatingWrap.classList.toggle('visible', should);
            controls.classList.toggle('hide-on-scroll', should);
          document.body.classList.toggle('with-floating-padding', should);
          if(should){ requestAnimationFrame(()=>{ measure(); }); }
          visible = should;
        }
      }
      window.addEventListener('scroll', onScroll, { passive:true });
      window.addEventListener('resize', ()=>{ if(visible) measure(); }, { passive:true });
      measure();
      onScroll();
    })();

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
