document.addEventListener('DOMContentLoaded', () => {
  const W = CaseWorkspace;
  const main = document.getElementById('main');
  const isDrafts = document.body.dataset.view === 'drafts';
  const page = isDrafts ? 'drafts.html' : 'done.html';
  const title = W.pageLabel(page);
  const params = W.query();
  const origin = isDrafts ? '' : W.returnLink(params.get('from'), '');
  const today = DataService.getToday();
  const user = DataService.CURRENT_USER;
  const createLink = W.url('case-new.html', { from: page });
  const draftTypes = {
    new_apply: '新申请', rejection: '驳回复审', transfer_renewal: '续展',
    opposition: '异议申请', rights_protection: '维权相关', madrid: '国际申请', litigation: '商标诉讼'
  };
  const periods = { all: '全部已办', month: '本月完成', year: '本年完成' };
  const dateFormat = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  });

  let keyword = params.get('q') || '';
  let period = Object.hasOwn(periods, params.get('period')) ? params.get('period') : 'all';
  let selected = params.get('task') || '';
  const searchLabel = isDrafts ? '搜索商标、申请人或法域' : '搜索事项、案号或办理备注';

  W.renderShell(page, [...(origin ? [[W.pageLabel(origin), origin]] : []), [title]]);
  main.innerHTML = `
    <div class="wb-head">
      <h1>${title}</h1>
      <div class="wb-actions">${isDrafts
        ? `<a class="wb-btn wb-btn-primary" href="${W.e(createLink)}">${W.icon('plus')} 新建案件</a>`
        : `<a class="wb-btn" href="${W.e(origin || 'todo.html')}">${W.icon('tasks')} ${origin ? '返回' + W.e(W.pageLabel(origin)) : '查看待办事项'}</a>`}</div>
    </div>
    ${isDrafts ? '' : '<div id="personal-metrics" class="wb-panel wb-metrics wb-record-metrics" role="group" aria-label="按完成时间筛选"></div>'}
    <div class="${isDrafts ? '' : 'wb-record-grid'}">
      <section class="wb-panel" aria-labelledby="record-list-title">
        <div class="wb-filter wb-record-filter" role="search">
          <label class="wb-search">${W.icon('search')}<span class="wb-sr">${searchLabel}</span>
            <input id="record-query" name="q" type="search" maxlength="100" placeholder="${searchLabel}…" autocomplete="off" spellcheck="false">
          </label>
          ${isDrafts ? '<span class="wb-muted wb-small">按最近保存排序</span>' : '<span class="wb-muted wb-small">最近完成优先</span>'}
        </div>
        <div class="wb-panel-head">
          <h2 class="wb-result" id="record-list-title">${isDrafts ? '建案草稿' : '办理记录'}</h2>
          <span class="wb-small wb-num wb-muted" id="record-count" role="status"></span>
        </div>
        <div id="record-list"></div>
      </section>
      ${isDrafts ? '' : '<section class="wb-panel wb-record-detail" id="record-detail" aria-labelledby="record-detail-title" hidden></section>'}
    </div>`;

  const input = main.querySelector('#record-query');
  const list = main.querySelector('#record-list');
  const count = main.querySelector('#record-count');
  const detail = main.querySelector('#record-detail');
  input.value = keyword;

  const drafts = isDrafts ? DataService.getCaseDrafts().sort((a, b) => W.compareText(b.savedAt, a.savedAt)) : [];
  const completed = isDrafts ? [] : W.allTasks().filter(task => W.isComplete(task) &&
    (task.completedById ? task.completedById === user.id : (task.completedBy || task.assignee) === user.name)
  ).sort((a, b) => W.compareText(b.completedAt, a.completedAt) || W.compareText(b.completedTimestamp, a.completedTimestamp));
  const linkedCases = new Map(W.allCases().map(record => [record.id, record]));
  const matches = (query, fields) => query.split(/\s+/).every(token => fields.some(value => W.searchText(value).includes(token)));

  function periodMatch(task, key) {
    if (key === 'all') return true;
    const prefix = key === 'month' ? today.slice(0, 7) : today.slice(0, 4);
    return String(task.completedAt || '').startsWith(prefix + '-');
  }

  function draftDate(value) {
    return Number.isFinite(Date.parse(value))
      ? `<time class="wb-num" datetime="${W.e(value)}">${W.e(dateFormat.format(new Date(value)))}</time>`
      : '<span class="wb-muted">未记录保存时间</span>';
  }

  function renderDrafts() {
    const search = W.searchText(keyword);
    const visible = drafts.filter(({ data }) => matches(search, [data.brandName, data.applicant, data.country, draftTypes[data.businessTypeCode]]));
    count.textContent = visible.length + ' 份';
    if (!visible.length) {
      list.innerHTML = search
        ? W.empty('没有匹配的草稿', '可换个关键词，或清除搜索查看全部草稿。', '<button class="wb-btn" type="button" data-clear-record-search>清除搜索</button>')
        : W.empty('暂无案件草稿', '新建案件时选择保存草稿，即可在这里续编。', `<a class="wb-btn" href="${W.e(createLink)}">新建案件</a>`);
      return;
    }
    list.innerHTML = `<div class="wb-draft-columns" aria-hidden="true"><span>商标／业务</span><span>申请人</span><span>最近保存</span><span>操作</span></div>
      <ul class="wb-record-list">${visible.map(({ id, data, savedAt }) => {
      const name = data.brandName?.trim() || '未命名案件';
      const url = W.url('case-new.html', { draft: id, from: W.currentLink() });
      return `<li><a class="wb-record-row wb-draft-row" href="${W.e(url)}">
        <span class="wb-record-icon">${W.icon('file', 19)}</span>
        <span class="wb-record-identity"><strong class="wb-wrap">${W.e(name)}</strong>
          <span class="wb-task-row-meta"><span>${W.e(draftTypes[data.businessTypeCode] || '未选业务类型')}</span><span>${W.e(data.country || '未选法域')}</span></span>
        </span>
        <span class="wb-record-applicant wb-wrap"><span class="wb-small wb-muted">申请人</span>${W.e(data.applicant?.trim() || '未填写')}</span>
        <span class="wb-record-saved"><span class="wb-small wb-muted">最近保存</span>${draftDate(savedAt)}</span>
        <span class="wb-record-cta">续编草稿 ${W.icon('arrow', 14)}</span>
      </a></li>`;
    }).join('')}</ul>`;
  }

  const metrics = main.querySelector('#personal-metrics');
  if (metrics) {
    metrics.innerHTML = W.metrics(Object.entries(periods).map(([key, label]) => ({
      key, label, count: completed.filter(task => periodMatch(task, key)).length, tone: key === 'month' ? 'blue' : ''
    })), period);
  }

  function renderCompleted(focusDetail) {
    const search = W.searchText(keyword);
    const visible = completed.filter(task => periodMatch(task, period) &&
      matches(search, [task.title, task.caseId, linkedCases.get(task.caseId)?.brandName, task.caseName, task.note, task.typeLabel || task.type]));
    const task = visible.find(row => row.id === selected) || visible[0];
    selected = task?.id || '';
    W.replaceQuery({ q: keyword, period: period === 'all' ? '' : period, task: selected, from: origin });
    metrics.querySelectorAll('[data-metric]').forEach(button => button.setAttribute('aria-pressed', button.dataset.metric === period));
    count.textContent = visible.length + ' 项';
    if (!focusDetail) list.innerHTML = visible.length
      ? `<ul class="wb-record-list">${visible.map(item => `<li><button type="button" class="wb-record-row wb-completed-row" data-record-id="${W.e(item.id)}" aria-pressed="${selected === item.id}" aria-controls="record-detail">
        <span class="wb-record-icon wb-record-icon-complete">${W.icon('check', 19)}</span>
        <span class="wb-record-identity"><strong class="wb-wrap">${W.e(item.title)}</strong>
          <span class="wb-task-row-meta"><span>${W.e(item.typeLabel || item.type || '任务办理')}</span><span class="wb-mono" translate="no">${W.e(item.caseId || '独立事项')}</span></span>
          ${item.note ? `<span class="wb-note-preview">${W.e(item.note)}</span>` : ''}
        </span>
        <span class="wb-record-time">${W.dateMarkup(item.completedAt, { completed: true })}</span>
        <span class="wb-record-cta">${W.icon('chevron', 15)}</span>
      </button></li>`).join('')}</ul>`
      : W.empty(search || period !== 'all' ? '没有匹配的办理记录' : '暂无办理记录',
        search || period !== 'all' ? '可换个关键词，或查看全部已办。' : '待办标记完成后，即可在这里查询。');
    if (focusDetail) list.querySelectorAll('[data-record-id]').forEach(button =>
      button.setAttribute('aria-pressed', button.dataset.recordId === selected));
    detail.hidden = !task;
    if (!task) return;
    const linked = linkedCases.get(task.caseId);
    detail.classList.toggle('is-opened', Boolean(focusDetail));
    detail.innerHTML = `
      <div class="wb-panel-head wb-record-content">
        <div><div class="wb-title-line">${W.taskStatus(task)} <span class="wb-small wb-muted">办理详情</span></div>
          <h2 id="record-detail-title" class="wb-wrap" tabindex="-1">${W.e(task.title)}</h2></div>
      </div>
      <div class="wb-panel-body wb-record-content">
        <dl class="wb-key-values">
          <div><dt>完成人</dt><dd>${W.e(task.completedBy || task.assignee || '未记录')}</dd></div>
          <div><dt>完成日期</dt><dd>${W.dateMarkup(task.completedAt, { completed: true })}</dd></div>
          <div class="wb-field-wide wb-note-block"><dt>办理备注</dt><dd class="wb-record-note">${W.e(task.note || '未填写备注')}</dd></div>
        </dl>
        <div class="wb-record-footer">${linked
          ? `<a class="wb-data-link" href="${W.e(W.caseHref(linked.id, W.currentLink()))}">${W.icon('file', 15)} ${W.e(linked.brandName)} · ${W.e(linked.id)} ${W.icon('arrow', 15)}</a>`
          : '<span class="wb-muted wb-small">无关联案卷</span>'}
          <button type="button" class="wb-btn wb-btn-quiet wb-record-return" data-return-record>返回所选记录</button></div>
      </div>`;
    if (focusDetail) detail.querySelector('h2').focus();
  }

  function render(options = {}) {
    if (isDrafts) {
      W.replaceQuery({ q: keyword });
      renderDrafts();
    } else renderCompleted(options.focusDetail);
  }

  input.addEventListener('input', () => {
    keyword = input.value.trim();
    render();
  });
  main.addEventListener('click', event => {
    const control = event.target.closest('button');
    if (!control) return;
    if (control.hasAttribute('data-return-record')) {
      list.querySelector('[aria-pressed="true"]')?.focus();
    } else if (control.hasAttribute('data-clear-record-search')) {
      input.value = keyword = '';
      render();
      input.focus();
    } else if (control.dataset.metric) {
      period = control.dataset.metric;
      render();
    } else if (control.dataset.recordId) {
      selected = control.dataset.recordId;
      render({ focusDetail: true });
    }
  });
  window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });

  render();
});
