document.addEventListener('DOMContentLoaded', () => {
  const W = CaseWorkspace;
  const D = DataService;
  const main = document.getElementById('main');
  const params = W.query();
  const internal = document.body.dataset.view === 'brand-auth-internal';
  const kind = internal ? 'internal' : 'external';
  const page = 'brand-auth-' + kind + '.html';
  const title = W.pageLabel(page);
  const states = { pending: ['待审批','warning'], reviewing: ['审批中','info'], approved: ['已通过','positive'], rejected: ['已驳回','danger'] };
  const brands = D.getBrands();
  const byBrand = new Map(brands.map(brand=>[brand.id,brand]));
  const option = (id,label)=>`<option value="${W.e(id)}">${W.e(label)}</option>`;
  const brandOptions = brands.map(brand=>option(brand.id,brand.name)).join('');
  const allow = params.get('status');
  let status = Object.hasOwn(states,allow) ? allow : 'all';
  let brand = byBrand.has(params.get('brand')) ? params.get('brand') : '';
  let query = params.get('q') || '';
  let selected = params.get('id') || '';
  let visible = [];

  W.renderShell('brand.html',[['品牌管理','brand.html'],[title]]);
  main.innerHTML = `<div class="wb-head"><div><h1>${title}</h1></div>
    <div class="wb-actions"><button class="wb-btn wb-btn-primary" type="button" id="license-create"${brands.length?'':' disabled'}>${W.icon('plus')} 新建授权</button></div></div>
    <div id="license-nav"></div>
    <div class="wb-status" role="status" id="license-notice"></div>
    <div class="wb-panel wb-metrics wb-license-metrics" id="license-metrics" role="group" aria-label="按审批状态筛选"></div>
    <div class="wb-asset-grid">
      <section class="wb-panel" aria-labelledby="license-list-title">
        <div class="wb-filter wb-asset-tools wb-brand-toolbar" role="search">
          <label class="wb-search">${W.icon('search')}<span class="wb-sr">搜索编号、品牌或被授权方</span>
            <input name="q" type="search" autocomplete="off" placeholder="搜索编号、品牌或被授权方…" maxlength="100"></label>
          <label class="wb-inline-select">品牌<select name="brand" class="wb-input">${option('','全部品牌')}${brandOptions}</select></label>
        </div>
        <div class="wb-panel-head"><h2 class="wb-result" id="license-list-title">${internal?'内部':'外部'}授权清单</h2>
          <span class="wb-small wb-muted" id="license-count" role="status"></span>
          <button class="wb-btn wb-btn-small" id="license-export" type="button">${W.icon('download',14)} 导出清单</button></div>
        <div id="license-list"></div>
      </section>
      <section class="wb-panel wb-asset-detail wb-brand-detail" id="license-detail" aria-labelledby="license-detail-title" hidden></section>
    </div>
    <dialog class="wb-dialog wb-license-dialog" id="license-dialog" aria-labelledby="license-dialog-title">
      <div class="wb-panel-head"><h2 id="license-dialog-title">新建${internal?'内部':'外部'}授权</h2>
        <button class="wb-btn wb-btn-quiet" type="button" data-dismiss aria-label="关闭">${W.icon('close')}</button></div>
      <form id="license-form" class="wb-panel-body" autocomplete="off">
        <fieldset class="wb-license-fields"><legend>品牌与授权对象</legend><div class="wb-fields">
          <label class="wb-field">授权品牌<select class="wb-input" name="brandId" required>${option('','请选择品牌')}${brandOptions}</select></label>
          <label class="wb-field">关联案卷<select class="wb-input" name="caseId">${option('','暂不关联案卷')}</select></label>
          <label class="wb-field">${internal?'被授权部门／团队':'被授权单位'}<input class="wb-input" name="holder" required maxlength="120" placeholder="${internal?'例如，产品运营组…':'例如，某合作企业…'}"></label>
          <label class="wb-field">申请部门<input class="wb-input" name="department" list="license-departments" required maxlength="80"></label>
          <datalist id="license-departments">${W.uniqueValues(D.getStaff().filter(row=>row.kind==='internal'),'department').map(name=>option(name,name)).join('')}</datalist>
        </div></fieldset>
        <fieldset class="wb-license-fields"><legend>使用范围与期限</legend><div class="wb-fields">
          <label class="wb-field">开始日期<input class="wb-input" name="startDate" type="date" required></label>
          <label class="wb-field">结束日期<input class="wb-input" name="endDate" type="date" required></label>
          <label class="wb-field">适用法域<input class="wb-input" name="territories" required maxlength="140" placeholder="例如，中国、欧盟…"></label>
          <label class="wb-field">参考单号（选填）<input class="wb-input" name="reference" maxlength="80"></label>
          <label class="wb-field wb-field-wide">使用场景<textarea class="wb-input" name="purpose" required rows="2" maxlength="500" placeholder="例如，产品包装与展会材料…"></textarea></label>
          <label class="wb-field-wide wb-small wb-license-checkbox"><input type="checkbox" name="needsCertificate"> 需附商标证</label>
        </div></fieldset>
        <div class="wb-status" role="alert" id="license-error"></div>
        <div class="wb-form-actions"><button class="wb-btn" type="button" data-dismiss>取消</button>
          <button class="wb-btn wb-btn-primary" type="submit">提交授权申请</button></div>
      </form>
    </dialog>
    <dialog class="wb-dialog wb-license-dialog" id="license-review" aria-labelledby="license-review-title">
      <div class="wb-panel-head"><h2 id="license-review-title">模拟审批</h2><button class="wb-btn wb-btn-quiet" type="button" data-dismiss aria-label="关闭">${W.icon('close')}</button></div>
      <form id="license-review-form" class="wb-panel-body" autocomplete="off">
        <p class="wb-small wb-muted" id="license-review-context"></p>
        <label class="wb-field">审批结论<select class="wb-input" name="result">${option('approved','通过')}${option('rejected','驳回')}</select></label>
        <label class="wb-field">审批意见<textarea class="wb-input" name="opinion" required rows="3" maxlength="500"></textarea></label>
        <div class="wb-status" role="alert" id="license-review-error"></div>
        <div class="wb-form-actions"><button class="wb-btn" type="button" data-dismiss>取消</button><button class="wb-btn wb-btn-primary" type="submit">保存审批结论</button></div>
      </form>
    </dialog>`;

  const nav = main.querySelector('#license-nav');
  const notice = main.querySelector('#license-notice');
  const metrics = main.querySelector('#license-metrics');
  const input = main.querySelector('input[name=q]');
  const filter = main.querySelector('select[name=brand]');
  const list = main.querySelector('#license-list');
  const panel = main.querySelector('#license-detail');
  const dialog = main.querySelector('#license-dialog');
  const form = dialog.querySelector('form');
  const review = main.querySelector('#license-review');
  const reviewForm = review.querySelector('form');
  const exportButton = main.querySelector('#license-export');
  let reviewing = '';
  input.value = query;
  filter.value = brand;
  const nameOf = record => byBrand.get(record.brandId)?.name || '未登记品牌';
  const stateOf = record => W.chip(...(states[record.status] || ['未登记','']));
  const mark = record => W.thumb({...byBrand.get(record.brandId),brandName:nameOf(record)});
  const field = (label,value,wide=false)=>`<div${wide?' class="wb-field-wide"':''}><dt>${label}</dt><dd>${value}</dd></div>`;

  function detail(data,focus) {
    panel.hidden = !data;
    if (!data) return;
    const archive = data.caseId && D.getCaseById(data.caseId);
    panel.innerHTML = `<div class="wb-panel-head"><div class="wb-case-cell">${mark(data)}<div>
        <h2 id="license-detail-title" class="wb-wrap" tabindex="-1">${W.e(data.holder)}</h2>
        <p class="wb-small wb-muted"><span class="wb-mono">${W.e(data.id)}</span> · ${W.e(nameOf(data))}</p></div></div>${stateOf(data)}</div>
      <div class="wb-panel-body wb-asset-detail-body">
        <div class="wb-term-summary"><span>申请使用期限</span>
          <strong><time>${W.e(data.startDate)}</time> 至 <time>${W.e(data.endDate)}</time></strong></div>
        <dl class="wb-key-values">
          ${field('申请部门',W.e(data.department))}
          ${field('适用法域',W.e(data.territories.join('、')))}

          ${field('使用场景',W.e(data.purpose),true)}
          ${field('商标证需求',data.needsCertificate?'需附商标证':'无需商标证')}
          ${field('参考单号',W.e(data.reference || '未登记'))}
          ${archive ? field('关联案卷',`<a class="wb-data-link" href="${W.e(W.caseHref(archive.id,W.currentLink()))}">${W.e(archive.id)}</a>`,true) : ''}
        </dl>
        ${data.reviewNote ? `<div class="wb-brand-section wb-asset-foot"><h3>审批记录</h3><p class="wb-wrap">${W.e(data.reviewNote)}</p>
          <p class="wb-small wb-muted">${W.e(data.reviewedBy)} · ${W.e(data.reviewedAt)}</p></div>` : ''}
        ${['pending','reviewing'].includes(data.status) ? '<div class="wb-actions wb-asset-foot"><button class="wb-btn" id="license-review-button" type="button">模拟审批</button></div>' : ''}
        <button type="button" class="wb-btn wb-back-to-list" data-back-to-license>返回授权清单</button>
      </div>`;
    if (focus) {
      panel.querySelector('h2').focus();
      if (matchMedia('(max-width:820px)').matches) panel.scrollIntoView({ block: 'start' });
    }
  }

  function render({keepRows=false,focus=false}={}) {
    const records = D.getBrandAuthorizations(kind);
    const tokens = W.searchText(query).split(/\s+/).filter(Boolean);
    const filtered = records.filter(record=>(!brand || record.brandId===brand) &&
      tokens.every(token=>[record.id,nameOf(record),record.holder,record.department,record.reference].some(value=>W.searchText(value).includes(token))));
    visible = filtered.filter(record=>status==='all'||record.status===status)
      .sort((a,b)=>W.compareText(b.createdAt,a.createdAt)||W.compareText(b.id,a.id));
    const current = visible.find(row=>row.id===selected) || visible[0];
    selected = current?.id || '';
    if (nav.dataset.brand !== brand) {
      nav.innerHTML = BrandWorkspace.navigation(page,brand);
      nav.dataset.brand = brand;
    }
    W.replaceQuery({brand,q:query,status:status==='all'?'':status,id:selected});
    if (!keepRows) {
      const focusedMetric = document.activeElement?.dataset.metric;
      const options = [{key:'all',label:'全部申请',count:filtered.length},...Object.entries(states)
        .map(([key,[label]])=>({key,label,count:filtered.filter(row=>row.status===key).length,tone:key==='pending'?'warning':''}))];
      metrics.innerHTML = W.metrics(options,status);
      if (focusedMetric) metrics.querySelector(`[data-metric="${focusedMetric}"]`)?.focus({preventScroll:true});
      main.querySelector('#license-count').textContent = visible.length+' 条';
      exportButton.disabled = !visible.length;
      list.innerHTML = visible.length ? `<div class="wb-license-columns" aria-hidden="true"><span>${internal ? '部门／团队' : '被授权单位'} · 品牌</span><span>使用截止日</span><span>审批状态</span></div><ul class="wb-asset-list">${visible.map(record=>`<li>
        <button class="wb-asset-row wb-license-row" type="button" aria-pressed="${record.id===selected}" aria-controls="license-detail" data-record="${W.e(record.id)}">
          ${mark(record)}<span class="wb-asset-ident"><strong class="wb-wrap">${W.e(record.holder)}</strong>
          <span class="wb-small wb-muted">${W.e(nameOf(record))} · ${W.e(record.id)}</span></span>
          <time class="wb-license-end wb-num" datetime="${W.e(record.endDate)}"><span class="wb-sr">使用截止日 </span>${W.e(record.endDate)}</time>
          ${stateOf(record)} ${W.icon('chevron',15)}
        </button></li>`).join('')}</ul>` : W.empty('没有匹配的授权记录','可调整关键词、品牌或审批状态。');
    } else list.querySelectorAll('[data-record]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.record===selected));
    panel.classList.toggle('wb-record-change', keepRows || focus);
    detail(current,focus);
  }

  function syncCaseOptions() {
    const cases = D.getBrandCases(form.elements.brandId.value);
    form.elements.caseId.innerHTML = option('','暂不关联案卷')+cases.map(row=>option(row.id,row.id+' · '+row.brandName)).join('');
    form.elements.caseId.disabled = !cases.length;
  }
  function openCreate() {
    form.reset();
    form.elements.brandId.value = brand;
    form.elements.startDate.value = D.getToday();
    const employee = D.getStaff().find(row=>row.id===D.CURRENT_USER.id);
    form.elements.department.value = employee?.department || '';
    syncCaseOptions();
    W.notify(form.querySelector('#license-error'),'');
    dialog.showModal();
  }
  function openReview() {
    const record = visible.find(row=>row.id===selected);
    if (!record) return;
    reviewing = record.id;
    reviewForm.reset();
    W.notify(reviewForm.querySelector('#license-review-error'),'');
    review.querySelector('#license-review-context').textContent = record.id+' · '+record.holder;
    review.showModal();
  }

  function reveal(saved,message) {
    status = saved.status;
    selected = saved.id;
    if (brand && brand!==saved.brandId) filter.value=brand=saved.brandId;
    query = input.value = '';
    render({focus:true});
    W.notify(notice,message,'success');
  }

  main.addEventListener('click',event=>{
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-back-to-license')) list.querySelector('[data-record][aria-pressed="true"]')?.focus();
    if (button.hasAttribute('data-dismiss')) button.closest('dialog').close();
    if (button.id==='license-create') openCreate();
    if (button.dataset.metric) { status=button.dataset.metric; render(); }
    if (button.dataset.record) {
      selected=button.dataset.record;
      render({keepRows:true,focus:event.detail===0 || matchMedia('(max-width:820px)').matches});
    }
    if (button.id==='license-review-button') openReview();
    if (button===exportButton) W.downloadCsv(title+'清单.csv',['编号','品牌','被授权方','申请部门','法域','开始','结束','状态'],
      visible.map(record=>[record.id,nameOf(record),record.holder,record.department,record.territories.join('、'),record.startDate,record.endDate,states[record.status]?.[0]]));
  });
  input.addEventListener('input',()=>{query=input.value.trim();render();});
  filter.addEventListener('change',()=>{brand=filter.value;render();});
  form.elements.brandId.addEventListener('change',syncCaseOptions);
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const error = form.querySelector('#license-error');
    if (D.daysBetween(values.startDate,values.endDate)<0) {
      W.notify(error,'结束日期不能早于开始日期。','error');
      form.elements.endDate.focus();
      return;
    }
    const saved = D.createBrandAuthorization(kind,{...values,needsCertificate:form.elements.needsCertificate.checked});
    if (!saved) return W.notify(error,'申请未保存。请核对必填项、关联案卷及日期，或检查浏览器存储后重试。','error');
    dialog.close();
    reveal(saved,'授权申请已提交 · '+saved.id+' 已进入'+(internal?'内部':'外部')+'待审批清单。');
  });
  reviewForm.addEventListener('submit',event=>{
    event.preventDefault();
    const {result,opinion}=Object.fromEntries(new FormData(reviewForm));
    const saved=D.reviewBrandAuthorization(kind,reviewing,result,opinion);
    if (!saved) return W.notify(reviewForm.querySelector('#license-review-error'),'审批未保存。请填写意见并确认申请仍待审批。','error');
    review.close();
    reveal(saved,'已保存模拟审批 · '+saved.id+'。');
  });
  window.addEventListener('pageshow',event=>{ if(event.persisted) render(); });
  render();
});
