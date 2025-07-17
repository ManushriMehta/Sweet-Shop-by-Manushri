class Sweet {
  constructor(id, name, category, price, quantity) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.price = price;
    this.quantity = quantity;
  }
}

class SweetShop {
  constructor() {
    this.sweets = [];
    this.cart = [];
    this.baseURL = 'http://localhost:5000/api';
    this.adminToken = localStorage.getItem('adminToken') || null;
    this.loadSweets();
    this.loadCart();
  }

  // API Methods
  async apiCall(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(this.adminToken && { 'Authorization': `Bearer ${this.adminToken}` }),
          ...options.headers
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API call failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async loadSweets() {
    try {
      const data = await this.apiCall('/sweets');
      this.sweets = data.map(s => new Sweet(s.id, s.name, s.category, s.price, s.quantity));
      renderSweets();
    } catch (error) {
      console.error('Failed to load sweets:', error);
      alert('Failed to load sweets: ' + error.message);
    }
  }

  async addSweet(sweet) {
    try {
      await this.apiCall('/sweets', {
        method: 'POST',
        body: JSON.stringify(sweet)
      });
      await this.loadSweets();
      return true;
    } catch (error) {
      console.error('Failed to add sweet:', error);
      alert('Failed to add sweet: ' + error.message);
      return false;
    }
  }

  async deleteSweet(id) {
    try {
      await this.apiCall(`/sweets/${id}`, {
        method: 'DELETE'
      });
      await this.loadSweets();
      return true;
    } catch (error) {
      console.error('Failed to delete sweet:', error);
      alert('Failed to delete sweet: ' + error.message);
      return false;
    }
  }

  async purchaseSweet(id, qty) {
    try {
      const sweet = this.sweets.find(s => s.id === id);
      if (!sweet) {
        throw new Error('Sweet not found');
      }

      // Purchase the sweet (reduce quantity)
      await this.apiCall(`/sweets/${id}/purchase`, {
        method: 'POST',
        body: JSON.stringify({ qty })
      });

      // Add to cart
      await this.saveCartItem(sweet, qty);

      // Reload sweets and cart
      await this.loadSweets();
      await this.loadCart();

      return true;
    } catch (error) {
      console.error('Failed to purchase sweet:', error);
      alert('Failed to purchase sweet: ' + error.message);
      return false;
    }
  }

  async restockSweet(id, qty) {
    try {
      await this.apiCall(`/sweets/${id}/restock`, {
        method: 'POST',
        body: JSON.stringify({ qty })
      });
      await this.loadSweets();
      return true;
    } catch (error) {
      console.error('Failed to restock sweet:', error);
      alert('Failed to restock sweet: ' + error.message);
      return false;
    }
  }

  async loadCart() {
    try {
      const data = await this.apiCall('/cart');
      this.cart = data;
      renderCart();
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  }

  async saveCartItem(sweet, qty) {
    try {
      await this.apiCall('/cart', {
        method: 'POST',
        body: JSON.stringify({
          sweet_id: sweet.id,
          name: sweet.name,
          price: sweet.price,
          qty
        })
      });
    } catch (error) {
      console.error('Failed to save cart item:', error);
      throw error;
    }
  }

  async clearCart() {
    try {
      await this.apiCall('/cart', {
        method: 'DELETE'
      });
      await this.loadCart();
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear cart:', error);
      alert('Failed to clear cart: ' + error.message);
    }
  }

  async adminLogin(password) {
    try {
      const response = await this.apiCall('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password })
      });

      this.adminToken = response.token;
      localStorage.setItem('adminToken', this.adminToken);
      return true;
    } catch (error) {
      console.error('Admin login failed:', error);
      return false;
    }
  }

  adminLogout() {
    this.adminToken = null;
    localStorage.removeItem('adminToken');
  }

  isAdmin() {
    return this.adminToken !== null;
  }

  getFiltered() {
    const term = document.getElementById('search').value.toLowerCase();
    return this.sweets.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.category.toLowerCase().includes(term)
    );
  }

  async sortByPrice(order = 'asc') {
    try {
      const data = await this.apiCall(`/sweets/sorted?order=${order}`);
      this.sweets = data.map(s => new Sweet(s.id, s.name, s.category, s.price, s.quantity));
      renderSweets();
    } catch (error) {
      console.error('Failed to sort sweets:', error);
    }
  }

  getCartTotal() {
    return this.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }
}

let isAdmin = false;
const shop = new SweetShop();

async function checkAdminCode() {
  const code = document.getElementById('adminCode').value;
  const status = document.getElementById('adminStatus');
  const form = document.getElementById('adminForm');

  if (code === '') {
    // Logout
    shop.adminLogout();
    isAdmin = false;
    form.style.display = 'none';
    status.textContent = '';
    status.classList.remove('admin-verified');
  } else {
    // Try to login
    const success = await shop.adminLogin(code);
    if (success) {
      isAdmin = true;
      form.style.display = 'block';
      status.textContent = '✔️ Admin Access Granted';
      status.classList.add('admin-verified');
    } else {
      isAdmin = false;
      form.style.display = 'none';
      status.textContent = '❌ Invalid Admin Code';
      status.classList.remove('admin-verified');
    }
  }

  renderSweets();
}

