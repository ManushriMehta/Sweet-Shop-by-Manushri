import { SweetShop } from './SweetShop.js';
import { Sweet } from './Sweet.js';

const shop = new SweetShop();

shop.addSweet(new Sweet(1001, 'Kaju Katli', 'Nut-Based', 50, 20));
shop.addSweet(new Sweet(1002, 'Gajar Halwa', 'Vegetable-Based', 30, 10));
shop.addSweet(new Sweet(1003, 'Gulab Jamun', 'Milk-Based', 20, 15));

console.log('Initial sweets:', shop.viewSweets());

console.log('\nSearching Milk-Based sweets...');
console.log(shop.search({ category: 'Milk-Based' }));

console.log('\nSorted by price (asc):');
console.log(shop.sort('price', 'asc'));

console.log('\nPurchasing 5 Gulab Jamun...');
shop.purchase(1003, 5);
console.log(shop.viewSweets());

console.log('\nRestocking 10 Gajar Halwa...');
shop.restock(1002, 10);
console.log(shop.viewSweets());
