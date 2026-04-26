const api = axios.create({
    baseURL: '/api/v1',
});

const STORAGE_KEYS = {
    token: 'shop_token',
    user: 'shop_user',
};

function readStoredUser() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || 'null');
    } catch {
        return null;
    }
}

const page = document.body.dataset.page || 'home';
const state = {
    token: localStorage.getItem(STORAGE_KEYS.token) || '',
    user: readStoredUser(),
    businesses: [],
    selectedBusinessId: '',
    products: [],
    cart: [],
    orders: [],
    notifications: [],
    clientBusinesses: [],
    clientProducts: [],
    adminUsers: [],
    adminBusinesses: [],
};

function byId(id) {
    return document.getElementById(id);
}

const els = {
    sessionBadge: byId('sessionBadge'),
    logoutButton: byId('logoutButton'),
    loginForm: byId('loginForm'),
    registerForm: byId('registerForm'),
    registerRole: document.querySelector('#registerForm select[name="role"]'),
    businessNameInput: byId('businessNameInput'),
    businessNameHelp: byId('businessNameHelp'),
    searchForm: byId('searchForm'),
    businessList: byId('businessList'),
    productsTitle: byId('productsTitle'),
    selectedBusinessMeta: byId('selectedBusinessMeta'),
    productsList: byId('productsList'),
    cartItems: byId('cartItems'),
    cartCount: byId('cartCount'),
    cartTotal: byId('cartTotal'),
    placeOrderButton: byId('placeOrderButton'),
    clearCartButton: byId('clearCartButton'),
    ordersList: byId('ordersList'),
    notificationList: byId('notificationList'),
    toastContainer: byId('toastContainer'),
    businessForm: byId('businessForm'),
    deleteBusinessButton: byId('deleteBusinessButton'),
    imageForm: byId('imageForm'),
    imageList: byId('imageList'),
    productForm: byId('productForm'),
    resetProductButton: byId('resetProductButton'),
    clientProductsList: byId('clientProductsList'),
    refreshClientButton: byId('refreshClientButton'),
    adminCustomerForm: byId('adminCustomerForm'),
    adminUsersList: byId('adminUsersList'),
    adminBusinessesList: byId('adminBusinessesList'),
    refreshAdminButton: byId('refreshAdminButton'),
};

function authHeaders() {
    return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

function showToast(message, variant = 'dark') {
    if (!els.toastContainer) {
        return;
    }

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
    const toast = new bootstrap.Toast(wrapper, { delay: 3200 });
    toast.show();
    wrapper.addEventListener('hidden.bs.toast', () => wrapper.remove());
}

function getErrorMessage(error) {
    return error ? .response ? .data ? .message || error ? .message || 'Request failed';
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
        showToast(getErrorMessage(error), 'danger');
        throw error;
    }
}

