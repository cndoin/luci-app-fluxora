const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const base=__dirname,out=path.join(base,'test-cache/standalone');
const result=spawnSync(process.env.PYTHON||'python3',[path.join(base,'generate_standalone.py'),out],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
const today=new Date().toISOString().slice(0,10),data={date:today,time:'12:00:00',live:{device:'eth0',timestamp:Date.now()/1000,rx_rate:12345,tx_rate:321},days:[{date:today,rx:1234567890,tx:987654}],hours:[],rates:[]};
const config={language:'en',motion:'soft',refresh_interval:'5',reset_day:'1'};
for(let i=29;i>0;i--){const day=new Date(Date.now()-i*86400000).toISOString().slice(0,10);data.days.unshift({date:day,rx:(1+Math.sin(i)*.4)*1073741824,tx:123456789});}
data.days.sort((a,b)=>a.date.localeCompare(b.date));
for(let i=179;i>=0;i--)data.rates.push({timestamp:data.live.timestamp-i*5,rx:1000000*(1+Math.sin(i/8)*.7),tx:200000*(1+Math.cos(i/5)*.5)});
let active=0,maxActive=0;
const server=http.createServer((req,res)=>{
 if(req.url.startsWith('/cgi-bin/data?')){active++;maxActive=Math.max(maxActive,active);res.setHeader('Content-Type','application/json');const op=req.url.split('?')[1];setTimeout(()=>{res.end(JSON.stringify(op==='config'?config:op==='live'?{date:today,time:'12:00:01',live:data.live,today:data.days.find(d=>d.date===today),current_hour:[],rates:[]}:data));active--;},10);return;}
 const name=req.url==='/'?'index.html':req.url.slice(1);let file=['dashboard.js','dashboard.css'].includes(name)?path.join(out,name):path.join(base,'root/www/wan-traffic',name);
 if(!['index.html','dashboard.js','dashboard.css','standalone.css'].includes(name)){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',name.endsWith('.css')?'text/css':name.endsWith('.js')?'application/javascript':'text/html');res.end(fs.readFileSync(file));
});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');let browser;try{browser=await chromium.launch({headless:true});}catch{browser=await chromium.launch({headless:true,channel:'msedge'});}
 try{const page=await browser.newPage({viewport:{width:1600,height:1150}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url);await page.waitForSelector('.wt-standalone .wt-card strong');await page.waitForFunction(()=>document.querySelector('.wt-card strong').textContent.includes('GiB'));
 assert.equal(await page.locator('.wt-card').count(),4);assert.equal(await page.getByRole('button',{name:'Settings',exact:true}).count(),0);
 await page.getByLabel('Page refresh interval',{exact:true}).selectOption('0');const before=await page.locator('.wt-card').first().innerText();data.days.find(d=>d.date===today).rx+=1073741824;await page.getByRole('button',{name:'Refresh now',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.wt-refresh-button').disabled);assert.notEqual(await page.locator('.wt-card').first().innerText(),before);
 await page.getByRole('button',{name:'Theme',exact:true}).click();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await page.reload();await page.waitForSelector('.wt-standalone');assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 await page.getByRole('button',{name:'Theme',exact:true}).click();await page.getByRole('button',{name:'Fullscreen',exact:true}).click();await page.waitForFunction(()=>!!document.fullscreenElement);await page.evaluate(()=>document.exitFullscreen());
 await page.waitForTimeout(650);await page.screenshot({path:path.join(base,'docs/assets/standalone.png')});
 await page.getByLabel('Language',{exact:true}).selectOption('ja');await page.waitForSelector('.wt-standalone');await page.waitForFunction(()=>document.documentElement.lang==='ja');assert.match(await page.locator('.wt-card').first().innerText(),/本日/);
 await page.setViewportSize({width:390,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.getByLabel('Language',{exact:true}).selectOption('zh-CN');await page.waitForFunction(()=>document.documentElement.lang==='zh-CN');assert.equal(maxActive,1);assert.deepEqual(errors,[]);
 console.log('PASS: real standalone bundle over HTTP, data refresh, theme persistence, language switching, fullscreen, mobile layout and one active request');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
