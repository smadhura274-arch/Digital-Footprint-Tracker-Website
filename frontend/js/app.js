// ==================== MOBILE NAVIGATION ====================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        const navLinks = document.querySelector('.nav-links');
        const navAuth = document.querySelector('.nav-auth');

        if (navLinks) navLinks.classList.toggle('active');
        if (navAuth) navAuth.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// ==================== NAVBAR SCROLL EFFECT ====================
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// ==================== BACK TO TOP BUTTON ====================
const backToTop = document.getElementById('backToTop');
if (backToTop) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.style.display = 'flex';
        } else {
            backToTop.style.display = 'none';
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ==================== ANIMATED COUNTER ====================
function animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');

    statNumbers.forEach(el => {
        const target = parseInt(el.getAttribute('data-count'));
        if (target && !el.dataset.animated) {
            el.dataset.animated = 'true';
            let current = 0;
            const increment = target / 50;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    el.textContent = target.toLocaleString();
                    clearInterval(timer);
                } else {
                    el.textContent = Math.floor(current).toLocaleString();
                }
            }, 20);
        }
    });
}

// ==================== TOAST NOTIFICATION ====================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');

    // Inline styles for priority visibility and layout
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 500;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;

    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> <span>${message}</span>`;
    document.body.appendChild(toast);

    // Trigger animation in
    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });

    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// ==================== INTERSECTION OBSERVER FOR COUNTERS ====================
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateNumbers();
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const statsSection = document.querySelector('.hero-stats');
if (statsSection) {
    observer.observe(statsSection);
}

// ==================== FAQ ACCORDION ====================
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        const icon = question.querySelector('i');

        // Close other open FAQs
        document.querySelectorAll('.faq-answer').forEach(otherAnswer => {
            if (otherAnswer !== answer && otherAnswer.style.display === 'block') {
                otherAnswer.style.display = 'none';
                const otherIcon = otherAnswer.previousElementSibling.querySelector('i');
                if (otherIcon) otherIcon.style.transform = 'rotate(0)';
            }
        });

        // Toggle current FAQ
        if (answer.style.display === 'block') {
            answer.style.display = 'none';
            if (icon) icon.style.transform = 'rotate(0)';
        } else {
            answer.style.display = 'block';
            if (icon) icon.style.transform = 'rotate(180deg)';
        }
    });
});

// ==================== SMOOTH SCROLL FOR ANCHOR LINKS ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ==================== CONTACT FORM HANDLER ====================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    });
}

// ==================== MODAL HANDLERS ====================
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'block';
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

// Close modals when pressing Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    }
});

// ==================== AUTHENTICATION LOGIC ====================
const Auth = {
    isLoggedIn: () => {
        return localStorage.getItem('isLoggedIn') === 'true' || sessionStorage.getItem('isLoggedIn') === 'true';
    },

    checkAccess: () => {
        const protectedPages = ['dashboard.html', 'scan.html', 'report.html', 'profile.html', 'settings.html'];
        const currentPage = window.location.pathname.split('/').pop();

        if (protectedPages.includes(currentPage)) {
            if (!Auth.isLoggedIn()) {
                const isPagesFolder = window.location.pathname.includes('/pages/');
                window.location.href = isPagesFolder ? 'login.html' : 'pages/login.html';
                return;
            }

            // Workspace Isolation: If the logged-in user identity has changed, clear existing local data
            const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (userStr) {
                const currentUser = JSON.parse(userStr);
                const lastUserEmail = localStorage.getItem('dft_active_session_owner');
                if (lastUserEmail !== currentUser.email) {
                    localStorage.removeItem('scans');
                    localStorage.removeItem('socialHandles');
                    localStorage.removeItem('userSettings');
                    localStorage.removeItem('scanning_platforms');
                    console.log('User context changed. Cleared previous workspace data for privacy.');
                }
                localStorage.setItem('dft_active_session_owner', currentUser.email);
            }
        }
    },

    updateNav: () => {
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');

        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (signupBtn) signupBtn.style.display = 'inline-flex';
    },

    login: async (email, password, remember, captchaResponse) => {
        try {
            // Assuming a login API endpoint exists on the backend
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, captchaResponse })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user', JSON.stringify(data.user)); // Assuming API returns user data
            localStorage.setItem('token', data.token); // Assuming API returns a token

            const isPagesFolder = window.location.pathname.includes('/pages/');
            window.location.href = isPagesFolder ? 'dashboard.html' : 'pages/dashboard.html';

        } catch (error) {
            console.error('Login error:', error);
            alert(error.message || 'An unexpected error occurred during login.');
        }
    },

    signup: async (userData, captchaResponse) => {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...userData, captchaResponse })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || (data.errors && data.errors[0] && data.errors[0].message) || 'Failed to create account.');
            }

            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);

            alert('Account created successfully!');
            const isPagesFolder = window.location.pathname.includes('/pages/');
            window.location.href = isPagesFolder ? 'dashboard.html' : 'pages/dashboard.html';

        } catch (error) {
            console.error('Signup error:', error);
            alert(error.message || 'An unexpected error occurred during signup.');
        }
    },

    logout: async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
        } catch (_) { /* silent — clear session regardless */ } finally {
            [localStorage, sessionStorage].forEach(s => {
                s.removeItem('isLoggedIn');
                s.removeItem('user');
                s.removeItem('token');
                s.removeItem('dft_user');
                s.removeItem('dft_user_name');
                s.removeItem('dft_scan_name');
                s.removeItem('dft_active_session_owner'); // Clear workspace context
            });
            const isPagesFolder = window.location.pathname.includes('/pages/');
            window.location.href = isPagesFolder ? 'login.html' : 'pages/login.html';
        }
    }
};
window.Auth = Auth;

// ==================== CAPTCHA UTILITY ====================
const Captcha = {
    _codes: {},
    generate: (containerId, formId) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        let code = '';
        for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
        Captcha._codes[formId] = code;
        container.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; background:#f3f4f6; padding:10px; border-radius:6px; border:1px solid #ddd; user-select:none; margin-bottom:15px;">
                <span style="font-family:'Courier New', monospace; font-weight:bold; font-size:1.3rem; letter-spacing:4px; font-style:italic; color:#4b5563; text-decoration:line-through;">${code}</span>
                <button type="button" onclick="Captcha.generate('${containerId}', '${formId}')" style="background:none; border:none; color:#9ca3af; cursor:pointer;" title="Refresh Captcha"><i class="fas fa-sync-alt"></i></button>
            </div>`;
    },
    validate: (formId, userValue) => {
        return userValue && userValue.toUpperCase() === Captcha._codes[formId];
    }
};
window.Captcha = Captcha;

