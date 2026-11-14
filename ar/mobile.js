/* Pinplore AR · portrait layer for the phone app.
   The flows are authored on a 1210×834 landscape stage (Figma iPad frames). On a phone the footage
   fills the portrait screen (cover, cropped around a focus point) and the glass UI is re-placed for a
   430-wide screen. Pins and anything else that lives "in the world" stay inside the stage, so their
   tracking to the footage is untouched; UI panels are lifted into wrappers that map them onto the
   phone layout. Loaded by each flow after its own script; active only with ?m=1. */
(function(){
if(!/[?&]m=1/.test(location.search))return;
const FLOW=/\/explore\//.test(location.pathname)?'explore':/\/pin\//.test(location.pathname)?'pin':'route';
const q=id=>document.getElementById(id);
const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)), li=(a,b,k)=>a+(b-a)*k, pr=(t,a,b)=>cl((t-a)/(b-a));
const eo=k=>1-Math.pow(1-k,3), ei=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;

/* ---------- screen + world ---------- */
const V={u:1,W:430,H:932};                       // design space: 430 wide, height follows the device
function dims(){V.u=innerWidth/430;V.W=430;V.H=innerHeight/V.u}
let FX=605,FY=417;                                // world focus (stage coords)
function world(){const s=Math.max(V.H/834,V.W/1210);
  const tx=cl(V.W/2-s*FX,V.W-1210*s,0), ty=cl(V.H/2-s*FY,V.H-834*s,0);return {s,tx,ty}}
const css=document.createElement('style');css.textContent=`
html,body{width:100%;height:100%;margin:0;overflow:hidden;background:#000}
body{display:block!important}
#vp{position:absolute!important;left:0!important;top:0!important;transform-origin:0 0!important}
.mw{position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0;overflow:visible}`;
document.head.appendChild(css);
function placeWorld(){const {s,tx,ty}=world(),u=V.u;
  q('vp').style.transform=`matrix(${u*s},0,0,${u*s},${u*tx},${u*ty})`}

/* ---------- UI wrappers ---------- */
function wrap(els,blend){els=els.filter(Boolean);if(!els.length)return null;
  const w=document.createElement('div');w.className='mw';els[0].parentNode.insertBefore(w,els[0]);els.forEach(e=>w.appendChild(e));
  if(blend){w.style.mixBlendMode='screen';els.forEach(e=>e.style.mixBlendMode='normal')}return w}
/* map parent-local stage point Ad onto design point Ap at scale k (k = size relative to the authored size) */
function M(Ad,Ap,k){return {Ad,Ap,k}}
function mix(a,b,f){return {Ad:[li(a.Ad[0],b.Ad[0],f),li(a.Ad[1],b.Ad[1],f)],Ap:[li(a.Ap[0],b.Ap[0],f),li(a.Ap[1],b.Ap[1],f)],k:li(a.k,b.k,f)}}
function place(w,m,par={x:0,y:0}){if(!w)return;if(!m){w.style.transform='none';return}
  const {s,tx,ty}=world(),a=m.k/s;
  const bx=(m.Ap[0]-m.k*m.Ad[0]-tx)/s-par.x, by=(m.Ap[1]-m.k*m.Ad[1]-ty)/s-par.y;
  w.style.transform=`matrix(${a},0,0,${a},${bx},${by})`}
