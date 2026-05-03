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
      { label: "品牌图谱", page: "brand-map", href: "pages/brand-map.html" }
    ]}
  ]},
  { group: "协作与费用", items: [
    { label: "律所协作中心", icon: "🤝", page: "collab", href: "pages/collab.html" },
    { label: "费用中心", icon: "💰", page: "fees", href: "pages/fees.html", children: [
      { label: "账单导入", page: "fees-bills", href: "pages/fees.html?tab=bills" },
      { label: "费用总览", page: "fees-overview", href: "pages/fees.html?tab=overview" },
      { label: "付款审批", page: "fees-approval", href: "pages/fees.html?tab=approval" },
      { label: "费用分析", page: "fees-analysis", href: "pages/fees.html?tab=analysis" }
    ]}
  ]},
  { group: "决策与监测", items: [
    { label: "管理决策中心", icon: "📈", page: "decision", href: "pages/decision.html" },
    { label: "监测中心", icon: "🔍", page: "monitor", href: "pages/monitor.html" },
    { label: "商标工具Link", icon: "🔗", page: "tools", href: "pages/tools.html" }
  ]}
];

function resolveHref(href) {
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
      <div class="logo-icon">TM</div>
      <div class="logo-text">商标管理系统</div>
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
             onclick="${hasChildren ? `toggleSubNav(this)` : `navigateTo(resolveHref('${item.href}'))`}">
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
            <div class="nav-item ${childActive ? 'active' : ''}" onclick="navigateTo(resolveHref('${child.href}'))">
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
  
  const unreadCount = AppData.messages.filter(m => !m.read).length;
  
  header.innerHTML = `
    <div class="header-search">
      <span style="color:var(--text-muted);font-size:14px;">🔍</span>
      <input type="text" placeholder="搜索案件、商标、律所、文档..." id="globalSearch">
    </div>
    <div class="header-actions">
      <div class="btn-icon" title="消息通知" onclick="toggleMessagePanel()">
        🔔
        ${unreadCount > 0 ? `<span class="badge">${unreadCount}</span>` : ''}
      </div>
      <div class="btn-icon" title="帮助">❓</div>
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
  window.location.href = href;
}

function toggleMessagePanel() {
  let panel = document.querySelector('.message-panel');
  if (panel) {
    panel.remove();
    return;
  }
  
  panel = document.createElement('div');
  panel.className = 'message-panel';
  panel.style.cssText = `
    position:absolute; top:52px; right:20px; width:320px;
    background:#fff; border-radius:12px; box-shadow:0 10px 40px rgba(0,0,0,0.12);
    border:1px solid #e2e8f0; z-index:200; overflow:hidden;
  `;
  
  let html = `
    <div style="padding:12px 16px; border-bottom:1px solid #e2e8f0; font-weight:600; font-size:14px;">
      消息通知
    </div>
    <div style="max-height:360px; overflow-y:auto;">
  `;
  
  AppData.messages.forEach(m => {
    html += `
      <div style="padding:12px 16px; border-bottom:1px solid #f1f5f9; cursor:pointer; ${!m.read?'background:#eff6ff;':''}">
        <div style="font-size:13px; font-weight:${!m.read?'600':'400'}; color:${!m.read?'#2563eb':'#1e293b'};">${m.title}</div>
        <div style="font-size:11px; color:#94a3b8; margin-top:4px;">${m.time}</div>
      </div>
    `;
  });
  
  html += `</div>
    <div style="padding:10px 16px; text-align:center; border-top:1px solid #e2e8f0;">
      <a href="#" style="font-size:13px; color:#2563eb; font-weight:500;">查看全部消息</a>
    </div>
  `;
  
  panel.innerHTML = html;
  document.querySelector('.top-header').appendChild(panel);
  
  document.addEventListener('click', function close(e) {
    if (!panel.contains(e.target) && !e.target.closest('.btn-icon')) {
      panel.remove();
      document.removeEventListener('click', close);
    }
  });
}

function initApp(activePage) {
  renderSidebar(activePage);
  renderHeader();
}

// Simple chart drawing helpers
function drawBarChart(containerId, data, labels, colors) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const max = Math.max(...data);
  let html = '<div style="display:flex; align-items:flex-end; justify-content:space-around; height:100%; padding:10px 0;">';
  data.forEach((v, i) => {
    const h = (v / max) * 80;
    html += `
      <div style="display:flex; flex-direction:column; align-items:center; gap:6px; flex:1;">
        <div style="font-size:11px; color:#64748b; font-weight:600;">${v}</div>
        <div style="width:28px; background:${colors[i]||'#2563eb'}; border-radius:4px 4px 0 0; height:${h}%; opacity:0.85; transition:all 0.3s;"></div>
        <div style="font-size:11px; color:#94a3b8;">${labels[i]}</div>
      </div>
    `;
  });
  html += '</div>';
  el.innerHTML = html;
}

function drawPieChart(containerId, data, labels, colors) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const total = data.reduce((a,b)=>a+b,0);
  let acc = 0;
  let svg = `<svg viewBox="0 0 100 100" style="width:180px; height:180px; transform:rotate(-90deg);">`;
  data.forEach((v, i) => {
    const pct = v / total;
    const [x1, y1] = [50 + 40*Math.cos(2*Math.PI*acc), 50 + 40*Math.sin(2*Math.PI*acc)];
    acc += pct;
    const [x2, y2] = [50 + 40*Math.cos(2*Math.PI*acc), 50 + 40*Math.sin(2*Math.PI*acc)];
    const large = pct > 0.5 ? 1 : 0;
    svg += `<path d="M50,50 L${x1},${y1} A40,40 0 ${large},1 ${x2},${y2} Z" fill="${colors[i]}" stroke="#fff" stroke-width="1"/>`;
  });
  svg += `</svg>`;
  
  let legend = '<div style="display:flex; flex-direction:column; gap:8px;">';
  data.forEach((v, i) => {
    legend += `
      <div style="display:flex; align-items:center; gap:8px; font-size:12px;">
        <span style="width:10px; height:10px; border-radius:50%; background:${colors[i]};"></span>
        <span style="color:#475569;">${labels[i]}</span>
        <span style="margin-left:auto; font-weight:600; color:#1e293b;">${Math.round(v/total*100)}%</span>
      </div>
    `;
  });
  legend += '</div>';
  
  el.innerHTML = `<div style="display:flex; align-items:center; gap:20px; justify-content:center; height:100%;">${svg}${legend}</div>`;
}

function drawLineChart(containerId, data, labels, color) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 90 + 5;
    const y = 90 - ((v - min) / range) * 70 - 10;
    return `${x},${y}`;
  }).join(' ');
  
  let svg = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%;">`;
  svg += `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  
  data.forEach((v, i) => {
    const x = (i / (data.length - 1)) * 90 + 5;
    const y = 90 - ((v - min) / range) * 70 - 10;
    svg += `<circle cx="${x}" cy="${y}" r="0.8" fill="${color}"/>`;
  });
  
  svg += `</svg>`;
  
  let xLabels = '<div style="display:flex; justify-content:space-between; padding:0 10px; margin-top:4px;">';
  labels.forEach(l => xLabels += `<span style="font-size:10px; color:#94a3b8;">${l}</span>`);
  xLabels += '</div>';
  
  el.innerHTML = `<div style="height:calc(100% - 20px);">${svg}</div>${xLabels}`;
}
