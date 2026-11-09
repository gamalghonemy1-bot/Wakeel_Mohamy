const H={'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type,Authorization'};
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:H});
const DAY=864e5,TRIAL=10;
async function state(env,device,code){
 if(code){const l=await env.DB.get('lic:'+code,'json');
  if(l){if(l.device&&l.device!==device)return{ok:false,reason:'used'};
   if(l.expires&&Date.now()>l.expires)return{ok:false,reason:'expired'};
   return{ok:true,plan:'full'}}}
 if(!device)return{ok:false};
 let t=await env.DB.get('trial:'+device);
 if(!t){t=String(Date.now());await env.DB.put('trial:'+device,t)}
 const left=TRIAL-Math.floor((Date.now()-Number(t))/DAY);
 return left>0?{ok:true,plan:'trial',left}:{ok:false,reason:'trial_over'};
}
export default{async fetch(req,env){
 if(req.method==='OPTIONS')return J({});
 const u=new URL(req.url),b=req.method==='POST'?await req.json().catch(()=>({})):{};
 if(u.pathname==='/status')return J(await state(env,b.device,b.code));
 if(u.pathname==='/activate'){
  const l=await env.DB.get('lic:'+b.code,'json');
  if(!l)return J({ok:false},404);
  if(l.device&&l.device!==b.device)return J({ok:false,reason:'used'},403);
  l.device=b.device;if(!l.expires&&l.days)l.expires=Date.now()+l.days*DAY;
  await env.DB.put('lic:'+b.code,JSON.stringify(l));return J({ok:true});
 }
 if(u.pathname==='/analyze'){
  const s=await state(env,b.device,b.code);if(!s.ok)return J({error:'license'},403);
  const content=[...(b.images||[]).slice(0,5).map(i=>({type:'image',source:{type:'base64',media_type:'image/jpeg',data:i.data}})),{type:'text',text:String(b.prompt||'').slice(0,150000)}];
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'x-api-key':env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01','content-type':'application/json'},body:JSON.stringify({model:'claude-sonnet-5-5',max_tokens:4000,messages:[{role:'user',content}]})});
  const d=await r.json();
  return J({text:(d.content||[]).map(x=>x.text||'').join('')||d.error?.message||''});
 }
 if(u.pathname==='/admin/create'){
  if(req.headers.get('Authorization')!=='Bearer '+env.ADMIN_TOKEN)return J({},401);
  const code='LAW-'+crypto.randomUUID().slice(0,8).toUpperCase();
  await env.DB.put('lic:'+code,JSON.stringify({days:b.days||365,device:null}));return J({code});
 }
 return J({error:'not found'},404);
}};
