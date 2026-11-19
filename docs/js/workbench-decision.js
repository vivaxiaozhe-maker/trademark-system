document.addEventListener('DOMContentLoaded', () => {
  const W = CaseWorkspace;
  const F = FinanceWorkspace;
  const D = DataService;
  const main = document.getElementById('main');
  const params = W.query();
  const views = { global: '商标全局视图', risk: '品牌风险地图', fee: '费用管理', intel: '案件智能分析' };
  const view = Object.hasOwn(views, params.get('view')) ? params.get('view') : 'global';
  const today = D.getToday();
  const cases = W.allCases();
  const reportType = { global: 'overview', risk: 'risk', fee: 'fee', intel: 'overview' }[view];
  const counts = values => {
    const grouped = new Map();
    for (const key of values) grouped.set(key, (grouped.get(key) || 0) + 1);
    return [...grouped].sort((a,b) => b[1] - a[1] || W.compareText(a[0],b[0]));
  };
  const href = key => W.url('decision.html', { view: key === 'global' ? '' : key });
  const stats = D.getFinanceOverview();
  const next = cases.filter(record => D.isDeadlineWithin(record.officialDeadline, today, 7));
  const chart = (id, title, body, caption) => `<section class="wb-panel wb-fin-pair" aria-labelledby="${id}">
    <div class="wb-panel-head"><h2 id="${id}">${title}</h2></div><div class="wb-fin-panel-body">${body}</div>
    <div class="wb-fin-caption">${caption}</div></section>`;

  W.renderShell('decision.html', view === 'global' ? [['管理决策中心']] : [['管理决策中心', 'decision.html'], [views[view]]]);
  main.innerHTML = `<div class="wb-head"><div><h1>管理决策中心</h1></div>
    <div class="wb-actions"><button class="wb-btn wb-btn-primary" id="decision-report" type="button">${W.icon('file')} 生成报告 ${W.icon('arrow',15)}</button></div></div>
    ${F.stage(view, Object.entries(views).map(([key,label]) => [key,label,href(key)]), '决策分析视图')}
    <div class="wb-status" id="decision-notice" role="status"></div><div id="decision-content"></div>`;
  const target = main.querySelector('#decision-content');
  const risk = { high: ['高风险','danger'], medium: ['中风险','warning'], low: ['低风险','positive'] };
  const pendingAlerts = D.getMonitorResults().filter(record => record.status === 'unhandled' && !D.getMonitorTodo(record.id));
  const bars = data => data.length ? F.rank(data) : '<p class="wb-muted">暂无记录</p>';

  function global() {
    const regions = counts(cases.map(record => record.country || '未登记'));
    const businesses = counts(cases.map(record => record.businessType || '未分类'));
    target.innerHTML = `${F.metrics([
      ['案卷总量', cases.length + ' 件', '共享案卷数据', 'search-case.html'],
      ['登记品牌', D.getBrands().length + ' 个', '品牌资产清单', 'brand.html'],
      ['覆盖法域', regions.filter(([name]) => name !== '未登记').length + ' 个', '按案卷登记法域'],
      ['未来 7 日官方绝限', next.length + ' 件', '由明日起计算', 'cases.html?deadline=upcoming']
    ])}<div class="wb-fin-grid">
      ${chart('dc-region-title','法域分布',bars(regions),'按案卷登记法域统计。')}
      ${chart('dc-type-title','案件业务分布',bars(businesses),'按案卷业务类型统计。')}</div>`;
  }
  function risks() {
    const alerts = D.getMonitorResults().sort((a,b) => W.compareText(b.monitorDate,a.monitorDate));
    target.innerHTML = `${F.metrics([
      ['监测预警', alerts.length + ' 条', '', W.url('monitor.html')],
      ['待复核', pendingAlerts.length + ' 条', '', W.url('monitor.html', { status: 'pending' })],
      ['其中高风险', pendingAlerts.filter(row => row.riskLevel === 'high').length + ' 条', '', W.url('monitor.html', { status: 'pending', risk: 'high' })],
      ['已转办', alerts.filter(row => D.getMonitorTodo(row.id)).length + ' 条', '', W.url('monitor.html', { status: 'linked' })]
    ])}<section class="wb-panel" aria-labelledby="dc-risk-title">
      <div class="wb-panel-head"><h2 id="dc-risk-title">监测预警清单</h2><a class="wb-btn wb-btn-small" href="${W.e(W.url('monitor.html'))}">进入监测中心</a></div>
      ${alerts.length ? alerts.map(row => `<div class="wb-fin-ledger-row"><div><a class="wb-data-link wb-wrap" href="${W.e(W.url('monitor.html',{alert:row.id}))}">${W.e(row.matchedName)}</a>
        <p class="wb-muted wb-small">${W.e(row.keyword)} · ${W.e(row.monitorDate || '未登记日期')}</p></div>${F.chip(row.riskLevel,risk)}${W.icon('chevron',14)}</div>`).join('')
        : W.empty('暂无监测预警','可到监测中心查看规则。')}</section>`;
  }
  function fees() {
    const series = DecisionCharts.monthlySeries(stats.monthData);
    const quarterRows = stats.quarterData.map(row =>
      [row.label, F.money(row.budget), F.money(row.amount), DecisionCharts.deviation(row)]);
    const monthRows = series.map(row =>
      [row.month + ' 月', row.forecast ? '预测' : '已支付', F.money(row.amount)]);
    const grid = (caption, headings, rows) => `<table class="wb-table"><caption>${caption}</caption><thead><tr>${headings.map(v => `<th scope="col">${v}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(v => `<td class="wb-num">${W.e(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    target.innerHTML = `${F.metrics([
      ['本年已支付', F.money(stats.totalSpent), stats.year + ' 年 · 人民币'],
      ['本年预算', F.money(stats.annualBudget), '年度演示预算'],
      ['待审批申请', stats.pendingCount + ' 件', F.totals(stats.pendingTotals), 'fees.html?tab=approval'],
      ['剩余预算', F.money(stats.remaining), '年度预算减已支付']
    ])}<div class="wb-fin-grid wb-dc-pair">
      ${chart('dc-budget-title','预算执行偏差',`<div class="wb-plot-label"><span>低于预算</span><span>高于预算</span></div><div class="wb-dc-budget-shell">${DecisionCharts.budget(stats.quarterData)}</div>`,
        '中线为 0%。偏差按（已支付 − 同期预算）÷ 同期预算计算，本季度计至当前月。')}
      ${chart('dc-trend-title','费用趋势预测',`<div class="wb-plot-label"><span>累计支出（元）</span><span>${series.at(-1).forecast ? '年末预测' : '年末累计'} <strong>${W.e(F.money(series.at(-1).amount))}</strong></span></div><div class="wb-dc-trend" id="dc-trend"></div>`,
        `<div class="wb-dc-legend"><span>累计已支付</span>${stats.monthData.length < 12 ? '<span>按本年月均支出外推</span>' : ''}</div>`)}
      </div><details class="wb-panel wb-chart-data"><summary>查看季度预算与逐月费用明细</summary><div class="wb-fin-grid">
        <div class="wb-table-wrap">${grid('季度预算执行',['季度','同期预算','已支付','偏差'],quarterRows)}</div>
        <div class="wb-table-wrap">${grid('累计支出 · 人民币',['月份','口径','累计金额'],monthRows)}</div>
      </div></details><p class="wb-subtitle wb-small">图表仅统计人民币账单，优先使用支付日期。缺失支付日期时使用记账日期。</p>`;
    DecisionCharts.trend(target.querySelector('#dc-trend'), series);
  }
  function intel() {
    const deadline = cases.filter(record => D.daysBetween(today, record.officialDeadline) <= 0)
      .sort((a,b) => W.dateSort(a,b,'officialDeadline'));
    target.innerHTML = `<div class="wb-fin-grid">
      ${chart('dc-states-title','案件当前状态',bars(counts(cases.map(record => record.status || '未登记'))),'按案卷当前状态统计。')}
      ${chart('dc-urgent-title','今日及已逾期案件', deadline.length ? deadline.map(record =>
        `<div class="wb-fin-ledger-row"><div><a class="wb-data-link" href="${W.e(W.caseHref(record.id,W.currentLink(),'#deadlines'))}">${W.e(record.brandName)}</a>
        <p class="wb-small wb-muted">${W.e(record.id)}</p></div><div>${W.dateMarkup(record.officialDeadline)}</div>${W.icon('chevron',14)}</div>`).join('')
        : '<p class="wb-muted">暂无今日到期或逾期案件。</p>', '日期以案卷官方绝限为准。')}</div>`;
  }

  ({ global, risk: risks, fee: fees, intel })[view]();
  const generate = main.querySelector('#decision-report');
  window.addEventListener('pageshow', () => { generate.disabled = false; });
  generate.addEventListener('click', event => {
    const control = event.currentTarget;
    control.disabled = true;
    const report = D.createManagementReport({ type: reportType, period: view === 'fee' ? 'year' : 'all' });
    if (report) location.assign(W.url('report.html', { id: report.id, back: W.currentLink(), generated: '1' }));
    else {
      control.disabled = false;
      W.notify(main.querySelector('#decision-notice'), '报告未生成，请检查浏览器存储后重试。', 'error');
    }
  });
});
