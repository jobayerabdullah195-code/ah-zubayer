const J=(o,s=200,h={})=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json',...h}});
async function token(env){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.ADMIN_PASSWORD),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return [...new Uint8Array(await crypto.subtle.sign('HMAC',k,new TextEncoder().encode('ahz-admin')))].map(x=>x.toString(16).padStart(2,'0')).join('')}
export async function onRequest({request,env,params}){
  if(!env.ADMIN_PASSWORD)return J({error:'Set the ADMIN_PASSWORD secret first.'},500);
  const p=(params.path||[])[0],m=request.method,t=await token(env),DB=env.DB;
  if(p==='login'&&m==='POST'){const b=await request.json().catch(()=>({}));
    if(b.password!==env.ADMIN_PASSWORD)return J({error:'Wrong password'},401);
    return J({ok:true},200,{'set-cookie':`adm=${t}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`})}
  if(!(request.headers.get('cookie')||'').includes('adm='+t))return J({error:'unauthorized'},401);
  if(p==='logout')return J({ok:true},200,{'set-cookie':'adm=; Path=/; Max-Age=0'});
  const q=(s,...a)=>DB.prepare(s).bind(...a),id=()=>+new URL(request.url).searchParams.get('id');
  if(p==='stats'){
    const r=await DB.batch([
      q('SELECT COUNT(*) n FROM visits'),q('SELECT COUNT(DISTINCT vid) n FROM visits'),q("SELECT COUNT(*) n FROM visits WHERE date(created_at)=date('now')"),
      q('SELECT path k,COUNT(*) n,ROUND(AVG(duration)) avg FROM visits GROUP BY path ORDER BY n DESC LIMIT 8'),
      q("SELECT COALESCE(NULLIF(country,''),'Unknown') k,COUNT(*) n FROM visits GROUP BY k ORDER BY n DESC LIMIT 8"),
      q('SELECT device k,COUNT(*) n FROM visits GROUP BY device ORDER BY n DESC'),
      q("SELECT COALESCE(NULLIF(referrer,''),'Direct') k,COUNT(*) n FROM visits GROUP BY k ORDER BY n DESC LIMIT 8"),
      q('SELECT created_at,path,country,city,device,browser,os,referrer,duration,vid FROM visits ORDER BY id DESC LIMIT 60'),
      q("SELECT date(created_at) k,COUNT(*) n FROM visits WHERE created_at>=date('now','-13 days') GROUP BY k ORDER BY k"),
      q('SELECT url,score,created_at FROM audits ORDER BY id DESC LIMIT 10')]);
    return J({total:r[0].results[0].n,unique:r[1].results[0].n,today:r[2].results[0].n,pages:r[3].results,countries:r[4].results,devices:r[5].results,refs:r[6].results,recent:r[7].results,daily:r[8].results,audits:r[9].results})}
  if(p==='messages'){if(m==='DELETE'){await q('DELETE FROM messages WHERE id=?',id()).run();return J({ok:true})}
    return J((await DB.prepare('SELECT * FROM messages ORDER BY id DESC LIMIT 100').all()).results)}
  if(p==='posts'){
    if(m==='POST'){const b=await request.json();if(!b.title||!b.body)return J({error:'Title and body are required'},400);
      if(b.id)await q('UPDATE posts SET title=?,excerpt=?,body=? WHERE id=?',b.title,b.excerpt||'',b.body,+b.id).run();else await q('INSERT INTO posts(title,excerpt,body) VALUES(?,?,?)',b.title,b.excerpt||'',b.body).run();return J({ok:true})}
    if(m==='DELETE'){await q('DELETE FROM posts WHERE id=?',id()).run();return J({ok:true})}
    return J((await DB.prepare('SELECT * FROM posts ORDER BY id DESC').all()).results)}
  return J({error:'not found'},404);
}
