const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json'}});
function ua(u){const b=/Edg\//.test(u)?'Edge':/OPR\//.test(u)?'Opera':/Chrome\//.test(u)?'Chrome':/Firefox\//.test(u)?'Firefox':/Safari\//.test(u)?'Safari':'Other';
const o=/Android/.test(u)?'Android':/iPhone|iPad/.test(u)?'iOS':/Windows/.test(u)?'Windows':/Mac OS/.test(u)?'macOS':/Linux/.test(u)?'Linux':'Other';
const d=/iPad|Tablet/.test(u)?'Tablet':/Mobi|Android|iPhone/.test(u)?'Mobile':'Desktop';return{b,o,d}}
async function sha(s){const h=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(h)].slice(0,8).map(x=>x.toString(16).padStart(2,'0')).join('')}
export async function onRequestPost({request,env}){
  let d;try{d=await request.json()}catch{return J({ok:false},400)}
  if(d.type==='ping'){if(d.id)await env.DB.prepare('UPDATE visits SET duration=? WHERE id=?').bind(Math.min(+d.duration||0,3600),+d.id).run();return J({ok:true})}
  const agent=request.headers.get('user-agent')||'';
  if(/bot|crawl|spider|headless/i.test(agent))return J({ok:true});
  const u=ua(agent),cf=request.cf||{},ip=request.headers.get('cf-connecting-ip')||'';
  const r=await env.DB.prepare('INSERT INTO visits(vid,sid,path,referrer,country,city,device,browser,os,ip_hash) VALUES(?,?,?,?,?,?,?,?,?,?)')
    .bind(String(d.vid||'').slice(0,40),String(d.sid||'').slice(0,40),String(d.path||'/').slice(0,200),String(d.ref||'').slice(0,300),cf.country||'',cf.city||'',u.d,u.b,u.o,await sha(ip+'ahz')).run();
  return J({ok:true,id:r.meta.last_row_id});
}
