document.addEventListener('DOMContentLoaded', () => {
  const W = CaseWorkspace;
  const D = DataService;
  const main = document.getElementById('main');
  const params = W.query();
  const canEdit = document.body.dataset.view === 'staff-management';
  const roles = D.STAFF_ROLES;
  const page = canEdit ? 'staff-management.html' : 'admin-users.html';
  const title = canEdit ? '员工管理' : '账号与权限';
  const staffOrigin = !canEdit && W.pageName(params.get('from')) === 'staff-management.html' ? W.returnLink(params.get('from'), '') : '';
  const directory = canEdit || params.get('tab') !== 'roles';
  const states = { active: ['已启用','positive'], disabled: ['已停用',''] };
  const kinds = { internal: '内部员工', external: '外部合作账号' };
  const roleFor = id => Object.hasOwn(roles, id) ? roles[id] : null;
  const option = (id,label) => `<option value="${W.e(id)}">${W.e(label)}</option>`;
  const staffHref = user => W.url('staff-management.html', { user });
  const accountHref = (user, role = '') => W.url('admin-users.html', { user, role, from: canEdit ? W.currentLink() : staffOrigin });
  const directoryBack = W.pageName(params.get('directory')) === 'admin-users.html'
    ? W.returnLink(params.get('directory'), '') : '';
  const roleHref = role => W.url('admin-users.html', { tab: 'roles', role, from: staffOrigin, directory: directory ? W.currentLink() : directoryBack });
  const avatar = user => `<span class="wb-org-monogram" data-kind="${W.e(user.kind)}" aria-hidden="true">${W.e(String(user.name || '员').slice(0,1))}</span>`;
  const statusChip = user => W.chip(...(states[user.status] || ['未登记','']));
  const now = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', dateStyle: 'medium', timeStyle: 'short' });
  const heading = (label, value) => `<div><dt>${W.e(label)}</dt><dd>${W.e(value || '未登记')}</dd></div>`;
  const metrics = items => items.map(([label,count])=>`<div><dt>${label}</dt><dd>${count}</dd></div>`).join('');

  const modules = role => `<dl class="wb-org-roles">${role.permissions.map(([label,scope]) =>
    `<div class="wb-org-module"><dt>${W.e(label)}</dt><dd>${W.e(scope)}</dd></div>`).join('')}</dl>`;
  function focusDetail(panel) {
    panel.querySelector('h2').focus();
    if (matchMedia('(max-width:820px)').matches) panel.scrollIntoView({ block: 'start' });
  }

  W.renderShell(page, [...(staffOrigin ? [['员工管理', staffOrigin]] : []), [title]]);
  main.innerHTML = `<div class="wb-head"><div><h1>${title}</h1></div>
    <div class="wb-actions"><a class="wb-btn" href="${canEdit ? 'admin-users.html' : W.e(staffOrigin || 'staff-management.html')}">${W.icon(canEdit ? 'sliders' : 'users',16)} ${canEdit ? '账号与权限' : '员工管理'}</a></div></div>
    ${canEdit ? '' : `<nav class="wb-steps wb-org-view-links" aria-label="账号与权限视图">
      <a href="${W.e(directoryBack || W.url('admin-users.html', { from: staffOrigin }))}"${directory ? ' aria-current="page"' : ''}>账号目录</a>
      <a href="${roleHref('')}"${directory ? '' : ' aria-current="page"'}>角色权限</a></nav>`}
    <div class="wb-status" id="org-notice" role="status"></div>
    <dl class="wb-panel wb-org-metrics" id="org-metrics"></dl>
    <div id="org-content"></div>`;
  const notice = main.querySelector('#org-notice');
  const topMetrics = main.querySelector('#org-metrics');
  const content = main.querySelector('#org-content');

  function renderDirectory() {
    const listTitle = canEdit ? '员工目录' : '账号目录';
    const possibleRoles = Object.entries(roles).filter(([,role])=>!canEdit || role.kind === 'internal');
    let department = params.get('department') || '';
    let requestedRole = roleFor(params.get('role')) ? params.get('role') : '';
    let state = Object.hasOwn(states, params.get('status')) ? params.get('status') : '';
    let query = params.get('q') || '';
    let selected = params.get('user') || '';
    content.innerHTML = `<div class="wb-asset-grid">
      <section class="wb-panel" aria-labelledby="org-directory-title">
        <div class="wb-filter wb-org-control">
          <div class="wb-toolbar" role="search"><label class="wb-search">${W.icon('search')}<span class="wb-sr">搜索姓名、部门或账号</span>
            <input name="q" type="search" placeholder="搜索姓名、部门或账号…" maxlength="100" autocomplete="off"></label>
            <button type="button" class="wb-btn wb-org-filter-toggle" aria-controls="org-fields" aria-expanded="false">筛选</button></div>
          <div class="wb-toolbar" id="org-fields">
            <label class="wb-inline-select">部门<select class="wb-input" name="department"></select></label>
            <label class="wb-inline-select">角色<select class="wb-input" name="role">${option('','全部角色')}${possibleRoles.map(([id,role])=>option(id,role.name)).join('')}</select></label>
            <label class="wb-inline-select">状态<select class="wb-input" name="status">${option('','全部状态')}${Object.entries(states).map(([key,[label]])=>option(key,label)).join('')}</select></label>
          </div>
          <p class="wb-small wb-muted" id="org-filter-summary" hidden></p>
        </div>
        <div class="wb-panel-head"><h2 class="wb-result" id="org-directory-title">${listTitle}</h2><span class="wb-small wb-muted" id="org-count" role="status"></span></div>
        <div id="org-list"></div>
      </section>
      <section class="wb-panel wb-asset-detail wb-org-detail" id="org-detail" aria-labelledby="org-detail-title" hidden></section>
    </div>
    ${canEdit ? `<dialog class="wb-dialog wb-org-dialog" id="role-editor" aria-labelledby="role-editor-title">
      <div class="wb-panel-head"><h2 id="role-editor-title">调整员工角色</h2><button class="wb-btn wb-btn-quiet" type="button" data-close-role aria-label="关闭">${W.icon('close')}</button></div>
      <form class="wb-panel-body" id="role-form">
        <p class="wb-small wb-muted" id="role-editor-person"></p>
        <label class="wb-field">新角色<select class="wb-input" name="roleId" required></select></label>
        <div class="wb-org-note" id="role-scope-preview" aria-live="polite"></div>
        <div class="wb-status" id="role-error" role="alert"></div>
        <div class="wb-form-actions"><button type="button" class="wb-btn" data-close-role>取消</button><button class="wb-btn wb-btn-primary" type="submit">保存角色</button></div>
      </form>
    </dialog>` : ''}`;

    const search = content.querySelector('input');
    const toggle = content.querySelector('.wb-org-filter-toggle');
    const filterSummary = content.querySelector('#org-filter-summary');
    toggle.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', String(toggle.getAttribute('aria-expanded') !== 'true'));
    });
    const deptSelect = content.querySelector('[name=department]');
    const roleSelect = content.querySelector('[name=role]');
    const statusSelect = content.querySelector('[name=status]');
    const list = content.querySelector('#org-list');
    const panel = content.querySelector('#org-detail');
    const dialog = content.querySelector('#role-editor');
    let editing = null;
    let directoryChanged = false;
    search.value = query;
    if (!possibleRoles.some(([id])=>id===requestedRole)) requestedRole = '';
    roleSelect.value = requestedRole;
    statusSelect.value = state;

    function detail(user, focus) {
      panel.hidden = !user;
      if (!user) return;
      const role = roleFor(user.roleId);
      const history = user.roleChange;
      const previous = history && roleFor(history.previousRoleId);
      const beforeAfter = history && previous && role
        ? `<div class="wb-org-section wb-org-note"><strong>最近一次角色变更</strong>
            <span>${W.e(previous.name)} → ${W.e(role.name)}</span>
            <span>${W.e(history.actor)} · ${W.e(now.format(new Date(history.changedAt)))}</span></div>` : '';
      panel.innerHTML = `<div class="wb-panel-head"><div class="wb-case-cell">${avatar(user)}<div>
        <h2 id="org-detail-title" class="wb-wrap" tabindex="-1">${W.e(user.name)}</h2>
        <p class="wb-muted wb-small">${W.e(kinds[user.kind] || '演示账号')} · <span class="wb-mono">${W.e(user.id)}</span></p>
      </div></div>${statusChip(user)}</div>
        <div class="wb-panel-body wb-asset-detail-body">
          <dl class="wb-key-values">${heading('所属部门',user.department)}${heading('当前角色',role?.name)}
            ${heading('演示数据范围',role?.scope)}</dl>
          <div class="wb-asset-foot wb-actions">
            ${canEdit ? `<button class="wb-btn wb-btn-primary" type="button" id="edit-staff-role">${W.icon('sliders',15)} 调整角色</button>
              <a class="wb-btn" href="${W.e(accountHref(user.id))}">查看该账号权限 ${W.icon('arrow',15)}</a>`
              : `${role ? `<a class="wb-btn wb-btn-primary" href="${W.e(roleHref(user.roleId))}">查看角色权限 ${W.icon('arrow',15)}</a>` : ''}
              ${user.kind === 'internal' ? `<a class="wb-btn" href="${W.e(staffHref(user.id))}">前往员工管理</a>` : ''}`}
          </div>
          ${beforeAfter}
          ${role ? `<div class="wb-org-section"><h3>${canEdit ? '角色对应模块' : '模块权限'}</h3>
            ${canEdit ? `<div class="wb-org-tags">${role.permissions.map(([label])=>W.chip(label)).join('')}</div>` : modules(role)}</div>` : ''}
          <button type="button" class="wb-btn wb-org-back" data-back-to-list>返回${listTitle}</button>
        </div>`;
      if (focus) focusDetail(panel);
    }

    function render({ keepRows = false, focus = false } = {}) {
      const users = D.getStaff().filter(user => !canEdit || user.kind === 'internal');
      const departments = W.uniqueValues(users,'department');
      if (!departments.includes(department)) department = '';
      deptSelect.innerHTML = option('','全部部门') + departments.map(name=>option(name,name)).join('');
      deptSelect.value = department;
      const activeFilters = [department, roleFor(requestedRole)?.name, states[state]?.[0]].filter(Boolean);
      toggle.textContent = activeFilters.length ? `筛选（${activeFilters.length}）` : '筛选';
      filterSummary.hidden = !activeFilters.length;
      filterSummary.textContent = activeFilters.join(' · ');
      const tokens = W.searchText(query).split(/\s+/).filter(Boolean);
      const visible = users.filter(user => (!department || user.department === department) &&
        (!requestedRole || user.roleId === requestedRole) && (!state || user.status === state) &&
        tokens.every(token => [user.id,user.name,user.department].some(value=>W.searchText(value).includes(token))));
      const user = visible.find(record=>record.id===selected) || visible[0];
      selected = user?.id || '';
      W.replaceQuery({ q: query, department, role: requestedRole, status: state, user: selected, from: staffOrigin });
      if (!canEdit) main.querySelector('.wb-org-view-links a:last-child').href = roleHref('');
      if (!keepRows) {
        topMetrics.innerHTML = metrics([
          [canEdit ? '内部员工' : '演示账号',users.length],
          ['已启用',users.filter(row=>row.status==='active').length],
          ['使用中的角色',new Set(users.map(row=>row.roleId).filter(id=>roleFor(id))).size]
        ]);
        content.querySelector('#org-count').textContent = visible.length + ' 位';
        list.innerHTML = visible.length ? `<div class="wb-org-columns" aria-hidden="true"><span>${canEdit ? '员工' : '账号'}／部门</span><span>当前角色</span><span>状态</span></div><ul class="wb-asset-list">${visible.map(record=>`<li>
          <button class="wb-asset-row wb-org-row" type="button" data-user="${W.e(record.id)}" aria-controls="org-detail" aria-pressed="${record.id===selected}">
            ${avatar(record)}<span class="wb-asset-ident"><strong class="wb-wrap">${W.e(record.name)}</strong>
              <span class="wb-muted wb-small">${W.e(record.department)}</span></span>
            <span class="wb-org-column">${W.e(roleFor(record.roleId)?.name || '未分配角色')}</span>
            ${statusChip(record)} ${W.icon('chevron',15)}</button></li>`).join('')}</ul>`
          : W.empty('没有符合条件的成员','可调整关键词、部门、角色或状态。');
      } else list.querySelectorAll('[data-user]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.user===selected));
      panel.classList.toggle('wb-org-selected', keepRows || focus);
      detail(user,focus);
    }

    search.addEventListener('input',()=>{ query = search.value.trim(); render(); });
    deptSelect.addEventListener('change',()=>{ department = deptSelect.value; render(); });
    roleSelect.addEventListener('change',()=>{ requestedRole = roleSelect.value; render(); });
    statusSelect.addEventListener('change',()=>{ state = statusSelect.value; render(); });
    list.addEventListener('click',event=>{
      const button = event.target.closest('[data-user]');
      if (!button) return;
      selected = button.dataset.user;
      render({ keepRows: true, focus: event.detail===0 || matchMedia('(max-width:820px)').matches });
    });
    panel.addEventListener('click', event => {
      if (event.target.closest('[data-back-to-list]')) list.querySelector('[aria-pressed="true"]')?.focus();
    });
    if (dialog) {
      const form = dialog.querySelector('form');
      const select = form.elements.roleId;
      const submit = form.querySelector('[type=submit]');
      const err = dialog.querySelector('#role-error');
      function updatePreview() {
        const role = roleFor(select.value);
        dialog.querySelector('#role-scope-preview').textContent = role
          ? role.scope + ' · ' + role.description : '请选择有效角色。';
        submit.disabled = !role || select.value === editing.roleId;
      }
      panel.addEventListener('click', event=>{
        if (!event.target.closest('#edit-staff-role')) return;
        editing = D.getStaff().find(record=>record.id===selected && record.kind==='internal');
        if (!editing) return;
        dialog.querySelector('#role-editor-person').textContent = editing.name + ' · 当前角色 ' + (roleFor(editing.roleId)?.name || '未分配');
        select.innerHTML = possibleRoles.map(([id,role])=>option(id,role.name)).join('');
        select.value = editing.roleId;
        W.notify(err,'');
        updatePreview();
        dialog.showModal();
      });
      dialog.addEventListener('close', () => {
        if (directoryChanged) {
          directoryChanged = false;
          render();
          panel.querySelector('#edit-staff-role')?.focus();
        }
        editing = null;
      });
      select.addEventListener('change',updatePreview);
      dialog.addEventListener('click', event=>{ if (event.target.closest('[data-close-role]')) dialog.close(); });
      form.addEventListener('submit', event=>{
        event.preventDefault();
        if (!editing || submit.disabled) return;
        const updated = D.setStaffRole(editing.id,select.value,editing.roleId);
        if (!updated) {
          const current = D.getStaff().find(user => user.id === editing.id);
          const message = current?.roleId !== editing.roleId
            ? '账号已在其他页面更新。请关闭窗口并重新打开后再调整。'
            : '角色未保存。请检查浏览器存储后重试。';
          return W.notify(err,message,'error');
        }
        editing = null;
        directoryChanged = false;
        dialog.close();
        selected = updated.id;
        if (requestedRole && requestedRole !== updated.roleId) roleSelect.value = requestedRole = '';
        render({ focus: true });
        W.notify(notice, updated.name + ' 的角色已更新为「' + roleFor(updated.roleId).name + '」。','success');
      });
    }
    window.addEventListener('pageshow', event=>{ if (event.persisted) render(); });
    window.addEventListener('storage', event => {
      if (event.key !== D.STAFF_STORAGE_KEY) return;
      if (dialog?.open) directoryChanged = true;
      else render();
    });
    render({ focus: Boolean(staffOrigin && params.get('user') && matchMedia('(max-width:820px)').matches) });
  }

  function renderRoles() {
    let selected = roleFor(params.get('role')) ? params.get('role') : Object.keys(roles)[0];
    content.innerHTML = `<div class="wb-asset-grid">
      <section class="wb-panel" aria-labelledby="roles-list-title"><div class="wb-panel-head"><h2 id="roles-list-title">角色目录</h2></div><div id="roles-list"></div></section>
      <section class="wb-panel wb-asset-detail wb-org-detail" id="roles-detail" aria-labelledby="roles-detail-title"></section></div>`;
    const list = content.querySelector('#roles-list');
    const panel = content.querySelector('#roles-detail');
    function draw({ keepRows = false, focus = false } = {}) {
      const users = D.getStaff();
      const current = roles[selected];
      const memberships = new Map(Object.keys(roles).map(id=>[id,users.filter(user=>user.roleId===id)]));
      const members = memberships.get(selected);
      W.replaceQuery({ tab: 'roles', role: selected, from: staffOrigin, directory: directoryBack });
      if (!keepRows) {
        topMetrics.innerHTML = metrics([['角色总数',Object.keys(roles).length],['已配置账号',users.filter(user=>roleFor(user.roleId)).length],['有成员的角色',[...memberships.values()].filter(group=>group.length).length]]);
        list.innerHTML = `<ul class="wb-asset-list">${Object.entries(roles).map(([id,role])=>`<li>
          <button class="wb-asset-row wb-org-row" type="button" data-role="${id}" aria-controls="roles-detail" aria-pressed="${id===selected}">
            <span class="wb-org-monogram" aria-hidden="true">${W.icon('sliders',16)}</span>
            <span class="wb-asset-ident"><strong class="wb-wrap">${W.e(role.name)}</strong><span class="wb-small wb-muted">${W.e(role.scope)}</span></span>
            <span class="wb-small wb-muted">${memberships.get(id).length} 位</span>${W.icon('chevron',15)}</button></li>`).join('')}</ul>`;
      } else list.querySelectorAll('[data-role]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.role===selected));
      panel.classList.toggle('wb-org-selected', keepRows);
      panel.innerHTML = `<div class="wb-panel-head"><div><h2 id="roles-detail-title" tabindex="-1">${W.e(current.name)}</h2>
        <p class="wb-muted wb-small">${W.e(current.description)}</p></div>${W.chip(current.kind==='external' ? '外部合作' : '内部角色','info')}</div>
        <div class="wb-panel-body wb-asset-detail-body">
          <dl class="wb-key-values">${heading('数据范围',current.scope)}${heading('关联账号',members.length+' 位')}</dl>
          <div class="wb-org-section"><h3>模块权限</h3>${modules(current)}</div>
          <div class="wb-org-section wb-asset-foot"><h3>角色成员</h3>
            ${members.length ? `<div class="wb-org-tags">${members.map(user=>`<a class="wb-btn wb-btn-small" href="${W.e(accountHref(user.id,selected))}">${W.e(user.name)}</a>`).join('')}</div>`
            : '<p class="wb-muted wb-small">当前暂无账号使用此角色。</p>'}</div>
          <button type="button" class="wb-btn wb-org-back" data-back-to-roles>返回角色目录</button>
        </div>`;
      if (focus) focusDetail(panel);
    }
    panel.addEventListener('click', event => {
      if (event.target.closest('[data-back-to-roles]')) list.querySelector('[aria-pressed="true"]')?.focus();
    });
    list.addEventListener('click', event=>{
      const button = event.target.closest('[data-role]');
      if (!button || !roleFor(button.dataset.role)) return;
      selected = button.dataset.role;
      draw({ keepRows: true, focus: event.detail===0 || matchMedia('(max-width:820px)').matches });
    });
    window.addEventListener('pageshow', event=>{ if (event.persisted) draw(); });
    window.addEventListener('storage', event=>{ if (event.key === D.STAFF_STORAGE_KEY) draw(); });
    draw();
  }

  if (directory) renderDirectory();
  else renderRoles();
});
