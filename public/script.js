class ShoppingCart {
    constructor() {
        const savedCart = localStorage.getItem('cartItems');
        this.items = savedCart ? JSON.parse(savedCart) : [];
        this.total = 0;
        this.init();
        this.updateCart();
    }

    init() {
        // 初始化購物車
        this.cartIcon = document.getElementById('cartIcon');
        this.cartModal = document.getElementById('cartModal');
        this.closeCart = document.getElementById('closeCart');
        this.cartItems = document.getElementById('cartItems');
        this.cartTotal = document.getElementById('cartTotal');
        this.cartCount = document.querySelector('.cart-count');
        this.checkoutBtn = document.getElementById('checkoutBtn');

        // 綁定事件
        this.cartIcon.addEventListener('click', () => this.openCart());
        this.closeCart.addEventListener('click', () => this.closeCartModal());
        this.checkoutBtn.addEventListener('click', () => this.checkout());

        // 綁定所有加入購物車按鈕
        document.querySelectorAll('.coffee-card button').forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.target.closest('.coffee-card');
                const product = {
                    id: Date.now(), // 臨時ID
                    name: card.querySelector('h3').textContent,
                    price: parseInt(card.querySelector('.price').textContent.replace('NT$ ', '')),
                    image: card.querySelector('img').src,
                    quantity: 1
                };
                this.addItem(product);
            });
        });

        // 綁定購物車項目的事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                const itemId = e.target.dataset.id;
                this.removeItem(itemId);
            }
        });
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.name === product.name);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push(product);
        }
        
        // 保存到 localStorage
        localStorage.setItem('cartItems', JSON.stringify(this.items));
        
        // 添加購物車圖標彈跳動畫
        this.cartIcon.classList.add('bounce');
        setTimeout(() => {
            this.cartIcon.classList.remove('bounce');
        }, 500);

        // 創建飛入動畫元素
        const flyingItem = document.createElement('div');
        flyingItem.className = 'flying-item';
        flyingItem.innerHTML = '<i class="fas fa-coffee"></i>';
        
        // 設置初始位置（按鈕位置）
        const buttonRect = event.target.getBoundingClientRect();
        flyingItem.style.left = `${buttonRect.left}px`;
        flyingItem.style.top = `${buttonRect.top}px`;
        
        document.body.appendChild(flyingItem);

        // 移除飛入動畫元素
        setTimeout(() => {
            flyingItem.remove();
        }, 800);

        this.updateCart();
        this.showNotification('商品已加入購物車！');
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        localStorage.setItem('cartItems', JSON.stringify(this.items));
        this.updateCart();
        this.showNotification('商品已從購物車中移除');
    }

    updateQuantity(id, change) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeItem(id);
            } else {
                // 更新 localStorage
                localStorage.setItem('cartItems', JSON.stringify(this.items));
                this.updateCart();
            }
        }
    }

    updateCart() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const cartCount = document.querySelector('.cart-count');
        this.total = 0;

        cartItems.innerHTML = '';

        this.items.forEach(item => {
            this.total += item.price * item.quantity;
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">NT$ ${item.price}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" data-id="${item.id}">&times;</button>
            `;
            cartItems.appendChild(itemElement);
        });

        cartTotal.textContent = `NT$ ${this.total}`;
        cartCount.textContent = this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    openCart() {
        this.cartModal.classList.add('active');
    }

    closeCartModal() {
        this.cartModal.classList.remove('active');
    }

    checkout() {
        if (this.items.length === 0) {
            this.showNotification('購物車是空的！');
            return;
        }
        // 不需要重複存儲，為已經在 localStorage 中了
        window.location.href = 'checkout.html';
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }
}

// 確保全局只有一個購物車實例
if (!window.cart) {
    window.cart = new ShoppingCart();
}

// 漢堡選單功能
const hamburger = document.getElementById('hamburger');
const navContainer = document.querySelector('.nav-container');
const body = document.body;

// 漢堡選單點擊事件
hamburger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    hamburger.classList.toggle('active');
    navContainer.classList.toggle('active');
    body.classList.toggle('menu-open');
    console.log('Menu toggled:', navContainer.classList.contains('active'));
});

// 點擊選單項目時關閉選單
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navContainer.classList.remove('active');
        body.classList.remove('menu-open');
    });
});

// 點擊頁面其他地方時關閉選單
document.addEventListener('click', (e) => {
    if (navContainer.classList.contains('active') && 
        !navContainer.contains(e.target) && 
        !hamburger.contains(e.target)) {
        hamburger.classList.remove('active');
        navContainer.classList.remove('active');
        body.classList.remove('menu-open');
    }
});

// 防止選單內部點擊事件冒泡
navContainer.addEventListener('click', (e) => {
    e.stopPropagation();
});

document.addEventListener('DOMContentLoaded', function() {
    // 為首頁的商品卡片添加事件處理
    const productCards = document.querySelectorAll('.coffee-card');
    productCards.forEach(card => {
        const addToCartBtn = card.querySelector('button');
        const productId = card.getAttribute('data-id');
        
        // 為加入購物車按鈕添加事件
        addToCartBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            const product = {
                id: productId,
                name: card.querySelector('h3').textContent,
                price: parseInt(card.querySelector('.price').textContent.replace('NT$ ', '')),
                image: card.querySelector('img').src,
                quantity: 1
            };
            cart.addItem(product);
        });

        // 為卡片其他部分添加點擊事件
        const cardElements = card.querySelectorAll('img, h3, p:not(.price)');
        cardElements.forEach(element => {
            element.addEventListener('click', () => {
                window.location.href = `product-detail.html?id=${productId}`;
            });
        });
    });
});

// 購物車相關功能
document.getElementById('cartIcon').addEventListener('click', () => {
    document.getElementById('cartModal').style.display = 'block';
});

document.getElementById('closeCart').addEventListener('click', () => {
    document.getElementById('cartModal').style.display = 'none';
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('cartModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
}); 