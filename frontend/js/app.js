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

    // New properties to store signup data and challengeId temporarily
    _signupData: null,
    _challengeId: null,
    _otpTimer: null,
    _otpExpiresInMinutes: null,

    login: async (email, password, remember) => {
        try {
            // Assuming a login API endpoint exists on the backend
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user', JSON.stringify(data.user)); // Assuming API returns user data
            localStorage.setItem('token', data.token); // Assuming API returns a token

            if (remember) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('dft_user', data.user.email);
                localStorage.setItem('dft_user_name', data.user.fullName || data.user.name);
            } else {
                localStorage.removeItem('rememberMe');
            }

            const isPagesFolder = window.location.pathname.includes('/pages/');
            window.location.href = isPagesFolder ? 'dashboard.html' : 'pages/dashboard.html';

        } catch (error) {
            console.error('Login error:', error);
            alert(error.message || 'An unexpected error occurred during login.');
        }
    },

    signup: async (userData) => {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || (data.errors && data.errors[0] && data.errors[0].message) || 'Failed to request OTP.');
            }

            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);

            alert('Account created successfully!');
            const isPagesFolder = window.location.pathname.includes('/pages/');
            window.location.href = isPagesFolder ? 'dashboard.html' : 'pages/dashboard.html';

        } catch (error) {
            console.error('Signup OTP request error:', error);
            alert(error.message || 'An unexpected error occurred during signup.');
        }
    },

    // New function to handle OTP verification
    verifyOtp: async (otp) => {
        if (!Auth._challengeId || !Auth._signupData) {
            alert('Signup process not initiated or expired. Please try again.');
            return;
        }

        try {
            const response = await fetch('/api/auth/signup/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    challengeId: Auth._challengeId,
                    otp: otp
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'OTP verification failed.');
            }

            // OTP verified, now perform actual login/redirection
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user', JSON.stringify(data.user)); // Assuming API returns user data
            localStorage.setItem('token', data.token); // Assuming API returns a token

            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('dft_user', data.user.email);
            localStorage.setItem('dft_user_name', data.user.fullName || data.user.name);

            // Clear temporary signup data
            Auth._signupData = null;
            Auth._challengeId = null;
            Auth._stopOtpTimer();

            alert('Account created and verified successfully!');
            const isPagesFolder = window.location.pathname.includes('/pages/');
            window.location.href = isPagesFolder ? 'dashboard.html' : 'pages/dashboard.html';

        } catch (error) {
            console.error('OTP verification error:', error);
            alert(error.message || 'An unexpected error occurred during OTP verification.');
        }
    },

    // New function to resend OTP
    resendOtp: async () => {
        if (!Auth._signupData) {
            alert('Signup data not found. Please start the signup process again.');
            return;
        }

        try {
            const response = await fetch('/api/auth/signup/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Auth._signupData) // Use stored signup data
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend OTP.');
            }

            Auth._challengeId = data.challengeId;
            Auth._otpExpiresInMinutes = data.expiresInMinutes;

            alert(`New OTP sent to ${Auth._signupData.email}. It expires in ${data.expiresInMinutes} minutes.`);
            Auth._startOtpTimer(); // Restart timer

        } catch (error) {
            console.error('Resend OTP error:', error);
            alert(error.message || 'An unexpected error occurred during OTP resend.');
        }
    },

    // UI helper functions (assuming HTML elements exist)
    _showOtpVerificationUI: (email) => {
        const signupForm = document.getElementById('signupForm'); // Assuming signup form ID
        const otpVerificationSection = document.getElementById('otpVerificationSection'); // Assuming OTP section ID
        const otpEmailDisplay = document.getElementById('otpEmailDisplay');

        if (signupForm) signupForm.style.display = 'none';
        if (otpVerificationSection) otpVerificationSection.style.display = 'block';
        if (otpEmailDisplay) otpEmailDisplay.textContent = email;
    },

    _hideOtpVerificationUI: () => {
        const signupForm = document.getElementById('signupForm');
        const otpVerificationSection = document.getElementById('otpVerificationSection');

        if (signupForm) signupForm.style.display = 'block';
        if (otpVerificationSection) otpVerificationSection.style.display = 'none';
        Auth._stopOtpTimer();
    },

    _startOtpTimer: () => {
        Auth._stopOtpTimer(); // Clear any existing timer
        const otpTimerDisplay = document.getElementById('otpTimerDisplay');
        const resendOtpBtn = document.getElementById('resendOtpBtn');

        if (!otpTimerDisplay || !resendOtpBtn) return;

        let timeLeft = Auth._otpExpiresInMinutes * 60; // Convert minutes to seconds
        resendOtpBtn.disabled = true;
        otpTimerDisplay.style.display = 'block';

        Auth._otpTimer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            otpTimerDisplay.textContent = `OTP expires in ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (timeLeft <= 0) {
                Auth._stopOtpTimer();
                otpTimerDisplay.textContent = 'OTP expired. Please resend.';
                resendOtpBtn.disabled = false;
            }
            timeLeft--;
        }, 1000);
    },

    _stopOtpTimer: () => {
        if (Auth._otpTimer) {
            clearInterval(Auth._otpTimer);
            Auth._otpTimer = null;
        }
        const otpTimerDisplay = document.getElementById('otpTimerDisplay');
        const resendOtpBtn = document.getElementById('resendOtpBtn');
        if (otpTimerDisplay) otpTimerDisplay.style.display = 'none';
        if (resendOtpBtn) resendOtpBtn.disabled = false; // Enable resend if timer is stopped manually
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
                s.removeItem('dft_user'); // Clear stored email
                s.removeItem('dft_user_name'); // Clear stored name
                s.removeItem('rememberMe'); // Clear auto-fill preference
                s.removeItem('dft_active_session_owner'); // Clear workspace context
            });
            const isPagesFolder = window.location.pathname.includes('/pages/');
            window.location.href = isPagesFolder ? 'login.html' : 'pages/login.html';
        }
    }
};
window.Auth = Auth;
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

document.querySelectorAll('[data-social-auth]').forEach(button => {
    button.addEventListener('click', () => {
        Auth.login('google.user@example.com', 'social-login', true);
    });
});

// ==================== AUTH FORM SUBMISSION HANDLERS ====================
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (validateAuthForm(signupForm)) {
                const fullName = document.getElementById('fullName')?.value;
                const email = document.getElementById('signupEmail')?.value;
                const password = document.getElementById('signupPassword')?.value;

                if (fullName && email && password) {
                    await Auth.signup({ fullName, email, password });
                } else {
                    alert('Please fill in all required fields for signup.');
                }
            } else {
                alert('Please correct the errors in the form.');
            }
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (validateAuthForm(loginForm)) {
                const email = document.getElementById('loginEmail')?.value;
                const password = document.getElementById('loginPassword')?.value;
                const rememberMe = document.getElementById('rememberMe')?.checked || false; // Assuming a remember me checkbox

                if (email && password) {
                    await Auth.login(email, password, rememberMe);
                } else {
                    alert('Please enter your email and password.');
                }
            } else {
                alert('Please correct the errors in the form.');
            }
        });
    }

    // OTP Verification button handlers
    document.getElementById('verifyOtpBtn')?.addEventListener('click', async () => {
        const otp = document.getElementById('otpInput')?.value;
        if (otp) await Auth.verifyOtp(otp);
    });
    document.getElementById('resendOtpBtn')?.addEventListener('click', async () => await Auth.resendOtp());
    document.getElementById('cancelOtpBtn')?.addEventListener('click', () => Auth._hideOtpVerificationUI());
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

    clearAll: () => {
        localStorage.removeItem('scans');
        localStorage.removeItem('socialHandles');
    }
};

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

    if (!localStorage.getItem('socialHandles')) {
        localStorage.setItem('socialHandles', JSON.stringify({
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: '',
            youtube: ''
        }));
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
        const data = await response.json();

        if (data.success) {
            const statsMap = {
                'totalScans': data.stats.totalScans,
                'privacyScore': data.stats.privacyScore,
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

            // Update Risk Distribution Chart
            const riskChart = window.riskChartInstance || window.riskDistChart;
            if (riskChart && data.stats.riskDistribution) {
                const dist = data.stats.riskDistribution;
                riskChart.data.datasets[0].data = [dist.low, dist.medium, dist.high];
                riskChart.update();
            }
        }

        // Fetch and update Privacy Score Trend Chart
        const trendChart = window.trendChartInstance || window.scoreTrendChart;
        if (trendChart) {
            const trendRes = await fetch('/api/dashboard/trend', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const trendData = await trendRes.json();
            if (trendData.success) {
                trendChart.data.labels = trendData.trend.map(t => formatDate(t.date));
                trendChart.data.datasets[0].data = trendData.trend.map(t => t.score);
                trendChart.update();
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
            // Sync local storage so other page components are updated
            localStorage.setItem('scans', JSON.stringify(historyData.scans));

            if (typeof filterScansTable === 'function') {
                return filterScansTable(); // Use specialized page renderer if available
            }

            if (historyData.scans.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No scans yet</td></tr>';
            } else {
                tbody.innerHTML = historyData.scans.map(s => {
                    const platforms = s.findings ? [...new Set(s.findings.map(f => f.platform))].join(', ') : 'N/A';
                    const badge = getRiskBadge(s.riskLevel);
                    const scanId = s._id || s.createdAt;
                    return `
                        <tr>
                            <td>${formatDate(s.createdAt)}</td>
                            <td>${platforms}</td>
                            <td>${s.totalFindings} traces</td>
                            <td><span class="risk-badge" style="background:${badge.bg}; color:${badge.text}">${s.riskLevel.toUpperCase()}</span></td>
                            <td>
                                <div class="score-cell">
                                    <span>${s.privacyScore}</span>
                                    <div class="score-bar"><div class="score-bar-fill" style="width:${s.privacyScore}%"></div></div>
                                </div>
                            </td>
                            <td>
                                <button class="btn-secondary" onclick="viewReportDetails('${scanId}')" title="View Report"><i class="fas fa-eye"></i></button>
                                <button class="btn-danger" onclick="deleteScan('${scanId}')" title="Delete Scan" style="padding: 0.4rem 0.8rem; border-radius: 20px; margin-left: 5px;"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
    }
}

