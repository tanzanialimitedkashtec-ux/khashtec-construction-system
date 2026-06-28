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
        'body{font-size:13px!important;padding-bottom:60px!important;background:' + C.bg + '!important;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif!important}',
        'body.login-active{padding-bottom:0!important}',
        '*{-webkit-tap-highlight-color:transparent!important;box-sizing:border-box!important}',

        /* === HIDE DESKTOP ELEMENTS === */
        '.sidebar{display:none!important}',
        '.menu-toggle{display:none!important}',

        /* === HEADER === */
        'header{padding:8px 12px!important;font-size:13px!important;position:sticky!important;top:0!important;z-index:1000!important;background:' + C.primary + '!important;box-shadow:0 2px 8px rgba(0,0,0,0.15)!important}',
        'header h2{font-size:14px!important;font-weight:600!important;letter-spacing:0.3px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;max-width:70vw!important}',

        /* === TOP CONTROLS === */
        '.top-controls{padding:6px 12px!important;gap:8px!important;position:sticky!important;z-index:999!important;background:' + C.bg + '!important;border-bottom:1px solid ' + C.border + '!important}',
        '.notification-btn{width:36px!important;height:36px!important;font-size:18px!important;border-radius:10px!important;background:' + C.card + '!important;border:1px solid ' + C.border + '!important;display:flex!important;align-items:center!important;justify-content:center!important;box-shadow:0 1px 3px rgba(0,0,0,0.08)!important}',

        /* === LAYOUT === */
        '.system-content{display:block!important}',
        '.content,#contentArea{width:100%!important;max-width:100%!important;min-width:0!important;padding:10px!important;overflow-x:hidden!important;background:' + C.bg + '!important}',
        '.content h3{font-size:16px!important;font-weight:700!important;color:' + C.text + '!important;margin-bottom:10px!important;letter-spacing:-0.3px!important}',
        '#contentArea>div,#contentArea>div>div{width:100%!important;max-width:100%!important}',

        /* === CARDS === */
        '.card,.stat-card,.stat-item,.dashboard-stat{padding:10px!important;margin-bottom:8px!important;border-radius:12px!important;width:100%!important;max-width:100%!important;background:' + C.card + '!important;border:1px solid ' + C.border + '!important;box-shadow:0 1px 3px rgba(0,0,0,0.06)!important}',
        '.stat-card h4,.stat-item h4{font-size:10px!important;text-transform:uppercase!important;letter-spacing:0.6px!important;color:' + C.textSec + '!important;margin-bottom:4px!important}',
        '.stat-card .stat-value,.stat-item .stat-value{font-size:20px!important;font-weight:700!important;color:' + C.text + '!important}',
        '.summary-stats,.stats-grid,.dashboard-stats,.system-status-cards,.system-counts-grid{grid-template-columns:1fr 1fr!important;gap:8px!important}',

        /* === FORMS === */
        '.form-row{flex-direction:column!important;gap:0!important}',
        '.form-group{flex:none!important;width:100%!important;margin-bottom:10px!important}',
        '.form-group label{font-size:12px!important;font-weight:600!important;color:' + C.text + '!important;margin-bottom:5px!important;display:block!important;letter-spacing:0.2px!important}',
        '.form-group input,.form-group select,.form-group textarea,input:not([type=checkbox]):not([type=radio]):not([type=hidden]),select,textarea{font-size:14px!important;padding:10px 12px!important;border-radius:10px!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;-webkit-appearance:none!important;border:1.5px solid ' + C.border + '!important;background:' + C.card + '!important;color:' + C.text + '!important;transition:border-color 0.2s!important;outline:none!important}',
        '.form-group input:focus,.form-group select:focus,.form-group textarea:focus{border-color:' + C.accent + '!important;box-shadow:0 0 0 3px rgba(59,130,246,0.12)!important}',
        '.form-container{max-width:100%!important;width:100%!important;margin:0!important;padding:12px!important;border-radius:12px!important;background:' + C.card + '!important;border:1px solid ' + C.border + '!important}',

        /* === TABLES === */
        'table{display:block!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;white-space:nowrap!important;border-radius:10px!important;border:1px solid ' + C.border + '!important;background:' + C.card + '!important;font-size:12px!important}',
        'thead,tbody,tr{display:table!important;width:100%!important;table-layout:auto!important}',
        'table th{padding:8px 10px!important;font-size:10px!important;font-weight:700!important;text-transform:uppercase!important;letter-spacing:0.5px!important;color:' + C.textSec + '!important;background:' + C.bg + '!important;border-bottom:2px solid ' + C.border + '!important;position:sticky!important;top:0!important}',
        'table td{padding:8px 10px!important;font-size:12px!important;color:' + C.text + '!important;border-bottom:1px solid ' + C.border + '!important}',
        'table tr:active{background:#f0f7ff!important}',

        /* === TABS === */
        '.tabs{flex-wrap:nowrap!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;gap:8px!important;padding:4px!important;margin-bottom:16px!important;scrollbar-width:none!important;background:' + C.card + '!important;border-radius:14px!important;border:1px solid ' + C.border + '!important}',
        '.tabs::-webkit-scrollbar{display:none!important}',
        '.tabs button,.tab-btn{white-space:nowrap!important;flex-shrink:0!important;font-size:12px!important;font-weight:600!important;padding:8px 14px!important;border-radius:8px!important;min-height:34px!important;border:none!important;background:transparent!important;color:' + C.textSec + '!important;transition:all 0.2s!important}',
        '.tabs button.active,.tab-btn.active,.tabs button[style*="background"]{background:' + C.primary + '!important;color:#fff!important;box-shadow:0 2px 8px rgba(11,61,145,0.25)!important}',

        /* === ACTION BUTTONS === */
        '.action-btn{min-width:34px!important;min-height:34px!important;font-size:14px!important;padding:6px!important;border-radius:10px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;background:' + C.bg + '!important;border:1px solid ' + C.border + '!important;transition:all 0.15s!important}',
        '.action-btn:active{transform:scale(0.92)!important;background:' + C.border + '!important}',
        '.action-btn.view{color:' + C.accent + '!important}',
        '.action-btn.delete{color:' + C.danger + '!important}',
        'button[type=submit],.btn,.action{font-size:14px!important;font-weight:600!important;padding:10px 16px!important;border-radius:10px!important;min-height:40px!important;border:none!important;transition:all 0.2s!important}',

        /* === MODALS === */
        '.modal-overlay,.form-overlay{padding:0!important;align-items:flex-end!important;background:rgba(0,0,0,0.4)!important;backdrop-filter:blur(4px)!important}',
        '.modal-content,.form-overlay .form-container{max-height:92vh!important;max-width:100%!important;width:100%!important;border-radius:20px 20px 0 0!important;padding:16px!important;overflow-y:auto!important;margin:0!important;background:' + C.card + '!important;box-shadow:0 -8px 30px rgba(0,0,0,0.15)!important}',
        '.modal-content::before,.form-overlay .form-container::before{content:""!important;display:block!important;width:36px!important;height:4px!important;background:' + C.border + '!important;border-radius:2px!important;margin:0 auto 16px!important}',

        /* === NOTIFICATION PANEL === */
        '.notification-panel{position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;z-index:3000!important;border-radius:0!important;background:' + C.card + '!important}',

        /* === PROFILE WIDGET === */
        '.profile-widget-card{position:fixed!important;bottom:68px!important;left:8px!important;right:8px!important;width:auto!important;border-radius:20px!important;z-index:3000!important;box-shadow:0 -4px 30px rgba(0,0,0,0.2)!important;background:' + C.card + '!important;border:1px solid ' + C.border + '!important}',

        /* === MEDIA === */
        'img,canvas,svg,video,iframe{max-width:100%!important;height:auto!important}',

        /* === LOGIN === */
        '.login-container{width:90%!important;max-width:360px!important;padding:24px 20px!important;border-radius:20px!important;background:' + C.card + '!important;box-shadow:0 8px 32px rgba(0,0,0,0.12)!important}',
        '.login-container h3{font-size:18px!important;font-weight:700!important;margin-bottom:6px!important}',
        '.login-container input{font-size:15px!important;padding:12px!important;border-radius:12px!important;border:1.5px solid ' + C.border + '!important}',
        '.login-container input:focus{border-color:' + C.accent + '!important;box-shadow:0 0 0 3px rgba(59,130,246,0.12)!important}',
        '.login-container button{font-size:15px!important;padding:12px!important;min-height:44px!important;border-radius:12px!important;font-weight:700!important;letter-spacing:0.3px!important}',

        /* === BADGES === */
        '.status-badge,.property-type-badge,.zoning-badge{font-size:10px!important;padding:3px 8px!important;border-radius:6px!important;font-weight:600!important}',

        /* === BOTTOM NAV — only show after login === */
        'body:not(.login-active) #m-nav{display:flex!important}',
        'body.login-active #m-nav{display:none!important}',

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
        'width:calc(100% - 32px);margin:0 16px 12px;padding:10px 14px;border-radius:10px;',
        'border:1.5px solid ' + C.border + ';background:' + C.bg + ';',
        'color:' + C.text + ';font-size:15px;outline:none;transition:border-color 0.2s;',
        '}',
        '#m-panel .ms:focus{border-color:' + C.accent + '}',
        '#m-panel .ms::placeholder{color:' + C.navInactive + '}',

        '#m-panel .m-items{padding:0 12px 20px}',

        '#m-panel .mb{',
        'display:flex;align-items:center;width:100%;padding:11px 14px;margin-bottom:2px;border:none;',
        'background:transparent;color:' + C.text + ';font-size:14px;',
        'text-align:left;border-radius:10px;cursor:pointer;transition:background 0.15s;min-height:40px;',
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
       2. BOTTOM NAV BAR
       ========================================================= */
    function createNav() {
        if (document.getElementById('m-nav')) return;
        var n = document.createElement('div');
        n.id = 'm-nav';
        n.innerHTML =
            '<button class="m-ni act" data-a="dashboard" onclick="mNav(\'dashboard\')">' +
                '<span class="ni">&#127968;</span><span class="nl">Home</span></button>' +
            '<button class="m-ni" data-a="projects" onclick="mNav(\'projects\')">' +
                '<span class="ni">&#128204;</span><span class="nl">Projects</span></button>' +
            '<button class="m-ni" data-a="workers" onclick="mNav(\'workers\')">' +
                '<span class="ni">&#128101;</span><span class="nl">Team</span></button>' +
            '<button class="m-ni" data-a="docs" onclick="mNav(\'docs\')">' +
                '<span class="ni">&#128196;</span><span class="nl">Docs</span></button>' +
            '<button class="m-ni" data-a="menu" onclick="mNav(\'menu\')">' +
                '<span class="ni">&#9776;</span><span class="nl">More</span></button>';
        document.body.appendChild(n);
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
            c.onclick = function() { closeMenu(); b.click(); };
            box.appendChild(c);
        });
        var role = document.getElementById('userRole');
        var title = document.getElementById('m-title');
        if (role && title) title.textContent = role.textContent || 'Menu';
    }

    window.mNav = function(a) {
        document.querySelectorAll('.m-ni').forEach(function(i) {
            i.classList.toggle('act', i.getAttribute('data-a') === a);
        });
        if (a === 'menu') { openMenu(); return; }
        if (a === 'dashboard' && typeof showDashboardOverview === 'function') showDashboardOverview();
        else if (a === 'projects' && typeof showCreateProjectForm === 'function') showCreateProjectForm();
        else if (a === 'workers') {
            if (typeof viewAllWorkers === 'function') viewAllWorkers();
            else if (typeof viewEmployeeList === 'function') viewEmployeeList();
        }
        else if (a === 'docs' && typeof documentManagement === 'function') documentManagement();
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

        root.querySelectorAll('[style]').forEach(function(el) {
            var st = el.style;
            if (st.gridTemplateColumns && st.gridTemplateColumns !== '1fr') {
                st.gridTemplateColumns = '1fr';
            }
            if (st.width) {
                var w = parseInt(st.width, 10);
                if (w > 300 && st.width.indexOf('%') === -1) {
                    st.width = '100%';
                }
            }
            if (st.maxWidth && st.maxWidth.indexOf('px') !== -1) {
                var mw = parseInt(st.maxWidth, 10);
                if (mw > 300) st.maxWidth = '100%';
            }
            if (st.minWidth) {
                var mnw = parseInt(st.minWidth, 10);
                if (mnw > 200) st.minWidth = '0';
            }
        });
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
                if (isMobile()) setTimeout(fixInlineStyles, 50);
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
})();
