/**
 * KASHTEC Mobile UI v2
 * Transforms the desktop layout for smartphones (<=768px).
 * Desktop is completely unaffected.
 */
(function() {
    'use strict';

    var BP = 768;
    function isMobile() { return window.innerWidth <= BP; }
    if (window.__mobileUI) return;
    window.__mobileUI = true;

    /* =========================================================
       1. CSS  (injected once, uses !important everywhere)
       ========================================================= */
    function injectCSS() {
        if (document.getElementById('m-css')) return;
        var s = document.createElement('style');
        s.id = 'm-css';
        s.textContent = '\
@media(max-width:' + BP + 'px){\
html,body{overflow-x:hidden!important;max-width:100vw!important;-webkit-text-size-adjust:100%!important}\
body{font-size:14px!important;padding-bottom:62px!important}\
*{-webkit-tap-highlight-color:transparent!important;box-sizing:border-box!important}\
\
/* Hide desktop sidebar */\
.sidebar{display:none!important}\
.menu-toggle{display:none!important}\
\
/* Header */\
header{padding:10px 14px!important;font-size:14px!important;position:sticky!important;top:0!important;z-index:1000!important}\
header h2{font-size:15px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;max-width:60vw!important}\
\
/* Top controls */\
.top-controls{padding:8px 12px!important;gap:8px!important;position:sticky!important;z-index:999!important}\
\
/* Layout */\
.system-content{display:block!important}\
.content,#contentArea{width:100%!important;max-width:100%!important;min-width:0!important;padding:12px!important;overflow-x:hidden!important}\
.content h3{font-size:17px!important;margin-bottom:12px!important}\
#contentArea>div,#contentArea>div>div{width:100%!important;max-width:100%!important}\
\
/* Cards */\
.card,.stat-card,.stat-item,.dashboard-stat{padding:14px!important;margin-bottom:10px!important;border-radius:12px!important;width:100%!important;max-width:100%!important}\
.stat-card h4,.stat-item h4{font-size:12px!important}\
.stat-card .stat-value,.stat-item .stat-value{font-size:22px!important}\
.summary-stats,.stats-grid,.dashboard-stats,.system-status-cards,.system-counts-grid{grid-template-columns:1fr!important;gap:10px!important}\
\
/* Forms */\
.form-row{flex-direction:column!important;gap:0!important}\
.form-group{flex:none!important;width:100%!important;margin-bottom:14px!important}\
.form-group label{font-size:13px!important;font-weight:600!important;margin-bottom:6px!important;display:block!important}\
.form-group input,.form-group select,.form-group textarea{font-size:16px!important;padding:12px!important;border-radius:10px!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;-webkit-appearance:none!important}\
input:not([type=checkbox]):not([type=radio]):not([type=hidden]),select,textarea{font-size:16px!important;max-width:100%!important;box-sizing:border-box!important}\
.form-container{max-width:100%!important;width:100%!important;margin:0!important;padding:16px!important;border-radius:12px!important}\
\
/* Tables */\
table{display:block!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;white-space:nowrap!important;border-radius:10px!important;font-size:12px!important}\
thead,tbody,tr{display:table!important;width:100%!important;table-layout:auto!important}\
table th,table td{padding:8px 10px!important;font-size:11px!important}\
table th{font-weight:700!important;background:#f1f5f9!important;position:sticky!important;top:0!important}\
\
/* Tabs */\
.tabs{flex-wrap:nowrap!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;gap:6px!important;padding:8px 0!important;scrollbar-width:none!important}\
.tabs::-webkit-scrollbar{display:none!important}\
.tabs button,.tab-btn{white-space:nowrap!important;flex-shrink:0!important;font-size:12px!important;padding:8px 16px!important;border-radius:20px!important;min-height:38px!important}\
\
/* Action buttons */\
.action-btn{min-width:38px!important;min-height:38px!important;font-size:16px!important;padding:6px!important;border-radius:10px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important}\
button,.btn,.action,button[type=submit]{min-height:42px!important;border-radius:10px!important}\
\
/* Modals */\
.modal-overlay,.form-overlay{padding:0!important;align-items:flex-end!important}\
.modal-content,.form-overlay .form-container{max-height:92vh!important;max-width:100%!important;width:100%!important;border-radius:20px 20px 0 0!important;padding:20px!important;overflow-y:auto!important;margin:0!important}\
\
/* Notification panel */\
.notification-panel{position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;z-index:3000!important;border-radius:0!important}\
\
/* Profile widget */\
.profile-widget-card{position:fixed!important;bottom:62px!important;left:0!important;right:0!important;width:100%!important;border-radius:20px 20px 0 0!important;z-index:3000!important;box-shadow:0 -4px 30px rgba(0,0,0,0.3)!important}\
\
/* Media */\
img,canvas,svg,video,iframe{max-width:100%!important;height:auto!important}\
\
/* Login */\
.login-container{width:92%!important;max-width:400px!important;padding:28px!important;border-radius:20px!important}\
.login-container input{font-size:16px!important;padding:14px!important}\
.login-container button{font-size:16px!important;padding:14px!important;min-height:50px!important}\
\
/* Bottom nav */\
#m-nav{display:flex!important}\
#m-panel{display:block}\
}\
\
@media(min-width:' + (BP+1) + 'px){\
#m-nav,#m-panel,#m-overlay{display:none!important}\
}\
\
#m-nav{\
display:none;position:fixed;bottom:0;left:0;right:0;height:58px;\
background:linear-gradient(135deg,#0f172a,#1e293b);\
z-index:5000;align-items:center;justify-content:space-around;\
padding:4px 0;padding-bottom:env(safe-area-inset-bottom,4px);\
box-shadow:0 -2px 20px rgba(0,0,0,0.3);border-top:1px solid rgba(255,255,255,0.1);\
}\
.m-ni{\
display:flex;flex-direction:column;align-items:center;justify-content:center;\
color:rgba(255,255,255,0.6);font-size:10px;font-weight:500;cursor:pointer;\
padding:4px 2px;border:none;background:none;min-width:56px;min-height:44px;\
border-radius:12px;transition:all .2s;-webkit-tap-highlight-color:transparent;gap:2px;\
}\
.m-ni:active{transform:scale(0.92)}\
.m-ni.act{color:#3b82f6}\
.m-ni .ni{font-size:22px;line-height:1}\
.m-ni .nl{font-size:10px;line-height:1;margin-top:2px}\
\
#m-overlay{\
display:none;position:fixed;top:0;left:0;right:0;bottom:0;\
background:rgba(0,0,0,0.5);z-index:5500;backdrop-filter:blur(4px);\
}\
#m-overlay.vis{display:block}\
#m-panel{\
display:none;position:fixed;top:0;bottom:0;left:0;width:85%;max-width:320px;\
background:linear-gradient(180deg,#0f172a,#1e293b);z-index:6000;\
overflow-y:auto;padding:20px 16px 80px;transform:translateX(-100%);\
transition:transform .3s cubic-bezier(.4,0,.2,1);box-shadow:4px 0 30px rgba(0,0,0,0.5);\
}\
#m-panel.vis{transform:translateX(0)}\
#m-panel .mh{\
display:flex;justify-content:space-between;align-items:center;\
padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.1);margin-bottom:12px;\
}\
#m-panel .mh h3{color:#fff;font-size:18px;margin:0}\
#m-panel .mc{\
width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.1);\
color:#fff;border:none;font-size:20px;cursor:pointer;\
display:flex;align-items:center;justify-content:center;\
}\
#m-panel .ms{\
width:100%;padding:12px 14px;border-radius:12px;\
border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.08);\
color:#fff;font-size:14px;margin-bottom:12px;outline:none;\
}\
#m-panel .ms::placeholder{color:rgba(255,255,255,0.4)}\
#m-panel .mb{\
display:block;width:100%;padding:12px 14px;margin-bottom:4px;border:none;\
background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.85);font-size:14px;\
text-align:left;border-radius:10px;cursor:pointer;transition:background .15s;min-height:44px;\
}\
#m-panel .mb:active{background:rgba(59,130,246,0.3)}\
\
@media(max-width:480px){\
header h2{font-size:13px!important;max-width:50vw!important}\
.content,#contentArea{padding:8px!important;font-size:13px!important}\
table th,table td{font-size:10px!important;padding:6px 8px!important}\
.action-btn{min-width:34px!important;min-height:34px!important}\
#m-nav{height:54px}\
.m-ni .ni{font-size:20px}\
.m-ni .nl{font-size:9px}\
}\
';
        document.head.appendChild(s);
    }

    /* =========================================================
       2. Bottom Nav
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
                '<span class="ni">&#128101;</span><span class="nl">Workers</span></button>' +
            '<button class="m-ni" data-a="docs" onclick="mNav(\'docs\')">' +
                '<span class="ni">&#128196;</span><span class="nl">Docs</span></button>' +
            '<button class="m-ni" data-a="menu" onclick="mNav(\'menu\')">' +
                '<span class="ni">&#9776;</span><span class="nl">Menu</span></button>';
        document.body.appendChild(n);
    }

    /* =========================================================
       3. Menu Panel
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
            '<div class="mh"><h3 id="m-title">Menu</h3>' +
            '<button class="mc" onclick="closeMenu()">&#10005;</button></div>' +
            '<input type="search" class="ms" id="m-search" placeholder="Search menu..." oninput="filterMenu()">' +
            '<div id="m-items"></div>';
        document.body.appendChild(p);
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
    };

    window.closeMenu = function() {
        var p = document.getElementById('m-panel');
        var o = document.getElementById('m-overlay');
        if (p) { p.classList.remove('vis'); setTimeout(function() { p.style.display = 'none'; }, 300); }
        if (o) o.classList.remove('vis');
    };

    window.filterMenu = function() {
        var q = (document.getElementById('m-search') || {}).value || '';
        q = q.toLowerCase();
        document.querySelectorAll('#m-items .mb').forEach(function(b) {
            b.style.display = b.textContent.toLowerCase().indexOf(q) >= 0 ? 'block' : 'none';
        });
    };

    /* =========================================================
       4. Fix Inline Styles (the key piece)
       ========================================================= */
    function fixInlineStyles(root) {
        if (!isMobile()) return;
        root = root || document.getElementById('contentArea');
        if (!root) return;

        root.querySelectorAll('[style]').forEach(function(el) {
            var st = el.style;

            // Fix multi-column grids → single column
            if (st.gridTemplateColumns && st.gridTemplateColumns !== '1fr') {
                st.gridTemplateColumns = '1fr';
            }

            // Fix fixed pixel widths > 300px → 100%
            if (st.width) {
                var w = parseInt(st.width, 10);
                if (w > 300 && st.width.indexOf('%') === -1) {
                    st.width = '100%';
                }
            }
            // Fix max-width with px
            if (st.maxWidth && st.maxWidth.indexOf('px') !== -1) {
                var mw = parseInt(st.maxWidth, 10);
                if (mw > 300) st.maxWidth = '100%';
            }
            // Fix min-width > 200px
            if (st.minWidth) {
                var mnw = parseInt(st.minWidth, 10);
                if (mnw > 200) st.minWidth = '0';
            }
        });
    }

    /* =========================================================
       5. MutationObserver — re-fix when content changes
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
       6. Init
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
    var origShow = window.showContent;
    Object.defineProperty(window, 'showContent', {
        get: function() {
            return function(html) {
                if (typeof origShow === 'function') origShow(html);
                else {
                    var ca = document.getElementById('contentArea');
                    if (ca) ca.innerHTML = html;
                }
                if (isMobile()) setTimeout(fixInlineStyles, 50);
            };
        },
        set: function(fn) { origShow = fn; },
        configurable: true
    });

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
