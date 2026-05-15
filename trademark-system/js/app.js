const breadcrumbMap = {
  'dashboard': [{ label: '首页', href: 'index.html' }],
  'todo': [{ label: '首页', href: 'index.html' }, { label: '待办事项' }],
  'done': [{ label: '首页', href: 'index.html' }, { label: '已办事项' }],
  'my-cases': [{ label: '首页', href: 'index.html' }, { label: '我的案件' }],
  'cc': [{ label: '首页', href: 'index.html' }, { label: '抄送案件' }],
  'drafts': [{ label: '首页', href: 'index.html' }, { label: '我的草稿' }],
  'cases': [{ label: '首页', href: 'index.html' }, { label: '案件管理中心' }],
  'cases-domestic': [{ label: '首页', href: 'index.html' }, { label: '案件管理中心', href: 'pages/cases.html' }, { label: '国内案件' }],
  'cases-overseas': [{ label: '首页', href: 'index.html' }, { label: '案件管理中心', href: 'pages/cases.html' }, { label: '海外案件' }],
  'case-detail': [{ label: '首页', href: 'index.html' }, { label: '案件管理中心', href: 'pages/cases.html' }, { label: '案件详情' }],
  'brand': [{ label: '首页', href: 'index.html' }, { label: '品牌管理' }],
  'brand-internal': [{ label: '首页', href: 'index.html' }, { label: '品牌管理', href: 'pages/brand.html' }, { label: '内部品牌' }],
  'brand-external': [{ label: '首页', href: 'index.html' }, { label: '品牌管理', href: 'pages/brand.html' }, { label: '外部合作' }],
  'brand-map': [{ label: '首页', href: 'index.html' }, { label: '品牌管理', href: 'pages/brand.html' }, { label: '品牌图谱' }],
  'brand-auth-external': [{ label: '首页', href: 'index.html' }, { label: '品牌管理' }, { label: '授权外部使用' }],
  'brand-auth-internal': [{ label: '首页', href: 'index.html' }, { label: '品牌管理' }, { label: '授权内部使用' }],
  'search-case': [{ label: '首页', href: 'index.html' }, { label: '检索中心' }, { label: '检索案卷' }],
  'collab': [{ label: '首页', href: 'index.html' }, { label: '律所协作中心' }],
  'seal-process': [{ label: '首页', href: 'index.html' }, { label: '律所协作中心' }, { label: '用印流程' }],
  'fees': [{ label: '首页', href: 'index.html' }, { label: '费用中心' }],
  'fees-bills': [{ label: '首页', href: 'index.html' }, { label: '费用中心', href: 'pages/fees.html' }, { label: '账单导入' }],
  'fees-overview': [{ label: '首页', href: 'index.html' }, { label: '费用中心', href: 'pages/fees.html' }, { label: '费用总览' }],
  'fees-approval': [{ label: '首页', href: 'index.html' }, { label: '费用中心', href: 'pages/fees.html' }, { label: '付款审批' }],
  'fees-analysis': [{ label: '首页', href: 'index.html' }, { label: '费用中心', href: 'pages/fees.html' }, { label: '费用分析' }],
  'fee-apply': [{ label: '首页', href: 'index.html' }, { label: '费用中心', href: 'pages/fees.html' }, { label: '费用申请' }],
  'decision': [{ label: '首页', href: 'index.html' }, { label: '决策与监测' }, { label: '管理决策中心' }],
  'law-firm-management': [{ label: '首页', href: 'index.html' }, { label: '决策与监测' }, { label: '律所管理' }],
  'staff-management': [{ label: '首页', href: 'index.html' }, { label: '决策与监测' }, { label: '员工管理' }],
  'monitor': [{ label: '首页', href: 'index.html' }, { label: '决策与监测' }, { label: '监测中心' }],
  'tools': [{ label: '首页', href: 'index.html' }, { label: '决策与监测' }, { label: '商标工具Link' }],
  'admin-users': [{ label: '首页', href: 'index.html' }, { label: '账号与权限' }],
  'report': [{ label: '首页', href: 'index.html' }, { label: '生成报告' }],
  'search-new': [{ label: '首页', href: 'index.html' }, { label: '商标检索' }],
  'doc-new': [{ label: '首页', href: 'index.html' }, { label: '新建文档' }]
};