Auth.checkAccess();
Auth.updateNav();

// Toggle Password Visibility
function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
        icon.closest('button')?.setAttribute('aria-label', 'Hide password');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
        icon.closest('button')?.setAttribute('aria-label', 'Show password');
    }
}

// Password Strength Validator
function checkPasswordStrength(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

function getPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (!password) return { score: 0, label: 'Start typing', className: '' };
    if (score <= 2) return { score, label: 'Weak', className: 'weak' };
    if (score <= 4) return { score, label: 'Good', className: 'good' };
    return { score, label: 'Strong', className: 'strong' };
}

function updatePasswordStrength(password) {
    const meter = document.getElementById('passwordStrength');
    if (!meter) return;

    const strength = getPasswordStrength(password);
    const bar = meter.querySelector('.strength-track span');
    const label = meter.querySelector('strong');
    const width = Math.max((strength.score / 5) * 100, password ? 18 : 0);

    meter.className = `password-strength ${strength.className}`;
    bar.style.width = `${width}%`;
    label.textContent = strength.label;
}

function validateAuthField(input) {
    const group = input.closest('.input-group');
    if (!group) return true;

    const hint = group.querySelector('.field-hint');
    let isValid = true;
    let message = '';
    const value = input.value.trim();

    if (!value) {
        isValid = false;
        message = 'This field is required.';
    } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        isValid = false;
        message = 'Enter a valid email address.';
    } else if (input.id === 'signupPassword' && !checkPasswordStrength(input.value)) {
        isValid = false;
        message = 'Use 8+ characters with uppercase, lowercase, number, and symbol.';
    } else if (input.id === 'loginPassword' && input.value.length < 4) {
        isValid = false;
        message = 'Enter your password.';
    } else if (input.id === 'fullName' && value.length < 2) {
        isValid = false;
        message = 'Enter your full name.';
    }

    group.classList.toggle('is-valid', isValid);
    group.classList.toggle('is-invalid', !isValid);
    if (hint) hint.textContent = message;
    return isValid;
}

