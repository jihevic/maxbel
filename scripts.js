async function j(url){const r=await fetch(url,{cache:'no-store'}); if(!r.ok) throw new Error('Load '+url); return r.json();}
function ytId(u){try{const x=new URL(u); if(x.hostname.includes('youtu.be')) return x.pathname.slice(1); if(x.searchParams.get('v')) return x.searchParams.get('v'); const p=x.pathname.split('/'); const i=p.indexOf('embed'); if(i>=0 && p[i+1]) return p[i+1];}catch{} return '';}
function vmId(u){try{const x=new URL(u); return x.pathname.split('/').filter(Boolean).pop()||'';}catch{} return '';}
function embedHTML(v){
  if(v.platform==='youtube'){const id=ytId(v.url); return `<iframe loading="lazy" src="https://www.youtube.com/embed/${id}?rel=0" allowfullscreen></iframe>`;}
  if(v.platform==='vimeo'){const id=vmId(v.url); return `<iframe loading="lazy" src="https://player.vimeo.com/video/${id}" allowfullscreen></iframe>`;}
  if(v.platform==='file'){return `<video controls preload="metadata" poster="${v.thumb||''}"><source src="${v.url}" type="video/mp4"></video>`;}
  return '';
}
function card(v){return `
  <article class="card">
    <div class="embed">${embedHTML(v)}</div>
    <div class="body">
      <h3 class="h3">${v.title||''}</h3>
      <p class="meta">${[v.client,v.date].filter(Boolean).join(' · ')}</p>
      <p class="tags">${(v.tags||[]).map(t=>'#'+t).join(' ')}</p>
    </div>
  </article>`;}
function uniqTags(items){return Array.from(new Set(items.flatMap(v=>v.tags||[]))).sort((a,b)=>a.localeCompare(b));}
function filterItems(items, tab, q){
  const qn=(q||'').trim().toLowerCase();
  return items.filter(v=>{
    const byTab = (tab==='Все') || (v.tags||[]).includes(tab);
    const txt = [v.title||'', v.client||''].join(' ').toLowerCase();
    const byQ = !qn || txt.includes(qn);
    return byTab && byQ;
  });
}
function renderTabs(tags,current){return ['Все',...tags].map(t=>`<button type="button" data-tab="${t}" aria-pressed="${t===current}">${t}</button>`).join('');}
function updateStats(items){
  document.getElementById('count').textContent = String(items.length);
  const clients = new Set(items.map(x=>x.client).filter(Boolean));
  document.getElementById('clients').textContent = String(clients.size);
  const years = new Set(items.map(x=>String(x.date||'').slice(0,4)).filter(Boolean));
  document.getElementById('years').textContent = String(years.size);
}

async function main(){
  document.getElementById('year').textContent = new Date().getFullYear();
  const items = await j('data/videos.json');
  items.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));

  const tabsEl = document.getElementById('tabs');
  const gridEl = document.getElementById('videos');
  const searchEl = document.getElementById('search');

  let current = 'Все';
  let tags = uniqTags(items);
  tabsEl.innerHTML = renderTabs(tags,current);
  updateStats(items);

  function render(){
    const filtered = filterItems(items, current, searchEl.value);
    gridEl.innerHTML = filtered.map(card).join('');
    updateStats(filtered);
  }

  tabsEl.addEventListener('click', e=>{
    const b=e.target.closest('button[data-tab]'); if(!b) return;
    current = b.dataset.tab;
    tabsEl.innerHTML = renderTabs(tags,current);
    render(); window.scrollTo({top:0,behavior:'smooth'});
  });

  let t; searchEl.addEventListener('input', ()=>{
    clearTimeout(t); t=setTimeout(render, 150);
  });

  render();
}
main().catch(console.error);