const map=(m,d)=>[m.Ap[0]+m.k*(d[0]-m.Ad[0]),m.Ap[1]+m.k*(d[1]-m.Ad[1])];
/* centre of an element on screen, in design px */
function ctr(el){const r=el.getBoundingClientRect();return [(r.left+r.width/2)/V.u,(r.top+r.height/2)/V.u,r.width/V.u]}
function xy(el){const m=(el.style.transform||'').match(/translate\(\s*(-?[\d.]+)px,\s*(-?[\d.]+)px/);return m?[+m[1],+m[2]]:[0,0]}
/* a panel that opens from its pin: sits below the pin (or above if there's no room), folds back into it */
function panelAt(els,w,P,size,gap=26){
  const k=Math.min((V.W-36)/size[0],.62), [cx,cy]=xy(els[1]);
  const top=Math.min(P[1]+P[2]/2+gap, V.H-118-size[1]*k);
  const m=M([cx+size[0]/2,cy],[V.W/2,top],k);
  place(w,m);
  const o=[m.Ad[0]+(P[0]-m.Ap[0])/m.k-cx, m.Ad[1]+(P[1]-m.Ap[1])/m.k-cy];
  els.forEach(e=>e.style.transformOrigin=`${o[0]}px ${o[1]}px`)}

/* ---------- Figma "Mobile AR" layout (430 × 932 design frames) ----------
   Rules taken from the Figma section: head bar at y77; panels are drawn at their Figma size (not shrunk);
   wide panels are 380 wide (x25), tops at 179; a call-to-action sits outside the panel (y812, or y638
   under the small pickers); the world behind an open panel is blurred; the app's bottom bar shows only
   while nothing is open. Pickers are centred on the screen height; bottom actions follow the bottom edge. */
const cy=y=>y+(V.H-932)/2, by=y=>y+(V.H-932);
const st2=document.createElement('style');st2.textContent=`
.mblur{position:absolute;left:-400px;top:-400px;width:2400px;height:1800px;pointer-events:none;opacity:0;
  backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
#mui{position:fixed;left:0;top:0;width:430px;height:0;transform-origin:0 0;pointer-events:none;z-index:60}
#mcta{position:absolute;display:flex;align-items:center;justify-content:center;gap:8px;height:46px;border-radius:32px;
  background:rgba(255,255,255,.8);box-shadow:0 4px 20px rgba(0,0,0,.1);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
  font:700 18px/1 Montserrat,system-ui,sans-serif;letter-spacing:-.18px;color:#1c1c1c;white-space:nowrap;opacity:0}
#mcta svg{width:24px;height:24px;flex:none}
#mtap{position:absolute;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:999px;background:rgba(255,255,255,.35);
  border:2px solid rgba(255,255,255,.9);box-shadow:0 0 0 1px rgba(0,0,0,.12),0 2px 10px rgba(0,0,0,.2);opacity:0}
.mclose,.mback{position:absolute;width:42px;height:42px;border-radius:999px;background:rgba(255,255,255,.1);
  box-shadow:inset 0 0 0 .75px rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center}
.mclose svg,.mback svg{width:24px;height:24px}
.mclose{pointer-events:auto;cursor:pointer;z-index:5}`;
document.head.appendChild(st2);
const IC={back:'<svg viewBox="0 0 24 24" fill="none"><path d="M20 12.75C20.4142 12.75 20.75 12.4142 20.75 12C20.75 11.5858 20.4142 11.25 20 11.25V12V12.75ZM4 11.25C3.58579 11.25 3.25 11.5858 3.25 12C3.25 12.4142 3.58579 12.75 4 12.75V12V11.25ZM7.47204 17.5327C7.76624 17.8243 8.24111 17.8222 8.53269 17.528C8.82427 17.2338 8.82216 16.7589 8.52796 16.4673L8 17L7.47204 17.5327ZM6.23703 15.2527L6.76499 14.72H6.76499L6.23703 15.2527ZM6.23703 8.74731L5.70907 8.21462H5.70907L6.23703 8.74731ZM8.52796 7.53269C8.82216 7.24111 8.82428 6.76624 8.53269 6.47204C8.24111 6.17784 7.76624 6.17573 7.47204 6.46731L8 7L8.52796 7.53269ZM4.01989 12.3133L3.27591 12.4082L3.27591 12.4082L4.01989 12.3133ZM4.01989 11.6867L3.27591 11.5918L3.27591 11.5918L4.01989 11.6867ZM20 12V11.25H4V12V12.75H20V12ZM8 17L8.52796 16.4673L6.76499 14.72L6.23703 15.2527L5.70907 15.7854L7.47204 17.5327L8 17ZM6.23703 8.74731L6.76499 9.28L8.52796 7.53269L8 7L7.47204 6.46731L5.70907 8.21462L6.23703 8.74731ZM6.23703 15.2527L6.76499 14.72C6.0495 14.0109 5.55869 13.5228 5.22659 13.1093C4.904 12.7076 4.79332 12.4496 4.76387 12.2185L4.01989 12.3133L3.27591 12.4082C3.35469 13.0263 3.64963 13.5412 4.05706 14.0485C4.45498 14.544 5.01863 15.1011 5.70907 15.7854L6.23703 15.2527ZM6.23703 8.74731L5.70907 8.21462C5.01863 8.89892 4.45498 9.45597 4.05706 9.95146C3.64963 10.4588 3.3547 10.9737 3.27591 11.5918L4.01989 11.6867L4.76387 11.7815C4.79332 11.5504 4.904 11.2924 5.22659 10.8907C5.55869 10.4772 6.0495 9.98914 6.76499 9.28L6.23703 8.74731ZM4.01989 12.3133L4.76387 12.2185C4.74538 12.0734 4.74538 11.9266 4.76387 11.7815L4.01989 11.6867L3.27591 11.5918C3.24136 11.8629 3.24136 12.1371 3.27591 12.4082L4.01989 12.3133Z" fill="white"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none"><path d="M5 5L19 19M5.00003 19L12 12L19 5" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>',
  nav:'<svg viewBox="0 0 24 24" fill="none"><path d="M10.4004 1.18411C11.3286 0.648288 12.4722 0.64824 13.4004 1.18411L20.5 5.28275C21.4282 5.81865 22 6.80958 22 7.88138V16.0796C22 17.1514 21.4282 18.1424 20.5 18.6783L13.4004 22.7779C12.4723 23.3137 11.3285 23.3135 10.4004 22.7779L3.2998 18.6783C2.3716 18.1424 1.7998 17.1514 1.7998 16.0796V7.88138C1.7998 6.80958 2.3716 5.81865 3.2998 5.28275L10.4004 1.18411ZM13.1924 6.47415C12.7033 6.10149 12.0049 6.45604 12.0049 7.07669V8.94193H11.2178C8.86799 8.94202 6.96311 10.8744 6.96289 13.2583V17.0064C6.96302 17.3591 7.14891 17.6856 7.45215 17.8658L9.15137 18.8736C9.48467 19.0713 9.90723 18.8314 9.90723 18.4439V13.2583C9.90744 12.5242 10.4941 11.9293 11.2178 11.9292H12.0049V13.5601C12.0049 14.1637 12.6703 14.5222 13.1631 14.1841L17.6367 11.1099C18.0584 10.8202 18.0738 10.1959 17.667 9.88529L13.1924 6.47415Z" fill="#3D3D3D"/></svg>'};
const mk=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html)e.innerHTML=html;
  if(cls==='mclose')e.addEventListener('click',ev=>{ev.stopPropagation();try{parent.postMessage({ppExit:1},'*')}catch(_){}});return e};
