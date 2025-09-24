// API URL (sizning backend URL)
const API_URL = 'https://your-telegram-bot-backend.herokuapp.com'; // Sizning hosting URL

// Admin panel funksiyalari
let currentSection = 'dashboard';

// Barcha sahifalarni yashirish
function hideAllSections() {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
}

// Sahifa ko'rsatish
function showSection(sectionId) {
    // Barcha nav-itemlarni olib tashlash
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Joriy nav-itemni aktiv qilish
    event.target.closest('.nav-item').classList.add('active');
    
    hideAllSections();
    document.getElementById(sectionId).classList.add('active');
    currentSection = sectionId;
    
    // Har bir sahifaga kirganda ma'lumotlarni yuklash
    switch(sectionId) {
        case 'dashboard':
            loadDashboardStats();
            loadRecentPosts();
            loadRecentPayments();
            break;
        case 'users':
            loadUsers();
            break;
        case 'posts':
            loadPosts();
            break;
        case 'payments':
            loadPayments();
            break;
        case 'advertisements':
            loadAds();
            break;
        case 'statistics':
            loadStatistics();
            break;
    }
}

// Dashboard statistikasini yuklash
function loadDashboardStats() {
    fetch(`${API_URL}/api/admin/stats`)
    .then(response => response.json())
    .then(data => {
        document.getElementById('total-users').textContent = data.total_users;
        document.getElementById('total-posts').textContent = data.total_posts;
        document.getElementById('total-revenue').textContent = formatCurrency(data.total_revenue);
        document.getElementById('total-payments').textContent = data.total_payments;
    })
    .catch(error => console.error('Error loading dashboard stats:', error));
}

// Yangi e'lonlarni yuklash
function loadRecentPosts() {
    fetch(`${API_URL}/api/admin/recent-posts`)
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('recent-posts-list');
        container.innerHTML = '';
        
        data.slice(0, 5).forEach(post => {
            const div = document.createElement('div');
            div.className = 'recent-item';
            div.innerHTML = `
                <div class="item-title">${post.title.substring(0, 50)}...</div>
                <div class="item-meta">
                    <span class="item-user">${post.user_name}</span>
                    <span class="item-date">${new Date(post.created_at).toLocaleDateString()}</span>
                    <span class="item-status">${post.status}</span>
                </div>
            `;
            container.appendChild(div);
        });
    })
    .catch(error => console.error('Error loading recent posts:', error));
}

// Yangi to'lovlarni yuklash
function loadRecentPayments() {
    fetch(`${API_URL}/api/admin/recent-payments`)
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('recent-payments-list');
        container.innerHTML = '';
        
        data.slice(0, 5).forEach(payment => {
            const div = document.createElement('div');
            div.className = 'recent-item';
            div.innerHTML = `
                <div class="item-title">${formatCurrency(payment.amount)} so'm</div>
                <div class="item-meta">
                    <span class="item-user">${payment.user_name}</span>
                    <span class="item-date">${new Date(payment.created_at).toLocaleDateString()}</span>
                    <span class="item-status">${payment.status}</span>
                </div>
            `;
            container.appendChild(div);
        });
    })
    .catch(error => console.error('Error loading recent payments:', error));
}

// Foydalanuvchilarni yuklash
function loadUsers() {
    fetch(`${API_URL}/api/admin/users`)
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';
        
        data.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>@${user.username || 'Noma\'lum'}</td>
                <td>${user.first_name} ${user.last_name || ''}</td>
                <td>${formatCurrency(user.balance)} so'm</td>
                <td>${user.post_count || 0}</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn success" onclick="showUserDetails(${user.id})">Tafsilot</button>
                    <button class="btn warning" onclick="editUserBalance(${user.id})">Hisob</button>
                    <button class="btn danger" onclick="deleteUser(${user.id})">O'chirish</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    })
    .catch(error => console.error('Error loading users:', error));
}

