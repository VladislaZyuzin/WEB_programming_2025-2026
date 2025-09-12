// Данные товаров
const products = [
  {id:1, title:'Фитнес-браслет', price:2490, img:'https://shopozz.ru/images/articles/article-1218/p1gusgtend10qqbd0ak6jo71car7.jpg'},
  {id:2, title:'Беспроводные наушники', price:4990, img:'https://avatars.mds.yandex.net/get-mpic/1865974/2a0000018dea751ccc9802bc05a3bf6e314a/orig'},
  {id:3, title:'Портативный аккумулятор', price:1890, img:'https://main-cdn.sbermegamarket.ru/big2/hlr-system/1725198414/100023901588b0.jpg'},
  {id:4, title:'Умная лампочка', price:990, img:'https://avatars.mds.yandex.net/get-mpic/12235261/2a00000193bfe53857d4f46caea92e2c6c73/orig'},
  {id:5, title:'Коврик для мыши', price:450, img:'https://avatars.mds.yandex.net/get-mpic/10933212/2a0000018a322a71f0339fd8161a04d26a57/orig'},
  {id:6, title:'Клавиатура механическая', price:7990, img:'https://avatars.mds.yandex.net/get-mpic/5216590/img_id5364861166910646704.jpeg/orig'}
];

// Инициализация 
const catalogEl = document.getElementById('catalog');
const cartCountEl = document.getElementById('cart-count');
const openCartBtn = document.getElementById('open-cart');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart');
const cartListEl = document.getElementById('cart-list');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout');
const orderSection = document.getElementById('order-section');
const orderForm = document.getElementById('order-form');
const orderToast = document.getElementById('order-toast');
const clearCartBtn = document.getElementById('clear-cart');
const cancelOrderBtn = document.getElementById('cancel-order');

// Рендер карточек
function renderCatalog(){
  catalogEl.innerHTML = '';
  for(const p of products){
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <h3>${p.title}</h3>
      <p class="price-row"><span class="price">${p.price} ₽</span><button class="btn add-to-cart" data-id="${p.id}">Добавить в корзину</button></p>
    `;
    catalogEl.appendChild(card);
  }
}

// Корзина
const CART_KEY = 'lab_cart_v1';
function loadCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }catch(e){return {}}; }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCount(); }

function addToCart(productId, qty=1){
  const cart = loadCart();
  const id = String(productId);
  if(cart[id]) cart[id].qty += qty;
  else {
    const p = products.find(x=>x.id===productId);
    cart[id] = {id:p.id, title:p.title, price:p.price, img:p.img, qty:qty};
  }
  saveCart(cart);
}
function removeFromCart(productId){
  const cart = loadCart(); delete cart[String(productId)]; saveCart(cart);
}
function setQty(productId, qty){
  const cart = loadCart(); const id = String(productId);
  if(cart[id]){
    cart[id].qty = Math.max(0, Math.floor(qty));
    if(cart[id].qty === 0) delete cart[id];
    saveCart(cart);
  }
}
function getCartSummary(){
  const cart = loadCart(); let total=0, count=0;
  for(const key of Object.keys(cart)){
    total += cart[key].price * cart[key].qty; count += cart[key].qty;
  }
  return {total, count, items:cart};
}
function updateCartCount(){ const {count} = getCartSummary(); cartCountEl.textContent = count; }

// Рендер корзины
function renderCartModal(){
  const {items, total} = getCartSummary();
  cartListEl.innerHTML = '';
  const keys = Object.keys(items);
  if(keys.length === 0){
    cartListEl.innerHTML = '<div style="color:var(--muted)">Корзина пуста</div>';
  }else{
    for(const k of keys){
      const it = items[k];
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <img src="${it.img}" alt="${it.title}" />
        <div class="meta">
          <div style="font-weight:600">${it.title}</div>
          <div style="color:var(--muted); font-size:0.95rem">${it.price} ₽ × <input class="qty" type="number" min="0" value="${it.qty}" data-id="${it.id}"> = <strong>${it.price * it.qty} ₽</strong></div>
        </div>
        <div class="cart-actions">
          <button class="btn remove-item" data-id="${it.id}">Удалить</button>
        </div>
      `;
      cartListEl.appendChild(el);
    }
  }
  cartTotalEl.textContent = total + ' ₽';
  updateCartCount();
}

// События
document.addEventListener('click', (e)=>{
  if(e.target.matches('.add-to-cart')){ addToCart(Number(e.target.dataset.id),1); renderCartModal(); }
  if(e.target === openCartBtn){ cartModal.style.display='flex'; cartModal.setAttribute('aria-hidden','false'); renderCartModal(); }
  if(e.target === closeCartBtn){ cartModal.style.display='none'; cartModal.setAttribute('aria-hidden','true'); orderSection.style.display='none'; orderToast.style.display='none'; }
  if(e.target.matches('.remove-item')){ removeFromCart(Number(e.target.dataset.id)); renderCartModal(); }
  if(e.target === clearCartBtn){ localStorage.removeItem(CART_KEY); renderCartModal(); }
  if(e.target === checkoutBtn){ orderSection.style.display='block'; orderSection.scrollIntoView({behavior:'smooth', block:'nearest'}); }
});
cartListEl.addEventListener('input',(e)=>{
  if(e.target.matches('input.qty')){ setQty(Number(e.target.dataset.id), Number(e.target.value)); renderCartModal(); }
});
orderForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  if(!orderForm.checkValidity()){ orderForm.reportValidity(); return; }
  orderToast.style.display='block'; orderToast.textContent='Заказ создан!';
  localStorage.removeItem(CART_KEY); updateCartCount();
  cartListEl.innerHTML='<div style="color:var(--muted)">Спасибо — корзина пуста</div>';
  cartTotalEl.textContent='0 ₽';
});
cancelOrderBtn.addEventListener('click',()=>{ orderSection.style.display='none'; orderToast.style.display='none'; });
cartModal.addEventListener('click',(e)=>{ if(e.target===cartModal){ cartModal.style.display='none'; cartModal.setAttribute('aria-hidden','true'); }});
document.addEventListener('keydown',(e)=>{ if(e.key==='Escape'){ cartModal.style.display='none'; }});

// Рендер страницы
renderCatalog();
updateCartCount();
