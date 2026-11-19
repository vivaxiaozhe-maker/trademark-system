document.addEventListener('DOMContentLoaded', () => {
  const W=CaseWorkspace;
  const D=DataService;
  const main=document.getElementById('main');
  const params=W.query();
  const entry=params.get('ui')==='workbench'?{ui:'workbench'}:{};
  const filters={all:'全部抄送',unread:'未读',following:'已关注'};
  let scope=Object.hasOwn(filters,params.get('status'))?params.get('status'):'all';
  let query=params.get('q')||'';

  W.renderShell('cc.html',[['抄送案件']]);
  main.innerHTML=`<div class="wb-head"><div><h1>抄送案件</h1></div></div>
    <div class="wb-status" id="cc-notice" role="status"></div>
    <div class="wb-panel wb-metrics wb-assets-metrics" id="cc-metrics" role="group" aria-label="按抄送状态筛选"></div>
    <section class="wb-panel" aria-labelledby="cc-list-title">
      <div class="wb-filter wb-asset-tools wb-workflow-toolbar" role="search">
        <label class="wb-search">${W.icon('search')}<span class="wb-sr">搜索案号、商标或抄送人</span>
          <input name="q" type="search" placeholder="搜索案号、商标或抄送人…" autocomplete="off" maxlength="100"></label>
      </div>
      <div class="wb-panel-head"><h2 class="wb-result" id="cc-list-title">我的抄送</h2><span id="cc-count" class="wb-small wb-muted" role="status"></span></div>
      <div id="cc-list"></div>
    </section>`;
  const input=main.querySelector('input');
  const metrics=main.querySelector('#cc-metrics');
  const list=main.querySelector('#cc-list');
  const notice=main.querySelector('#cc-notice');
  input.value=query;

  const matches=(row,key)=>key==='all'||(key==='unread'?!row.readAt:row.following);
  function item(row) {
    const record=row.record;
    const href=W.caseHref(record.id,W.currentLink());
    return `<tr class="${row.readAt?'':'is-unread'}">
      <td><div class="wb-case-cell">${W.thumb(record)}<div>
        <a class="wb-data-link wb-wrap" href="${W.e(href)}" aria-label="打开抄送案卷 ${W.e(record.id)}">${W.e(record.brandName)}</a>
        <span class="wb-id wb-mono">${W.e(record.id)}</span><span class="wb-cc-source">抄送人 ${W.e(row.sender)} · <time>${W.e(row.copiedAt)}</time></span></div></div></td>
      <td class="wb-cc-extra"><strong>${W.e(record.businessType||'未登记')}</strong><span class="wb-case-legal">${W.e(record.country||'未登记')}</span></td>
      <td class="wb-cc-extra">${W.caseStatus(record)}</td>
      <td class="wb-cc-extra"><strong>${W.e(row.sender)}</strong><span class="wb-case-legal wb-num">${W.e(row.copiedAt)}</span></td>
      <td>${W.chip(row.readAt?'已读':'未读',row.readAt?'':'info')}</td>
      <td><button class="wb-btn wb-btn-small wb-cc-follow" type="button" data-follow-case="${W.e(row.caseId)}" aria-pressed="${row.following}"
        aria-label="${row.following?'取消关注':'关注'} ${W.e(record.brandName)}">${row.following?'已关注':'关注'}</button></td>
    </tr>`;
  }

  function render() {
    const tokens=W.searchText(query).split(/\s+/).filter(Boolean);
    const rows=D.getCopiedCases().filter(row=>tokens.every(token=>
      [row.caseId,row.record.brandName,row.sender,row.record.responsibleUser].some(value=>W.searchText(value).includes(token))));
    const visible=rows.filter(row=>matches(row,scope)).sort((a,b)=>W.compareText(b.copiedAt,a.copiedAt));
    W.replaceQuery({...entry,q:query,status:scope==='all'?'':scope});
    const focus=document.activeElement?.dataset.metric;
    metrics.innerHTML=W.metrics(Object.entries(filters).map(([key,label])=>({
      key,label,count:rows.filter(row=>matches(row,key)).length,tone:key==='unread'?'info':''
    })),scope);
    if(focus) metrics.querySelector(`[data-metric="${focus}"]`)?.focus({preventScroll:true});
    main.querySelector('#cc-count').textContent=visible.length+' 件';
    list.innerHTML=visible.length?`<div class="wb-table-wrap"><table class="wb-table wb-cc-table">
      <caption class="wb-sr">抄送给我的案卷</caption><thead><tr>
      <th scope="col">商标／案号</th><th scope="col" class="wb-cc-extra">业务／法域</th><th scope="col" class="wb-cc-extra">案件状态</th>
      <th scope="col" class="wb-cc-extra">抄送人／日期</th><th scope="col">阅读状态</th><th scope="col">关注</th>
      </tr></thead><tbody>${visible.map(item).join('')}</tbody></table></div>`
      : W.empty('没有匹配的抄送案件','可调整关键词、阅读状态或关注筛选。');
  }
  input.addEventListener('input',()=>{query=input.value.trim();render();});
  main.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(!button) return;
    if(button.dataset.metric) {scope=button.dataset.metric;render();}
    const id=button.dataset.followCase;
    if(!id) return;
    const following=button.getAttribute('aria-pressed')!=='true';
    const saved=D.setCaseCopyFollowing(id,following);
    if(!saved) return W.notify(notice,'关注状态未保存，请检查浏览器存储。','error');
    render();
    const next=[...list.querySelectorAll('[data-follow-case]')].find(control=>control.dataset.followCase===id);
    (next||input).focus({preventScroll:true});
    W.notify(notice,following?'已关注「'+id+'」。':'已取消对「'+id+'」的关注。','success');
  });
  window.addEventListener('pageshow',event=>{if(event.persisted) render();});
  render();
});