// E'lonlarni yuklash
function loadPosts() {
    fetch(`${API_URL}/api/admin/posts`)
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('posts-table-body');
        tbody.innerHTML = '';
        
        data.forEach(post => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${post.id}</td>
                <td>${post.title.substring(0, 30)}...</td>
                <td>${post.category}</td>
                <td>${post.user_name}</td>
                <td><span class="status-${post.status}">${post.status}</span></td>
                <td>${new Date(post.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn success" onclick="approvePost(${post.id})">Faollashtirish</button>
                    <button class="btn danger" onclick="rejectPost(${post.id})">O'chirish</button>
                    <button class="btn warning" onclick="editPost(${post.id})">Tahrirlash</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    })
    .catch(error => console.error('Error loading posts:', error));
}

// To'lovlarni yuklash
function loadPayments() {
    fetch(`${API_URL}/api/admin/payments`)
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('payments-table-body');
        tbody.innerHTML = '';
        
        data.forEach(payment => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${payment.id}</td>
                <td>${payment.user_name}</td>
                <td>${formatCurrency(payment.amount)} so'm</td>
                <td><button class="btn" onclick="showPaymentCheck('${payment.check_photo}')">Chak</button></td>
                <td><span class="status-${payment.status}">${payment.status}</span></td>
                <td>${new Date(payment.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn success" onclick="approvePayment(${payment.id})">Tasdiqlash</button>
                    <button class="btn danger" onclick="rejectPayment(${payment.id})">Rad etish</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    })
    .catch(error => console.error('Error loading payments:', error));
}

// Reklamalarni yuklash
function loadAds() {
    fetch(`${API_URL}/api/admin/advertisements`)
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('ads-table-body');
        tbody.innerHTML = '';
        
        data.forEach(ad => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${ad.id}</td>
                <td>${ad.post_title.substring(0, 30)}...</td>
                <td>${ad.ad_type}</td>
                <td>${ad.user_name}</td>
                <td>${ad.duration} kun</td>
                <td><span class="status-${ad.status}">${ad.status}</span></td>
                <td>${new Date(ad.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn success" onclick="extendAd(${ad.id})">Kengaytirish</button>
                    <button class="btn danger" onclick="cancelAd(${ad.id})">Bekor qilish</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    })
    .catch(error => console.error('Error loading ads:', error));
}

// Statistika yuklash
function loadStatistics() {
    fetch(`${API_URL}/api/admin/statistics`)
    .then(response => response.json())
    .then(data => {
        document.getElementById('stat-users').textContent = data.total_users;
        document.getElementById('stat-posts').textContent = data.total_posts;
        document.getElementById('stat-revenue').textContent = formatCurrency(data.total_revenue);
        document.getElementById('stat-payments').textContent = data.total_payments;
        
        // Grafik chizish
        drawPostsChart(data.posts_chart_data);
    })
    .catch(error => console.error('Error loading statistics:', error));
}

// Foydalanuvchi tafsilotlarini ko'rsatish
function showUserDetails(userId) {
    fetch(`${API_URL}/api/admin/user/${userId}`)
    .then(response => response.json())
    .then(user => {
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <h3>Foydalanuvchi tafsilotlari</h3>
            <p><strong>ID:</strong> ${user.id}</p>
            <p><strong>Foydalanuvchi:</strong> @${user.username || 'Noma\'lum'}</p>
            <p><strong>Ism:</strong> ${user.first_name} ${user.last_name || ''}</p>
            <p><strong>Hisob:</strong> ${formatCurrency(user.balance)} so'm</p>
            <p><strong>E'lonlar soni:</strong> ${user.post_count || 0}</p>
            <p><strong>Ro'yxatdan o'tgan:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
            <p><strong>Bepul e'lon ishlatilgan:</strong> ${user.free_post_used ? 'Ha' : 'Yo\'q'}</p>
        `;
        document.getElementById('modal').style.display = 'block';
    })
    .catch(error => console.error('Error loading user details:', error));
}

// Foydalanuvchi hisobini tahrirlash
function editUserBalance(userId) {
    const newBalance = prompt('Yangi hisob qiymatini kiriting:');
    if (newBalance !== null) {
        fetch(`${API_URL}/api/admin/user/${userId}/balance`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({balance: parseInt(newBalance)})
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Hisob muvaffaqiyatli o\'zgartirildi!');
                loadUsers(); // Yangilash
            } else {
                alert('Xatolik: ' + data.message);
            }
        })
        .catch(error => console.error('Error updating user balance:', error));
    }
}

// E'lonni tasdiqlash
function approvePost(postId) {
    if (confirm('E\'lonni faollashtirmoqchimisiz?')) {
        fetch(`${API_URL}/api/admin/post/${postId}/approve`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('E\'lon faollashtirildi!');
                loadPosts(); // Yangilash
            } else {
                alert('Xatolik: ' + data.message);
            }
        })
        .catch(error => console.error('Error approving post:', error));
    }
}

// E'lonni rad etish
function rejectPost(postId) {
    if (confirm('E\'lonni o\'chirmoqchimisiz?')) {
        fetch(`${API_URL}/api/admin/post/${postId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('E\'lon o\'chirildi!');
                loadPosts(); // Yangilash
            } else {
                alert('Xatolik: ' + data.message);
            }
        })
        .catch(error => console.error('Error rejecting post:', error));
    }
}

// To'lovni tasdiqlash
function approvePayment(paymentId) {
    if (confirm('To\'lovni tasdiqlamoqchimisiz?')) {
        fetch(`${API_URL}/api/admin/payment/${paymentId}/approve`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('To\'lov tasdiqlandi!');
                loadPayments(); // Yangilash
            } else {
                alert('Xatolik: ' + data.message);
            }
        })
        .catch(error => console.error('Error approving payment:', error));
    }
}