const menuConfig = [
  { group: "个人中心", items: [
    { label: "仪表盘", icon: "📊", page: "dashboard", href: "index.html" },
    { label: "待办事项", icon: "📌", page: "todo", href: "pages/todo.html" },
    { label: "已办事项", icon: "✅", page: "done", href: "pages/done.html" },
    { label: "我的案件", icon: "📁", page: "my-cases", href: "pages/my-cases.html" },
    { label: "抄送案件", icon: "📨", page: "cc", href: "pages/cc.html" },
    { label: "我的草稿", icon: "📝", page: "drafts", href: "pages/drafts.html" }
  ]},
  { group: "管理中心", items: [
    { label: "案件管理中心", icon: "⚖️", page: "cases", href: "pages/cases.html", children: [
      { label: "国内案件", page: "cases-domestic", href: "pages/cases.html?tab=domestic" },
      { label: "海外案件", page: "cases-overseas", href: "pages/cases.html?tab=overseas" }
    ]},
    { label: "品牌管理", icon: "🏷️", page: "brand", href: "pages/brand.html", children: [
      { label: "内部品牌", page: "brand-internal", href: "pages/brand.html?tab=internal" },
      { label: "外部合作", page: "brand-external", href: "pages/brand.html?tab=external" },
      { label: "品牌图谱", page: "brand-map", href: "pages/brand-map.html" },
      { label: "授权外部使用", page: "brand-auth-external", href: "pages/brand-auth-external.html" },
      { label: "授权内部使用", page: "brand-auth-internal", href: "pages/brand-auth-internal.html" }
    ]}
  ]},
  { group: "检索中心", items: [
    { label: "检索案卷", icon: "🔍", page: "search-case", href: "pages/search-case.html" }
  ]},
  { group: "协作与费用", items: [
    { label: "律所协作中心", icon: "🤝", page: "collab", href: "pages/collab.html", children: [
      { label: "用印流程", page: "seal-process", href: "pages/seal-process.html" }
    ] },
    { label: "费用中心", icon: "💰", page: "fees", href: "pages/fees.html", children: [
      { label: "费用总览", page: "fees-overview", href: "pages/fees.html?tab=overview" },
      { label: "账单查询", page: "fees-query", href: "pages/fees.html?tab=query" },
      { label: "付款审批", page: "fees-approval", href: "pages/fees.html?tab=approval" },
      { label: "费用分析", page: "fees-analysis", href: "pages/fees.html?tab=analysis" },
      { label: "费用申请", page: "fee-apply", href: "pages/fees.html?tab=apply" }
    ]}
  ]},
  { group: "决策与监测", items: [
    { label: "管理决策中心", icon: "📈", page: "decision", href: "pages/decision.html" },
    { label: "律所管理", icon: "🏢", page: "law-firm-management", href: "pages/law-firm-management.html" },
    { label: "员工管理", icon: "👥", page: "staff-management", href: "pages/staff-management.html" },
    { label: "监测中心", icon: "🔍", page: "monitor", href: "pages/monitor.html" },
    { label: "商标工具Link", icon: "🔗", page: "tools", href: "pages/tools.html" }
  ]},
  { group: "系统管理", items: [
    { label: "账号与权限", icon: "🔐", page: "admin-users", href: "pages/admin-users.html" }
  ]}
];

function resolveHref(href) {
  if (!href) return '#';
  const inPages = location.pathname.includes('/pages/');
  if (!inPages) return href;
  if (href === 'index.html') return '../index.html';
  if (href.startsWith('pages/')) return href.replace('pages/', './');
  return href;
}

function renderSidebar(activePage) {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  
  let html = `
    <div class="sidebar-header">
      <div class="logo-icon" style="background:#FF6900; font-family:-apple-system,BlinkMacSystemFont,sans-serif; font-weight:700; font-size:14px; letter-spacing:0.5px;">mi</div>
      <div class="logo-text">小米商标管理系统</div>
    </div>
    <div class="toggle-btn" onclick="toggleSidebar()" title="收起/展开">◀</div>
    <div class="sidebar-nav">
  `;
  
  menuConfig.forEach(group => {
    html += `<div class="nav-group">`;
    html += `<div class="nav-group-title">${group.group}</div>`;
    group.items.forEach(item => {
      const isActive = item.page === activePage || (item.children && item.children.some(c => c.page === activePage));
      const hasChildren = item.children && item.children.length;
      const openClass = isActive && hasChildren ? 'open' : '';
      
      html += `
        <div class="nav-item ${isActive ? 'active' : ''} ${openClass} ${hasChildren ? 'has-children' : ''}" 
             onclick="${hasChildren ? `toggleSubNav(this)` : `closeMobileSidebar();navigateTo(resolveHref('${item.href}'))`}">
          <span class="icon">${item.icon}</span>
          <span class="label">${item.label}</span>
          ${hasChildren ? '<span class="arrow">▶</span>' : ''}
        </div>
      `;
      
      if (hasChildren) {
        html += `<div class="sub-nav ${openClass}">`;
        item.children.forEach(child => {
          const childActive = child.page === activePage;
          html += `
            <div class="nav-item ${childActive ? 'active' : ''}" onclick="closeMobileSidebar();navigateTo(resolveHref('${child.href}'))">
              <span class="label">${child.label}</span>
            </div>
          `;
        });
        html += `</div>`;
      }
    });
    html += `</div>`;
  });
  
  html += `</div>`;
  sidebar.innerHTML = html;
}

