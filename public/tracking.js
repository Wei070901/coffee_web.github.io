document.addEventListener('DOMContentLoaded', function() {
    // 從 localStorage 獲取最後一筆訂單資料
    const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
    
    if (lastOrder) {
        // 更新訂單編號和金額
        document.getElementById('trackingOrderNumber').textContent = lastOrder.orderNumber;
        document.getElementById('trackingOrderAmount').textContent = `NT$ ${lastOrder.total}`;
        
        // 格式化並顯示訂單日期
        const orderDate = new Date(lastOrder.orderDate);
        document.getElementById('orderDate').textContent = orderDate.toLocaleDateString('zh-TW');
        document.getElementById('orderPlacedTime').textContent = orderDate.toLocaleString('zh-TW');

        // 顯示訂單商品
        const orderItemsContainer = document.getElementById('trackingOrderItems');
        lastOrder.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'tracking-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>數量：${item.quantity}</p>
                    <p>單價：NT$ ${item.price}</p>
                </div>
            `;
            orderItemsContainer.appendChild(itemElement);
        });

        // 顯示收件資訊
        const deliveryDetails = document.getElementById('deliveryDetails');
        deliveryDetails.innerHTML = `
            <p><strong>收件人：</strong>${lastOrder.customerData.name}</p>
            <p><strong>電話：</strong>${lastOrder.customerData.phone}</p>
            <p><strong>地址：</strong>${lastOrder.customerData.address}</p>
            <p><strong>付款方式：</strong>${lastOrder.customerData.payment}</p>
        `;
    } else {
        // 如果沒有訂單資料，顯示提示訊息
        document.querySelector('.tracking-container').innerHTML = `
            <div class="no-order">
                <i class="fas fa-exclamation-circle"></i>
                <h2>找不到訂單資料</h2>
                <p>請確認您的訂單編號是否正確</p>
                <button onclick="window.location.href='index.html'" class="back-to-home">
                    返回首頁
                </button>
            </div>
        `;
    }
});