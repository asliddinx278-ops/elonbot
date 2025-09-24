// Web App sozlamalari
let WebApp = window.Telegram.WebApp;

// Foydalanuvchi ma'lumotlari
let currentUser = null;
let userBalance = 0;
let freePostUsed = false;

// Web Appni sozlash
WebApp.ready();
WebApp.expand();

// Barcha sahifalarni yashirish
function hideAllPages() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
}

// Sahifa ko'rsatish
function showPage(pageId) {
    hideAllPages();
    document.getElementById(pageId).classList.add('active');
    
    // Agar e'lonlar sahifasiga o'tilsa, e'lonlarni yuklash
    if (pageId === 'main-page') {
        loadPosts();
    } else if (pageId === 'my-posts-page') {
        loadMyPosts();
    } else if (pageId === 'balance-page') {
        loadBalanceInfo();
    } else if (pageId === 'advertising-page') {
        loadMyPostsForAd();
    }
}

// Foydalanuvchi ma'lumotlarini yuklash
function loadUserInfo() {
    fetch('/api/user', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        currentUser = data;
        userBalance = data.balance || 0;
        freePostUsed = data.free_post_used || false;
        
        document.getElementById('username').textContent = data.first_name || 'Foydalanuvchi';
        document.getElementById('balance').textContent = `Hisob: ${userBalance} so'm`;
        document.getElementById('current-balance').textContent = userBalance;
        document.getElementById('free-post-status').textContent = freePostUsed ? 'ISHLATILGAN' : 'MAVJUD';
        document.getElementById('profile-name').textContent = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Foydalanuvchi';
        document.getElementById('profile-email').textContent = data.username ? `@${data.username}` : 'email@example.com';
        document.getElementById('profile-phone').textContent = '+998 XX XXX XX XX';
        document.getElementById('profile-location').textContent = 'Toshkent, Chilonzor';
    })
    .catch(error => {
        console.error('Error loading user info:', error);
    });
}

// E'lon joylash
function createPost() {
    const postType = document.getElementById('post-type').value;
    const category = document.getElementById('category').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const phone = document.getElementById('phone').value;
    const location = document.getElementById('location').value;
    const photo = document.getElementById('photo').files[0];

    if (!title || !description || !phone || !location) {
        alert('Iltimos, barcha majburiy maydonlarni to\'ldiring!');
        return;
    }

    // Narxni tekshirish
    let requiredAmount = 0;
    if (postType === 'premium') {
        const duration = document.getElementById('premium-duration').value;
        const durationMap = {3: 10000, 7: 15000, 30: 25000};
        requiredAmount = durationMap[duration] || 0;
    } else if (postType === 'vip') {
        requiredAmount = 19000;
    }

    if (requiredAmount > 0 && userBalance < requiredAmount) {
        alert(`Hisobingizda yetarli mablag' mavjud emas! Kerak: ${requiredAmount} so'm`);
        return;
    }

    const formData = new FormData();
    formData.append('post_type', postType);
    formData.append('category', category);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('phone', phone);
    formData.append('location', location);
    if (photo) formData.append('photo', photo);

    fetch('/api/posts', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('E\'loningiz qabul qilindi! Admin tekshirgach faollashtiriladi.');
            showPage('main-page');
        } else {
            alert('Xatolik yuz berdi: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error creating post:', error);
        alert('Xatolik yuz berdi, iltimos qaytadan urinib ko\'ring.');
    });
}

// Post turini yangilash
function updatePostType() {
    const type = document.getElementById('post-type').value;
    document.getElementById('premium-options').classList.toggle('hidden', type !== 'premium');
    document.getElementById('vip-options').classList.toggle('hidden', type !== 'vip');
}

