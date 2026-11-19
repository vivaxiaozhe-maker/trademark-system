document.addEventListener('DOMContentLoaded', () => {
  const W = CaseWorkspace;
  const main = document.getElementById('main');
  const params = W.query();
  const statuses = { open: '未完成', overdue: '已逾期', in_progress: '处理中', completed: '已完成' };
  const sorts = { due: '截止日期优先', priority: '优先级排序', newest: '最近创建' };
  const priorities = { urgent: '紧急', high: '高', medium: '中', normal: '普通', low: '低' };
  const order = Object.keys(priorities);
  const taskTypes = ['案件处理', '费用审批', '文件批注', '风险评估', '预算编制', '证据管理', '服务评价', '监测报告'];
  const requested = W.taskFor(params.get('task'));
  const filters = {
    case: params.get('case') || '',
    task: requested ? String(requested.id) : '',
    status: Object.hasOwn(statuses, params.get('status')) ? params.get('status') : W.isComplete(requested || {}) ? 'completed' : 'open',
    q: params.get('q') || '',
    type: params.get('type') || '',
    sort: Object.hasOwn(sorts, params.get('sort')) ? params.get('sort') : 'due',
    from: W.returnLink(params.get('from'), '')
  };
  const drafts = new Map();
  let visible = [];
  let selectedTask = null;

  const origin = filters.from;
  const originPage = W.pageName(origin);
  W.renderShell('todo.html', [...(origin ? [[W.pageLabel(origin), origin]] : []), ['待办事项']]);
  main.innerHTML = `
    <div class="wb-head">
      <div><h1>待办事项</h1></div>
      <div class="wb-actions">
        ${origin ? `<a class="wb-btn" href="${W.e(origin)}">返回${W.e(W.pageLabel(origin))}</a>` : ''}
        <button class="wb-btn" id="export-tasks" type="button">${W.icon('download')} 导出结果</button>
        <button class="wb-btn wb-btn-primary" id="new-task" type="button">${W.icon('plus')} 新建任务</button>
      </div>
    </div>
    <div class="wb-status" id="task-notice" role="status" aria-live="polite"></div>
    <div class="wb-panel wb-metrics" id="task-metrics" role="group" aria-label="按处理状态筛选"></div>
    <div class="wb-task-grid">
      <section class="wb-panel" aria-labelledby="task-list-title">
        <div class="wb-filter" role="search" aria-label="任务筛选">
          <div class="wb-toolbar">
            <label class="wb-search">
              ${W.icon('search')}<span class="wb-sr">搜索任务、案号或说明</span>
              <input id="task-query" name="q" type="search" placeholder="搜索任务、案号或说明…" autocomplete="off" spellcheck="false" maxlength="100">
            </label>
            <label class="wb-inline-select"><span class="wb-sr">任务类型</span><select id="filter-task-type" class="wb-input" name="type"></select></label>
          </div>
          <div class="wb-active-filters" id="task-filter-context" hidden></div>
        </div>
        <div class="wb-panel-head">
          <h2 class="wb-result" id="task-list-title">任务清单</h2><span class="wb-muted wb-small wb-num" id="task-count" role="status"></span>
          <label class="wb-inline-select">排序<select name="sort" class="wb-input" id="task-sort">
            ${Object.entries(sorts).map(([key, label]) => `<option value="${key}">${label}</option>`).join('')}
          </select></label>
        </div>
        <div id="task-results"></div>
      </section>
      <section class="wb-panel wb-task-panel" id="task-panel" tabindex="-1" aria-labelledby="task-detail-title" hidden></section>
    </div>
    <dialog class="wb-dialog" id="task-dialog" aria-labelledby="task-create-title">
      <div class="wb-panel-head"><h2 id="task-create-title">新建任务</h2><button type="button" class="wb-btn wb-btn-quiet wb-btn-small" data-close-dialog aria-label="关闭">${W.icon('close')}</button></div>
      <form class="wb-panel-body" id="new-task-form" autocomplete="off">
        <div class="wb-fields">
          <label class="wb-field wb-field-wide">任务名称<input class="wb-input" name="title" required maxlength="100" placeholder="例如，复核驳回复审材料…"></label>
          <label class="wb-field">任务类型<select class="wb-input" name="type">${taskTypes.map(type => `<option>${W.e(type)}</option>`).join('')}</select></label>
          <label class="wb-field">优先级<select class="wb-input" name="priority">${Object.entries(priorities).map(([key, label]) => `<option value="${key}"${key === 'normal' ? ' selected' : ''}>${label}</option>`).join('')}</select></label>
          <label class="wb-field">待办截止<input class="wb-input" name="deadline" type="date" required></label>
          <label class="wb-field">负责人<input class="wb-input" name="assignee" value="Missy" required maxlength="60"></label>
          <label class="wb-field wb-field-wide">关联案卷<select class="wb-input" name="caseId" id="task-case-options"></select></label>
          <label class="wb-field wb-field-wide">任务说明<textarea class="wb-input" name="description" maxlength="500" rows="2"></textarea></label>
        </div>
        <div class="wb-status" id="task-create-error" role="alert"></div>
        <div class="wb-form-actions"><button type="button" class="wb-btn" data-close-dialog>取消</button><button type="submit" class="wb-btn wb-btn-primary">创建任务</button></div>
      </form>
    </dialog>`;

  const notice = main.querySelector('#task-notice');
  const metrics = main.querySelector('#task-metrics');
  const search = main.querySelector('#task-query');
  const typeSelect = main.querySelector('#filter-task-type');
  const sort = main.querySelector('#task-sort');
  const results = main.querySelector('#task-results');
  const panel = main.querySelector('#task-panel');
  const context = main.querySelector('#task-filter-context');
  const dialog = main.querySelector('#task-dialog');
  const createForm = main.querySelector('#new-task-form');
  const lookupCase = id => id ? DataService.getCaseById(id) : null;
  const byStatus = {
    open: task => !W.isComplete(task),
    overdue: task => !W.isComplete(task) && W.deadlineInfo(task.deadline).bucket === 'overdue',
    in_progress: task => task.status === 'in_progress',
    completed: W.isComplete
  };

  function setControls() {
    const values = [...new Set([...taskTypes, ...W.uniqueValues(W.allTasks(), 'type')])];
    typeSelect.innerHTML = W.options(values, '全部类型');
    if (!values.includes(filters.type)) filters.type = '';
    typeSelect.value = filters.type;
    search.value = filters.q;
    sort.value = filters.sort;
  }

  function candidates() {
    const keyword = W.searchText(filters.q);
    const current = W.allTasks().filter(task => {
      if (filters.case && task.caseId !== filters.case) return false;
      if (filters.type && task.type !== filters.type) return false;
      return !keyword || [task.title, task.caseId, task.assignee, lookupCase(task.caseId)?.brandName, task.description]
        .some(value => W.searchText(value).includes(keyword));
    });
    const byPriority = task => order.includes(task.priority) ? order.indexOf(task.priority) : order.length;
    const byDeadline = (a, b) => W.dateSort(a, b, 'deadline');
    const sortTasks = {
      due: byDeadline,
      priority: (a, b) => byPriority(a) - byPriority(b) || byDeadline(a, b),
      newest: (a, b) => W.compareText(b.createdAt, a.createdAt) || byDeadline(a, b)
    }[filters.sort];
    return current.sort((a, b) => sortTasks(a, b) || W.compareText(a.id, b.id));
  }

  function row(task) {
    const associated = lookupCase(task.caseId);
    const chosen = task === selectedTask;
    return `<li class="wb-task-row${chosen ? ' is-selected' : ''}">
      <div>
        <p class="wb-task-title wb-strong wb-wrap">${W.e(task.title)}</p>
        <div class="wb-task-row-meta">
          ${W.taskStatus(task)}<span>${W.e(task.typeLabel || task.type || '未分类')}</span>
          ${associated ? `<a class="wb-mono" translate="no" href="${W.e(W.caseHref(associated.id, W.currentLink()))}">${W.e(associated.id)}</a>` : ''}
        </div>
      </div>
      <div class="wb-queue-assignee wb-wrap"><span class="wb-assignee-label">负责人</span> ${W.e(task.assignee || '未分配')}</div>
      <div class="wb-queue-deadline">
        ${W.isComplete(task) ? '<span class="wb-small wb-muted">完成日期</span>' : '<span class="wb-sr">待办截止</span>'}
        ${W.dateMarkup(W.isComplete(task) ? task.completedAt : task.deadline, { completed: W.isComplete(task) })}
      </div>
      <button type="button" class="wb-btn wb-btn-quiet wb-btn-small" data-open-task="${W.e(task.id)}" aria-label="${W.isComplete(task) ? '查看 ' : '办理 '}${W.e(task.title)}" aria-controls="task-panel" aria-expanded="${chosen}">${W.isComplete(task) ? '查看' : '办理'}</button>
    </li>`;
  }

  function renderPanel() {
    const task = selectedTask;
    panel.hidden = !task;
    if (!task) { panel.replaceChildren(); return; }
    const linked = lookupCase(task.caseId);
    const completed = W.isComplete(task);
    const priority = priorities[task.priority] || task.priorityLabel || '普通';
    const source = task.sourceMonitorResultId && DataService.getMonitorResultById(task.sourceMonitorResultId);
    const draft = drafts.get(String(task.id)) ?? (task.note || '');
    panel.innerHTML = `
      <div class="wb-panel-head">
        <div class="wb-task-panel-title">
          <div class="wb-title-line"><span class="wb-processing-label">${W.icon('tasks', 16)} 任务办理</span>${W.taskStatus(task)}<span class="wb-small wb-muted">${W.e(priority)}优先级</span></div>
          <h2 id="task-detail-title" class="wb-wrap">${W.e(task.title)}</h2>
        </div>
      </div>
      <div class="wb-panel-body">
        <div class="wb-task-panel-copy">
          <div class="wb-processing-owner"><span>负责人</span><strong>${W.e(task.assignee || '未分配')}</strong><span>${W.e(task.typeLabel || task.type || '未分类')}</span></div>
          ${linked ? `<a class="wb-data-link" href="${W.e(W.caseHref(linked.id, W.currentLink()))}">${W.icon('file', 15)} ${W.e(linked.brandName)} · ${W.e(linked.id)}</a>`
            : `<p class="wb-muted wb-small">${task.caseId ? '关联案卷不在当前演示数据中。' : '独立任务'}</p>`}
          <div class="wb-task-dates wb-deadline-pair">
            <div class="wb-deadline-block"><p class="wb-small wb-strong">待办截止</p>${W.dateMarkup(task.deadline, { completed })}</div>
            <div class="wb-deadline-block"><p class="wb-small wb-strong">官方绝限</p>${W.dateMarkup(linked?.officialDeadline, { href: linked && W.caseHref(linked.id, W.currentLink(), '#deadlines') })}</div>
          </div>
          ${source ? `<a class="wb-data-link" href="${W.e((originPage === 'monitor.html' && new URL(origin, location.href).searchParams.get('alert') === source.id ? origin : W.url('monitor.html', { alert: source.id })))}">${W.icon('search', 15)} 查看来源预警</a>` : ''}
          ${task.description ? '<p class="wb-list-preserve wb-muted">' + W.e(task.description) + '</p>' : ''}
        </div>
        ${completed ? `<div class="wb-task-note">
          <p class="wb-small wb-muted">完成于 ${W.e(task.completedAt || '未登记')}</p>
          <p class="wb-list-preserve">${W.e(task.note || '未填写处理备注')}</p>
          <div class="wb-form-actions"><a class="wb-btn wb-btn-primary" href="${W.e(W.taskHref(task, W.currentLink()))}">查看已办记录 ${W.icon('arrow', 15)}</a><button class="wb-btn" type="button" data-task-action="reopen">恢复为待处理</button></div>
        </div>` : `
        <form class="wb-task-note" id="task-process-form" autocomplete="off">
          <label class="wb-field">处理备注 <span class="wb-sr">选填</span>
            <textarea class="wb-input" name="note" rows="2" maxlength="500" placeholder="记录已完成的动作或下一步…">${W.e(draft)}</textarea>
          </label>
          <div class="wb-task-flow">
            ${task.status === 'in_progress'
              ? '<button type="button" class="wb-btn" data-task-action="save-note">保存备注</button>'
              : '<button type="button" class="wb-btn" data-task-action="start">开始处理</button>'}
            <button class="wb-btn wb-btn-primary" type="submit">${W.icon('check', 16)} 标记已完成</button>
          </div>
        </form>`}
        <div class="wb-status" id="task-panel-status" role="status"></div>
        <button class="wb-btn wb-btn-quiet wb-back-to-queue" type="button" data-back-to-queue>返回所选任务</button>
      </div>`;
  }

  function render({ chooseFirst = false, focusPanel = false } = {}) {
    const items = candidates();
    const focusedMetric = document.activeElement?.dataset.metric;
    metrics.innerHTML = W.metrics(Object.entries(statuses).map(([key, label]) => ({
      key, label, count: items.filter(byStatus[key]).length, tone: { overdue: 'danger', in_progress: 'warning' }[key]
    })), filters.status);
    if (focusedMetric) metrics.querySelector(`[data-metric="${focusedMetric}"]`)?.focus({ preventScroll: true });
    visible = items.filter(byStatus[filters.status]);
    selectedTask = visible.find(task => String(task.id) === filters.task) || (chooseFirst ? visible[0] : null);
    filters.task = String(selectedTask?.id || '');
    W.replaceQuery({ ...filters, status: filters.status === 'open' ? '' : filters.status, sort: filters.sort === 'due' ? '' : filters.sort });
    const linked = lookupCase(filters.case);
    context.hidden = !filters.case && !filters.q && !filters.type;
    context.innerHTML = `
      ${filters.case ? `<div class="wb-context">关联案卷 ${linked
        ? `<a href="${W.e(W.caseHref(linked.id, W.currentLink()))}">${W.e(linked.brandName)} · ${W.e(linked.id)}</a>`
        : W.e(filters.case)}</div>` : ''}
      <button type="button" class="wb-btn wb-btn-quiet wb-btn-small" data-reset-task-filters>清除筛选</button>`;
    document.getElementById('task-count').textContent = visible.length + ' 项';
    document.getElementById('export-tasks').disabled = !visible.length;
    results.innerHTML = visible.length ? `<div class="wb-queue-columns" aria-hidden="true"><span>事项／案卷</span><span>负责人</span><span>${filters.status === 'completed' ? '完成日期' : '待办截止'}</span><span>操作</span></div>
      <ul class="wb-task-list">${visible.map(row).join('')}</ul>`
      : W.empty('没有匹配的任务', '可调整案卷、任务类型或处理状态。', '<button type="button" class="wb-btn" data-reset-task-filters>清除筛选</button>');
    renderPanel();
    if (focusPanel && selectedTask) panel.focus({ preventScroll: false });
  }

  function applyFilters() { render({ chooseFirst: true }); }

  function changeTask(action) {
    if (!selectedTask) return;
    const task = selectedTask;
    const note = drafts.get(String(task.id)) ?? (task.note || '');
    const updates = { start: { status: 'in_progress', statusLabel: '处理中', note },
      'save-note': { note },
      reopen: { status: 'pending', statusLabel: '待处理', completedAt: '', completedTimestamp: '', completedById: '', completedBy: '', note }
    }[action];
    if (!updates && action !== 'complete') return;
    const saved = action === 'complete' ? DataService.completeTodo(task.id, note) : DataService.updateTodo(task.id, updates);
    if (!saved) {
      W.notify(panel.querySelector('#task-panel-status'), '任务未保存，输入已保留。请检查浏览器存储设置后重试。', 'error');
      return;
    }
    drafts.delete(String(task.id));
    if (action === 'complete') filters.status = 'completed';
    if (action === 'reopen') filters.status = 'open';
    W.refreshTaskCount();
    render({ chooseFirst: true, focusPanel: true });
    W.notify(panel.querySelector('#task-panel-status'), {
      start: '任务已开始处理。', 'save-note': '处理备注已保存。',
      complete: '任务已标记为完成。', reopen: '任务已恢复为待处理。'
    }[action], 'success');
  }

  function openDialog() {
    createForm.reset();
    W.notify(main.querySelector('#task-create-error'), '');
    createForm.elements.caseId.innerHTML = '<option value="">独立任务</option>' + W.allCases()
      .map(record => `<option value="${W.e(record.id)}">${W.e(record.brandName)} · ${W.e(record.id)}</option>`).join('');
    createForm.elements.caseId.value = lookupCase(filters.case)?.id || '';
    dialog.showModal();
  }

  function createTask() {
    const values = Object.fromEntries(new FormData(createForm));
    const error = main.querySelector('#task-create-error');
    const title = values.title.trim();
    const assignee = values.assignee.trim();
    if (!title || !assignee) {
      W.notify(error, '请填写任务名称与负责人。', 'error');
      createForm.elements[!title ? 'title' : 'assignee'].focus();
      return;
    }
    const related = lookupCase(values.caseId);
    const saved = DataService.createTodo({
      id: DataService.generateId('todo'), title, assignee, type: values.type, typeLabel: values.type,
      priority: values.priority, priorityLabel: priorities[values.priority], deadline: values.deadline,
      caseId: related?.id || null, caseName: related?.brandName || null,
      description: values.description.trim(), status: 'pending', statusLabel: '待处理'
    });
    if (!saved) {
      W.notify(error, '任务未创建，输入已保留。请检查浏览器存储设置后重试。', 'error');
      return;
    }
    dialog.close();
    Object.assign(filters, { case: saved.caseId || '', task: String(saved.id), status: 'open', q: '', type: '' });
    setControls();
    W.refreshTaskCount();
    render({ focusPanel: true });
    W.notify(notice, '任务已创建。', 'success');
  }

  main.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const { metric, openTask, taskAction } = button.dataset;
    if (metric) { filters.status = metric; applyFilters(); }
    if (openTask) { filters.task = openTask; render({ focusPanel: true }); }
    if (taskAction) changeTask(taskAction);
    if (button.hasAttribute('data-back-to-queue')) results.querySelector('.is-selected [data-open-task]')?.focus();
    if (button.id === 'new-task') openDialog();
    if (button.hasAttribute('data-close-dialog')) dialog.close();
    if (button.hasAttribute('data-reset-task-filters')) {
      Object.assign(filters, { case: '', task: '', status: 'open', q: '', type: '' });
      setControls();
      applyFilters();
      search.focus();
    }
    if (button.id === 'export-tasks') {
      W.downloadCsv('商标待办.csv', ['任务', '案号', '负责人', '待办截止', '状态', '完成日期', '处理备注'],
        visible.map(task => [task.title, task.caseId, task.assignee, task.deadline,
          W.isComplete(task) ? '已完成' : task.status === 'in_progress' ? '处理中' : '待处理',
          task.completedAt, task.note]));
    }
  });

  main.addEventListener('submit', event => {
    event.preventDefault();
    if (event.target === createForm) createTask();
    if (event.target.id === 'task-process-form') changeTask('complete');
  });

  main.addEventListener('input', event => {
    if (event.target.form?.id === 'task-process-form' && selectedTask) {
      const key = String(selectedTask.id);
      if (event.target.value.trim() === (selectedTask.note || '')) drafts.delete(key);
      else drafts.set(key, event.target.value.trim());
    }
  });
  window.addEventListener('beforeunload', event => {
    if (drafts.size) { event.preventDefault(); event.returnValue = ''; }
  });
  search.addEventListener('input', () => { filters.q = search.value; applyFilters(); });
  typeSelect.addEventListener('change', () => { filters.type = typeSelect.value; applyFilters(); });
  sort.addEventListener('change', () => { filters.sort = sort.value; applyFilters(); });
  setControls();
  render({ chooseFirst: !params.has('task'), focusPanel: Boolean(requested) && matchMedia('(max-width: 640px)').matches });
  if (params.has('task') && !selectedTask) W.notify(notice, '当前筛选范围内找不到指定任务。可清除筛选后重新查找。', 'error');
});