function saveSession(token, user) {
    state.token = token;
    state.user = user;
    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

function clearSession() {
    state.token = '';
    state.user = null;
    state.notifications = [];
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
}

function setFormBusy(form, isBusy) {
    if (!form) {
        return;
    }

    form.querySelectorAll('button, input, select, textarea').forEach((field) => {
        field.disabled = isBusy;
    });
}

function redirectToWorkspace(role) {
    window.location.replace(rolePage(role));
}

function rolePage(role) {
    if (role === 'customer') {
        return '/customer.html';
    }
    if (role === 'client') {
        return '/client.html';
    }
    if (role === 'admin') {
        return '/admin.html';
    }
    return '/index.html';
}

function notificationBasePath() {
    if (!state.user) {
        return '';
    }
    return '/notifications';
}

function renderEmpty(container, message) {
    if (!container) {
        return;
    }
    container.innerHTML = `<div class="empty-state">${message}</div>`;
}

function formatMoney(value) {
    return `MWK ${Number(value || 0).toFixed(2)}`;
}

function updateNav() {
    document.querySelectorAll('[data-nav-page]').forEach((link) => {
        link.classList.toggle('active', link.dataset.navPage === page);
    });
}

function renderSession() {
    const role = state.user ? .role || 'guest';
    const label = state.user ? `${state.user.username} (${role})` : 'Guest';

    if (els.sessionBadge) {
        els.sessionBadge.textContent = label;
    }
    if (els.logoutButton) {
        els.logoutButton.classList.toggle('d-none', !state.user);
    }
}

function renderBusinesses() {
    if (!els.businessList) {
        return;
    }

    if (!state.businesses.length) {
        renderEmpty(els.businessList, 'No businesses match the current filters.');
        return;
    }

    els.businessList.innerHTML = state.businesses.map((business) => `
        <div class="col-md-6 col-xl-4">
            <div class="business-card p-3 h-100">
                <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <div>
                        <h3 class="h5 mb-1">${business.name}</h3>
                        <div class="text-secondary small">${business.category} • ${business.location}</div>
                    </div>
                    <span class="badge text-bg-warning">${(business.imageUrls || []).length} images</span>
                </div>
                <p class="text-secondary small">${business.description}</p>
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <span class="small">${business.contact}</span>
                    <button class="btn btn-sm btn-dark" data-action="open-business" data-id="${business.id}">View stock</button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderProducts() {
    if (!els.productsList) {
        return;
    }

    const business = state.businesses.find((entry) => entry.id === state.selectedBusinessId) ||
        state.clientBusinesses.find((entry) => entry.id === state.selectedBusinessId);

    if (els.productsTitle) {
        els.productsTitle.textContent = business ? `${business.name} stock` : 'Products and services';
    }
    if (els.selectedBusinessMeta) {
        els.selectedBusinessMeta.textContent = business ? `${business.category} • ${business.location}` : 'Choose a business to view products';
    }

    if (!state.products.length) {
        renderEmpty(els.productsList, 'No products available for the selected business.');
        return;
    }

    els.productsList.innerHTML = state.products.map((product) => {
        const actionMarkup = page === 'customer' ?
            `
                <div class="d-flex justify-content-between align-items-center gap-2 mt-3">
                    <input class="form-control form-control-sm w-25" type="number" min="1" value="1" data-quantity-input="${product.id}" />
                    <button class="btn btn-sm btn-dark" data-action="add-cart" data-id="${product.id}">Add to cart</button>
                </div>
            ` :
            '<div class="small text-secondary mt-3">Open the customer page to place an order.</div>';

        return `
            <div class="col-md-6">
                <div class="product-card p-3 h-100">
                    <div class="d-flex justify-content-between align-items-start gap-3 mb-2">
                        <div>
                            <h3 class="h5 mb-1">${product.name}</h3>
                            <div class="text-secondary small">${formatMoney(product.price)}</div>
                        </div>
                        <span class="badge text-bg-light">${product.stock} in stock</span>
                    </div>
                    <p class="small text-secondary mb-0">${product.description || 'No description provided.'}</p>
                    ${actionMarkup}
                </div>
            </div>
        `;
    }).join('');
}

function renderCart() {
    if (!els.cartItems || !els.cartCount || !els.cartTotal) {
        return;
    }

    els.cartCount.textContent = `${state.cart.length} items`;

    if (!state.cart.length) {
        renderEmpty(els.cartItems, 'Your cart is empty.');
        els.cartTotal.textContent = formatMoney(0);
        return;
    }

    const total = state.cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
    els.cartTotal.textContent = formatMoney(total);
    els.cartItems.innerHTML = state.cart.map((item) => `
        <div class="stack-card d-flex justify-content-between align-items-start gap-3">
            <div>
                <div class="fw-semibold">${item.name}</div>
                <div class="small text-secondary">${item.quantity} × ${formatMoney(item.price)}</div>
            </div>
            <button class="btn btn-sm btn-outline-danger" data-action="remove-cart" data-id="${item.productId}">Remove</button>
        </div>
    `).join('');
}

function renderOrders() {
    if (!els.ordersList) {
        return;
    }

    if (!state.orders.length) {
        renderEmpty(els.ordersList, 'No orders yet for this workspace.');
        return;
    }

    els.ordersList.innerHTML = state.orders.map((order) => `
        <div class="stack-card">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <strong>Order ${String(order.id).slice(0, 8)}</strong>
                <span class="badge text-bg-dark">${formatMoney(order.total)}</span>
            </div>
            <div class="small text-secondary">${new Date(order.createdAt).toLocaleString()}</div>
            <div class="small mt-2">${(order.items || []).length} item(s)</div>
        </div>
    `).join('');
}

function renderNotifications() {
    if (!els.notificationList) {
        return;
    }

    if (!state.user) {
        renderEmpty(els.notificationList, 'Login to view notifications.');
        return;
    }

    if (!state.notifications.length) {
        renderEmpty(els.notificationList, 'No notifications available.');
        return;
    }

    els.notificationList.innerHTML = state.notifications.map((notification) => `
        <div class="stack-card ${notification.read ? '' : 'border-dark'}">
            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                <span class="badge ${notification.read ? 'text-bg-light' : 'text-bg-dark'}">${notification.read ? 'Read' : 'New'}</span>
                <button class="btn btn-sm ${notification.read ? 'btn-outline-secondary' : 'btn-outline-dark'}" data-action="mark-notification" data-id="${notification.id}" data-read="${notification.read}">${notification.read ? 'Mark unread' : 'Mark read'}</button>
            </div>
            <div>${notification.message}</div>
            <div class="small text-secondary mt-2">${new Date(notification.createdAt).toLocaleString()}</div>
        </div>
    `).join('');
}

function renderClientBusinesses() {
    if (!els.businessForm) {
        return;
    }

    if (!state.clientBusinesses.length) {
        els.businessForm.reset();
        els.businessForm.elements.businessId.value = '';
        renderEmpty(els.imageList, 'Create a business profile to manage images.');
        renderEmpty(els.clientProductsList, 'Create a business and add stock items.');
        return;
    }

    const business = state.clientBusinesses[0];
    state.selectedBusinessId = business.id;
    els.businessForm.elements.businessId.value = business.id;
    els.businessForm.elements.name.value = business.name || '';
    els.businessForm.elements.contact.value = business.contact || '';
    els.businessForm.elements.category.value = business.category || '';
    els.businessForm.elements.location.value = business.location || '';
    els.businessForm.elements.description.value = business.description || '';

    if (els.imageList) {
        els.imageList.innerHTML = (business.imageUrls || []).length ?
            business.imageUrls.map((imageUrl) => `
                <div class="image-pill">
                    <a href="${imageUrl}" target="_blank" rel="noreferrer">Preview</a>
                    <button class="btn btn-sm btn-link text-danger p-0" data-action="delete-image" data-id="${encodeURIComponent(imageUrl)}">Remove</button>
                </div>
            `).join('') :
            '<div class="empty-state">No images added yet.</div>';
    }
}

function renderClientProducts() {
    if (!els.clientProductsList) {
        return;
    }

    if (!state.clientProducts.length) {
        renderEmpty(els.clientProductsList, 'No stock items yet.');
        return;
    }

    els.clientProductsList.innerHTML = state.clientProducts.map((product) => `
        <div class="stack-card">
            <div class="d-flex justify-content-between align-items-start gap-3">
                <div>
                    <div class="fw-semibold">${product.name}</div>
                    <div class="small text-secondary">${formatMoney(product.price)} • ${product.stock} in stock</div>
                    <div class="small mt-2">${product.description || 'No description provided.'}</div>
                </div>
                <div class="d-grid gap-2">
                    <button class="btn btn-sm btn-outline-dark" data-action="edit-product" data-id="${product.id}">Edit</button>
                    <button class="btn btn-sm btn-outline-danger" data-action="delete-product" data-id="${product.id}">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderAdminData() {
    if (els.adminUsersList) {
        if (!state.adminUsers.length) {
            renderEmpty(els.adminUsersList, 'No users available.');
        } else {
            els.adminUsersList.innerHTML = state.adminUsers.map((user) => `
                <div class="stack-card">
                    <div class="fw-semibold">${user.username}</div>
                    <div class="small text-secondary">${user.email}</div>
                    <span class="badge text-bg-light mt-2">${user.role}</span>
                </div>
            `).join('');
        }
    }

    if (els.adminBusinessesList) {
        if (!state.adminBusinesses.length) {
            renderEmpty(els.adminBusinessesList, 'No businesses available.');
        } else {
            els.adminBusinessesList.innerHTML = state.adminBusinesses.map((business) => `
                <div class="stack-card">
                    <div class="d-flex justify-content-between align-items-start gap-3">
                        <div>
                            <div class="fw-semibold">${business.name}</div>
                            <div class="small text-secondary">${business.category} • ${business.location}</div>
                        </div>
                        <button class="btn btn-sm btn-outline-danger" data-action="admin-delete-business" data-id="${business.id}">Remove</button>
                    </div>
                </div>
            `).join('');
        }
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
    if (!state.user || !els.ordersList) {
        renderOrders();
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

    state.notifications = await request({ method: 'get', url: notificationBasePath() });
    renderNotifications();
}

async function loadClientData() {
    if (page !== 'client') {
        return;
    }

    state.clientBusinesses = await request({ method: 'get', url: '/client/business' });
    renderClientBusinesses();

    if (state.selectedBusinessId) {
        state.clientProducts = await request({ method: 'get', url: `/businesses/${state.selectedBusinessId}/products` });
    } else {
        state.clientProducts = [];
    }

    renderClientProducts();
}

async function loadAdminData() {
    if (page !== 'admin') {
        return;
    }

    const [users, businesses] = await Promise.all([
        request({ method: 'get', url: '/admin/users' }),
        request({ method: 'get', url: '/admin/business' }),
    ]);

    state.adminUsers = users;
    state.adminBusinesses = businesses;
    renderAdminData();
}

function resetProductForm() {
    if (!els.productForm) {
        return;
    }

    els.productForm.reset();
    els.productForm.elements.productId.value = '';
}

function addToCart(productId, quantity) {
    const product = state.products.find((entry) => entry.id === productId);
    if (!product) {
        return;
    }

    const existing = state.cart.find((entry) => entry.productId === productId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        state.cart.push({
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            quantity,
        });
    }

    renderCart();
    showToast(`${product.name} added to cart.`, 'success');
}

function requireRole(role) {
    if (!state.user) {
        window.location.replace('/index.html');
        return false;
    }

    if (state.user.role !== role) {
        window.location.replace(rolePage(state.user.role));
        return false;
    }

    return true;
}

async function restoreSession() {
    if (!state.token) {
        renderSession();
        renderNotifications();
        return;
    }

    try {
        state.user = await request({ method: 'get', url: '/auth/me' });
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(state.user));
    } catch {
        clearSession();
    }

    renderSession();
}

function redirectAuthenticatedHomeUser() {
    if (page !== 'home' || !state.user) {
        return;
    }

    redirectToWorkspace(state.user.role);
}

function bindCommonEvents() {
    if (els.logoutButton) {
        els.logoutButton.addEventListener('click', async() => {
            els.logoutButton.disabled = true;
            if (state.token) {
                try {
                    await request({ method: 'post', url: '/auth/logout' });
                } catch {
                    // ignore logout failures when the session is already invalid
                }
            }

            clearSession();
            renderSession();
            renderNotifications();
            els.logoutButton.disabled = false;
            window.location.replace('/index.html');
        });
    }

    document.body.addEventListener('click', async(event) => {
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
            const quantity = Number(quantityInput ? .value || 1);
            if (quantity < 1) {
                showToast('Quantity must be at least 1.', 'warning');
                return;
            }

            addToCart(id, quantity);
            return;
        }

        if (action === 'remove-cart') {
            state.cart = state.cart.filter((entry) => entry.productId !== id);
            renderCart();
            return;
        }

        if (action === 'mark-notification') {
            const isRead = target.dataset.read === 'true';
            await request({
                method: 'put',
                url: `${notificationBasePath()}/${id}`,
                data: { read: !isRead },
            });
            await loadNotifications();
            showToast(isRead ? 'Notification marked as unread.' : 'Notification marked as read.', 'secondary');
            return;
        }

        if (action === 'delete-image') {
            await request({ method: 'delete', url: `/client/images/${id}` });
            await loadClientData();
            showToast('Image removed.', 'secondary');
            return;
        }

        if (action === 'edit-product') {
            const product = state.clientProducts.find((entry) => entry.id === id);
            if (!product || !els.productForm) {
                return;
            }

            els.productForm.elements.productId.value = product.id;
            els.productForm.elements.name.value = product.name;
            els.productForm.elements.price.value = product.price;
            els.productForm.elements.stock.value = product.stock;
            els.productForm.elements.description.value = product.description || '';
            return;
        }

        if (action === 'delete-product') {
            await request({ method: 'delete', url: `/client/products/${id}` });
            await Promise.all([loadClientData(), loadOrders()]);
            showToast('Product deleted.', 'secondary');
            return;
        }

        if (action === 'admin-delete-business') {
            await request({ method: 'delete', url: `/admin/business/${id}` });
            await Promise.all([loadAdminData(), loadOrders(), loadNotifications()]);
            showToast('Business removed.', 'secondary');
        }
    });
}

function bindHomeEvents() {
    const syncRegisterRole = () => {
        if (!els.registerRole || !els.businessNameInput || !els.businessNameHelp) {
            return;
        }

        const isClient = els.registerRole.value === 'client';
        els.businessNameInput.required = isClient;
        els.businessNameInput.placeholder = isClient ? 'Enter your business name' : 'Only for client accounts';
        els.businessNameHelp.textContent = isClient ?
            'Client accounts must provide a business name.' :
            'Customers can leave this blank.';
    };

    syncRegisterRole();

    if (els.registerRole) {
        els.registerRole.addEventListener('change', syncRegisterRole);
    }

    if (els.loginForm) {
        els.loginForm.addEventListener('submit', async(event) => {
            event.preventDefault();
            const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
            payload.email = String(payload.email || '').trim().toLowerCase();
            payload.password = String(payload.password || '').trim();

            if (!payload.email || !payload.password) {
                showToast('Email and password are required.', 'warning');
                return;
            }

            setFormBusy(event.currentTarget, true);
            try {
                const result = await request({ method: 'post', url: '/auth/login', data: payload });
                saveSession(result.token, result.user);
                renderSession();
                redirectToWorkspace(result.user.role);
            } finally {
                setFormBusy(event.currentTarget, false);
            }
        });
    }

    if (els.registerForm) {
        els.registerForm.addEventListener('submit', async(event) => {
            event.preventDefault();
            const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
            payload.username = String(payload.username || '').trim();
            payload.email = String(payload.email || '').trim().toLowerCase();
            payload.password = String(payload.password || '').trim();
            payload.location = String(payload.location || '').trim();
            payload.businessName = String(payload.businessName || '').trim();

            if (!payload.username || !payload.email || !payload.password) {
                showToast('Username, email, and password are required.', 'warning');
                return;
            }

            if (payload.password.length < 6) {
                showToast('Password must be at least 6 characters.', 'warning');
                return;
            }

            if (payload.role === 'client' && !payload.businessName) {
                showToast('Business name is required for client accounts.', 'warning');
                return;
            }

            if (payload.role !== 'client') {
                delete payload.businessName;
            }

            if (!payload.location) {
                delete payload.location;
            }

            setFormBusy(event.currentTarget, true);
            try {
                const result = await request({ method: 'post', url: '/auth/register', data: payload });
                saveSession(result.token, result.user);
                renderSession();
                redirectToWorkspace(result.user.role);
            } finally {
                setFormBusy(event.currentTarget, false);
            }
        });
    }
}

function bindSearch() {
    if (!els.searchForm) {
        return;
    }

    els.searchForm.addEventListener('submit', async(event) => {
        event.preventDefault();
        const params = Object.fromEntries(new FormData(event.currentTarget).entries());
        await loadBusinesses(params);
    });
}

function bindCustomerEvents() {
    if (els.placeOrderButton) {
        els.placeOrderButton.addEventListener('click', async() => {
            if (state.user ? .role !== 'customer') {
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
                    items: state.cart.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                    })),
                },
            });

            state.cart = [];
            renderCart();
            await Promise.all([loadOrders(), loadNotifications(), loadProducts(state.selectedBusinessId)]);
            showToast('Order placed successfully.', 'success');
        });
    }

    if (els.clearCartButton) {
        els.clearCartButton.addEventListener('click', () => {
            state.cart = [];
            renderCart();
        });
    }
}

