/**
 * KASHTEC Mobile UI v3 — Complete Redesign
 * Modern mobile app experience for smartphones (<=768px)
 * Desktop is completely unaffected.
 */
(function() {
    'use strict';
    var BP = 768;
    function isMobile() { return window.innerWidth <= BP; }
    if (window.__mobileUI) return;
    window.__mobileUI = true;

    // Brand colors
    var C = {
        primary: '#0b3d91',
        primaryLight: '#1a5fc9',
        primaryDark: '#082b66',
        accent: '#3b82f6',
        accentLight: '#60a5fa',
        bg: '#f0f2f5',
        card: '#ffffff',
        text: '#1a1a2e',
        textSec: '#64748b',
        border: '#e2e8f0',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        navBg: '#ffffff',
        navBorder: '#e5e7eb',
        navActive: '#0b3d91',
        navInactive: '#9ca3af'
    };

    /* =========================================================
       1. MOBILE CSS
       ========================================================= */
    function injectCSS() {
        if (document.getElementById('m-css')) return;
        var s = document.createElement('style');
        s.id = 'm-css';
        s.textContent = [
        '@media(max-width:' + BP + 'px){',

        /* === GLOBAL === */
        'html,body{overflow-x:hidden!important;max-width:100vw!important;-webkit-text-size-adjust:100%!important}',
        'body{font-size:11px!important;padding-bottom:56px!important;background:' + C.bg + '!important;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif!important}',
        'body.login-active{padding-bottom:0!important}',
        '*{-webkit-tap-highlight-color:transparent!important;box-sizing:border-box!important}',

        /* === HIDE DESKTOP ELEMENTS === */
        '.sidebar{display:none!important}',
        '.menu-toggle{display:none!important}',

        /* === HEADER — fixed at top so it never scrolls away === */
        'header{padding:6px 10px!important;font-size:11px!important;position:fixed!important;top:0!important;left:0!important;right:0!important;z-index:1000!important;background:' + C.primary + '!important;box-shadow:0 2px 8px rgba(0,0,0,0.15)!important;width:100%!important}',
        'header h2{font-size:12px!important;font-weight:600!important;letter-spacing:0.3px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;max-width:70vw!important}',

        /* === TOP CONTROLS === */
        '.top-controls{padding:4px 10px!important;gap:6px!important;position:fixed!important;top:34px!important;left:0!important;right:0!important;z-index:999!important;background:' + C.bg + '!important;border-bottom:1px solid ' + C.border + '!important;width:100%!important}',
        '.notification-btn{width:30px!important;height:30px!important;font-size:14px!important;border-radius:2px!important;background:' + C.card + '!important;border:1px solid ' + C.border + '!important;display:flex!important;align-items:center!important;justify-content:center!important;box-shadow:0 1px 3px rgba(0,0,0,0.08)!important}',

        /* === LAYOUT — fix scroll container so header stays fixed === */
        '.container{height:auto!important;min-height:100vh!important;overflow:visible!important}',
        '.system-content{display:block!important;overflow:visible!important;flex:none!important;padding-top:64px!important}',
        '.content,#contentArea{width:100%!important;max-width:100%!important;min-width:0!important;padding:8px!important;overflow-x:hidden!important;overflow-y:visible!important;background:' + C.bg + '!important}',
        '.content h3{font-size:13px!important;font-weight:700!important;color:' + C.text + '!important;margin-bottom:6px!important;letter-spacing:-0.3px!important}',
        '#contentArea>div,#contentArea>div>div{width:100%!important;max-width:100%!important}',

        /* === CARDS === */
        '.card,.stat-card,.stat-item,.dashboard-stat{padding:6px!important;margin-bottom:6px!important;border-radius:2px!important;width:100%!important;max-width:100%!important;background:' + C.card + '!important;border:1px solid ' + C.border + '!important;box-shadow:0 1px 3px rgba(0,0,0,0.06)!important}',
        '.stat-card h4,.stat-item h4{font-size:9px!important;text-transform:uppercase!important;letter-spacing:0.5px!important;color:' + C.textSec + '!important;margin-bottom:2px!important}',
        '.stat-card .stat-value,.stat-item .stat-value{font-size:16px!important;font-weight:700!important;color:' + C.text + '!important}',
        '.summary-stats,.stats-grid,.dashboard-stats,.system-status-cards,.system-counts-grid{grid-template-columns:1fr 1fr!important;gap:8px!important}',

        /* === FORMS === */
        '.form-row{flex-direction:column!important;gap:0!important}',
        '.form-group{flex:none!important;width:100%!important;margin-bottom:4px!important}',
        '.form-group label{font-size:10px!important;font-weight:600!important;color:' + C.text + '!important;margin-bottom:2px!important;display:block!important;letter-spacing:0.2px!important}',
        '.form-group input,.form-group select,.form-group textarea,input:not([type=checkbox]):not([type=radio]):not([type=hidden]),select,textarea{font-size:11px!important;padding:6px 8px!important;border-radius:2px!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;-webkit-appearance:none!important;border:1px solid ' + C.border + '!important;background:' + C.card + '!important;color:' + C.text + '!important;transition:border-color 0.2s!important;outline:none!important}',
        '.form-group input:focus,.form-group select:focus,.form-group textarea:focus{border-color:' + C.accent + '!important;box-shadow:0 0 0 2px rgba(59,130,246,0.1)!important}',
        '.form-container{max-width:100%!important;width:100%!important;margin:0!important;padding:8px!important;border-radius:2px!important;background:' + C.card + '!important;border:1px solid ' + C.border + '!important}',

        /* === TABLES === */
        'table{display:block!important;overflow-x:auto!important;border-radius:2px!important;border:1px solid ' + C.border + '!important;background:' + C.card + '!important;font-size:12px!important;width:100%!important}',
        'thead{display:table!important;table-layout:auto!important;min-width:100%!important}',
        'tbody{display:table!important;table-layout:auto!important;min-width:100%!important}',
        'tr{display:table-row!important}',
        'table th{padding:5px 8px!important;font-size:9px!important;font-weight:700!important;text-transform:uppercase!important;letter-spacing:0.4px!important;color:' + C.textSec + '!important;background:' + C.bg + '!important;border-bottom:2px solid ' + C.border + '!important;position:sticky!important;top:0!important;white-space:nowrap!important}',
        'table td{padding:5px 8px!important;font-size:10px!important;color:' + C.text + '!important;border-bottom:1px solid ' + C.border + '!important;white-space:nowrap!important}',
        'table tr:active{background:#f0f7ff!important}',

        /* === TABS === */
        '.tabs{flex-wrap:nowrap!important;overflow-x:auto!important;gap:8px!important;padding:4px!important;margin-bottom:16px!important;scrollbar-width:none!important;background:' + C.card + '!important;border-radius:2px!important;border:1px solid ' + C.border + '!important}',
        '.tabs::-webkit-scrollbar{display:none!important}',
        '.tabs button,.tab-btn{white-space:nowrap!important;flex-shrink:0!important;font-size:10px!important;font-weight:600!important;padding:5px 10px!important;border-radius:2px!important;min-height:28px!important;border:none!important;background:transparent!important;color:' + C.textSec + '!important;transition:all 0.2s!important}',
        '.tabs button.active,.tab-btn.active,.tabs button[style*="background"]{background:' + C.primary + '!important;color:#fff!important;box-shadow:0 2px 8px rgba(11,61,145,0.25)!important}',

        /* === ACTION BUTTONS === */
        '.action-btn{min-width:26px!important;min-height:26px!important;font-size:11px!important;padding:3px!important;border-radius:2px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;background:' + C.bg + '!important;border:1px solid ' + C.border + '!important;transition:all 0.15s!important}',
        '.action-btn:active{transform:scale(0.92)!important;background:' + C.border + '!important}',
        '.action-btn.view{color:' + C.accent + '!important}',
        '.action-btn.delete{color:' + C.danger + '!important}',
        'button[type=submit],.btn,.action{font-size:11px!important;font-weight:600!important;padding:6px 10px!important;border-radius:2px!important;min-height:30px!important;border:none!important;transition:all 0.2s!important}',

        /* === MODALS === */
        '.modal-overlay,.form-overlay{padding:0!important;align-items:flex-end!important;background:rgba(0,0,0,0.4)!important;backdrop-filter:blur(4px)!important}',
        '.modal-content,.form-overlay .form-container{max-height:92vh!important;max-width:100%!important;width:100%!important;border-radius:2px 2px 0 0!important;padding:10px!important;overflow-y:auto!important;margin:0!important;background:' + C.card + '!important;box-shadow:0 -8px 30px rgba(0,0,0,0.15)!important}',
        '.modal-content::before,.form-overlay .form-container::before{content:""!important;display:block!important;width:36px!important;height:4px!important;background:' + C.border + '!important;border-radius:2px!important;margin:0 auto 16px!important}',

        /* === NOTIFICATION PANEL === */
        '.notification-panel{position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;z-index:3000!important;border-radius:0!important;background:' + C.card + '!important}',

        /* === PROFILE WIDGET — show at top, not bottom === */
        '.profile-widget-card{position:fixed!important;top:40px!important;right:8px!important;left:auto!important;bottom:auto!important;width:260px!important;max-width:85vw!important;border-radius:2px!important;z-index:3000!important;box-shadow:0 4px 24px rgba(0,0,0,0.18)!important;background:' + C.card + '!important;border:1px solid ' + C.border + '!important}',
        '.profile-widget-card.show{display:block!important}',
        '.profile-widget-header{padding:8px 10px!important;font-size:10px!important}',
        '.profile-widget-header h4{font-size:11px!important}',
        '.profile-widget-content{padding:6px 10px!important}',
        '.profile-widget-content p{font-size:10px!important;margin:3px 0!important}',
        '.profile-widget-footer{padding:6px 10px!important}',
        '.profile-widget-footer button{padding:6px 10px!important;font-size:10px!important;border-radius:2px!important;min-height:28px!important}',

        /* === CHARTS & GRAPHS — responsive on mobile === */
        'canvas{max-width:100%!important;height:auto!important;min-height:180px!important;max-height:260px!important}',
        '.chart-container,.chart-wrapper,div:has(>canvas){width:100%!important;max-width:100%!important;padding:6px!important;background:' + C.card + '!important;border:1px solid ' + C.border + '!important;border-radius:2px!important;margin-bottom:8px!important;overflow:hidden!important}',
        '.chart-box{min-width:auto!important;font-size:10px!important;padding:6px 8px!important}',
        '.chart-level{gap:4px!important;flex-wrap:wrap!important}',

        /* === MEDIA === */
        'img,svg,video,iframe{max-width:100%!important;height:auto!important}',

        /* === LOGIN === */
        '.login-container{width:90%!important;max-width:360px!important;padding:24px 20px!important;border-radius:2px!important;background:' + C.card + '!important;box-shadow:0 8px 32px rgba(0,0,0,0.12)!important}',
        '.login-container h3{font-size:15px!important;font-weight:700!important;margin-bottom:4px!important}',
        '.login-container input{font-size:13px!important;padding:9px!important;border-radius:2px!important;border:1.5px solid ' + C.border + '!important}',
        '.login-container input:focus{border-color:' + C.accent + '!important;box-shadow:0 0 0 3px rgba(59,130,246,0.12)!important}',
        '.login-container button{font-size:13px!important;padding:9px!important;min-height:38px!important;border-radius:2px!important;font-weight:700!important;letter-spacing:0.3px!important}',

        /* === BADGES === */
        '.status-badge,.property-type-badge,.zoning-badge{font-size:9px!important;padding:2px 6px!important;border-radius:2px!important;font-weight:600!important}',

        /* === BOTTOM NAV — only show after login === */
        'body:not(.login-active) #m-nav{display:flex!important}',
        'body.login-active #m-nav{display:none!important}',

        /* === PREMIUM COMPACT POLISH === */
        'h1,h2,h3,h4,h5,h6{margin-top:0!important}',
        'p{margin:2px 0!important;line-height:1.4!important}',
        '.card h3,.card h4,.stat-card h3{font-size:11px!important;margin-bottom:4px!important}',
        '.card p,.stat-card p{font-size:10px!important}',
        'hr{margin:6px 0!important;border-color:' + C.border + '!important}',
        'ul,ol{padding-left:16px!important;margin:4px 0!important}',
        'li{font-size:10px!important;margin-bottom:2px!important}',
        'a{font-size:inherit!important}',
        '.section-title,.section-header,h3.section{font-size:12px!important;font-weight:700!important;margin-bottom:6px!important;padding-bottom:4px!important;border-bottom:1px solid ' + C.border + '!important}',
        'textarea{min-height:60px!important;resize:vertical!important}',
        'select{background-image:none!important}',

        /* === INLINE STYLE OVERRIDES — beat style= attributes on grid/flex containers === */
        'div[style*="grid-template-columns"]{grid-template-columns:1fr!important}',
        'div[style*="grid-template-columns: repeat"]{grid-template-columns:1fr 1fr!important}',
        'div[style*="display: grid"]{gap:8px!important}',
        'div[style*="display: flex"][style*="gap"]{flex-wrap:wrap!important}',
        'div[style*="min-width"]{min-width:0!important}',
        'div[style*="width:"][style*="px"]{width:100%!important;max-width:100%!important}',
        'span[style*="font-size"]{font-size:inherit!important}',

        '}', /* end 768px */

        /* === HIDE ON DESKTOP === */
        '@media(min-width:' + (BP+1) + 'px){#m-nav,#m-panel,#m-overlay{display:none!important}}',

        /* === BOTTOM NAV COMPONENT === */
        '#m-nav{',
        'display:none;position:fixed;bottom:0;left:0;right:0;height:56px;',
        'background:' + C.navBg + ';z-index:5000;align-items:stretch;justify-content:space-around;',
        'padding:0;box-shadow:0 -1px 12px rgba(0,0,0,0.08);',
        'border-top:1px solid ' + C.navBorder + ';',
        '}',

        '.m-ni{',
        'display:flex;flex-direction:column;align-items:center;justify-content:center;',
        'color:' + C.navInactive + ';font-size:10px;font-weight:500;cursor:pointer;',
        'padding:6px 4px 8px;border:none;background:none;flex:1;max-width:80px;',
        'position:relative;transition:color 0.2s;-webkit-tap-highlight-color:transparent;gap:4px;',
        '}',
        '.m-ni:active{opacity:0.7}',
        '.m-ni.act{color:' + C.navActive + '}',
        '.m-ni.act::before{',
        'content:"";position:absolute;top:0;left:50%;transform:translateX(-50%);',
        'width:32px;height:3px;background:' + C.navActive + ';border-radius:0 0 3px 3px;',
        '}',
        '.m-ni .ni{font-size:20px;line-height:1}',
        '.m-ni .nl{font-size:9px;line-height:1;font-weight:600;letter-spacing:0.2px}',

        /* === MENU OVERLAY === */
        '#m-overlay{',
        'display:none;position:fixed;top:0;left:0;right:0;bottom:0;',
        'background:rgba(0,0,0,0.4);z-index:5500;backdrop-filter:blur(4px);',
        'transition:opacity 0.3s;opacity:0;',
        '}',
        '#m-overlay.vis{display:block;opacity:1}',

        /* === MENU PANEL === */
        '#m-panel{',
        'display:none;position:fixed;bottom:0;left:0;right:0;',
        'max-height:85vh;background:' + C.card + ';z-index:6000;',
        'overflow-y:auto;padding:0;',
        'border-radius:24px 24px 0 0;',
        'box-shadow:0 -8px 40px rgba(0,0,0,0.15);',
        'transform:translateY(100%);transition:transform 0.35s cubic-bezier(0.4,0,0.2,1);',
        '}',
        '#m-panel.vis{transform:translateY(0)}',

        '#m-panel .m-handle{',
        'display:flex;justify-content:center;padding:12px 0 8px;position:sticky;top:0;background:' + C.card + ';z-index:1;',
        '}',
        '#m-panel .m-handle-bar{',
        'width:40px;height:4px;background:' + C.border + ';border-radius:2px;',
        '}',

        '#m-panel .mh{',
        'display:flex;justify-content:space-between;align-items:center;',
        'padding:4px 20px 16px;',
        '}',
        '#m-panel .mh h3{color:' + C.text + ';font-size:17px;font-weight:700;margin:0;letter-spacing:-0.3px}',
        '#m-panel .mc{',
        'width:36px;height:36px;border-radius:50%;background:' + C.bg + ';',
        'color:' + C.textSec + ';border:none;font-size:18px;cursor:pointer;',
        'display:flex;align-items:center;justify-content:center;transition:background 0.15s;',
        '}',
        '#m-panel .mc:active{background:' + C.border + '}',

        '#m-panel .ms{',
        'width:calc(100% - 32px);margin:0 16px 12px;padding:10px 14px;border-radius:2px;',
        'border:1.5px solid ' + C.border + ';background:' + C.bg + ';',
        'color:' + C.text + ';font-size:15px;outline:none;transition:border-color 0.2s;',
        '}',
        '#m-panel .ms:focus{border-color:' + C.accent + '}',
        '#m-panel .ms::placeholder{color:' + C.navInactive + '}',

        '#m-panel .m-items{padding:0 12px 20px}',

        '#m-panel .mb{',
        'display:flex;align-items:center;width:100%;padding:11px 14px;margin-bottom:2px;border:none;',
        'background:transparent;color:' + C.text + ';font-size:14px;',
        'text-align:left;border-radius:2px;cursor:pointer;transition:background 0.15s;min-height:40px;',
        'font-weight:500;',
        '}',
        '#m-panel .mb:active{background:rgba(59,130,246,0.08)}',
        '#m-panel .mb:hover{background:' + C.bg + '}',

        /* === SMALL PHONES === */
        '@media(max-width:480px){',
        'header h2{font-size:12px!important;max-width:55vw!important}',
        '.content,#contentArea{padding:8px!important;font-size:12px!important}',
        'table th,table td{font-size:9px!important;padding:6px 8px!important}',
        '.action-btn{min-width:30px!important;min-height:30px!important;font-size:12px!important}',
        '#m-nav{height:50px}',
        '.m-ni .ni{font-size:18px}',
        '.m-ni .nl{font-size:8px}',
        '.summary-stats,.stats-grid,.dashboard-stats{grid-template-columns:1fr!important}',
        '}'

        ].join('\n');
        document.head.appendChild(s);
    }

    /* =========================================================
       2. BOTTOM NAV BAR — role-based items
       ========================================================= */

    // Map each role to nav items (icon, label, action key)
    // Home and More are always included; middle items are role-specific
    var roleNavItems = {
        'MD': [
            { icon: '&#9989;', label: 'Approvals', action: 'approvals' },
            { icon: '&#128196;', label: 'Docs', action: 'docs' },
            { icon: '&#128176;', label: 'Tax', action: 'tax' }
        ],
        'ADMIN': [
            { icon: '&#128101;', label: 'Staff', action: 'workers' },
            { icon: '&#127970;', label: 'Office', action: 'office' },
            { icon: '&#128202;', label: 'Reports', action: 'reports' }
        ],
        'HR': [
            { icon: '&#128101;', label: 'Team', action: 'workers' },
            { icon: '&#128197;', label: 'Attendance', action: 'attendance' },
            { icon: '&#128176;', label: 'Payments', action: 'payments' }
        ],
        'PROJECT': [
            { icon: '&#128204;', label: 'Projects', action: 'projects' },
            { icon: '&#128203;', label: 'Tasks', action: 'tasks' },
            { icon: '&#128101;', label: 'Workers', action: 'workers' }
        ],
        'REALESTATE': [
            { icon: '&#127968;', label: 'Properties', action: 'properties' },
            { icon: '&#128176;', label: 'Sales', action: 'sales' },
            { icon: '&#128666;', label: 'Vehicles', action: 'vehicles' }
        ],
        'ASSISTANT': [
            { icon: '&#128196;', label: 'Docs', action: 'docs' },
            { icon: '&#128197;', label: 'Meetings', action: 'meetings' },
            { icon: '&#128276;', label: 'Notify', action: 'notify' }
        ],
        'HSE': [
            { icon: '&#9888;', label: 'Safety', action: 'safety' },
            { icon: '&#129694;', label: 'PPE', action: 'ppe' },
            { icon: '&#128203;', label: 'Incidents', action: 'incidents' }
        ],
        'FINANCE': [
            { icon: '&#128176;', label: 'Finance', action: 'finance' },
            { icon: '&#128200;', label: 'Budget', action: 'budget' },
            { icon: '&#128179;', label: 'Payroll', action: 'payroll' }
        ]
    };

    function getRoleKey() {
        var role = (typeof currentRole !== 'undefined') ? currentRole : '';
        if (!role) return '';
        if (role === 'REAL ESTATE' || role === 'real estate') return 'REALESTATE';
        if (role === 'HR manager' || role === 'hr@manager') return 'HR';
        if (role === 'Finance Manager' || role === 'finance maneger') return 'FINANCE';
        if (role === 'project manager') return 'PROJECT';
        if (role === 'hse maneger' || role === 'HSE Manager') return 'HSE';
        if (role === 'admin') return 'ADMIN';
        if (role === 'ASSISTANT') return 'ASSISTANT';
        if (role === 'MD' || role === 'Managing Director') return 'MD';
        return role.toUpperCase().replace(/\s+/g, '');
    }

    function createNav() {
        var n = document.getElementById('m-nav');
        if (!n) {
            n = document.createElement('div');
            n.id = 'm-nav';
            document.body.appendChild(n);
        }

        var rk = getRoleKey();
        var middleItems = roleNavItems[rk] || [
            { icon: '&#128196;', label: 'Docs', action: 'docs' },
            { icon: '&#128101;', label: 'Team', action: 'workers' },
            { icon: '&#128276;', label: 'Notify', action: 'notify' }
        ];

        var html = '<button class="m-ni act" data-a="dashboard" onclick="mNav(\'dashboard\')">' +
            '<span class="ni">&#127968;</span><span class="nl">Home</span></button>';

        middleItems.forEach(function(item) {
            html += '<button class="m-ni" data-a="' + item.action + '" onclick="mNav(\'' + item.action + '\')">' +
                '<span class="ni">' + item.icon + '</span><span class="nl">' + item.label + '</span></button>';
        });

        html += '<button class="m-ni" data-a="menu" onclick="mNav(\'menu\')">' +
            '<span class="ni">&#9776;</span><span class="nl">More</span></button>';

        n.innerHTML = html;
    }

    // Rebuild nav when role changes (after login)
    function refreshNav() {
        createNav();
    }

    /* =========================================================
       3. SLIDE-UP MENU PANEL
       ========================================================= */
    function createPanel() {
        if (document.getElementById('m-panel')) return;
        var o = document.createElement('div');
        o.id = 'm-overlay';
        o.onclick = closeMenu;
        document.body.appendChild(o);

        var p = document.createElement('div');
        p.id = 'm-panel';
        p.innerHTML =
            '<div class="m-handle"><div class="m-handle-bar"></div></div>' +
            '<div class="mh"><h3 id="m-title">Menu</h3>' +
            '<button class="mc" onclick="closeMenu()">&#10005;</button></div>' +
            '<input type="search" class="ms" id="m-search" placeholder="Search menu..." oninput="filterMenu()">' +
            '<div class="m-items" id="m-items"></div>';
        document.body.appendChild(p);

        // Swipe down to close
        var startY = 0;
        p.addEventListener('touchstart', function(e) {
            startY = e.touches[0].clientY;
        }, { passive: true });
        p.addEventListener('touchmove', function(e) {
            var dy = e.touches[0].clientY - startY;
            if (dy > 80 && p.scrollTop <= 0) closeMenu();
        }, { passive: true });
    }

    function populateMenu() {
        var box = document.getElementById('m-items');
        if (!box) return;
        box.innerHTML = '';
        var btns = document.querySelectorAll('#menu button');
        btns.forEach(function(b) {
            var c = document.createElement('button');
            c.className = 'mb';
            c.textContent = b.textContent;
            c.onclick = function() { closeMenu(); window.scrollTo(0, 0); b.click(); };
            box.appendChild(c);
        });
        var role = document.getElementById('userRole');
        var title = document.getElementById('m-title');
        if (role && title) title.textContent = role.textContent || 'Menu';
    }

    // Action-to-function mapping for all nav items
    var navActions = {
        'dashboard': function() { if (typeof showDashboardOverview === 'function') showDashboardOverview(); },
        'projects': function() { if (typeof createNewProject === 'function') createNewProject(); },
        'workers': function() {
            if (typeof viewAllWorkers === 'function') viewAllWorkers();
            else if (typeof viewEmployeeList === 'function') viewEmployeeList();
        },
        'docs': function() { if (typeof documentManagement === 'function') documentManagement(); },
        'attendance': function() { if (typeof attendance === 'function') attendance(); },
        'payments': function() { if (typeof showPaymentManagement === 'function') showPaymentManagement(); },
        'approvals': function() { if (typeof showPaymentApprovals === 'function') showPaymentApprovals(); },
        'tax': function() { if (typeof showTaxPayments === 'function') showTaxPayments(); },
        'office': function() { if (typeof officePortal === 'function') officePortal(); },
        'reports': function() { if (typeof viewWorkforceReports === 'function') viewWorkforceReports(); },
        'properties': function() { if (typeof addProperty === 'function') addProperty(); },
        'sales': function() { if (typeof manageSales === 'function') manageSales(); },
        'vehicles': function() { if (typeof manageCompanyCars === 'function') manageCompanyCars(); },
        'meetings': function() { if (typeof scheduleMeeting === 'function') scheduleMeeting(); },
        'notify': function() { if (typeof sendNotifications === 'function') sendNotifications(); },
        'safety': function() { if (typeof markSafetyViolations === 'function') markSafetyViolations(); },
        'ppe': function() { if (typeof showPpeInventory === 'function') showPpeInventory(); },
        'incidents': function() { if (typeof recordIncidentReports === 'function') recordIncidentReports(); },
        'finance': function() { if (typeof financialManagement === 'function') financialManagement(); },
        'budget': function() { if (typeof financeBudgeting === 'function') financeBudgeting(); },
        'payroll': function() { if (typeof payrollProcessing === 'function') payrollProcessing(); },
        'tasks': function() { if (typeof assignTasks === 'function') assignTasks(); }
    };

    window.mNav = function(a) {
        document.querySelectorAll('.m-ni').forEach(function(i) {
            i.classList.toggle('act', i.getAttribute('data-a') === a);
        });
        if (a === 'menu') { openMenu(); return; }
        // Scroll to top before loading new content to prevent random scroll jumps
        window.scrollTo(0, 0);
        if (navActions[a]) navActions[a]();
    };

    window.openMenu = function() {
        populateMenu();
        var p = document.getElementById('m-panel');
        var o = document.getElementById('m-overlay');
        if (p) { p.style.display = 'block'; requestAnimationFrame(function() { p.classList.add('vis'); }); }
        if (o) o.classList.add('vis');
        document.body.style.overflow = 'hidden';
    };

    window.closeMenu = function() {
        var p = document.getElementById('m-panel');
        var o = document.getElementById('m-overlay');
        if (p) { p.classList.remove('vis'); setTimeout(function() { p.style.display = 'none'; }, 350); }
        if (o) { o.classList.remove('vis'); }
        document.body.style.overflow = '';
    };

    window.filterMenu = function() {
        var q = (document.getElementById('m-search') || {}).value || '';
        q = q.toLowerCase();
        document.querySelectorAll('#m-items .mb').forEach(function(b) {
            b.style.display = b.textContent.toLowerCase().indexOf(q) >= 0 ? 'flex' : 'none';
        });
    };

    /* =========================================================
       4. FIX INLINE STYLES
       ========================================================= */
    function fixInlineStyles(root) {
        if (!isMobile()) return;
        root = root || document.getElementById('contentArea');
        if (!root) return;

        var tableTags = {TABLE:1,THEAD:1,TBODY:1,TR:1,TH:1,TD:1};
        root.querySelectorAll('[style]').forEach(function(el) {
            var st = el.style;
            var isTable = tableTags[el.tagName];
            if (st.gridTemplateColumns && st.gridTemplateColumns !== '1fr') {
                st.gridTemplateColumns = '1fr';
            }
            if (!isTable && st.width) {
                var w = parseInt(st.width, 10);
                if (w > 300 && st.width.indexOf('%') === -1) {
                    st.width = '100%';
                }
            }
            if (!isTable && st.maxWidth && st.maxWidth.indexOf('px') !== -1) {
                var mw = parseInt(st.maxWidth, 10);
                if (mw > 300) st.maxWidth = '100%';
            }
            if (!isTable && st.minWidth) {
                var mnw = parseInt(st.minWidth, 10);
                if (mnw > 200) st.minWidth = '0';
            }
            if (st.display === 'flex' || st.display === 'grid') {
                st.flexWrap = 'wrap';
            }
            if (st.overflow === 'hidden') {
                st.overflow = 'visible';
            }
            if (st.position === 'fixed' && el.tagName !== 'HEADER') {
                // don't override fixed modals/overlays
            }
            if (st.fontSize) {
                var fs = parseInt(st.fontSize, 10);
                if (fs > 16) st.fontSize = '12px';
            }
            if (st.padding) {
                var p = parseInt(st.padding, 10);
                if (p > 16) st.padding = '8px';
            }
            if (st.margin) {
                var m = parseInt(st.margin, 10);
                if (m > 16) st.margin = '6px';
            }
        });

        // Fix chart canvases to fit mobile viewport
        root.querySelectorAll('canvas').forEach(function(c) {
            c.style.maxWidth = '100%';
            c.style.height = 'auto';
            var parent = c.parentElement;
            if (parent) {
                parent.style.width = '100%';
                parent.style.maxWidth = '100%';
                parent.style.overflow = 'hidden';
            }
        });

        // Fix the system-content and container overflow
        var sc = document.querySelector('.system-content');
        if (sc) { sc.style.overflow = 'visible'; sc.style.display = 'block'; }
        var ct = document.querySelector('.container');
        if (ct) { ct.style.height = 'auto'; ct.style.overflow = 'visible'; }
    }

    /* =========================================================
       5. MUTATION OBSERVER
       ========================================================= */
    function observe() {
        var ca = document.getElementById('contentArea');
        if (!ca) return;
        var timer = null;
        var obs = new MutationObserver(function() {
            if (!isMobile()) return;
            clearTimeout(timer);
            timer = setTimeout(function() { fixInlineStyles(ca); }, 100);
        });
        obs.observe(ca, { childList: true, subtree: true });
    }

    /* =========================================================
       6. INIT
       ========================================================= */
    function init() {
        injectCSS();
        createNav();
        createPanel();
        if (isMobile()) {
            var sb = document.querySelector('.sidebar');
            if (sb) sb.classList.add('collapsed');
            fixInlineStyles();
            observe();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('load', function() {
        if (isMobile()) {
            var sb = document.querySelector('.sidebar');
            if (sb) sb.classList.add('collapsed');
            fixInlineStyles();
        }
    });

    // Intercept showContent to fix styles after each page render
    function wrapShowContent() {
        if (typeof window.showContent === 'function' && !window.showContent.__wrapped) {
            var orig = window.showContent;
            window.showContent = function(html) {
                orig(html);
                if (isMobile()) {
                    window.scrollTo(0, 0);
                    setTimeout(fixInlineStyles, 50);
                }
            };
            window.showContent.__wrapped = true;
        }
    }
    wrapShowContent();
    window.addEventListener('load', wrapShowContent);

    var rt;
    window.addEventListener('resize', function() {
        clearTimeout(rt);
        rt = setTimeout(function() {
            if (isMobile()) {
                var sb = document.querySelector('.sidebar');
                if (sb) sb.classList.add('collapsed');
                fixInlineStyles();
            }
        }, 200);
    });

    // Watch for login-active class removal (login complete) to rebuild nav with role
    var bodyObs = new MutationObserver(function(mutations) {
        mutations.forEach(function(m) {
            if (m.type === 'attributes' && m.attributeName === 'class') {
                var isLogin = document.body.classList.contains('login-active');
                if (!isLogin && isMobile()) {
                    setTimeout(function() { createNav(); }, 300);
                }
            }
        });
    });
    bodyObs.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Also expose refreshNav globally so it can be called after login
    window.refreshMobileNav = refreshNav;
})();