function renderHeader() {
  const header = document.querySelector('.top-header');
  if (!header) return;
  
  const unreadCount = getUnreadNotificationCount();
  
  header.innerHTML = `
    <div style="display:flex;align-items:center;flex:1;position:relative;">
      <div class="mobile-menu-btn" onclick="openMobileSidebar()">
        ☰
      </div>
      <div class="header-search" style="position:relative;">
        <i data-lucide="search" style="width:16px;height:16px;color:var(--text-muted);flex-shrink:0;"></i>
        <input type="text" placeholder="⌘K 搜索" id="globalSearch"
          onfocus="showSearchDropdown()" onblur="hideSearchDropdownDelayed()" oninput="handleSearchInput(this.value)">
        <div class="search-dropdown" id="searchDropdown"></div>
      </div>
    </div>
    <div class="header-actions">
      <div class="btn-icon" title="消息通知" onclick="toggleNotifDrawer()">
        <i data-lucide="bell" style="width:18px;height:18px;"></i>
        ${unreadCount > 0 ? `<span class="badge" style="width:20px;height:20px;min-width:20px;top:2px;right:2px;border-radius:50%;background:#ef4444;font-size:10px;font-weight:700;">${unreadCount}</span>` : ''}
      </div>
      <div class="btn-icon" title="帮助"><i data-lucide="help-circle" style="width:18px;height:18px;"></i></div>
      <div class="user-menu">
        <div class="avatar">${AppData.user.avatar}</div>
        <div style="line-height:1.2;">
          <div style="font-size:13px;font-weight:600;">${AppData.user.name}</div>
          <div style="font-size:11px;color:var(--text-muted);">${AppData.user.role}</div>
        </div>
      </div>
    </div>
  `;
}

function openMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  let overlay = document.querySelector('.mobile-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    overlay.onclick = closeMobileSidebar;
    document.querySelector('.app-layout').appendChild(overlay);
  }
  sidebar.classList.add('mobile-open');
  overlay.classList.add('active');
}

function closeMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.mobile-overlay');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (overlay) overlay.classList.remove('active');
}

function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('collapsed');
  const btn = document.querySelector('.toggle-btn');
  btn.innerHTML = btn.innerHTML === '◀' ? '▶' : '◀';
}

function toggleSubNav(el) {
  el.classList.toggle('open');
  const sub = el.nextElementSibling;
  if (sub && sub.classList.contains('sub-nav')) {
    sub.classList.toggle('open');
  }
}

function navigateTo(href) {
  closeMobileSidebar();
  window.location.href = href;
}

function getUnreadNotificationCount() {
  if (typeof DataService !== 'undefined' && DataService.getUnreadCount) {
    return DataService.getUnreadCount();
  }
  return AppData.messages.filter(m => !m.read).length;
}

let currentNotifTab = 'all';

function toggleNotifDrawer() {
  const overlay = document.getElementById('notifDrawerOverlay');
  if (overlay && overlay.classList.contains('active')) {
    closeNotifDrawer();
    return;
  }
  openNotifDrawer();
}

