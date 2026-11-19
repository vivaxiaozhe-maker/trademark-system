document.addEventListener('DOMContentLoaded', () => {
  const W = CaseWorkspace;
  const main = document.getElementById('main');
  const params = W.query();
  const entry = params.get('ui') === 'workbench' ? { ui: 'workbench' } : {};
  const scopes = { all: '全部预警', pending: '待复核', linked: '已转待办' };
  const views = { alerts: '监测预警', rules: '监测规则' };
  const risks = { high: ['高风险', 'danger'], medium: ['中风险', 'warning'], low: ['低风险', 'positive'] };
  const resultStates = { unhandled: '待复核', watching: '持续关注', opposed: '异议处理中', negotiating: '谈判中', handled: '已处理' };
  const owner = DataService.CURRENT_USER;
  let view = params.get('view') === 'rules' ? 'rules' : 'alerts';
  let scope = Object.hasOwn(scopes, params.get('status')) ? params.get('status') : 'all';
  let query = params.get('q') || '';
  let risk = Object.hasOwn(risks, params.get('risk')) ? params.get('risk') : '';
  let selected = params.get('alert') || '';

  W.renderShell('monitor.html', [['监测中心']]);
  main.innerHTML = `
    <div class="wb-head"><div><h1>监测中心</h1></div>
      <div class="wb-steps" role="group" aria-label="监测视图">${Object.entries(views)
        .map(([id, label]) => `<button type="button" data-monitor-view="${id}">${label}</button>`).join('')}</div></div>
    <div class="wb-status" id="monitor-notice" role="status"></div>
    <div id="monitor-alerts">
      <div class="wb-panel wb-metrics wb-assets-metrics" id="monitor-metrics" role="group" aria-label="按复核状态筛选"></div>
      <div class="wb-asset-grid">
        <section class="wb-panel" aria-labelledby="monitor-list-title">
          <div class="wb-filter wb-asset-tools" role="search" aria-label="筛选监测预警">
            <label class="wb-search">${W.icon('search')}<span class="wb-sr">搜索商标、申请号或申请人</span>
              <input id="monitor-query" name="q" type="search" placeholder="搜索商标、申请号或申请人…" maxlength="100" autocomplete="off" spellcheck="false"></label>
            <label class="wb-inline-select"><span class="wb-sr">风险等级</span><select id="monitor-risk" class="wb-input" name="risk"><option value="">全部风险</option>
              ${Object.entries(risks).map(([key, [label]]) => `<option value="${key}">${label}</option>`).join('')}</select></label>
          </div>
          <div class="wb-panel-head"><h2 id="monitor-list-title" class="wb-result">预警清单</h2><span class="wb-small wb-muted wb-num" id="monitor-count" role="status"></span></div>
          <div id="monitor-results"></div>
        </section>
        <section class="wb-panel wb-asset-detail" id="monitor-detail" aria-labelledby="monitor-detail-title" hidden></section>
      </div>
    </div>
    <section class="wb-panel" id="monitor-rules" aria-labelledby="monitor-rules-title" hidden></section>`;

  const metrics = main.querySelector('#monitor-metrics');
  const alerts = main.querySelector('#monitor-alerts');
  const rules = main.querySelector('#monitor-rules');
  const panel = main.querySelector('#monitor-detail');
  const input = main.querySelector('#monitor-query');
  const filter = main.querySelector('#monitor-risk');
  const list = main.querySelector('#monitor-results');
  const notice = main.querySelector('#monitor-notice');
  input.value = query;
  filter.value = risk;
  const riskChip = id => W.chip(...(risks[id] || ['未评级', '']));
  const mark = (name, src) => W.thumb({ brandName: name, trademarkImage: src });
  const stateLabel = (item, task) => task ? (W.isComplete(task) ? '复核已完成' : '已转待办') : resultStates[item.status] || '待复核';
  const matchScope = (item, task, key) => key === 'all' || (key === 'linked' ? Boolean(task) : !task && item.status === 'unhandled');

  function renderRules() {
    const tasks = DataService.getMonitorTasks();
    rules.innerHTML = `<div class="wb-panel-head"><h2 id="monitor-rules-title">监测规则</h2><span class="wb-small wb-muted">${tasks.length} 项</span></div>
      ${tasks.length ? `<div class="wb-table-wrap"><table class="wb-table"><caption class="wb-sr">当前演示监测规则</caption>
      <thead><tr><th scope="col">规则</th><th scope="col">关键词</th><th scope="col">法域</th><th scope="col">预警阈值</th></tr></thead>
      <tbody>${tasks.map(task => `<tr><td><strong>${W.e(task.name)}</strong></td><td>${W.e((task.keywords || []).join('、'))}</td>
      <td>${W.e((task.regions || []).join('／'))}</td><td class="wb-num">${W.e(task.alertThreshold)}%</td></tr>`).join('')}</tbody></table></div>`
      : W.empty('暂无监测规则', '当前浏览器没有配置演示监测规则。')}`;
  }

  function renderDetail(item, task) {
    panel.hidden = !item;
    if (!item) return;
    const brand = DataService.getBrands().find(record => record.name === item.keyword);
    const candidates = brand ? DataService.getBrandCases(brand.id) : [];
    const options = candidates.map(record => `<option value="${W.e(record.id)}">${W.e(record.id)} · ${W.e(record.businessType || record.brandName)}</option>`).join('');
    panel.innerHTML = `
      <div class="wb-panel-head">
        <div><div class="wb-title-line">${riskChip(item.riskLevel)} ${W.chip(stateLabel(item, task), task ? 'positive' : '')}</div>
          <h2 id="monitor-detail-title" class="wb-wrap" tabindex="-1">${W.e(item.matchedName)}</h2></div>
        <span class="wb-small wb-muted">${W.e(item.monitorDate || '未登记日期')}</span>
      </div>
      <div class="wb-panel-body wb-asset-detail-body">
        <div class="wb-watch-compare"><h3>商标比对</h3><div class="wb-hit-separator">
          <div>${mark(item.keyword, item.myImage)}<span class="wb-asset-ident"><span class="wb-muted wb-small">监测商标</span><strong class="wb-wrap">${W.e(item.keyword)}</strong></span></div>
          <div>${mark(item.matchedName, item.matchedImage)}<span class="wb-asset-ident"><span class="wb-muted wb-small">近似商标</span><strong class="wb-wrap">${W.e(item.matchedName)}</strong></span></div>
        </div>
        </div>
        <dl class="wb-key-values wb-review-fields">
          <div><dt>相似度</dt><dd class="wb-num">${Number.isFinite(item.similarity) ? item.similarity + '%' : '未登记'}</dd></div>
          <div><dt>尼斯类别</dt><dd>${item.niceClass ? '第 ' + W.e(item.niceClass) + ' 类' : '未登记'}</dd></div>
          <div><dt>申请号</dt><dd class="wb-num">${W.e(item.appNo || '未登记')}</dd></div>
          <div><dt>申请人</dt><dd>${W.e(item.applicant || '未登记')}</dd></div>
        </dl>
        <div class="wb-asset-foot">${task
          ? `<a class="wb-btn wb-btn-primary" href="${W.e(W.taskHref(task, W.currentLink()))}">查看${W.isComplete(task) ? '已办记录' : '待办事项'} ${W.icon('arrow', 15)}</a>`
          : `<details class="wb-monitor-create">
              <summary class="wb-btn wb-btn-primary">${W.icon('plus', 15)} 创建待办</summary>
              <form id="monitor-to-task" autocomplete="off">
                <label class="wb-field">关联案卷<select class="wb-input" name="caseId"><option value="">作为独立待办</option>${options}</select></label>
                <label class="wb-field">待办截止（选填）<input class="wb-input" name="deadline" type="date"></label>
                <p class="wb-small wb-muted">负责人为 ${W.e(owner.name)}。待办截止用于内部复核。</p>
                <div class="wb-status" id="monitor-error" role="alert"></div>
                <button class="wb-btn wb-btn-primary" type="submit">确认创建待办</button>
              </form>
            </details>`}</div>
        <button type="button" class="wb-btn wb-btn-quiet wb-list-return" data-list-return>返回预警清单</button>
      </div>`;
  }

  function render({ keepRows = false, focus = false } = {}) {
    main.querySelectorAll('[data-monitor-view]').forEach(button => button.setAttribute('aria-pressed', button.dataset.monitorView === view));
    alerts.hidden = view !== 'alerts';
    rules.hidden = view !== 'rules';
    if (view === 'rules') {
      W.replaceQuery({ ...entry, view, status: scope === 'all' ? '' : scope, risk, q: query, alert: selected });
      renderRules();
      return;
    }
    const tasks = new Map(W.allTasks().filter(task => task.sourceMonitorResultId).map(task => [task.sourceMonitorResultId, task]));
    const records = DataService.getMonitorResults().filter(result =>
      (!risk || result.riskLevel === risk) &&
      W.searchText(query).split(/\s+/).every(token => [result.keyword, result.matchedName, result.appNo, result.applicant]
        .some(value => W.searchText(value).includes(token))))
      .sort((a, b) => W.compareText(b.monitorDate, a.monitorDate) || W.compareText(a.id, b.id));
    const visible = records.filter(item => matchScope(item, tasks.get(item.id), scope));
    const item = visible.find(record => record.id === selected) || visible[0];
    selected = item?.id || '';
    W.replaceQuery({ ...entry, status: scope === 'all' ? '' : scope, risk, q: query, alert: selected });
    if (!keepRows) {
      const focused = document.activeElement?.dataset.metric;
      metrics.innerHTML = W.metrics(Object.entries(scopes).map(([key, label]) => ({
        key, label, count: records.filter(record => matchScope(record, tasks.get(record.id), key)).length,
        tone: key === 'pending' ? 'warning' : ''
      })), scope);
      if (focused) metrics.querySelector(`[data-metric="${focused}"]`)?.focus({ preventScroll: true });
      main.querySelector('#monitor-count').textContent = visible.length + ' 条';
      list.innerHTML = visible.length ? `<ul class="wb-asset-list wb-matches">${visible.map(record => `<li>
        <button class="wb-asset-row" type="button" data-alert="${W.e(record.id)}" aria-pressed="${selected === record.id}" aria-controls="monitor-detail">
          ${mark(record.matchedName, record.matchedImage)}
          <span class="wb-asset-ident"><strong class="wb-wrap">${W.e(record.matchedName)}</strong>
            <span class="wb-muted wb-small">${W.e(record.keyword)} · ${W.e(stateLabel(record, tasks.get(record.id)))}</span>
          </span>
          <span class="wb-asset-ident wb-alert-score">${riskChip(record.riskLevel)}${Number.isFinite(record.similarity) ? `<span class="wb-num">相似度 ${record.similarity}%</span>` : ''}</span>
          ${W.icon('chevron', 15)}
        </button></li>`).join('')}</ul>`
        : W.empty('没有匹配的预警', '可调整关键词、风险等级或复核状态。');
    } else {
      list.querySelectorAll('[data-alert]').forEach(button => button.setAttribute('aria-pressed', button.dataset.alert === selected));
    }
    panel.classList.toggle('wb-selection-change', keepRows);
    renderDetail(item, tasks.get(selected));
    if (focus && item) {
      panel.querySelector('h2').focus();
      if (matchMedia('(max-width: 820px)').matches) panel.scrollIntoView({ block: 'start' });
    }
  }

  input.addEventListener('input', () => { query = input.value.trim(); render(); });
  filter.addEventListener('change', () => { risk = filter.value; render(); });
  main.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-list-return')) {
      list.querySelector('[data-alert][aria-pressed="true"]')?.focus();
      return;
    }
    const { monitorView, metric, alert } = button.dataset;
    if (monitorView) { view = monitorView; render(); }
    if (metric) { scope = metric; render(); }
    if (alert) {
      selected = alert;
      render({ keepRows: true, focus: event.detail === 0 || matchMedia('(max-width: 820px)').matches });
    }
  });
  main.addEventListener('submit', event => {
    const form = event.target;
    if (form.id !== 'monitor-to-task') return;
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const saved = DataService.createMonitorTodo(selected, values);
    if (!saved) return W.notify(form.querySelector('#monitor-error'), '待办创建失败，请检查输入或浏览器存储后重试。', 'error');
    if (scope === 'pending') scope = 'linked';
    W.refreshTaskCount();
    render({ focus: true });
    W.notify(notice, '待办已创建，可打开待办事项查看。', 'success');
  });
  window.addEventListener('pageshow', event => { if (event.persisted) render(); });
  render();
});
