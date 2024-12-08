document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 獲取URL參數中的商品ID
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        // 從API獲取商品資料
        const response = await fetch(`/api/products/${productId}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            window.location.href = 'products.html';
            return;
        }

        const data = await response.json();
        const product = data.data;

        // 更新頁面標題
        document.title = `${product.name} - 咖啡香`;

        // 更新商品資訊
        document.getElementById('mainImage').src = product.images[0];
        document.getElementById('productName').textContent = product.name;
        document.getElementById('roastLevel').textContent = product.roastLevel;
        document.getElementById('productId').textContent = product._id;
        document.getElementById('productPrice').textContent = `NT$ ${product.price}`;
        document.getElementById('productDescription').textContent = product.description;

        // 渲染商品特色
        const featuresContainer = document.getElementById('productFeatures');
        product.features.forEach(feature => {
            const featureElement = document.createElement('p');
            featureElement.textContent = feature;
            featuresContainer.appendChild(featureElement);
        });

        // 渲染沖煮建議
        const brewingGuideContainer = document.getElementById('brewingGuide');
        product.brewingGuide.forEach(guide => {
            const guideElement = document.createElement('p');
            guideElement.textContent = guide;
            brewingGuideContainer.appendChild(guideElement);
        });

        // 渲染縮圖
        const thumbnailsContainer = document.getElementById('imageThumbnails');
        product.images.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = image;
            thumbnail.alt = `${product.name} 圖片 ${index + 1}`;
            thumbnail.addEventListener('click', () => {
                document.getElementById('mainImage').src = image;
            });
            thumbnailsContainer.appendChild(thumbnail);
        });

        // 數量選擇器功能
        const quantityInput = document.getElementById('quantity');
        document.querySelector('.minus').addEventListener('click', () => {
            if (quantityInput.value > 1) {
                quantityInput.value = parseInt(quantityInput.value) - 1;
            }
        });
        document.querySelector('.plus').addEventListener('click', () => {
            quantityInput.value = parseInt(quantityInput.value) + 1;
        });

        // 加入購物車功能
        document.getElementById('addToCartBtn').addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value);
            const cartItem = {
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.images[0],
                quantity: quantity
            };

            // 使用全局購物車實例
            if (window.cart) {
                window.cart.addItem(cartItem);
                
                // 添加飛入動畫元素
                const button = document.getElementById('addToCartBtn');
                const buttonRect = button.getBoundingClientRect();
                const flyingItem = document.createElement('div');
                flyingItem.className = 'flying-item';
                flyingItem.innerHTML = '<i class="fas fa-coffee"></i>';
                flyingItem.style.left = `${buttonRect.left}px`;
                flyingItem.style.top = `${buttonRect.top}px`;
                document.body.appendChild(flyingItem);

                // 移除飛入動畫元素
                setTimeout(() => {
                    flyingItem.remove();
                }, 800);

                // 顯示通知
                const notification = document.createElement('div');
                notification.className = 'notification';
                notification.textContent = '商品已加入購物車！';
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
        });

        // 加入收藏功能
        document.getElementById('addToWishlistBtn').addEventListener('click', () => {
            const wishlistItem = {
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.images[0]
            };

            // 確保全局只有一個收藏夾實例
            if (!window.wishlist) {
                window.wishlist = new Wishlist();
            }
            window.wishlist.addItem(wishlistItem);

            // 顯示通知
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = '商品已加入收藏！';
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
        });

        // 獲取相關商品
        const relatedResponse = await fetch(`/api/products/related/${productId}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            const relatedProducts = relatedData.data;

            // 渲染相關商品
            const relatedProductsContainer = document.getElementById('relatedProducts');
            relatedProducts.forEach(relatedProduct => {
                const productCard = document.createElement('div');
                productCard.className = 'coffee-card';
                // 添加點擊事件
                productCard.addEventListener('click', (e) => {
                    // 如果點擊的是按鈕,不進行跳轉
                    if (e.target.tagName !== 'BUTTON') {
                        window.location.href = `product-detail.html?id=${relatedProduct._id}`;
                    }
                });
                
                productCard.innerHTML = `
                    <img src="${relatedProduct.images[0]}" alt="${relatedProduct.name}">
                    <div class="roast-level">${relatedProduct.roastLevel}</div>
                    <h3>${relatedProduct.name}</h3>
                    <p>${relatedProduct.description}</p>
                    <p class="price">NT$ ${relatedProduct.price}</p>
                    <button onclick="cart.addItem(${JSON.stringify({
                        id: relatedProduct._id,
                        name: relatedProduct.name,
                        price: relatedProduct.price,
                        image: relatedProduct.images[0]
                    }).replace(/"/g, '&quot;')})">加入購物車</button>
                `;
                relatedProductsContainer.appendChild(productCard);
            });
        }
    } catch (error) {
        console.error('Error:', error);
        window.location.href = 'products.html';
    }
});

// 保持原有的收藏夾類定義
class Wishlist {
    constructor() {
        const savedWishlist = localStorage.getItem('wishlistItems');
        this.items = savedWishlist ? JSON.parse(savedWishlist) : [];
    }

    addItem(item) {
        if (!this.items.find(existingItem => existingItem.id === item.id)) {
            this.items.push(item);
            localStorage.setItem('wishlistItems', JSON.stringify(this.items));
        }
    }
} 