function openNotifDrawer() {
  let overlay = document.getElementById('notifDrawerOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'notifDrawerOverlay';
    overlay.className = 'notif-drawer-overlay';
    overlay.innerHTML = `
      <div class="notif-drawer" onclick="event.stopPropagation()">
        <div class="notif-drawer-header">
          <div style="font-weight:600;">🔔 通知中心</div>
          <div style="cursor:pointer;font-size:20px;color:var(--text-muted);" onclick="closeNotifDrawer()">×</div>
        </div>
        <div class="notif-tabs">
          <div class="notif-tab active" onclick="switchNotifTab('all', this)">全部</div>
          <div class="notif-tab" onclick="switchNotifTab('deadline', this)">期限预警</div>
          <div class="notif-tab" onclick="switchNotifTab('collaboration', this)">协作消息</div>
          <div class="notif-tab" onclick="switchNotifTab('approval', this)">审批提醒</div>
          <div class="notif-tab" onclick="switchNotifTab('system', this)">系统公告</div>
        </div>
        <div class="notif-drawer-body" id="notifDrawerBody"></div>
        <div class="notif-drawer-footer">
          <button class="btn btn-sm btn-secondary" onclick="markAllNotificationsRead()">一键已读</button>
          <button class="btn btn-sm btn-secondary" onclick="closeNotifDrawer()">关闭</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.onclick = closeNotifDrawer;
  }
  overlay.classList.add('active');
  renderNotifList();
}

function closeNotifDrawer() {
  const overlay = document.getElementById('notifDrawerOverlay');
  if (overlay) overlay.classList.remove('active');
}

function switchNotifTab(tab, el) {
  currentNotifTab = tab;
  document.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderNotifList();
}

function renderNotifList() {
  const body = document.getElementById('notifDrawerBody');
  if (!body) return;
  
  let notifs = [];
  if (typeof DataService !== 'undefined' && DataService.getNotifications) {
    notifs = DataService.getNotifications();
  }
  
  if (currentNotifTab !== 'all') {
    notifs = notifs.filter(n => n.type === currentNotifTab);
  }
  
  if (notifs.length === 0) {
    body.innerHTML = '<div class="notif-empty">📭 暂无通知</div>';
    return;
  }
  
  let html = '<div class="notif-list">';
  notifs.forEach(n => {
    html += `
      <div class="notif-item ${n.isRead ? '' : 'unread'}" onclick="handleNotifClick('${n.id}')">
        <div class="notif-item-title">${n.title}</div>
        <div class="notif-item-content">${n.content}</div>
        <div class="notif-item-meta">
          <span>${n.typeLabel} · ${n.createdAt}</span>
          ${n.actionText ? `<a href="${n.actionUrl || '#'}" style="color:var(--primary);font-weight:500;" onclick="event.stopPropagation()">${n.actionText} →</a>` : ''}
        </div>
      </div>
    `;
  });
  html += '</div>';
  body.innerHTML = html;
}

function handleNotifClick(id) {
  if (typeof DataService !== 'undefined' && DataService.markNotificationRead) {
    DataService.markNotificationRead(id);
    renderNotifList();
    renderHeader();
  }
}

function markAllNotificationsRead() {
  if (typeof DataService !== 'undefined' && DataService.markAllNotificationsRead) {
    DataService.markAllNotificationsRead();
    renderNotifList();
    renderHeader();
    showToast('全部通知已标记为已读', 'success');
  }
}

function renderBreadcrumb(activePage) {
  const container = document.querySelector('.page-header > div:first-child');
  if (!container) return;
  
  const existing = container.querySelector('.breadcrumb-nav');
  if (existing) existing.remove();
  
  const path = breadcrumbMap[activePage];
  if (!path) return;
  
  // Build a lookup from label to href from menuConfig
  const menuHrefMap = {};
  function scanMenu(items) {
    items.forEach(item => {
      if (item.href) menuHrefMap[item.label] = item.href;
      if (item.children) scanMenu(item.children);
    });
  }
  menuConfig.forEach(g => scanMenu(g.items));
  
  let html = '<nav class="breadcrumb-nav">';
  path.forEach((item, idx) => {
    const isLast = idx === path.length - 1;
    if (isLast) {
      html += `<span class="current">${item.label}</span>`;
    } else {
      const href = item.href || menuHrefMap[item.label];
      if (href) {
        html += `<a href="${resolveHref(href)}">${item.label}</a> / `;
      } else {
        html += `<span>${item.label}</span> / `;
      }
    }
  });
  html += '</nav>';
  
  container.insertAdjacentHTML('beforeend', html);
}

// ==================== Search Dropdown ====================
function showSearchDropdown() {
  const dropdown = document.getElementById('searchDropdown');
  if (!dropdown) return;
  
  let recentSearches = [];
  try {
    recentSearches = JSON.parse(localStorage.getItem('tm_search_history') || '[]');
  } catch(e) {}
  
  let html = '';
  
  // Search scope
  html += `
    <div class="search-scope-bar">
      <button class="search-scope-btn active">全部</button>
      <button class="search-scope-btn">案件</button>
      <button class="search-scope-btn">品牌</button>
      <button class="search-scope-btn">律所</button>
      <button class="search-scope-btn">文档</button>
    </div>
  `;
  
  // Recent searches
  if (recentSearches.length > 0) {
    html += `<div class="search-section">
      <div class="search-section-title">最近搜索</div>
      ${recentSearches.slice(0, 5).map(s => `
        <div class="search-item" onclick="performSearch('${s}')">
          <div class="search-item-icon">🕐</div>
          <span>${s}</span>
        </div>
      `).join('')}
    </div>`;
  }
  
  // Quick search
  html += `<div class="search-section">
    <div class="search-section-title">快捷搜索</div>
    <div class="search-item" onclick="performSearch('案件')">
      <div class="search-item-icon">⚖️</div>
      <span>搜索案件</span>
    </div>
    <div class="search-item" onclick="performSearch('品牌')">
      <div class="search-item-icon">🏷️</div>
      <span>搜索品牌</span>
    </div>
    <div class="search-item" onclick="performSearch('律所')">
      <div class="search-item-icon">🏢</div>
      <span>搜索律所</span>
    </div>
  </div>`;
  
  dropdown.innerHTML = html;
  dropdown.classList.add('show');
}

function hideSearchDropdownDelayed() {
  setTimeout(() => {
    const dropdown = document.getElementById('searchDropdown');
    if (dropdown) dropdown.classList.remove('show');
  }, 200);
}

function handleSearchInput(value) {
  const dropdown = document.getElementById('searchDropdown');
  if (!value.trim()) { showSearchDropdown(); return; }
  
  // Real-time suggestions from searchable data
  const keywords = value.trim().toLowerCase();
  const suggestions = [];
  
  // Search cases
  if (typeof AppData !== 'undefined') {
    (AppData.cases || []).forEach(c => {
      if ((c.name && c.name.includes(keywords)) || (c.id && c.id.toLowerCase().includes(keywords))) {
        suggestions.push({ type: '案件', text: c.id + ' ' + c.name, icon: '⚖️' });
      }
    });
    (AppData.brands || []).forEach(b => {
      if (b.name && b.name.includes(keywords)) {
        suggestions.push({ type: '品牌', text: b.name, icon: '🏷️' });
      }
    });
  }
  
  const unique = suggestions.slice(0, 6);
  if (unique.length === 0) {
    dropdown.innerHTML = '<div class="search-section"><div class="search-item" style="color:var(--text-muted);cursor:default;"><div class="search-item-icon">🔍</div><span>无匹配结果，按回车全局搜索</span></div></div>';
  } else {
    dropdown.innerHTML = '<div class="search-section"><div class="search-section-title">搜索结果</div>' +
      unique.map(s => `<div class="search-item" onclick="performSearch('${s.text}')"><div class="search-item-icon">${s.icon}</div><span>${s.text}</span><span style="margin-left:auto;font-size:11px;color:var(--text-muted);">${s.type}</span></div>`).join('') +
      '</div>';
  }
  dropdown.classList.add('show');
}

function performSearch(keyword) {
  const input = document.getElementById('globalSearch');
  if (input) input.value = keyword;
  
  // Save to history
  let history = [];
  try { history = JSON.parse(localStorage.getItem('tm_search_history') || '[]'); } catch(e) {}
  history = [keyword, ...history.filter(h => h !== keyword)].slice(0, 10);
  localStorage.setItem('tm_search_history', JSON.stringify(history));
  
  // Update frequency for hot search
  let freq = {};
  try { freq = JSON.parse(localStorage.getItem('tm_search_freq') || '{}'); } catch(e) {}
  freq[keyword] = (freq[keyword] || 0) + 1;
  localStorage.setItem('tm_search_freq', JSON.stringify(freq));
  
  const dropdown = document.getElementById('searchDropdown');
  if (dropdown) dropdown.classList.remove('show');
  
  showToast(`正在搜索「${keyword}」...`, 'success');
}

// ==================== Toast ====================
function showToast(message, type) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ==================== Skeleton ====================
function showSkeleton(containerId, template) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.dataset.originalContent = container.innerHTML;
  container.innerHTML = template || `
    <div class="skeleton-card">
      <div class="skeleton-card-header">
        <div class="skeleton skeleton-circle" style="width:40px;height:40px;"></div>
        <div style="flex:1;">
          <div class="skeleton skeleton-title" style="margin-bottom:8px;"></div>
          <div class="skeleton skeleton-text" style="width:40%;"></div>
        </div>
      </div>
      <div class="skeleton-card-body">
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text" style="width:80%;"></div>
        <div class="skeleton skeleton-text" style="width:60%;"></div>
      </div>
    </div>
  `;
}

function hideSkeleton(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (container.dataset.originalContent !== undefined) {
    container.innerHTML = container.dataset.originalContent;
    delete container.dataset.originalContent;
  }
}

function initApp(activePage) {
  if (typeof DataService !== 'undefined') {
    DataService.init();
  }
  renderSidebar(activePage);
  renderHeader();
  renderBreadcrumb(activePage);
}

// ===== Enhanced Chart Drawing Helpers =====

function drawBarChart(containerId, data, labels, colors) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const max = Math.max(...data);
  const id = 'bar-' + Math.random().toString(36).slice(2);
  // FIX: align-self:stretch overrides parent flex align-items:center so height:100% works
  let html = `<div style="display:flex; align-items:flex-end; justify-content:space-around; height:100%; padding:10px 0; align-self:stretch;" id="${id}">`;
  data.forEach((v, i) => {
    const h = Math.max((v / max) * 75, 4); // min 4% so tiny bars are visible
    html += `
      <div style="display:flex; flex-direction:column; align-items:center; gap:6px; flex:1; cursor:pointer;" onmouseenter="this.querySelector('.bar-col-${i}').style.opacity='1';this.querySelector('.bar-col-${i}').style.transform='scaleX(1.15)';" onmouseleave="this.querySelector('.bar-col-${i}').style.opacity='0.9';this.querySelector('.bar-col-${i}').style.transform='scaleX(1)';">
        <div style="font-size:11px; color:#64748b; font-weight:700; opacity:0; animation:fadeUp 0.4s ${i*0.08}s forwards;">${v.toLocaleString()}</div>
        <div style="width:28px; background:${colors[i]||'var(--primary)'}; border-radius:6px 6px 0 0; height:0; opacity:0.9; transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1); box-shadow:0 4px 12px ${colors[i]||'var(--primary)'}40;" class="bar-col-${i}"></div>
        <div style="font-size:11px; color:#94a3b8; font-weight:500;">${labels[i]}</div>
      </div>
    `;
  });
  html += '</div>';
  el.innerHTML = html;
  // Animate bars
  requestAnimationFrame(() => {
    setTimeout(() => {
      data.forEach((v, i) => {
        const h = Math.max((v / max) * 75, 4);
        const bar = document.querySelector(`#${id} .bar-col-${i}`);
        if (bar) bar.style.height = h + '%';
      });
    }, 50);
  });
}