function renderSweets() {
  const list = document.getElementById('sweetList');
  list.innerHTML = '';

  for (const sweet of shop.getFiltered()) {
    const div = document.createElement('div');
    div.className = 'sweet-card';
    div.innerHTML = `
      <h3>${sweet.name}</h3>
      <p><strong>Category:</strong> ${sweet.category}</p>
      <p><strong>Price:</strong> ₹${sweet.price}</p>
      <p><strong>Stock:</strong> ${sweet.quantity}</p>
      <input id="purchase-${sweet.id}" type="number" placeholder="Qty" min="1" style="width: 60px;" />
      <button onclick="buy(${sweet.id})" ${sweet.quantity === 0 ? 'disabled' : ''}>
        ${sweet.quantity === 0 ? 'Out of Stock' : 'Buy'}
      </button>
      ${isAdmin ? `
        <button class="admin-btn" onclick="restock(${sweet.id})">Restock</button>
        <button class="admin-btn delete" onclick="remove(${sweet.id})">Delete</button>
      ` : ''}
    `;
    list.appendChild(div);
  }
}

function renderCart() {
  const cartList = document.getElementById('cartList');
  const totalPrice = document.getElementById('totalPrice');

  cartList.innerHTML = '';

  if (shop.cart.length === 0) {
    cartList.innerHTML = '<p>Your cart is empty</p>';
  } else {
    for (const item of shop.cart) {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        ${item.qty} x ${item.name} @ ₹${item.price} = ₹${item.qty * item.price}
        `;
      cartList.appendChild(div);
    }

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear Cart';
    clearBtn.onclick = () => shop.clearCart();
    clearBtn.style.marginTop = '10px';
    cartList.appendChild(clearBtn);

    const buyBtn = document.createElement('button');
    buyBtn.textContent = 'Purchase Sweets';
    buyBtn.onclick = purchaseCartItems;
    buyBtn.style.marginTop = '10px';
    buyBtn.style.marginLeft = '10px';
    cartList.appendChild(buyBtn);

  }

  totalPrice.textContent = `Total: ₹${shop.getCartTotal()}`;
}
async function purchaseCartItems() {
  if (shop.cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  let success = true;

  for (const item of shop.cart) {
    try {
      await shop.apiCall(`/sweets/${item.sweet_id}/purchase`, {
        method: 'POST',
        body: JSON.stringify({ qty: item.qty })
      });
    } catch (err) {
      success = false;
      alert(`Failed to purchase ${item.name}: ${err.message}`);
    }
  }

  if (success) {
    const total = shop.getCartTotal();
    alert(`Thank you for your purchase!\nTotal amount: ₹${total}`);
    await shop.clearCart();
    await shop.fetchSweets();
    await shop.fetchCart();
    renderSweets();
    renderCart();
  }
}

async function addSweet() {
  if (!isAdmin) {
    alert('Admin access required!');
    return;
  }

  const id = parseInt(document.getElementById('id').value);
  const name = document.getElementById('name').value;
  const category = document.getElementById('category').value;
  const price = parseFloat(document.getElementById('price').value);
  const quantity = parseInt(document.getElementById('quantity').value);

  if (!id || !name || !category || !price || !quantity) {
    alert('Please fill all fields');
    return;
  }

  const sweet = new Sweet(id, name, category, price, quantity);
  const success = await shop.addSweet(sweet);

  if (success) {
    // Clear form
    document.getElementById('id').value = '';
    document.getElementById('name').value = '';
    document.getElementById('category').value = '';
    document.getElementById('price').value = '';
    document.getElementById('quantity').value = '';

    alert('Sweet added successfully!');
  }
}

async function buy(id) {
  const qtyInput = document.getElementById(`purchase-${id}`);
  const qty = parseInt(qtyInput.value);

  if (!qty || qty <= 0) {
    alert('Please enter a valid quantity');
    return;
  }

  const success = await shop.purchaseSweet(id, qty);
  if (success) {
    qtyInput.value = '';
    alert('Sweet purchased successfully!');
  }
}

async function restock(id) {
  if (!isAdmin) {
    alert('Admin access required!');
    return;
  }

  const qtyInput = document.getElementById(`purchase-${id}`);
  const qty = parseInt(qtyInput.value);

  if (!qty || qty <= 0) {
    alert('Please enter a valid quantity to restock');
    return;
  }

  const success = await shop.restockSweet(id, qty);
  if (success) {
    qtyInput.value = '';
    alert('Sweet restocked successfully!');
  }
}

async function remove(id) {
  if (!isAdmin) {
    alert('Admin access required!');
    return;
  }

  if (confirm('Are you sure you want to delete this sweet?')) {
    const success = await shop.deleteSweet(id);
    if (success) {
      alert('Sweet deleted successfully!');
    }
  }
}

async function sortByPrice() {
  const order = document.getElementById('sortOption').value;
  await shop.sortByPrice(order);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  // Check if admin token exists
  if (shop.isAdmin()) {
    isAdmin = true;
    document.getElementById('adminCode').value = '123';
    document.getElementById('adminForm').style.display = 'block';
    document.getElementById('adminStatus').textContent = '✔️ Admin Access Granted';
    document.getElementById('adminStatus').classList.add('admin-verified');
  }

  renderSweets();
});