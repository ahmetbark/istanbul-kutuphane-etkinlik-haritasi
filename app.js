'use strict';
// Handles quoted fields, escaped quotes, commas and CRLF without a dependency.
function parseCSV(text) {
  const rows=[]; let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++) {const c=text[i];
    if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}
    else if(c===','&&!quoted){row.push(field);field='';}
    else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(Boolean))rows.push(row);row=[];field='';}
    else field+=c;
  }
  if(quoted)throw new Error('CSV içinde kapanmamış tırnak.');
  if(field||row.length){row.push(field);rows.push(row);}
  const headers=rows.shift();return rows.map(values=>Object.fromEntries(headers.map((h,i)=>[h,values[i]])));
}
const number=new Intl.NumberFormat('tr-TR');
const decimal=new Intl.NumberFormat('tr-TR',{maximumFractionDigits:2});
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=id=>document.getElementById(id);
const normalize=s=>s.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
const libraries=parseCSV(window.LIBRARY_CSV).map(r=>{const events=Number(r['2025 Yili Etkinlik Sayisi']),participants=Number(r['2025 Yili Katilimci Sayisi']);return {id:r._id,name:r['Kutuphane Adi'],district:r.Ilce,events,participants,ratio:events>0?participants/events:null,...window.LIBRARY_COORDINATES[r._id]};});
for(const d of [...new Set(libraries.map(r=>r.district))].sort((a,b)=>a.localeCompare(b,'tr'))) {const option=document.createElement('option');option.value=d;option.textContent=d;$('district').append(option);}
$('minimum').max=Math.max(...libraries.map(r=>r.events));
let map,layer;const markers=new Map();
if(window.L){map=L.map('map',{scrollWheelZoom:false}).setView([41.035,28.99],10);if(location.protocol!=='file:')L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).on('tileerror',()=>{$('mapStatus').hidden=false;$('mapStatus').textContent='Harita zemini yüklenemedi. İnternet bağlantınızı kontrol edin; kütüphane verileri listede kullanılabilir.';}).on('load',()=>{$('mapStatus').hidden=true;}).addTo(map);layer=L.layerGroup().addTo(map);if(location.protocol==='file:'){$('mapStatus').hidden=false;$('mapStatus').textContent='Harita zeminini açmak için klasördeki HARITAYI-AC.cmd dosyasını çalıştırın. Doğrudan dosyadan açmak OpenStreetMap tarafından engellenebilir.';}}
else {$('mapStatus').hidden=false;$('mapStatus').textContent='Harita bileşeni yüklenemedi. Paket içindeki vendor klasörünü kontrol edin.';}
function filtered(){return libraries.filter(r=>(!$('district').value||r.district===$('district').value)&&r.events>=Number($('minimum').value)&&normalize(r.name+' '+r.district).includes(normalize($('search').value.trim())));}
function fit(){const rows=filtered().filter(r=>Number.isFinite(r.lat)&&Number.isFinite(r.lng));if(map&&rows.length){map.stop();map.fitBounds(rows.map(r=>[r.lat,r.lng]),{padding:[45,65],maxZoom:14,animate:false});}}
function color(v,min,max){const t=max===min?.5:Math.max(0,Math.min(1,(v-min)/(max-min)));const a=t<.5?[234,191,101]:[129,173,140],b=t<.5?[129,173,140]:[21,94,85],f=t<.5?t*2:(t-.5)*2;return 'rgb('+a.map((x,i)=>Math.round(x+(b[i]-x)*f)).join(',')+')';}
function popup(r){return `<h3>${escapeHTML(r.name)}</h3><span class="popup-district">${escapeHTML(r.district)} · 2025</span><div class="popup-stats"><div><b>${number.format(r.events)}</b><small>ETKİNLİK</small></div><div><b>${number.format(r.participants)}</b><small>KATILIMCI</small></div></div><div class="popup-ratio"><b>${r.ratio===null?'—':decimal.format(r.ratio)}</b> katılımcı / etkinlik</div><a class="popup-source" href="${escapeHTML(r.source)}" target="_blank" rel="noopener">İBB konum kaynağı ↗</a><small>${escapeHTML(r.accuracy)}</small>`;}
function render(){const rows=filtered(),events=rows.reduce((s,r)=>s+r.events,0),people=rows.reduce((s,r)=>s+r.participants,0);$('minValue').value=$('minimum').value;$('kLibraries').textContent=number.format(rows.length);$('kDistricts').textContent=new Set(rows.map(r=>r.district)).size+' ilçede';$('kEvents').textContent=number.format(events);$('kPeople').textContent=number.format(people);$('kRatio').textContent=events?decimal.format(people/events):'—';$('count').textContent=rows.length+' sonuç';
 const metric=$('metric').value;const values=libraries.map(r=>r[metric]).filter(v=>v!==null);const min=Math.min(...values),max=Math.max(...values);$('legendTitle').textContent=$('metric').selectedOptions[0].textContent;$('legendMin').textContent=decimal.format(min);$('legendMax').textContent=decimal.format(max);
 if(layer)layer.clearLayers();markers.clear();$('list').replaceChildren();
 for(const r of [...rows].sort((a,b)=>b.participants-a.participants)){if(map&&Number.isFinite(r.lat)&&Number.isFinite(r.lng)){const marker=L.circleMarker([r.lat,r.lng],{radius:6+Math.sqrt(r.participants/2400)*16,color:'#fff',weight:2,fillColor:color(r[metric]??min,min,max),fillOpacity:.9}).addTo(layer).bindPopup(popup(r));marker.bindTooltip(escapeHTML(r.name),{direction:'top'});markers.set(r.id,marker);const element=marker.getElement();if(element){element.setAttribute('tabindex','0');element.setAttribute('role','button');element.setAttribute('aria-label',r.name);element.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();marker.openPopup();}});}}
 const button=document.createElement('button');button.className='library';button.innerHTML=`<b>${escapeHTML(r.name.replace(/^İBB /,''))}</b><span><span>${escapeHTML(r.district)}</span><span>${number.format(r.participants)} katılım</span></span>`;button.addEventListener('click',()=>{if(map&&markers.has(r.id)){map.stop();map.setView([r.lat,r.lng],14,{animate:false});markers.get(r.id).openPopup();}});$('list').append(button);}
 if(!rows.length){const p=document.createElement('p');p.className='empty';p.textContent='Bu filtrelerle eşleşen kütüphane yok. Filtreleri sıfırlayabilirsiniz.';$('list').append(p);}
}
for(const id of ['search','district','minimum','metric'])$(id).addEventListener(id==='search'||id==='minimum'?'input':'change',()=>{render();if(id==='district')fit();});
$('reset').addEventListener('click',()=>{$('search').value='';$('district').value='';$('minimum').value=0;$('metric').value='ratio';render();fit();});$('fit').addEventListener('click',fit);render();fit();