function drawPieChart(containerId, data, labels, colors) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const total = data.reduce((a,b)=>a+b,0);
  const uid = 'pie-' + Math.random().toString(36).slice(2);
  let acc = 0;
  let paths = [];
  data.forEach((v, i) => {
    const start = acc;
    const pct = v / total;
    acc += pct;
    const end = acc;
    const [x1, y1] = [50 + 40*Math.cos(2*Math.PI*start), 50 + 40*Math.sin(2*Math.PI*start)];
    const [x2, y2] = [50 + 40*Math.cos(2*Math.PI*end), 50 + 40*Math.sin(2*Math.PI*end)];
    const large = pct > 0.5 ? 1 : 0;
    const d = `M50,50 L${x1},${y1} A40,40 0 ${large},1 ${x2},${y2} Z`;
    paths.push({ d, color: colors[i], pct, label: labels[i] });
  });

  let svg = `<svg viewBox="0 0 100 100" style="width:170px; height:170px; filter:drop-shadow(0 4px 12px rgba(0,0,0,0.08));">`;
  svg += `<defs><clipPath id="${uid}-clip"><circle cx="50" cy="50" r="0"><animate attributeName="r" from="0" to="40" dur="0.8s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1"/></clipPath></defs>`;
  svg += `<g clip-path="url(#${uid}-clip)" transform="rotate(-90 50 50)">`;
  paths.forEach((p, i) => {
    svg += `<path d="${p.d}" fill="${p.color}" stroke="#fff" stroke-width="1.5" opacity="0">
      <animate attributeName="opacity" from="0" to="0.95" dur="0.4s" begin="${0.3 + i*0.1}s" fill="freeze"/>
    </path>`;
  });
  svg += `</g></svg>`;

  let legend = '<div style="display:flex; flex-direction:column; gap:10px;">';
  paths.forEach((p, i) => {
    legend += `
      <div style="display:flex; align-items:center; gap:8px; font-size:12px; animation:fadeIn 0.4s ${0.5+i*0.1}s backwards;">
        <span style="width:10px; height:10px; border-radius:3px; background:${p.color}; box-shadow:0 2px 6px ${p.color}60;"></span>
        <span style="color:#475569; font-weight:500;">${p.label}</span>
        <span style="margin-left:auto; font-weight:700; color:#1e293b; font-size:13px;">${Math.round(p.pct*100)}%</span>
      </div>
    `;
  });
  legend += '</div>';

  el.innerHTML = `<div style="display:flex; align-items:center; gap:24px; justify-content:center; height:100%;">${svg}${legend}</div>`;
}

