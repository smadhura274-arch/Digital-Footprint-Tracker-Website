
const TRANSLATIONS = {
  en: {
    // Sidebar
    nav_dashboard: "Dashboard",
    nav_scan: "New Scan",
    nav_reports: "Reports",
    nav_profile: "Profile",
    nav_settings: "Settings",
    nav_notifications: "Notifications",
    nav_logout: "Log Out",
    // Dashboard stats
    total_scans: "Total Scans",
    privacy_risks: "Privacy Risks",
    connected_platforms: "Connected Platforms",
    privacy_score: "Privacy Score",
    // Quick actions
    new_scan: "New Scan",
    scan_your_footprint: "Scan your footprint",
    generate_report: "Generate Report",
    get_detailed_analysis: "Get detailed analysis",
    export_data: "Export Data",
    download_as_json: "Download as JSON",
    schedule_scan: "Schedule Scan",
    set_auto_scanning: "Set auto scanning",
    // Charts
    privacy_score_trend: "Privacy Score Trend",
    risk_distribution: "Risk Distribution",
    recent_scans: "Recent Scans",
    // Table headers
    date: "Date",
    platforms: "Platforms",
    findings: "Findings",
    risk: "Risk",
    score: "Score",
    // Scan page
    scanner_title: "Digital Footprint Scanner",
    scanner_desc: "Enter your social media handles to scan for privacy risks",
    start_scan: "Start Scan",
    clear_all: "Clear All",
    scanning: "Scanning...",
    scan_progress: "Scan Progress",
    scan_success: "Scan completed successfully!",
    // Reports page
    privacy_reports: "Privacy Reports",
    generate_new_report: "Generate New Report",
    no_scans_yet: "No scans yet",
    // Profile page
    change_photo: "Change Photo",
    remove_photo: "Remove Photo",
    // Settings page
    settings_title: "Settings",
    general_settings: "General Settings",
    privacy_security: "Privacy & Security",
    notifications_tab: "Notifications",
    scanning_preferences: "Scanning Preferences",
    integrations: "Integrations",
    danger_zone: "Danger Zone",
    language: "Language",
    choose_language: "Choose your preferred language",
    theme: "Theme",
    choose_theme: "Choose your preferred theme",
    time_zone: "Time Zone",
    select_timezone: "Select your time zone",
    date_format: "Date Format",
    choose_date_format: "Choose how dates are displayed",
    user_role: "Privacy Guardian"
  },
};

// Returns the translation for a key in the current language
function t(key) {
  const lang = localStorage.getItem('setting_language') || 'en';
  const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  return dict[key] || TRANSLATIONS['en'][key] || key;
}

// Apply translations to every element with data-i18n attribute
function applyTranslations() {
  const lang = localStorage.getItem('setting_language') || 'en';
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key);
    // For inputs/selects update placeholder, otherwise update textContent
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = translation;
    } else {
      el.textContent = translation;
    }
  });
}

// Run on page load
document.addEventListener('DOMContentLoaded', applyTranslations);
