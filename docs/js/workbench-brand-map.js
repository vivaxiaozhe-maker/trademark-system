document.addEventListener('DOMContentLoaded', () => {
  const W = CaseWorkspace;
  const D = DataService;
  const main = document.getElementById('main');
  const params = W.query();
  const brandData = D.getBrandMatrix();
  const statuses = {
    registered: ['已注册', 'check'], pending: ['审理中', 'calendar'], expired: ['已失效', 'close'],
    planned: ['拟保护', 'file'], gap: ['未覆盖', 'minus']
  };
  const core = [9,35,38,42];
  const all = Array.from({length:45}, (_,i)=>i+1);
  const categories = { core: ['核心类别',core], goods: ['商品 1–34',all.slice(0,34)], services: ['服务 35–45',all.slice(34)], all: ['全部 45 类',all] };
  const views = { matrix: '类别矩阵', region: '法域分布', timeline: '案件动态' };
  let view = Object.hasOwn(views,params.get('view')) ? params.get('view') : 'matrix';
  let group = Object.hasOwn(categories,params.get('group')) ? params.get('group') : 'core';
  let gap = params.get('gap') === '1';
  let query = params.get('q') || '';
  let selected = params.get('brand') || '';

  W.renderShell('brand.html', [['品牌管理','brand.html'],['品牌图谱']]);
  main.innerHTML = `<div class="wb-head"><div><h1>品牌图谱</h1></div></div>
    <div id="brand-map-nav"></div>
    <div class="wb-asset-grid wb-brand-map-grid">
      <section class="wb-panel wb-brand-panel" aria-labelledby="map-results-title">
        <div class="wb-filter wb-brand-stack">
          <div class="wb-steps" role="group" aria-label="图谱视图">${Object.entries(views).map(([id,label])=>`<button type="button" data-view="${id}">${label}</button>`).join('')}</div>
          <div class="wb-asset-tools wb-brand-toolbar">
            <label class="wb-search">${W.icon('search')}<span class="wb-sr">搜索图谱品牌</span>
              <input name="q" type="search" placeholder="搜索图谱品牌…" autocomplete="off" maxlength="100"></label>
            <label class="wb-inline-select" id="map-category">类别范围<select class="wb-input" name="group">
              ${Object.entries(categories).map(([id,[label]])=>`<option value="${id}">${label}</option>`).join('')}</select></label>
            <label class="wb-small wb-muted wb-brand-range" id="map-gap"><input type="checkbox" name="gap"> 仅看未覆盖</label>
            <label class="wb-inline-select" id="map-brand-picker" hidden>品牌<select class="wb-input" name="brand"></select></label>
          </div>
        </div>
        <div class="wb-panel-head"><h2 class="wb-result" id="map-results-title">类别矩阵</h2><span id="map-count" class="wb-small wb-muted" role="status"></span></div>
        <div id="map-results"></div>
      </section>
      <section class="wb-panel wb-asset-detail wb-brand-detail" id="map-profile" aria-labelledby="map-profile-title" hidden></section>
    </div>`;

  const input = main.querySelector('input[name=q]');
  const category = main.querySelector('select[name=group]');
  const unmet = main.querySelector('input[name=gap]');
  const picker = main.querySelector('select[name=brand]');
  const result = main.querySelector('#map-results');
  const panel = main.querySelector('#map-profile');
  const nav = main.querySelector('#brand-map-nav');
  input.value = query;
  category.value = group;
  unmet.checked = gap;
  const thumb = brand => W.thumb({ ...brand,brandName:brand.name });
  const marks = (code, label) => `<span class="wb-class-mark" data-status="${code}" title="${W.e(label)}">
    ${W.icon(statuses[code][1],13)}<span class="wb-sr">${W.e(label)}</span></span>`;
  const statusFor = (brand, no) => {
    const code = brandData.matrix[brand.id]?.[no];
    return Object.hasOwn(statuses,code) ? code : 'gap';
  };
  const visibleBrand = brand => [brand.name,brand.englishName].some(value=>W.searchText(value).includes(W.searchText(query)));

  function matrix(brands) {
    const columns = categories[group][1];
    const table = `<div class="wb-matrix-scroll" tabindex="0" role="region" aria-label="品牌类别矩阵，表格可横向滚动"><table class="wb-matrix-table">
        <caption class="wb-sr">品牌在各尼斯类别的登记状态</caption>
        <thead><tr><th scope="col">品牌</th>${columns.map(no=>`<th scope="col" title="${W.e(D.NICE_CLASS_NAMES[no])}">第 ${no} 类<span class="wb-matrix-name">${W.e(D.NICE_CLASS_NAMES[no])}</span></th>`).join('')}</tr></thead>
        <tbody>${brands.map(brand=>`<tr class="${brand.id===selected?'is-active':''}">
          <th scope="row"><button class="wb-matrix-brand" type="button" data-brand="${W.e(brand.id)}" aria-controls="map-profile" aria-pressed="${brand.id===selected}">${thumb(brand)}<span class="wb-wrap">${W.e(brand.name)}</span></button></th>
          ${columns.map(no=>{
            const status = statusFor(brand,no);
            return `<td>${gap && status !== 'gap' ? '<span aria-label="未显示的已记录类别">—</span>' : marks(status,statuses[status][0])}</td>`;
          }).join('')}</tr>`).join('')}</tbody>
      </table></div>`;
    return `<div class="wb-matrix-legend" aria-label="类别状态图例">${Object.entries(statuses).map(([code,[label]])=>
      `<span><span class="wb-class-mark" data-status="${code}" aria-hidden="true">${W.icon(statuses[code][1],11)}</span>${label}</span>`).join('')}</div>` + table;
  }

  function caseRows(cases) {
    const groups = new Map();
    cases.forEach(record=>groups.set(record.country || '未登记法域',(groups.get(record.country || '未登记法域') || 0)+1));
    return groups.size ? `<ul class="wb-brand-lines wb-panel-body">${[...groups].map(([country,count]) =>
      `<li><strong>${W.e(country)}</strong><span class="wb-num">${count} 件</span></li>`).join('')}</ul>`
      : W.empty('暂无关联法域', '这份品牌档案还没有关联案卷。');
  }

  function timeline(cases) {
    const entries = cases.flatMap(record=>(record.timeline || []).map(event=>({...event,caseId:record.id})))
      .sort((a,b)=>W.compareText(b.date,a.date));
    return entries.length ? `<ul class="wb-brand-history">${entries.map(event=>`<li>
      <span class="wb-small wb-muted wb-num">${W.e(event.date || '日期未登记')}</span><div>
      <a class="wb-data-link wb-wrap" href="${W.e(W.caseHref(event.caseId,W.currentLink()))}">${W.e(event.title || '案件更新')}</a>
      <p class="wb-small wb-muted">${W.e(event.caseId)}${event.actor ? ' · '+W.e(event.actor) : ''}</p></div></li>`).join('')}</ul>`
      : W.empty('暂无案件动态', '关联案卷记录了办理节点后会显示在这里。');
  }

  function profile(brand,cases,focus) {
    panel.hidden = !brand;
    if (!brand) return;
    const current = W.currentLink();
    const archive = W.url('search-case.html',{brand:brand.id,from:current});
    const known = all.filter(no=>statusFor(brand,no)!=='gap');
    const gaps = core.filter(no=>statusFor(brand,no)==='gap');
    panel.innerHTML = `<div class="wb-panel-head"><div class="wb-case-cell">${thumb(brand)}<div>
        <h2 id="map-profile-title" tabindex="-1" class="wb-wrap">${W.e(brand.name)}</h2>
        <p class="wb-small wb-muted">${brand.type === 'external' ? '外部合作品牌' : '内部品牌'}</p></div></div></div>
      <div class="wb-panel-body wb-asset-detail-body">
        <div class="wb-actions"><a class="wb-btn wb-btn-primary" href="${W.e(archive)}">查看关联案卷（${cases.length}） ${W.icon('arrow',15)}</a></div>
        <dl class="wb-key-values wb-coverage">
          <div><dt>已记录类别</dt><dd>${known.length} 类</dd></div>
          <div><dt>关联案卷</dt><dd>${cases.length} 件</dd></div>
        </dl>
        ${known.length ? `<div class="wb-brand-section"><h3>类别登记</h3><div class="wb-brand-gaps">${known.map(no=>
          W.chip(no + ' 类 · ' + statuses[statusFor(brand,no)][0],{registered:'positive',pending:'info',expired:'warning'}[statusFor(brand,no)] || '')).join('')}</div></div>` : ''}
        <div class="wb-brand-section wb-asset-foot"><h3>核心类别未覆盖</h3><p class="wb-small wb-muted">${gaps.length ? gaps.map(no => '第 '+no+' 类 '+D.NICE_CLASS_NAMES[no]).join('、') : '四个核心类别均有登记记录。'}</p></div>
        <button type="button" class="wb-btn wb-back-to-list" data-back-to-map>返回图谱</button>
      </div>`;
    if (focus) {
      panel.querySelector('h2').focus();
      if (matchMedia('(max-width:820px)').matches) panel.scrollIntoView({ block: 'start' });
    }
  }

  function render({ keepRows=false,focus=false }={}) {
    const brands = brandData.brands.filter(brand => visibleBrand(brand) &&
      (view !== 'matrix' || !gap || categories[group][1].some(no => statusFor(brand,no) === 'gap')));
    const brand = brands.find(row=>row.id===selected) || brands[0];
    selected = brand?.id || '';
    W.replaceQuery({ view:view==='matrix'?'':view,group:group==='core'?'':group,gap:gap?'1':'',q:query,brand:selected });
    nav.innerHTML = BrandWorkspace.navigation('brand-map.html',selected);
    main.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.view===view));
    main.querySelector('#map-category').hidden = main.querySelector('#map-gap').hidden = view!=='matrix';
    main.querySelector('#map-brand-picker').hidden = view==='matrix' || !brands.length;
    if (!keepRows) picker.innerHTML = brands.map(row=>`<option value="${W.e(row.id)}">${W.e(row.name)}</option>`).join('');
    picker.value = selected;
    const cases = brand ? D.getBrandCases(brand.id) : [];
    main.querySelector('#map-results-title').textContent = views[view];
    main.querySelector('#map-count').textContent = view==='matrix' ? brands.length+' 个品牌' : (brand?.name || '');
    if (view==='matrix' && keepRows) {
      result.querySelectorAll('[data-brand]').forEach(button=>{
        const active = button.dataset.brand===selected;
        button.setAttribute('aria-pressed',active);
        button.closest('tr').classList.toggle('is-active',active);
      });
    } else result.innerHTML = !brand ? W.empty('没有匹配的品牌',view === 'matrix' && gap ? '可取消「仅看未覆盖」，或调整类别范围和关键词。' : '可调整关键词，或返回品牌管理查看全部品牌。')
      : view==='matrix' ? matrix(brands) : view==='region' ? caseRows(cases) : timeline(cases);
    panel.classList.toggle('wb-record-change', keepRows || focus);
    profile(brand,cases,focus);
  }

  main.addEventListener('click',event=>{
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-back-to-map')) {
      (view === 'matrix' ? result.querySelector('[data-brand][aria-pressed="true"]') : picker)?.focus();
    }
    if (button.dataset.view) { view=button.dataset.view; render(); }
    if (button.dataset.brand) {
      selected=button.dataset.brand;
      render({keepRows:true,focus:event.detail===0 || matchMedia('(max-width:820px)').matches});
    }
  });
  input.addEventListener('input',()=>{ query=input.value.trim(); render(); });
  category.addEventListener('change',()=>{ group=category.value; render(); });
  unmet.addEventListener('change',()=>{ gap=unmet.checked; render(); });
  picker.addEventListener('change',()=>{ selected=picker.value; render(); });
  render();
});
