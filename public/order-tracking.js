document.addEventListener('DOMContentLoaded', function() {
    // 從 URL 獲取訂單編號
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if (orderId) {
        fetchOrderDetails(orderId);
    }
});

async function fetchOrderDetails(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('訂單不存在');
        }

        const data = await response.json();
        console.log('Order details:', data);  // 添加這行來調試

        if (data.success) {
            renderOrderDetails(data.data);
        } else {
            showError('找不到訂單資料');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('載入訂單資料失敗');
    }
}

function renderOrderDetails(order) {
    const orderDetails = document.querySelector('.order-details');
    orderDetails.innerHTML = `
        <div class="order-header">
            <h2>訂單編號：${order.orderNumber}</h2>
            <p>訂購日期：${new Date(order.createdAt).toLocaleDateString()}</p>
            <p>訂單狀態：${getOrderStatus(order.status)}</p>
        </div>
        <div class="order-items">
            ${order.items.map(item => `
                <div class="order-item">
                    <img src="${item.product.images[0]}" alt="${item.product.name}">
                    <div class="item-details">
                        <h3>${item.product.name}</h3>
                        <p>數量：${item.quantity}</p>
                        <p>單價：NT$ ${item.price}</p>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="order-summary">
            <p>小計：NT$ ${order.subtotal}</p>
            <p>運費：NT$ ${order.shippingFee}</p>
            <p class="total">總計：NT$ ${order.totalAmount}</p>
        </div>
    `;
}

function getOrderStatus(status) {
    const statusMap = {
        'pending': '待處理',
        'processing': '處理中',
        'shipped': '已出貨',
        'delivered': '已送達',
        'cancelled': '已取消'
    };
    return statusMap[status] || status;
}

function showError(message) {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <h2>${message}</h2>
            <p>請確認您的訂單編號是否正確</p>
            <a href="index.html" class="back-home">返回首頁</a>
        </div>
    `;
} 