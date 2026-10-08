import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';
import {readFileSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')))sql.exec(readFileSync('drizzle/'+f,'utf8'));
function prepare(text,args=[]){return {bind(...v){return prepare(text,v)},async first(){return sql.prepare(text).get(...args)||null},async all(){return {results:sql.prepare(text).all(...args)}},async run(){const r=sql.prepare(text).run(...args);return {meta:{changes:Number(r.changes)},results:[]}},text,args}}
const DB={prepare,async batch(stmts){sql.exec('BEGIN');try{const out=stmts.map(v=>{const p=sql.prepare(v.text);if(/^SELECT/i.test(v.text))return {results:p.all(...v.args),meta:{changes:0}};const r=p.run(...v.args);return {results:[],meta:{changes:Number(r.changes)}}});sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}};globalThis.__pizzaTestEnv={DB};
const source=readFileSync('app/api/pizza/route.ts','utf8').replace("import {env} from 'cloudflare:workers';",'const env=globalThis.__pizzaTestEnv;'),js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {GET,POST}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
async function post(body,status=200){const r=await POST(new Request('http://test/api/pizza',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));assert.equal(r.status,status,await r.clone().text());return r.json()}
async function get(q='',status=200){const r=await GET(new Request('http://test/api/pizza'+q));assert.equal(r.status,status,await r.clone().text());return r.json()}
const originalError=console.error;console.error=()=>{};await post({action:'seed'});await post({action:'seed'},409);const menu=await get();assert.equal(menu.products.length,10);const pizza=menu.products.find(p=>p.name==='Pepperoni Classic'),drink=menu.products.find(p=>p.category==='Drinks');
const payload={action:'order',requestKey:crypto.randomUUID(),customer:'Test Customer',email:'test@example.com',phone:'09123456789',address:'100 Demo Street, Barangay Sample',zone:'Makati',notes:'Demo only',items:[{productId:pizza.id,size:'Large',crust:'Stuffed cheese',extras:['Extra cheese','Mushrooms'],quantity:2},{productId:drink.id,size:'',crust:'',extras:[],quantity:1}],totalCents:1};
const v=await post(payload,201);const subtotal=(pizza.price_cents+15000+12000+6000+4000)*2+drink.price_cents;assert.equal(v.order.subtotal_cents,subtotal);assert.equal(v.order.total_cents,subtotal+8900);assert.equal(v.items.length,2);assert.equal(v.events.length,1);
const again=await post(payload);assert.equal(again.order.id,v.order.id);assert.equal(sql.prepare('SELECT count(*) c FROM orders').get().c,1);
await get('?mode=track&reference='+v.order.reference+'&email=wrong@example.com',404);await get('?mode=track&reference='+v.order.reference+'&email=test@example.com');
await post({...payload,requestKey:crypto.randomUUID(),items:[{...payload.items[0],size:'Invalid'}]},400);
await post({...payload,requestKey:crypto.randomUUID(),items:[{...payload.items[0],extras:['Extra cheese','Extra cheese']}]},400);
await post({...payload,requestKey:crypto.randomUUID(),items:[{...payload.items[1],quantity:1}]},400);
await post({...payload,requestKey:crypto.randomUUID(),items:[{...payload.items[0],quantity:11}]},400);
await post({...payload,requestKey:crypto.randomUUID(),zone:'Unknown'},400);
await post({action:'status',id:v.order.id,from:'Placed',status:'Delivered'},400);
await post({action:'payment',id:v.order.id},409);
await post({action:'status',id:v.order.id,from:'Placed',status:'Accepted'});
await post({action:'cancel',reference:v.order.reference,email:'test@example.com'},409);
await post({action:'status',id:v.order.id,from:'Placed',status:'Accepted'},409);
await post({action:'status',id:v.order.id,from:'Accepted',status:'Preparing'});
await post({action:'status',id:v.order.id,from:'Preparing',status:'Out for delivery',rider:''},400);
await post({action:'status',id:v.order.id,from:'Preparing',status:'Out for delivery',rider:'Demo Rider'});
await post({action:'status',id:v.order.id,from:'Out for delivery',status:'Delivered'});
await post({action:'payment',id:v.order.id});await post({action:'payment',id:v.order.id},409);
let result=await get('?mode=detail&id='+v.order.id);assert.equal(result.order.status,'Delivered');assert.equal(result.order.payment_status,'Paid');assert.equal(result.order.rider,'Demo Rider');assert.deepEqual(result.events.map(e=>e.status),['Placed','Accepted','Preparing','Out for delivery','Delivered']);
const other=await post({...payload,requestKey:crypto.randomUUID()},201);await post({action:'cancel',reference:other.order.reference,email:'test@example.com'});await post({action:'cancel',reference:other.order.reference,email:'test@example.com'},409);
assert.equal((await get('?mode=detail&id='+other.order.id)).events.filter(e=>e.status==='Cancelled').length,1);
await post({action:'availability',id:pizza.id,available:0});await post({...payload,requestKey:crypto.randomUUID()},409);
await post({action:'product',id:pizza.id,name:'Updated Pizza',description:'New description',category:'Pizza',priceCents:99900});
result=await get('?mode=detail&id='+v.order.id);assert.equal(result.items[0].name,'Pepperoni Classic');assert.equal(result.items[0].unit_cents,pizza.price_cents+15000+12000+6000+4000);
console.error=originalError;console.log('PASS: menu, server-calculated prices, delivery fees, retry idempotency, lookup, validation, fulfillment transitions, rider assignment, payment, cancellation and historical price snapshots.');
