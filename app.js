/* Dry Cleaners demo logic (no backend). */

const LS_KEYS = {
  theme: 'dc_theme',
  cart: 'dc_cart',
  user: 'dc_user',
  users: 'dc_users',
  orders: 'dc_orders',
  reviews: 'dc_reviews'
};

const services = [
  { id: 'shirt', name: 'Shirt', desc: 'Regular dry cleaning + steam.', basePrice: 149, unit: 'piece', badge: 'Most popular' },
  { id: 'trouser', name: 'Trouser', desc: 'Deep clean with fabric-safe process.', basePrice: 189, unit: 'piece', badge: '' },
  { id: 'saree', name: 'Saree', desc: 'Premium care for delicate fabrics.', basePrice: 499, unit: 'saree', badge: 'Premium' },
  { id: 'kurta', name: 'Kurta', desc: 'Gentle cleaning & crisp finish.', basePrice: 269, unit: 'piece', badge: '' },
  { id: 'jacket', name: 'Jacket', desc: 'Odor removal + thorough cleaning.', basePrice: 749, unit: 'jacket', badge: 'Winter care' },
  { id: 'duvet', name: 'Blanket / Comforter', desc: 'Big size cleaning (demo price).', basePrice: 899, unit: 'set', badge: '' }
];

const slotCharges = [
  { id: 'slot1', label: '08:00 - 10:00 AM', charge: 0 },
  { id: 'slot2', label: '10:00 - 12:00 PM', charge: 30 },
  { id: 'slot3', label: '12:00 - 02:00 PM', charge: 50 },
  { id: 'slot4', label: '02:00 - 04:00 PM', charge: 60 },
  { id: 'slot5', label: '04:00 - 06:00 PM', charge: 75 },
  { id: 'slot6', label: '06:00 - 08:00 PM', charge: 90 }
];

function $(sel) { return document.querySelector(sel); }
function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

function moneyINR(n){
  const v = Number(n || 0);
  return '₹' + v.toLocaleString('en-IN');
}

function loadJSON(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    if(!raw) return fallback;
    return JSON.parse(raw);
  }catch{
    return fallback;
  }
}

function saveJSON(key, val){
  localStorage.setItem(key, JSON.stringify(val));
}

function getTheme(){
  return localStorage.getItem(LS_KEYS.theme) || 'light';
}

function setTheme(theme){
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
  localStorage.setItem(LS_KEYS.theme, theme);
  $('#darkModeBtn').textContent = theme === 'dark' ? '☀️' : '🌙';
}

function getCart(){
  return loadJSON(LS_KEYS.cart, { items: [] });
}

function setCart(cart){
  saveJSON(LS_KEYS.cart, cart);
  renderCartCount();
  renderCartSummary();
}

function findService(id){
  return services.find(s => s.id === id);
}

function renderServiceList(){
  const wrap = $('#serviceList');
  wrap.innerHTML = services.map(s => `
    <div class="item">
      <div class="muted" style="font-weight:900; font-size:12px;">${s.badge ? s.badge : 'Service'}</div>
      <h3>${s.name}</h3>
      <p class="desc">${s.desc}</p>
      <div class="price">
        <div>
          <div class="muted" style="font-weight:900; font-size:12px;">From</div>
          <div style="font-size:18px; font-weight:1000;">${moneyINR(s.basePrice)}</div>
        </div>
        <div class="muted" style="font-weight:900; font-size:12px;">/ ${s.unit}</div>
      </div>
      <div class="actions">
        <button class="btn primary" type="button" data-add="${s.id}">Add to Cart</button>
        <button class="btn" type="button" data-buy="${s.id}">Quick Add</button>
      </div>
    </div>
  `).join('');
}

function renderPriceList(){
  const wrap = $('#priceList');
  wrap.innerHTML = services.map(s => `
    <div class="item">
      <div class="muted" style="font-weight:900; font-size:12px;">${s.badge ? s.badge : 'Pricing'}</div>
      <h3>${s.name}</h3>
      <p class="desc">${s.desc}</p>
      <div class="price">
        <div>
          <div class="muted" style="font-weight:900; font-size:12px;">Base price</div>
          <div style="font-size:18px; font-weight:1000;">${moneyINR(s.basePrice)}</div>
        </div>
        <div class="muted" style="font-weight:900; font-size:12px;">/ ${s.unit}</div>
      </div>
      <div class="actions">
        <button class="btn primary" type="button" data-add="${s.id}">Add (₹)</button>
      </div>
    </div>
  `).join('');
}