function drawLineChart(containerId, data, labels, color) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padLeft = 10, padRight = 4, padTop = 10, padBottom = 12;
  const chartW = 100 - padLeft - padRight;
  const chartH = 100 - padTop - padBottom;
  const plotH = chartH * 0.85;

  const points = data.map((v, i) => {
    const x = padLeft + (i / (data.length - 1)) * chartW;
    const y = padTop + plotH - ((v - min) / range) * plotH;
    return [x, y];
  });
  const pointsStr = points.map(p => p.join(',')).join(' ');

  // Y axis ticks (3 ticks)
  const yTicks = [max, min + range/2, min];
  let yAxis = '';
  yTicks.forEach((t, i) => {
    const y = padTop + (i / 2) * plotH;
    yAxis += `<text x="${padLeft-2}" y="${y+1}" text-anchor="end" font-size="4.5" fill="#94a3b8" font-weight="500">${Math.round(t)}</text>`;
    yAxis += `<line x1="${padLeft}" y1="${y}" x2="${100-padRight}" y2="${y}" stroke="#e2e8f0" stroke-width="0.3" stroke-dasharray="1,1"/>`;
  });

  // Area fill path
  const areaPath = `${pointsStr} ${padLeft+chartW},${padTop+plotH} ${padLeft},${padTop+plotH}`;

  let svg = `<svg viewBox="0 0 100 100" style="width:100%; height:100%; overflow:visible;">`;
  svg += `<defs>
    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="1.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>`;

  // Grid & Y labels
  svg += yAxis;

  // Area fill with clip animation
  svg += `<clipPath id="lineClip"><rect x="0" y="0" width="0" height="100"><animate attributeName="width" from="0" to="100" dur="1.2s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1"/></rect></clipPath>`;

  svg += `<g clip-path="url(#lineClip)">`;
  // Area
  svg += `<polygon points="${areaPath}" fill="url(#lineGrad)" opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.6s" begin="0.2s" fill="freeze"/>
  </polygon>`;
  // Line
  svg += `<polyline points="${pointsStr}" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>`;
  // Points
  points.forEach(([x, y], i) => {
    svg += `<circle cx="${x}" cy="${y}" r="2" fill="#fff" stroke="${color}" stroke-width="1">
      <animate attributeName="r" from="0" to="2" dur="0.3s" begin="${0.6 + i*0.1}s" fill="freeze"/>
    </circle>`;
    // Value labels
    svg += `<text x="${x}" y="${y-4}" text-anchor="middle" font-size="4.5" fill="${color}" font-weight="700" opacity="0">
      <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="${0.8 + i*0.1}s" fill="freeze"/>
      ${data[i]}
    </text>`;
  });
  svg += `</g>`;

  // X axis labels (inside SVG for perfect alignment with data points)
  labels.forEach((l, i) => {
    const x = padLeft + (i / (data.length - 1)) * chartW;
    svg += `<text x="${x}" y="97" text-anchor="middle" font-size="4.5" fill="#94a3b8" font-weight="500">${l}</text>`;
  });
  svg += `</svg>`;

  el.innerHTML = `<div style="width:100%; height:100%; padding:6px 0;">${svg}</div>`;
}


// Auto-close mobile sidebar on resize to desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeMobileSidebar();
  }
});
