async function loadJSON(url){
  const r = await fetch(url,{cache:'no-store'});
  if(!r.ok) throw new Error('Load '+url);
  return r.json();
}
function ytId(u){try{const x=new URL(u); if(x.hostname.includes('youtu.be')) return x.pathname.slice(1); if(x.searchParams.get('v')) return x.searchParams.get('v'); const p=x.pathname.split('/'); const i=p.indexOf('embed'); if(i>=0 && p[i+1]) return p[i+1];}catch{} return '';}
function vmId(u){try{const x=new URL(u); return x.pathname.split('/').filter(Boolean).pop()||'';}catch{} return '';}

function embedHTML(v){
  if(v.platform==='youtube'){const id=ytId(v.url); return `<iframe loading="lazy" src="https://www.youtube.com/embed/${id}?rel=0" allowfullscreen></iframe>`;}
  if(v.platform==='vimeo'){const id=vmId(v.url); return `<iframe loading="lazy" src="https://player.vimeo.com/video/${id}" allowfullscreen></iframe>`;}
  if(v.platform==='file'){return `<video controls preload="metadata" poster="${v.thumb||''}"><source src="${v.url}" type="video/mp4"></video>`;}
  return '';
}

function block(v){
  return `
    <article class="video">
      <h3 class="title">${v.title||''}</h3>
      <div class="embed">${embedHTML(v)}</div>
    </article>
  `;
}

async function main(){
  document.getElementById('year').textContent = new Date().getFullYear();
  const items = await loadJSON('data/videos.json');
  // по желанию: сортировка по дате
  items.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));

  const root = document.getElementById('videos');
  root.innerHTML = items.map(block).join('');
}
main().catch(console.error);