function validateAuthForm(form) {
    const inputs = form.querySelectorAll('input[required]:not([type="checkbox"])');
    let isValid = true;
    inputs.forEach(input => {
        if (!validateAuthField(input)) isValid = false;
    });
    return isValid;
}

document.querySelectorAll('.auth-form input[required]:not([type="checkbox"])').forEach(input => {
    input.addEventListener('input', () => validateAuthField(input));
    input.addEventListener('blur', () => validateAuthField(input));
});

// ==================== AUTH FORM SUBMISSION HANDLERS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize CAPTCHAs if containers exist
    Captcha.generate('signupCaptchaContainer', 'signupForm');
    Captcha.generate('loginCaptchaContainer', 'loginForm');

    const loginForm = document.getElementById('loginForm');

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!validateAuthForm(signupForm)) return alert('Please correct the errors in the form.');

            const captchaInput = document.getElementById('signupCaptchaInput')?.value;
            if (!Captcha.validate('signupForm', captchaInput)) {
                alert('Invalid CAPTCHA code. Please try again.');
                Captcha.generate('signupCaptchaContainer', 'signupForm');
                return;
            }

            const fullName = document.getElementById('fullName')?.value;
            const email = document.getElementById('signupEmail')?.value;
            const password = document.getElementById('signupPassword')?.value;

            if (fullName && email && password) {
                await Auth.signup({ fullName, email, password }, captchaInput.toUpperCase());
            } else {
                alert('Please fill in all required fields for signup.');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!validateAuthForm(loginForm)) return alert('Please correct the errors in the form.');

            const captchaInput = document.getElementById('loginCaptchaInput')?.value;
            if (!Captcha.validate('loginForm', captchaInput)) {
                alert('Invalid CAPTCHA code. Please try again.');
                Captcha.generate('loginCaptchaContainer', 'loginForm');
                return;
            }

            const email = document.getElementById('loginEmail')?.value;
            const password = document.getElementById('loginPassword')?.value;

            if (email && password) {
                await Auth.login(email, password, false, captchaInput.toUpperCase());
                // Explicitly clear password from the DOM to remove sensitive trace
                const passInput = document.getElementById('loginPassword');
                if (passInput) passInput.value = '';
                Captcha.generate('loginCaptchaContainer', 'loginForm');
            } else {
                alert('Please enter your email and password.');
            }
        });
    }
});

// ==================== NEWSLETTER FORM HANDLER ====================
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input').value;
        alert(`Success! ${email} has been subscribed to our privacy newsletter.`);
        newsletterForm.reset();
    });
}

/**
 * Filters the scans table based on the search input.
 * Connects to the dashboard search functionality.
 */
function filterScansTable() {
    const query = document.getElementById('scanSearchInput')?.value.toLowerCase() || '';
    const scans = JSON.parse(localStorage.getItem('scans') || '[]');
    const tbody = document.getElementById('scansTableBody');

    if (!tbody) return;

    const filteredScans = scans.filter(s => {
        const dateMatch = formatDate(s.createdAt || s.date).toLowerCase().includes(query);
        const riskMatch = (s.riskLevel || '').toLowerCase().includes(query);
        const detailMatch = getScanMatches(query, s);

        return !query || dateMatch || riskMatch || detailMatch;
    });

    if (filteredScans.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem;">No matching scans found</td></tr>`;
        return;
    }

    renderScansTable(filteredScans);
}
window.filterScansTable = filterScansTable;