// E'lonlarni yuklash
function loadPosts() {
    fetch('/api/posts')
    .then(response => response.json())
    .then(data => {
        const postsContainer = document.getElementById('posts-list');
        postsContainer.innerHTML = '';
        
        data.forEach(post => {
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    })
    .catch(error => {
        console.error('Error loading posts:', error);
    });
}

// Mening e'lonlarimni yuklash
function loadMyPosts() {
    fetch('/api/my-posts')
    .then(response => response.json())
    .then(data => {
        const postsContainer = document.getElementById('my-posts-list');
        postsContainer.innerHTML = '';
        
        if (data.length === 0) {
            postsContainer.innerHTML = '<p>Siz hali e\'lon joylamagansiz.</p>';
            return;
        }
        
        data.forEach(post => {
            const postElement = createPostElement(post, true);
            postsContainer.appendChild(postElement);
        });
    })
    .catch(error => {
        console.error('Error loading my posts:', error);
    });
}

// Reklama uchun e'lonlarni yuklash
function loadMyPostsForAd() {
    fetch('/api/my-posts')
    .then(response => response.json())
    .then(data => {
        const select = document.getElementById('ad-post-select');
        select.innerHTML = '<option value="">E\'lonlaringizni tanlang...</option>';
        
        data.forEach(post => {
            const option = document.createElement('option');
            option.value = post.id;
            option.textContent = post.title.substring(0, 30) + (post.title.length > 30 ? '...' : '');
            select.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error loading my posts for ad:', error);
    });
}

// E'lon elementini yaratish
function createPostElement(post, isMyPost = false) {
    const postElement = document.createElement('div');
    postElement.className = 'post-item';
    
    const typeEmoji = {"normal": "📝", "premium": "⭐", "vip": "💎"}[post.post_type] || "📝";
    const promoted = post.is_promoted ? "⬆️" : "";
    
    postElement.innerHTML = `
        <div class="post-header">
            <div class="post-title">${typeEmoji} ${promoted} ${post.title}</div>
            <div class="post-price">${post.price}</div>
        </div>
        <div class="post-body">${post.description.substring(0, 100)}...</div>
        <div class="post-meta">
            <span>📞 ${post.phone}</span>
            <span>📍 ${post.location}</span>
            <span>📅 ${new Date(post.created_at).toLocaleDateString()}</span>
        </div>
    `;
    
    return postElement;
}

// Qidiruv funksiyasi
function searchPosts() {
    const query = document.getElementById('search-input').value;
    if (!query) {
        loadPosts();
        return;
    }
    
    fetch(`/api/posts/search?q=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
        const postsContainer = document.getElementById('posts-list');
        postsContainer.innerHTML = '';
        
        if (data.length === 0) {
            postsContainer.innerHTML = '<p>Hech narsa topilmadi.</p>';
            return;
        }
        
        data.forEach(post => {
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    })
    .catch(error => {
        console.error('Error searching posts:', error);
    });
}

// Kategoriyalar bo'yicha filter
function filterByCategory(category) {
    if (!category) {
        loadPosts();
        return;
    }
    
    fetch(`/api/posts/category?category=${encodeURIComponent(category)}`)
    .then(response => response.json())
    .then(data => {
        const postsContainer = document.getElementById('posts-list');
        postsContainer.innerHTML = '';
        
        data.forEach(post => {
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    })
    .catch(error => {
        console.error('Error filtering posts:', error);
    });
}

// Reklama yaratish
function createAd() {
    const postId = document.getElementById('ad-post-select').value;
    const adType = document.getElementById('ad-type').value;
    const duration = document.getElementById('ad-duration').value;
    
    if (!postId) {
        alert('Iltimos, e\'lonni tanlang!');
        return;
    }
    
    // Reklama narxini aniqlash
    let adPrice = 0;
    if (adType === 'second_post') {
        adPrice = 2000;
    } else if (adType === 'promote') {
        adPrice = 1500;
    } else if (adType === 'top') {
        adPrice = 5000;
    }
    
    if (userBalance < adPrice) {
        alert(`Hisobingizda yetarli mablag' mavjud emas! Kerak: ${adPrice} so'm`);
        return;
    }
    
    const formData = new FormData();
    formData.append('post_id', postId);
    formData.append('ad_type', adType);
    formData.append('duration', duration);
    
    fetch('/api/advertisements', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Reklama muvaffaqiyatli yaratildi!');
            showPage('main-page');
        } else {
            alert('Xatolik yuz berdi: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error creating ad:', error);
        alert('Xatolik yuz berdi, iltimos qaytadan urinib ko\'ring.');
    });
}

// Hisob ma'lumotlarini yuklash
function loadBalanceInfo() {
    fetch('/api/user')
    .then(response => response.json())
    .then(data => {
        document.getElementById('current-balance').textContent = data.balance || 0;
        document.getElementById('free-post-status').textContent = (data.free_post_used ? 'ISHLATILGAN' : 'MAVJUD');
        
        // To'lov tarixini yuklash
        loadPaymentHistory();
    })
    .catch(error => {
        console.error('Error loading balance info:', error);
    });
}

// To'lov tarixini yuklash
function loadPaymentHistory() {
    fetch('/api/payments/history')
    .then(response => response.json())
    .then(data => {
        const historyContainer = document.getElementById('payment-history');
        historyContainer.innerHTML = '';
        
        if (data.length === 0) {
            historyContainer.innerHTML = '<p>To\'lov tarixi mavjud emas.</p>';
            return;
        }
        
        data.forEach(payment => {
            const record = document.createElement('div');
            record.className = 'payment-record';
            record.innerHTML = `
                <strong>${payment.amount} so'm</strong> - ${new Date(payment.created_at).toLocaleDateString()}
                <span style="float: right; color: ${payment.status === 'completed' ? 'green' : 'orange'}">
                    ${payment.status === 'completed' ? '✅' : '⏳'}
                </span>
            `;
            historyContainer.appendChild(record);
        });
    })
    .catch(error => {
        console.error('Error loading payment history:', error);
    });
}

// Chiqish
function logout() {
    alert('Chiqish amalga oshirildi!');
    // Haqiqiy loyihada foydalanuvchi ma'lumotlarini o'chirish kerak
    showPage('main-page');
}

// Dastlabki yuklash
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    showPage('main-page');
});
