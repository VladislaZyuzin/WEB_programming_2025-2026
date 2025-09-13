# Лабораторная работа №1 
> Выполнил Зюзин Владислав К3320
## Что было сделано в проекте
**Создана структура интернет-магазина:**
1. Каталог товаров с карточками.
2. Корзина с подсчётом стоимости и количества товаров.
3. Хранение содержимого корзины в localStorage.
4. Возможность изменять количество товара.
5. Удаление товаров из корзины и полная очистка.
6. Подсчёт общей суммы заказа.
7. Форма оформления заказа (с валидацией).
8. Сообщение об успешном создании заказа.

**Сделан модальное окно для корзины с оформлением заказа:**
1. Открытие/закрытие по клику и клавише Escape.
2. Закрытие по клику вне окна.

**Добавлен адаптивный дизайн:**
1. При ширине экрана < 980px каталог перестраивается в 2 колонки.
2. При ширине < 640px — в 1 колонку.

### HTML — структура страницы

**Основной каркас страницы:**
```html
<header>
  <div class="container topbar">
    <h1>Товары для настоящих гиков</h1>
    <nav>
      <button id="open-cart" class="btn">Корзина (<span id="cart-count">0</span>)</button>
      <button id="clear-cart" class="btn secondary">Очистить</button>
    </nav>
  </div>
</header>

```
* header — верхняя панель сайта.
* Кнопка Корзина (#open-cart) открывает модальное окно.
* Кнопка Очистить (#clear-cart) очищает корзину.

**Каталог товаров**
```html
<main class="container">
  <section aria-labelledby="catalog-heading">
    <h2 id="catalog-heading">Каталог</h2>
    <div class="catalog" id="catalog">
      <!-- Карточки будут добавлены через JS -->
    </div>
  </section>
</main>
```
* Контейнер с id="catalog" остаётся пустым — товары рендерятся динамически через JS.

**Модальное окно корзины**
```html
<div id="cart-modal" class="modal-backdrop" role="dialog" aria-modal="true" aria-hidden="true">
  <div class="modal" role="document">
    <header>
      <h3>Ваша корзина</h3>
      <button id="close-cart" class="btn secondary">Закрыть</button>
    </header>

    <div class="cart-list" id="cart-list"></div>

    <div class="total-row">
      <div>Итого: <strong id="cart-total">0 ₽</strong></div>
      <button id="checkout" class="btn">Оформить заказ</button>
    </div>
    
    <!-- Форма заказа -->
    <section id="order-section" style="display:none">
      <form id="order-form" class="order-form" novalidate>
        <div class="form-row">
          <input type="text" id="firstName" name="firstName" placeholder="Имя" required />
          <input type="text" id="lastName" name="lastName" placeholder="Фамилия" required />
        </div>
        <input type="text" id="address" name="address" placeholder="Адрес доставки" required />
        <input type="tel" id="phone" name="phone" placeholder="Телефон" required pattern="[0-9+\-() ]{6,}" />
        <button type="submit" class="btn">Создать заказ</button>
      </form>
    </section>
  </div>
</div>
```
* Содержит список товаров (#cart-list), итоговую сумму (#cart-total) и форму оформления заказа.
* Форма скрыта, пока пользователь не нажмёт Оформить заказ.

### CSS — оформление

**Используются CSS-переменные:**

```css
:root {
  --bg:#f6f7fb; --card:#fff; --accent:#4f46e5;
  --muted:#6b7280; --danger:#ef4444;
  --max-width:1100px;
}
```

* --accent — основной фиолетовый цвет.
* --bg — фон страницы.
* --card — фон карточек.

**Каталог**
```css
.catalog {
  display:grid;
  grid-template-columns:repeat(3, 1fr);
  gap:18px;
}
.card {
  background:var(--card);
  border-radius:12px;
  padding:12px;
  box-shadow:0 2px 8px rgba(16,24,40,0.04);
  display:flex;
  flex-direction:column;
}
```
* Используется grid-сетка для карточек.
* Карточки выравниваются и имеют тень.

**Модальное окно**
```css
.modal-backdrop {
  position:fixed; inset:0;
  background:rgba(0,0,0,0.4);
  display:none;
  align-items:center;
  justify-content:center;
}
.modal {
  background:var(--card);
  width:min(760px,95%);
  border-radius:12px;
  padding:16px;
}
```      
* modal-backdrop затемняет фон.
* modal центрируется и ограничивается по ширине.

**Адаптивность**
```css
@media (max-width:980px) {
  .catalog { grid-template-columns:repeat(2,1fr); }
}
@media (max-width:640px) {
  .catalog { grid-template-columns:1fr; }
  .topbar { flex-direction:column; }
}
```
* На планшетах — 2 карточки в ряд.
* На телефонах — одна карточка в ряд.

### JavaScript — логика магазина
**Данные товаров**
```js
const products = [
  {id:1, title:'Фитнес-браслет', price:2490, img:'...'},
  {id:2, title:'Беспроводные наушники', price:4990, img:'...'},
  ...
];
```
* Массив с товарами: id, название, цена, картинка.

**Рендер каталога**
```js
function renderCatalog(){
  catalogEl.innerHTML = '';
  for(const p of products){
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <h3>${p.title}</h3>
      <p class="price-row">
        <span class="price">${p.price} ₽</span>
        <button class="btn add-to-cart" data-id="${p.id}">Добавить</button>
      </p>`;
    catalogEl.appendChild(card);
  }
}
```
* Создаются карточки товаров.
* У каждой кнопки есть data-id, чтобы добавлять в корзину.

**Работа с корзиной через localStorage**
```js
const CART_KEY = 'lab_cart_v1';

function loadCart(){
  return JSON.parse(localStorage.getItem(CART_KEY)) || {};
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
```
* Корзина хранится в браузере, даже после перезагрузки страницы.

**Добавление товара**
```js
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
```
* Если товар уже есть — увеличиваем количество.
* Если нет — создаём новую запись.

**Рендер корзины**
```js
function renderCartModal(){
  const {items, total} = getCartSummary();
  cartListEl.innerHTML = '';
  for(const k in items){
    const it = items[k];
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img src="${it.img}">
      <div class="meta">${it.title} - ${it.price} ₽ × 
        <input class="qty" type="number" value="${it.qty}" data-id="${it.id}">
      </div>
      <button class="btn remove-item" data-id="${it.id}">Удалить</button>`;
    cartListEl.appendChild(el);
  }
  cartTotalEl.textContent = total + ' ₽';
}
```
* Показываются товары в корзине.
* Есть инпут для изменения количества.
* Кнопка "Удалить" убирает товар.

**Оформление заказа**
```js
orderForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  if(!orderForm.checkValidity()){ orderForm.reportValidity(); return; }
  orderToast.style.display='block';
  orderToast.textContent='Заказ создан!';
  localStorage.removeItem(CART_KEY);
  cartListEl.innerHTML='Спасибо — корзина пуста';
  cartTotalEl.textContent='0 ₽';
});
```
* Проверка валидации (required, pattern).
* После успешного заказа корзина очищается.

## Итог
1. В результате получился демо-интернет-магазин, который:
2. Работает без сервера (всё хранится в localStorage).
3. Имеет корзину и оформление заказа.
4. Поддерживает адаптивность.
