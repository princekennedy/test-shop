const api = axios.create({
    baseURL: '/api/v1',
});

const state = {
    token: localStorage.getItem('shop_token') || '',
    user: JSON.parse(localStorage.getItem('shop_user') || 'null'),
    businesses: [],
    selectedBusinessId: '',
    products: [],
    cart: [],
    clientBusinesses: [],
    clientProducts: [],
    notifications: [],
    orders: [],
    adminUsers: [],
    adminBusinesses: [],
};

const els = {
    sessionBadge: document.getElementById('sessionBadge'),
    logoutButton: document.getElementById('logoutButton'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    searchForm: document.getElementById('searchForm'),
    businessList: document.getElementById('businessList'),
    productsTitle: document.getElementById('productsTitle'),
    selectedBusinessMeta: document.getElementById('selectedBusinessMeta'),
    productsList: document.getElementById('productsList'),
    cartItems: document.getElementById('cartItems'),
    cartCount: document.getElementById('cartCount'),
    cartTotal: document.getElementById('cartTotal'),
    placeOrderButton: document.getElementById('placeOrderButton'),
    clearCartButton: document.getElementById('clearCartButton'),
    ordersList: document.getElementById('ordersList'),
    notificationList: document.getElementById('notificationList'),
    toastContainer: document.getElementById('toastContainer'),
    clientSection: document.getElementById('clientSection'),
    adminSection: document.getElementById('adminSection'),
    businessForm: document.getElementById('businessForm'),
    deleteBusinessButton: document.getElementById('deleteBusinessButton'),
    imageForm: document.getElementById('imageForm'),
    imageList: document.getElementById('imageList'),
    productForm: document.getElementById('productForm'),
    resetProductButton: document.getElementById('resetProductButton'),
    clientProductsList: document.getElementById('clientProductsList'),
    refreshClientButton: document.getElementById('refreshClientButton'),
    adminCustomerForm: document.getElementById('adminCustomerForm'),
    adminUsersList: document.getElementById('adminUsersList'),
    adminBusinessesList: document.getElementById('adminBusinessesList'),
    refreshAdminButton: document.getElementById('refreshAdminButton'),
};

function authHeaders() {
    return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

function saveSession(token, user) {
    state.token = token;
    state.user = user;
    localStorage.setItem('shop_token', token);
    localStorage.setItem('shop_user', JSON.stringify(user));
}

function clearSession() {
    state.token = '';
    state.user = null;
    localStorage.removeItem('shop_token');
    localStorage.removeItem('shop_user');
}

function currency(value) {
    return `MWK ${Number(value).toFixed(2)}`;
}

function showToast(message, variant = 'dark') {
    const wrapper = document.createElement('div');
    wrapper.className = `toast align-items-center text-bg-${variant} border-0`;
    wrapper.role = 'alert';
    wrapper.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
    els.toastContainer.appendChild(wrapper);
    const toast = new bootstrap.Toast(wrapper, { delay: 3000 });
    toast.show();
    wrapper.addEventListener('hidden.bs.toast', () => wrapper.remove());
}

function getErrorMessage(error) {
    return error ? .response ? .data ? .message || error.message || 'Request failed';
}

async function request(config) {
    try {
        const response = await api({
            ...config,
            headers: {
                ...authHeaders(),
                ...(config.headers || {}),
            },
        });
        return response.data;
    } catch (error) {
        const message = getErrorMessage(error);
        showToast(message, 'danger');
        throw error;
    }
}

function renderEmpty(container, message) {
    container.innerHTML = `<div class="empty-state">${message}</div>`;
}

function renderSession() {
    const role = state.user ? .role || 'guest';
    const label = state.user ? `${state.user.username} (${role})` : 'Guest';
    els.sessionBadge.textContent = label;
    els.logoutButton.classList.toggle('d-none', !state.user);
    els.clientSection.classList.toggle('d-none', role !== 'client');
    els.adminSection.classList.toggle('d-none', role !== 'admin');
}

function renderBusinesses() {
    if (!state.businesses.length) {
        renderEmpty(els.businessList, 'No businesses match the current filters.');
        return;
    }

    els.businessList.innerHTML = state.businesses
        .map(
            (business) => `
        <div class="col-md-6 col-xl-4">
          <div class="business-card p-3 h-100">
            <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div>
                <h3 class="h5 mb-1">${business.name}</h3>
                <div class="text-secondary small">${business.category} • ${business.location}</div>
              </div>
              <span class="badge text-bg-warning">${business.imageUrls.length} images</span>
            </div>
            <p class="text-secondary small">${business.description}</p>
            <div class="d-flex justify-content-between align-items-center mt-3">
              <span class="small">${business.contact}</span>
              <button class="btn btn-sm btn-dark" data-action="open-business" data-id="${business.id}">View stock</button>
            </div>
          </div>
        </div>
      `,
        )
        .join('');
}

function selectedBusiness() {
    return state.businesses.find((business) => business.id === state.selectedBusinessId) ||
        state.clientBusinesses.find((business) => business.id === state.selectedBusinessId);
}

function renderProducts() {
    const business = selectedBusiness();
    els.productsTitle.textContent = business ? `${business.name} stock` : 'Products and services';
    els.selectedBusinessMeta.textContent = business ?
        `${business.category} • ${business.location}` :
        'Choose a business to view products';

    if (!state.products.length) {
        renderEmpty(els.productsList, 'No products available for the selected business.');
        return;
    }

    els.productsList.innerHTML = state.products
        .map(
            (product) => `
        <div class="col-md-6">
          <div class="product-card p-3">
            <div class="d-flex justify-content-between align-items-start gap-3 mb-2">
              <div>
                <h3 class="h5 mb-1">${product.name}</h3>
                <div class="text-secondary small">${currency(product.price)}</div>
              </div>
              <span class="badge text-bg-light">${product.stock} in stock</span>
            </div>
            <p class="small text-secondary mb-3">${product.description || 'No description provided.'}</p>
            <div class="d-flex justify-content-between align-items-center gap-2">
              <input class="form-control form-control-sm w-25" type="number" min="1" value="1" data-quantity-input="${product.id}" />
              <button class="btn btn-sm btn-dark" data-action="add-cart" data-id="${product.id}">Add to cart</button>
            </div>
          </div>
        </div>
      `,
        )
        .join('');
}

function renderCart() {
    els.cartCount.textContent = `${state.cart.length} items`;
    if (!state.cart.length) {
        renderEmpty(els.cartItems, 'Your cart is empty.');
        els.cartTotal.textContent = currency(0);
        return;
    }

    const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    els.cartTotal.textContent = currency(total);
    els.cartItems.innerHTML = state.cart
        .map(
            (item) => `
        <div class="stack-card d-flex justify-content-between align-items-start gap-3">
          <div>
            <div class="fw-semibold">${item.name}</div>
            <div class="small text-secondary">${item.quantity} × ${currency(item.price)}</div>
          </div>
          <button class="btn btn-sm btn-outline-danger" data-action="remove-cart" data-id="${item.productId}">Remove</button>
        </div>
      `,
        )
        .join('');
}

function renderOrders() {
    if (!state.orders.length) {
        renderEmpty(els.ordersList, 'No orders yet for the current session.');
        return;
    }

    els.ordersList.innerHTML = state.orders
        .map(
            (order) => `
        <div class="stack-card">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <strong>Order ${order.id.slice(0, 8)}</strong>
            <span class="badge text-bg-dark">${currency(order.total)}</span>
          </div>
          <div class="small text-secondary">${new Date(order.createdAt).toLocaleString()}</div>
          <div class="small mt-2">${order.items.length} item(s)</div>
        </div>
      `,
        )
        .join('');
}

function notificationBasePath() {
    if (!state.user) {
        return '';
    }
    if (state.user.role === 'client') {
        return 'client';
    }
    if (state.user.role === 'customer') {
        return 'customer';
    }
    if (state.user.role === 'admin') {
        return 'admin';
    }
    return '';
}

function renderNotifications() {
    if (!state.user) {
        renderEmpty(els.notificationList, 'Login to view notifications.');
        return;
    }

    if (!state.notifications.length) {
        renderEmpty(els.notificationList, 'No notifications available.');
        return;
    }

    els.notificationList.innerHTML = state.notifications
        .map(
            (notification) => `
        <div class="stack-card ${notification.read ? '' : 'border-dark'}">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
            <span class="badge ${notification.read ? 'text-bg-light' : 'text-bg-dark'}">${notification.read ? 'Read' : 'New'}</span>
            ${notification.read ? '' : `<button class="btn btn-sm btn-outline-dark" data-action="read-notification" data-id="${notification.id}">Mark read</button>`}
          </div>
          <div>${notification.message}</div>
          <div class="small text-secondary mt-2">${new Date(notification.createdAt).toLocaleString()}</div>
        </div>
      `,
    )
    .join('');
}

function renderClientSection() {
  if (!state.clientBusinesses.length) {
    els.businessForm.reset();
    els.businessForm.businessId.value = '';
    renderEmpty(els.imageList, 'Create a business profile to manage images.');
    renderEmpty(els.clientProductsList, 'Create a business and add stock items.');
    return;
  }

  const business = state.clientBusinesses[0];
  els.businessForm.businessId.value = business.id;
  els.businessForm.name.value = business.name;
  els.businessForm.description.value = business.description;
  els.businessForm.category.value = business.category;
  els.businessForm.location.value = business.location;
  els.businessForm.contact.value = business.contact;

  els.imageList.innerHTML = business.imageUrls.length
    ? business.imageUrls
        .map(
          (url) => `
            <div class="image-pill">
              <a href="${url}" target="_blank" rel="noreferrer">Preview</a>
              <button class="btn btn-sm btn-link text-danger p-0" data-action="delete-image" data-id="${url}">Remove</button>
            </div>
          `,
        )
        .join('')
    : '<div class="empty-state">No images added yet.</div>';

  if (!state.clientProducts.length) {
    renderEmpty(els.clientProductsList, 'No stock items yet.');
    return;
  }

  els.clientProductsList.innerHTML = state.clientProducts
    .map(
      (product) => `
        <div class="stack-card">
          <div class="d-flex justify-content-between align-items-start gap-3">
            <div>
              <div class="fw-semibold">${product.name}</div>
              <div class="small text-secondary">${currency(product.price)} • ${product.stock} in stock</div>
              <div class="small mt-2">${product.description || 'No description provided.'}</div>
            </div>
            <div class="d-grid gap-2">
              <button class="btn btn-sm btn-outline-dark" data-action="edit-product" data-id="${product.id}">Edit</button>
              <button class="btn btn-sm btn-outline-danger" data-action="delete-product" data-id="${product.id}">Delete</button>
            </div>
          </div>
        </div>
      `,
    )
    .join('');
}

function renderAdminSection() {
  if (!state.adminUsers.length) {
    renderEmpty(els.adminUsersList, 'No users available.');
  } else {
    els.adminUsersList.innerHTML = state.adminUsers
      .map(
        (user) => `
          <div class="stack-card">
            <div class="fw-semibold">${user.username}</div>
            <div class="small text-secondary">${user.email}</div>
            <span class="badge text-bg-light mt-2">${user.role}</span>
          </div>
        `,
      )
      .join('');
  }

  if (!state.adminBusinesses.length) {
    renderEmpty(els.adminBusinessesList, 'No businesses available.');
  } else {
    els.adminBusinessesList.innerHTML = state.adminBusinesses
      .map(
        (business) => `
          <div class="stack-card">
            <div class="d-flex justify-content-between align-items-start gap-3">
              <div>
                <div class="fw-semibold">${business.name}</div>
                <div class="small text-secondary">${business.category} • ${business.location}</div>
              </div>
              <button class="btn btn-sm btn-outline-danger" data-action="admin-delete-business" data-id="${business.id}">Remove</button>
            </div>
          </div>
        `,
      )
      .join('');
  }
}

async function loadBusinesses(params = {}) {
  state.businesses = await request({ method: 'get', url: '/businesses', params });
  renderBusinesses();
}

async function loadProducts(businessId) {
  state.selectedBusinessId = businessId;
  state.products = await request({ method: 'get', url: `/businesses/${businessId}/products` });
  renderProducts();
}

async function loadOrders() {
  if (!state.user) {
    state.orders = [];
    renderOrders();
    return;
  }

  if (!['customer', 'client', 'admin'].includes(state.user.role)) {
    return;
  }

  state.orders = await request({ method: 'get', url: '/orders' });
  renderOrders();
}

async function loadNotifications() {
  if (!state.user) {
    state.notifications = [];
    renderNotifications();
    return;
  }

  const basePath = notificationBasePath();
  state.notifications = await request({ method: 'get', url: `/${basePath}/notification` });
  renderNotifications();
}

async function loadClientData() {
  if (state.user?.role !== 'client') {
    state.clientBusinesses = [];
    state.clientProducts = [];
    renderClientSection();
    return;
  }

  state.clientBusinesses = await request({ method: 'get', url: '/client/business' });
  const business = state.clientBusinesses[0];
  state.clientProducts = business
    ? await request({ method: 'get', url: `/businesses/${business.id}/products` })
    : [];
  renderClientSection();
}

async function loadAdminData() {
  if (state.user?.role !== 'admin') {
    state.adminUsers = [];
    state.adminBusinesses = [];
    renderAdminSection();
    return;
  }

  const [users, businesses] = await Promise.all([
    request({ method: 'get', url: '/admin/users' }),
    request({ method: 'get', url: '/admin/business' }),
  ]);
  state.adminUsers = users;
  state.adminBusinesses = businesses;
  renderAdminSection();
}

async function refreshAuthenticatedViews() {
  renderSession();
  await Promise.all([loadOrders(), loadNotifications(), loadClientData(), loadAdminData()]);
}

function addToCart(productId, quantity) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) {
    return;
  }

  const existing = state.cart.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    state.cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });
  }
  renderCart();
  showToast(`${product.name} added to cart.`, 'success');
}

