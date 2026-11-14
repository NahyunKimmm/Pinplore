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

const LY={};     // per-flow layout (not L: the route flow owns that name)
/* ======================= Explore ======================= */
if(FLOW==='explore'){
  LY.init=()=>{LY.rail=wrap([q('filterS'),q('metrics')]);LY.card=wrap([q('cardS'),q('card')]);
    LY.shade=wrap([q('shade')]);LY.col=wrap([q('column'),q('drag')])};
  LY.frame=t=>{FX=600;FY=417;placeWorld();
    place(LY.rail,M([1257,430],[V.W-12,V.H*.47],.8));
    place(LY.shade,M([0,0],[0,0],V.H/834));
    place(LY.col,M([39,89],[16,96],cl((V.H-96-118)/800,.6,1)));
    const pin=pinEls[0][1]; if(+q('card').style.opacity>0)panelAt([q('cardS'),q('card')],LY.card,ctr(pin),[337,482.5])}
}
/* ======================= Drop a Pin ======================= */
if(FLOW==='pin'){
  LY.init=()=>{LY.cat=wrap([q('cat')]);LY.note=wrap([q('note')])};
  LY.frame=t=>{
    const cam=+((q('stage').style.transform||'').match(/translateX\((-?[\d.]+)px/)||[0,0])[1];
    FX=li(640,934,ei(pr(t,...T.drag)));FY=417;placeWorld();
    const par={x:cam,y:2};
    /* the category card is pinned to the screen, not to the ground */
    const c=q('cat');c.style.transform=(c.style.transform||'').replace(/translate\(\s*-?[\d.]+px,/,'translate(0px,');
    place(LY.cat,M([97+127,270],[V.W/2,V.H*.42],.82),par);
    /* note opens under the dropped pin */
    const {s,tx,ty}=world(), P=[tx+s*(PIN_C.x+cam),ty+s*(PIN_C.y+2)];
    const k=Math.min((V.W-24)/635.33,.68);
    place(LY.note,M([295+317.7,175],[V.W/2,P[1]+s*PIN.s/2+22],k),par);
    /* tap pulses follow the buttons where they now sit */
    const tp=q('tap');if(+tp.style.opacity>0){const tgt=t<T.dropTap?q('dict'):q('drop'),[X,Y]=ctr(tgt);
      const lx=(X-tx)/s-par.x, ly=(Y-ty)/s-par.y, sc=(tp.style.transform.match(/scale\(([\d.]+)\)/)||[0,1])[1];
      tp.style.transform=`translate(${lx}px,${ly}px) scale(${sc})`}}
}
/* ======================= Create route ======================= */
if(FLOW==='route'){
  LY.init=()=>{
    LY.range=wrap([q('range')]);LY.row=wrap([q('row')]);LY.create=wrap([q('create')]);
    LY.lcard=wrap([q('lcard')]);LY.pick=wrap([q('pick')]);
    LY.left=wrap([q('left')]);LY.right=wrap([q('right')]);LY.fly=wrap([q('fly')]);
    LY.navg=wrap([...q('sceneC').children].filter(e=>e.id!=='navBg'));
    [...LY.navg.children].forEach(e=>e.style.opacity='');   // the flow fades sceneC's children; that is now the wrapper
    LY.floor=wrap([q('floorWrap')],true);LY.arr=wrap([q('arrWrap')],true);
    LY.rail=wrap([q('wRailS'),q('wRail'),q('wMetrics')]);LY.wcard=wrap([q('wCardS'),q('wCard')]);
    LY.tap=wrap([q('tap')]);LY.drag=wrap([q('drag')])};
  LY.frame=t=>{
    const tc=t-C0, tb=t-B0, tl=t-L0;
    FX=tc<0?605:li(li(605,470,ei(pr(tc,...C.in))),560,ei(pr(tc,...D.swap)));FY=417;placeWorld();
    const W=V.W,H=V.H;
    const mRange=M([113,305],[W/2,108],.78), mRow=M([605,431],[W/2,cl(H*.5,420,560)],.78), mCreate=M([605,676],[W/2,Math.min(H-150,mRow.Ap[1]+250)],.82);
    const mL=M([605,417],[W/2,H*.43],(W-36)/460);
    const kR=(W-24)/625, mRight=M([795.5,123],[W/2,100],kR), kL=cl((H-118-(100+658*kR+14))/658,.36,.6), mLeft=M([303,123],[W/2,100+658*kR+14],kL);
    const mNav=M([655,31],[W/2,46],.82), mFloor=M([605,788],[W/2,H-112],.82);
    place(LY.range,mRange);place(LY.row,mRow);place(LY.create,mCreate);place(LY.lcard,mL);
    place(LY.pick,mix(mRow,mL,ei(pr(tl,...L.fly))));
    place(LY.left,mLeft);place(LY.right,mRight);place(LY.fly,mix(mLeft,mRight,ei(pr(tb,...B.fly))));
    place(LY.navg,mNav);place(LY.floor,mFloor);place(LY.arr,mFloor);
    place(LY.rail,M([1257,430],[W-12,H*.47],.8));
    if(+q('wCard').style.opacity>0)panelAt([q('wCardS'),q('wCard')],LY.wcard,ctr(wpEls[0][1]),[337,501]);
    /* touch indicators sit on whichever control the action belongs to */
    let mt=null,md=null;
    if(t>=A.tap&&t<A.tap+.5)mt=mCreate; else if(tc>=0&&tc<.5)mt=mRight;
    if(t>=RANGE.spin[0]-.2&&t<RANGE.spin[1]+.3)md=mRange; else if(t<A.tap)md=mRow; else if(tb>=0&&tb<B.land+.3)md=mix(mLeft,mRight,ei(pr(tb,...B.fly)));
    place(LY.tap,mt);place(LY.drag,md)};
}

/* ---------- hook into the flow ---------- */
let ready=false;
const origApply=window.apply;
window.apply=function(t){origApply(t);if(ready)try{LY.frame(t)}catch(e){console.warn(e)}};
window.fit=function(){dims();placeWorld()};
addEventListener('resize',()=>{dims();try{window.__seek&&window.__seek(window.__t?window.__t():0)}catch(e){}});
dims();LY.init();ready=true;try{LY.frame(0)}catch(e){}placeWorld();
if(FLOW==='pin'&&typeof measure==='function'){try{measure()}catch(e){}}
/* the pin flow measures its buttons on restart: lay out the t=0 screen first so it measures where they now sit */
if(FLOW==='pin'){const r=window.__restart;window.__restart=()=>{q('stage').style.transform='translateX(0px)';try{LY.frame(0)}catch(e){}r()}}
})();
