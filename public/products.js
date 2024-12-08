const ProductSystem = {
    async init() {
        try {
            await this.loadProducts();
            this.bindEvents();
            this.initCartEvents();
        } catch (error) {
            console.error('Initialization failed:', error);
        }
    },

    async loadProducts(filters = {}) {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/products?${queryString}`);
            const data = await response.json();
            this.renderProducts(data.data);
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    },

    async addToCart(productId, quantity = 1) {
        try {
            console.log('Adding to cart:', productId);
            // 使用 fetch 代替 api
            await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ productId, quantity })
            });

            const response = await fetch(`/api/products/${productId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const product = await response.json();
            
            const productData = {
                id: product.data._id,
                name: product.data.name,
                price: product.data.price,
                image: product.data.images[0],
                quantity: quantity
            };

            // 使用全局購物車實例的方法
            if (window.cart) {
                // 直接更新購物車數據
                const existingItem = window.cart.items.find(item => item.id === productData.id);
                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    window.cart.items.push(productData);
                }

                // 保存到 localStorage
                localStorage.setItem('cartItems', JSON.stringify(window.cart.items));

                // 更新購物車顯示
                window.cart.updateCart();

                // 添加購物車圖標彈跳動畫
                const cartIcon = document.getElementById('cartIcon');
                cartIcon.classList.add('bounce');
                setTimeout(() => {
                    cartIcon.classList.remove('bounce');
                }, 500);

                // 創建飛入動畫元素
                const button = document.querySelector(`button[data-id="${productId}"]`);
                const buttonRect = button.getBoundingClientRect();
                const flyingItem = document.createElement('div');
                flyingItem.className = 'flying-item';
                flyingItem.innerHTML = '<i class="fas fa-coffee"></i>';
                
                // 設置初始位置（按鈕位置）
                flyingItem.style.left = `${buttonRect.left}px`;
                flyingItem.style.top = `${buttonRect.top}px`;
                
                document.body.appendChild(flyingItem);

                // 移除飛入動畫元素
                setTimeout(() => {
                    flyingItem.remove();
                }, 800);
            }

            this.showNotification('商品已加入購物車');
        } catch (error) {
            console.error('Failed to add to cart:', error);
            this.showNotification('加入購物車失敗', 'error');
        }
    },

    renderProducts(products) {
        const productsGrid = document.querySelector('.products-grid');
        productsGrid.innerHTML = '';

        if (!Array.isArray(products)) {
            console.error('Invalid products data:', products);
            return;
        }

        products.forEach(product => {
            const productCard = this.createProductCard(product);
            productsGrid.appendChild(productCard);
        });
    },

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'coffee-card';
        card.setAttribute('data-id', product._id);
        
        const html = `
            <img src="${product.images[0] || 'https://via.placeholder.com/300'}" alt="${product.name}">
            <div class="roast-level">${product.roastLevel}</div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p class="price">NT$ ${product.price}</p>
            <button data-id="${product._id}">加入購物車</button>
        `;
        
        card.innerHTML = html;
        
        // 綁定加入購物車按鈕事件
        const button = card.querySelector('button');
        button.addEventListener('click', (e) => {
            e.stopPropagation();  // 防止事件冒泡到卡片
            this.addToCart(product._id);
        });

        // 綁定卡片點擊事件
        card.addEventListener('click', (e) => {
            // 如果點擊的不是按鈕，則導航到商品詳細頁面
            if (!e.target.matches('button')) {
                window.location.href = `product-detail.html?id=${product._id}`;
            }
        });

        return card;
    },

    bindEvents() {
        // 排序事件
        document.getElementById('sortFilter').addEventListener('change', (e) => {
            this.loadProducts({ sort: e.target.value });
        });

        // 分類過濾事件
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.loadProducts({ category: e.target.value });
        });
    },

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
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
        }, 3000);
    },

    initCartEvents() {
        // 購物車按鈕點擊事件
        const cartIcon = document.getElementById('cartIcon');
        const cartModal = document.getElementById('cartModal');
        const closeCart = document.getElementById('closeCart');

        cartIcon.addEventListener('click', () => {
            cartModal.style.display = 'block';
        });

        closeCart.addEventListener('click', () => {
            cartModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.style.display = 'none';
            }
        });
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    ProductSystem.init();
}); 