/* screen-space layer (design px) for the call-to-action and its tap */
const UI=mk('div');UI.id='mui';const CTA=mk('div');CTA.id='mcta';const TAP=mk('div');TAP.id='mtap';UI.append(CTA,TAP);document.body.appendChild(UI);
function placeUI(){UI.style.transform=`scale(${V.u})`}
function cta(label,icon,x,y,w,o){if(CTA.dataset.l!==label){CTA.dataset.l=label;CTA.innerHTML=(icon?IC[icon]:'')+'<span>'+label+'</span>'}
  Object.assign(CTA.style,{left:x+'px',top:y+'px',width:w+'px',opacity:o,transform:`translateY(${(1-o)*10}px) scale(${1-.04*(CTA._press||0)})`})}
function tapAt(x,y,q){if(q<=0||q>=1){TAP.style.opacity=0;return}TAP.style.opacity=1-q;Object.assign(TAP.style,{left:x+'px',top:y+'px',transform:`scale(${.5+.7*q})`})}
/* world blur, inserted right above the footage */
function blurLayer(before){const b=mk('div','mblur');before.parentNode.insertBefore(b,before);return b}
function setBlur(b,v){if(b)b.style.opacity=cl(v)}
/* the opened pin is lifted out of the world to the top of the screen (Figma: pin above the card) */
const LIFT={x:215,y:203,w:54};
function lift(els,f,col='255,141,65'){if(f<=0){unlift(els);return}const e=els[1],r=e.getBoundingClientRect();if(!r.width)return;
  const P=[(r.left+r.width/2)/V.u,(r.top+r.height/2)/V.u],pw=r.width/V.u,loc=e.offsetWidth/pw;
  const dx=(LIFT.x-P[0])*f*loc, dy=(LIFT.y-P[1])*f*loc, sc=li(1,LIFT.w/pw,f);
  els.forEach(el=>{el.style.transformOrigin='50% 50%';el.style.transform+=` translate(${dx/(el===e?1:1)}px,${dy}px) scale(${sc})`});
  /* active state (Figma Pin · active): saturated fill, white rim, soft glow */
  /* Figma Pin · Status=Active: white glass body + category-coloured outer glow (radius 12.6 on a 60 pin) */
  e.style.filter='';e.style.opacity=li(1,.9,f);
  e.style.boxShadow=`0 0 ${12.6/60*LIFT.w*loc/sc}px rgba(${col},${f}), inset 0 0 0 ${1/sc*loc}px rgba(255,255,255,${.5*f})`}
