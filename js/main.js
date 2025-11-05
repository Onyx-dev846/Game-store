
let cart = [];
let cartCount = 0;


const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const closeBtn = document.getElementById('closeBtn');
const overlay = document.getElementById('overlay');
const cartWrapper = document.getElementById('cartWrapper');
const cartCountElement = document.getElementById('cartCount');
const cartModal = document.getElementById('cartModal');
const cartItems = document.getElementById('cartItems');
const closeCart = document.getElementById('closeCart');
const checkoutBtn = document.getElementById('checkoutBtn');
const cartTotal = document.getElementById('cartTotal');
const flyingItem = document.getElementById('flyingItem');


function openSidebar() {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

menuBtn.addEventListener('click', openSidebar);
closeBtn.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeSidebar();
        closeCartModal();
    }
});

const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', closeSidebar);
});


function addToCart(product, button) {
    
    const buttonRect = button.getBoundingClientRect();
    const cartRect = cartWrapper.getBoundingClientRect();

    
    flyingItem.style.left = buttonRect.left + buttonRect.width / 2 + 'px';
    flyingItem.style.top = buttonRect.top + 'px';
    flyingItem.style.opacity = '1';
    flyingItem.style.transform = 'scale(1)';
    flyingItem.textContent = '🛒';

    
    setTimeout(() => {
        flyingItem.style.left = cartRect.left + cartRect.width / 2 + 'px';
        flyingItem.style.top = cartRect.top + cartRect.height / 2 + 'px';
        flyingItem.style.transform = 'scale(0.5)';
    }, 50);

    
    setTimeout(() => {
        flyingItem.style.opacity = '0';
        flyingItem.style.transform = 'scale(0)';

        
        cart.push(product);
        cartCount++;
        updateCartCount();
        saveCartToLocalStorage();

        
        cartCountElement.classList.add('bump');
        setTimeout(() => {
            cartCountElement.classList.remove('bump');
        }, 300);

    }, 800);
}

function updateCartCount() {
    cartCountElement.textContent = cartCount;
}

function openCartModal() {
    updateCartItems();
    cartModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCartModal() {
    cartModal.classList.remove('active');
    document.body.style.overflow = '';
}

function updateCartItems() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
        cartTotal.textContent = '0';
        return;
    }

    
    const groupedCart = cart.reduce((acc, product) => {
        const key = product.title;
        if (!acc[key]) {
            acc[key] = { ...product, quantity: 0 };
        }
        acc[key].quantity++;
        return acc;
    }, {});

    
    Object.values(groupedCart).forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.title}</div>
                <div class="cart-item-details">${item.quantity} × ${item.price} грн</div>
            </div>
            <div class="cart-item-price">${item.price * item.quantity} грн</div>
        `;
        cartItems.appendChild(cartItem);
    });

    
    const total = cart.reduce((sum, product) => sum + product.price, 0);
    cartTotal.textContent = total;
}

function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('cartCount', cartCount.toString());
}

function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    const savedCount = localStorage.getItem('cartCount');
    
    if (savedCart) {
        cart = JSON.parse(savedCart);
        cartCount = parseInt(savedCount) || cart.length;
        updateCartCount();
    }
}

function checkout() {
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }
    
    const total = cart.reduce((sum, product) => sum + product.price, 0);
    alert(`Дякуємо за замовлення!\nСума: ${total} грн\nТоварів: ${cart.length}`);
    
    
    cart = [];
    cartCount = 0;
    updateCartCount();
    updateCartItems();
    saveCartToLocalStorage();
    closeCartModal();
}


async function getProducts() {
    try {
        let response = await fetch("store_db.json");
        let products = await response.json();
        return products;
    } catch (error) {
        console.error("Помилка завантаження товарів:", error);
        return [];
    }
}

function getCardHTML(product, index) {
    return `
    <div class="my-card">
        <img src="img/${product.image}" alt="${product.title}">
        <h3>${product.title}</h3>
        <p class="description-card">${product.description}</p>
        <p class="price-card">${product.price} грн</p>
        <button type="button" class="cart-btn" data-index="${index}">Купити</button>
    </div>
    `;
}
document.addEventListener('DOMContentLoaded', function() {
    
    loadCartFromLocalStorage();
    
    
    getProducts().then(function(products) {
        let productsList = document.querySelector(".products-list");
        if (productsList && products.length > 0) {
            products.forEach(function(product, index) {
                productsList.innerHTML += getCardHTML(product, index);
            });
            
            
            const cartButtons = document.querySelectorAll('.cart-btn');
            cartButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const productIndex = this.getAttribute('data-index');
                    const product = products[productIndex];
                    addToCart(product, this);
                });
            });
        }
    });

    
    cartWrapper.addEventListener('click', openCartModal);
    closeCart.addEventListener('click', closeCartModal);
    checkoutBtn.addEventListener('click', checkout);

    
    cartModal.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            closeCartModal();
        }
    });
});