const DecisionCharts = (() => {
  const F = FinanceWorkspace;
  const C = CaseWorkspace;
  const format = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 1 });
  const percent = row => row.budget > 0 ? (row.amount / row.budget - 1) * 100 : null;
  const deviation = row => {
    const value = percent(row);
    return value === null ? '无预算' : (value > 0 ? '+' : '') + format.format(value) + '%';
  };

  function budget(periods) {
    const extent = Math.max(100, ...periods.map(row => Math.abs(percent(row) || 0)));
    return `<ul class="wb-dc-budget">${periods.map(row => {
      const value = percent(row) || 0;
      const span = Math.abs(value) / extent * 50;
      return `<li><span>${C.e(row.label)}</span><span class="wb-dc-budget-track" aria-hidden="true" data-over="${value > 0}">
        <i style="--start:${value < 0 ? 50 - span : 50}%;--span:${span}%"></i></span><strong class="wb-num">${deviation(row)}</strong></li>`;
    }).join('')}</ul>`;
  }

  function monthlySeries(months) {
    const series = months.map(row => ({ month: row.month, amount: row.cumulative, forecast: false }));
    const average = (series.at(-1)?.amount || 0) / Math.max(months.length, 1);
    for (let month = months.length + 1; month <= 12; month++) {
      series.push({ month, amount: Math.round(average * month), forecast: true });
    }
    return series;
  }

  function trend(target, series) {
    const actualCount = series.filter(row => !row.forecast).length;
    const max = Math.max(1, ...series.map(row => row.amount));
    const unit = 10 ** (Math.floor(Math.log10(max)) - 1);
    const ceiling = Math.ceil(max / 4 / unit) * 4 * unit;
    const steps = Array.from({ length: 5 }, (_, i) => i * ceiling / 4);
    const label = row => `${row.month}月 ${F.money(row.amount)}${row.forecast ? '（预测）' : ''}`;
    const measure = document.createElement('canvas').getContext('2d');
    measure.font = '12px system-ui, sans-serif';
    const measureLabel = text => Math.ceil(measure.measureText(text).width);
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.floor(entry.contentRect.width);
      const height = Math.floor(entry.contentRect.height);
      if (width < 100 || height < 80) return;
      const left = Math.max(...steps.map(value => measureLabel(format.format(value)))) + 12;
      const right = width - measureLabel('12月') / 2 - 5;
      const bottom = height - 24;
      const x = i => left + i * (right - left) / (series.length - 1);
      const y = value => bottom - value / ceiling * (bottom - 10);
      const coords = (start, end) => series.slice(start, end).map((row, i) => x(start + i) + ',' + y(row.amount)).join(' ');
      const tickGap = Math.ceil((measureLabel('12月') + 12) / (x(1) - left));
      const ticks = series.map((_, i) => i).filter(i => i === series.length - 1 ||
        (i % tickGap === 0 && series.length - 1 - i >= tickGap));
      target.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${C.e('累计费用趋势。' + series.map(label).join('，'))}">
        ${steps.map(value => `<line x1="${left}" x2="${right}" y1="${y(value)}" y2="${y(value)}" stroke="#dbe2ec" stroke-dasharray="3 4"/>
          <text x="${left - 7}" y="${y(value) + 4}" text-anchor="end">${format.format(value)}</text>`).join('')}
        ${actualCount ? `<polygon points="${left},${bottom} ${coords(0,actualCount)} ${x(actualCount - 1)},${bottom}" fill="#e6eef5" fill-opacity=".75"/>
        <polyline points="${coords(0,actualCount)}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>` : ''}
        ${actualCount < series.length ? `<polyline points="${coords(Math.max(0,actualCount - 1))}" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="5 5"/>` : ''}
        ${series.map((row,i) => `<circle cx="${x(i)}" cy="${y(row.amount)}" r="${i === actualCount - 1 ? 4 : 2.7}" fill="white" stroke="currentColor" stroke-width="1.6"><title>${C.e(label(row))}</title></circle>`).join('')}
        ${ticks.map(i => `<text x="${x(i)}" y="${height - 5}" text-anchor="middle">${series[i].month}月</text>`).join('')}
      </svg>`;
    });
    observer.observe(target);
  }

  return { budget, deviation, monthlySeries, trend };
})();
