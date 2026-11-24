(function(){
'use strict';

const appBuild=(document.querySelector('meta[name="app-build"]')||{}).content||'';
function stableCodeId(source){
 let n=2166136261;for(let i=0;i<source.length;i++){n^=source.charCodeAt(i);n=Math.imul(n,16777619)}
 return(n>>>0).toString(36);
}
const loadedCodeId=stableCodeId(appBuild);
let latestAppCodeId=null;
let lastUpdateCheck=0;
let updateInProgress=false;
function setUpdateStatus(message){const el=document.getElementById('update-status');if(el)el.textContent=message}
function applyFreshVersion(remoteCodeId){
 const version=remoteCodeId||latestAppCodeId;
 if(!version){setUpdateStatus('尚未取得可用更新，請稍後再試。');return}
 const url=new URL(window.location.href);
 url.searchParams.set('app_rev',version);
 // Unique URL bypasses an old cached home-screen document and GitHub Pages CDN cache.
 url.searchParams.set('app_refresh',String(Date.now()));
 window.location.replace(url.toString());
}
async function checkFreshVersion({userRequested=false,autoReload=false}={}){
 if(updateInProgress)return {status:'busy'};
 const time=Date.now();
 if(!userRequested&&time-lastUpdateCheck<55000)return {status:'skipped'};
 lastUpdateCheck=time;updateInProgress=true;
 if(userRequested)setUpdateStatus('正在連線確認最新版本…');
 try{
  const requested=new URL('index.html',window.location.href);
  requested.searchParams.set('check',String(time));
  const reply=await fetch(requested.toString(),{cache:'no-store',credentials:'same-origin'});
  if(!reply.ok)throw Error('HTTP '+reply.status);
  const fetchedHtml=await reply.text();
  const freshBuild=fetchedHtml.match(/<meta name="app-build" content="([^"]+)">/)?.[1]||'';
  if(!freshBuild)throw Error('無法辨識新版內容');
  const remoteId=stableCodeId(freshBuild);
  const updated=remoteId!==loadedCodeId||(freshBuild&&appBuild&&freshBuild!==appBuild);
  if(updated){
   latestAppCodeId=remoteId;
   document.getElementById('update-banner').hidden=false;
   setUpdateStatus('已找到新版，點「立即更新」即可切換。');
   const attemptedRev=new URLSearchParams(window.location.search).get('app_rev');
   if(autoReload&&attemptedRev!==remoteId)applyFreshVersion(remoteId);
   return {status:'updated',version:remoteId};
  }else{
   latestAppCodeId=null;
   document.getElementById('update-banner').hidden=true;
   setUpdateStatus('已是最新版（'+(freshBuild||appBuild||loadedCodeId)+'）。');
   return {status:'current'};
  }
 }catch(e){
  const message='目前無法確認更新：'+String(e.message||e)+'。請檢查網路後重試。';
  if(userRequested)setUpdateStatus(message);
  return {status:'error',message};
 }finally{updateInProgress=false}
}


/* Touch-based pull-to-refresh: active only at the top of the page, with horizontal
   swipes, form controls, internal scroll areas, and map interactions untouched. */
const pullUi=document.getElementById('pull-refresh');
const pullText=document.getElementById('pull-text');
const pullIcon=document.getElementById('pull-icon');
const pullThreshold=95;
const pullState={tracking:false,pulling:false,startX:0,startY:0,dy:0,locked:false,finishing:false};
let pullHideTimer=null;
function pullFeedback(text,mode='pull',fraction=1){
 pullText.textContent=text;
 pullIcon.textContent=mode==='working'?'↻':mode==='ready'?'↥':mode==='error'?'!':mode==='done'?'✓':'↓';
 pullUi.classList.toggle('working',mode==='working');
 pullUi.classList.toggle('ready',mode==='ready'||mode==='done');
 pullUi.classList.toggle('error',mode==='error');
 pullUi.classList.add('visible');
 pullUi.style.setProperty('--pull-reveal',Math.min(58,8+Math.max(0,fraction)*50)+'px');
}
function pullReset(){
 if(pullHideTimer){clearTimeout(pullHideTimer);pullHideTimer=null}
 pullState.tracking=false;pullState.pulling=false;pullState.dy=0;
 pullUi.classList.remove('visible','ready','error','working');
 pullUi.style.setProperty('--pull-reveal','0px');
 pullText.textContent='下拉以更新行程';pullIcon.textContent='↓';
}
function pullFinish(text,mode='done',duration=1350){
 pullFeedback(text,mode,1);
 if(pullHideTimer)clearTimeout(pullHideTimer);
 pullHideTimer=setTimeout(()=>{pullHideTimer=null;pullReset()},duration);
}
async function pullRefresh(){
 if(pullState.locked)return;
 pullState.locked=true;
 pullFeedback('正在向 GitHub 檢查新版…','working',1);
 try{
  const result=await checkFreshVersion({userRequested:true,autoReload:false});
  if(result.status==='updated'){
   pullFeedback('找到新版本，正在重新載入…','working',1);
   // New query parameters force a new document request even in standalone iPhone PWAs.
   applyFreshVersion(result.version);
   setTimeout(()=>{pullState.locked=false;pullReset()},1800);
  }else if(result.status==='current'){
   pullFinish('✓ 行程已是最新版','done');
   pullState.locked=false;
  }else if(result.status==='busy'){
   pullFinish('目前正在檢查更新','done',1100);
   pullState.locked=false;
  }else{
   pullFinish('暫時無法連線，請稍後重試','error',2100);
   pullState.locked=false;
  }
 }catch(err){
  pullFinish('更新失敗，請檢查網路','error',2100);
  pullState.locked=false;
 }
}
function pageIsAtTop(){
 return Math.max(document.documentElement?.scrollTop||0,document.body?.scrollTop||0,window.scrollY||0)<=3;
}
function ignorePullTarget(el){
 return Boolean(el?.closest?.('input,textarea,select,button,[contenteditable="true"],.date-scroll,.brand-tabs,.map-frame,.map-places,.shop-picker,.maplibregl-map'));
}
document.addEventListener('touchstart',e=>{
 if(pullState.locked||pullState.finishing||e.touches.length!==1||!pageIsAtTop()||ignorePullTarget(e.target))return;
 const t=e.touches[0];
 pullState.tracking=true;pullState.pulling=false;pullState.startX=t.clientX;pullState.startY=t.clientY;pullState.dy=0;
},{passive:true});
document.addEventListener('touchmove',e=>{
 if(!pullState.tracking||e.touches.length!==1)return;
 const t=e.touches[0],dy=t.clientY-pullState.startY,dx=Math.abs(t.clientX-pullState.startX);
 if(dy<0||dx>Math.max(18,dy*.75)||!pageIsAtTop()){
  if(!pullState.pulling)pullState.tracking=false;
  return;
 }
 if(dy<=9)return;
 pullState.pulling=true;pullState.dy=dy;
 if(e.cancelable)e.preventDefault();
 const fraction=Math.min(1,dy/pullThreshold);
 pullFeedback(dy>=pullThreshold?'放開以更新行程':'繼續下拉以刷新',dy>=pullThreshold?'ready':'pull',fraction);
},{passive:false});
document.addEventListener('touchend',()=>{
 if(!pullState.tracking)return;
 const accepted=pullState.pulling&&pullState.dy>=pullThreshold;
 pullState.tracking=false;pullState.pulling=false;
 if(accepted)pullRefresh();else pullReset();
},{passive:true});
document.addEventListener('touchcancel',()=>{if(!pullState.locked)pullReset()},{passive:true});

const $=id=>document.getElementById(id);
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const amap=q=>'https://uri.amap.com/search?keyword='+encodeURIComponent(q);
const apple=q=>'https://maps.apple.com/?q='+encodeURIComponent(q);
const safeStore={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const today=()=>{const d=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());return d};
const now=today();
const startDay=now.startsWith('2026-11-')?Math.max(0,Math.min(5,Number(now.slice(-2))-22)):0;
const state={view:'plan',day:startDay,shopMode:'stops',shopId:'shop-day1',brand:'candy'};
const statusOf=k=>({actual:'現場實際',fixed:'原訂班次',shop:'自由參觀',warn:'需留意',estimate:'估計時間'}[k]||'估計時間');
const specialShopDay={0:'shop-day1',1:'shop-day2',2:'shop-day3',3:'shop-day4',4:'shop-day5',5:'shop-day1'};
const shopByDay={0:'candy',1:'latex',2:'tea',3:'silk',4:'skincare',5:'candy'};
const hotspotIcons=['⛩️','🌊','🎭','🏝️','🏛️','✈️'];
function selectView(view,scroll){
 if(!['plan','sights','shop','info'].includes(view))view='plan';
 state.view=view;
 document.querySelectorAll('.view').forEach(el=>el.hidden=el.id!=='view-'+view);
 document.querySelectorAll('[data-route]').forEach(el=>{
  const active=el.dataset.route===view;el.classList.toggle('active',active);el.setAttribute('aria-current',active?'page':'false')
 });
 if(view==='plan'){renderDay();if($('map-panel').open)requestAnimationFrame(()=>mapInstance&&mapInstance.resize())}
 if(view==='sights')renderSights();
 if(view==='shop')renderShopping();
 if(scroll!==false)window.scrollTo({top:document.getElementById('app').offsetTop-8,behavior:'smooth'});
 try{history.replaceState(null,'','#'+({plan:'schedule',sights:'guides',shop:'shopping',info:'hotels'}[view]))}catch(e){}
}
function daysStrip(container){
 container.innerHTML=days.map((day,i)=>'<button type="button" role="tab" class="day-tab" data-day="'+i+'" aria-selected="'+(i===state.day)+'"><small>DAY 0'+(i+1)+' · '+escapeHTML(day.dow)+'</small><strong>'+escapeHTML(day.date)+'</strong><span>'+escapeHTML(day.headline.split(' → ').slice(-2).join(' → '))+'</span></button>').join('');
}
function selectDay(day){
 state.day=Math.max(0,Math.min(5,day));renderDay();renderSights();updateMap();
 if(state.view==='plan'&&$('map-panel').open&&mapInstance)requestAnimationFrame(()=>mapInstance.resize());
}
function renderDay(){
 daysStrip($('day-tabs'));
 const d=days[state.day];
 $('day-hero').innerHTML='<div class="hero-meta"><span class="meta-chip">DAY 0'+(state.day+1)+' / 2026.'+escapeHTML(d.date.replace('/','.'))+'</span><span class="meta-chip sand">'+escapeHTML(d.mood)+'</span></div><h3>'+escapeHTML(d.headline)+'</h3><p>'+escapeHTML(d.tip)+'</p>';
 $('day-stats').innerHTML='<div class="stat"><small>🍽️ 當天餐食</small><strong>'+escapeHTML(d.meals)+'</strong></div><div class="stat"><small>🛏️ 當晚住宿</small><strong>'+escapeHTML(d.hotel)+'</strong></div>';
 $('timeline').innerHTML=d.events.map((e,i)=>{
  const [time,title,description,kind,detail,query]=e;
  const matching=guideData.filter(g=>g.day===state.day&&title.includes(g.match)&&!(state.day===0&&['zhencheng','fuyu'].includes(g.id))).slice(0,2);
  const links=[];
  if(query){links.push('<a class="action" href="'+amap(query)+'" target="_blank" rel="noopener">◉ 高德導航</a>');links.push('<a class="action ghost" href="'+apple(query)+'" target="_blank" rel="noopener">Apple 地圖</a>')}
  for(const g of matching)links.push('<button type="button" class="action" data-sight="'+g.id+'">◇ '+escapeHTML(g.title.split('｜')[0])+'</button>');
  if(detail==='住宿')links.push('<a class="action" href="hotels.html">住宿房價 ↗</a>');
  if(kind==='shop')links.push('<button type="button" class="action" data-shop-jump="'+specialShopDay[state.day]+'">▤ 商品與行情</button>');
  return '<div class="event '+(kind==='actual'?'actual':'')+'"><div class="event-time">'+escapeHTML(time)+'</div><details class="event-box" '+(kind==='actual'?'open':'')+'><summary><span class="event-label"><strong>'+escapeHTML(title)+'</strong><small class="'+({actual:'actual-tag',fixed:'fixed-tag',shop:'shop-tag'}[kind]||'')+'">'+statusOf(kind)+(detail?'　·　'+escapeHTML(detail):'')+'</small></span><span class="chev">＋</span></summary><div class="event-expanded"><p>'+escapeHTML(description)+'</p>'+(links.length?'<div class="actions">'+links.join('')+'</div>':'')+'</div></details></div>';
 }).join('');
 $('map-places').innerHTML=geo[state.day].map((p,i)=>'<a target="_blank" rel="noopener" href="'+amap(p.name)+'">'+(i+1)+' · '+escapeHTML(p.name)+' ↗</a>').join('');
 const selected=$('day-tabs').querySelector('[aria-selected="true"]');if(selected)selected.scrollIntoView({block:'nearest',inline:'center'});
}
function renderSights(){
 daysStrip($('sight-tabs'));
 // A park is not a third independent stop: Zhencheng and Fuyu are buildings inside Hongkeng Village.
 const all=guideData.filter(g=>g.day===state.day&&!['sleep-center','tea','silk','camel-milk'].includes(g.id));
 const childBuildings=guideData.filter(g=>['zhencheng','fuyu'].includes(g.id));
 const standardCard=g=>'<details class="sight-card" id="guide-'+g.id+'"><summary><span>'+escapeHTML(g.title)+'</span>'+(g.photo?'<img class="sight-thumb" src="'+escapeHTML(g.photo)+'" alt="'+escapeHTML(g.photoAlt||g.title)+'" loading="lazy">':'')+'</summary><div class="sight-body">'+(g.photo?'<figure class="sight-photo"><img src="'+escapeHTML(g.photo)+'" alt="'+escapeHTML(g.photoAlt||g.title)+'" loading="lazy"><figcaption>'+escapeHTML(g.photoCaption||'現場照片')+'</figcaption></figure>':'')+'<p>'+escapeHTML(g.desc)+'</p><div class="sight-detail"><b>到現場看什麼</b>'+escapeHTML(g.look)+'</div><div class="sight-detail"><b>旅途提醒</b>'+escapeHTML(g.tips)+'</div><div class="sight-detail"><b>建議停留</b>'+escapeHTML(g.time)+'</div><div class="actions"><a class="action" href="'+amap(g.query)+'" target="_blank" rel="noopener">◉ 高德導航</a>'+(g.source?'<a class="action ghost" href="'+escapeHTML(g.source)+'" target="_blank" rel="noopener">原始資料 ↗</a>':'')+'</div></div></details>';
 const groupCard=g=>'<details class="sight-card sight-cluster" id="guide-tulou"><summary><span><span class="cluster-label">1 個景區 · 當地導覽 1.5 小時 · 內含 2 棟樓</span>永定洪坑土樓民俗文化村<span class="cluster-desc">振成樓（圓樓）＋福裕樓（府第式）｜同一景區，步行參觀</span></span></summary><div class="sight-body"><p>'+escapeHTML(g.desc)+'</p><div class="sight-detail"><b>怎麼參觀</b>導遊告知由當地導覽員帶領整個文化村行程約 90 分鐘，步行看振成樓、福裕樓；並非三個獨立車遊景點，也不是每棟各 90 分鐘。</div><div class="cluster-stops">'+childBuildings.map((b,i)=>'<article class="cluster-spot"><h4>'+(i+1)+'. '+escapeHTML(b.title)+'</h4><p>'+escapeHTML(b.desc)+'</p><div class="sight-detail"><b>重點</b>'+escapeHTML(b.look)+'</div><div class="sight-detail"><b>現場提醒</b>'+escapeHTML(b.tips)+'</div><div class="sight-detail"><b>團體參觀時間</b>包含在景區整體 90 分鐘內，由當地導覽員分配；自行參觀才參考 '+escapeHTML(b.time)+'</div><div class="actions"><a class="action ghost" href="'+amap(b.query)+'" target="_blank" rel="noopener">查看這棟樓位置 ↗</a>'+(b.source?'<a class="action ghost" href="'+escapeHTML(b.source)+'" target="_blank" rel="noopener">資料來源 ↗</a>':'')+'</div></article>').join('')+'</div><div class="sight-detail"><b>整個景區導覽時長（導遊告知）</b>'+escapeHTML(g.time)+'（包含兩棟樓，不需另行加總；開始與結束時間以現場通知為準）</div><div class="actions"><a class="action" href="'+amap(g.query)+'" target="_blank" rel="noopener">◉ 洪坑文化村地圖</a>'+(g.source?'<a class="action ghost" href="'+escapeHTML(g.source)+'" target="_blank" rel="noopener">世界遺產資料 ↗</a>':'')+'</div></div></details>';
 const visible=all.filter(g=>state.day!==0||!['zhencheng','fuyu'].includes(g.id));
 $('fengdong-guide-panel').hidden=state.day!==1;
 $('sight-grid').innerHTML=visible.filter(g=>g.id!=='fengdong'||state.day!==1).map(g=>g.id==='tulou'?groupCard(g):standardCard(g)).join('');
 if(!visible.length)$('sight-grid').innerHTML='<div class="info-card">這天以交通與回程為主，主要參觀點已列於每日時間軸。</div>';
}
function renderShopping(){
 document.querySelectorAll('[data-shop-mode]').forEach(b=>b.setAttribute('aria-selected',b.dataset.shopMode===state.shopMode?'true':'false'));
 $('shop-stops').hidden=state.shopMode!=='stops';
 $('shop-compare').hidden=state.shopMode!=='compare';
 if(state.shopMode==='stops')renderStore();else renderCompare();
}
const latexRanges={'5':[3900,7505],'7.5':[6900,10925],'10':[8500,12635],'15':[16000,19760]};
function initLatexShop(){
 const result=$('latex-quote-result');
 if(!result)return;
 const fields=['latex-depth','latex-size','latex-type','latex-quote-rmb','latex-extra-rmb'];
 function calc(){
  const q=$('latex-quote-rmb').value;
  const extra=$('latex-extra-rmb').value;
  if(!q||Number(q)<=0){result.textContent='輸入人民幣報價後，這裡會顯示台幣換算與台灣同厚度的參考售價。';return}
  const n=Number(q),fee=Number(extra||0);
  if(!Number.isFinite(n)||!Number.isFinite(fee)||fee<0){result.textContent='請填寫有效金額';return}
  const price=(n+fee)*4.94,format=v=>'NT$'+Math.round(v).toLocaleString('zh-TW');
  const range=latexRanges[$('latex-depth').value];
  const comparable=$('latex-size').value==='5'&&$('latex-type').value==='natural'&&!!range;
  if(!comparable){result.textContent='折合約 '+format(price)+'；尺寸、厚度或內部結構尚不符合台灣的參考樣本，不能判定價差。';result.classList.add('warn');return}
  const min=range[0],max=range[1];
  const label=price>max*1.25?'超過同厚度樣本上緣 25% 以上，建議先暫緩購買，核對密度、布套、保固。':price>max?'高於公開樣本區間，但不一定是同等級。':price>=min?'落在樣本區間，但品質仍待核對。':'低於樣本區間，仍須確認材質與保固。';
  result.textContent='折合約 '+format(price)+'；台灣同厚度雙人床 5 尺參考 '+format(min)+'～'+format(max)+'。'+label+(extra===''?' （未含未知的運費、關稅）':'');
  result.classList.toggle('warn',price>max||extra==='');
 }
 if(result.dataset.inited==='1'){calc();return}
 result.dataset.inited='1';
 fields.forEach(id=>{const node=$(id),old=safeStore.get('latex-shop-'+id);if(old!==null)node.value=old;node.addEventListener('input',()=>{safeStore.set('latex-shop-'+id,node.value);calc()});node.addEventListener('change',()=>{safeStore.set('latex-shop-'+id,node.value);calc()})});
 document.querySelectorAll('[data-latex-check]').forEach(node=>{const key='latex-chk-'+node.dataset.latexCheck;node.checked=safeStore.get(key)==='1';node.addEventListener('change',()=>safeStore.set(key,node.checked?'1':'0'))});
 calc();
}

const shoppingPriceSamples={
 'shop-day1':{currency:'NT$',choices:[
  {name:'豬腳貢糖：每100g',measure:'gram',unit:100,low:54.5,high:70.8,brand:'金瑞成12入220g NT$120／聖祖12入240g NT$170（不同品牌）'},
  {name:'原味片狀牛肉乾：每100g',measure:'gram',unit:100,low:103,high:112.5,brand:'良金165g NT$170／高坑160g NT$180（不同品牌）'},
  {name:'原味手工麵線：每100g',measure:'gram',unit:100,low:58.3,high:63.9,brand:'馬家360g兩個通路價 NT$210–230'}
 ]},
 'shop-day3':{currency:'RMB',choices:[
  {name:'大紅袍：每100g',measure:'gram',unit:100,low:71.9,high:118.4,brand:'中茶海堤AT103／AT103A 125g（不同型號）'},
  {name:'鐵觀音：每100g',measure:'gram',unit:100,low:240,high:240,brand:'八馬賽珍珠1000 150g RMB360（單一樣本）'},
  {name:'生普洱：每100g',measure:'gram',unit:100,low:30.8,high:30.8,brand:'大益7542 2401批357g RMB110（單一批次）'}
 ]},
 'shop-day4':{currency:'NT$',choices:[
  {name:'100%桑蠶絲被・填充1kg：每條',measure:'count',unit:1,low:7000,high:9450,brand:'碧多妮／下營農會 1kg雙人被，材質與布套須核對'},
  {name:'100%桑蠶絲被・填充2kg：每條',measure:'count',unit:1,low:13050,high:13050,brand:'下營農會2kg雙人被（單一樣本）'},
  {name:'桑蠶絲絲巾 90×90cm：每條',measure:'count',unit:1,low:1668,high:3800,brand:'台灣跨境通路／Mico，設計與絲重不同'}
 ]},
 'shop-onboard':{currency:'RMB',choices:[
  {name:'皇后牌普通珍珠霜25g：每瓶',measure:'count',unit:1,low:23.8,high:23.8,brand:'片仔癀官方標準零售價；網購可能更低'},
  {name:'皇后牌煥顏珍珠霜32g：每瓶',measure:'count',unit:1,low:105,high:105,brand:'片仔癀官方標準零售價；與普通25g配方不同'}
 ]}
};
function shoppingNumber(n){return Number(n).toLocaleString('zh-TW',{maximumFractionDigits:2})}
function initOtherShopGuide(key){
 const cfg=shoppingPriceSamples[key],root=$('other-shop-deep-dive');
 if(!cfg||!root)return;
 const select=$('shopping-item'),quote=$('shopping-quote'),weight=$('shopping-weight'),label=$('shopping-weight-label'),same=$('shopping-same-sku'),result=$('shopping-quote-result');
 if(!select||!quote||!weight||!label||!same||!result)return;
 select.innerHTML=cfg.choices.map((x,i)=>'<option value="'+i+'">'+escapeHTML(x.name)+'</option>').join('');
 const prefix='shopping-guide-'+key+'-';
 const selected=safeStore.get(prefix+'item');
 if(selected!==null&&cfg.choices[Number(selected)])select.value=selected;
 const previousQuote=safeStore.get(prefix+'quote');if(previousQuote!==null)quote.value=previousQuote;
 const previousWeight=safeStore.get(prefix+'weight');if(previousWeight!==null)weight.value=previousWeight;
 same.checked=safeStore.get(prefix+'same')==='1';
 function recalc(){
  const item=cfg.choices[Number(select.value)]||cfg.choices[0],isGram=item.measure==='gram';
  label.firstChild.textContent=isGram?'實際取得的總重量（g）':'實際取得數量（瓶／盒／條）';
  weight.placeholder=isGram?'例如 150（克）':'例如 2（個）';
  const q=Number(quote.value),w=Number(weight.value);
  if(quote.value===''||weight.value===''||!Number.isFinite(q)||!Number.isFinite(w)||q<=0||w<=0){
   result.textContent='先輸入店家整組總價與實際取得數量／重量，才可計算。';
   result.classList.remove('warn');return;
  }
  const unitPrice=q/w*item.unit,fx=cfg.currency==='RMB'?4.94:1,unitText=isGram?'100g':'件';
  const currency=v=>cfg.currency+' '+shoppingNumber(v),twd=v=>'NT$ '+shoppingNumber(v*fx);
  const range=item.low===item.high?currency(item.low):currency(item.low)+'～'+currency(item.high);
  const itemPrice=currency(unitPrice);
  const base='現場折算約 '+itemPrice+'/'+unitText+'（整組 '+twd(q)+'）；參考樣本約 '+range+'/'+unitText+'。';
  if(!same.checked){
    result.textContent=base+' 你尚未確認同品牌同型號，這只是價格密度參考，不能判定貴幾倍。參考：'+item.brand;
    result.classList.remove('warn');return;
  }
  const higher=unitPrice>item.high*1.15,lower=unitPrice<item.low*0.85;
  const verdict=higher?'同款確認後，現場價格高於參考價，建議核對促銷條件再買。':lower?'同款確認後，現場價格低於參考價，先確認有效日期、正品及附帶條件。':'與參考價相近；仍應看有效日期、店面與售後。';
  result.textContent=base+verdict+' 商品與價格基準：'+item.brand;
  result.classList.toggle('warn',higher);
 }
 select.addEventListener('change',()=>{safeStore.set(prefix+'item',select.value);recalc()});
 quote.addEventListener('input',()=>{safeStore.set(prefix+'quote',quote.value);recalc()});
 weight.addEventListener('input',()=>{safeStore.set(prefix+'weight',weight.value);recalc()});
 same.addEventListener('change',()=>{safeStore.set(prefix+'same',same.checked?'1':'0');recalc()});
 root.querySelectorAll('[data-shop-chk]').forEach(x=>{
  const key=prefix+'check-'+x.dataset.shopChk;
  x.checked=safeStore.get(key)==='1';
  x.addEventListener('change',()=>safeStore.set(key,x.checked?'1':'0'));
 });

 recalc();
 if(key==='shop-day3')initTeaBundleCalc(root);
}

function initTeaBundleCalc(root){
 const fields=['tea-bundle-price','tea-bundle-bought','tea-bundle-gift','tea-bundle-grams'].map(id=>root.querySelector('#'+id));
 const out=root.querySelector('#tea-bundle-result');
 if(!out||fields.some(n=>!n))return;
 function calc(){
  const [a,b,c,d]=fields,p=Number(a.value),buy=Number(b.value),gift=Number(c.value),gram=Number(d.value);
  if(a.value===''||b.value===''||c.value===''||!Number.isFinite(p)||p<=0||!Number.isInteger(buy)||buy<1||!Number.isInteger(gift)||gift<0){
   out.textContent='請填入大於0的總價與購買片數，沒有現場同款贈品就填0。';return;
  }
  const n=buy+gift,unit=p/n;
  let m='現場實拿同款 '+n+' 片（買 '+buy+'、送 '+gift+'），每片實付 RMB '+shoppingNumber(unit)+'（約 NT$ '+shoppingNumber(unit*4.94)+'）。';
  if(d.value!==''){
   if(Number.isFinite(gram)&&gram>0)m+=' 總重 '+shoppingNumber(n*gram)+'g，每100g實付 RMB '+shoppingNumber(100*p/(n*gram))+'。';
   else m+=' 請填入大於0的重量才可換算每100g。';
  }
  out.textContent=m+' 不同款茶、田七花、未來兌換均不納入計算，贈品不同款請填0。';
 }
 fields.forEach(n=>{const k='tea-shop-'+n.id,v=safeStore.get(k);if(v!==null)n.value=v;n.addEventListener('input',()=>{safeStore.set(k,n.value);calc()})});
 calc();
}

function renderStore(){
 const stationTitles=[['11/22 ＋ 11/27','金門特產'],['11/23','乳膠寢具'],['11/24','云浔茶堂'],['11/25','絲綢用品'],['11/26','駝奶'],['車上介紹','片仔癀珍珠霜']];
 $('shop-picker').innerHTML=storeData.map((store,i)=>'<button type="button" class="shop-pick" data-store="'+store.id+'" aria-selected="'+(store.id===state.shopId)+'"><small>'+stationTitles[i][0]+'</small><strong>'+stationTitles[i][1]+'</strong></button>').join('');
 const store=storeData.find(x=>x.id===state.shopId)||storeData[0];
 const group=({'shop-day1':'candy','shop-day2':'latex','shop-day3':'tea','shop-day4':'silk','shop-day5':'skincare','shop-onboard':'skincare'})[store.id]||'candy';
 $('latex-deep-dive').hidden=store.id!=='shop-day2';
 const hasOtherGuide=Object.prototype.hasOwnProperty.call(shopDeepDive,store.id);
 $('other-shop-deep-dive').hidden=!hasOtherGuide;
 $('shop-report').hidden=store.id==='shop-day2'||hasOtherGuide;
 if(store.id==='shop-day2'){initLatexShop();return}
 if(hasOtherGuide){
  $('other-shop-deep-dive').innerHTML=shopDeepDive[store.id];
  initOtherShopGuide(store.id);
  return;
 }
 $('shop-report').innerHTML='<article class="report"><div class="report-head"><span>'+escapeHTML(store.date)+'</span><h3>'+escapeHTML(store.title)+'</h3><p>'+escapeHTML(store.preview)+'</p></div><div class="report-body"><div class="actions" style="margin-bottom:13px"><button type="button" class="action" data-brand-jump="'+group+'">▤ 對照其他品牌同級價 ↗</button></div>'+store.body+'</div></article>';
}
function renderCompare(){
 $('brand-tabs').innerHTML=crossBrandGroups.map(g=>'<button class="brand-tab" type="button" data-brand="'+g.id+'" aria-selected="'+(state.brand===g.id)+'">'+escapeHTML(g.tab)+'</button>').join('');
 const g=crossBrandGroups.find(g=>g.id===state.brand)||crossBrandGroups[0];
 const rows=g.items.map(p=>{
  const pp=g.unit==='g'&&p.gram?g.currency+' '+(100*p.price/p.gram).toFixed(1)+' / 100g':'不適用／待補規格';
  const type=/待|不同|另一|未知|級別|條件式|無法|非同/.test(p.state)?'warn':'';
  return '<tr><td><b>'+escapeHTML(p.n)+'</b><br><span style="color:#7a8e7c;font-size:11px">'+escapeHTML(p.note)+'</span></td><td><b>'+escapeHTML(g.currency)+' '+Number(p.price).toLocaleString('en-US')+'</b></td><td>'+escapeHTML(pp)+'</td><td><span class="meta-chip '+type+'">'+escapeHTML(p.state)+'</span><br><a target="_blank" rel="noopener noreferrer" href="'+escapeHTML(p.url)+'">售價來源 ↗</a></td></tr>';
 }).join('');
 const possible=priceCatalog[({candy:'candy',jerky:'jerky',noodles:'extra',knives:'knife'})[g.id]];
 $('compare-content').innerHTML='<div class="compare-hero"><h3>'+escapeHTML(g.name)+'</h3><p>'+escapeHTML(g.spec)+'</p></div><div class="price-grid-wrap"><table class="price-grid"><thead><tr><th>品牌／商品</th><th>參考售價</th><th>重量標準化</th><th>同級條件／來源</th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="grade-guide"><div class="grade-row"><b>比較基準</b>'+escapeHTML(g.qualify)+'</div><div class="grade-row"><b>同款跨通路</b>'+escapeHTML(g.same)+'　<a class="small-link" href="'+escapeHTML(g.sameUrl)+'" target="_blank" rel="noopener">查資料來源 ↗</a></div><div class="grade-row warn"><b>不可混比</b>'+escapeHTML(g.excludes)+'</div></div>'+(g.input?'<div class="quote-box"><strong>現場報價快速換算</strong><div class="quote-fields"><label>店家售價（'+g.currency+'）<input id="quote-price" type="number" min="0" step="1" inputmode="decimal" placeholder="輸入金額"></label><label>商品淨重（g）<input id="quote-weight" type="number" min="1" step="1" inputmode="decimal" placeholder="輸入克數"></label></div><p class="quote-result" id="quote-result">輸入金額和重量後，計算每 100g 市價。</p></div>':'')+(possible?'<details class="price-mini"><summary>▸ 檢視個別品牌原始價源與記錄現場價格</summary><div class="price-grid-wrap"><table class="price-grid"><thead><tr><th>品牌與型號</th><th>規格</th><th>通路價</th><th>現場價</th></tr></thead><tbody>'+possible.map(p=>'<tr><td><b>'+escapeHTML(p.name)+'</b><br><a href="'+escapeHTML(p.url)+'" target="_blank" rel="noopener">來源 ↗</a></td><td>'+escapeHTML(p.spec)+'</td><td>'+g.currency+' '+p.ref+'</td><td><input class="record-quote" data-quote-id="'+p.id+'" data-quote-ref="'+p.ref+'" type="number" min="0" inputmode="numeric" placeholder="填價格" value="'+escapeHTML(safeStore.get('on_site_'+p.id)||'')+'"><span class="price-result" id="quote-r-'+p.id+'"></span></td></tr>').join('')+'</tbody></table></div></details>':'');
 if(g.input){
  const p=$('quote-price'),w=$('quote-weight'),out=$('quote-result');
  const calculate=()=>{
    const cost=Number(p.value),gram=Number(w.value);
    if(!p.value||!w.value||cost<=0||gram<=0){out.textContent='請輸入有效的價格與淨重；規格不完整就不判定高價。';return;}
    const rate=100*cost/gram;
    const ref=g.items.filter(x=>x.gram&&x.state.indexOf('另一')<0&&x.state.indexOf('不同')<0).map(x=>100*x.price/x.gram);
    const low=Math.min(...ref),high=Math.max(...ref);
    const msg='每 100g 約 '+g.currency+' '+rate.toFixed(1)+'；同類已知樣本 '+g.currency+' '+low.toFixed(1)+'–'+high.toFixed(1)+'/100g。';
    out.textContent=msg+(rate>high*1.25?'明顯高於這組樣本，建議先核對同級條件。':rate>high?'高於樣本區間，但可能有品質差別。':'價格可參考，仍須確認口感與品質。');
  };
  p.addEventListener('input',calculate);w.addEventListener('input',calculate);
 }
 const updateRecord=inp=>{
  const v=Number(inp.value),ref=Number(inp.dataset.quoteRef),line=$('quote-r-'+inp.dataset.quoteId);
  if(!line)return;
  line.textContent=!inp.value?'':v===ref?'與參考價相同':v>ref?'貴 '+(v-ref)+' 元':'便宜 '+(ref-v)+' 元';
  line.classList.toggle('warn',!!inp.value&&v>ref);
 };
 document.querySelectorAll('.record-quote').forEach(el=>{updateRecord(el);el.addEventListener('input',()=>{safeStore.set('on_site_'+el.dataset.quoteId,el.value);updateRecord(el)})});
}
function renderInfo(){
 $('hotel-grid').innerHTML=hotelData.map(h=>'<article class="info-card hotel-card"><div class="hotel-meta">'+escapeHTML(h.dates)+'</div><h3>'+escapeHTML(h.title)+'</h3><p>'+escapeHTML(h.location)+'</p><p>'+escapeHTML(h.memo)+'</p><div class="actions"><a class="action" href="tel:'+h.phone+'">☎ '+h.display+'</a><a class="action ghost" href="'+amap(h.query)+'" target="_blank" rel="noopener">◉ 位置</a>'+(h.ratePage?'<a class="action" href="'+escapeHTML(h.ratePage)+'">查看完整房價 ↗</a>':'')+'</div></article>').join('');
 $('review-list').innerHTML=reviewData.map(r=>'<details class="review"><summary>'+escapeHTML(r.title)+'</summary><div class="review-inner"><div style="color:#7d907f;font-size:11px;font-weight:800;margin-bottom:6px">'+escapeHTML(r.type)+'</div><p>'+r.desc+'</p>'+(r.link?'<a href="'+escapeHTML(r.link)+'" target="_blank" rel="noopener">'+escapeHTML(r.linkText)+'</a>':'')+'</div></details>').join('');
}
let mapInstance=null,mapLoaded=false,mapMarkers=[],mapAttempt=0;

let gpsWatchId=null,gpsPosition=null,gpsMarker=null,gpsFirstFix=false;
function setGeoStatus(message,isError){
 const out=$('geo-status');
 out.textContent=message;
 out.classList.toggle('error',Boolean(isError));
}
function updateGeoButtons(){
 const watching=gpsWatchId!==null;
 $('locate-me').textContent=watching?'● 定位追蹤中':'◎ 定位我';
 $('locate-me').setAttribute('aria-pressed',String(watching));
 $('recenter-me').hidden=!gpsPosition;
 $('stop-location').hidden=!watching && !gpsPosition;
}
function locationFailure(err){
 const errors={
  1:'定位權限遭拒。請在 iPhone「設定 → 隱私權與安全性 → 定位服務」允許 Safari 網站存取，並開啟「精確位置」。若從 App 內開啟，建議改用 Safari。',
  2:'目前無法取得定位。請確認手機已啟用定位服務，並移至訊號較好的地方再試。',
  3:'定位逾時。可稍後再試，或確認 GPS／行動網路訊號。'
 };
 setGeoStatus(errors[err&&err.code]||'無法取得手機定位，請確認瀏覽器定位權限後重試。',true);
 if(gpsWatchId!==null&&navigator.geolocation){navigator.geolocation.clearWatch(gpsWatchId);gpsWatchId=null}
 gpsPosition=null;gpsFirstFix=false;clearGpsDrawing();
 updateGeoButtons();
}
function circleCoordinates(lng,lat,radius){
 const rad=Math.PI/180,deg=180/Math.PI,R=6378137;
 const meters=Math.max(1,Math.min(50000,radius));
 const latRad=lat*rad,lonRad=lng*rad,d=meters/R,ring=[];
 for(let i=0;i<=64;i++){
  const bearing=(i/64)*2*Math.PI;
  const nlat=Math.asin(Math.sin(latRad)*Math.cos(d)+Math.cos(latRad)*Math.sin(d)*Math.cos(bearing));
  const nlon=lonRad+Math.atan2(Math.sin(bearing)*Math.sin(d)*Math.cos(latRad),Math.cos(d)-Math.sin(latRad)*Math.sin(nlat));
  ring.push([nlon*deg,nlat*deg]);
 }
 return ring;
}
function drawGps(){
 if(!mapInstance||!mapLoaded||!gpsPosition)return;
 const {lng,lat,accuracy}=gpsPosition;
 if(!gpsMarker){
  const dot=document.createElement('div');dot.className='map-current-dot';dot.setAttribute('aria-label','我的目前位置');
  gpsMarker=new maplibregl.Marker({element:dot,anchor:'center'}).setLngLat([lng,lat]).addTo(mapInstance);
 }else gpsMarker.setLngLat([lng,lat]);
 // Keep location layer when street-map provider style changes.
 const feature={type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[circleCoordinates(lng,lat,accuracy)]}};
 if(!mapInstance.getSource('user-gps-accuracy')){
  mapInstance.addSource('user-gps-accuracy',{type:'geojson',data:{type:'FeatureCollection',features:[feature]}});
  mapInstance.addLayer({id:'user-gps-area',type:'fill',source:'user-gps-accuracy',paint:{'fill-color':'#187be7','fill-opacity':.12}});
  mapInstance.addLayer({id:'user-gps-outline',type:'line',source:'user-gps-accuracy',paint:{'line-color':'#187be7','line-opacity':.5,'line-width':1.5}});
 }else mapInstance.getSource('user-gps-accuracy').setData({type:'FeatureCollection',features:[feature]});
}
function focusGps(){
 if(!gpsPosition||!mapInstance||!mapLoaded){setGeoStatus(gpsPosition?'已取得座標，但街道底圖尚未載入。可在下方開啟導航。':'請先按「定位我」取得手機座標。',false);return}
 const {lng,lat,accuracy}=gpsPosition;
 const zoom=accuracy>2500?11:accuracy>500?13:15;
 mapInstance.resize();mapInstance.flyTo({center:[lng,lat],zoom,duration:600});
}
function clearGpsDrawing(){
 if(gpsMarker){gpsMarker.remove();gpsMarker=null}
 if(!mapInstance||!mapLoaded)return;
 for(const id of ['user-gps-outline','user-gps-area'])if(mapInstance.getLayer(id))mapInstance.removeLayer(id);
 if(mapInstance.getSource('user-gps-accuracy'))mapInstance.removeSource('user-gps-accuracy');
}
function stopGps(){
 if(gpsWatchId!==null&&navigator.geolocation){navigator.geolocation.clearWatch(gpsWatchId);gpsWatchId=null}
 gpsPosition=null;gpsFirstFix=false;
 clearGpsDrawing();
 setGeoStatus('已停止定位並移除定位點。需要時可再次點「定位我」。',false);
 updateGeoButtons();
}
function onLocation(position){
 const c=position.coords;
 if(!Number.isFinite(c.latitude)||!Number.isFinite(c.longitude))return;
 gpsPosition={lat:c.latitude,lng:c.longitude,accuracy:Number.isFinite(c.accuracy)?c.accuracy:0};
 const uncertainty=gpsPosition.accuracy>0?' · 約 ±'+Math.round(gpsPosition.accuracy).toLocaleString('zh-TW')+' 公尺':' · 精度未知';
 setGeoStatus('目前座標：'+gpsPosition.lat.toFixed(6)+'° N，'+gpsPosition.lng.toFixed(6)+'° E'+uncertainty,false);
 updateGeoButtons();
 drawGps();
 if(!gpsFirstFix&&mapInstance&&mapLoaded){gpsFirstFix=true;focusGps()}
}
function startGps(){
 if(gpsWatchId!==null){focusGps();return}
 if(!window.isSecureContext){setGeoStatus('定位需要 HTTPS 安全連線。請以 https://bruce-913923.github.io/trip/kinmen-xiamen-tulou-6d/ 開啟。',true);return}
 if(!navigator.geolocation){setGeoStatus('此瀏覽器沒有提供 GPS 定位功能，請在 Safari 開啟網頁並檢查定位服務設定。',true);return}
 setGeoStatus('正在取得手機位置…如跳出權限提示，請選擇允許。',false);
 gpsFirstFix=false;
 try{
  const id=navigator.geolocation.watchPosition(onLocation,locationFailure,{enableHighAccuracy:true,timeout:20000,maximumAge:8000});
  gpsWatchId=id;
  updateGeoButtons();
 }catch(e){locationFailure(e)}
}