function bindClientEvents() {
    if (els.businessForm) {
        els.businessForm.addEventListener('submit', async(event) => {
            event.preventDefault();
            const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
            const businessId = payload.businessId;
            delete payload.businessId;

            if (businessId) {
                await request({ method: 'put', url: `/client/business/${businessId}`, data: payload });
                showToast('Business updated.', 'success');
            } else {
                await request({ method: 'post', url: '/client/business', data: payload });
                showToast('Business created.', 'success');
            }

            await Promise.all([loadClientData(), loadNotifications()]);
        });
    }

    if (els.deleteBusinessButton) {
        els.deleteBusinessButton.addEventListener('click', async() => {
            const businessId = els.businessForm.elements.businessId.value;
            if (!businessId) {
                showToast('No business to delete yet.', 'warning');
                return;
            }

            await request({ method: 'delete', url: `/client/business/${businessId}` });
            await Promise.all([loadClientData(), loadOrders(), loadNotifications()]);
            showToast('Business deleted.', 'secondary');
        });
    }

    if (els.imageForm) {
        els.imageForm.addEventListener('submit', async(event) => {
            event.preventDefault();
            const businessId = els.businessForm ? .elements.businessId.value;
            if (!businessId) {
                showToast('Create a business before adding images.', 'warning');
                return;
            }

            const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
            await request({ method: 'post', url: `/client/business/${businessId}/images`, data: payload });
            event.currentTarget.reset();
            await loadClientData();
            showToast('Image added.', 'success');
        });
    }

    if (els.productForm) {
        els.productForm.addEventListener('submit', async(event) => {
            event.preventDefault();
            const businessId = els.businessForm ? .elements.businessId.value;
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
                showToast('Product created.', 'success');
            }

            resetProductForm();
            await Promise.all([loadClientData(), loadOrders()]);
        });
    }

    if (els.resetProductButton) {
        els.resetProductButton.addEventListener('click', resetProductForm);
    }

    if (els.refreshClientButton) {
        els.refreshClientButton.addEventListener('click', async() => {
            await Promise.all([loadClientData(), loadOrders(), loadNotifications()]);
            showToast('Client data refreshed.', 'secondary');
        });
    }
}

