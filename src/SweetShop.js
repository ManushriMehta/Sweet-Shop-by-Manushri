class SweetShop {
  constructor() {
    this.sweets = [];
  }

  addSweet(sweet) {
    this.sweets.push(sweet);
  }

  deleteSweet(id) {
    this.sweets = this.sweets.filter(s => s.id !== id);
  }

  viewSweets() {
    return this.sweets;
  }

  search(filter) {
    return this.sweets.filter(s => s.category === filter.category);
  }

  sort(field, direction = 'asc') {
    return [...this.sweets].sort((a, b) => {
      if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  purchase(id, qty) {
    const sweet = this.sweets.find(s => s.id === id);
    if (sweet && sweet.quantity >= qty) {
      sweet.quantity -= qty;
    }
  }

  restock(id, qty) {
    const sweet = this.sweets.find(s => s.id === id);
    if (sweet) {
      sweet.quantity += qty;
    }
  }
}

module.exports = SweetShop;
