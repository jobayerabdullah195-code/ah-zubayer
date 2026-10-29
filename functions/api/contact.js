const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json'}});
export async function onRequestPost({request,env}){
  const d=await request.json().catch(()=>({}));
  if(d.website)return J({ok:true});
  const name=String(d.name||'').trim().slice(0,100),email=String(d.email||'').trim().slice(0,150),body=String(d.body||'').trim().slice(0,3000);
  if(!name||!/^\S+@\S+\.\S+$/.test(email)||body.length<5)return J({error:'Please fill in your name, a valid email and a message.'},400);
  await env.DB.prepare('INSERT INTO messages(name,email,body) VALUES(?,?,?)').bind(name,email,body).run();
  return J({ok:true});
}
