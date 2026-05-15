/**
 * theme.js — Light / Dark mode manager
 * Reads `setting_theme` from localStorage and injects a <style> override tag.
 * Call applyTheme() any time or let it auto-run on DOMContentLoaded.
 */

const THEME_STYLES = {
  dark: `
    /* ===== DARK MODE OVERRIDES ===== */
    body {
      background:
        radial-gradient(circle at 0% 0%, rgba(157, 78, 221, 0.15), transparent 48%),
        radial-gradient(circle at 100% 100%, rgba(255, 77, 148, 0.1), transparent 52%),
        linear-gradient(135deg, #000000 0%, #0a0510 35%, #000000 100%) !important;
      color: #fce7f3 !important;
    }

    /* Sidebar */
    .sidebar {
      background: linear-gradient(180deg, rgba(255,255,255,0.03), transparent 20%),
                  linear-gradient(180deg, #0d001a 0%, #000000 100%) !important;
      border-right: 1px solid rgba(157, 78, 221, 0.15) !important;
    }

    /* Top bar */
    .top-bar {
      background: rgba(0, 0, 0, 0.94) !important;
      border-color: rgba(157, 78, 221, 0.12) !important;
    }

    /* Stat cards */
    .stat-card, .chart-card, .scan-form, .action-card,
    .settings-sidebar, .settings-content, .setting-item,
    .danger-zone, .profile-stats .stat-card {
      background: rgba(13, 0, 26, 0.96) !important;
      border-color: rgba(157, 78, 221, 0.18) !important;
      color: #fce7f3 !important;
    }

    /* Action cards hover */
    .action-card:hover {
      background: rgba(157, 78, 221, 0.12) !important;
    }

    /* Text */
    .stat-label, .setting-info p, .user-role, h4, p, label {
      color: #d8b4fe !important;
    }
    h1, h2, h3, .stat-value, .user-name, .page-title {
      background: linear-gradient(135deg, #ff4d94, #9d4edd, #000000) !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      color: transparent !important;
    }

    /* Inputs & selects */
    input, select, textarea,
    .setting-select, .frequency-select, .platform-input input {
      background: #0d001a !important;
      color: #fce7f3 !important;
      border-color: rgba(157, 78, 221, 0.25) !important;
    }
    input::placeholder { color: #9d4edd !important; }

    /* Table */
    .scans-table th {
      background: rgba(157, 78, 221, 0.15) !important;
      color: #ff85b3 !important;
    }
    .scans-table td {
      color: #fce7f3 !important;
      border-color: rgba(157, 78, 221, 0.1) !important;
    }
    .scans-table tr:hover td {
      background: rgba(157, 78, 221, 0.08) !important;
    }

    /* Modal */
    .modal-content {
      background: #000000 !important;
      border-color: rgba(157, 78, 221, 0.2) !important;
      color: #fce7f3 !important;
    }

    /* Toggle switches background in dark */
    .toggle-slider { background-color: #1a0b2e !important; }

    /* Settings nav active */
    .settings-nav-item.active {
      background: rgba(157, 78, 221, 0.22) !important;
    }
    .settings-nav-item:hover {
      background: rgba(157, 78, 221, 0.14) !important;
    }
    .settings-nav-item { color: #d8b4fe !important; }

    /* Section title border */
    .section-title { border-color: rgba(157, 78, 221, 0.2) !important; }

    /* Scrollbar */
    ::-webkit-scrollbar-track { background: #000000 !important; }
  `
};

/**
 * Apply the saved or given theme.
 * @param {string} [theme] - 'light' | 'dark' | 'system'. Defaults to localStorage value.
 */
function applyTheme(theme) {
  if (!theme) {
    theme = localStorage.getItem('setting_theme') || 'light';
  }

  // Resolve 'system'
  if (theme === 'system') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Remove old theme tag if present
  const existing = document.getElementById('__theme_override__');
  if (existing) existing.remove();

  document.documentElement.setAttribute('data-theme', theme);

  if (theme === 'dark') {
    const style = document.createElement('style');
    style.id = '__theme_override__';
    style.textContent = THEME_STYLES.dark;
    document.head.appendChild(style);
  }
}

// Auto-apply on load
document.addEventListener('DOMContentLoaded', () => applyTheme());

// Listen for system preference changes when 'system' is chosen
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (localStorage.getItem('setting_theme') === 'system') applyTheme('system');
});