// ==================== LOCAL STORAGE UTILITIES ====================
const Storage = {
    getScans: () => JSON.parse(localStorage.getItem('scans') || '[]'),

    saveScan: (scan) => {
        const scans = Storage.getScans();
        scans.unshift(scan);
        localStorage.setItem('scans', JSON.stringify(scans));
    },

    getSocialHandles: () => JSON.parse(localStorage.getItem('socialHandles') || '{}'),

    saveSocialHandles: (handles) => {
        localStorage.setItem('socialHandles', JSON.stringify(handles));
    },
};

function renderScansTable(scans = []) {
    const tbody = document.getElementById('scansTableBody');
    if (!tbody) return;

    if (!Array.isArray(scans) || scans.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="6" style="text-align:center; padding:2rem;">No recent scans available.</td></tr>
        `;
        return;
    }

    tbody.innerHTML = scans.slice(0, 5).map(scan => {
        const detailItems = Array.isArray(scan.details) ? scan.details : (Array.isArray(scan.findings) ? scan.findings : []);
        const scanPlatforms = Array.isArray(scan.platforms)
            ? scan.platforms
            : (detailItems.length > 0 ? [...new Set(detailItems.map(f => (f.platform || f.name || '').toString()).filter(Boolean))] : []);

        const findingsCount = Number.isFinite(Number(scan.totalFindings))
            ? scan.totalFindings
            : (Array.isArray(detailItems) ? detailItems.length : Number(scan.findings) || 0);

        const riskLevel = scan.riskLevel ? scan.riskLevel.toLowerCase() : 'low';
        const score = Number.isFinite(Number(scan.privacyScore)) ? scan.privacyScore : 0;
        const formattedDate = scan.createdAt ? formatDate(scan.createdAt) : formatDate(scan.date || new Date());

        const scanId = scan._id || scan.id || scan.createdAt || scan.date;

        return `
            <tr onclick="window.openScanReport('${scanId}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();window.openScanReport('${scanId}');}" tabindex="0" role="button">
                <td style="font-weight: 600; color: var(--dark-color);">${formattedDate}</td>
                <td style="max-width: 200px;">
                    ${scanPlatforms.length ? scanPlatforms.map(p => `
                        <span style="display:inline-flex; align-items:center; gap:0.3rem; background: rgba(67, 97, 238, 0.08); color: var(--blue-color); padding:0.3rem 0.6rem; border-radius:8px; font-size:0.72rem; margin:2px; font-weight: 600; border: 1px solid rgba(67, 97, 238, 0.1);">
                            <i class="fab fa-${getPlatformIcon(p)}" style="font-size: 0.8rem;"></i> ${p}
                        </span>
                    `).join('') : 'N/A'}
                </td>
                <td style="color: var(--gray-color); font-weight: 500;">${findingsCount} findings</td>
                <td><span style="display:inline-flex; align-items:center; gap:0.4rem; padding:0.4rem 0.9rem; border-radius:20px; background:${getRiskColor(riskLevel)}15; color:${getRiskColor(riskLevel)}; font-weight:800; font-size: 0.75rem; letter-spacing: 0.5px; border: 1px solid ${getRiskColor(riskLevel)}30;">${riskLevel.toUpperCase()}</span></td>
                <td style="font-weight: 800; color: var(--secondary-color);">${score}/100</td>
                <td>
                    <div style="display:flex; gap:0.75rem; justify-content:flex-end; align-items:center;">
                        <button type="button" onclick="event.stopPropagation(); window.openScanReport('${scanId}')" class="btn-action btn-view" title="View Full Report" aria-label="View scan report">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button type="button" onclick="event.stopPropagation(); window.deleteScan('${scanId}')" class="btn-action btn-delete" title="Delete Scan History" aria-label="Delete scan report">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function getScanMatches(search, scan) {
    const query = search.toLowerCase();
    const platforms = Array.isArray(scan.platforms) ? scan.platforms : [];
    const findings = Array.isArray(scan.findings) ? scan.findings : (Array.isArray(scan.details) ? scan.details : []);

    const platformMatch = platforms.some(p => p.toLowerCase().includes(query));
    const riskMatch = (scan.riskLevel || '').toLowerCase().includes(query);
    const detailMatch = findings.some(f => (f.platform || '').toLowerCase().includes(query) || (f.details || '').toLowerCase().includes(query));

    return platformMatch || riskMatch || detailMatch;
}

/**
 * Clears all scan data globally (Backend + Local Storage)
 */
async function clearAllScansGlobally() {
    try {
        const token = localStorage.getItem('token');
        if (token) {
            const response = await fetch('/api/scan/admin/clear-all', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
        }

        // Clear local cache and cached dashboard data for the active user session
        localStorage.removeItem('scans');
        localStorage.removeItem('dashboard_stats');

        const searchInput = document.getElementById('scanSearchInput');
        if (searchInput) searchInput.value = '';
        if (typeof renderScansTable === 'function') {
            renderScansTable([]);
        } else if (typeof filterScansTable === 'function') {
            filterScansTable();
        }

        showToast('Global scan history has been cleared system-wide.');

        // Force immediate UI synchronization
        if (typeof updateDashboardStats === 'function') updateDashboardStats();
        if (typeof window.updateNotifications === 'function') window.updateNotifications();
        
    } catch (error) {
        console.error('Cleanup failed:', error);
        showToast('Failed to clear global scans', 'error');
    }
}

// ==================== DEMO DATA INITIALIZATION ====================
function initDemoData() {
    if (!localStorage.getItem('scans')) {
        const demoscans = [
            { date: '2024-01-15', findings: 12, riskLevel: 'low', privacyScore: 92, riskCount: 8 },
            { date: '2024-01-20', findings: 8, riskLevel: 'low', privacyScore: 94, riskCount: 5 },
            { date: '2024-01-25', findings: 15, riskLevel: 'medium', privacyScore: 88, riskCount: 12 },
            { date: '2024-02-01', findings: 10, riskLevel: 'low', privacyScore: 91, riskCount: 7 },
            { date: '2024-02-10', findings: 18, riskLevel: 'medium', privacyScore: 85, riskCount: 14 }
        ];
        localStorage.setItem('scans', JSON.stringify(demoscans));
    }
}

// Initialize demo data on landing page
if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    initDemoData();
}

// ==================== PAGE SPECIFIC INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Add active class to current nav link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Auto-refresh Dashboard Data on load if the user is authenticated
    const isDashboard = currentPage === 'dashboard.html' || currentPage === 'index.html';
    if (isDashboard && Auth.isLoggedIn()) {
        updateDashboardStats();
    }

    // Animation on scroll for feature cards
    const featureCards = document.querySelectorAll('.feature-card, .testimonial-card');
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        cardObserver.observe(card);
    });
});

