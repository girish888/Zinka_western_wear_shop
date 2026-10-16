const products=[
{id:1,name:"Amethyst Slip Dress",type:"Evening",price:499,old:599,tag:"BESTSELLER",desc:"Satin finish · Elegant drape",color:"#3b0a6b",img:"https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=700&q=80"},
{id:2,name:"The City Midi",type:"Casual",price:399,old:499,tag:"NEW ARRIVAL",desc:"Easy fit · Everyday statement",color:"#d9bd83",img:"https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80"},
{id:3,name:"Midnight Muse Dress",type:"Party",price:599,old:599,tag:"LIMITED EDITION",desc:"Sculpted silhouette · After-dark",color:"#111111",img:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80"},
{id:4,name:"Soft Focus Shirt Dress",type:"Casual",price:299,old:399,tag:"EASY FAVOURITE",desc:"Relaxed tailoring · All-day comfort",color:"#d8c5b8",img:"https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=700&q=80"},
{id:5,name:"Electric Night Gown",type:"Evening",price:599,old:599,tag:"EDITOR'S PICK",desc:"Statement look · Fluid movement",color:"#00e5ff",img:"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=80"},
{id:6,name:"Weekend Bloom Dress",type:"Casual",price:349,old:449,tag:"JUST IN",desc:"Modern print · Made for plans",color:"#a68bb7",img:"https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=700&q=80"},
{id:7,name:"Velvet Hour Mini",type:"Party",price:449,old:549,tag:"PARTY FAVOURITE",desc:"Rich texture · Confident fit",color:"#542d39",img:"https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=80"},
{id:8,name:"Golden Hour Wrap",type:"Evening",price:549,old:599,tag:"ONLY AT ZINKA",desc:"Wrap waist · Soft shimmer",color:"#c5a46d",img:"https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=700&q=80"}];

// Store only product IDs and quantities; product details always come from the catalog.
function readStore(key, fallback) {
  try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); }
  catch { return fallback; }
}
function writeStore(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}
const money = n => '₹' + n.toLocaleString('en-IN');
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const storedCart = readStore('zinkaCart', readStore('velouraCart', []));
let cart = [];
if (Array.isArray(storedCart)) for (const item of storedCart) {
  const product = products.find(p => p.id === item?.id);
  if (product && Number.isInteger(item.qty) && item.qty > 0 && !cart.some(p => p.id === product.id))
    cart.push({...product, qty:Math.min(item.qty,99), size:'M'});
}
let activeFilter = 'All';
let wishlist = readStore('zinkaWishlist', []);
if (!Array.isArray(wishlist)) wishlist = [];
wishlist = wishlist.filter(id => products.some(p => p.id === id));
function renderProducts(list = products) {
  document.getElementById('productGrid').innerHTML = list.map(p => `
    <article class="product-card">
      <div class="product-image"><img src="${p.img}" alt="${p.name}" loading="lazy">
        <span class="tag">${p.tag}</span>
        <button class="wish" aria-label="Save ${p.name}" aria-pressed="${wishlist.includes(p.id)}" onclick="toggleWish(${p.id},this)">${wishlist.includes(p.id)?'♥':'♡'}</button>
      </div>
      <div class="product-meta"><h3>${p.name}</h3><span class="price">${money(p.price)}</span></div>
      <p>${p.desc}</p><div class="product-bottom"><div class="swatches" aria-hidden="true"><i style="background:${p.color}"></i><i style="background:#e9ddd2"></i><i style="background:#151316"></i></div>
      <button class="add-btn" onclick="addToCart(${p.id})">Add to bag +</button></div>
    </article>`).join('') || '<p class="empty-results" role="status">No styles found. Try another search or category.</p>';
}
function toggleWish(id, button) {
  wishlist = wishlist.includes(id) ? wishlist.filter(x=>x!==id) : [...wishlist,id];
  const saved = wishlist.includes(id);
  const persisted = writeStore('zinkaWishlist',wishlist);
  button.setAttribute('aria-pressed',String(saved)); button.textContent = saved?'♥':'♡';
  toast((saved?'Saved to your wishlist ♡':'Removed from your wishlist') + (persisted?'':' — this visit only'));
}
function filterProducts(type, el) {
  activeFilter = type;
  document.querySelectorAll('.chip').forEach(c=>{c.classList.toggle('selected',c===el);c.setAttribute('aria-pressed',String(c===el));});
  searchProducts(document.getElementById('searchBox').value);
}
function searchProducts(q) {
  const query=q.trim().toLowerCase();
  renderProducts(products.filter(p=>(activeFilter==='All'||p.type===activeFilter)&&(p.name+' '+p.type+' '+p.desc).toLowerCase().includes(query)));
}
function saveCart() {
  const saved=writeStore('zinkaCart',cart.map(({id,qty})=>({id,qty})));
  document.getElementById('bagCount').textContent=cart.reduce((a,b)=>a+b.qty,0);
  renderCart(); return saved;
}
function addToCart(id) {
  const p=products.find(x=>x.id===id); if(!p)return;
  const item=cart.find(x=>x.id===id);
  if(item && item.qty>=99){toast('Maximum quantity is 99 per style');return;}
  if(item)item.qty++;else cart.push({...p,qty:1,size:'M'});
  const saved=saveCart();toast(p.name+' added to your bag'+(saved?'':' — this visit only'));
}
function changeQty(id,delta) {
  const item=cart.find(x=>x.id===id);if(!item)return;
  item.qty=Math.min(99,item.qty+delta);if(item.qty<1)cart=cart.filter(x=>x.id!==id);saveCart();
}
function removeItem(id){cart=cart.filter(x=>x.id!==id);saveCart();toast('Item removed from your bag');}
function renderCart() {
  const root=document.getElementById('cartContent'),count=cart.reduce((a,b)=>a+b.qty,0);
  document.getElementById('bagSummary').textContent=count+' item'+(count===1?'':'s')+' selected';
  if(!count){root.innerHTML='<div class="empty-cart"><strong>Your bag is taking a little break.</strong>Find something that feels like you.<br><br><a class="btn btn-gold" href="#category">Explore dresses ↗</a></div>';return;}
  const total=cart.reduce((a,b)=>a+b.price*b.qty,0);
  root.innerHTML=cart.map(p=>`<div class="cart-row"><img src="${p.img}" alt="${p.name}"><div><h3>${p.name}</h3><p>${p.type} wear · Demo size M</p><button class="remove" onclick="removeItem(${p.id})" aria-label="Remove ${p.name}">Remove</button></div><div class="qty"><button aria-label="Decrease quantity of ${p.name}" onclick="changeQty(${p.id},-1)">−</button><span>${p.qty}</span><button aria-label="Increase quantity of ${p.name}" onclick="changeQty(${p.id},1)" ${p.qty>=99?'disabled':''}>+</button></div><span class="price">${money(p.price*p.qty)}</span></div>`).join('')+`<div class="cart-total"><div><span class="muted">Demo subtotal · No payment or delivery</span><br><b>${money(total)}</b></div><button class="btn btn-gold" onclick="checkout()">Create demo order ↗</button></div>`;
}
let sessionOrder=null;
function checkout() {
  if(!cart.length){toast('Add a dress to your bag first');return;}
  const order={id:'ZK-'+new Date().getFullYear()+'-'+Date.now().toString().slice(-8),items:cart.map(({id,qty})=>({id,qty})),total:cart.reduce((a,b)=>a+b.price*b.qty,0),date:new Date().toISOString()};
  sessionOrder=order;
  const saved=writeStore('zinkaLastOrder',order);
  cart=[];saveCart();document.getElementById('trackingId').value=order.id;
  document.getElementById('trackingResult').innerHTML=`<div class="package-art">✓<div>ZINKA</div></div><h3>Demo order created.</h3><p>Order ID: <b>${order.id}</b></p><p>No payment was taken. ${saved?'Your demo order is saved in this browser.':'This demo order is available for this visit only.'}</p><button class="btn btn-gold" onclick="trackOrder()">View demo tracking ↗</button>`;
  toast('Demo order created: '+order.id);go('track');
}
function trackOrder() {
  const id=document.getElementById('trackingId').value.trim().toUpperCase();
  const last=sessionOrder||readStore('zinkaLastOrder',readStore('velouraLastOrder',null));
  const root=document.getElementById('trackingResult');
  if(!id){toast('Enter an order ID to track');document.getElementById('trackingId').focus();return;}
  if(id==='ZK-2026-1042'||id==='VL-2026-1042'||(last&&id===last.id)) {
    root.innerHTML=`<div class="eyebrow" style="color:#00e5ff">ORDER ${escapeHTML(id)}</div><h3>Your demo order timeline.</h3><p class="muted">Sample status — no live shipment</p><div class="timeline"><div><b>Order confirmed</b><small>Your demo order has been recorded.</small></div><div class="pending"><b>Preparing your pieces</b><small>Pending · Demo only</small></div><div class="pending"><b>Ready for dispatch</b><small>Pending · Demo only</small></div><div class="pending"><b>Out for delivery</b><small>Pending · Demo only</small></div></div>`;
  } else root.innerHTML='<div class="package-art">?</div><h3>We couldn’t find that order.</h3><p>Try your latest demo order ID or <b>ZK-2026-1042</b>.</p>';
}
function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove('show'),3500);}
function setMenu(open) {
  document.getElementById('mainNav').classList.toggle('open',open);
  const button=document.querySelector('.mobile-menu');button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Close menu':'Open menu');
}
function toggleMenu(){setMenu(!document.getElementById('mainNav').classList.contains('open'));}
function go(id){location.hash=id;}
function openSearch(){setMenu(false);go('category');document.getElementById('searchBox').focus({preventScroll:true});}
function subscribe(e){e.preventDefault();toast('Thanks for your interest in Zinka. This demo does not submit or save your email.');}
function updateNav(){document.querySelectorAll('#mainNav a').forEach(a=>{const active=a.hash===(location.hash||'#home');a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
renderProducts();saveCart();updateNav();
document.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed',String(c.classList.contains('selected'))));
document.querySelectorAll('#mainNav a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('mainNav').classList.contains('open')){setMenu(false);document.querySelector('.mobile-menu').focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('.topbar'))setMenu(false);});
window.addEventListener('hashchange',updateNav);
window.matchMedia('(min-width:721px)').addEventListener('change',e=>{if(e.matches)setMenu(false);});
document.getElementById('trackingId').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();trackOrder();}});
