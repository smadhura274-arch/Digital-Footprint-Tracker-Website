function toggleNotifications() {
    const dropdown = document.getElementById('notificationDropdown');
    if (!dropdown) return;
    dropdown.classList.toggle('active');
    if (dropdown.classList.contains('active')) {
        const badge = document.getElementById('notificationBadge');
        if (badge) badge.style.display = 'none';
    }
}

async function clearNotifications() {
    const token = localStorage.getItem('token');
    if (token) {
        await fetch('/api/dashboard/notifications/read-all', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }

    const list = document.getElementById('notificationList');
    if (!list) return;
    list.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--gray-color); font-size: 0.9rem;">No new notifications</div>';
    const badge = document.getElementById('notificationBadge');
    if (badge) badge.style.display = 'none';
}

async function fetchNotifications() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch('/api/dashboard/notifications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success && data.notifications.length > 0) {
            const list = document.getElementById('notificationList');
            const badge = document.getElementById('notificationBadge');
            const unreadCount = data.notifications.filter(n => !n.isRead).length;

            if (badge) {
                badge.style.display = unreadCount > 0 ? 'flex' : 'none';
                badge.innerText = unreadCount;
            }

            if (list) {
                list.innerHTML = data.notifications.map(n => `
                    <div class="notification-item ${n.isRead ? '' : 'unread'}" style="padding: 1rem; border-bottom: 1px solid var(--border-color);">
                        <div style="font-weight: 600; color: ${n.type === 'danger' ? 'var(--danger-color)' : 'inherit'};">${n.title}</div>
                        <div style="font-size: 0.85rem; color: var(--gray-color);">${n.message}</div>
                        <div style="font-size: 0.7rem; margin-top: 4px; color: var(--light-gray);">${new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                `).join('');
            }
        }
    } catch (err) {
        console.error('Failed to fetch notifications:', err);
    }
}

function initNotifications() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const userData = JSON.parse(userStr);
        const email = userData.email || 'user@example.com';
        const notifEmail = document.getElementById('notifEmail');
        if (notifEmail) notifEmail.innerText = email;
    }

    fetchNotifications();

    window.addEventListener('click', function (e) {
        const bell = document.getElementById('notificationBell');
        const dropdown = document.getElementById('notificationDropdown');
        if (bell && !bell.contains(e.target) && dropdown && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
}

window.updateNotifications = fetchNotifications;

document.addEventListener('DOMContentLoaded', initNotifications);
