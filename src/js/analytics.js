// Centralized analytics instrumentation for Silksong Checklist
// Semantic GA4 wrapper with safe no-op fallbacks.
import { computePercent } from './progress.js';

const MILESTONES_KEY = 'ss_milestones_v1';
const SESSION_ID_KEY = 'ss_session_id_v1';
const MILESTONES = [25,50,75,90,100];

let _items = [];
let _progress = {};
let _getLocale = () => 'en';
let _milestonesHit = new Set();
let _initialized = false;
let _sessionStart = Date.now();
let _toggleCount = 0;

function g(){ return (typeof window!=='undefined' && typeof window.gtag==='function') ? window.gtag : () => {}; }

function loadMilestones(){ try { const raw = localStorage.getItem(MILESTONES_KEY); if(raw){ const arr = JSON.parse(raw); if(Array.isArray(arr)) arr.forEach(v=> _milestonesHit.add(v)); } } catch(_){} }
function saveMilestones(){ try { localStorage.setItem(MILESTONES_KEY, JSON.stringify([..._milestonesHit])); } catch(_){} }
function ensureSessionId(){ try { let v = sessionStorage.getItem(SESSION_ID_KEY); if(!v){ v = Math.random().toString(36).slice(2); sessionStorage.setItem(SESSION_ID_KEY, v); } return v; } catch(_){ return 'nosession'; } }
function deviceBreakpoint(){ try { const w = innerWidth; if(w<520) return 'xs'; if(w<840) return 'sm'; if(w<1140) return 'md'; return 'lg'; } catch(_){ return 'unknown'; } }

export function initAnalytics({ items, progress, getLocale }){
  if(_initialized) return; _initialized = true;
  _items = items; _progress = progress; if(typeof getLocale==='function') _getLocale = getLocale;
  loadMilestones();
  const { completedWeight, totalWeight } = computePercent(_items, _progress);
  const storedPercent = totalWeight ? Math.round((completedWeight/totalWeight)*100) : 0;
  const returning = !!localStorage.getItem('silksongChecklistLocale_v1');
  g()('set','user_properties', {
    locale: _getLocale(),
    returning_user: returning ? 'yes':'no',
    stored_progress_percent: storedPercent,
    device_breakpoint: deviceBreakpoint(),
    session_id: ensureSessionId()
  });
  setupVisibility();
  setupScrollMilestones();
}

export function trackLanguageChange(locale){
  g()('event','language_change',{ event_category:'User Interaction', event_label: locale, locale });
  g()('set','user_properties',{ locale });
}
export function trackCategoryToggle(category, action){
  g()('event', action==='expand' ? 'category_expand':'category_collapse', { event_category:'UI', event_label: category, locale:_getLocale() });
}
export function trackItemToggle(item){
  _toggleCount++;
  const p = computePercent(_items, _progress);
  const { completed, total, completedWeight, totalWeight, percent, optionalCompleted, optionalTotal } = p;
  const exact = totalWeight ? (completedWeight/totalWeight)*100 : 0;
  g()('event', _progress[item.id] ? 'item_completed':'item_unchecked', {
    item_id: item.id,
    item_name: (item.name?.en || item.id).slice(0,100),
    item_category: item.category,
    locale: _getLocale(),
    progress_percent: Math.round(exact*100)/100,
    progress_percent_floor: percent,
    item_weight: (typeof item.weight==='number'? item.weight:1),
    optional: (item.optional || item.weight===0) ? 1:0,
    core_completed: completed,
    core_total: total,
    optional_completed: optionalCompleted,
    optional_total: optionalTotal
  });
  if(_progress[item.id] && !item.optional && item.weight !== 0){
    const catCore = _items.filter(it => it.category===item.category && !(it.optional || it.weight===0));
    if(catCore.every(ci => _progress[ci.id])){
      g()('event','category_completed',{ category:item.category, category_core_total:catCore.length, progress_percent:Math.round(exact*100)/100, locale:_getLocale() });
    }
  }
  trackMilestones(p);
}
export function trackReset(count){ g()('event','checklist_reset',{ event_category:'User Interaction', value:count, completed_before_reset:count, locale:_getLocale() }); _toggleCount=0; }
export function trackSearch(q, visible){ g()('event','search',{ search_term:q.slice(0,80), results_visible:visible, locale:_getLocale() }); }

function trackMilestones(p){
  for(const m of MILESTONES){
    if(p.percent >= m && !_milestonesHit.has(m)){
      _milestonesHit.add(m); saveMilestones();
      if(m===100){
        g()('event','full_completion',{ locale:_getLocale(), core_total:p.total, core_completed:p.completed, optional_completed:p.optionalCompleted, optional_total:p.optionalTotal });
      } else {
        g()('event','progress_milestone',{ milestone:m, progress_percent:p.percent, locale:_getLocale() });
      }
    }
  }
}

function setupVisibility(){
  let lastVisible = Date.now();
  document.addEventListener('visibilitychange', () => {
    if(document.hidden){
      const ms = Date.now()-lastVisible;
      g()('event','visibility_change',{ state:'hidden', visible_ms:ms, locale:_getLocale() });
      sendSessionSummary();
    } else {
      lastVisible = Date.now();
      g()('event','visibility_change',{ state:'visible', locale:_getLocale() });
    }
  });
  window.addEventListener('beforeunload', () => { try { sendSessionSummary(); } catch(_){} });
}
function setupScrollMilestones(){
  const seen = new Set();
  function check(){
    const depth = Math.round((scrollY + innerHeight)/document.documentElement.scrollHeight*100);
    for(const m of MILESTONES){
      if(depth >= m && !seen.has(m)){ seen.add(m); g()('event','scroll_milestone',{ milestone:m, locale:_getLocale() }); }
    }
    if(seen.size===MILESTONES.length) removeEventListener('scroll', check);
  }
  addEventListener('scroll', check, { passive:true });
  setTimeout(check, 400);
}
function sendSessionSummary(){
  const { completed, total, completedWeight, totalWeight } = computePercent(_items,_progress);
  const pct = totalWeight ? (completedWeight/totalWeight)*100 : 0;
  g()('event','session_summary', { duration_sec:Math.round((Date.now()-_sessionStart)/1000), toggles:_toggleCount, core_percent:Math.round(pct*100)/100, core_completed:completed, core_total:total, locale:_getLocale() });
  _sessionStart = Date.now();
  _toggleCount = 0;
}

if(typeof window!=='undefined') window._analyticsDebug = { milestones:()=>[..._milestonesHit] };