// To'lovni rad etish
function rejectPayment(paymentId) {
    if (confirm('To\'lovni rad etmoqchimisiz?')) {
        fetch(`${API_URL}/api/admin/payment/${paymentId}/reject`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('To\'lov rad etildi!');
                loadPayments(); // Yangilash
            } else {
                alert('Xatolik: ' + data.message);
            }
        })
        .catch(error => console.error('Error rejecting payment:', error));
    }
}

// Xabar yuborish
function sendBroadcast() {
    const type = document.getElementById('broadcast-type').value;
    const message = document.getElementById('broadcast-message').value;
    const target = document.getElementById('broadcast-target').value;
    
    if (!message) {
        alert('Xabar matnini kiriting!');
        return;
    }
    
    fetch(`${API_URL}/api/admin/broadcast`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            type: type,
            message: message,
            target: target
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Xabar yuborildi!');
            document.getElementById('broadcast-message').value = '';
        } else {
            alert('Xatolik: ' + data.message);
        }
    })
    .catch(error => console.error('Error sending broadcast:', error));
}

// Sozlamalarni saqlash
function saveSettings() {
    const botName = document.getElementById('bot-name').value;
    const botDescription = document.getElementById('bot-description').value;
    const secondPostPrice = document.getElementById('second-post-price').value;
    const promotePrice = document.getElementById('promote-price').value;
    const topAdPrice = document.getElementById('top-ad-price').value;
    
    fetch(`${API_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            bot_name: botName,
            bot_description: botDescription,
            prices: {
                second_post: parseInt(secondPostPrice),
                promote: parseInt(promotePrice),
                top_ad: parseInt(topAdPrice)
            }
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Sozlamalar saqlandi!');
        } else {
            alert('Xatolik: ' + data.message);
        }
    })
    .catch(error => console.error('Error saving settings:', error));
}

// Pul formatlash
function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU').format(amount);
}

// Modal oynani yopish
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Qidiruv funksiyalari
function searchUsers() {
    const query = document.getElementById('user-search').value;
    fetch(`${API_URL}/api/admin/users?search=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';
        
        data.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>@${user.username || 'Noma\'lum'}</td>
                <td>${user.first_name} ${user.last_name || ''}</td>
                <td>${formatCurrency(user.balance)} so'm</td>
                <td>${user.post_count || 0}</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn success" onclick="showUserDetails(${user.id})">Tafsilot</button>
                    <button class="btn warning" onclick="editUserBalance(${user.id})">Hisob</button>
                    <button class="btn danger" onclick="deleteUser(${user.id})">O'chirish</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    })
    .catch(error => console.error('Error searching users:', error));
}

function searchPosts() {
    const query = document.getElementById('post-search').value;
    const status = document.getElementById('post-status').value;
    let url = `${API_URL}/api/admin/posts?search=${encodeURIComponent(query)}`;
    if (status) url += `&status=${status}`;
    
    fetch(url)
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('posts-table-body');
        tbody.innerHTML = '';
        
        data.forEach(post => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${post.id}</td>
                <td>${post.title.substring(0, 30)}...</td>
                <td>${post.category}</td>
                <td>${post.user_name}</td>
                <td><span class="status-${post.status}">${post.status}</span></td>
                <td>${new Date(post.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn success" onclick="approvePost(${post.id})">Faollashtirish</button>
                    <button class="btn danger" onclick="rejectPost(${post.id})">O'chirish</button>
                    <button class="btn warning" onclick="editPost(${post.id})">Tahrirlash</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    })
    .catch(error => console.error('Error searching posts:', error));
}

function searchPayments() {
    const query = document.getElementById('payment-search').value;
    const status = document.getElementById('payment-status').value;
    let url = `${API_URL}/api/admin/payments?search=${encodeURIComponent(query)}`;
    if (status) url += `&status=${status}`;
    
    fetch(url)
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('payments-table-body');
        tbody.innerHTML = '';
        
        data.forEach(payment => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${payment.id}</td>
                <td>${payment.user_name}</td>
                <td>${formatCurrency(payment.amount)} so'm</td>
                <td><button class="btn" onclick="showPaymentCheck('${payment.check_photo}')">Chak</button></td>
                <td><span class="status-${payment.status}">${payment.status}</span></td>
                <td>${new Date(payment.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn success" onclick="approvePayment(${payment.id})">Tasdiqlash</button>
                    <button class="btn danger" onclick="rejectPayment(${payment.id})">Rad etish</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    })
    .catch(error => console.error('Error searching payments:', error));
}

function searchAds() {
    const query = document.getElementById('ad-search').value;
    const type = document.getElementById('ad-type').value;
    let url = `${API_URL}/api/admin/advertisements?search=${encodeURIComponent(query)}`;
    if (type) url += `&type=${type}`;
    
    fetch(url)
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('ads-table-body');
        tbody.innerHTML = '';
        
        data.forEach(ad => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${ad.id}</td>
                <td>${ad.post_title.substring(0, 30)}...</td>
                <td>${ad.ad_type}</td>
                <td>${ad.user_name}</td>
                <td>${ad.duration} kun</td>
                <td><span class="status-${ad.status}">${ad.status}</span></td>
                <td>${new Date(ad.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn success" onclick="extendAd(${ad.id})">Kengaytirish</button>
                    <button class="btn danger" onclick="cancelAd(${ad.id})">Bekor qilish</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    })
    .catch(error => console.error('Error searching ads:', error));
}

// Grafik chizish (Chart.js kerak bo'ladi)
function drawPostsChart(data) {
    // Bu yerda Chart.js yoki boshqa grafik kutubxonasi ishlatiladi
    // Hozircha oddiy logika
    console.log('Posts chart data:', data);
}

// Dastlabki yuklash
document.addEventListener('DOMContentLoaded', function() {
    // Admin autentifikatsiyasi (sizning autentifikatsiya logikangiz)
    const adminKey = localStorage.getItem('admin_key');
    if (!adminKey) {
        const key = prompt('Admin kalit so\'zingizni kiriting:');
        if (key === 'admin123') { // Sizning kalitingiz
            localStorage.setItem('admin_key', key);
            showSection('dashboard');
        } else {
            alert('Noto\'g\'ri kalit so\'z!');
            document.body.innerHTML = '<h1>Admin panelga kirish huquqi yo\'q</h1>';
        }
    } else {
        showSection('dashboard');
    }
});







