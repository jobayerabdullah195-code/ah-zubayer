export async function onRequestGet({env}){
  const {results}=await env.DB.prepare('SELECT id,title,excerpt,body,created_at FROM posts ORDER BY id DESC LIMIT 50').all();
  return new Response(JSON.stringify(results),{headers:{'content-type':'application/json'}});
}
