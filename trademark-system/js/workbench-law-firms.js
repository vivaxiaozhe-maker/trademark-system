document.addEventListener('DOMContentLoaded', () => {
  const W = CaseWorkspace;
  const D = DataService;
  const main = document.getElementById('main');
  const params = W.query();
  const states = { active: ['合作中', 'positive'], paused: ['已暂停', ''] };
  const today = D.getToday();
  let query = params.get('q') || '';
  let status = Object.hasOwn(states, params.get('status')) ? params.get('status') : '';
  let selected = params.get('firm') || '';
  let visible = [];

  W.renderShell('law-firm-management.html', [['律所管理']]);
  main.innerHTML = `
    <div class="wb-head"><div><h1>律所管理</h1></div>
      <div class="wb-actions"><a class="wb-btn" href="collab.html">律所协作</a><button class="wb-btn wb-btn-primary" type="button" id="create-firm">${W.icon('plus')} 新增律所</button></div></div>
    <div class="wb-status" role="status" id="firm-notice"></div>
    <dl class="wb-panel wb-org-metrics" id="firm-metrics"></dl>
    <div class="wb-asset-grid">
      <section class="wb-panel" aria-labelledby="firm-list-title">
        <div class="wb-filter wb-asset-tools wb-org-control" role="search">
          <label class="wb-search">${W.icon('search')}<span class="wb-sr">搜索律所或对接人</span><input name="q" id="firm-search" type="search" placeholder="搜索律所或对接人…" maxlength="100" autocomplete="off"></label>
          <label class="wb-inline-select">合作状态<select id="firm-status" class="wb-input" name="status"><option value="">全部</option>
            ${Object.entries(states).map(([key,[label]])=>`<option value="${key}">${label}</option>`).join('')}</select></label>
        </div>
        <div class="wb-panel-head"><h2 class="wb-result" id="firm-list-title">合作律所</h2><span class="wb-small wb-muted" id="firm-count" role="status"></span>
          <button class="wb-btn wb-btn-small" id="firm-export" type="button">${W.icon('download',14)} 导出清单</button></div>
        <div id="firm-list"></div>
      </section>
      <section class="wb-panel wb-asset-detail wb-org-detail" id="firm-profile" aria-labelledby="firm-profile-title" hidden></section>
    </div>
    <dialog class="wb-dialog wb-org-dialog" id="firm-dialog" aria-labelledby="firm-dialog-title">
      <div class="wb-panel-head"><h2 id="firm-dialog-title">新增律所</h2><button type="button" class="wb-btn wb-btn-quiet" data-dismiss-firm aria-label="关闭">${W.icon('close')}</button></div>
      <form class="wb-panel-body" id="firm-profile-form" autocomplete="off">
        <div class="wb-fields">
          <label class="wb-field wb-field-wide">律所名称<input class="wb-input" name="name" required maxlength="100"></label>
          <label class="wb-field">对接人<input class="wb-input" name="contact" maxlength="80"></label>
          <label class="wb-field">联系邮箱<input class="wb-input" name="email" type="email" maxlength="150"></label>
          <label class="wb-field">续期日期<input class="wb-input" name="renewDate" type="date"></label>
          <label class="wb-field">报价范围<input class="wb-input" name="feeRange" maxlength="80" placeholder="例如，¥300–500／小时"></label>
          <label class="wb-field">合作状态<select class="wb-input" name="status"><option value="active">合作中</option><option value="paused">已暂停</option></select></label>
        </div>
        <div class="wb-status" id="firm-error" role="alert"></div>
        <div class="wb-form-actions"><button class="wb-btn" type="button" data-dismiss-firm>取消</button><button class="wb-btn wb-btn-primary" type="submit">保存档案</button></div>
      </form>
    </dialog>`;

  const input = main.querySelector('#firm-search');
  const filter = main.querySelector('#firm-status');
  const panel = main.querySelector('#firm-profile');
  const list = main.querySelector('#firm-list');
  const metrics = main.querySelector('#firm-metrics');
  const exportButton = main.querySelector('#firm-export');
  const dialog = main.querySelector('#firm-dialog');
  const form = main.querySelector('#firm-profile-form');
  let editingId = '';
  input.value = query;
  filter.value = status;
  const firmChip = firm => W.chip(...(states[firm.status] || ['未登记', '']));
  const mark = `<span class="wb-org-monogram" aria-hidden="true">${W.icon('firm', 17)}</span>`;

  function showProfile(firm, cases, focus) {
    panel.hidden = !firm;
    if (!firm) return;
    const archive = W.url('search-case.html', { firm: firm.id, from: W.currentLink() });
    const specialties = Object.keys(firm.expertise || {});
    panel.innerHTML = `
      <div class="wb-panel-head">
        <div class="wb-case-cell">${mark}<div><h2 id="firm-profile-title" tabindex="-1" class="wb-wrap">${W.e(firm.name)}</h2>
          <p class="wb-small wb-muted">${W.e(firm.contact || '未登记对接人')}</p></div></div>${firmChip(firm)}</div>
      <div class="wb-panel-body wb-asset-detail-body">
        <div class="wb-actions"><a class="wb-btn wb-btn-primary" href="${W.e(archive)}">查看关联案卷（${cases.length}） ${W.icon('arrow',15)}</a>
          <button class="wb-btn" id="edit-firm" type="button">编辑档案</button></div>
        <div class="wb-org-section wb-asset-foot"><h3>关联案卷 <span class="wb-small wb-muted">${cases.length} 件</span></h3>
          ${cases.length ? `<ul class="wb-org-cases">${cases.slice(0,3).map(record=>`<li>
            <a href="${W.e(W.caseHref(record.id,W.currentLink()))}"><span><strong>${W.e(record.brandName)}</strong> <span class="wb-small wb-muted wb-mono">${W.e(record.id)}</span></span>${W.icon('chevron',14)}</a></li>`).join('')}</ul>`
            : '<p class="wb-small wb-muted">暂无使用该律所的案卷。</p>'}
        </div>
        <dl class="wb-key-values">
          <div><dt>档案评分</dt><dd class="wb-num">${Number.isFinite(firm.rating) ? W.e(firm.rating.toFixed(1) + ' / 5') : '未登记'}</dd></div>
          <div><dt>响应时间</dt><dd>${W.e(firm.responseTimeFormatted || '未登记')}</dd></div>
          <div><dt>续期日期</dt><dd>${firm.renewDate ? W.dateMarkup(firm.renewDate, { completed: true }) : '未登记'}</dd></div>
          <div><dt>报价范围</dt><dd>${W.e(firm.feeRange || '未登记')}</dd></div>
          ${firm.email ? `<div class="wb-field-wide"><dt>联系邮箱</dt><dd>${W.e(firm.email)}</dd></div>` : ''}
        </dl>
        ${specialties.length ? `<div class="wb-org-section"><h3>擅长业务</h3><div class="wb-org-tags">${specialties.map(value=>W.chip(value)).join('')}</div></div>` : ''}
        <button class="wb-btn wb-org-back" type="button" data-back-to-firm>返回律所清单</button>
      </div>`;
    if (focus) {
      panel.querySelector('h2').focus();
      if (matchMedia('(max-width:820px)').matches) panel.scrollIntoView({ block: 'start' });
    }
  }

  function render({ keepRows = false, focus = false } = {}) {
    const firms = D.getLawFirms();
    const allCases = W.allCases();
    const relations = new Map(firms.map(firm => [firm.id, D.getLawFirmCases(firm.id, allCases)
      .sort((a,b) => W.dateSort(a,b,'officialDeadline') || W.compareText(a.id,b.id))]));
    const term = W.searchText(query);
    visible = firms.filter(firm => (!status || firm.status === status) &&
      [firm.name, firm.contact, ...(firm.formerNames || [])].some(value => W.searchText(value).includes(term)));
    const firm = visible.find(row => row.id === selected) || visible[0];
    selected = firm?.id || '';
    W.replaceQuery({ q: query, status, firm: selected });
    if (!keepRows) {
      metrics.innerHTML = [
        ['合作律所', firms.filter(row=>row.status==='active').length],
        ['已关联案卷', [...relations.values()].reduce((total,records)=>total + records.length,0)],
        ['30 日内续期', firms.filter(row=>row.status==='active' && D.isDeadlineWithin(row.renewDate,today,30)).length]
      ].map(([title,value])=>`<div><dt>${title}</dt><dd>${value}</dd></div>`).join('');
      main.querySelector('#firm-count').textContent = visible.length + ' 家';
      exportButton.disabled = !visible.length;
      list.innerHTML = visible.length ? `<div class="wb-org-columns" aria-hidden="true"><span>律所／对接人</span><span>关联案卷</span><span>合作状态</span></div><ul class="wb-asset-list">${visible.map(row=>`<li>
        <button type="button" class="wb-asset-row wb-org-row" aria-pressed="${row.id===selected}" data-firm="${W.e(row.id)}" aria-controls="firm-profile">
          ${mark}<span class="wb-asset-ident"><strong class="wb-wrap">${W.e(row.name)}</strong><span class="wb-muted wb-small">${W.e(row.contact || '未登记对接人')}</span></span>
          <span class="wb-org-column wb-num"><b>${relations.get(row.id).length}</b> 件<span class="wb-sr">关联案卷</span></span>
          ${firmChip(row)} ${W.icon('chevron', 15)}</button></li>`).join('')}</ul>`
        : W.empty('没有匹配的律所','可调整名称、对接人或合作状态。');
    } else list.querySelectorAll('[data-firm]').forEach(button => button.setAttribute('aria-pressed',button.dataset.firm === selected));
    panel.classList.toggle('wb-org-selected', keepRows);
    showProfile(firm, relations.get(selected) || [], focus);
  }

  function openForm(id) {
    const firm = id && D.getLawFirmById(id);
    editingId = id || '';
    form.reset();
    if (firm) for (const key of ['name','contact','email','renewDate','feeRange','status']) {
      if (firm[key] != null) form.elements[key].value = firm[key];
    }
    dialog.querySelector('h2').textContent = firm ? '编辑律所档案' : '新增律所';
    W.notify(form.querySelector('#firm-error'), '');
    dialog.showModal();
  }
  input.addEventListener('input', () => { query = input.value.trim(); render(); });
  filter.addEventListener('change', () => { status = filter.value; render(); });
  main.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.firm) {
      selected = button.dataset.firm;
      render({ keepRows: true, focus: event.detail === 0 || matchMedia('(max-width: 820px)').matches });
    }
    if (button.hasAttribute('data-back-to-firm')) list.querySelector('[aria-pressed="true"]')?.focus();
    if (button.id === 'create-firm') openForm('');
    if (button.id === 'edit-firm') openForm(selected);
    if (button.hasAttribute('data-dismiss-firm')) dialog.close();
    if (button === exportButton) W.downloadCsv('律所清单.csv', ['律所','对接人','联系邮箱','合作状态','续期日期','关联案卷'],
      visible.map(row=>[row.name,row.contact,row.email,states[row.status]?.[0],row.renewDate,D.getLawFirmCases(row.id).length]));
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const saved = D.saveLawFirmProfile(editingId, values);
    if (!saved) return W.notify(form.querySelector('#firm-error'),'档案未保存。请检查名称是否重复、日期是否有效或浏览器存储后重试。','error');
    dialog.close();
    selected = saved.id;
    query = input.value = '';
    status = filter.value = '';
    render({ focus: true });
    W.notify(main.querySelector('#firm-notice'), '律所档案已保存。', 'success');
  });
  window.addEventListener('pageshow', event=>{ if (event.persisted) render(); });
  render();
});