let pendingDeleteId = null;

/**
 * Opens the delete confirmation modal
 */
function deleteScan(id) {
    pendingDeleteId = id;
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) modal.style.display = 'flex';
}

async function confirmDelete() {
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

        // Attempt backend deletion if it's a valid MongoDB ID
        if (token && id.length > 20) {
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

        // Refresh UI components
        if (typeof loadDashboard === 'function') loadDashboard();
        if (typeof updateDashboardStats === 'function') updateDashboardStats();

        closeDeleteModal();
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

function closeDeleteModal() {
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) modal.style.display = 'none';
    pendingDeleteId = null;
}

window.deleteScan = deleteScan;
window.confirmDelete = confirmDelete;
window.closeDeleteModal = closeDeleteModal;

function getRiskBadge(riskLevel) {
    const colors = {
        low: { bg: '#d4edda', text: '#155724' },
        medium: { bg: '#fff3cd', text: '#856404' },
        high: { bg: '#f8d7da', text: '#721c24' }
    };
    return colors[riskLevel.toLowerCase()] || colors.low;
}

// ==================== SCANNER FORM HANDLERS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Load saved handles into inputs
    const loadSavedHandles = () => {
        const saved = Storage.getSocialHandles();
        const platforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'];
        platforms.forEach(id => {
            const el = document.getElementById(id);
            if (el && saved[id]) {
                el.value = saved[id];
            }
        });
    };

    loadSavedHandles();

    const startScanBtn = document.getElementById('startScanBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');

    if (startScanBtn) {
        startScanBtn.addEventListener('click', () => {
            const originalContent = startScanBtn.innerHTML;

            const handles = {
                facebook: document.getElementById('facebook')?.value.trim() || '',
                twitter: document.getElementById('twitter')?.value.trim() || '',
                instagram: document.getElementById('instagram')?.value.trim() || '',
                linkedin: document.getElementById('linkedin')?.value.trim() || '',
                youtube: document.getElementById('youtube')?.value.trim() || ''
            };

            Storage.saveSocialHandles(handles);

            // Start the actual scan on the backend immediately
            const scanRequest = fetch('/api/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ socialHandles: handles })
            }).catch(err => console.error('Backend scan failed:', err));

            // Visual feedback: Loading Spinner
            startScanBtn.disabled = true;
            startScanBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${typeof t === 'function' ? t('scanning') : 'Scanning...'}`;

            // Progress Bar Logic
            const progressContainer = document.getElementById('scanProgressContainer');
            const progressBar = document.getElementById('scanProgressBar');
            const progressText = document.getElementById('scanProgressText');

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
                        startScanBtn.disabled = false;
                        startScanBtn.innerHTML = originalContent;

                        // Refresh dashboard stats once backend processing and UI progress are both done
                        scanRequest.then(() => {
                            updateDashboardStats();
                            if (window.updateNotifications) window.updateNotifications();
                        });

                        console.log('Scan completed for handles:', handles);
                        showToast(typeof t === 'function' ? t('scan_success') : 'Scan completed successfully!');
                    }, 500);
                }

                if (progressBar) progressBar.style.width = `${progress}%`;
                if (progressText) progressText.textContent = `${progress}%`;
            }, 400);
        });
    }

    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            const platforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'];
            platforms.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            Storage.saveSocialHandles({ facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '' });
        });
    }
});
