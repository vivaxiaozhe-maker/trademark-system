const CaseWorkspace = (() => {
  const icons = {
    home: '<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-6h6v6"/>',
    cases: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18m-13 4h8m-8 3h6"/>',
    tasks: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 11 2 2 4-4m-6 7h10"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 19v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2m1-14a3 3 0 0 1 0 6m1 2a4 4 0 0 1 4 4v2"/>',
    brand: '<path d="M20 13 11 4H4v7l9 9a2 2 0 0 0 3 0l4-4a2 2 0 0 0 0-3Z"/><circle cx="8" cy="8" r="1"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    stamp: '<path d="M9 11a4 4 0 1 1 6 0l1 3H8zM5 14h14v4H5zM6 21h12"/>',
    link: '<path d="M10 13l4-4m-6 6-1 1a3 3 0 1 1-4-4l4-4a3 3 0 0 1 4 0m2 8a3 3 0 0 0 4 0l4-4a3 3 0 0 0-4-4l-1 1"/>',
    firm: '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h.01M15 10h.01M9 14h.01M15 14h.01m-5 7v-4h4v4"/>',
    charts: '<path d="M4 4v16h16M8 15l4-4 3 2 5-6"/>',
    sliders: '<path d="M4 7h16M4 12h16M4 17h16M8 5v4m8 1v4m-5 1v4"/>',
    search: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 4 4"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M6 12h12"/>',
    download: '<path d="M12 4v11m-4-4 4 4 4-4M5 16v4h14v-4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4m8-4v4m-4 7v3"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    file: '<path d="M6 3h8l4 4v14H6zM14 3v5h4m-9 5h6m-6 4h6"/>',
    check: '<path d="m5 12 4 4L19 6"/>'
  };
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const e = value => String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
  const icon = (name, size = 17) => {
    return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${icons[name] || ''}</svg>`;
  };
  const query = () => new URLSearchParams(location.search);
  const searchText = value => String(value ?? '').trim().toLocaleLowerCase('zh-CN');
  const compareText = (a, b) => String(a ?? '').localeCompare(String(b ?? ''), 'zh-CN', { numeric: true });
  const uniqueValues = (records, field) => [...new Set(records.map(row => row[field]).filter(Boolean))].sort(compareText);
  const allCases = () => DataService.getCases();
  const allTasks = () => DataService.getTodos();
  const taskFor = id => allTasks().find(task => String(task.id) === id);
  const relatedTasks = id => allTasks().filter(task => task.caseId === id);
  const isComplete = task => task.status === 'completed';
  const openCount = id => relatedTasks(id).filter(task => !isComplete(task)).length;

  const versionedPages = new Set(['monitor.html', 'cc.html', 'seal-process.html', 'tools.html']);

  function url(page, params = {}, hash = '') {
    const search = new URLSearchParams();
    if (versionedPages.has(page.split('/').pop())) search.set('ui', 'workbench');
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, value);
    });
    return page + (search.size ? '?' + search.toString() : '') + hash;
  }

  const isHome = document.body.dataset.view === 'home';
  const homeHref = isHome ? 'index.html' : '../index.html';
  const pageHref = path => isHome ? 'pages/' + path : path;
  const currentLink = () => (location.pathname.split('/').pop() || 'index.html') + location.search;

  const workspaceLabels = {
    'index.html': '工作台', 'case-detail.html': '案卷详情', 'doc-new.html': '新建文档',
    'cases.html': '案件管理', 'my-cases.html': '我的案件', 'drafts.html': '我的草稿',
    'todo.html': '待办事项', 'done.html': '已办事项', 'collab.html': '律所协作',
    'brand.html': '品牌管理', 'brand-map.html': '品牌图谱',
    'brand-auth-external.html': '授权外部使用', 'brand-auth-internal.html': '授权内部使用', 'search-case.html': '检索案卷', 'monitor.html': '监测中心', 'decision.html': '管理决策中心',
    'fees.html': '费用中心', 'report.html': '报告中心',
    'cc.html': '抄送案件', 'seal-process.html': '用印流程', 'tools.html': '商标工具 Link',
    'law-firm-management.html': '律所管理', 'staff-management.html': '员工管理', 'admin-users.html': '账号与权限'
  };
  const pageName = value => (value || '').replace(/^\.\.\/(?=index\.html(?:[?#]|$))/, '').split(/[?#]/, 1)[0];
  const pageLabel = value => workspaceLabels[pageName(value)] || '案件管理';

  function returnLink(value, fallback) {
    if (typeof value !== 'string' || value.length > 1600 || /[\r\n]/.test(value)) return fallback;
    if (/^\.\.\/index\.html(?:[?#]|$)/.test(value)) return value;
    const page = pageName(value);
    if (!Object.hasOwn(workspaceLabels, page)) return fallback;
    if (page === 'index.html') return '../' + value;
    if (!versionedPages.has(page)) return value;
    const target = new URL(value, location.href);
    target.searchParams.set('ui', 'workbench');
    return page + target.search + target.hash;
  }

  function navSection(source) {
    let page = pageName(source);
    while (page === 'case-detail.html' || page === 'doc-new.html' || page === 'case-new.html') {
      source = new URL(source, location.href).searchParams.get('from') || '';
      page = pageName(source);
    }
    if (['brand-map.html','brand-auth-external.html','brand-auth-internal.html'].includes(page)) return 'brand.html';
    return Object.hasOwn(workspaceLabels, page) ? page : 'cases.html';
  }

  const caseHref = (id, from, hash) => url(pageHref('case-detail.html'), { id, from }, hash);
  const taskHref = (task, from) => isComplete(task)
    ? url(pageHref('done.html'), { task: task.id, from })
    : url(pageHref('todo.html'), { case: task.caseId, task: task.id, from });
  const replaceQuery = params => history.replaceState(null, '', url(location.pathname, params, location.hash));

  function displayDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))
      && Number.isFinite(DataService.daysBetween(value, value)) ? value : '';
  }

  function deadlineInfo(value, today = DataService.getToday()) {
    const date = displayDate(value);
    if (!date) return { bucket: 'unknown', label: '未登记', tone: '' };
    const diff = DataService.daysBetween(today, date);
    const bucket = DataService.getDeadlineBucket(date, today);
    if (bucket === 'overdue') return { bucket, label: '逾期 ' + Math.abs(diff) + ' 天', tone: 'danger' };
    if (bucket === 'today') return { bucket, label: '今日到期', tone: 'danger' };
    return { bucket, label: '剩余 ' + diff + ' 天', tone: bucket === 'upcoming' ? 'warning' : '' };
  }

  function dateMarkup(value, { href, completed = false } = {}) {
    const date = displayDate(value);
    const { label, tone } = deadlineInfo(date);
    if (!date) return '<span class="wb-muted">未登记</span>';
    const time = `<time class="wb-date" datetime="${e(date)}">${e(date)}</time>`;
    return (href ? `<a class="wb-date-link" href="${e(href)}" aria-label="查看官方绝限 ${e(date)}">${time}</a>` : time)
      + (completed ? '' : `<span class="wb-date-state ${tone}">${e(label)}</span>`);
  }

  function chip(label, tone = '') {
    return `<span class="wb-chip${tone ? ' wb-tone-' + tone : ''}">${e(label)}</span>`;
  }

  function caseStatus(record) {
    if (record.enabled === false) return chip('已停用');
    const tone = { rejected: 'danger', registered: 'positive', defense_period: 'warning', pending: 'info', examining: 'info' }[record.statusCode];
    return chip(record.status || '未更新', tone);
  }

  function taskStatus(task) {
    if (isComplete(task)) return chip('已完成', 'positive');
    if (task.status === 'in_progress') return chip('处理中', 'info');
    return chip('待处理', 'warning');
  }

  function thumb(record, large = false) {
    const src = record.trademarkImage;
    const size = large ? 62 : 34;
    if (!/^(?:\.\.\/)?(?:assets|trademark-assets)\/[a-z0-9_.-]+\.(?:png|jpe?g|webp)$/i.test(src || '')) {
      return `<span class="wb-thumb" aria-hidden="true">${e(String(record.brandName || '商').slice(0, 1))}</span>`;
    }
    const relative = (isHome ? '' : '../') + src.replace(/^\.\.\//, '');
    return `<img class="wb-thumb" src="${e(relative)}" width="${size}" height="${size}" alt="">`;
  }

  function empty(title, message, action = '') {
    return `<div class="wb-empty"><h2>${e(title)}</h2><p>${e(message)}</p>${action}</div>`;
  }

  function notify(element, text, kind) {
    element.dataset.kind = kind || '';
    element.textContent = text;
  }

  function metrics(items, active) {
    return items.map(({ key, label, count, tone }) => `<button type="button" class="wb-metric${tone ? ' wb-metric-' + tone : ''}" data-metric="${e(key)}" aria-pressed="${active === key}">
      <span class="wb-metric-label">${tone ? '<span class="wb-dot" aria-hidden="true"></span>' : ''}${e(label)}</span>
      <span class="wb-metric-value">${new Intl.NumberFormat('zh-CN').format(count)}</span>
    </button>`).join('');
  }

  function options(values, first) {
    return `<option value="">${e(first)}</option>` + values.map(value => `<option value="${e(value)}">${e(value)}</option>`).join('');
  }

  function dateSort(a, b, field) {
    return compareText(displayDate(a[field]) || '9999-12-31', displayDate(b[field]) || '9999-12-31');
  }

  function refreshTaskCount() {
    const count = allTasks().filter(task => !isComplete(task)).length;
    document.querySelectorAll('[data-task-count]').forEach(el => {
      el.textContent = count;
      el.setAttribute('aria-label', count + ' 项未完成');
    });
  }

  function renderShell(active, crumbs) {
    const groups = [
      ['办理中心', [
        ['home', 'index.html', '工作台'],
        ['cases', 'cases.html', '案件管理'],
        ['tasks', 'todo.html', '待办事项']
      ]],
      ['案卷与资产', [
        ['cases', 'my-cases.html', '我的案件'],
        ['check', 'done.html', '已办事项'],
        ['file', 'drafts.html', '我的草稿'],
        ['brand', 'brand.html', '品牌管理'],
        ['search', 'search-case.html', '检索案卷'],
        ['mail', 'cc.html', '抄送案件']
      ]],
      ['协作与管理', [
        ['firm', 'collab.html', '律所协作'],
        ['charts', 'fees.html', '费用中心'],
        ['calendar', 'monitor.html', '监测中心'],
        ['charts', 'decision.html', '管理决策中心'],
        ['file', 'report.html', '报告中心'],
        ['stamp', 'seal-process.html', '用印流程'],
        ['link', 'tools.html', '商标工具 Link']
      ]],
      ['组织与权限', [
        ['firm', 'law-firm-management.html', '律所管理'],
        ['users', 'staff-management.html', '员工管理'],
        ['sliders', 'admin-users.html', '账号与权限']
      ]]
    ];

    const link = ([key, href, name]) => {
      const selected = href === active;
      const target = href === 'index.html' ? homeHref : url(pageHref(href));
      return `<a href="${e(target)}"${selected ? ' aria-current="page"' : ''}>${icon(key)}<span>${name}</span>${href === 'todo.html' ? '<span class="wb-nav-count" data-task-count></span>' : ''}</a>`;
    };
    const mark = '<span class="wb-mark" aria-hidden="true">mi</span>';
    const navigation = groups.map(([title, items]) =>
      `<div class="wb-nav-group"><p class="wb-nav-title">${title}</p>${items.map(link).join('')}</div>`).join('');
    const side = document.getElementById('workbench-sidebar');
    side.innerHTML = `
      <div class="wb-side-head">
        <a class="wb-brand" href="${homeHref}">${mark} 商标管理系统</a>
        <button class="wb-btn wb-menu-toggle" type="button" aria-haspopup="dialog" aria-controls="wb-menu">${icon('menu')} 全部导航</button>
      </div>
      <nav class="wb-nav" aria-label="系统导航">${navigation}</nav>
      <dialog class="wb-dialog wb-menu" id="wb-menu" aria-labelledby="wb-menu-title">
        <div class="wb-panel-head"><h2 id="wb-menu-title">系统导航</h2>
          <button class="wb-btn wb-btn-quiet" type="button" aria-label="关闭导航" autofocus>${icon('close')}</button>
        </div>
        <nav class="wb-menu-nav" aria-label="系统导航">${navigation}</nav>
      </dialog>`;
    const desktopNav = side.querySelector('.wb-nav');
    const activeNav = desktopNav.querySelector('[aria-current]');
    const scrollKey = 'trademark-workbench-navigation-scroll';
    const rememberMenu = () => {
      if (!desktopNav.clientHeight) return;
      try { sessionStorage.setItem(scrollKey, desktopNav.scrollTop); } catch {}
    };
    const restoreMenu = () => {
      if (!desktopNav.clientHeight) return;
      try { desktopNav.scrollTop = Number(sessionStorage.getItem(scrollKey)) || 0; } catch {}
      if (activeNav) {
        const row = activeNav.getBoundingClientRect();
        const area = desktopNav.getBoundingClientRect();
        if (row.top < area.top) desktopNav.scrollTop += row.top - area.top - 6;
        if (row.bottom > area.bottom) desktopNav.scrollTop += row.bottom - area.bottom + 6;
      }
    };
    const menu = side.querySelector('#wb-menu');
    const compact = matchMedia('(max-width: 850px)');
    const drawerKey = scrollKey + '-compact';
    side.querySelector('.wb-menu-toggle').addEventListener('click', () => {
      menu.showModal();
      try { menu.scrollTop = Number(sessionStorage.getItem(drawerKey)) || 0; } catch {}
      const current = menu.querySelector('a[aria-current]');
      if (!current) return;
      const row = current.getBoundingClientRect();
      const top = menu.querySelector('.wb-panel-head').getBoundingClientRect().bottom;
      const bottom = menu.getBoundingClientRect().bottom - menu.clientTop;
      if (row.top < top) menu.scrollTop += row.top - top - 6;
      else if (row.bottom > bottom) menu.scrollTop += row.bottom - bottom + 6;
    });
    menu.addEventListener('scroll', () => {
      if (menu.open) try { sessionStorage.setItem(drawerKey, menu.scrollTop); } catch {}
    }, { passive: true });
    menu.querySelector('button').addEventListener('click', () => menu.close());
    menu.addEventListener('click', event => { if (event.target === menu) menu.close(); });
    compact.addEventListener('change', () => {
      if (!compact.matches && menu.open) menu.close();
      restoreMenu();
    });
    desktopNav.addEventListener('scroll', rememberMenu, { passive: true });
    side.addEventListener('click', event => { if (event.target.closest('a')) rememberMenu(); });
    window.addEventListener('pagehide', rememberMenu);
    window.addEventListener('pageshow', () => { restoreMenu(); refreshTaskCount(); });
    restoreMenu();
    const trail = (active === 'index.html' || pageName(crumbs[0]?.[1]) === 'index.html' ? crumbs : [['工作台', homeHref], ...crumbs]).map(([name, href]) => {
      return href ? `<a href="${e(href)}">${e(name)}</a>` : `<span aria-current="page">${e(name)}</span>`;
    }).join(icon('chevron', 12));
    document.getElementById('workbench-header').innerHTML = `
      <nav class="wb-crumbs" aria-label="当前位置">${trail}</nav>
      <div class="wb-top-meta">
        <span class="wb-demo">演示数据</span>
        <span class="wb-person"><span class="wb-avatar" aria-hidden="true">M</span> ${e(DataService.CURRENT_USER.name)}</span>
      </div>`;
    refreshTaskCount();
  }

  function downloadCsv(name, headings, rows) {
    const cell = value => {
      const text = String(value ?? '');
      const safeText = /^[\s]*[=+\-@]|^[\t\r\n]/.test(text) ? "'" + text : text;
      return '"' + safeText.replace(/"/g, '""') + '"';
    };
    const csv = '\uFEFF' + [headings, ...rows].map(row => row.map(cell).join(',')).join('\r\n');
    const link = document.createElement('a');
    const resource = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.href = resource;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(resource), 1000);
  }

  return {
    e, icon, query, searchText, compareText, uniqueValues, allCases, allTasks, taskFor, relatedTasks, isComplete, openCount,
    url, pageHref, currentLink, pageName, pageLabel, returnLink, navSection, caseHref, taskHref, replaceQuery, deadlineInfo, dateMarkup, chip, caseStatus, taskStatus,
    thumb, empty, notify, metrics, options, dateSort, renderShell, refreshTaskCount, downloadCsv
  };
})();
