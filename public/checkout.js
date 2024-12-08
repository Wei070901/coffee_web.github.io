// 使用全局變數
document.addEventListener('DOMContentLoaded', async function() {
    // 檢查用戶是否登入
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // 獲取購物車資料
        const response = await fetch('/api/cart', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cart');
        }

        const data = await response.json();
        const cartItems = data.data;

        // 渲染購物車項目
        renderCartItems(cartItems);

        // 計算總金額
        calculateTotal(cartItems);

        // 綁定表單提交事件
        bindFormSubmit();
    } catch (error) {
        console.error('Error:', error);
        showNotification('載入購物車失敗', 'error');
    }
});

function renderCartItems(items) {
    const cartItemsContainer = document.getElementById('cartItems');
    cartItemsContainer.innerHTML = '';

    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p>數量: ${item.quantity}</p>
                <p>單價: NT$ ${item.price}</p>
                <p>小計: NT$ ${item.price * item.quantity}</p>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);
    });
}

function calculateTotal(items) {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('orderTotal').textContent = `NT$ ${total}`;
}

function bindFormSubmit() {
    const checkoutForm = document.getElementById('checkoutForm');
    checkoutForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value
        };

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                showNotification('訂單已成功建立！');
                // 清空購物車
                await fetch('/api/cart', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                // 跳轉到訂單確認頁面
                window.location.href = `order-confirmation.html?id=${data.data._id}`;
            } else {
                showNotification(data.error || '建立訂單失敗', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('建立訂單失敗', 'error');
        }
    });
}

function showNotification(message, type = 'success') {
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
} 