function resetProductForm() {
  els.productForm.reset();
  els.productForm.productId.value = '';
}

els.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const payload = Object.fromEntries(formData.entries());
  const response = await request({ method: 'post', url: '/auth/login', data: payload });
  saveSession(response.token, response.user);
  showToast('Logged in successfully.', 'success');
  await refreshAuthenticatedViews();
});

els.registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const payload = Object.fromEntries(formData.entries());
  if (payload.role !== 'client') {
    delete payload.businessName;
  }
  const response = await request({ method: 'post', url: '/auth/register', data: payload });
  saveSession(response.token, response.user);
  showToast('Account created successfully.', 'success');
  await refreshAuthenticatedViews();
  await loadBusinesses();
});

els.logoutButton.addEventListener('click', async () => {
  if (state.token) {
    try {
      await request({ method: 'post', url: '/auth/logout' });
    } catch {
      // logout proceeds locally even if session is already invalid
    }
  }
  clearSession();
  state.cart = [];
  state.orders = [];
  state.notifications = [];
  renderCart();
  await refreshAuthenticatedViews();
  showToast('Logged out.', 'secondary');
});

els.searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  await loadBusinesses(Object.fromEntries(formData.entries()));
});

els.placeOrderButton.addEventListener('click', async () => {
  if (state.user?.role !== 'customer') {
    showToast('Login as a customer to place an order.', 'warning');
    return;
  }
  if (!state.selectedBusinessId || !state.cart.length) {
    showToast('Choose a business and add items to the cart first.', 'warning');
    return;
  }

  await request({
    method: 'post',
    url: '/orders',
    data: {
      businessId: state.selectedBusinessId,
      items: state.cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    },
  });

  state.cart = [];
  renderCart();
  await Promise.all([loadOrders(), loadNotifications(), loadProducts(state.selectedBusinessId), loadClientData()]);
  showToast('Order placed successfully.', 'success');
});

