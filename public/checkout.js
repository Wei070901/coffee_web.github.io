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
        console.log('Cart data:', data);

        // 使用購物車中的 items 數組
        const cartItems = data.data.items || [];

        // 渲染訂單項目
        renderOrderItems(cartItems);

        // 計算並更新金額
        updateTotals(cartItems);

        // 綁定步驟按鈕事件
        bindStepButtons();

        // 綁定訂單提交事件
        bindOrderSubmit();
    } catch (error) {
        console.error('Error:', error);
        showNotification('載入購物車失敗', 'error');
    }
});

function renderOrderItems(items) {
    const sidebarOrderItems = document.getElementById('sidebarOrderItems');
    const orderItems = document.getElementById('orderItems');

    // 確保 items 是數組
    if (!Array.isArray(items)) {
        console.error('Invalid items data:', items);
        return;
    }

    // 檢查是否為空數組
    if (items.length === 0) {
        const emptyMessage = `
            <div class="empty-cart">
                <p>購物車是空的</p>
                <a href="products.html" class="back-to-shop">去購物</a>
            </div>
        `;
        sidebarOrderItems.innerHTML = emptyMessage;
        if (orderItems) orderItems.innerHTML = emptyMessage;
        return;
    }

    const itemsHTML = items.map(item => `
        <div class="order-item">
            <img src="${item.product.images[0]}" alt="${item.product.name}">
            <div class="item-details">
                <h4>${item.product.name}</h4>
                <p>數量: ${item.quantity}</p>
                <p>單價: NT$ ${item.product.price}</p>
            </div>
            <div class="item-total">NT$ ${item.product.price * item.quantity}</div>
        </div>
    `).join('');

    sidebarOrderItems.innerHTML = itemsHTML;
    if (orderItems) orderItems.innerHTML = itemsHTML;
}

function updateTotals(items) {
    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const shipping = 60;
    const total = subtotal + shipping;

    document.getElementById('sidebarSubtotal').textContent = `NT$ ${subtotal}`;
    document.getElementById('sidebarTotal').textContent = `NT$ ${total}`;

    if (document.getElementById('subtotal')) {
        document.getElementById('subtotal').textContent = `NT$ ${subtotal}`;
        document.getElementById('total').textContent = `NT$ ${total}`;
    }
}

function bindStepButtons() {
    const steps = document.querySelectorAll('.step');
    const contents = document.querySelectorAll('.checkout-step-content');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');

    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentStep = document.querySelector('.step.active');
            const currentContent = document.querySelector('.checkout-step-content.active');
            const nextStep = currentStep.nextElementSibling;
            const nextContent = currentContent.nextElementSibling;

            if (validateStep(currentContent) && nextStep) {
                currentStep.classList.remove('active');
                nextStep.classList.add('active');
                currentContent.classList.remove('active');
                nextContent.classList.add('active');

                if (nextContent.id === 'step3') {
                    updateConfirmationInfo();
                }
            }
        });
    });

    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentStep = document.querySelector('.step.active');
            const currentContent = document.querySelector('.checkout-step-content.active');
            const prevStep = currentStep.previousElementSibling;
            const prevContent = currentContent.previousElementSibling;

            if (prevStep) {
                currentStep.classList.remove('active');
                prevStep.classList.add('active');
                currentContent.classList.remove('active');
                prevContent.classList.add('active');
            }
        });
    });
}

function validateStep(stepContent) {
    const inputs = stepContent.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });

    if (!isValid) {
        showNotification('請填寫所有必填欄位', 'error');
    }

    return isValid;
}

function updateConfirmationInfo() {
    const info = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        payment: document.querySelector('input[name="payment"]:checked').value
    };

    const confirmationInfo = document.getElementById('confirmationInfo');
    confirmationInfo.innerHTML = `
        <p><strong>姓名：</strong>${info.name}</p>
        <p><strong>電話：</strong>${info.phone}</p>
        <p><strong>信箱：</strong>${info.email}</p>
        <p><strong>地址：</strong>${info.address}</p>
        <p><strong>付款方式：</strong>${getPaymentMethodText(info.payment)}</p>
    `;
}

function getPaymentMethodText(value) {
    const methods = {
        credit: '信用付款',
        transfer: '銀行轉帳',
        cod: '貨到付款'
    };
    return methods[value] || value;
}

function bindOrderSubmit() {
    const submitButton = document.querySelector('.submit-order');
    submitButton.addEventListener('click', async () => {
        try {
            const orderData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                address: document.getElementById('address').value,
                paymentMethod: document.querySelector('input[name="payment"]:checked').value
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (data.success) {
                // 顯示成功頁面
                document.querySelector('.success-page').style.display = 'flex';
                document.getElementById('orderNumber').textContent = data.data._id;
                document.getElementById('orderAmount').textContent = 
                    `NT$ ${document.getElementById('sidebarTotal').textContent.replace('NT$ ', '')}`;

                // 清空購物車
                await fetch('/api/cart', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
            } else {
                showNotification(data.error || '訂單建立失敗', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('訂單建立失敗', 'error');
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