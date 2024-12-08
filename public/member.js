import api from './api.js';

class MemberSystem {
    constructor() {
        this.init();
        this.wishlist = [];  // 添加收藏清單陣列
    }

    async init() {
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.memberDashboard = document.getElementById('memberDashboard');
        this.bindEvents();
        await this.checkLoginStatus();
    }

    async checkLoginStatus() {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await api.get('/auth/me');
                this.loginSuccess(response.data);
            }
        } catch (error) {
            console.error('Check login status failed:', error);
            localStorage.removeItem('token');
        }
    }

    bindEvents() {
        // 註冊表單提交事件
        this.registerForm.querySelector('form').addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('註冊表單提交');

            try {
                const formData = {
                    name: document.getElementById('registerName').value,
                    email: document.getElementById('registerEmail').value,
                    password: document.getElementById('registerPassword').value,
                    phone: document.getElementById('phone').value
                };
                
                // 基本驗證
                if (!formData.name || !formData.email || !formData.password || !formData.phone) {
                    throw new Error('請填寫所有必填欄位');
                }

                // 驗證電子郵件格式
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.email)) {
                    throw new Error('請輸入有效的電子郵件地址');
                }

                // 驗證手機號碼格式
                const phoneRegex = /^09\d{8}$/;
                if (!phoneRegex.test(formData.phone)) {
                    throw new Error('請輸入有效的手機號碼');
                }
                
                console.log('註冊數據:', formData);
                
                const response = await api.post('/auth/register', formData);
                console.log('註冊響應:', response);
                
                if (response.success) {
                    this.showNotification('註冊成功！');
                    this.switchToLogin();
                } else {
                    throw new Error(response.error || '註冊失敗');
                }
            } catch (error) {
                console.error('註冊錯誤:', error);
                this.showNotification(error.message, 'error');
            }
        });

        // 登入表單提交事件
        this.loginForm.querySelector('form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });

        // 切換表單的按鈕
        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.loginForm.style.display = 'none';
            this.registerForm.style.display = 'block';
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.registerForm.style.display = 'none';
            this.loginForm.style.display = 'block';
        });

        // 添加登出按鈕事件
        document.getElementById('logoutBtn').addEventListener('click', async (e) => {
            e.preventDefault();
            await this.handleLogout();
        });

        // 個人資料表單提交事件
        document.getElementById('profileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleProfileUpdate();
        });

        // 添加會員選項切換功能
        document.querySelectorAll('.member-option').forEach(option => {
            option.addEventListener('click', () => {
                this.switchDashboardContent(option.dataset.target);
            });
        });
    }

    async handleLogin() {
        try {
            const formData = {
                email: document.getElementById('loginEmail').value,
                password: document.getElementById('loginPassword').value
            };

            const response = await api.post('/auth/login', formData);
            
            if (response.token) {
                localStorage.setItem('token', response.token);
                this.loginSuccess(response.data);
            }
        } catch (error) {
            console.error('Login failed:', error);
            this.showNotification(error.message, 'error');
        }
    }

    loginSuccess(userData) {
        this.loginForm.style.display = 'none';
        this.registerForm.style.display = 'none';
        this.memberDashboard.style.display = 'block';

        // 更新會員資訊
        document.getElementById('memberName').textContent = userData.name;
        document.getElementById('memberLevel').textContent = userData.level;
        document.getElementById('memberPoints').textContent = userData.points;

        // 填充個人資料表單
        document.getElementById('profileName').value = userData.name;
        document.getElementById('profileEmail').value = userData.email;
        document.getElementById('profilePhone').value = userData.phone;
        document.getElementById('profileAddress').value = userData.address || '';

        this.showNotification('登入成功！');
        this.loadWishlist();
    }

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
    }

    switchToLogin() {
        this.registerForm.style.display = 'none';
        this.loginForm.style.display = 'block';
    }

    async handleLogout() {
        try {
            await api.post('/auth/logout');
            localStorage.removeItem('token');
            this.showNotification('登出成功！');
            
            // 重置顯示狀態
            this.memberDashboard.style.display = 'none';
            this.loginForm.style.display = 'block';
            
            // 清空表單
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
        } catch (error) {
            console.error('Logout failed:', error);
            this.showNotification(error.message, 'error');
        }
    }

    async handleProfileUpdate() {
        try {
            const formData = {
                name: document.getElementById('profileName').value,
                email: document.getElementById('profileEmail').value,
                phone: document.getElementById('profilePhone').value,
                address: document.getElementById('profileAddress').value
            };

            // 基本驗證
            if (!formData.name || !formData.email || !formData.phone) {
                throw new Error('請填寫必要欄位');
            }

            // 驗證電子郵件格式
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                throw new Error('請輸入有效的電子郵件地址');
            }

            // 驗證手機號碼格式
            const phoneRegex = /^09\d{8}$/;
            if (!phoneRegex.test(formData.phone)) {
                throw new Error('請輸入有效的手機號碼');
            }

            const response = await api.put('/auth/profile', formData);
            
            if (response.success) {
                this.showNotification('個人資料更新成功！');
                // 更新顯示的會員資訊
                document.getElementById('memberName').textContent = response.data.name;
            } else {
                throw new Error(response.error || '更新失敗');
            }
        } catch (error) {
            console.error('Profile update failed:', error);
            this.showNotification(error.message, 'error');
        }
    }

    switchDashboardContent(target) {
        // 隱藏所有內容
        document.querySelectorAll('.dashboard-content').forEach(content => {
            content.style.display = 'none';
        });
        
        // 顯示目標內容
        document.getElementById(target).style.display = 'block';
        
        // 更新選項的活動狀態
        document.querySelectorAll('.member-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.target === target) {
                option.classList.add('active');
            }
        });

        if (target === 'wishlist') {
            this.loadWishlist();
        }
    }

    async loadWishlist() {
        try {
            const response = await api.get('/wishlist');
            console.log('收藏清單響應:', response);
            this.wishlist = response.data;
            console.log('收藏清單資料:', this.wishlist);
            this.renderWishlist();
        } catch (error) {
            console.error('載入收藏清單失敗:', error);
            this.showNotification('載入收藏清單失敗', 'error');
        }
    }

    renderWishlist() {
        const wishlistGrid = document.querySelector('.wishlist-grid');
        wishlistGrid.innerHTML = '';

        this.wishlist.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'wishlist-item';
            productCard.innerHTML = `
                <img src="${product.images[0]}" alt="${product.name}">
                <h4>${product.name}</h4>
                <p>NT$ ${product.price}</p>
                <button class="add-to-cart-btn" data-id="${product._id}">
                    <i class="fas fa-shopping-cart"></i> 加入購物車
                </button>
                <button class="remove-wishlist-btn" data-id="${product._id}">
                    <i class="fas fa-trash"></i> 移除收藏
                </button>
            `;

            // 綁定按鈕事件
            const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
            const removeWishlistBtn = productCard.querySelector('.remove-wishlist-btn');

            addToCartBtn.addEventListener('click', () => this.addToCart(product._id));
            removeWishlistBtn.addEventListener('click', () => this.removeFromWishlist(product._id));

            wishlistGrid.appendChild(productCard);
        });
    }

    async removeFromWishlist(productId) {
        try {
            await api.delete(`/wishlist/${productId}`);
            this.wishlist = this.wishlist.filter(item => item._id !== productId);
            this.renderWishlist();
            this.showNotification('商品已從收藏清單中移除');
        } catch (error) {
            console.error('移除收藏失敗:', error);
            this.showNotification('移除收藏失敗', 'error');
        }
    }

    async addToCart(productId) {
        try {
            await api.post('/cart', { productId, quantity: 1 });
            this.showNotification('商品已加入購物車');
        } catch (error) {
            console.error('加入購物車失敗:', error);
            this.showNotification('加入購物車失敗', 'error');
        }
    }
}

// 初始化會員系統
document.addEventListener('DOMContentLoaded', () => {
    window.memberSystem = new MemberSystem();
}); 