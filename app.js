const PRIZES = [
  {name:"Café gratis",desc:"Un café de regalo para disfrutar en el bar.",color:"#e7a83b",weight:18},
  {name:"Postre gratis",desc:"Un postre de regalo. ¡Que lo disfrutes!",color:"#df6c55",weight:15},
  {name:"2x1 en cerveza",desc:"Pedí una cerveza y llevate otra de regalo según las condiciones del bar.",color:"#f2d36b",weight:17},
  {name:"Gaseosa gratis",desc:"Una gaseosa de regalo.",color:"#63b5a3",weight:15},
  {name:"Combo cafetería",desc:"Un combo de cafetería de regalo.",color:"#8c79ca",weight:8},
  {name:"Picada para dos",desc:"Una picada para compartir entre dos personas.",color:"#d96f9a",weight:5},
  {name:"Happy Hour VIP",desc:"Acceso a una promoción Happy Hour VIP.",color:"#5c91d6",weight:7},
  {name:"Almuerzo para dos",desc:"Un almuerzo para dos personas.",color:"#80a85b",weight:3},
  {name:"Cena para dos",desc:"Una cena para dos personas.",color:"#ba784a",weight:2},
  {name:"Chef por un día",desc:"Experiencia especial: Chef por un día.",color:"#e0a6be",weight:1},
  {name:"Taller Creá tu Propio Labial",desc:"Un lugar para el taller Creá tu Propio Labial.",color:"#9d83c9",weight:2},
  {name:"Voucher de juegos",desc:"Un voucher para juegos.",color:"#599d9b",weight:7}
];
const $ = s => document.querySelector(s);
const wheel = $("#wheel"), ctx = wheel.getContext("2d");
let rotation = 0, spinning = false, currentCoupon = null, currentValidation = null;
const store = {
  get coupons(){try{return JSON.parse(localStorage.getItem("ruletaCoupons")||"[]")}catch{return []}},
  set coupons(v){localStorage.setItem("ruletaCoupons",JSON.stringify(v))},
  get days(){return Number(localStorage.getItem("ruletaExpiryDays")||7)},
  set days(v){localStorage.setItem("ruletaExpiryDays",String(v))}
};
function drawWheel(rot=rotation){
  const n=PRIZES.length,c=wheel.width/2,r=wheel.width/2-8,arc=Math.PI*2/n;
  ctx.clearRect(0,0,wheel.width,wheel.height);
  ctx.save();ctx.translate(c,c);ctx.rotate(rot);
  PRIZES.forEach((p,i)=>{
    const start=-Math.PI/2+i*arc,end=start+arc;
    ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r,start,end);ctx.closePath();ctx.fillStyle=p.color;ctx.fill();
    ctx.strokeStyle="#fff5dc";ctx.lineWidth=4;ctx.stroke();
    ctx.save();ctx.rotate(start+arc/2);ctx.textAlign="right";ctx.fillStyle="#fff";ctx.font="bold 19px Arial";
    ctx.shadowColor="#0005";ctx.shadowBlur=3;
    const words=p.name.split(" ");let lines=[],line="";
    for(const word of words){if((line+" "+word).trim().length>17){lines.push(line);line=word}else line=(line+" "+word).trim()}if(line)lines.push(line);
    const labelX=r-26, total=(lines.length-1)*22;
    lines.forEach((w,j)=>ctx.fillText(w,labelX,-total/2+j*22));
    ctx.restore();
  });
  ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.strokeStyle="#fff0c2";ctx.lineWidth=9;ctx.stroke();ctx.restore();
}
drawWheel();
function makeCode(){
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let s="";
  for(let i=0;i<8;i++)s+=chars[Math.floor(Math.random()*chars.length)];
  return `RST-${s.slice(0,4)}-${s.slice(4)}`;
}
function dateFmt(iso){return new Date(iso).toLocaleDateString("es-AR",{day:"2-digit",month:"2-digit",year:"numeric"})}
function statusOf(c){
  if(c.status==="canjeado")return "canjeado";
  if(c.status==="anulado")return "anulado";
  if(Date.now()>new Date(c.expiresAt).getTime())return "vencido";
  return "emitido";
}
function renderCoupon(c){
  currentCoupon=c;
  $("#prizeTitle").textContent=c.prize;
  $("#prizeDescription").textContent=c.description;
  $("#couponCode").textContent=c.code;
  $("#couponExpiry").textContent=dateFmt(c.expiresAt);
  $("#couponStatus").textContent=statusOf(c).toUpperCase();
  $("#couponStatus").className="status "+(statusOf(c)==="canjeado"?"redeemed":statusOf(c)==="emitido"?"issued":"expired");
  const qr=$("#qr");qr.innerHTML="";
  if(window.QRCode){new QRCode(qr,{text:c.code,width:94,height:94,colorDark:"#111827",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M})}
  else {qr.innerHTML='<span style="font-size:10px;color:#333;text-align:center">QR no disponible<br>Usá el código</span>'}
}
function renderRows(){
  const rows=$("#couponRows");rows.innerHTML="";
  const coupons=[...store.coupons].reverse();
  $("#emptyCoupons").classList.toggle("hidden",coupons.length>0);
  coupons.forEach(c=>{
    const st=statusOf(c),tr=document.createElement("tr");
    [c.code,c.prize,c.customer||"—",dateFmt(c.expiresAt)].forEach(v=>{const td=document.createElement("td");td.textContent=v;tr.appendChild(td)});
    const td=document.createElement("td"),tag=document.createElement("span");tag.className="tag "+(st==="canjeado"?"redeemed":st==="emitido"?"": "expired");tag.textContent=st.toUpperCase();td.appendChild(tag);tr.appendChild(td);rows.appendChild(tr);
  });
}
function showView(admin){$("#playView").classList.toggle("hidden",admin);$("#adminView").classList.toggle("hidden",!admin);$("#adminToggle").textContent=admin?"Volver al juego":"Modo encargado";if(admin){$("#expiryDays").value=String(store.days);renderRows()}}
$("#adminToggle").addEventListener("click",()=>showView(!$("#adminView").classList.contains("hidden")));
$("#backToPlay").addEventListener("click",()=>showView(false));
$("#saveSettings").addEventListener("click",()=>{store.days=Number($("#expiryDays").value);alert("Configuración guardada para los próximos cupones.")});
$("#playerForm").addEventListener("submit",e=>{
  e.preventDefault();if(spinning)return;
  const form=new FormData(e.currentTarget);
  const customer=String(form.get("name")).trim();
  const chosenIndex=weightedPrize();
  const n=PRIZES.length,arc=Math.PI*2/n;
  // Wheel pointer is at -90deg. Rotate to the center of selected segment.
  const target=-((chosenIndex+.5)*arc);
  const normalized=((target%(Math.PI*2))+(Math.PI*2))%(Math.PI*2);
  const current=((rotation%(Math.PI*2))+(Math.PI*2))%(Math.PI*2);
  let delta=(normalized-current+Math.PI*2)%(Math.PI*2);
  const finalRotation=rotation+Math.PI*2*6+delta;
  spinning=true;$("#spinBtn").disabled=true;
  const start=rotation,change=finalRotation-start,duration=4200,t0=performance.now();
  function anim(now){let t=Math.min(1,(now-t0)/duration),ease=1-Math.pow(1-t,4);rotation=start+change*ease;drawWheel(rotation);if(t<1)requestAnimationFrame(anim);else{
    rotation=finalRotation%(Math.PI*2);drawWheel(rotation);spinning=false;$("#spinBtn").disabled=false;
    const prize=PRIZES[chosenIndex],issuedAt=new Date(),expiresAt=new Date(issuedAt.getTime()+store.days*86400000);
    const c={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),code:makeCode(),prize:prize.name,description:prize.desc,customer,phone:String(form.get("phone")),birthday:String(form.get("birthday")),member:String(form.get("member")),issuedAt:issuedAt.toISOString(),expiresAt:expiresAt.toISOString(),status:"emitido"};
    const all=store.coupons;all.push(c);store.coupons=all;renderCoupon(c);$("#resultPanel").classList.remove("hidden");$("#resultPanel").scrollIntoView({behavior:"smooth",block:"start"});
  }}
  requestAnimationFrame(anim);
});
function weightedPrize(){const total=PRIZES.reduce((s,p)=>s+p.weight,0);let x=Math.random()*total;for(let i=0;i<PRIZES.length;i++){x-=PRIZES[i].weight;if(x<0)return i}return 0}
$("#printBtn").addEventListener("click",()=>window.print());
$("#againBtn").addEventListener("click",()=>{$("#resultPanel").classList.add("hidden");$("#playerForm").reset();window.scrollTo({top:0,behavior:"smooth"})});
$("#validateForm").addEventListener("submit",e=>{
  e.preventDefault();const code=$("#validateCode").value.trim().toUpperCase(),c=store.coupons.find(x=>x.code.toUpperCase()===code);
  const out=$("#validationResult"),btn=$("#redeemBtn");out.className="validation";btn.classList.add("hidden");currentValidation=null;
  if(!c){out.classList.add("bad");out.textContent="No encontramos un cupón con ese código. Revisá que esté bien escrito.";out.classList.remove("hidden");return}
  currentValidation=c;const st=statusOf(c);out.classList.add(st==="emitido"?"ok":"bad");
  out.innerHTML=`<strong>${escapeHtml(c.prize)}</strong><br>Código: ${escapeHtml(c.code)}<br>Cliente: ${escapeHtml(c.customer||"—")}<br>Vence: ${dateFmt(c.expiresAt)}<br>Estado: <strong>${st.toUpperCase()}</strong>`;
  out.classList.remove("hidden");
  if(st==="emitido")btn.classList.remove("hidden");
});
$("#redeemBtn").addEventListener("click",()=>{
  if(!currentValidation||statusOf(currentValidation)!=="emitido")return;
  const all=store.coupons,idx=all.findIndex(c=>c.id===currentValidation.id);
  if(idx<0)return;all[idx].status="canjeado";all[idx].redeemedAt=new Date().toISOString();store.coupons=all;currentValidation=all[idx];
  $("#validationResult").className="validation bad";$("#validationResult").innerHTML=`<strong>${escapeHtml(currentValidation.prize)}</strong><br>Código: ${escapeHtml(currentValidation.code)}<br>Estado: <strong>CANJEADO</strong><br>Este cupón ya quedó marcado como utilizado.`;
  $("#redeemBtn").classList.add("hidden");renderRows();
});
$("#exportBtn").addEventListener("click",()=>{
  const data=store.coupons,cols=["code","prize","customer","phone","member","issuedAt","expiresAt","status"];
  const csv=[cols.join(","),...data.map(c=>cols.map(k=>'"'+String(c[k]??"").replaceAll('"','""')+'"').join(","))].join("\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));a.download="cupones-ruleta.csv";a.click();URL.revokeObjectURL(a.href);
});
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