els.clearCartButton.addEventListener('click', () => {
  state.cart = [];
  renderCart();
});

els.businessForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (state.user?.role !== 'client') {
    showToast('Only clients can manage business profiles.', 'warning');
    return;
  }

  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  const businessId = payload.businessId;
  delete payload.businessId;

  if (businessId) {
    await request({ method: 'put', url: `/client/business/${businessId}`, data: payload });
    showToast('Business updated.', 'success');
  } else {
    await request({ method: 'post', url: '/client/business', data: payload });
    showToast('Business created.', 'success');
  }

  await Promise.all([loadClientData(), loadBusinesses(), loadNotifications()]);
});

els.deleteBusinessButton.addEventListener('click', async () => {
  const businessId = els.businessForm.businessId.value;
  if (!businessId) {
    showToast('Select or create a business first.', 'warning');
    return;
  }
  await request({ method: 'delete', url: `/client/business/${businessId}` });
  showToast('Business deleted.', 'secondary');
  await Promise.all([loadClientData(), loadBusinesses(), loadNotifications()]);
});

els.imageForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const businessId = els.businessForm.businessId.value;
  if (!businessId) {
    showToast('Create a business before adding images.', 'warning');
    return;
  }
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  await request({ method: 'post', url: `/client/business/${businessId}/images`, data: payload });
  event.currentTarget.reset();
  await Promise.all([loadClientData(), loadBusinesses()]);
  showToast('Image added.', 'success');
});

