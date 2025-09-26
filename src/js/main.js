import { loadData } from './dataLoader.js';
import { loadProgress, saveProgress, clearProgress } from './storage.js';
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
  const themeBtn = document.getElementById('themeBtn');
  const issuesBox = document.getElementById('datasetIssues');
  const issuesList = document.getElementById('datasetIssuesList');
  const dismissIssues = document.getElementById('dismissIssues');
  const searchInput = document.getElementById('searchInput');

    // Validate dataset first
    validateDataset(items, issuesBox, issuesList, dismissIssues);

    const globalTotalWeight = items.reduce((s,it)=> s + (typeof it.weight==='number' && it.weight>0 ? it.weight : 1), 0);

    // Centralized toggle handler for items
    const handleItemToggle = (id) => {
      const changed = toggle(id, progress);
      if (changed) {
        saveProgress(progress);
        updateBothPercents();
      }
      return changed;
    };

    const allItems = items.slice();
    let lastQuery = '';

    // Centralized function to render the item list based on current filters/language
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
      }
    }

    // Initial render
    rerenderList();

    // Event listeners
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        // Prevent re-render if value is identical (e.g., pressing arrow keys)
        if (searchInput.value.trim().toLowerCase() !== lastQuery) {
          rerenderList();
        }
      });
    }

    langSel.onchange = async () => {
      await setLocale(langSel.value.toLowerCase());
      applyI18n();
      rerenderList(); // This will re-render the list with the new language
    };

    resetBtn.onclick = () => {
      if (!confirm(t('reset.confirm1') || 'Confirm reset?')) return;
      if (!confirm(t('reset.confirm2') || 'Really reset?')) return;
      clearProgress();
      for (const k of Object.keys(progress)) progress[k] = false;
      saveProgress(progress);

      // Reset search and re-render
      if (searchInput) searchInput.value = '';
      rerenderList();
    };

    // Theme toggle
    themeBtn.onclick = () => {
      document.body.classList.toggle('theme-light');
      localStorage.setItem('ssTheme', document.body.classList.contains('theme-light') ? 'light' : 'dark');
    };
    // Load stored theme
    (function(){
      const th = localStorage.getItem('ssTheme');
      if(th === 'light') document.body.classList.add('theme-light');
    })();


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

  } catch(e){
    console.error('[INIT] Failure', e);
  const container = document.getElementById('categories');
    if(container) container.innerHTML = `<p style="color:#f66">Init error: ${e.message}</p>`;
  }
})();
