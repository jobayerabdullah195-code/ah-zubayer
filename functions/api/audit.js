const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json'}});
const BLOCK=/^(localhost|.*\.local|.*\.internal|0\.0\.0\.0|127\..*|10\..*|192\.168\..*|172\.(1[6-9]|2\d|3[01])\..*|169\.254\..*|\[.*\])$/i;
export async function onRequestPost({request,env}){
  const d=await request.json().catch(()=>({}));let raw=String(d.url||'').trim();
  if(!raw)return J({error:'Enter a website URL.'},400);
  if(!/^https?:\/\//i.test(raw))raw='https://'+raw;
  let u;try{u=new URL(raw)}catch{return J({error:'That URL is not valid.'},400)}
  if(BLOCK.test(u.hostname)||!u.hostname.includes('.'))return J({error:'Enter a public website domain.'},400);
  const t0=Date.now();let res,html='';
  try{res=await fetch(u.href,{redirect:'follow',signal:AbortSignal.timeout(9000),headers:{'user-agent':'AHZubayerAuditBot/1.0'}});html=(await res.text()).slice(0,600000)}
  catch{return J({error:'Could not reach this website. Check the URL and try again.'},422)}
  const ms=Date.now()-t0,kb=Math.round(html.length/1024),final=new URL(res.url);
  const m=(re)=>(html.match(re)||[])[1]||'';
  const title=m(/<title[^>]*>([\s\S]*?)<\/title>/i).trim(),desc=m(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)/i)||m(/<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const imgs=html.match(/<img\b[^>]*>/gi)||[],noAlt=imgs.filter(i=>!/\balt=["'][^"']+["']/i.test(i)).length;
  const h1=(html.match(/<h1[\s>]/gi)||[]).length,h2=(html.match(/<h2[\s>]/gi)||[]).length;
  const C=[];const add=(name,max,pts,tip)=>C.push({name,max,points:pts,ok:pts===max,tip:pts===max?'Looks good.':tip});
  add('HTTPS',10,final.protocol==='https:'?10:0,'Serve the site over HTTPS (free with Cloudflare).');
  add('Page loads (HTTP 200)',5,res.status===200?5:0,'The page returned status '+res.status+'. Fix errors or broken redirects.');
  add('Server response speed',10,ms<1200?10:ms<2500?6:ms<4500?3:0,`Response took ${ms}ms. Add caching or a CDN and reduce server work.`);
  add('Page title',10,title.length>=10&&title.length<=60?10:title?5:0,title?`Title is ${title.length} characters. Aim for 10-60.`:'Add a clear <title> tag.');
  add('Meta description',10,desc.length>=50&&desc.length<=160?10:desc?5:0,desc?`Description is ${desc.length} characters. Aim for 50-160.`:'Add a meta description so search results show a good summary.');
  add('Mobile viewport',10,/<meta[^>]+name=["']viewport/i.test(html)?10:0,'Add <meta name="viewport" content="width=device-width, initial-scale=1">.');
  add('One H1 heading',8,h1===1?8:h1>1?4:0,h1?'Use only one H1 per page.':'Add one clear H1 heading.');
  add('Heading structure (H2)',6,h2>0?6:0,'Add H2 sub-headings to structure the content.');
  add('Image alt text',8,imgs.length===0||noAlt===0?8:noAlt/imgs.length<0.3?5:0,`${noAlt} of ${imgs.length} images have no alt text. Describe each image.`);
  add('Canonical link',4,/rel=["']canonical/i.test(html)?4:0,'Add a canonical link to avoid duplicate-content issues.');
  add('Social preview (Open Graph)',6,/property=["']og:title/i.test(html)&&/property=["']og:image/i.test(html)?6:/property=["']og:/i.test(html)?3:0,'Add og:title, og:description and og:image for nicer link previews.');
  add('Language attribute',4,/<html[^>]+lang=/i.test(html)?4:0,'Add lang="en" (or your language) to the <html> tag.');
  add('Favicon',3,/rel=["'](shortcut )?icon/i.test(html)?3:0,'Add a favicon.');
  add('Page weight',6,kb<150?6:kb<400?3:0,`HTML is ${kb}KB. Minify and lazy-load heavy parts.`);
  const score=C.reduce((a,c)=>a+c.points,0),grade=score>=90?'A':score>=75?'B':score>=60?'C':score>=40?'D':'F';
  try{await env.DB.prepare('INSERT INTO audits(url,score) VALUES(?,?)').bind(u.hostname,score).run()}catch{}
  return J({url:u.href,score,grade,ms,kb,checks:C.sort((a,b)=>(a.ok-b.ok)||b.max-a.max)});
}