// ==================== UTILITY FUNCTIONS ====================
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getRiskColor(riskLevel) {
    switch (riskLevel.toLowerCase()) {
        case 'high': return '#ff6b6b';
        case 'medium': return '#ffd93d';
        default: return '#00c9a7';
    }
}

/**
 * Refreshes dashboard statistics by fetching the latest data from the server
 * and triggering the counter animation.
 */
async function updateDashboardStats() {
    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch('/api/dashboard/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('dashboard_stats', JSON.stringify(data.stats));
            const statsMap = {
                'totalScans': data.stats.totalScans,
                'privacyScore': data.stats.privacyScore || 0,
                'riskCount': data.stats.totalRisks,
                'socialAccounts': data.stats.socialAccountsTracked
            };

            Object.entries(statsMap).forEach(([id, value]) => {
                const el = document.getElementById(id);
                if (el) {
                    el.setAttribute('data-count', value);
                    delete el.dataset.animated; // Reset flag to allow re-animation
                }
            });
            animateNumbers();

            // Update Risk Management / Distribution Chart
            const riskChart = window.riskChartInstance;
            if (riskChart && data.stats.riskDistribution) {
                const dist = data.stats.riskDistribution;
                
                // Enhanced Fluctuation: Trigger a "vibrant pulse" with glow on stats cards
                const riskEl = document.getElementById('riskCount');
                const riskCard = riskEl ? riskEl.closest('.stat-card') : null;
                if (riskCard) {
                    riskCard.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    riskCard.style.transform = 'scale(1.1) translateY(-10px)';
                    riskCard.style.boxShadow = '0 25px 50px rgba(157, 78, 221, 0.3), 0 0 20px rgba(255, 77, 148, 0.2)';
                    setTimeout(() => {
                        riskCard.style.transform = 'scale(1) translateY(0)';
                        riskCard.style.boxShadow = '';
                    }, 600);
                }

                riskChart.data.datasets[0].data = [dist.low || 0, dist.medium || 0, dist.high || 0];
                
                // Include dynamic labels with percentage details
                const total = (dist.low || 0) + (dist.medium || 0) + (dist.high || 0);
                const getPerc = (val) => total > 0 ? Math.round((val / total) * 100) : 0;

                riskChart.data.labels = [
                    `Secure (${dist.low || 0}) • ${getPerc(dist.low)}%`,
                    `Exposed (${dist.medium || 0}) • ${getPerc(dist.medium)}%`,
                    `Critical (${dist.high || 0}) • ${getPerc(dist.high)}%`
                ];
                
                // Elastic update animation for a bouncy, reactive feel
                if (riskChart.options.animation) {
                    riskChart.options.animation.animateScale = true;
                }
                riskChart.update({
                    duration: 1800,
                    easing: 'easeOutElastic'
                });
            }
        }

        // Fetch and update Privacy Score Trend Chart
        const trendChart = window.trendChartInstance;
        if (trendChart) {
            const trendRes = await fetch('/api/dashboard/trend', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const trendData = await trendRes.json();
            if (trendData.success && trendData.trend.length > 0) {
                // Re-connect Privacy Score Trend Chart with live data points
                const labels = trendData.trend.map(t => formatDate(t.date));
                const scores = trendData.trend.map(t => t.score);
                trendChart.data.labels = labels;
                trendChart.data.datasets[0].data = scores;
                trendChart.update({
                    duration: 1500,
                    easing: 'easeInOutQuart'
                });
            }
        }

        // Fetch and update Recent Scans Table
        const historyRes = await fetch('/api/scan/history?limit=5', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const tbody = document.getElementById('scansTableBody');

        // Show loading indicator before fetching history
        if (tbody) {
            tbody.innerHTML = `
                <tr id="scansLoadingRow"><td colspan="6" style="text-align:center; padding:2rem;"><div class="spinner" style="margin: 0 auto 10px;"></div><p>Loading recent scans...</p></td></tr>
            `;
        }

        const historyData = await historyRes.json();

        if (historyData.success && tbody) {
            localStorage.setItem('scans', JSON.stringify(historyData.scans));
            renderScansTable(historyData.scans);

            // Re-hydrate dashboard cards/charts with fresh user-specific scans.
            if (typeof window.loadDashboard === 'function' && !window.__dashboardServerHydrating) {
                window.__dashboardServerHydrating = true;
                try {
                    window.loadDashboard();
                } finally {
                    window.__dashboardServerHydrating = false;
                }
            }
        } else {
            renderScansTable(JSON.parse(localStorage.getItem('scans') || '[]'));
        }
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
    }
}

let pendingDeleteId = null;

/**
 * Opens the delete confirmation modal
 */
window.deleteScan = function(id) {
    pendingDeleteId = id;
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) {
        modal.style.display = 'flex';
    } else {
        // Global access fallback: Use native confirm if custom modal is missing
        if (confirm('Are you sure you want to delete this scan from your history? This action cannot be undone.')) {
            window.confirmDelete();
        }
    }
};

