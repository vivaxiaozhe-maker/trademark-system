document.addEventListener('DOMContentLoaded', () => {
  const W = CaseWorkspace;
  const F = FinanceWorkspace;
  const D = DataService;
  const main = document.getElementById('main');
  const params = W.query();
  const back = W.returnLink(params.get('back'), 'decision.html');
  const periods = { all: '全部演示记录', year: '本年截至今日', month: '本月至今', custom: '自定义日期' };
  const requested = params.get('id');
  let report = requested ? D.getManagementReport(requested) : null;
  const riskLabels = { high: '高风险', medium: '中风险', low: '低风险' };
  const descriptions = {
    overview: '案卷规模、登记法域与官方绝限。',
    risk: '近似商标监测预警和风险等级。',
    fee: '共享账单、待审批金额与费用申请明细。',
    firm: '代理案卷数量、响应和既有评级。'
  };

  W.renderShell('report.html', [['管理决策中心', back], ['报告中心']]);
  main.innerHTML = `
    <div class="wb-head"><div><h1>报告中心</h1></div>
      <div class="wb-actions"><a class="wb-btn" href="${W.e(back)}">返回管理决策中心</a></div></div>
    <div class="wb-status" id="report-notice" role="status"></div>
    <div class="wb-report-grid">
      <form class="wb-panel" id="report-config" tabindex="-1" autocomplete="off" aria-labelledby="report-config-title">
        <div class="wb-panel-head"><h2 id="report-config-title">报告设置</h2></div>
        <div class="wb-report-config">
          <label class="wb-field">报告类型<select class="wb-input" name="type">${Object.entries(D.REPORT_TYPES)
            .map(([key,label]) => `<option value="${key}">${label}</option>`).join('')}</select></label>
          <p class="wb-muted wb-small" id="report-type-description"></p>
          <label class="wb-field">报告周期<select class="wb-input" name="period">${Object.entries(periods)
            .map(([key,label]) => `<option value="${key}">${label}</option>`).join('')}</select></label>
          <div class="wb-fields" id="report-dates" hidden>
            <label class="wb-field wb-field-wide">开始日期<input class="wb-input" name="from" type="date"></label>
            <label class="wb-field wb-field-wide">结束日期<input class="wb-input" name="to" type="date"></label>
          </div>
          <div class="wb-status" id="report-error" role="alert"></div>
          <button class="wb-btn wb-btn-primary" type="submit">${W.icon('file',15)} 生成报告</button>
        </div>
      </form>
      <section class="wb-panel wb-report-preview" aria-labelledby="report-preview-title">
        <div class="wb-panel-head"><h2 id="report-preview-title">报告预览</h2><div class="wb-actions"><a class="wb-btn wb-btn-small" href="#report-config" id="report-adjust" hidden>调整设置</a><button type="button" class="wb-btn wb-btn-small" id="report-print" disabled>${W.icon('download',14)} 打印 / 保存 PDF</button></div></div>
        <div id="report-preview"></div>
      </section>
    </div>`;

  const form = main.querySelector('#report-config');
  const dates = form.querySelector('#report-dates');
  const preview = main.querySelector('#report-preview');
  const notice = main.querySelector('#report-notice');
  const error = main.querySelector('#report-error');
  const print = main.querySelector('#report-print');
  const start = form.elements.from;
  const end = form.elements.to;
  const initialType = params.get('type');
  form.elements.type.value = report?.type || (Object.hasOwn(D.REPORT_TYPES, initialType) ? initialType : 'overview');
  form.elements.period.value = report?.period || 'all';
  if (report?.period === 'custom') {
    start.value = report.from;
    end.value = report.to;
  }

  const table = (headings, rows) => rows.length
    ? `<div class="wb-table-wrap"><table class="wb-table wb-fin-table"><thead><tr>${headings.map(line =>
      `<th scope="col">${W.e(line)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(value =>
      `<td class="wb-wrap">${W.e(value ?? '—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
    : '<p class="wb-small wb-muted">该统计周期内没有记录。</p>';
  const order = (rows, key) => [...rows].sort((a,b) => W.compareText(b[key],a[key]));
  const count = (value, unit) => F.count.format(value) + ' ' + unit;
  const sections = {
    overview: snapshot => ({
      metrics: [['案卷数量',count(snapshot.caseCount,'件')], ['覆盖法域',count(snapshot.jurisdictionCount,'个')], ['未来 7 日官方绝限',count(snapshot.upcomingCount,'件')]],
      title: '案卷清单',
      detail: table(['案号','商标','法域','状态','官方绝限'],snapshot.cases.map(row =>
        [row.id,row.brandName,row.country,row.status,row.officialDeadline || '—'])),
      note: '周期按案卷创建日期筛选，缺失时使用申请日期。未来 7 日从生成次日开始计算。'
    }),
    risk: snapshot => ({
      metrics: [['监测预警',count(snapshot.alerts.length,'条')],['高风险',count(snapshot.alerts.filter(row=>row.riskLevel==='high').length,'条')],
        ['监测商标',count(new Set(snapshot.alerts.map(row=>row.keyword)).size,'个')]],
      title: '监测预警清单',
      detail: table(['近似商标','监测商标','风险','发现日期'],order(snapshot.alerts,'monitorDate').map(row =>
        [row.matchedName,row.keyword,riskLabels[row.riskLevel] || '未评级',row.monitorDate])),
      note: '周期按发现日期筛选。风险等级来自演示监测记录。'
    }),
    fee: snapshot => ({
      metrics: [['已支付',F.totals(snapshot.paidTotals)],['待审批金额',F.totals(snapshot.pendingTotals)],
        ['费用申请',count(snapshot.applications.length,'件')]],
      title: '费用申请清单',
      detail: table(['申请单号','事项','状态','金额'],order(snapshot.applications,'createdAt').map(row =>
        [row.id,row.title,F.appStates[row.status]?.[0],F.money(row.amount,row.currency)])),
      note: '共 ' + snapshot.billCount + ' 笔账单。费用申请按提交日统计，账单优先按支付日期，缺失时用记账日期。各币种分别列示。'
    }),
    firm: snapshot => ({
      metrics: [['纳入律所',count(snapshot.firms.length,'家')], ['关联案卷',count(snapshot.firms.reduce((a,b)=>a+b.cases,0),'件')],
        ['有评分律所',count(snapshot.firms.filter(row=>typeof row.rating==='number').length,'家')]],
      title: '律所合作清单',
      detail: table(['律所','关联案卷','响应时长','既有评级'],order(snapshot.firms,'cases').map(row => [row.name,row.cases,row.responseTime,row.rating])),
      note: '案卷数量按所选周期筛选。响应与评分采用演示律所档案中的既有值。'
    })
  };

  function syncForm() {
    const custom = form.elements.period.value === 'custom';
    dates.hidden = !custom;
    start.required = end.required = custom;
    form.querySelector('#report-type-description').textContent = descriptions[form.elements.type.value];
  }

  function render() {
    print.disabled = !report;
    if (!report) {
      preview.innerHTML = requested
        ? W.empty('未找到这份报告', '可调整设置并生成新的本机报告。')
        : W.empty('等待生成报告', '在报告设置中选择类型和日期范围。');
      return;
    }
    const pane = preview.closest('section');
    if (form.previousElementSibling !== pane) form.before(pane);
    pane.parentElement.classList.add('has-report');
    main.querySelector('#report-adjust').hidden = false;
    const section = sections[report.type](report.snapshot);
    const range = report.from ? report.from + ' 至 ' + report.to : periods.all;
    preview.innerHTML = `<article class="wb-report-sheet">
      <header><h2 id="generated-report-title" tabindex="-1">${W.e(report.title)}</h2>
        <dl class="wb-report-meta"><div><dt>统计周期</dt><dd>${W.e(range)}</dd></div><div><dt>生成时间</dt><dd>${W.e(F.dateTime(report.generatedAt))}</dd></div><div><dt>报告编号</dt><dd class="wb-mono">${W.e(report.id)}</dd></div></dl></header>
      ${F.metrics(section.metrics)}
      <h3>${section.title}</h3>${section.detail}
      <p class="wb-fin-caption">${W.e(section.note)}</p>
    </article>`;
  }

  syncForm();
  render();
  if (report && params.get('generated') === '1') {
    W.notify(notice,'报告已生成，当前显示报告预览。','success');
    W.replaceQuery({ id: report.id, back });
  }
  form.addEventListener('change', () => {
    syncForm();
    W.notify(error,'');
    if (report) W.notify(notice,'设置已调整。生成报告后更新预览。');
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const options = Object.fromEntries(new FormData(form));
    if (options.period === 'custom' && options.from > options.to) {
      W.notify(error,'结束日期不能早于开始日期。','error');
      end.focus();
      return;
    }
    const saved = D.createManagementReport(options);
    if (!saved) {
      W.notify(error,'报告未生成。请检查日期范围或浏览器存储后重试。','error');
      return;
    }
    report = saved;
    W.notify(error,'');
    W.replaceQuery({ id: report.id, back });
    render();
    W.notify(notice,'报告已生成，当前显示报告预览。','success');
    preview.querySelector('h2').focus();
  });
  print.addEventListener('click', () => { if (report) window.print(); });
});
