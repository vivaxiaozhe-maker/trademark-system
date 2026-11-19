document.addEventListener('DOMContentLoaded', () => {
  const W = CaseWorkspace;
  const F = FinanceWorkspace;
  const D = DataService;
  const main = document.getElementById('main');
  const params = W.query();
  const sections = { overview: '费用总览', query: '账单查询', approval: '付款审批', analysis: '费用分析', apply: '费用申请' };
  const defaultTab = document.body.dataset.defaultTab;
  const view = defaultTab || (Object.hasOwn(sections, params.get('tab')) ? params.get('tab') : 'overview');
  if (defaultTab) history.replaceState(null, '', W.url('fees.html', { tab: view, case: params.get('case') }));
  const href = (tab, extra = {}) => W.url('fees.html', { tab: tab === 'overview' ? '' : tab, ...extra });
  const cases = new Map(W.allCases().map(record => [record.id, record]));
  const option = (value, label) => `<option value="${W.e(value)}">${W.e(label)}</option>`;
  const summary = D.getFinanceOverview();
  const bills = D.getFees().sort((a, b) => W.compareText(b.createdAt, a.createdAt));
  const statuses = { pending: '待审批', all: '全部申请', approved: '已通过', rejected: '已驳回' };

  const toolOrigin = view === 'query' && W.pageName(params.get('from')) === 'tools.html' ? W.returnLink(params.get('from'), '') : '';
  const trail = view === 'overview' ? [['费用中心']] : [['费用中心', 'fees.html'], [sections[view]]];
  if (toolOrigin) trail.unshift(['商标工具 Link',toolOrigin]);
  W.renderShell('fees.html', trail);
  main.innerHTML = `
    <div class="wb-head"><div><h1>费用中心</h1></div>
      ${view === 'apply' ? '' : `<div class="wb-actions"><a class="wb-btn wb-btn-primary" href="${href('apply')}">${W.icon('plus')} 新建费用申请</a></div>`}</div>
    ${F.stage(view, Object.entries(sections).map(([key, name]) => [key, name, href(key)]), '费用中心视图')}
    <div class="wb-status" id="fee-notice" role="status"></div>
    <div id="fee-content"></div>`;

  const content = main.querySelector('#fee-content');
  const notice = main.querySelector('#fee-notice');
  const caseLink = (id, label) => cases.has(id) ? `<a class="wb-data-link" href="${W.e(W.caseHref(id, W.currentLink()))}">${W.e(label || id)}</a>` : W.e(label || '通用费用');
  const indexBill = bill => [bill.id, bill.caseId, bill.brandName, bill.note, bill.type, cases.get(bill.caseId)?.applicationNumber];
  const match = (query, values) => W.searchText(query).split(/\s+/).every(token => values.some(value => W.searchText(value).includes(token)));
  const groupAmount = (records, key) => {
    const result = new Map();
    for (const record of records) {
      const group = key(record);
      result.set(group, (result.get(group) || 0) + Number(record.amount));
    }
    return [...result].sort((a, b) => b[1] - a[1]);
  };
  const chart = (id, title, content, caption) => `<section class="wb-panel wb-fin-pair" aria-labelledby="${id}">
    <div class="wb-panel-head"><h2 id="${id}">${title}</h2></div>
    <div class="wb-fin-panel-body">${content}</div><p class="wb-fin-caption">${caption}</p></section>`;
  const summaryMetrics = () => F.metrics([
    ['年度预算', F.money(summary.annualBudget), summary.year + ' 年 · 人民币预算'],
    ['本年已支付', F.money(summary.totalSpent), '执行率 ' + summary.executionRate.toFixed(2) + '%'],
    ['待审批金额', F.totals(summary.pendingTotals), summary.pendingCount + ' 件申请', href('approval')],
    ['剩余预算', F.money(summary.remaining), '年度预算减已支付']
  ]);

  function billTable(data) {
    return data.length ? `<div class="wb-table-wrap"><table class="wb-table wb-fin-table">
      <caption class="wb-sr">费用账单</caption><thead><tr><th scope="col">费用／案号</th><th scope="col" class="wb-fin-extra">记账日期</th>
        <th scope="col">状态</th><th scope="col">账单金额</th></tr></thead>
      <tbody>${data.map(bill => `<tr><td><strong class="wb-wrap">${W.e(bill.note || bill.type)}</strong>
        <div class="wb-small wb-muted">${caseLink(bill.caseId, bill.caseId)} · ${W.e(bill.type)}</div></td>
        <td class="wb-fin-extra"><time class="wb-num">${W.e(bill.createdAt || '—')}</time></td>
        <td>${F.chip(bill.status, F.billStates)}</td><td class="wb-num wb-strong wb-ledger-amount">${W.e(F.money(bill.amount, bill.currency))}</td></tr>`).join('')}</tbody>
    </table></div>` : W.empty('没有匹配的费用账单', '可调整关键词或支付状态。');
  }

  function overview() {
    const trend = summary.quarterData.map(row => [row.label, row.amount]);
    const paid = bills.filter(bill => bill.status === 'paid' && (bill.currency || 'CNY') === 'CNY');
    const composition = groupAmount(paid, bill => bill.type);
    content.innerHTML = `${summaryMetrics()}
      <div class="wb-fin-stack">
      <section class="wb-panel" aria-labelledby="fee-recent-title"><div class="wb-panel-head"><h2 id="fee-recent-title">最近费用账单</h2>
        <a class="wb-btn wb-btn-small" href="${href('query')}">查看账单 ${W.icon('arrow', 14)}</a></div>${billTable(bills.slice(0, 5))}</section>
      <div class="wb-fin-grid">
        ${chart('fee-month-title', '本年已支付 · 按季度', F.rank(trend, F.money), '仅人民币。优先按支付日期，缺失时按记账日期。')}
        ${chart('fee-composition-title', '已付账单构成', composition.length ? F.rank(composition, F.money) : '<p class="wb-muted">暂无人民币已付账单</p>', '全部演示账单 · 仅人民币')}
      </div></div>`;
  }

  function queryBills() {
    const status = Object.hasOwn(F.billStates, params.get('status')) ? params.get('status') : '';
    content.innerHTML = `<section class="wb-panel" aria-labelledby="ledger-title">
      <div class="wb-filter wb-toolbar" role="search">
        <label class="wb-search">${W.icon('search')}<span class="wb-sr">搜索费用账单</span><input name="q" type="search" autocomplete="off" placeholder="搜索费用、商标或案号…" maxlength="100"></label>
        <label class="wb-inline-select">状态<select class="wb-input" name="status">${option('', '全部状态')}${Object.entries(F.billStates).map(([key, [label]]) => option(key, label)).join('')}</select></label>
      </div>
      <div class="wb-panel-head"><h2 class="wb-result" id="ledger-title">费用账单</h2><span class="wb-small wb-muted" id="ledger-count" role="status"></span>
        <button class="wb-btn wb-btn-small" id="ledger-export" type="button">${W.icon('download', 14)} 导出 CSV</button></div><div id="ledger-table"></div></section>`;
    const search = content.querySelector('input');
    const select = content.querySelector('select');
    const download = content.querySelector('#ledger-export');
    let filtered = [];
    search.value = params.get('q') || '';
    select.value = status;
    function render() {
      const q = search.value.trim();
      filtered = bills.filter(bill => (!select.value || bill.status === select.value) && match(q, indexBill(bill)));
      W.replaceQuery({ tab: 'query', q, status: select.value, from:toolOrigin });
      download.disabled = !filtered.length;
      content.querySelector('#ledger-table').innerHTML = billTable(filtered);
      content.querySelector('#ledger-count').textContent = filtered.length + ' 笔';
    }
    search.addEventListener('input', render);
    select.addEventListener('change', render);
    download.addEventListener('click', () => W.downloadCsv('费用账单.csv', ['案号','商标','费用类型','金额','币种','状态','记账日期'],
      filtered.map(bill => [bill.caseId,bill.brandName,bill.type,bill.amount,bill.currency,F.billStates[bill.status]?.[0],bill.createdAt])));
    render();
  }

  function approval() {
    let status = Object.hasOwn(statuses, params.get('status')) ? params.get('status') : 'pending';
    let selected = params.get('id') || '';
    if (!params.has('status') && selected) {
      const savedStatus = D.getFeeAppById(selected)?.status;
      if (Object.hasOwn(statuses, savedStatus)) status = savedStatus;
    }
    content.innerHTML = `<div class="wb-fin-split">
      <section class="wb-panel" aria-labelledby="fee-queue-title">
        <div class="wb-filter wb-toolbar" role="search">
          <label class="wb-search">${W.icon('search')}<span class="wb-sr">搜索费用申请</span><input name="q" type="search" autocomplete="off" placeholder="搜索申请单号、标题或案号…" maxlength="100"></label>
          <label class="wb-inline-select">状态<select class="wb-input" name="status">${Object.entries(statuses).map(([id,label]) => option(id,label)).join('')}</select></label>
        </div><div class="wb-panel-head"><h2 class="wb-result" id="fee-queue-title">待审批列表</h2><span class="wb-small wb-muted" id="fee-queue-count" role="status"></span></div>
        <div id="fee-queue"></div>
      </section>
      <section class="wb-panel" id="fee-application-detail" aria-labelledby="fee-detail-title" hidden></section></div>`;
    const list = content.querySelector('#fee-queue');
    const detail = content.querySelector('#fee-application-detail');
    const search = content.querySelector('input');
    const select = content.querySelector('select');
    search.value = params.get('q') || '';
    select.value = status;

    let shownDetailId = '';
    function renderDetail(app, focus) {
      const reveal = app && app.id !== shownDetailId;
      shownDetailId = app?.id || '';
      detail.hidden = !app;
      if (!app) return;
      const flow = app.flow || [];
      detail.innerHTML = `<div class="wb-panel-head"><div>
        <div class="wb-title-line">${F.chip(app.status, F.appStates)} <span class="wb-mono wb-small wb-muted">${W.e(app.id)}</span></div>
        <h2 id="fee-detail-title" class="wb-wrap" tabindex="-1">${W.e(app.title)}</h2></div></div>
        <div class="wb-fin-panel-body${reveal ? ' wb-fin-reveal' : ''}">
          <dl class="wb-key-values"><div><dt>申请总额</dt><dd class="wb-num">${W.e(F.money(app.amount, app.currency))}</dd></div>
            <div><dt>申请人</dt><dd>${W.e(app.applicant || '—')}</dd></div>
            <div><dt>关联案卷</dt><dd>${caseLink(app.caseId, app.caseId)}</dd></div>
            <div><dt>提交日期</dt><dd class="wb-num">${W.e(app.createdAt || '—')}</dd></div></dl>
          ${app.description ? `<p class="wb-muted wb-list-preserve wb-wrap">${W.e(app.description)}</p>` : ''}
          <div><h3>费用明细</h3><ul class="wb-fin-flow">
            ${(app.items || []).map(item => `<li>${W.icon('file',14)}<span class="wb-wrap">${W.e(item.typeLabel || item.type)}${item.note ? ' · ' + W.e(item.note) : ''}</span>
              <strong class="wb-num">${W.e(F.money(item.amount, app.currency))}</strong></li>`).join('')}</ul></div>
          ${flow.length ? `<div class="wb-fin-caption"><h3>审批进度</h3><ol class="wb-fin-flow">${flow.map(step => `<li>${W.icon(step.status === 'completed' ? 'check' : 'chevron',14)}
            <span>${W.e(step.role)}${step.name ? ' · ' + W.e(step.name) : ''}</span>
            ${W.chip(step.status === 'current' ? '待审批' : step.status === 'completed' ? '已完成' : '未开始',
              step.status === 'current' ? 'warning' : step.status === 'completed' ? 'positive' : '')}</li>`).join('')}</ol></div>` : ''}
        </div>`;
      if (focus) detail.querySelector('h2').focus();
    }

    function render({ selectOnly = false, focus = false } = {}) {
      const q = search.value.trim();
      const apps = D.getFeeApplications().filter(app => (status === 'all' || app.status === status) &&
        match(q, [app.id, app.title, app.caseId, app.caseName, app.applicant])).sort((a,b) =>
        W.compareText(b.createdAt,a.createdAt) || W.compareText(b.id,a.id));
      const current = apps.find(app => app.id === selected) || apps[0];
      selected = current?.id || '';
      W.replaceQuery({ tab: 'approval', status: status === 'pending' ? '' : status, q, id: selected });
      content.querySelector('#fee-queue-title').textContent = status === 'pending' ? '待审批列表' : '费用申请列表';
      content.querySelector('#fee-queue-count').textContent = apps.length + ' 件';
      if (selectOnly) list.querySelectorAll('[data-application]').forEach(button => button.setAttribute('aria-pressed', button.dataset.application === selected));
      else list.innerHTML = apps.length ? `<ul class="wb-fin-queue">${apps.map(app => `<li>
        <button type="button" class="wb-fin-record" data-application="${W.e(app.id)}" aria-controls="fee-application-detail" aria-pressed="${app.id === selected}">
          <span class="wb-fin-record-label"><strong class="wb-wrap">${W.e(app.title)}</strong>
            <span class="wb-small wb-muted">${W.e(app.id)} · ${W.e(app.caseName || app.caseId || '通用费用')}</span></span>
          <span class="wb-fin-record-side">${F.chip(app.status, F.appStates)}<strong class="wb-num">${W.e(F.money(app.amount, app.currency))}</strong></span>
        </button></li>`).join('')}</ul>`
        : W.empty('没有符合条件的申请', '可调整关键词或切换审批状态。');
      renderDetail(current, focus);
    }

    search.addEventListener('input', () => render());
    select.addEventListener('change', () => { status = select.value; render(); });
    list.addEventListener('click', event => {
      const button = event.target.closest('[data-application]');
      if (!button) return;
      selected = button.dataset.application;
      render({ selectOnly: true, focus: event.detail === 0 || matchMedia('(max-width: 820px)').matches });
    });
    window.addEventListener('pageshow', event => { if (event.persisted) render(); });
    render();
    if (params.get('submitted') === '1' && selected === params.get('id')) W.notify(notice, '申请已提交 · ' + selected + ' 已进入待审批列表。', 'success');
  }

  function analysis() {
    const cny = bills.filter(bill => (bill.currency || 'CNY') === 'CNY');
    const types = groupAmount(cny, bill => bill.type);
    const firms = groupAmount(cny, bill => cases.get(bill.caseId)?.lawFirmName || '未关联律所');
    content.innerHTML = `${summaryMetrics()}<div class="wb-fin-grid">
      ${chart('fee-type-title', '按费用类型', F.rank(types, F.money), '全部人民币账单，含已支付与待支付。')}
      ${chart('fee-firm-title', '按关联律所', F.rank(firms, F.money), '按案卷当前登记的代理律所归集。')}</div>`;
  }

  function application() {
    const draftKey = 'workbench-finance-apply';
    const draft = D.getDraft(draftKey)?.data;
    content.innerHTML = `<form class="wb-fin-split" id="fee-apply-form" autocomplete="off">
      <section class="wb-panel" aria-labelledby="application-title">
        <div class="wb-panel-head"><h2 id="application-title">新建费用申请</h2><span class="wb-small wb-muted">金额按所选币种录入</span></div>
        <div class="wb-fin-panel-body wb-fin-form">
          <div class="wb-fields">
            <label class="wb-field wb-field-wide">申请标题<input class="wb-input" name="title" required maxlength="100" placeholder="例如，云智复审代理费…"></label>
            <label class="wb-field">申请类型<select class="wb-input" name="type">${Object.entries(D.FEE_APPLICATION_TYPES).map(([id,label]) => option(id,label)).join('')}</select></label>
            <label class="wb-field">关联案卷<select class="wb-input" name="caseId">${option('', '通用费用')}${[...cases.values()].map(record => option(record.id, record.id + ' · ' + record.brandName)).join('')}</select></label>
            <label class="wb-field">费用币种<select class="wb-input" name="currency">${D.FEE_CURRENCIES.map(value => option(value,value)).join('')}</select></label>
            <label class="wb-field">费用承担部门<select class="wb-input" name="department">${['知识产权部','品牌管理部','海外市场部'].map(value => option(value,value)).join('')}</select></label>
          </div>
          <div><div class="wb-fin-line-header"><h3>费用明细</h3><button class="wb-btn wb-btn-small" type="button" id="add-fee-line">${W.icon('plus',14)} 添加明细</button></div>
            <div class="wb-fin-lines" id="fee-lines"></div></div>
          <label class="wb-field">申请说明<textarea class="wb-input" name="description" rows="3" maxlength="500" placeholder="说明费用用途或凭证信息…"></textarea></label>
          <div class="wb-status" id="fee-error" role="alert"></div>
          <footer class="wb-form-actions"><button class="wb-btn" type="button" id="fee-save-draft">保存草稿</button>
            <button class="wb-btn wb-btn-primary" type="submit">提交申请 ${W.icon('arrow',14)}</button></footer>
        </div>
      </section>
      <section class="wb-panel" aria-labelledby="fee-summary-title">
        <div class="wb-panel-head"><h2 id="fee-summary-title">申请概览</h2></div>
        <div class="wb-fin-panel-body"><div><span class="wb-muted wb-small">申请合计</span><p class="wb-fin-total wb-num" id="fee-total"></p></div>
          <dl class="wb-key-values"><div><dt>申请人</dt><dd>${W.e(D.CURRENT_USER.name)}</dd></div>
            <div><dt>明细条数</dt><dd id="fee-line-count"></dd></div></dl>
          <div class="wb-fin-caption"><h3>审批流程</h3><ol class="wb-fin-flow">
            <li>${W.icon('check',14)}<span>提交申请</span></li><li>${W.icon('chevron',14)}<span>部门审批</span></li><li>${W.icon('chevron',14)}<span>财务审批</span></li>
          </ol></div>
          <p class="wb-small wb-muted">提交后可用申请单号在付款审批里查询。</p>
        </div>
      </section>
    </form>`;
    const form = content.querySelector('form');
    const lines = form.querySelector('#fee-lines');
    const add = form.querySelector('#add-fee-line');
    const error = form.querySelector('#fee-error');
    const submit = form.querySelector('[type="submit"]');
    if (draft) for (const key of ['title','type','caseId','currency','department','description']) {
      if (draft[key] !== undefined) form.elements[key].value = draft[key];
    }
    if (cases.has(params.get('case'))) form.elements.caseId.value = params.get('case');
    let sequence = 0;

    const getItems = () => [...lines.children].map(row => ({
      type: row.querySelector('[data-item-type]').value,
      amount: row.querySelector('[data-item-amount]').value,
      note: row.querySelector('[data-item-note]').value
    }));
    function values() {
      return { ...Object.fromEntries(new FormData(form)), items: getItems() };
    }
    function tally() {
      const currency = form.elements.currency.value;
      const total = getItems().reduce((sum, item) => sum + D.amountInMinorUnits(item.amount,currency), 0) / 100;
      form.querySelectorAll('[data-remove-line]').forEach(button => { button.disabled = lines.children.length <= 1; });
      add.disabled = lines.children.length >= 20;
      content.querySelector('#fee-total').textContent = F.money(total,currency);
      content.querySelector('#fee-line-count').textContent = lines.children.length + ' 条';
    }
    function addLine(item = {}, focus = false) {
      sequence += 1;
      const row = document.createElement('div');
      row.className = 'wb-fin-line';
      row.innerHTML = `<label class="wb-field">费用类型<select class="wb-input" data-item-type>${D.FEE_TYPES.map(value => option(value,value)).join('')}</select></label>
        <label class="wb-field">金额<input class="wb-input" data-item-amount inputmode="decimal" required maxlength="11" placeholder="0.00" value="${W.e(item.amount)}"></label>
        <label class="wb-field">明细说明<input class="wb-input" data-item-note maxlength="120" value="${W.e(item.note)}"></label>
        <button class="wb-btn wb-btn-quiet" type="button" data-remove-line aria-label="移除明细 ${sequence}">${W.icon('close',15)}</button>`;
      row.querySelector('select').value = item.type || D.FEE_TYPES[0];
      lines.append(row);
      tally();
      if (focus) row.querySelector('[data-item-amount]').focus();
    }
    (draft?.items?.length ? draft.items : [{}]).forEach(item => addLine(item));
    if (draft) W.notify(notice, '已恢复上次保存的费用草稿。', 'success');
    form.addEventListener('input', tally);
    add.addEventListener('click', () => addLine({}, true));
    lines.addEventListener('click', event => {
      const button = event.target.closest('[data-remove-line]');
      if (!button || lines.children.length <= 1) return;
      button.closest('.wb-fin-line').remove();
      tally();
      add.focus();
    });
    form.querySelector('#fee-save-draft').addEventListener('click', () => {
      const saved = D.saveDraft(draftKey,values());
      W.notify(notice, saved ? '费用草稿已保存。' : '草稿未能保存，请检查浏览器存储。', saved ? 'success' : 'error');
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const input = values();
      if (!input.title.trim()) {
        W.notify(error, '请填写申请标题。', 'error');
        form.elements.title.focus();
        return;
      }
      const invalid = input.items.findIndex(item => D.amountInMinorUnits(item.amount,input.currency) <= 0);
      if (invalid >= 0) {
        W.notify(error, input.currency === 'JPY' ? '日元金额请填写大于零的整数。' : '请填写大于零的金额，最多保留两位小数。', 'error');
        lines.children[invalid].querySelector('[data-item-amount]').focus();
        return;
      }
      submit.disabled = true;
      const saved = D.submitFeeApplication(input);
      if (!saved) {
        submit.disabled = false;
        return W.notify(error, '申请未保存。请检查所选案卷和浏览器存储后重试。', 'error');
      }
      D.clearDraft(draftKey);
      location.replace(href('approval', { id: saved.id, submitted: '1' }));
    });
  }

  ({ overview, query: queryBills, approval, analysis, apply: application })[view]();
});
