document.addEventListener('DOMContentLoaded', () => {
  const W = CaseWorkspace;
  const main = document.getElementById('main');
  const today = DataService.getToday();
  const cases = W.allCases();
  const tasks = W.allTasks();
  const active = tasks.filter(task => !W.isComplete(task));
  const overdue = active.filter(task => W.deadlineInfo(task.deadline, today).bucket === 'overdue');
  const inProgress = active.filter(task => task.status === 'in_progress');
  const sortedTasks = [...active].sort((a, b) => W.dateSort(a, b, 'deadline') || W.compareText(a.id, b.id));
  const recentCases = [...cases].sort((a, b) =>
    W.compareText(b.savedAt || b.updatedAt, a.savedAt || a.updatedAt) || W.compareText(b.id, a.id)).slice(0, 4);
  const dateLabel = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  }).format(new Date(today + 'T12:00:00+08:00'));

  window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
  W.renderShell('index.html', [['工作台']]);
  const todoHref = status => W.url(W.pageHref('todo.html'), { status, from: W.currentLink() });
  const metricItems = [
    [active.length + ' 项未完成', todoHref()],
    [inProgress.length + ' 项处理中', todoHref('in_progress')],
    [cases.length + ' 件案卷', W.pageHref('cases.html')]
  ];
  const deadlines = cases.map(record => ({
    record, offset: DataService.daysBetween(today, record.officialDeadline)
  }));
  const overdueOfficial = deadlines.filter(({ offset }) => offset < 0).length;
  const unknownOfficial = deadlines.filter(({ offset }) => !Number.isFinite(offset)).length;
  const caseListHref = deadline => W.url(W.pageHref('cases.html'), { deadline });

  const headings = `
    <div class="wb-head wb-focus-head">
      <div><h1>工作台</h1><p class="wb-subtitle">${W.e(dateLabel)}</p></div>
      <div class="wb-actions">
        <a class="wb-btn" href="${W.pageHref('collab.html')}">${W.icon('firm')} 律所协作</a>
        <a class="wb-btn wb-btn-primary" data-home-origin href="${W.e(W.url(W.pageHref('case-new.html'), { from: W.currentLink() }))}">${W.icon('plus')} 新建案件</a>
      </div>
    </div>`;

  function reminder(task) {
    const record = task.caseId && DataService.getCaseById(task.caseId);
    const tone = W.deadlineInfo(task.deadline, today).tone;
    return `<li><a href="${W.e(W.taskHref(task, W.currentLink()))}" class="wb-home-reminder" data-home-origin${tone ? ` data-deadline-tone="${tone}"` : ''}>
      <div class="wb-wrap wb-queue-name"><strong>${W.e(task.title)}</strong><span class="wb-workspace-meta">${W.e(task.type || '')}</span></div>
      <span class="wb-queue-case wb-mono" translate="no">${W.e(record?.id || '未关联案卷')}<span class="wb-compact-owner"> · ${W.e(task.assignee || '未分配')}</span></span>
      <span class="wb-queue-owner">${W.e(task.assignee || '未分配')}</span>
      <div class="wb-reminder-date">${W.dateMarkup(task.deadline)}</div>
      <span class="wb-queue-go">办理 ${W.icon('arrow', 13)}</span>
    </a></li>`;
  }

  const reminders = sortedTasks.length
    ? `<div class="wb-queue-labels" aria-hidden="true"><span>待办事项</span><span>案卷号</span><span>负责人</span><span>待办截止</span><span>操作</span></div>
        <ul class="wb-home-list">${sortedTasks.slice(0, 3).map(reminder).join('')}</ul>`
      + (sortedTasks.length > 3 ? `<details class="wb-desk-more">
        <summary>展开其余 ${Math.min(sortedTasks.length, 5) - 3} 项提醒</summary>
        <ul class="wb-home-list">${sortedTasks.slice(3, 5).map(reminder).join('')}</ul>
      </details>` : '')
    : W.empty('暂无未完成待办', '新任务会显示在这里。', `<a class="wb-btn" data-home-origin href="${W.e(todoHref())}">查看待办事项</a>`);

  main.innerHTML = `
    ${headings}
    <div class="wb-panel wb-desk">
      <section class="wb-focus-reminders" aria-labelledby="home-reminders">
        <div class="wb-desk-head">
          <div class="wb-desk-title"><h2 id="home-reminders">待办提醒</h2>
            ${overdue.length ? `<a class="wb-desk-overdue" data-home-origin href="${W.e(todoHref('overdue'))}">${overdue.length} 项逾期</a>` : ''}</div>
          <a class="wb-desk-all" data-home-origin href="${W.e(todoHref())}">全部待办 ${W.icon('arrow', 14)}</a>
        </div>
        ${reminders}
        <div class="wb-desk-meta" aria-label="工作概况">${metricItems.map(([label, href], index) =>
          `<a${index < 2 ? ' data-home-origin' : ''} href="${W.e(href)}">${label}</a>`).join('')}</div>
      </section>
      <section class="wb-focus-horizon" aria-labelledby="home-deadlines">
        <div class="wb-desk-head">
          <h2 id="home-deadlines">官方绝限</h2>
          <div class="wb-steps" role="group" aria-label="绝限时间范围">
            <button type="button" data-window="7" aria-pressed="true">7 天</button><button type="button" data-window="30" aria-pressed="false">30 天</button>
          </div>
        </div>
        <div class="wb-desk-horizon">
          <div class="wb-desk-rail" id="home-date-rail" role="group" aria-label="按日查看官方绝限"></div>
          <div class="wb-desk-results" id="home-date-results" role="region" aria-labelledby="home-date-heading"></div>
          <p class="wb-sr" id="home-horizon-status" role="status" aria-atomic="true"></p>
          <div class="wb-desk-meta wb-desk-case-meta">
            <a id="home-upcoming-link"></a>
            <a href="${W.e(caseListHref('overdue'))}"${overdueOfficial ? ' class="wb-desk-alert-link"' : ''}>已逾期 ${overdueOfficial} 件</a>
            <a href="${W.e(caseListHref('today'))}">今日到期</a>
            <a href="${W.e(caseListHref('unknown'))}">未登记 ${unknownOfficial} 件</a>
          </div>
        </div>
      </section>
    </div>
    <div class="wb-home-grid wb-focus-home-grid">
      <section class="wb-panel wb-focus-panel wb-focus-recent" aria-labelledby="home-recent">
        <div class="wb-panel-head"><h2 id="home-recent">最近更新案卷</h2>
          <a class="wb-btn wb-btn-quiet wb-btn-small" href="${W.pageHref('cases.html')}">案件管理 ${W.icon('arrow', 14)}</a></div>
        ${recentCases.length ? '<ul class="wb-home-list">' + recentCases.map(record => `<li><a class="wb-home-reminder" data-home-origin href="${W.e(W.caseHref(record.id, W.currentLink()))}">
          <span class="wb-wrap"><strong>${W.e(record.brandName)}</strong><span class="wb-workspace-meta wb-mono">${W.e(record.id)} · ${W.e(record.businessType)}</span></span>
          ${W.caseStatus(record)}${W.icon('chevron', 16)}</a></li>`).join('') + '</ul>' : W.empty('暂无案卷', '保存新案件后会显示在这里。')}
      </section>
      <section class="wb-panel wb-focus-panel wb-focus-types" aria-labelledby="home-types">
        <div class="wb-panel-head"><h2 id="home-types">案件类型构成</h2></div>
        <div class="wb-panel-body wb-chart-area" id="home-types-chart"></div>
      </section>
    </div>`;

  const shortDate = new Intl.DateTimeFormat('zh-CN', { timeZone: 'UTC', month: 'numeric', day: 'numeric' });
  const longDate = new Intl.DateTimeFormat('zh-CN', { timeZone: 'UTC', month: 'long', day: 'numeric' });
  const fullDate = new Intl.DateTimeFormat('zh-CN', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
  const weekday = new Intl.DateTimeFormat('zh-CN', { timeZone: 'UTC', weekday: 'short' });
  const utc = iso => new Date(iso + 'T00:00:00Z');
  function dateAtOffset(offset) {
    const date = utc(today);
    date.setUTCDate(date.getUTCDate() + offset);
    return date;
  }

  const dateRail = main.querySelector('#home-date-rail');
  const results = main.querySelector('#home-date-results');
  const status = main.querySelector('#home-horizon-status');
  const upcomingLink = main.querySelector('#home-upcoming-link');
  let range = W.query().get('window') === '30' ? 30 : 7;
  let periods = [];
  let selectedDay = W.query().get('day');

  function buildPeriods(windowDays) {
    const grouped = windowDays === 30;
    const step = grouped ? 5 : 1;
    const first = grouped ? 1 : 0;
    return Array.from({ length: grouped ? 6 : 8 }, (_, index) => {
      const from = first + index * step;
      const to = from + step - 1;
      const start = dateAtOffset(from);
      const end = dateAtOffset(to);
      return {
        id: start.toISOString().slice(0, 10),
        start, end, from, to,
        records: deadlines.filter(({ offset }) => offset >= from && offset <= to)
          .map(({ record }) => record).sort((a, b) => W.dateSort(a, b, 'officialDeadline') || W.compareText(a.id, b.id))
      };
    });
  }

  function writeSelection() {
    W.replaceQuery({ ...Object.fromEntries(W.query()), window: range === 30 ? '30' : null, day: selectedDay });
    main.querySelectorAll('[data-home-origin]').forEach(link => {
      const target = new URL(link.href);
      target.searchParams.set('from', W.currentLink());
      link.href = target;
    });
  }

  function describePeriod(period) {
    if (period.from === period.to) return fullDate.format(period.start);
    return fullDate.format(period.start) + '至' + (
      period.start.getUTCFullYear() === period.end.getUTCFullYear() ? longDate : fullDate
    ).format(period.end);
  }

  function periodButton(period) {
    const { start, end, from, id, records } = period;
    const grouped = range === 30;
    const count = records.length;
    const crossesYear = start.getUTCFullYear() !== end.getUTCFullYear();
    const endpoints = crossesYear ? fullDate : shortDate;
    const track = grouped ? `<span class="wb-period-endpoints">${endpoints.format(start)} 至 ${endpoints.format(end)}</span>
      <span class="wb-period-count">${count} 件</span>`
      : `<span class="wb-period-weekday">${from === 0 ? '今天' : weekday.format(start)}</span>
        <span class="wb-period-day wb-num">${shortDate.format(start)}</span><span class="wb-period-mark" aria-hidden="true">${count || ''}</span>`;
    return `<button class="wb-period" type="button" data-period="${id}" aria-pressed="false"
      aria-controls="home-date-results" aria-label="${W.e(describePeriod(period))}，${count} 件案卷">${track}</button>`;
  }

  function showPeriod(period, announce = false) {
    selectedDay = period.id;
    if (announce) writeSelection();
    dateRail.querySelectorAll('[data-period]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.period === selectedDay));
    });
    const count = period.records.length;
    const label = describePeriod(period);
    results.innerHTML = `<div class="wb-period-readout${announce ? ' is-updated' : ''}">
      <div class="wb-period-result-head"><h3 id="home-date-heading">${W.e(label)}</h3><span class="wb-small wb-muted">${count} 件案卷</span></div>
      ${count ? '<ul class="wb-period-records">' + period.records.map(record => `
        <li><a class="wb-period-record" href="${W.e(W.caseHref(record.id, W.currentLink(), '#deadlines'))}">
          <strong class="wb-wrap">${W.e(record.brandName || '未命名商标')}</strong><span class="wb-mono" translate="no">${W.e(record.id)}</span>
          ${range === 30 ? `<time datetime="${W.e(record.officialDeadline)}">${shortDate.format(utc(record.officialDeadline))}</time>` : ''}
          ${W.icon('chevron', 15)}
        </a></li>`).join('') + '</ul>' : `<p class="wb-period-empty">${range === 30 ? '这组日期内' : '当日'}无官方绝限到期</p>`}
      </div>`;
    if (announce) status.textContent = label + '，' + count + ' 件案卷';
  }

  function renderWindow(announce = false) {
    periods = buildPeriods(range);
    const offset = DataService.daysBetween(today, selectedDay);
    const period = periods.find(entry => offset >= entry.from && offset <= entry.to) || periods[0];
    const count = periods.filter(entry => entry.from > 0).reduce((sum, entry) => sum + entry.records.length, 0);
    dateRail.dataset.range = range;
    dateRail.setAttribute('aria-label', range === 7 ? '按日查看官方绝限' : '按五天分组查看官方绝限');
    dateRail.innerHTML = periods.map(periodButton).join('');
    upcomingLink.href = caseListHref(range === 7 ? 'upcoming' : 'upcoming30');
    upcomingLink.textContent = '未来 ' + range + ' 天 · ' + count + ' 件';
    main.querySelectorAll('[data-window]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.window) === range)));
    showPeriod(period, announce);
  }

  const types = new Map();
  cases.forEach(record => {
    const label = record.businessType || '未分类';
    types.set(label, (types.get(label) || 0) + 1);
  });
  const distribution = [...types].sort((a, b) => b[1] - a[1] || W.compareText(a[0], b[0]));
  const colors = ['#254884', '#4673b1', '#7195bb', '#4d827f', '#8a674c', '#796d9c', '#9a6069', '#657992'];
  const topTypes = distribution.length > colors.length ? distribution.slice(0, colors.length - 1).concat([
    ['其他类型', distribution.slice(colors.length - 1).reduce((sum, entry) => sum + entry[1], 0)]
  ]) : distribution;
  let position = 0;
  const stops = topTypes.map(([, count], index) => {
    const from = position;
    position += count / (cases.length || 1) * 100;
    return colors[index] + ' ' + from + '% ' + position + '%';
  });
  document.getElementById('home-types-chart').innerHTML = topTypes.length ? `
    <div class="wb-donut-layout">
      <div class="wb-donut" aria-hidden="true" style="--chart-stops:${stops.join(',')}">
        <div><strong class="wb-num">${cases.length}</strong><span>件案卷</span></div>
      </div>
      <ul class="wb-chart-legend" aria-label="案件类型构成">
        ${topTypes.map(([label, count], index) => {
          const content = `<span class="wb-chart-key" aria-hidden="true" style="--key-color:${colors[index]}"></span>
            <span class="wb-wrap">${W.e(label)}</span><strong class="wb-num">${count}</strong>`;
          return '<li>' + (label === '未分类' || label === '其他类型' ? '<span>' + content + '</span>'
            : `<a href="${W.e(W.url(W.pageHref('cases.html'), { type: label }))}">${content}</a>`) + '</li>';
        }).join('')}
      </ul>
    </div>` : '<p class="wb-muted">暂无案件类型统计。</p>';
  main.addEventListener('click', event => {
    const windowControl = event.target.closest('[data-window]');
    const dayControl = event.target.closest('[data-period]');
    if (windowControl && Number(windowControl.dataset.window) !== range) {
      range = Number(windowControl.dataset.window);
      renderWindow(true);
    }
    if (dayControl && dayControl.dataset.period !== selectedDay) {
      showPeriod(periods.find(period => period.id === dayControl.dataset.period), true);
    }
  });
  renderWindow();
});