function cartCount(){
  const cart = getCart();
  return cart.items.reduce((sum, it) => sum + it.qty, 0);
}

function renderCartCount(){
  $('#cartCount').textContent = cartCount();
}

function cartTotals(){
  const cart = getCart();
  const subtotal = cart.items.reduce((sum, it) => {
    const svc = findService(it.serviceId);
    const price = (svc?.basePrice || 0) * it.qty;
    return sum + price;
  }, 0);

  const slot = loadJSON('dc_selected_slot', null);
  const slotCharge = slot?.charge || 0;

  // simple delivery logic: base delivery if any items
  const delivery = cart.items.length ? 49 + slotCharge : 0;
  const total = subtotal + delivery;
  return { subtotal, delivery, total };
}

function renderCartSummary(){
  const { subtotal, delivery, total } = cartTotals();
  $('#cartItemsSummary').textContent = cartCount();
  $('#cartSubtotalSummary').textContent = moneyINR(subtotal);
  $('#cartDeliverySummary').textContent = moneyINR(delivery);
  $('#cartTotalSummary').textContent = moneyINR(total);

  $('#cartSubtotal').textContent = moneyINR(subtotal);
  $('#cartDelivery').textContent = moneyINR(delivery);
  $('#cartTotal').textContent = moneyINR(total);
}

function openModal(modal){
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
}

function closeModal(modal){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
}

