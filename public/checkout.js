import api from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    class CheckoutSystem {
        constructor() {
            this.init();
        }

        async init() {
            // 初始化訂單資料
            await this.initializeOrderData();
            this.bindEvents();
        }

        async initializeOrderData() {
            try {
                // 從 API 獲取購物車數據
                const cartData = await api.get('/cart');
                this.displayCartItems(cartData.items);
                this.updateTotals(cartData);
            } catch (error) {
                console.error('Failed to load cart:', error);
                this.showNotification('載入購物車失敗', 'error');
            }
        }

        async submitOrder() {
            try {
                // 收集訂單數據
                const orderData = {
                    customerInfo: {
                        name: document.getElementById('name').value,
                        phone: document.getElementById('phone').value,
                        email: document.getElementById('email').value,
                        address: document.getElementById('address').value
                    },
                    paymentMethod: document.querySelector('input[name="payment"]:checked').value,
                    items: await this.getCartItems()
                };

                // 發送訂單到後端
                const response = await api.post('/orders', orderData);
                
                if (response.success) {
                    // 清空購物車
                    await api.delete('/cart');
                    
                    // 保存訂單信息用於追蹤
                    localStorage.setItem('lastOrder', JSON.stringify(response.order));
                    
                    // 顯示成功頁面
                    this.showSuccessPage(response.order);
                }
            } catch (error) {
                console.error('Order submission failed:', error);
                this.showNotification('訂單提交失敗，請稍後再試', 'error');
            }
        }

        async getCartItems() {
            try {
                const response = await api.get('/cart');
                return response.items;
            } catch (error) {
                console.error('Failed to get cart items:', error);
                return [];
            }
        }

        showSuccessPage(order) {
            document.querySelector('.success-page').style.display = 'flex';
            document.querySelector('.checkout-layout').style.display = 'none';
            
            document.getElementById('orderNumber').textContent = order.orderNumber;
            document.getElementById('orderAmount').textContent = `NT$ ${order.total}`;
        }

        // ... 其他原有的方法 ...
    }

    // 初始化結帳系統
    const checkoutSystem = new CheckoutSystem();
}); 