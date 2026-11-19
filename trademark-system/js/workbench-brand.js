document.addEventListener('DOMContentLoaded', () => {
  const W = CaseWorkspace;
  const main = document.getElementById('main');
  const params = W.query();
  const scopes = { internal: '内部品牌', external: '外部合作' };
  const risks = { high: ['高风险', 'danger'], medium: ['中风险', 'warning'], low: ['低风险', 'positive'] };
  const classStates = { registered: ['已注册', 'positive'], pending: ['审理中', 'info'], expired: ['已失效', 'danger'] };

  const requestedScope = params.get('tab') || DataService.getBrandById(params.get('brand'))?.type;
  let scope = requestedScope === 'external' ? 'external' : 'internal';
  let query = params.get('q') || '';
  let risk = Object.hasOwn(risks, params.get('risk')) ? params.get('risk') : '';
  let selected = params.get('brand') || '';

  W.renderShell('brand.html', [['品牌管理']]);
  main.innerHTML = `
    <div class="wb-head">
      <div><h1>品牌管理</h1></div>
      <div class="wb-actions">
        <button class="wb-btn wb-btn-primary" id="brand-create" type="button">${W.icon('plus')} 新增品牌</button></div>
    </div>
    <div id="brand-nav"></div>
    <div class="wb-status" id="brand-notice" role="status"></div>
    <div class="wb-asset-grid">
      <section class="wb-panel" aria-labelledby="brands-title">
        <div class="wb-filter wb-asset-tools">
          <div class="wb-steps" role="group" aria-label="品牌归属">
            ${Object.entries(scopes).map(([id, name]) => `<button type="button" data-scope="${id}">${name}</button>`).join('')}
          </div>
          <label class="wb-search">${W.icon('search')}<span class="wb-sr">搜索品牌名称</span>
            <input id="brand-query" name="q" type="search" placeholder="搜索品牌名称…" maxlength="100" autocomplete="off"></label>
          <label class="wb-inline-select"><span class="wb-sr">风险等级</span>
            <select id="brand-risk" name="risk" class="wb-input"><option value="">全部风险</option>
            ${Object.entries(risks).map(([key, [label]]) => `<option value="${key}">${label}</option>`).join('')}</select></label>
        </div>
        <div class="wb-panel-head"><h2 class="wb-result" id="brands-title">品牌资产清单</h2><span class="wb-muted wb-small wb-num" id="brand-count" role="status"></span></div>
        <div id="brand-results"></div>
      </section>
      <section class="wb-panel wb-asset-detail" id="brand-detail" aria-labelledby="brand-detail-title" hidden></section>
    </div>
    <dialog class="wb-dialog" id="brand-dialog" aria-labelledby="new-brand-title">
      <div class="wb-panel-head"><h2 id="new-brand-title">新增品牌</h2><button class="wb-btn wb-btn-quiet" type="button" data-close-brand aria-label="关闭">${W.icon('close')}</button></div>
      <form class="wb-panel-body" id="brand-form" autocomplete="off">
        <div class="wb-fields">
          <label class="wb-field">品牌名称<input class="wb-input" name="name" required maxlength="80" placeholder="例如，澄川…"></label>
          <label class="wb-field">英文名称<input class="wb-input" name="englishName" maxlength="80"></label>
          <label class="wb-field">归属<select class="wb-input" name="type"><option value="internal">内部品牌</option><option value="external">外部合作</option></select></label>
          <label class="wb-field">尼斯类别<input class="wb-input" name="classes" maxlength="120" placeholder="例如，9、35、42…"></label>
          <label class="wb-field wb-field-wide">品牌说明<textarea class="wb-input" name="description" maxlength="300" rows="3"></textarea></label>
        </div>
        <div class="wb-status" id="brand-error" role="alert"></div>
        <div class="wb-form-actions"><button class="wb-btn" type="button" data-close-brand>取消</button><button class="wb-btn wb-btn-primary" type="submit">创建品牌</button></div>
      </form>
    </dialog>`;
  const input = main.querySelector('#brand-query');
  const filter = main.querySelector('#brand-risk');
  const list = main.querySelector('#brand-results');
  const panel = main.querySelector('#brand-detail');
  const dialog = main.querySelector('#brand-dialog');
  const form = main.querySelector('#brand-form');
  input.value = query;
  filter.value = risk;

  const riskChip = id => W.chip(...(risks[id] || ['未评估', '']));
  const classEntries = brand => Object.entries(brand.classMatrix || {}).filter(([, item]) => item && item.status !== 'gap');
  const thumb = brand => W.thumb({ ...brand, brandName: brand.name });
  const countClass = (items, status) => items.filter(([, item]) => item.status === status).length;

  function render({ focus = false, keepRows = false } = {}) {
    const brands = DataService.getBrands().filter(brand => (brand.type || 'internal') === scope &&
      (!risk || brand.riskLevel === risk) && [brand.name, brand.englishName].some(value => W.searchText(value).includes(W.searchText(query))));
    const brand = brands.find(record => record.id === selected) || brands[0];
    selected = brand?.id || '';
    W.replaceQuery({ tab: scope === 'internal' ? '' : scope, q: query, risk, brand: selected });
    main.querySelector('#brand-nav').innerHTML = BrandWorkspace.navigation('brand.html', selected);
    main.querySelectorAll('[data-scope]').forEach(button => button.setAttribute('aria-pressed', button.dataset.scope === scope));
    main.querySelector('#brand-count').textContent = brands.length + ' 个';
    const cases = new Map(brands.map(record => [record.id, DataService.getBrandCases(record.id)]));
    if (!keepRows) {
      list.innerHTML = brands.length ? `<ul class="wb-asset-list">${brands.map(item => `<li><button type="button" class="wb-asset-row" data-brand="${W.e(item.id)}" aria-pressed="${item.id === selected}" aria-controls="brand-detail">
        ${thumb(item)}
        <span class="wb-asset-ident"><strong class="wb-wrap">${W.e(item.name)}</strong>
          <span class="wb-small wb-muted">${classEntries(item).length} 个保护类别</span></span>
        <span class="wb-linked-count"><b>${cases.get(item.id).length}</b> 件案卷</span>
        ${riskChip(item.riskLevel)} ${W.icon('chevron', 15)}</button></li>`).join('')}</ul>`
        : W.empty(query || risk ? '没有匹配的品牌' : scope === 'external' ? '暂无外部合作品牌' : '暂无内部品牌',
          query || risk ? '调整关键词或风险等级后重试。' : scope === 'external' ? '可新增外部合作品牌，或查看授权记录。' : '可通过新增品牌录入品牌资料。',
          scope === 'external' && !query && !risk ? '<a class="wb-btn" href="brand-auth-external.html">查看对外授权</a>' : '');
    } else {
      list.querySelectorAll('[data-brand]').forEach(button => button.setAttribute('aria-pressed', button.dataset.brand === selected));
    }
    panel.hidden = !brand;
    if (!brand) return;
    const items = classEntries(brand);
    const linked = cases.get(brand.id);
    const href = W.url('search-case.html', { brand: brand.id, from: W.currentLink() });
    panel.innerHTML = `
      <div class="wb-panel-head"><div class="wb-case-cell">${thumb(brand)}<div>
        <h2 id="brand-detail-title" class="wb-wrap" tabindex="-1">${W.e(brand.name)}</h2>
        <span class="wb-muted wb-small">${scopes[scope]}${brand.englishName ? ' · ' + W.e(brand.englishName) : ''}</span></div></div>
        ${riskChip(brand.riskLevel)}</div>
      <div class="wb-panel-body wb-asset-detail-body">
        ${brand.description ? `<p class="wb-muted wb-wrap">${W.e(brand.description)}</p>` : ''}
        <dl class="wb-key-values wb-brand-stats">
          <div><dt>已注册类别</dt><dd>${countClass(items, 'registered')} 类</dd></div>
          <div><dt>审理中类别</dt><dd>${countClass(items, 'pending')} 类</dd></div>
        </dl>
        <div class="wb-actions wb-asset-foot"><a class="wb-btn wb-btn-primary" href="${W.e(href)}">查看关联案卷（${linked.length}）${W.icon('arrow', 15)}</a></div>
        <div><h3>尼斯类别</h3>
          ${items.length ? `<ul class="wb-class-grid">${items.map(([number, info]) =>
            `<li><span>第 ${W.e(number)} 类</span>${W.chip(...(classStates[info.status] || ['拟保护', '']))}</li>`).join('')}</ul>`
          : '<p class="wb-muted wb-small">暂无类别记录</p>'}</div>

        <button type="button" class="wb-btn wb-btn-quiet wb-list-return" data-list-return>返回品牌清单</button>
      </div>`;
    panel.classList.toggle('wb-selection-change', keepRows);
    if (focus) {
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
      list.querySelector('[data-brand][aria-pressed="true"]')?.focus();
      return;
    }
    if (button.dataset.scope) { scope = button.dataset.scope; render(); }
    if (button.dataset.brand) {
      selected = button.dataset.brand;
      render({ keepRows: true, focus: event.detail === 0 || matchMedia('(max-width: 820px)').matches });
    }
    if (button.id === 'brand-create') {
      form.reset();
      form.elements.type.value = scope;
      W.notify(main.querySelector('#brand-error'), '');
      dialog.showModal();
    }
    if (button.hasAttribute('data-close-brand')) dialog.close();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const name = values.name.trim();
    const classes = [...new Set(values.classes.trim().split(/[、，,\s]+/).filter(Boolean))];
    const error = main.querySelector('#brand-error');
    if (!name || DataService.getBrands().some(brand => W.searchText(brand.name) === W.searchText(name))) {
      W.notify(error, name ? '这个品牌名称已存在，请在清单中搜索。' : '请填写品牌名称。', 'error');
      form.elements.name.focus();
      return;
    }
    if (classes.some(value => !/^([1-9]|[1-3][0-9]|4[0-5])$/.test(value))) {
      W.notify(error, '尼斯类别请填写 1 至 45 的整数，多个类别用逗号隔开。', 'error');
      form.elements.classes.focus();
      return;
    }
    const brand = DataService.createBrand({
      id: DataService.generateId('brand'), name, type: values.type, englishName: values.englishName.trim(),
      description: values.description.trim(), totalClasses: classes.length, registeredCount: 0,
      pendingCount: 0, expiredCount: 0, classMatrix: Object.fromEntries(classes.map(value => [value, { status: 'planned' }]))
    });
    if (!brand) return W.notify(error, '未能保存品牌。请检查浏览器存储后重试。', 'error');
    scope = values.type;
    selected = brand.id;
    input.value = query = '';
    filter.value = risk = '';
    dialog.close();
    render({ focus: true });
    W.notify(main.querySelector('#brand-notice'), '品牌已创建。', 'success');
  });
  window.addEventListener('pageshow', event => { if (event.persisted) render(); });
  render();
});