function bindAdminEvents() {
    if (els.adminCustomerForm) {
        els.adminCustomerForm.addEventListener('submit', async(event) => {
            event.preventDefault();
            const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
            await request({ method: 'post', url: '/customers', data: payload });
            event.currentTarget.reset();
            await Promise.all([loadAdminData(), loadNotifications()]);
            showToast('Customer created.', 'success');
        });
    }

    if (els.refreshAdminButton) {
        els.refreshAdminButton.addEventListener('click', async() => {
            await Promise.all([loadAdminData(), loadOrders(), loadNotifications()]);
            showToast('Admin data refreshed.', 'secondary');
        });
    }
}

async function initHomePage() {
    bindHomeEvents();
    bindSearch();
    await loadBusinesses();
    renderProducts();
}

async function initCustomerPage() {
    if (!requireRole('customer')) {
        return;
    }

    bindSearch();
    bindCustomerEvents();
    renderCart();
    await Promise.all([loadBusinesses(), loadOrders(), loadNotifications()]);
    renderProducts();
}

async function initClientPage() {
    if (!requireRole('client')) {
        return;
    }

    bindClientEvents();
    await Promise.all([loadClientData(), loadOrders(), loadNotifications()]);
}

async function initAdminPage() {
    if (!requireRole('admin')) {
        return;
    }

    bindAdminEvents();
    await Promise.all([loadAdminData(), loadOrders(), loadNotifications()]);
}

async function init() {
    updateNav();
    renderSession();
    renderProducts();
    renderCart();
    renderOrders();
    renderNotifications();

    bindCommonEvents();
    await restoreSession();
    redirectAuthenticatedHomeUser();

    if (page === 'home') {
        await Promise.all([initHomePage(), loadNotifications()]);
        return;
    }

    if (page === 'customer') {
        await initCustomerPage();
        return;
    }

    if (page === 'client') {
        await initClientPage();
        return;
    }

    if (page === 'admin') {
        await initAdminPage();
    }
}

init();