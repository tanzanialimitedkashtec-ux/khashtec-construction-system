/**
 * KASHTEC Mobile UI - Transforms the desktop layout into a mobile-friendly layout
 * Only activates on screens <= 768px. Desktop layout is completely unaffected.
 */
(function() {
    'use strict';

    const MOBILE_BREAKPOINT = 768;

    function isMobile() {
        return window.innerWidth <= MOBILE_BREAKPOINT;
    }

    // Prevent double-init
    if (window.__kashtecMobileInitialized) return;
    window.__kashtecMobileInitialized = true;

    // ===== INJECT MOBILE STYLES =====
    function injectMobileStyles() {
        if (document.getElementById('kashtec-mobile-styles')) return;

        const style = document.createElement('style');
        style.id = 'kashtec-mobile-styles';
        style.textContent = `
        @media (max-width: ${MOBILE_BREAKPOINT}px) {
            /* ===== GLOBAL RESETS ===== */
            html, body {
                overflow-x: hidden !important;
                max-width: 100vw !important;
                -webkit-text-size-adjust: 100% !important;
            }
            body {
                padding-bottom: 64px !important;
            }
            * {
                -webkit-tap-highlight-color: transparent !important;
                box-sizing: border-box !important;
            }

            /* ===== HIDE DESKTOP SIDEBAR ===== */
            .sidebar {
                display: none !important;
            }

            /* ===== HEADER ===== */
            header {
                padding: 10px 14px !important;
                font-size: 14px !important;
                position: sticky !important;
                top: 0 !important;
                z-index: 1000 !important;
            }
            header h2 {
                font-size: 15px !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                max-width: 60vw !important;
            }

            /* ===== TOP CONTROLS ===== */
            .top-controls {
                padding: 8px 12px !important;
                gap: 8px !important;
                position: sticky !important;
                z-index: 999 !important;
            }
            .menu-toggle {
                display: none !important;
            }

            /* ===== SYSTEM CONTENT / MAIN AREA ===== */
            .system-content {
                flex-direction: column !important;
                display: block !important;
            }
            .content, #contentArea {
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                padding: 12px !important;
                overflow-x: hidden !important;
                font-size: 14px !important;
            }
            .content h3 {
                font-size: 17px !important;
                margin-bottom: 12px !important;
                font-weight: 700 !important;
            }
            #contentArea > div,
            #contentArea > div > div {
                width: 100% !important;
                max-width: 100% !important;
            }

            /* ===== FORCE ALL GRIDS TO SINGLE COLUMN ===== */
            div[style*="grid-template-columns"],
            div[style*="display: grid"],
            div[style*="display:grid"],
            .summary-stats, .stats-grid, .dashboard-stats,
            .system-status-cards, .system-counts-grid {
                display: grid !important;
                grid-template-columns: 1fr !important;
                gap: 10px !important;
            }

            /* ===== FORCE FLEX CONTAINERS TO WRAP ===== */
            div[style*="display: flex"],
            div[style*="display:flex"] {
                flex-wrap: wrap !important;
            }

            /* ===== FORCE INLINE WIDTHS TO 100% ===== */
            .content div[style*="width"],
            .content section[style*="width"],
            #contentArea div[style*="width"],
            #contentArea div[style*="max-width"],
            #contentArea div[style*="min-width"] {
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
            }

            /* ===== CARDS ===== */
            .card, .stat-card, .stat-item, .dashboard-stat {
                padding: 14px !important;
                margin-bottom: 10px !important;
                border-radius: 12px !important;
                width: 100% !important;
                max-width: 100% !important;
            }
            .stat-card h4, .stat-item h4 { font-size: 12px !important; }
            .stat-card .stat-value, .stat-item .stat-value { font-size: 22px !important; }

            /* ===== FORMS ===== */
            .form-row {
                flex-direction: column !important;
                gap: 0 !important;
            }
            .form-group {
                flex: none !important;
                width: 100% !important;
                margin-bottom: 14px !important;
            }
            .form-group label {
                font-size: 13px !important;
                font-weight: 600 !important;
                margin-bottom: 6px !important;
                display: block !important;
            }
            .form-group input,
            .form-group select,
            .form-group textarea,
            input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]),
            select,
            textarea {
                font-size: 16px !important;
                padding: 12px !important;
                border-radius: 10px !important;
                width: 100% !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
                -webkit-appearance: none !important;
                border: 1px solid #d1d5db !important;
            }
            .form-container {
                max-width: 100% !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 16px !important;
                border-radius: 12px !important;
            }

            /* ===== TABLES: HORIZONTAL SCROLL ===== */
            table {
                display: block !important;
                overflow-x: auto !important;
                -webkit-overflow-scrolling: touch !important;
                white-space: nowrap !important;
                border-radius: 10px !important;
                border: 1px solid #e2e8f0 !important;
                font-size: 12px !important;
            }
            thead, tbody, tr {
                display: table !important;
                width: 100% !important;
                table-layout: auto !important;
            }
            table th, table td {
                padding: 8px 10px !important;
                font-size: 11px !important;
            }
            table th {
                font-weight: 700 !important;
                background: #f1f5f9 !important;
                position: sticky !important;
                top: 0 !important;
            }

            /* ===== TABS: HORIZONTAL SCROLL ===== */
            .tabs {
                flex-wrap: nowrap !important;
                overflow-x: auto !important;
                -webkit-overflow-scrolling: touch !important;
                gap: 6px !important;
                padding: 8px 0 !important;
                scrollbar-width: none !important;
            }
            .tabs::-webkit-scrollbar { display: none !important; }
            .tabs button, .tab-btn {
                white-space: nowrap !important;
                flex-shrink: 0 !important;
                font-size: 12px !important;
                padding: 8px 16px !important;
                border-radius: 20px !important;
                min-height: 38px !important;
            }

            /* ===== ACTION BUTTONS: TOUCH FRIENDLY ===== */
            .action-btn {
                min-width: 38px !important;
                min-height: 38px !important;
                font-size: 16px !important;
                padding: 6px !important;
                border-radius: 10px !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            button, .btn, .action, button[type="submit"] {
                min-height: 42px !important;
                font-size: 14px !important;
                border-radius: 10px !important;
                padding: 10px 16px !important;
            }

            /* ===== MODALS: BOTTOM SHEET ===== */
            .modal-overlay, .form-overlay {
                padding: 0 !important;
                align-items: flex-end !important;
            }
            .modal-content, .form-overlay .form-container {
                max-height: 92vh !important;
                max-width: 100% !important;
                width: 100% !important;
                border-radius: 20px 20px 0 0 !important;
                padding: 20px !important;
                overflow-y: auto !important;
                margin: 0 !important;
            }

            /* ===== NOTIFICATION PANEL: FULL SCREEN ===== */
            .notification-panel {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                width: 100% !important;
                z-index: 3000 !important;
                border-radius: 0 !important;
            }

            /* ===== PROFILE WIDGET: BOTTOM SHEET ===== */
            .profile-widget-card {
                position: fixed !important;
                bottom: 64px !important;
                left: 0 !important;
                right: 0 !important;
                width: 100% !important;
                border-radius: 20px 20px 0 0 !important;
                z-index: 3000 !important;
                box-shadow: 0 -4px 30px rgba(0,0,0,0.3) !important;
            }

            /* ===== MEDIA ===== */
            img, canvas, svg, video, iframe {
                max-width: 100% !important;
                height: auto !important;
            }

            /* ===== LOGIN ===== */
            .login-container {
                width: 92% !important;
                max-width: 400px !important;
                padding: 28px !important;
                border-radius: 20px !important;
            }
            .login-container input {
                font-size: 16px !important;
                padding: 14px !important;
            }
            .login-container button {
                font-size: 16px !important;
                padding: 14px !important;
                min-height: 50px !important;
            }

            /* ===== BOTTOM NAV BAR ===== */
            #mobileBottomNav {
                display: flex !important;
            }

            /* ===== MOBILE MENU PANEL ===== */
            #mobileMenuPanel {
                display: block;
            }
        }

        /* Hide mobile elements on desktop */
        @media (min-width: ${MOBILE_BREAKPOINT + 1}px) {
            #mobileBottomNav,
            #mobileMenuPanel,
            #mobileMenuOverlay {
                display: none !important;
            }
        }

        /* ===== BOTTOM NAV COMPONENT ===== */
        #mobileBottomNav {
            display: none;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            z-index: 5000;
            align-items: center;
            justify-content: space-around;
            padding: 4px 0;
            padding-bottom: env(safe-area-inset-bottom, 4px);
            box-shadow: 0 -2px 20px rgba(0,0,0,0.3);
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        .mobile-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: rgba(255,255,255,0.6);
            font-size: 10px;
            font-weight: 500;
            cursor: pointer;
            padding: 4px 2px;
            border: none;
            background: none;
            min-width: 56px;
            min-height: 44px;
            border-radius: 12px;
            transition: all 0.2s ease;
            -webkit-tap-highlight-color: transparent;
            gap: 2px;
        }
        .mobile-nav-item:active {
            transform: scale(0.92);
        }
        .mobile-nav-item.active {
            color: #3b82f6;
        }
        .mobile-nav-item .nav-icon {
            font-size: 22px;
            line-height: 1;
        }
        .mobile-nav-item .nav-label {
            font-size: 10px;
            line-height: 1;
            margin-top: 2px;
        }

        /* ===== MOBILE MENU PANEL (full screen drawer) ===== */
        #mobileMenuOverlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 5500;
            backdrop-filter: blur(4px);
        }
        #mobileMenuOverlay.visible {
            display: block;
        }
        #mobileMenuPanel {
            display: none;
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            width: 85%;
            max-width: 320px;
            background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
            z-index: 6000;
            overflow-y: auto;
            padding: 20px 16px;
            padding-bottom: 80px;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 4px 0 30px rgba(0,0,0,0.5);
        }
        #mobileMenuPanel.visible {
            transform: translateX(0);
        }
        #mobileMenuPanel .mobile-menu-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 16px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            margin-bottom: 12px;
        }
        #mobileMenuPanel .mobile-menu-header h3 {
            color: #fff;
            font-size: 18px;
            margin: 0;
        }
        #mobileMenuPanel .mobile-menu-close {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            color: #fff;
            border: none;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #mobileMenuPanel .mobile-menu-search {
            width: 100%;
            padding: 12px 14px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.15);
            background: rgba(255,255,255,0.08);
            color: #fff;
            font-size: 14px;
            margin-bottom: 12px;
            outline: none;
        }
        #mobileMenuPanel .mobile-menu-search::placeholder {
            color: rgba(255,255,255,0.4);
        }
        #mobileMenuPanel .mobile-menu-btn {
            display: block;
            width: 100%;
            padding: 12px 14px;
            margin-bottom: 4px;
            border: none;
            background: rgba(255,255,255,0.05);
            color: rgba(255,255,255,0.85);
            font-size: 14px;
            text-align: left;
            border-radius: 10px;
            cursor: pointer;
            transition: background 0.15s ease;
            min-height: 44px;
        }
        #mobileMenuPanel .mobile-menu-btn:active {
            background: rgba(59,130,246,0.3);
        }
        #mobileMenuPanel .mobile-menu-btn:hover {
            background: rgba(255,255,255,0.1);
        }

        /* ===== SMALL PHONES ===== */
        @media (max-width: 480px) {
            header h2 { font-size: 13px !important; max-width: 50vw !important; }
            .content, #contentArea { padding: 8px !important; font-size: 13px !important; }
            table th, table td { font-size: 10px !important; padding: 6px 8px !important; }
            .action-btn { min-width: 34px !important; min-height: 34px !important; }
            #mobileBottomNav { height: 56px; }
            .mobile-nav-item .nav-icon { font-size: 20px; }
            .mobile-nav-item .nav-label { font-size: 9px; }
        }
        `;
        document.head.appendChild(style);
    }

    // ===== CREATE BOTTOM NAV BAR =====
    function createBottomNav() {
        if (document.getElementById('mobileBottomNav')) return;

        const nav = document.createElement('div');
        nav.id = 'mobileBottomNav';
        nav.innerHTML = `
            <button class="mobile-nav-item active" data-action="dashboard" onclick="mobileNavAction('dashboard')">
                <span class="nav-icon">&#127968;</span>
                <span class="nav-label">Home</span>
            </button>
            <button class="mobile-nav-item" data-action="projects" onclick="mobileNavAction('projects')">
                <span class="nav-icon">&#128204;</span>
                <span class="nav-label">Projects</span>
            </button>
            <button class="mobile-nav-item" data-action="workers" onclick="mobileNavAction('workers')">
                <span class="nav-icon">&#128101;</span>
                <span class="nav-label">Workers</span>
            </button>
            <button class="mobile-nav-item" data-action="docs" onclick="mobileNavAction('docs')">
                <span class="nav-icon">&#128196;</span>
                <span class="nav-label">Docs</span>
            </button>
            <button class="mobile-nav-item" data-action="menu" onclick="mobileNavAction('menu')">
                <span class="nav-icon">&#9776;</span>
                <span class="nav-label">Menu</span>
            </button>
        `;
        document.body.appendChild(nav);
    }

    // ===== CREATE FULL MENU PANEL =====
    function createMenuPanel() {
        if (document.getElementById('mobileMenuPanel')) return;

        // Overlay
        const overlay = document.createElement('div');
        overlay.id = 'mobileMenuOverlay';
        overlay.onclick = closeMobileMenu;
        document.body.appendChild(overlay);

        // Panel
        const panel = document.createElement('div');
        panel.id = 'mobileMenuPanel';
        panel.innerHTML = `
            <div class="mobile-menu-header">
                <h3 id="mobileMenuTitle">Menu</h3>
                <button class="mobile-menu-close" onclick="closeMobileMenu()">&#10005;</button>
            </div>
            <input type="search" class="mobile-menu-search" id="mobileMenuSearch"
                   placeholder="Search menu..." oninput="filterMobileMenu()">
            <div id="mobileMenuItems"></div>
        `;
        document.body.appendChild(panel);
    }

    // ===== POPULATE MENU FROM SIDEBAR =====
    function populateMobileMenu() {
        const menuItems = document.getElementById('mobileMenuItems');
        if (!menuItems) return;

        const sidebarBtns = document.querySelectorAll('.sidebar #menu button, .sidebar .menu-list button');
        menuItems.innerHTML = '';

        sidebarBtns.forEach(btn => {
            const clone = document.createElement('button');
            clone.className = 'mobile-menu-btn';
            clone.textContent = btn.textContent;
            clone.onclick = function() {
                closeMobileMenu();
                btn.click();
            };
            menuItems.appendChild(clone);
        });

        // Also copy the role title
        const roleEl = document.getElementById('userRole');
        const titleEl = document.getElementById('mobileMenuTitle');
        if (roleEl && titleEl) {
            titleEl.textContent = roleEl.textContent || 'Menu';
        }
    }

    // ===== NAVIGATION ACTIONS =====
    window.mobileNavAction = function(action) {
        // Update active state
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.action === action);
        });

        switch (action) {
            case 'dashboard':
                if (typeof showDashboardOverview === 'function') showDashboardOverview();
                break;
            case 'projects':
                if (typeof showCreateProjectForm === 'function') showCreateProjectForm();
                break;
            case 'workers':
                if (typeof viewAllWorkers === 'function') viewAllWorkers();
                else if (typeof viewEmployeeList === 'function') viewEmployeeList();
                break;
            case 'docs':
                if (typeof documentManagement === 'function') documentManagement();
                break;
            case 'menu':
                openMobileMenu();
                break;
        }
    };

    window.openMobileMenu = function() {
        populateMobileMenu();
        const panel = document.getElementById('mobileMenuPanel');
        const overlay = document.getElementById('mobileMenuOverlay');
        if (panel) {
            panel.style.display = 'block';
            requestAnimationFrame(() => {
                panel.classList.add('visible');
            });
        }
        if (overlay) overlay.classList.add('visible');
    };

    window.closeMobileMenu = function() {
        const panel = document.getElementById('mobileMenuPanel');
        const overlay = document.getElementById('mobileMenuOverlay');
        if (panel) {
            panel.classList.remove('visible');
            setTimeout(() => { panel.style.display = 'none'; }, 300);
        }
        if (overlay) overlay.classList.remove('visible');
    };

    window.filterMobileMenu = function() {
        const search = document.getElementById('mobileMenuSearch');
        if (!search) return;
        const query = search.value.toLowerCase();
        const btns = document.querySelectorAll('#mobileMenuItems .mobile-menu-btn');
        btns.forEach(btn => {
            btn.style.display = btn.textContent.toLowerCase().includes(query) ? 'block' : 'none';
        });
    };

    // ===== STRIP INLINE STYLES ON MOBILE =====
    function stripInlineStylesForMobile() {
        if (!isMobile()) return;

        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;

        // Remove width/grid-template-columns from inline styles in content area
        contentArea.querySelectorAll('[style]').forEach(el => {
            const style = el.style;
            // Force grid to single column
            if (style.gridTemplateColumns) {
                style.gridTemplateColumns = '1fr';
            }
            // Force width to 100%
            if (style.width && style.width !== '100%' && !style.width.includes('auto')) {
                const widthPx = parseInt(style.width);
                if (widthPx > 300) {
                    style.width = '100%';
                    style.maxWidth = '100%';
                }
            }
            if (style.minWidth) {
                const minPx = parseInt(style.minWidth);
                if (minPx > 200) {
                    style.minWidth = '0';
                }
            }
            if (style.maxWidth && !style.maxWidth.includes('%')) {
                style.maxWidth = '100%';
            }
        });
    }

    // ===== OBSERVE CONTENT CHANGES =====
    function observeContentChanges() {
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;

        const observer = new MutationObserver(() => {
            if (isMobile()) {
                setTimeout(stripInlineStylesForMobile, 50);
            }
        });

        observer.observe(contentArea, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
        });
    }

    // ===== INIT =====
    function initMobileUI() {
        injectMobileStyles();
        createBottomNav();
        createMenuPanel();

        if (isMobile()) {
            // Force sidebar to stay hidden
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.add('collapsed');

            stripInlineStylesForMobile();
            observeContentChanges();
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileUI);
    } else {
        initMobileUI();
    }

    // Also re-run when content loads (some menus are populated late)
    window.addEventListener('load', () => {
        if (isMobile()) {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.add('collapsed');
            stripInlineStylesForMobile();
        }
    });

    // Handle resize (e.g. rotate phone)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (isMobile()) {
                stripInlineStylesForMobile();
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) sidebar.classList.add('collapsed');
            }
        }, 200);
    });
})();
