document.addEventListener('DOMContentLoaded', () => {
  const W = CaseWorkspace;
  const main = document.getElementById('main');
  const params = W.query();
  const personal = document.body.dataset.view === 'mine';
  const user = DataService.CURRENT_USER;
  const page = personal ? 'my-cases.html' : 'cases.html';
  const title = W.pageLabel(page);
  const recordsInScope = () => personal ? W.allCases().filter(record =>
    record.responsibleUserId ? record.responsibleUserId === user.id : record.responsibleUser === user.name
  ) : W.allCases();
  const deadlines = {
    all: '全部案件', overdue: '已逾期', today: '今日到期', upcoming: '未来 7 天',
    upcoming30: '未来 30 天', unknown: '未登记绝限'
  };
  const metricKeys = ['all', 'overdue', 'today', 'upcoming'];
  const scopes = { all: '全部法域', domestic: '国内案件', overseas: '海外案件' };
  const sorts = { deadline: '官方绝限优先', brand: '商标名称', recent: '最近更新' };
  const allowed = (value, choices, fallback) => Object.hasOwn(choices, value) ? value : fallback;
  const filters = {
    tab: allowed(params.get('tab'), scopes, 'all'),
    q: params.get('q') || '',
    deadline: allowed(params.get('deadline'), deadlines, 'all'),
    type: params.get('type') || '',
    status: params.get('status') || '',
    owner: personal ? '' : params.get('owner') || '',
    sort: allowed(params.get('sort'), sorts, 'deadline')
  };
  const selected = new Set();
  let visible = [];
  W.renderShell(page, [[title]]);

  main.innerHTML = `
    <div class="wb-head">
      <div><h1>${title}</h1>${personal ? `<p class="wb-subtitle">经办人 · ${W.e(user.name)}</p>` : ''}</div>
      <div class="wb-actions">
        <button class="wb-btn" id="export-cases" type="button">${W.icon('download')} 导出结果</button>
        <a class="wb-btn wb-btn-primary" id="new-case-link" href="case-new.html">${W.icon('plus')} 新建案件</a>
      </div>
    </div>
    <div class="wb-status" id="case-notice" role="status" aria-live="polite"></div>
    <div class="wb-panel wb-metrics" id="case-metrics" role="group" aria-label="按官方绝限筛选"></div>
    <section class="wb-panel" aria-labelledby="case-table-title">
      <div class="wb-filter" role="search" aria-label="案件筛选">
        <div class="wb-toolbar">
          <div class="wb-steps" role="group" aria-label="案件法域">
            ${Object.entries(scopes).map(([key, label]) => `<button type="button" data-scope="${key}">${label}</button>`).join('')}
          </div>
          <label class="wb-search">
            ${W.icon('search')}<span class="wb-sr">搜索案号、商标或官方编号</span>
            <input id="case-query" name="q" type="search" placeholder="搜索案号、商标或官方编号…" autocomplete="off" spellcheck="false" maxlength="100">
          </label>
          <button class="wb-btn" id="toggle-case-filters" type="button" aria-controls="advanced-filters" aria-expanded="false">${W.icon('sliders')} 更多筛选</button>
        </div>
        <div class="wb-fields ${personal ? '' : 'wb-fields-3'} wb-toolbar-flow" id="advanced-filters" hidden>
          <label class="wb-field">业务类型<select class="wb-input" id="filter-type" name="type"></select></label>
          <label class="wb-field">当前状态<select class="wb-input" id="filter-status" name="status"></select></label>
          ${personal ? '' : '<label class="wb-field">负责人<select class="wb-input" id="filter-owner" name="owner"></select></label>'}
        </div>
        <div class="wb-active-filters" id="case-filter-context" hidden></div>
      </div>
      <div class="wb-panel-head">
        <h2 class="wb-result" id="case-table-title">案卷清单</h2><span class="wb-muted wb-small wb-num" id="case-count" role="status"></span>
        <label class="wb-inline-select">排序
          <select class="wb-input" id="case-sort" name="sort">
            ${Object.entries(sorts).map(([key, label]) => `<option value="${key}">${label}</option>`).join('')}
          </select>
        </label>
      </div>
      <div class="wb-bulk" id="case-bulk" hidden>
        <p class="wb-result wb-strong" id="case-selection" aria-live="polite"></p>
        <button type="button" class="wb-btn wb-btn-small" data-bulk="enable">启用</button>
        <button type="button" class="wb-btn wb-btn-small" data-bulk="disable">停用</button>
        <button type="button" class="wb-btn wb-btn-small" data-bulk="export">导出所选</button>
        <button type="button" class="wb-btn wb-btn-small wb-btn-quiet" data-bulk="clear">取消选择</button>
      </div>
      <div id="case-results"></div>
    </section>`;

  const search = document.getElementById('case-query');
  const status = document.getElementById('case-notice');
  const table = document.getElementById('case-results');
  const groups = document.getElementById('case-filter-context');
  const advanced = document.getElementById('advanced-filters');
  const toggle = document.getElementById('toggle-case-filters');
  const metrics = document.getElementById('case-metrics');
  const sort = document.getElementById('case-sort');
  const fields = { type: 'businessType', status: 'status', ...(personal ? {} : { owner: 'responsibleUser' }) };
  const fieldNames = { type: '业务类型', status: '当前状态', owner: '负责人' };

  function setAdvanced(show) {
    advanced.hidden = !show;
    toggle.setAttribute('aria-expanded', show);
  }

  function setControls() {
    const records = recordsInScope();
    Object.entries(fields).forEach(([key, field]) => {
      const control = document.getElementById('filter-' + key);
      const values = W.uniqueValues(records, field);
      if (filters[key] && !values.includes(filters[key])) filters[key] = '';
      control.innerHTML = W.options(values, '全部' + fieldNames[key]);
      control.value = filters[key];
    });
    search.value = filters.q;
    sort.value = filters.sort;
    setAdvanced(Object.keys(fields).some(key => filters[key]));
  }

  function setQuery() {
    W.replaceQuery({ ...filters,
      tab: filters.tab === 'all' ? '' : filters.tab,
      deadline: filters.deadline === 'all' ? '' : filters.deadline,
      sort: filters.sort === 'deadline' ? '' : filters.sort
    });
  }

  function matchingCases() {
    const keyword = W.searchText(filters.q);
    const current = recordsInScope().filter(record => {
      if (filters.tab !== 'all' && record.type !== filters.tab) return false;
      if (Object.entries(fields).some(([key, field]) => filters[key] && record[field] !== filters[key])) return false;
      if (!keyword) return true;
      return [record.id, record.brandName, record.applicationNumber, record.registrationNumber, record.lawFirmName]
        .some(value => W.searchText(value).includes(keyword));
    });
    const primary = {
      deadline: (a, b) => W.dateSort(a, b, 'officialDeadline'),
      brand: (a, b) => W.compareText(a.brandName, b.brandName),
      recent: (a, b) => W.compareText(b.updatedAt, a.updatedAt)
    }[filters.sort];
    return current.sort((a, b) => primary(a, b) || W.compareText(a.id, b.id));
  }

  function row(record) {
    const from = W.currentLink();
    const href = W.caseHref(record.id, from);
    const open = W.openCount(record.id);
    const tasks = W.url('todo.html', { case: record.id, from });
    return `<tr>
      <td class="wb-check-cell"><label><span class="wb-sr">选择 ${W.e(record.id)}</span><input type="checkbox" data-select-id="${W.e(record.id)}"${selected.has(record.id) ? ' checked' : ''}></label></td>
      <th scope="row"><div class="wb-case-cell">${W.thumb(record)}<div>
        <a class="wb-data-link" href="${W.e(href)}">${W.e(record.brandName || '未命名商标')}</a>
        <a class="wb-id wb-mono" translate="no" href="${W.e(href)}">${W.e(record.id)}</a>
        <span class="wb-compact-case-meta">${W.e([record.businessType, record.country].filter(Boolean).join(' · '))}</span>
      </div></div></th>
      <td class="wb-table-secondary"><span class="wb-strong">${W.e(record.businessType || '未登记')}</span><span class="wb-case-legal">${W.e(record.country || '未登记法域')}</span></td>
      <td>${W.dateMarkup(record.officialDeadline, { href: W.caseHref(record.id, from, '#deadlines') })}</td>
      <td class="wb-table-secondary">${W.caseStatus(record)}</td>
      <td class="wb-table-secondary"><span class="wb-strong">${W.e(record.responsibleUser || '未分配')}</span><span class="wb-case-legal wb-wrap">${W.e(record.lawFirmName || '无代理律所')}</span></td>
      <td class="wb-table-optional">${open
        ? `<a class="wb-linkcount wb-num" href="${W.e(tasks)}" aria-label="查看 ${W.e(record.id)} 的 ${open} 项待办">${open} 项待办</a>`
        : '<span class="wb-muted wb-small">无未办</span>'}</td>
      <td><a class="wb-btn wb-btn-quiet wb-btn-small" href="${W.e(href)}" aria-label="打开案卷 ${W.e(record.id)}">${W.icon('chevron', 16)}</a></td>
    </tr>`;
  }

  function renderSelection() {
    const selectAll = document.getElementById('case-select-all');
    if (selectAll) {
      selectAll.checked = visible.length > 0 && selected.size === visible.length;
      selectAll.indeterminate = selected.size > 0 && selected.size < visible.length;
    }
    document.getElementById('case-bulk').hidden = !selected.size;
    document.getElementById('case-selection').textContent = '本页已选择 ' + selected.size + ' 件';
  }

  function render() {
    setQuery();
    document.getElementById('new-case-link').href = W.url('case-new.html', { from: W.currentLink() });
    const current = matchingCases();
    const today = DataService.getToday();
    const counts = { all: current.length, overdue: 0, today: 0, upcoming: 0 };
    current.forEach(record => {
      const key = W.deadlineInfo(record.officialDeadline, today).bucket;
      if (Object.hasOwn(counts, key)) counts[key] += 1;
    });
    const focusedMetric = document.activeElement?.dataset.metric;
    metrics.innerHTML = W.metrics(metricKeys.map(key => ({
      key, label: deadlines[key], count: counts[key], tone: { overdue: 'danger', today: 'danger', upcoming: 'warning' }[key]
    })), filters.deadline);
    if (focusedMetric) metrics.querySelector(`[data-metric="${focusedMetric}"]`)?.focus({ preventScroll: true });
    document.querySelectorAll('[data-scope]').forEach(button => button.setAttribute('aria-pressed', filters.tab === button.dataset.scope));
    const context = [
      filters.q && '检索「' + filters.q + '」',
      filters.deadline !== 'all' && deadlines[filters.deadline],
      ...Object.keys(fields).map(key => filters[key] && fieldNames[key] + ' ' + filters[key])
    ].filter(Boolean);
    groups.hidden = !context.length;
    groups.innerHTML = context.map(text => '<span>' + W.e(text) + '</span>').join('')
      + (context.length ? '<button class="wb-btn wb-btn-quiet wb-btn-small" type="button" data-clear-filters>清除筛选</button>' : '');
    visible = current.filter(record => {
      if (filters.deadline === 'all') return true;
      if (filters.deadline === 'upcoming30') return DataService.isDeadlineWithin(record.officialDeadline, today, 30);
      return W.deadlineInfo(record.officialDeadline, today).bucket === filters.deadline;
    });
    document.getElementById('case-count').textContent = visible.length + ' 件';
    document.getElementById('export-cases').disabled = !visible.length;
    table.innerHTML = visible.length ? `
      <div class="wb-table-wrap"><table class="wb-table wb-cases-table">
        <caption class="wb-sr">当前筛选后的案卷</caption>
        <thead><tr>
          <th scope="col" class="wb-check-cell"><label><span class="wb-sr">选择本页全部案件</span><input id="case-select-all" type="checkbox"></label></th>
          <th scope="col">商标／案号</th><th scope="col" class="wb-table-secondary">业务／法域</th>
          <th scope="col">官方绝限</th><th scope="col" class="wb-table-secondary">当前状态</th>
          <th scope="col" class="wb-table-secondary">负责人／律所</th>
          <th scope="col" class="wb-table-optional">关联待办</th><th scope="col"><span class="wb-sr">操作</span></th>
        </tr></thead>
        <tbody>${visible.map(row).join('')}</tbody>
      </table></div>`
      : W.empty('没有匹配的案卷', '可尝试按案号或商标名搜索，或清除筛选。', '<button class="wb-btn" type="button" data-clear-filters>清除筛选</button>');
    renderSelection();
  }

  function changeFilter(key, value) {
    filters[key] = value;
    selected.clear();
    render();
  }

  function exportCases(records) {
    W.downloadCsv('商标案件.csv', ['案号', '商标', '法域', '业务', '状态', '申请号', '注册号', '官方绝限', '内部期限', '负责人'],
      records.map(row => [row.id, row.brandName, row.country, row.businessType, row.status, row.applicationNumber,
        row.registrationNumber, row.officialDeadline, row.internalDeadline, row.responsibleUser]));
  }

  main.addEventListener('click', event => {
    const control = event.target.closest('button');
    if (!control) return;
    const { metric, scope, bulk } = control.dataset;
    if (metric) changeFilter('deadline', metric);
    if (scope) changeFilter('tab', scope);
    if (control === toggle) setAdvanced(advanced.hidden);
    if (control.hasAttribute('data-clear-filters')) {
      Object.assign(filters, { tab: 'all', q: '', deadline: 'all', type: '', status: '', owner: '' });
      selected.clear();
      setControls();
      render();
      search.focus();
    }
    if (control.id === 'export-cases') exportCases(visible);
    if (bulk === 'export') exportCases(visible.filter(record => selected.has(record.id)));
    if (bulk === 'clear') {
      selected.clear();
      render();
      document.getElementById('case-select-all')?.focus();
    }
    if (bulk === 'enable' || bulk === 'disable') {
      const result = DataService.batchSetCaseEnabled([...selected], bulk === 'enable');
      selected.clear();
      result.results.filter(row => !row.success).forEach(row => selected.add(row.id));
      render();
      const action = bulk === 'enable' ? '启用' : '停用';
      W.notify(status, result.failureCount
        ? `已${action} ${result.successCount} 件，${result.failureCount} 件未保存。可重试所选项。`
        : `已${action} ${result.successCount} 件案件。`, result.failureCount ? 'error' : 'success');
      document.getElementById('case-select-all')?.focus();
    }
  });

  main.addEventListener('change', event => {
    const control = event.target;
    if (control === sort) changeFilter('sort', sort.value);
    if (control.id.startsWith('filter-')) changeFilter(control.name, control.value);
    if (control.id === 'case-select-all') {
      table.querySelectorAll('[data-select-id]').forEach(input => { input.checked = control.checked; });
      selected.clear();
      if (control.checked) visible.forEach(record => selected.add(record.id));
      renderSelection();
    }
    if (control.dataset.selectId) {
      if (control.checked) selected.add(control.dataset.selectId);
      else selected.delete(control.dataset.selectId);
      renderSelection();
    }
  });
  search.addEventListener('input', () => changeFilter('q', search.value));

  setControls();
  window.addEventListener('pageshow', event => {
    if (event.persisted) render();
  });
  render();
});
