document.addEventListener('DOMContentLoaded', () => {
  const W = CaseWorkspace;
  const D = DataService;
  const main = document.getElementById('main');
  const params = W.query();
  const entry = params.get('ui') === 'workbench' ? {ui:'workbench'} : {};
  const origin = W.returnLink(params.get('from'), '');
  const cases = new Map(W.allCases().map(record=>[record.id,record]));
  const states = D.SEAL_STATES;
  const tones = { pending_approval:'warning', approving:'info', sealed:'info', pending_confirm:'warning', completed:'positive' };
  const approvalActions = {pending_approval:'登记审批单号',approving:'登记盖章版',sealed:'转待律所确认',pending_confirm:'登记确认结果'};
  const isCase = id=>cases.has(id);
  const option = (id,label)=>`<option value="${W.e(id)}">${W.e(label)}</option>`;
  const caseOptions = [...cases.values()].map(record=>option(record.id,record.id+' · '+record.brandName)).join('');
  const caseName = record=>record.brandName+' · '+record.id;
  const chip = record=>W.chip(states[record.status] || '未登记',tones[record.status] || '');
  let caseFilter = isCase(params.get('case')) ? params.get('case') : '';
  let query = params.get('q') || '';
  let status = Object.hasOwn(states,params.get('status')) ? params.get('status') : 'all';
  let selected = params.get('id') || '';
  let active = null;
  let busy = false;

  W.renderShell('seal-process.html', [...(origin ? [[W.pageLabel(origin), origin]] : []), ['用印流程']]);
  main.innerHTML = `<div class="wb-head"><div><h1>用印流程</h1></div>
      <div class="wb-actions">${origin ? `<a class="wb-btn" href="${W.e(origin)}">返回${W.e(W.pageLabel(origin))}</a>` : ''}<button class="wb-btn wb-btn-primary" type="button" id="seal-create"${cases.size?'':' disabled'}>${W.icon('plus')} 新建用印</button></div></div>
    <div class="wb-status" id="seal-notice" role="status"></div>
    <div class="wb-panel wb-metrics wb-seal-status" id="seal-metrics" role="group" aria-label="按用印状态筛选"></div>
    <div class="wb-asset-grid">
      <section class="wb-panel" aria-labelledby="seal-list-title">
        <div class="wb-filter wb-asset-tools wb-workflow-toolbar" role="search">
          <label class="wb-search">${W.icon('search')}<span class="wb-sr">搜索用印编号、案号或文件</span><input name="q" type="search" placeholder="搜索用印编号、案号或文件…" autocomplete="off" maxlength="120"></label>
          <label class="wb-inline-select">案卷<select name="case" class="wb-input">${option('','全部案卷')}${caseOptions}</select></label>
        </div>
        <div class="wb-panel-head"><h2 class="wb-result" id="seal-list-title">用印清单</h2><span id="seal-count" class="wb-small wb-muted" role="status"></span></div>
        <div id="seal-list"></div>
      </section>
      <section class="wb-panel wb-asset-detail wb-workflow-panel" id="seal-detail" aria-labelledby="seal-detail-title" hidden></section>
    </div>
    <dialog id="seal-dialog" class="wb-dialog wb-workflow-dialog" aria-labelledby="seal-dialog-title">
      <div class="wb-panel-head"><h2 id="seal-dialog-title">发起用印</h2>
        <button class="wb-btn wb-btn-quiet" type="button" data-dismiss aria-label="关闭">${W.icon('close')}</button></div>
      <form class="wb-panel-body wb-workflow-form" id="seal-create-form" autocomplete="off">
        <label class="wb-field">关联案卷<select class="wb-input" name="caseId" required>${option('','请选择案卷')}${caseOptions}</select></label>
        <label class="wb-field">拟用印文件名称<input class="wb-input" name="title" required maxlength="120" placeholder="例如，驳回复审委托书…"></label>
        <label class="wb-field">引用案卷材料（选填）<select class="wb-input" name="documentId"></select></label>
        <label class="wb-field">添加本地文件（选填）<input class="wb-input" type="file" name="attachment" accept=".pdf,.doc,.docx"></label>
        <label class="wb-field">用印用途<textarea class="wb-input" name="purpose" rows="2" maxlength="500" placeholder="记录文件用途或提交要求…"></textarea></label>
        <div class="wb-status" id="seal-create-error" role="alert"></div>
        <div class="wb-form-actions"><button type="button" class="wb-btn" data-dismiss>取消</button><button class="wb-btn wb-btn-primary" type="submit">提交用印申请</button></div>
      </form>
    </dialog>
    <dialog id="seal-step" class="wb-dialog wb-workflow-dialog" aria-labelledby="seal-step-title">
      <div class="wb-panel-head"><h2 id="seal-step-title">更新用印</h2><button class="wb-btn wb-btn-quiet" type="button" data-dismiss aria-label="关闭">${W.icon('close')}</button></div>
      <form id="seal-step-form" class="wb-panel-body wb-workflow-form" autocomplete="off">
        <p class="wb-small wb-muted" id="seal-step-context"></p><div id="seal-step-fields"></div>
        <div class="wb-status" id="seal-step-error" role="alert"></div>
        <div class="wb-form-actions"><button type="button" class="wb-btn" data-dismiss>取消</button><button class="wb-btn wb-btn-primary" type="submit">保存办理结果</button></div>
      </form>
    </dialog>`;

  const input=main.querySelector('input[name=q]');
  const filter=main.querySelector('select[name=case]');
  const metrics=main.querySelector('#seal-metrics');
  const list=main.querySelector('#seal-list');
  const panel=main.querySelector('#seal-detail');
  const notice=main.querySelector('#seal-notice');
  const create=main.querySelector('#seal-dialog');
  const step=main.querySelector('#seal-step');
  const form=main.querySelector('#seal-create-form');
  const stepForm=main.querySelector('#seal-step-form');
  input.value=query;
  filter.value=caseFilter;

  const details = (label,value,wide=false)=>`<div${wide?' class="wb-field-wide"':''}><dt>${label}</dt><dd>${value}</dd></div>`;
  function files(record) {
    const items = [['原始材料',record.source],['盖章版',record.stamped]].filter(([,item])=>item);
    return items.length ? `<div class="wb-workflow-notes wb-asset-foot">${items.map(([label,item])=>`<div class="wb-workflow-extract">
      <div><p class="wb-small wb-muted">${label}</p><p class="wb-wrap">${W.e(item.name)}</p></div>
      ${item.fileKey?`<button class="wb-btn wb-btn-small" type="button" data-download-seal="${W.e(item.fileKey)}">${W.icon('download',14)} 下载</button>`:''}
      </div>`).join('')}</div>` : '';
  }
  function renderDetail(record,focus) {
    panel.hidden=!record;
    if(!record) return;
    const linked=cases.get(record.caseId);
    const firm=linked && D.resolveCaseLawFirm(linked);
    const stepNo={pending_approval:1,approving:1,sealed:2,pending_confirm:3,completed:4}[record.status];
    panel.innerHTML=`<div class="wb-panel-head"><div><h2 id="seal-detail-title" class="wb-wrap" tabindex="-1">${W.e(record.title)}</h2>
      <p class="wb-small wb-muted wb-mono">${W.e(record.id)}</p></div>${chip(record)}</div>
      <div class="wb-panel-body wb-asset-detail-body">
        <ol class="wb-workflow-progress" aria-label="办理步骤">${['提交申请','企业审批','盖章回传','律所确认'].map((label,index)=>
          `<li${index===stepNo?' aria-current="step"':''}>${W.icon(index<stepNo?'check':index===2?'stamp':'file',14)}${label}</li>`).join('')}</ol>
        ${approvalActions[record.status]?`<div class="wb-actions wb-seal-action"><button class="wb-btn wb-btn-primary" id="seal-advance" type="button">${approvalActions[record.status]}</button></div>`:''}
        <dl class="wb-key-values">
          ${details('关联案卷',linked?`<a class="wb-data-link" href="${W.e(W.caseHref(linked.id,W.currentLink()))}">${W.e(caseName(linked))}</a>`:'未找到案卷',true)}
          ${details('代理律所',W.e(firm?.name || '未登记'))}
          ${details('发起人',W.e(record.requester || '未登记'))}
          ${details('申请日期',W.e(record.createdAt || '未登记'))}
          ${details('审批单号',W.e(record.reference || '未登记'))}
          ${record.purpose?details('用印用途',W.e(record.purpose),true):''}
          ${record.confirmNote?details('确认意见',W.e(record.confirmNote),true):''}
        </dl>${files(record)}
        <button type="button" class="wb-btn wb-back-to-seals" data-back-to-seals>返回用印清单</button>
      </div>`;
    if(focus) {
      panel.querySelector('h2').focus();
      if (matchMedia('(max-width:820px)').matches) panel.scrollIntoView({ block:'start' });
    }
  }
  function render({keepRows=false,focus=false}={}) {
    const terms=W.searchText(query).split(/\s+/).filter(Boolean);
    const records=D.getSealRequests(caseFilter).filter(record=>{
      const linked=cases.get(record.caseId);
      return terms.every(token=>[record.id,record.title,record.caseId,linked?.brandName,record.reference]
        .some(value=>W.searchText(value).includes(token)));
    });
    const visible=records.filter(record=>status==='all'||record.status===status)
      .sort((a,b)=>W.compareText(b.createdAt,a.createdAt)||W.compareText(b.id,a.id));
    active=visible.find(record=>record.id===selected) || visible[0];
    selected=active?.id || '';
    W.replaceQuery({...entry, from:origin, case:caseFilter, q:query,status:status==='all'?'':status,id:selected});
    if(!keepRows) {
      const focusedMetric=document.activeElement?.dataset.metric;
      metrics.innerHTML=W.metrics([{key:'all',label:'全部申请',count:records.length},...Object.entries(states)
        .map(([key,label])=>({key,label,count:records.filter(row=>row.status===key).length,tone:tones[key]}))],status);
      if(focusedMetric) metrics.querySelector(`[data-metric="${focusedMetric}"]`)?.focus({preventScroll:true});
      main.querySelector('#seal-count').textContent=visible.length+' 条';
      list.innerHTML=visible.length?`<div class="wb-seal-columns" aria-hidden="true"><span>文件／用印编号</span><span>申请日期</span><span>办理状态</span></div><ul class="wb-asset-list">${visible.map(record=>`<li>
        <button class="wb-asset-row wb-seal-row" type="button" data-record="${W.e(record.id)}" aria-pressed="${record.id===selected}" aria-controls="seal-detail">
          <span class="wb-record-icon">${W.icon('stamp',18)}</span>
          <span class="wb-asset-ident"><strong class="wb-wrap">${W.e(record.title)}</strong><span class="wb-seal-ids wb-small wb-muted"><span>${W.e(record.id)}</span><span>${W.e(record.caseId)}</span></span></span>
          <time class="wb-seal-date wb-num"><span class="wb-sr">申请日期 </span>${W.e(record.createdAt || '未登记')}</time>
          ${chip(record)}${W.icon('chevron',15)}
        </button></li>`).join('')}</ul>`:W.empty('没有匹配的用印记录','可调整案号、关键词或审批状态。');
    } else list.querySelectorAll('[data-record]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.record===selected));
    panel.classList.toggle('wb-selection-change', keepRows || focus);
    renderDetail(active,focus);
  }

  function syncMaterials() {
    const docs=cases.get(form.elements.caseId.value)?.documents || [];
    form.elements.documentId.innerHTML=option('','暂不引用')+docs.map(doc=>option(doc.id,doc.name)).join('');
    form.elements.documentId.disabled=!docs.length;
  }
  function openCreate() {
    form.reset();
    form.elements.caseId.value=caseFilter;
    syncMaterials();
    W.notify(form.querySelector('#seal-create-error'),'');
    create.showModal();
  }
  let workingOn = null;
  function openStep() {
    if(!active || !approvalActions[active.status]) return;
    workingOn={id:active.id,status:active.status};
    step.querySelector('h2').textContent=approvalActions[active.status];
    step.querySelector('#seal-step-context').textContent=active.id+' · '+active.title;
    const fields={
      pending_approval:'<label class="wb-field">审批单号<input class="wb-input" name="reference" required maxlength="80"></label>',
      approving:'<label class="wb-field">盖章版文件<input class="wb-input" name="attachment" type="file" accept=".pdf,.doc,.docx" required></label>',
      sealed:'<p class="wb-muted wb-small">登记为待律所确认，供后续核对。</p>',
      pending_confirm:'<div class="wb-workflow-notes"><label class="wb-field">确认结果<select class="wb-input" name="decision"><option value="complete">确认完成</option><option value="return">退回重新审批</option></select></label><label class="wb-field">确认意见<textarea class="wb-input" name="note" rows="2" maxlength="500"></textarea></label></div>'
    };
    step.querySelector('#seal-step-fields').innerHTML=fields[active.status];
    W.notify(step.querySelector('#seal-step-error'),'');
    step.showModal();
  }
  function reveal(saved,message) {
    selected=saved.id;
    query=input.value='';
    if(caseFilter && caseFilter!==saved.caseId) caseFilter=filter.value=saved.caseId;
    status=saved.status;
    render({focus:true});
    W.notify(notice,message,'success');
  }

  async function save(formElement,error,file,commit,onSuccess) {
    if(busy) return;
    if(file && (!/\.(pdf|doc|docx)$/i.test(file.name)||!file.size)) {
      W.notify(error,'请选择有内容的 PDF、DOC 或 DOCX 文件。','error');
      return;
    }
    busy=true;
    const submit=formElement.querySelector('[type=submit]');
    submit.disabled=true;
    let attachment;
    let stored=false;
    try {
      if(file) {
        attachment={fileKey:D.generateId('seal-file'),name:file.name};
        await WorkbenchFiles.put(attachment.fileKey,file);
        stored=true;
      }
      const saved=commit(attachment);
      if(!saved) throw new Error('record not saved');
      stored=false;
      formElement.closest('dialog').close();
      onSuccess(saved);
    } catch {
      if(stored) await WorkbenchFiles.remove(attachment.fileKey).catch(()=>{});
      W.notify(error,'记录未保存。请核对案卷、办理状态或浏览器存储后重试。','error');
    } finally { busy=false; submit.disabled=false; }
  }

  input.addEventListener('input',()=>{query=input.value.trim();render();});
  filter.addEventListener('change',()=>{caseFilter=filter.value;render();});
  form.elements.caseId.addEventListener('change',syncMaterials);
  [create,step].forEach(dialog=>dialog.addEventListener('cancel',event=>{if(busy) event.preventDefault();}));
  main.addEventListener('click',async event=>{
    const button=event.target.closest('button');
    if(!button) return;
    if(button.hasAttribute('data-dismiss')&&!busy) button.closest('dialog').close();
    if(button.hasAttribute('data-back-to-seals')) list.querySelector('[data-record][aria-pressed="true"]')?.focus();
    if(button.id==='seal-create') openCreate();
    if(button.id==='seal-advance') openStep();
    if(button.dataset.metric) {status=button.dataset.metric;render();}
    if(button.dataset.record) {
      selected=button.dataset.record;
      render({keepRows:true,focus:event.detail===0||matchMedia('(max-width:820px)').matches});
    }
    if(button.dataset.downloadSeal) {
      const item=[active?.source,active?.stamped].find(value=>value?.fileKey===button.dataset.downloadSeal);
      if(!item) return;
      try {await WorkbenchFiles.download(item.fileKey,item.name);}
      catch {W.notify(notice,'此浏览器找不到该文件的本地副本。','error');}
    }
  });
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const values=Object.fromEntries(new FormData(form));
    const file=form.elements.attachment.files[0];
    const error=form.querySelector('#seal-create-error');
    if(file&&values.documentId) return W.notify(error,'请选择引用案卷材料或添加本地文件，两者选一。','error');
    save(form,error,file,attachment=>D.createSealRequest({...values,attachment}),
      saved=>reveal(saved,'用印申请已发起 · '+saved.id+' 已进入待企业审批清单。'));
  });
  stepForm.addEventListener('submit',event=>{
    event.preventDefault();
    const values=Object.fromEntries(new FormData(stepForm));
    const file=stepForm.elements.attachment?.files[0];
    const expected=workingOn;
    if(!expected) return;
    save(stepForm,stepForm.querySelector('#seal-step-error'),file,
      attachment=>D.advanceSealRequest(expected.id,expected.status,{...values,attachment}),
      saved=>reveal(saved,'已更新 · '+saved.id+' 为「'+states[saved.status]+'」。'));
  });
  window.addEventListener('pageshow',event=>{if(event.persisted) render();});
  render();
  if(params.get('action')==='new'&&caseFilter) openCreate();
});