function unlift(els){els[1].style.filter='';els[1].style.opacity='';els[1].style.boxShadow=''}
/* a pin's card: 380 wide under the lifted pin, folds back into it */
function cardUnder(els,w,size,f,pinEl){const k=380/size[0],[x,y]=xy(els[1]),top=LIFT.y+LIFT.w/2+18;
  const m=M([x,y],[25,Math.min(top,V.H-24-size[1]*k)],k);place(w,m);
  let pc=[LIFT.x,LIFT.y];if(pinEl){const r=pinEl.getBoundingClientRect();if(r.width)pc=[(r.left+r.width/2)/V.u,(r.top+r.height/2)/V.u]}
  const o=[(pc[0]-m.Ap[0])/k,(pc[1]-m.Ap[1])/k];els.forEach(e=>e.style.transformOrigin=`${o[0]}px ${o[1]}px`)}
const NAV={v:1};   // bottom bar visibility, read by the shell

const LY={};     // per-flow layout (not L: the route flow owns that name)
/* ======================= Explore ======================= */
if(FLOW==='explore'){
  LY.init=()=>{LY.rail=wrap([q('filterS'),q('metrics')]);LY.card=wrap([q('cardS'),q('card')]);
    LY.shade=wrap([q('shade')]);LY.col=wrap([q('column'),q('drag')]);
    LY.blur=blurLayer(LY.shade);
    const p0=pinEls[0];LY.card.after(p0[0],p0[1])};   // the opened pin sits above its card (Figma)
  LY.frame=t=>{FX=600;FY=417;placeWorld();
    place(LY.rail,M([1203,310],[424,cy(360)],1));
    LY.shade.style.opacity=0;
    place(LY.col,M([39,89],[24,158],303/262));
    const co=+q('card').style.opacity||0, open=cl(eo(pr(t,S1.cardIn[0],S1.cardIn[1])))*(1-ei(pr(t,S1.cardOut[0],S1.cardOut[1]))), sw=ei(pr(t,...S1.swipe));
    lift(pinEls[0],open);
    if(co>0)cardUnder([q('cardS'),q('card')],LY.card,[337,482.5],open,pinEls[0][1]);
    pinEls.forEach(p=>p.forEach(el=>el.style.opacity=(+el.style.opacity||1)*(1-sw)));
    setBlur(LY.blur,Math.max(open,sw));NAV.v=1-open}
}
/* ======================= Drop a Pin ======================= */
if(FLOW==='pin'){
  { const ov=window.vsync, FREEZE=T.drag[0]-.15;
    window.vsync=(v,want)=>{if(!v||!v.duration)return;if(want>=FREEZE){if(!v.paused)v.pause();if(!v.seeking&&Math.abs(v.currentTime-FREEZE)>.05)v.currentTime=Math.min(FREEZE,v.duration-.05);return}ov(v,want)} }
  LY.init=()=>{
    /* note card at its mobile size (Figma 1005:30788): 340 wide, back · badge · close on top */
    const css=document.createElement('style');css.textContent=`
#note{width:340px!important;border-radius:25.448px!important}
#note .top{justify-content:space-between!important;align-items:center;padding:20.36px 20.36px 10.18px!important;position:relative}
#note .top .mclose,#note .top .mback{position:relative}
#note .tbadge{gap:8px!important;padding:10px 18px 9px!important}
#note .tbadge img{width:21.43px!important;height:22.82px!important}
#note .tbadge span{font-size:12px!important;line-height:16.24px!important}
#note .body{gap:20px!important;padding:20px!important}
#note .ethereal{height:240px!important;border-radius:21.146px!important;padding:18.68px 19.61px!important}
#note .tarea{padding-top:6.92px!important}
#note .tarea .ph{font-size:13px!important;width:auto!important}
#note .tarea .typed{top:6.92px!important;font-size:13px!important}
#note .actions .l{gap:6.92px!important}
#note .chip{height:39px!important}#note .chip.sq{width:39px!important}
#note .chip img,#note #dict .icw{width:24px!important;height:24px!important}
#note #dict{gap:6px!important;padding:0 16px!important}#note #dict .lbl{font-size:14px!important}
#note #drop{padding:18px 15px!important;border-radius:32px!important;box-shadow:0 4px 20px rgba(0,0,0,.1)}
#note #drop span{font-size:16px!important;letter-spacing:-.32px!important}`;document.head.appendChild(css);
    const top=q('note').querySelector('.top');top.prepend(mk('div','mback',IC.back));top.append(mk('div','mclose',IC.close));
    LY.blur=blurLayer(q('cat'));
    LY.cat=wrap([q('cat')]);LY.note=wrap([q('note')])};
  LY.frame=t=>{
    const cam=li(0,-141,ei(pr(t,...T.drag)));q('stage').style.transform=`translateX(${cam}px)`;   // no camera drift after the drop
    FX=li(640,934,ei(pr(t,...T.drag)));FY=417;placeWorld();
    const par={x:cam,y:2};
    /* the category card is pinned to the screen, not to the ground */
    const c=q('cat');c.style.transform=(c.style.transform||'').replace(/translate\(\s*-?[\d.]+px,/,'translate(0px,');
    place(LY.cat,M([97,270],[103,cy(314)],224/256),par);
    /* note opens under the dropped pin, at 1:1 */
    const {s,tx,ty}=world(), P=[tx+s*(PIN_C.x+cam),ty+s*(PIN_C.y+2)];
    const nh=q('note').offsetHeight||430;
    place(LY.note,M([295,175],[45,Math.min(P[1]+40.5+28,V.H-24-nh)],1),par);
    {const pe=q('pin');pe.style.transformOrigin='50% 50%';pe.style.transform+=` scale(${81/(PIN.s*world().s)})`}
    {const on=pr(t,T.dictTap+.05,T.dictTap+.3)*(1-pr(t,T.dict[1],T.dict[1]+.25)),l=q('note').querySelector('.actions .l');
      l.style.opacity=1-on;l.style.transform=`translateX(${-12*on}px)`;l.style.pointerEvents=on>.5?'none':''}
    const cIn=eo(pr(t,...T.catIn))*(1-pr(t,...T.catOut)), nIn=eo(pr(t,...T.noteIn))*(1-pr(t,...T.noteOut));
    setBlur(LY.blur,Math.max(cIn*(1-pr(t,T.drag[0]-.2,T.drag[0]+.2)),nIn));
    NAV.v=t<T.press?1:t>=T.noteOut[1]?eo(pr(t,T.noteOut[1],T.noteOut[1]+.4)):0;
    /* tap pulses follow the buttons where they now sit */
    const tp=q('tap');if(+tp.style.opacity>0){const tgt=t<T.dropTap?q('dict'):q('drop'),[X,Y]=ctr(tgt);
      const lx=(X-tx)/s-par.x, ly=(Y-ty)/s-par.y, sc=(tp.style.transform.match(/scale\(([\d.]+)\)/)||[0,1])[1];
      tp.style.transform=`translate(${lx}px,${ly}px) scale(${sc})`}}
}
/* ======================= Create route ======================= */
/* Figma: range → theme → (building) → pin list (Make Route) → finished route (Navigate).
   The flow's live editing (dragging a card into the route) is skipped: the mobile clock m is re-mapped
   onto the flow clock (WARP) — the building card plays right after the theme, the list holds, then the
   finished route is shown. */
if(FLOW==='route'){
  const P={listIn:B0, listPop:.9, mk:B0+2.6, routeIn:B0+3.0};
  LY.warp=m=>{if(m<P.listIn+P.listPop||m>=C0)return m; if(m<P.routeIn)return B0+P.listPop; return B0+5.8};
  LY.init=()=>{
    const css=document.createElement('style');css.textContent=`
#lcard .tag{font-size:13px!important;height:28px!important}#lcard h2{font-size:26px!important}
#steps .st{font-size:17px!important;height:36px!important}#mlist img{display:block;width:100%;height:auto}`;document.head.appendChild(css);
    LY.range=wrap([q('range')]);LY.row=wrap([q('row')]);LY.create=wrap([q('create')]);
    LY.lcard=wrap([q('lcard')]);LY.pick=wrap([q('pick')]);
    LY.left=wrap([q('left')]);LY.right=wrap([q('right')]);LY.fly=wrap([q('fly')]);
    LY.navg=wrap([...q('sceneC').children].filter(e=>e.id!=='navBg'));
    [...LY.navg.children].forEach(e=>e.style.opacity='');   // the flow fades sceneC's children; that is now the wrapper
    LY.floor=wrap([q('floorWrap')],true);LY.arr=wrap([q('arrWrap')],true);
    LY.wblur=blurLayer(q('wCardS'));wpEls[0].forEach(e=>LY.wblur.parentNode.insertBefore(e,q('wCardS')));
    LY.rail=wrap([q('wRailS'),q('wRail'),q('wMetrics')]);LY.wcard=wrap([q('wCardS'),q('wCard')]);LY.wcard.after(wpEls[0][0],wpEls[0][1]);
    LY.tap=wrap([q('tap')]);LY.drag=wrap([q('drag')]);
    /* Generated Route panel rebuilt at Figma proportions (1005:29428): 380 wide, header 72.5, map 233, timeline list */
    const R=q('right'),k=380/625,HD=72.5/k,MAPH=233/k,MS=MAPH/286,g=mk('div');
    g.style.cssText=`position:absolute;left:0;top:0;width:625px;height:351px;transform-origin:312.5px 65px;transform:translateY(${HD-65}px) scale(${MS})`;
    ['map','routeSvg','pinsImg','newPin'].forEach(id=>g.appendChild(q(id)));R.insertBefore(g,q('tl'));
    ['tl','oldList','newCard'].forEach(id=>q(id).style.display='none');
    q('nb').style.display='none';    q('t5').style.display='none';q('t6').style.opacity=1;q('newPin').style.opacity=1;
    /* list: timeline (x20) + pin cards (x60, ~300 wide), same cards as the Culture & Art list */
    const L=mk('div');L.id='mlist';L.style.cssText=`position:absolute;left:0;top:${HD+MAPH}px;width:625px`;
    const line=mk('div');line.style.cssText=`position:absolute;left:${33/k}px;top:${45/k}px;width:${1.2/k}px;height:2000px;background:rgba(255,255,255,.35)`;L.appendChild(line);
    let y=31/k;['card0','card1','card2','card3'].forEach((c,i)=>{const im=mk('img');im.src=`assets/${c}.png`;
      im.style.cssText=`position:absolute;left:${60/k}px;top:${y}px;width:${300/k}px`;L.appendChild(im);
      const b=mk('div');b.textContent=i+1;b.style.cssText=`position:absolute;left:${(33-10)/k}px;top:${y+14/k}px;width:${20/k}px;height:${20/k}px;border-radius:999px;background:#1c1c1c;color:#fff;font:800 ${11/k}px/${20/k}px Montserrat,system-ui,sans-serif;text-align:center`;L.appendChild(b);
      y+=(300*431/477+14)/k});
    R.appendChild(L);
    const x=mk('div','mclose',IC.close);x.style.cssText+=`left:${317.6/k}px;top:${20.4/k}px;transform:scale(${1/k});transform-origin:0 0`;R.appendChild(x);
    {const e=q('t6');e.style.transformOrigin='0 0';e.style.transform='scale(1.08)';e.style.left=(20/k-7)+'px';e.style.top=(24/k-12)+'px'}
    const xl=mk('div','mclose',IC.close);xl.style.cssText+='left:278px;top:16px;transform:scale(.95);transform-origin:0 0';q('left').appendChild(xl)};
  LY.frame=(t,m)=>{
    const tc=t-C0;
    FX=tc<0?605:li(li(605,470,ei(pr(tc,...C.in))),560,ei(pr(tc,...D.swap)));FY=417;placeWorld();
    const W=V.W,H=V.H;
    /* A · range, then theme — one picker at a time, each with Select under it */
    const SPLIT=2.25, rs=ei(pr(m,SPLIT-.1,SPLIT+.35)), aGone=m>=A.out[1];
    const mRange=M([42,305.2],[125,cy(315)],179/142), mRow=M([605,403.5],[W/2,cy(458)],200/235);
    place(LY.range,mRange);LY.range.style.opacity=aGone?0:1-rs;
    place(LY.row,mRow);LY.row.style.opacity=aGone?0:rs;
    LY.create.style.opacity=0;
    /* L · building (right after the theme): the chosen theme card flies into it */
    const mL=M([375,279],[25,cy(330)],380/460);place(LY.lcard,mL);
    place(LY.pick,mix(mRow,mL,ei(pr(t-L0,...L.fly))));LY.pick.style.opacity=m<P.listIn?1:0;
    /* B · pin list (Make Route) → finished route (Navigate) */
    const kL=349/332, kR=380/625, ph=H-179-143;
    q('left').style.height=(ph/kL)+'px';q('right').style.height=(ph/kR)+'px';
    const lo=m<P.listIn?0:(m<P.routeIn?1:1-pr(m,P.routeIn,P.routeIn+.25)), ro=m<C0?pr(m,P.routeIn,P.routeIn+.35):1-pr(tc,...C.out);
    place(LY.left,M([137,123],[40,179],kL));LY.left.style.opacity=lo;LY.left.style.visibility=lo>0?'visible':'hidden';
    place(LY.right,M([483,123],[25,179+16*(1-ro)],kR));LY.right.style.opacity=ro;LY.right.style.visibility=ro>0?'visible':'hidden';
    if(m>=P.listIn&&m<C0){q('sceneB').style.visibility='visible';q('sceneB').style.opacity=1}
    LY.fly.style.opacity=0;
    place(LY.navg,M([469,31],[18.5,77],62/63));
    const mFloor=M([473,543],[83,by(546)],1);place(LY.floor,mFloor);place(LY.arr,mFloor);
    /* D · the pin's place: same rules as Explore */
    place(LY.rail,M([1203,310],[424,cy(360)],1));
    const wopen=tc>=0?eo(pr(tc,...D.cardIn))*(tc>=D.tap?1:0):0;
    if(tc>=D.tap)lift(wpEls[0],wopen,'255,155,237');
    if(+q('wCard').style.opacity>0)cardUnder([q('wCardS'),q('wCard')],LY.wcard,[337,501],wopen,wpEls[0][1]);
    setBlur(LY.wblur,wopen);LY.rail.style.opacity=1-wopen;
    /* call to action + its tap */
    const aIn=eo(pr(m,...A.in))*(1-pr(m,...A.out));
    if(m<A.out[1])cta('Select',null,134,cy(638),162,aIn);
    else if(m<P.listIn)cta('',null,41,by(812),348,0);
    else if(m<P.routeIn)cta('Make Route',null,41,by(812),348,eo(pr(m,P.listIn+.3,P.listIn+.7))*(1-pr(m,P.routeIn,P.routeIn+.2)));
    else cta('Navigate','nav',25,by(812),380,ro);
    const tapQ=a=>m>=a&&m<a+.45?pr(m,a,a+.45):0;
    let tq=0,tx=215,ty=0;
    if(tapQ(SPLIT-.35)){tq=tapQ(SPLIT-.35);ty=cy(661)}
    else if(tapQ(A.tap)){tq=tapQ(A.tap);ty=cy(661)}
    else if(tapQ(P.mk)){tq=tapQ(P.mk);ty=by(835)}
    else if(tapQ(C0)){tq=tapQ(C0);ty=by(836)}
    tapAt(tx,ty,tq);CTA._press=tq>0?Math.sin(Math.PI*tq):0;
    /* bottom bar: on range/theme; hidden from building until navigation; hidden while the pin's card is open */
    NAV.v=m<A.out[0]?1:m<A.out[1]?1-pr(m,...A.out):(tc>=C.ui[0]?(1-wopen)*eo(pr(tc,...C.ui)):0);
    let md=null;
    if(m>=RANGE.spin[0]-.2&&m<RANGE.spin[1]+.3)md=mRange; else if(m<A.tap)md=mRow;
    place(LY.drag,md);LY.drag.style.opacity=md?1:0;LY.tap.style.opacity=tc>=D.tap-.1?1:0};
}
window.__mnav=()=>NAV.v;

/* ---------- hook into the flow ---------- */
let ready=false;
const origApply=window.apply;
window.apply=function(m){const t=LY.warp?LY.warp(m):m;origApply(t);if(ready)try{LY.frame(t,m)}catch(e){console.warn(e)}};
window.fit=function(){dims();placeWorld();placeUI()};
addEventListener('resize',()=>{dims();placeUI();try{window.__seek&&window.__seek(window.__t?window.__t():0)}catch(e){}});
dims();placeUI();LY.init();ready=true;try{LY.frame(0,0)}catch(e){}placeWorld();
if(FLOW==='pin'&&typeof measure==='function'){try{measure()}catch(e){}}
/* the pin flow measures its buttons on restart: lay out the t=0 screen first so it measures where they now sit */
if(FLOW==='pin'){const r=window.__restart;window.__restart=()=>{q('stage').style.transform='translateX(0px)';try{LY.frame(0,0)}catch(e){}r()}}
})();