window.confirmDelete = async function() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    const btn = document.getElementById('confirmDeleteBtn');
    const originalContent = btn ? btn.innerHTML : 'Delete';

    try {
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
        }

        const token = localStorage.getItem('token');

        // Attempt backend deletion for persistent data (MongoDB ObjectIDs are 24 chars)
        if (token && id && id.length >= 24) {
            const response = await fetch(`/api/scan/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
        }

        // Sync local storage for demo/offline data
        let localScans = JSON.parse(localStorage.getItem('scans') || '[]');
        localScans = localScans.filter(s => (s._id || s.createdAt || s.date) !== id);
        localStorage.setItem('scans', JSON.stringify(localScans));

        showToast('Scan deleted successfully');

        // Refresh dashboard stats and table immediately for all users
        if (typeof updateDashboardStats === 'function') updateDashboardStats();
        window.closeDeleteModal();
    } catch (error) {
        console.error('Delete error:', error);
        showToast(error.message || 'Error deleting scan', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalContent;
        }
    }
}

if (typeof window.downloadScanAsPDF !== 'function') {
    window.downloadScanAsPDF = (id) => {
        showToast('Preparing PDF download...', 'info');
    };
}

window.openScanReport = function(id) {
    if (typeof window.viewReportDetails === 'function') {
        window.viewReportDetails(id);
        return;
    }
    // Fallback when dashboard inline viewer is not present on the current page.
    if (typeof window.downloadScanAsPDF === 'function') {
        window.downloadScanAsPDF(id);
    } else {
        showToast('Report viewer is loading...', 'info');
    }
};

window.closeDeleteModal = function() {
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) modal.style.display = 'none';
    pendingDeleteId = null;
};

function getRiskBadge(riskLevel) {
    const colors = {
        low: { bg: '#d4edda', text: '#155724' },
        medium: { bg: '#fff3cd', text: '#856404' },
        high: { bg: '#f8d7da', text: '#721c24' }
    };
    return colors[riskLevel.toLowerCase()] || colors.low;
}

function getPlatformIcon(platform) {
    const iconMap = {
        facebook: 'facebook-f',
        twitter: 'twitter',
        instagram: 'instagram',
        linkedin: 'linkedin-in',
        youtube: 'youtube'
    };
    return iconMap[(platform || '').toLowerCase()] || 'globe';
}

function validateScanIdentity(value) {
    const normalizedValue = typeof value === 'string' ? value.trim() : '';
    const compactValue = normalizedValue.toLowerCase().replace(/[._0-9]/g, '');

    if (!normalizedValue) {
        return { isValid: false, message: 'Please enter a username to scan.' };
    }

    if (normalizedValue.length < 4 || normalizedValue.length > 30) {
        return { isValid: false, message: 'Use 4 to 30 characters.' };
    }

    if (!/^[A-Za-z0-9._]+$/.test(normalizedValue)) {
        return { isValid: false, message: 'Use only letters, numbers, dots, or underscores.' };
    }

    if (!/[A-Za-z]/.test(normalizedValue)) {
        return { isValid: false, message: 'Username must include at least one letter.' };
    }

    if (/^[._]|[._]$/.test(normalizedValue)) {
        return { isValid: false, message: 'Username cannot start or end with a dot or underscore.' };
    }

    if (/(.)\1{2,}/.test(normalizedValue)) {
        return { isValid: false, message: 'Avoid repeated characters like "aaa" in a username.' };
    }

    if (/^(asd|qwe|zxc|dfg|fgh|jkl)$/.test(compactValue)) {
        return { isValid: false, message: 'Enter a real social media username, not a random pattern.' };
    }

    return { isValid: true, normalizedValue };
}

// ==================== SCANNER FORM HANDLERS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Load saved handles into inputs
    const loadSavedHandles = () => {
        const savedName = localStorage.getItem('dft_scan_name') || '';
        const el = document.getElementById('socialName');
        if (el) el.value = savedName;
    };

    loadSavedHandles();

    const startScanBtn = document.getElementById('startScanBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const scanClearBtn = document.getElementById('scanClearBtn');

    if (scanClearBtn) {
        scanClearBtn.addEventListener('click', () => {
            const searchInput = document.getElementById('scanSearchInput');
            if (searchInput) {
                searchInput.value = '';
                filterScansTable();
                searchInput.focus();
                showToast('Search filter cleared.', 'success');
            }
        });
    }

    if (startScanBtn) {
        startScanBtn.addEventListener('click', () => {
            const originalContent = startScanBtn.innerHTML;

            const targetName = document.getElementById('socialName')?.value.trim() || '';
            const validation = validateScanIdentity(targetName);
            if (!validation.isValid) {
                return showToast(validation.message, 'error');
            }

            // Start the actual scan on the backend immediately
            const scanRequest = fetch('/api/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ targetName: validation.normalizedValue })
            })
                .then(async response => {
                    const data = await response.json().catch(() => ({}));
                    if (!response.ok || !data.success) {
                        throw new Error(data.message || 'Scan failed. Please try again.');
                    }
                    return data;
                });

            // Visual feedback: Loading Spinner
            startScanBtn.disabled = true;
            startScanBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${typeof t === 'function' ? t('scanning') : 'Scanning...'}`;

            // Progress Bar Logic
            const progressContainer = document.getElementById('scanProgressContainer');
            const progressBar = document.getElementById('scanProgressBar');
            const progressText = document.getElementById('scanProgressText');
            
            // Live Feed elements
            const liveFeedContainer = document.getElementById('liveFeedContainer');
            const liveFeedList = document.getElementById('liveFeedList');
            const simulatedPlatforms = ['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'YouTube', 'Google Search', 'Global Breach Database'];

            if (progressContainer) progressContainer.style.display = 'block';
            if (progressBar) progressBar.style.width = '0%';

            let progress = 0;
            const scanInterval = setInterval(() => {
                // Randomly increment progress to simulate a real scanning process
                progress += Math.floor(Math.random() * 15) + 5;

                if (progress >= 100) {
                    progress = 100;
                    clearInterval(scanInterval);

                    // Play success sound
                    const audio = new Audio('../assets/sounds/success.mp3');
                    audio.play().catch(() => {/* Audio might be blocked by browser or file missing */ });

                    setTimeout(() => {
                        if (progressContainer) progressContainer.style.display = 'none';
                        
                        // Redesign: Final live feed message and hide after a delay
                        if (liveFeedList) {
                            liveFeedList.innerHTML += '<div class="live-feed-item final-message"><i class="fas fa-check-circle"></i> Scan completed!</div>';
                            liveFeedList.scrollTop = liveFeedList.scrollHeight;
                        }
                        setTimeout(() => { if (liveFeedContainer) liveFeedContainer.style.display = 'none'; }, 2000); // Hide feed after 2 seconds

                        startScanBtn.disabled = false;
                        startScanBtn.innerHTML = originalContent;

                        // Refresh dashboard stats once backend processing and UI progress are both done
                        scanRequest.then(data => {
                            updateDashboardStats();
                            if (window.updateNotifications) window.updateNotifications();
                            console.log('Scan completed for:', validation.normalizedValue);
                            const scoreDetail = data.scan ? ` (Score: ${data.scan.privacyScore} - ${data.scan.riskLevel})` : '';
                            showToast((typeof t === 'function' ? t('scan_success') : 'Scan completed successfully!') + scoreDetail);
                        }).catch(err => {
                            console.error('Backend scan failed:', err);
                            if (liveFeedList) liveFeedList.innerHTML += `<div class="live-feed-item error-message"><i class="fas fa-exclamation-circle"></i> Scan failed.</div>`;
                            if (liveFeedContainer) setTimeout(() => { liveFeedContainer.style.display = 'none'; }, 2000);
                            showToast(err.message || 'Scan failed. Please try again.', 'error');
                        });
                    }, 500);
                }
                let currentPlatformIndex = 0; // Initialize here for the loop

                if (progressBar) progressBar.style.width = `${progress}%`;
                if (progressText) progressText.textContent = `${progress}%`;
            }, 300);
        });
    }

    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to clear all scan history? This action cannot be undone.')) {
                await clearAllScansGlobally();
            }
        });
    }
});