function ensureMapScript(){
 if(window.maplibregl)return Promise.resolve();
 if(window.__mapLoader)return window.__mapLoader;
 window.__mapLoader=new Promise((res,rej)=>{
  const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/maplibre-gl@5.12.0/dist/maplibre-gl.js';script.async=true;script.onload=res;script.onerror=()=>rej(new Error('無法載入地圖程式'));document.head.appendChild(script);
 });
 return window.__mapLoader;
}
function updateMap(){
 $('map-places').innerHTML=geo[state.day].map((p,i)=>'<a href="'+amap(p.name)+'" target="_blank" rel="noopener">'+(i+1)+' · '+escapeHTML(p.name)+' ↗</a>').join('');
 if(!mapInstance||!mapLoaded)return;
 const list=geo[state.day],bounds=new maplibregl.LngLatBounds();
 mapMarkers.forEach(m=>m.remove());mapMarkers=[];
 list.forEach((p,i)=>{
  const mark=document.createElement('div');mark.className='map-pin';mark.textContent=i+1;
  mapMarkers.push(new maplibregl.Marker({element:mark}).setLngLat([p.lng,p.lat]).setPopup(new maplibregl.Popup({offset:14}).setHTML('<b>'+escapeHTML(p.name)+'</b><br><a href="'+amap(p.name)+'" target="_blank" rel="noopener">高德導航 ↗</a>')).addTo(mapInstance));
  bounds.extend([p.lng,p.lat]);
 });
 if(mapInstance.getLayer('trip-line'))mapInstance.removeLayer('trip-line');
 if(mapInstance.getSource('trip-route'))mapInstance.removeSource('trip-route');
 mapInstance.addSource('trip-route',{type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:list.map(x=>[x.lng,x.lat])}}});
 mapInstance.addLayer({id:'trip-line',type:'line',source:'trip-route',paint:{'line-color':'#ac6f41','line-width':3,'line-dasharray':[2,2]}});
 mapInstance.resize();mapInstance.fitBounds(bounds,{padding:45,maxZoom:11,duration:350});
 drawGps();
}
async function loadMap(){
 if(mapInstance){mapInstance.resize();return}
 try{
  await ensureMapScript();
  $('map-wait').textContent='街道地圖載入中，若外部圖資受限仍可使用下方導航連結。';
  mapInstance=new maplibregl.Map({container:'street-map',style:'https://tiles.openfreemap.org/styles/liberty',center:[118.12,24.6],zoom:8,dragRotate:false});
  mapInstance.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
  mapInstance.on('style.load',()=>{mapLoaded=true;$('street-map').style.opacity='1';$('map-wait').style.display='none';updateMap();drawGps();if(gpsPosition&&!gpsFirstFix){gpsFirstFix=true;focusGps()}});
  mapInstance.on('error',e=>{
   const str=String(e?.error?.message||'');
   if(mapAttempt===0&&(!mapLoaded||/403|401|tile|forbidden|404/i.test(str))){
    mapAttempt++;mapLoaded=false;$('street-map').style.opacity='0';$('map-wait').style.display='flex';
    try{mapInstance.setStyle('https://basemaps.cartocdn.com/gl/positron-gl-style/style.json')}catch(e){}
   }
  });
  setTimeout(()=>{if(!mapLoaded&&mapAttempt===0){mapAttempt++;try{mapInstance.setStyle('https://basemaps.cartocdn.com/gl/positron-gl-style/style.json')}catch(e){}}},6000);
  setTimeout(()=>{if(!mapLoaded)$('map-wait').textContent='目前無法顯示街道圖。下方仍提供逐站高德導航連結。'},14000);
 }catch(e){$('map-wait').textContent='地圖程式暫時無法載入，請點下方景點使用高德地圖導航。'}
}
document.addEventListener('click',e=>{
 const apply=e.target.closest('#apply-update');if(apply){applyFreshVersion();return}
 const manual=e.target.closest('#check-update');if(manual){checkFreshVersion({userRequested:true});return}
 const route=e.target.closest('[data-route]');if(route){selectView(route.dataset.route);return}
 const day=e.target.closest('[data-day]');if(day){selectDay(Number(day.dataset.day));return}
 const todayBtn=e.target.closest('#today-button');if(todayBtn){selectDay(startDay);return}
 const quick=e.target.closest('#quick-locate');if(quick){if(state.view!=='plan')selectView('plan',false);$('map-panel').open=true;$('map-panel').scrollIntoView({block:'center',behavior:'smooth'});startGps();return}
 const locate=e.target.closest('#locate-me');if(locate){startGps();return}
 const recenter=e.target.closest('#recenter-me');if(recenter){focusGps();return}
 const stop=e.target.closest('#stop-location');if(stop){stopGps();return}
 const fit=e.target.closest('#fit-day');if(fit){updateMap();return}
 const sight=e.target.closest('[data-sight]');if(sight){
  selectView('sights',true);
  setTimeout(()=>{const el=$('guide-'+sight.dataset.sight);if(el){el.open=true;el.scrollIntoView({behavior:'smooth',block:'start'})}},160);return
 }
 const shop=e.target.closest('[data-shop-jump]');if(shop){state.shopId=shop.dataset.shopJump;state.shopMode='stops';selectView('shop');return}
 const mode=e.target.closest('[data-shop-mode]');if(mode){state.shopMode=mode.dataset.shopMode;renderShopping();return}
 const store=e.target.closest('[data-store]');if(store){state.shopId=store.dataset.store;renderStore();return}
 const brand=e.target.closest('[data-brand]');if(brand){state.brand=brand.dataset.brand;renderCompare();return}
 const brandJump=e.target.closest('[data-brand-jump]');if(brandJump){state.brand=brandJump.dataset.brandJump;state.shopMode='compare';renderShopping();return}
});
$('map-panel').addEventListener('toggle',e=>{if(e.target.open)loadMap()});
window.addEventListener('hashchange',()=>{
 const hash=location.hash.slice(1);
 if(hash==='fengdong-guide'){state.day=1;selectView('sights',false);setTimeout(()=>{$('guide-fengdong')?.scrollIntoView({behavior:'smooth',block:'start'})},120)}
 else if(hash==='guides')selectView('sights',false);
 else if(['shopping','shop-audit','cross-brand','price-candy'].includes(hash)){if(hash==='cross-brand'||hash==='price-candy'){state.shopMode='compare';if(hash==='price-candy')state.brand='candy'}selectView('shop',false)}
 else if(hash.startsWith('shop-day')||hash==='shop-onboard'){state.shopId=hash;state.shopMode='stops';selectView('shop',false)}
 else if(hash==='hotels'||hash==='tips')selectView('info',false);
 else if(['schedule','day1','day2','day3','day4','day5','day6'].includes(hash)){if(hash.startsWith('day'))state.day=Math.max(0,Number(hash.slice(-1))-1);selectView('plan',false)}
});
renderInfo();
renderDay();
updateGeoButtons();
renderSights();
const initialHash=location.hash.slice(1);
if(initialHash==='fengdong-guide'){state.day=1;selectView('sights',false);setTimeout(()=>{$('guide-fengdong')?.scrollIntoView({behavior:'smooth',block:'start'})},150)}
else if(initialHash==='guides')selectView('sights',false);
else if(['shopping','shop-audit','cross-brand'].includes(initialHash)){if(initialHash==='cross-brand')state.shopMode='compare';selectView('shop',false)}
else if(initialHash==='hotels'||initialHash==='tips')selectView('info',false);
else if(initialHash.startsWith('shop-day')||initialHash==='shop-onboard'){state.shopId=initialHash;state.shopMode='stops';selectView('shop',false)}
else if(['day1','day2','day3','day4','day5','day6'].includes(initialHash)){state.day=Number(initialHash.slice(-1))-1;selectView('plan',false)}
else selectView('plan',false);
// Check on opening, and whenever the Home Screen app returns to foreground.
setTimeout(()=>checkFreshVersion({autoReload:true}),1600);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkFreshVersion({autoReload:false})});
window.addEventListener('pageshow',event=>{if(event.persisted)checkFreshVersion({autoReload:false})});
})();