els.productForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const businessId = els.businessForm.businessId.value;
  if (!businessId) {
    showToast('Create a business before adding stock.', 'warning');
    return;
  }
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  const productId = payload.productId;
  delete payload.productId;
  payload.price = Number(payload.price);
  payload.stock = Number(payload.stock);

  if (productId) {
    await request({ method: 'put', url: `/client/products/${productId}`, data: payload });
    showToast('Product updated.', 'success');
  } else {
    await request({ method: 'post', url: `/client/business/${businessId}/products`, data: payload });
    showToast('Product added.', 'success');
  }

  resetProductForm();
  await Promise.all([loadClientData(), loadBusinesses(), state.selectedBusinessId === businessId ? loadProducts(businessId) : Promise.resolve()]);
});

els.resetProductButton.addEventListener('click', resetProductForm);

els.refreshClientButton.addEventListener('click', async () => {
  await Promise.all([loadClientData(), loadNotifications()]);
  showToast('Client data refreshed.', 'secondary');
});

els.adminCustomerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  await request({ method: 'post', url: '/customers', data: payload });
  event.currentTarget.reset();
  await Promise.all([loadAdminData(), loadNotifications()]);
  showToast('Customer created.', 'success');
});

els.refreshAdminButton.addEventListener('click', async () => {
  await Promise.all([loadAdminData(), loadNotifications()]);
  showToast('Admin data refreshed.', 'secondary');
});

