const FinanceWorkspace = (() => {
  const W = CaseWorkspace;
  const formats = new Map();
  const count = new Intl.NumberFormat('zh-CN');
  const time = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai', dateStyle: 'medium', timeStyle: 'short'
  });
  const appStates = { pending: ['待审批', 'warning'], approved: ['已通过', 'positive'], rejected: ['已驳回', 'danger'] };
  const billStates = { pending: ['待支付', 'warning'], paid: ['已支付', 'positive'], rejected: ['已驳回', 'danger'] };

  function money(amount, currency = 'CNY') {
    const code = /^[A-Z]{3}$/.test(currency) ? currency : 'CNY';
    const fractionDigits = Number.isInteger(Number(amount)) || code === 'JPY' ? 0 : 2;
    const key = code + fractionDigits;
    if (!formats.has(key)) formats.set(key, new Intl.NumberFormat('zh-CN', {
      style: 'currency', currency: code, currencyDisplay: code === 'CNY' ? 'narrowSymbol' : 'code',
      minimumFractionDigits: fractionDigits
    }));
    return formats.get(key).format(amount ?? 0);
  }

  const totals = records => records.length ? records.map(row => money(row.amount, row.currency)).join(' · ') : '—';
  const dateTime = value => Number.isFinite(Date.parse(value)) ? time.format(new Date(value)) : '未登记';
  const chip = (key, states) => W.chip(...(states[key] || ['未登记', '']));
  const stage = (active, values, title) => `<nav class="wb-fin-nav" aria-label="${title}">
    ${values.map(([key, label, href]) => `<a href="${W.e(href)}"${active === key ? ' aria-current="page"' : ''}>${W.e(label)}</a>`).join('')}</nav>`;

  function metrics(items) {
    return `<dl class="wb-panel wb-fin-metrics">${items.map(([label, value, hint, href]) => {
      const caption = hint ? `<span class="wb-small wb-muted">${W.e(hint)}</span>` : '';
      return `<div><dt>${W.e(label)}</dt><dd class="wb-num">${href ? `<a href="${W.e(href)}">${W.e(value)} ${W.icon('arrow', 14)}</a>` : W.e(value)}</dd>${caption}</div>`;
    }).join('')}</dl>`;
  }

  function rank(items, format = value => count.format(value)) {
    const max = Math.max(1, ...items.map(([, value]) => value));
    return `<ul class="wb-fin-ranks">${items.map(([key, amount]) => `<li>
      <span class="wb-wrap">${W.e(key)}</span><span class="wb-bar-track" aria-hidden="true"><i class="wb-bar-fill" style="--value:${Math.max(0, amount / max)}"></i></span>
      <strong class="wb-num">${W.e(format(amount))}</strong></li>`).join('')}</ul>`;
  }

  return { count, money, totals, dateTime, appStates, billStates, chip, stage, metrics, rank };
})();