function renderCartItems(){
  const cart = getCart();
  const wrap = $('#cartItems');
  const empty = $('#cartEmpty');
  empty.hidden = cart.items.length !== 0;

  if(!cart.items.length){
    wrap.innerHTML = '';
    return;
  }

  wrap.innerHTML = cart.items.map(it => {
    const svc = findService(it.serviceId);
    const priceEach = svc?.basePrice || 0;
    const line = priceEach * it.qty;
    return `
      <div class="cart-item">
        <div>
          <h4>${svc?.name || it.serviceId}</h4>
          <div class="meta">${moneyINR(priceEach)} each</div>
          <div class="meta">Line: <strong>${moneyINR(line)}</strong></div>
        </div>
        <div>
          <div class="qty-controls">
            <button type="button" data-dec="${it.serviceId}" aria-label="Decrease">−</button>
            <div style="min-width:28px; text-align:center; font-weight:1000">${it.qty}</div>
            <button type="button" data-inc="${it.serviceId}" aria-label="Increase">+</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function upsertCartItem(serviceId, delta){
  const cart = getCart();
  const idx = cart.items.findIndex(x => x.serviceId === serviceId);
  if(idx === -1){
    if(delta <= 0) return;
    cart.items.push({ serviceId, qty: delta });
  }else{
    cart.items[idx].qty += delta;
    if(cart.items[idx].qty <= 0) cart.items.splice(idx,1);
  }
  setCart(cart);
  renderCartItems();
  renderCartSummary();
}

function clearCart(){
  setCart({ items: [] });
  renderCartItems();
}

function genOrderId(){
  return 'DC-' + Math.floor(10000 + Math.random()*89999);
}

function seedOrdersIfEmpty(){
  const orders = loadJSON(LS_KEYS.orders, []);
  if(orders.length) return;
  // demo order
  const demoId = 'DC-12345';
  const now = new Date();
  const mk = (minutesAgo) => new Date(now.getTime() - minutesAgo*60*1000).toLocaleString('hi-IN', { hour:'2-digit', minute:'2-digit' });
  orders.push({
    id: demoId,
    status: 3, // 0..4
    timeline: [
      { at: mk(120), label: 'Request received' },
      { at: mk(90), label: 'Pickup scheduled' },
      { at: mk(45), label: 'In cleaning' },
      { at: null, label: 'Ready for dispatch' },
      { at: null, label: 'Delivered' }
    ],
    createdAt: now.toISOString(),
    paid: true
  });
  saveJSON(LS_KEYS.orders, orders);
}

function renderTimeline(order){
  const steps = [$('#t1'), $('#t2'), $('#t3'), $('#t4'), $('#t5')];
  const base = [0,1,2,3,4];
  for(let i=0;i<5;i++){
    const txt = order.timeline?.[i]?.at || null;
    const node = steps[i];
    node.textContent = txt ? txt : '—';
  }
}

function attachEvents(){
  // add buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    const quick = e.target.closest('[data-buy]');
    if(btn){
      const id = btn.getAttribute('data-add');
      upsertCartItem(id, 1);
      openModal($('#cartModal'));
      return;
    }
    if(quick){
      const id = quick.getAttribute('data-buy');
      upsertCartItem(id, 1);
      openModal($('#cartModal'));
      return;
    }

    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    if(inc){ upsertCartItem(inc.getAttribute('data-inc'), 1); return; }
    if(dec){ upsertCartItem(dec.getAttribute('data-dec'), -1); return; }
  });

  $('#cartBtn').addEventListener('click', () => {
    renderCartItems();
    openModal($('#cartModal'));
  });

  $('#closeCartBtn').addEventListener('click', () => closeModal($('#cartModal')));
  $('#clearCartBtn').addEventListener('click', () => clearCart());

  $('#checkoutBtn').addEventListener('click', () => {
    const cart = getCart();
    if(!cart.items.length){
      alert('Cart empty hai');
      return;
    }
    prepareCheckout();
    closeModal($('#cartModal'));
    openModal($('#checkoutModal'));
  });

  $('#backToCartBtn').addEventListener('click', () => {
    closeModal($('#checkoutModal'));
    openModal($('#cartModal'));
  });

  $('#closeCheckoutBtn').addEventListener('click', () => closeModal($('#checkoutModal')));

  // booking form
  $('#pickupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const pickupTime = form.get('pickupTime');
    const selected = slotCharges.find(s => s.label === pickupTime || s.id === pickupTime);
    const slotObj = {
      id: selected?.id || 'slot1',
      label: selected?.label || pickupTime,
      charge: selected?.charge || 0
    };
    saveJSON('dc_selected_slot', slotObj);

    $('#pickupHint').textContent = 'Booking details saved. Checkout ke liye cart open karein / Pay karein.';

    // ensure slot locked in summary
    renderCartSummary();
  });

  // slot selection
  const slotGrid = $('#slotGrid');
  slotGrid.innerHTML = slotCharges.map(s => `
    <button type="button" class="slot" data-slot="${s.id}" aria-label="Select ${s.label}">
      <div>
        <strong>${s.label}</strong>
        <span>${s.charge ? 'Extra ' + moneyINR(s.charge) : 'No extra charge'}</span>
      </div>
      <div style="font-weight:1000">›</div>
    </button>
  `).join('');

  slotGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-slot]');
    if(!btn) return;
    const id = btn.getAttribute('data-slot');
    const slot = slotCharges.find(s => s.id === id);

    slotGrid.querySelectorAll('.slot').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');

    saveJSON('dc_selected_slot', slot);

    $('#selectedSlotText').textContent = slot.label;
    $('#selectedSlotCharge').textContent = moneyINR(slot.charge);

    // also sync select in form
    const sel = $('#pickupForm').querySelector('select[name="pickupTime"]');
    sel.value = slot.label;

    renderCartSummary();
  });

  $('#openCheckoutBtn').addEventListener('click', () => {
    renderCartItems();
    openModal($('#cartModal'));
  });

  // tracking
  $('#trackForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = new FormData(e.target).get('orderId');
    const orders = loadJSON(LS_KEYS.orders, []);
    const order = orders.find(o => o.id === id);
    if(!order){
      $('#trackHint').textContent = 'Order ID nahi mila. Demo ID use karke dekhein.';
      renderTimeline({ timeline: [] });
      return;
    }
    $('#trackHint').textContent = 'Status loaded for ' + id;
    renderTimeline(order);
  });

  $('#trackDemoBtn').addEventListener('click', () => {
    $('#trackForm').querySelector('input[name="orderId"]').value = 'DC-12345';
    $('#trackForm').dispatchEvent(new Event('submit', { bubbles:true, cancelable:true }));
  });

  // auth
  $('#registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get('name');
    const phone = fd.get('phone');
    const email = fd.get('email');
    const password = fd.get('password');

    const users = loadJSON(LS_KEYS.users, []);
    if(users.some(u => u.email === email || u.phone === phone)){
      $('#registerHint').textContent = 'Email/Phone already exists.';
      return;
    }

    users.push({ name, phone, email, password });
    saveJSON(LS_KEYS.users, users);
    $('#registerHint').textContent = 'Account created. Now login.';
    e.target.reset();
  });

  $('#loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const identifier = fd.get('identifier');
    const password = fd.get('password');

    const users = loadJSON(LS_KEYS.users, []);
    const user = users.find(u => (u.email === identifier || u.phone === identifier) && u.password === password);
    if(!user){
      $('#loginHint').textContent = 'Invalid credentials.';
      return;
    }
    saveJSON(LS_KEYS.user, { ...user, loggedInAt: new Date().toISOString() });
    showUser();
    $('#loginHint').textContent = 'Login successful.';
  });

  $('#logoutBtn').addEventListener('click', () => {
    localStorage.removeItem(LS_KEYS.user);
    showUser(true);
  });

  // theme
  $('#darkModeBtn').addEventListener('click', () => {
    const cur = getTheme();
    setTheme(cur === 'dark' ? 'light' : 'dark');
  });

  // close modal on backdrop
  [$('#cartModal'), $('#checkoutModal')].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if(e.target === modal) closeModal(modal);
    });
  });

  // quick booking
  $('#quickBooking').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const service = fd.get('service');
    const qty = Number(fd.get('qty') || 1);

    for(let i=0;i<qty;i++) upsertCartItem(service, 1);

    const hint = $('#quickBookingHint');
    hint.textContent = 'Added to cart. अब Pickup Booking से time slot चुनें और checkout करें।';
    location.hash = '#booking';
  });

  // payment
  $('#payNowBtn').addEventListener('click', () => {
    const paymentHint = $('#paymentHint');
    const orderId = $('#payOrderId').value;
    const totals = cartTotals();
    const method = document.querySelector('input[name="payMethod"]:checked')?.value || 'upi';

    if(!orderId){ paymentHint.textContent = 'Order ID missing'; return; }
    const cart = getCart();
    if(!cart.items.length){ paymentHint.textContent = 'Cart empty'; return; }

    const orders = loadJSON(LS_KEYS.orders, []);
    const newOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      paid: true,
      paidMethod: method,
      subtotal: totals.subtotal,
      delivery: totals.delivery,
      total: totals.total,
      items: cart.items,
      timeline: [
        { at: new Date(Date.now()-20*60*1000).toLocaleString('hi-IN',{hour:'2-digit', minute:'2-digit'}), label:'Request received' },
        { at: new Date(Date.now()-10*60*1000).toLocaleString('hi-IN',{hour:'2-digit', minute:'2-digit'}), label:'Pickup scheduled' },
        { at: new Date().toLocaleString('hi-IN',{hour:'2-digit', minute:'2-digit'}), label:'In cleaning' },
        { at: null, label:'Ready for dispatch' },
        { at: null, label:'Delivered' }
      ],
      status: 2
    };

    const idx = orders.findIndex(o => o.id === orderId);
    if(idx !== -1) orders[idx] = newOrder; else orders.push(newOrder);
    saveJSON(LS_KEYS.orders, orders);

    paymentHint.textContent = 'Payment successful (demo). Order created. Tracking page check करें।';

    // keep cart but it’s demo; clear it for UX
    clearCart();
    closeModal($('#checkoutModal'));
    $('#trackForm').querySelector('input[name="orderId"]').value = orderId;
    location.hash = '#tracking';
  });
}

function prepareCheckout(){
  const totals = cartTotals();
  const orderId = genOrderId();
  const selectedSlot = loadJSON('dc_selected_slot', null);

  $('#payAmount').value = moneyINR(totals.total);
  $('#payOrderId').value = orderId;

  // payment hint contextual
  const paymentHint = $('#paymentHint');
  paymentHint.textContent = `Checkout ready. Slot: ${selectedSlot?.label || 'Not selected'}. Amount: ${moneyINR(totals.total)}.`;
}

function showUser(logout=false){
  const userCard = $('#userCard');
  const user = loadJSON(LS_KEYS.user, null);
  if(!user || logout){
    userCard.hidden = true;
    $('#nav-auth').textContent = 'Login';
    return;
  }
  $('#userName').textContent = user.name;
  userCard.hidden = false;
  $('#nav-auth').textContent = 'Hi ' + (user.name.split(' ')[0] || user.name);
}

function initSlotsAndSelect(){
  const sel = $('#pickupForm').querySelector('select[name="pickupTime"]');
  sel.innerHTML = slotCharges.map(s => `<option value="${s.label}">${s.label} ${s.charge ? '(+ ' + moneyINR(s.charge) + ')' : ''}</option>`).join('');

  const selected = loadJSON('dc_selected_slot', null);
  if(selected?.label){
    $('#selectedSlotText').textContent = selected.label;
    $('#selectedSlotCharge').textContent = moneyINR(selected.charge);

    // activate matching slot
    const btn = $('#slotGrid').querySelector(`[data-slot="${selected.id}"]`);
    if(btn){
      $('#slotGrid').querySelectorAll('.slot').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
    }
    sel.value = selected.label;
  }else{
    $('#selectedSlotText').textContent = '—';
    $('#selectedSlotCharge').textContent = '₹0';
    sel.value = '';
  }
}

function initYear(){ $('#year').textContent = new Date().getFullYear(); }

function renderReviews(){
  const form = $('#reviewForm');
  const list = $('#reviewsList');
  const empty = $('#reviewsEmpty');
  const hint = $('#reviewHint');
  if(!form || !list) return;

  const loadReviews = () => loadJSON(LS_KEYS.reviews, []);
  const saveReviews = (arr) => saveJSON(LS_KEYS.reviews, arr);

  const starsText = (rating) => {
    const r = Math.max(1, Math.min(5, Number(rating || 0)));
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  };

  function render(){
    const reviews = loadReviews();
    list.innerHTML = reviews.map(r => `
      <div class="review-card">
        <div class="review-top">
          <div>
            <div class="review-name">${r.name}</div>
            <div class="review-date">${r.createdAt || ''}</div>
          </div>
          <div class="review-rating" aria-label="Rating">${starsText(r.rating)} (${r.rating}/5)</div>
        </div>
        <div class="review-comment">${r.comment}</div>
      </div>
    `).join('');

    empty.hidden = reviews.length !== 0;
  }

  render();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = (fd.get('name') || '').toString().trim();
    const rating = Number(fd.get('rating') || 5);
    const comment = (fd.get('comment') || '').toString().trim();

    if(!name || !comment){
      hint.textContent = 'Name और comment required hai.';
      return;
    }

    const reviews = loadReviews();
    reviews.unshift({
      name,
      rating: Math.max(1, Math.min(5, rating)),
      comment,
      createdAt: new Date().toLocaleString('hi-IN', { dateStyle: 'medium', timeStyle: 'short' })
    });
    saveReviews(reviews.slice(0, 50));
    e.target.reset();
    hint.textContent = 'Review submitted. Thank you!';
    render();
  });

  const clearBtn = $('#clearReviewsBtn');
  if(clearBtn){
    clearBtn.addEventListener('click', () => {
      saveReviews([]);
      hint.textContent = 'All reviews cleared.';
      render();
    });
  }
}

function init(){
  renderReviews();
  // theme
  setTheme(getTheme());

  // seed UI
  renderServiceList();
  renderPriceList();

  // slots & select
  initSlotsAndSelect();

  // initial cart
  renderCartCount();
  renderCartItems();
  renderCartSummary();

  // timeline demo data
  seedOrdersIfEmpty();

  // user
  showUser();

  // events
  attachEvents();

  // year
  initYear();
}

init();