document.body.addEventListener('click', async (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) {
    return;
  }

  const { action, id } = target.dataset;

  if (action === 'open-business') {
    await loadProducts(id);
    return;
  }

  if (action === 'add-cart') {
    const quantityInput = document.querySelector(`[data-quantity-input="${id}"]`);
    const quantity = Number(quantityInput?.value || 1);
    if (quantity <= 0) {
      showToast('Quantity must be greater than zero.', 'warning');
      return;
    }
    addToCart(id, quantity);
    return;
  }

  if (action === 'remove-cart') {
    state.cart = state.cart.filter((item) => item.productId !== id);
    renderCart();
    return;
  }

  if (action === 'read-notification') {
    const basePath = notificationBasePath();
    await request({ method: 'put', url: `/${basePath}/notification/${id}` });
    await loadNotifications();
    showToast('Notification marked as read.', 'secondary');
    return;
  }

  if (action === 'delete-image') {
    await request({ method: 'delete', url: `/client/images/${encodeURIComponent(id)}` });
    await Promise.all([loadClientData(), loadBusinesses()]);
    showToast('Image removed.', 'secondary');
    return;
  }

  if (action === 'edit-product') {
    const product = state.clientProducts.find((item) => item.id === id);
    if (!product) {
      return;
    }
    els.productForm.productId.value = product.id;
    els.productForm.name.value = product.name;
    els.productForm.description.value = product.description;
    els.productForm.price.value = product.price;
    els.productForm.stock.value = product.stock;
    window.scrollTo({ top: els.productForm.offsetTop - 120, behavior: 'smooth' });
    return;
  }

  if (action === 'delete-product') {
    await request({ method: 'delete', url: `/client/products/${id}` });
    await Promise.all([loadClientData(), state.selectedBusinessId ? loadProducts(state.selectedBusinessId) : Promise.resolve()]);
    showToast('Product deleted.', 'secondary');
    return;
  }

  if (action === 'admin-delete-business') {
    await request({ method: 'delete', url: `/admin/business/${id}` });
    await Promise.all([loadAdminData(), loadBusinesses(), loadNotifications()]);
    showToast('Business removed by admin.', 'secondary');
  }
});

async function init() {
  renderSession();
  renderCart();
  renderOrders();
  renderNotifications();
  renderClientSection();
  renderAdminSection();
  await loadBusinesses();

  if (state.user) {
    try {
      const user = await request({ method: 'get', url: '/auth/me' });
      state.user = user;
      localStorage.setItem('shop_user', JSON.stringify(user));
      await refreshAuthenticatedViews();
    } catch {
      clearSession();
      renderSession();
    }
  }
}

init();