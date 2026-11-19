document.addEventListener('DOMContentLoaded', () => {
  const W = CaseWorkspace;
  const main = document.getElementById('main');
  const params = W.query();
  const clearLabel = '清除筛选';
  const origin = W.returnLink(params.get('from'), '');
  const data = W.allCases();
  const brands = DataService.getBrands();
  const firms = DataService.getLawFirms();
  const filters = {
    q: params.get('q') || '', brand: params.get('brand') || '', country: params.get('country') || '',
    status: params.get('status') || '', type: params.get('type') || '', firm: params.get('firm') || ''
  };
  const pageSize = 12;
  let page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);
  const controls = [
    ['brand', '品牌', brands.map(brand => [brand.id, brand.name])],
    ['country', '法域', W.uniqueValues(data, 'country').map(item => [item, item])],
    ['type', '业务类型', W.uniqueValues(data, 'businessType').map(item => [item, item])],
    ['status', '状态', W.uniqueValues(data, 'status').map(item => [item, item])],
    ['firm', '代理律所', firms.map(firm => [firm.id, firm.name])]
  ];
  for (const [key, , options] of controls) if (!options.some(([value]) => value === filters[key])) filters[key] = '';

  W.renderShell('search-case.html', [...(origin ? [[W.pageLabel(origin), origin]] : []), ['检索案卷']]);
  main.innerHTML = `
    <div class="wb-head">
      <div><h1>检索案卷</h1></div>
      <div class="wb-actions">${origin ? `<a class="wb-btn" href="${W.e(origin)}">返回${W.e(W.pageLabel(origin))}</a>` : ''}
        <button class="wb-btn" id="search-export" type="button">${W.icon('download')} 导出结果</button></div>
    </div>
    <section class="wb-panel" aria-labelledby="search-result-title">
      <div class="wb-filter wb-asset-tools wb-search-tools" role="search" aria-label="案卷筛选">
        <label class="wb-search">${W.icon('search')}<span class="wb-sr">搜索案号、商标、申请人或官方编号</span>
          <input id="archive-query" name="q" type="search" placeholder="搜索案号、商标、申请人或官方编号…" maxlength="100" autocomplete="off" spellcheck="false"></label>
        <button class="wb-btn wb-archive-toggle" type="button" aria-expanded="false" aria-controls="archive-fields">筛选条件</button>
        <div class="wb-archive-fields" id="archive-fields">${controls.map(([key, label, options]) => `<label class="wb-field">${label}<select class="wb-input" name="${key}">
          <option value="">全部${label}</option>${options.map(([value, text]) => `<option value="${W.e(value)}">${W.e(text)}</option>`).join('')}</select></label>`).join('')}</div>
        <div class="wb-active-filters wb-search-caption" id="archive-context" hidden></div>
      </div>
      <div class="wb-panel-head"><h2 class="wb-result" id="search-result-title">检索结果</h2><span role="status" class="wb-muted wb-small wb-num" id="archive-count"></span></div>
      <div id="archive-results"></div>
      <div class="wb-asset-pager" id="archive-pager" hidden>
        <button class="wb-btn wb-btn-small" type="button" data-page-step="-1">上一页</button>
        <span class="wb-small wb-muted wb-num" id="archive-page" role="status"></span>
        <button class="wb-btn wb-btn-small" type="button" data-page-step="1">下一页</button>
      </div>
    </section>`;
  const input = main.querySelector('#archive-query');
  const results = main.querySelector('#archive-results');
  const context = main.querySelector('#archive-context');
  const pager = main.querySelector('#archive-pager');
  const download = main.querySelector('#search-export');
  let visible = [];

  function syncControls() {
    for (const [key] of controls) main.querySelector(`select[name="${key}"]`).value = filters[key];
    input.value = filters.q;
  }

  function row(record) {
    const href = W.caseHref(record.id, W.currentLink());
    return `<tr>
      <td><div class="wb-case-cell">${W.thumb(record)}<div class="wb-wrap">
        <a class="wb-data-link" href="${W.e(href)}">${W.e(record.brandName)}</a><span class="wb-id wb-mono" translate="no">${W.e(record.id)}</span><span class="wb-archive-meta">${W.e([record.businessType, record.country].filter(Boolean).join(' · '))}</span>
      </div></div></td>
      <td class="wb-search-extra"><strong>${W.e(record.businessType || '未登记')}</strong><span class="wb-case-legal">${W.e(record.country || '未登记')}</span></td>
      <td class="wb-search-extra">${record.applicationNumber ? `<span class="wb-case-legal">申请 <span class="wb-num">${W.e(record.applicationNumber)}</span></span>` : ''}
        ${record.registrationNumber ? `<span class="wb-case-legal">注册 <span class="wb-num">${W.e(record.registrationNumber)}</span></span>` : ''}
        ${record.applicationNumber || record.registrationNumber ? '' : '<span class="wb-muted">未登记</span>'}</td>
      <td>${W.dateMarkup(record.officialDeadline, { href: href + '#deadlines' })}</td>
      <td class="wb-search-extra">${W.caseStatus(record)}</td>
      <td><a class="wb-btn wb-btn-quiet wb-btn-small" href="${W.e(href)}" aria-label="打开案卷 ${W.e(record.id)}">打开 ${W.icon('arrow', 14)}</a></td>
    </tr>`;
  }

  function render() {
    const pool = filters.brand ? DataService.getBrandCases(filters.brand) : W.allCases();
    const scoped = filters.firm ? DataService.getLawFirmCases(filters.firm, pool) : pool;
    const tokens = W.searchText(filters.q).split(/\s+/).filter(Boolean);
    visible = scoped.filter(record => (!filters.country || record.country === filters.country) &&
      (!filters.status || record.status === filters.status) && (!filters.type || record.businessType === filters.type) &&
      tokens.every(token => [record.id, record.brandName, record.applicant, record.applicationNumber, record.registrationNumber]
        .some(value => W.searchText(value).includes(token))))
      .sort((a, b) => W.dateSort(a, b, 'officialDeadline') || W.compareText(a.id, b.id));
    const pages = Math.max(1, Math.ceil(visible.length / pageSize));
    page = Math.min(page, pages);
    W.replaceQuery({ ...filters, from: origin, page: page > 1 ? page : '' });
    context.hidden = !Object.values(filters).some(Boolean);
    const activeControls = controls.filter(([key]) => filters[key]);
    main.querySelector('.wb-archive-toggle').textContent = activeControls.length ? `筛选条件（${activeControls.length}）` : '筛选条件';
    context.innerHTML = `${activeControls.map(([key, label, options]) => {
      const [, name] = options.find(([value]) => value === filters[key]);
      return `<span>${key === 'brand' ? '关联品牌' : label} · ${W.e(name)}</span>`;
    }).join('')}
      <button class="wb-btn wb-btn-quiet wb-btn-small" type="button" data-clear>${clearLabel}</button>`;
    main.querySelector('#archive-count').textContent = visible.length + ' 件案卷';
    download.disabled = !visible.length;
    pager.hidden = pages <= 1;
    main.querySelector('#archive-page').textContent = `第 ${page} / ${pages} 页`;
    pager.querySelector('[data-page-step="-1"]').disabled = page <= 1;
    pager.querySelector('[data-page-step="1"]').disabled = page >= pages;
    results.innerHTML = visible.length ? `<div class="wb-table-wrap"><table class="wb-table wb-search-table">
      <caption class="wb-sr">匹配的商标案卷</caption><thead><tr>
      <th scope="col">商标／案号</th><th scope="col" class="wb-search-extra">业务／法域</th>
      <th scope="col" class="wb-search-extra">官方编号</th><th scope="col">官方绝限</th>
      <th scope="col" class="wb-search-extra">状态</th><th scope="col"><span class="wb-sr">操作</span></th></tr></thead>
      <tbody>${visible.slice((page - 1) * pageSize, page * pageSize).map(row).join('')}</tbody></table></div>`
      : W.empty('未找到匹配的案卷', '可尝试其他关键词，或放宽品牌、法域和状态筛选。',
        '<button class="wb-btn" type="button" data-clear>清除筛选</button>');
  }

  input.addEventListener('input', () => { filters.q = input.value.trim(); page = 1; render(); });
  main.addEventListener('change', event => {
    const control = event.target;
    if (control.matches('select') && Object.hasOwn(filters, control.name)) {
      filters[control.name] = control.value;
      page = 1;
      render();
    }
  });
  main.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.matches('.wb-archive-toggle')) {
      button.setAttribute('aria-expanded', String(button.getAttribute('aria-expanded') !== 'true'));
    }
    if (button.hasAttribute('data-clear')) {
      Object.keys(filters).forEach(key => { filters[key] = ''; });
      page = 1;
      syncControls();
      render();
      input.focus();
    }
    if (button.dataset.pageStep) { page += Number(button.dataset.pageStep); render(); }
    if (button === download) W.downloadCsv('案卷检索结果.csv',
      ['案号', '商标', '申请人', '法域', '业务类型', '状态', '申请号', '注册号', '官方绝限'],
      visible.map(record => [record.id, record.brandName, record.applicant, record.country, record.businessType, record.status,
        record.applicationNumber, record.registrationNumber, record.officialDeadline]));
  });
  window.addEventListener('pageshow', event => { if (event.persisted) render(); });
  syncControls();
  render();
});
