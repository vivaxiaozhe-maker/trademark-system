document.addEventListener('DOMContentLoaded', () => {
  const W=CaseWorkspace;
  const D=DataService;
  const F=FinanceWorkspace;
  const main=document.getElementById('main');
  const params=W.query();
  const entry=params.get('ui')==='workbench'?{ui:'workbench'}:{};
  const cases=W.allCases();
  const bills=D.getFees().filter(row=>row.type==='官费' && Number.isFinite(row.amount));
  const styles={all:'全部入口',official:'官方查询',professional:'专业平台',local:'本机试算'};
  const links=[
    {group:'official',name:'中国商标网',description:'国家知识产权局商标查询入口',href:'https://sbj.cnipa.gov.cn/sbj/sbcx/',icon:'search'},
    {group:'official',name:'WIPO Global Brand Database',description:'世界知识产权组织全球品牌数据库',href:'https://www.wipo.int/en/web/global-brand-database/index',icon:'search'},
    {group:'professional',name:'摩知轮',description:'国内商标检索平台',href:'https://www.mozlen.com/',icon:'link'},
    {group:'professional',name:'Fovea IP',description:'商标检索与信息服务',href:'https://www.foveaip.com/',icon:'link'},
    {group:'professional',name:'Darts-ip',description:'Clarivate 知识产权判例库',href:'https://clarivate.com/intellectual-property/darts-ip/',icon:'link'},
    {group:'professional',name:'小米知库',description:'内部知识产权文档入口',icon:'file'}
  ];
  const option=(id,label)=>`<option value="${W.e(id)}">${W.e(label)}</option>`;
  const caseOptions=cases.map(record=>option(record.id,record.brandName+' · '+record.id)).join('');
  const defaultTool = document.body.dataset.defaultTool;
  let view = defaultTool || (Object.hasOwn(styles, params.get('view')) ? params.get('view') : 'all');
  if (defaultTool) history.replaceState(null, '', W.url('tools.html', { view }));

  W.renderShell('tools.html',[['商标工具 Link']]);
  main.innerHTML=`<div class="wb-head"><div><h1>商标工具 Link</h1></div></div>
    <div class="wb-tools-stack">
      <div class="wb-tools-tabs" role="group" aria-label="工具类别">${Object.entries(styles).map(([id,label])=>`<button type="button" data-tools-view="${id}">${label}</button>`).join('')}</div>
      <section class="wb-panel" id="tool-links" aria-labelledby="links-title">
        <div class="wb-panel-head"><h2 id="links-title">查询入口</h2><span class="wb-small wb-muted">外部站点在新标签页打开</span></div>
        <div class="wb-tools-grid" id="tools-link-list"></div>
      </section>
      <div class="wb-tools-calcs" id="tool-calcs">
        <section class="wb-panel" aria-labelledby="date-calc-title">
          <div class="wb-panel-head"><h2 id="date-calc-title">${W.icon('calendar',16)} 日期试算</h2></div>
          <form class="wb-panel-body wb-calc" id="calc-date" autocomplete="off">
            <label class="wb-field">案卷（可选）<select class="wb-input" name="caseId">${option('','自填基准日期')}${caseOptions}</select></label>
            <div class="wb-fields">
              <label class="wb-field">基准日期<input class="wb-input" name="base" type="date" required></label>
              <label class="wb-field">偏移日历天数<input class="wb-input" name="days" type="number" step="1" value="7" required></label>
            </div>
            <p class="wb-small wb-muted">选择案卷可带入已登记的官方绝限。结果为日历日期试算。</p>
            <div class="wb-status" role="alert" id="calc-date-error"></div>
            <output class="wb-calc-output wb-num" id="calc-date-output" aria-live="polite" hidden></output>
            <button class="wb-btn wb-btn-primary" type="submit">试算日期</button>
          </form>
        </section>
        <section class="wb-panel" aria-labelledby="fee-calc-title">
          <div class="wb-panel-head"><h2 id="fee-calc-title">${W.icon('charts',16)} 官费试算</h2></div>
          <form class="wb-panel-body wb-calc" id="calc-fee" autocomplete="off">
            <label class="wb-field">参考官费<select class="wb-input" name="fee" required>${option('','选择演示账单')}${bills.map(row=>
              option(row.id,(row.brandName||row.caseId)+' · '+(row.note||row.type)+' · '+F.money(row.amount,row.currency))).join('')}</select></label>
            <label class="wb-field">份数<input class="wb-input" name="quantity" type="number" min="1" step="1" value="1" required></label>
            <p class="wb-small wb-muted">以演示账单金额乘以份数，沿用账单币种。</p>
            <div class="wb-status" role="alert" id="calc-fee-error"></div>
            <output class="wb-calc-output wb-num" id="calc-fee-output" aria-live="polite" hidden></output>
            <button class="wb-btn wb-btn-primary" type="submit"${bills.length?'':' disabled'}>试算费用</button>
          </form>
        </section>
      </div>
    </div>`;

  const directory=main.querySelector('#tool-links');
  const grid=main.querySelector('#tools-link-list');
  const calcs=main.querySelector('#tool-calcs');
  const date=main.querySelector('#calc-date');
  const fee=main.querySelector('#calc-fee');
  const selectedCase=()=>cases.find(row=>row.id===date.elements.caseId.value);
  function syncReturnLinks() {
    const dateReady = !date.querySelector('output').hidden;
    const feeReady = !fee.querySelector('output').hidden;
    W.replaceQuery({...entry,view:view==='all'?'':view,
      case:dateReady ? date.elements.caseId.value : '', base:dateReady ? date.elements.base.value : '',
      days:dateReady ? date.elements.days.value : '', fee:feeReady ? fee.elements.fee.value : '',
      quantity:feeReady ? fee.elements.quantity.value : ''});
    const archive = date.querySelector('output a');
    const ledger = fee.querySelector('output a');
    if (dateReady && archive) archive.href = W.caseHref(date.elements.caseId.value,W.currentLink(),'#deadlines');
    if (feeReady && ledger) ledger.href = W.url('fees.html',{tab:'query',q:fee.elements.fee.value,from:W.currentLink()});
  }
  function showLinks() {
    syncReturnLinks();
    directory.hidden=view==='local';
    calcs.hidden=view==='official'||view==='professional';
    main.querySelectorAll('[data-tools-view]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.toolsView===view));
    if(directory.hidden) return;
    const groups = view === 'all' ? ['official','professional'] : [view];
    grid.innerHTML = groups.map(group => `<section class="wb-tool-group" aria-label="${styles[group]}">
      <h3>${styles[group]}</h3><ul>${links.filter(link=>link.group===group).map(link=>`<li>${toolLink(link)}</li>`).join('')}</ul></section>`).join('');
  }
  function toolLink(link) {
    const inside=`<span class="wb-record-icon">${W.icon(link.icon,17)}</span><span>
      <strong class="wb-wrap">${W.e(link.name)}</strong><span class="wb-small wb-muted">${W.e(link.description)}</span></span>`;
    return link.href?`<a class="wb-tool-link" href="${W.e(link.href)}" target="_blank" rel="noopener noreferrer">
      ${inside}${W.icon('arrow',15)}</a>`:`<div class="wb-tool-link">${inside}${W.chip('入口待配置')}</div>`;
  }
  function resetOutput(form,id) {
    form.querySelector('output').hidden=true;
    W.notify(form.querySelector('#'+id),'');
    syncReturnLinks();
  }
  main.addEventListener('click',event=>{
    const button=event.target.closest('[data-tools-view]');
    if(button) {view=button.dataset.toolsView;showLinks();}
  });
  date.elements.caseId.addEventListener('change',()=>{
    const record=selectedCase();
    date.elements.base.value=record?.officialDeadline || '';
    if(record && !record.officialDeadline)
      W.notify(date.querySelector('#calc-date-error'),'此案卷未登记官方绝限，可自填基准日期。','info');
  });
  date.addEventListener('input',()=>resetOutput(date,'calc-date-error'));
  fee.addEventListener('input',()=>resetOutput(fee,'calc-fee-error'));
  function calculateDate() {
    const base=date.elements.base.value;
    const offset=Number(date.elements.days.value);
    const source=new Date(base+'T00:00:00Z');
    const error=date.querySelector('#calc-date-error');
    if(!Number.isSafeInteger(offset)||!Number.isFinite(source.getTime())||
      !Number.isFinite(source.setUTCDate(source.getUTCDate()+offset))||
      source.getUTCFullYear()<1||source.getUTCFullYear()>9999) {
      W.notify(error,'请填写有效的日期和整数天数。','error');
      return;
    }
    const linked=selectedCase();
    const output=date.querySelector('output');
    W.notify(error,'');
    output.innerHTML=`<strong>${W.e(source.toISOString().slice(0,10))}</strong><span class="wb-small wb-muted">
      ${linked?`<a href="${W.e(W.caseHref(linked.id,W.currentLink(),'#deadlines'))}">查看案卷期限 ${W.e(linked.id)}</a>`:'按日历天数计算'}</span>`;
    output.hidden=false;
  }
  function calculateFee() {
    const row=bills.find(item=>item.id===fee.elements.fee.value);
    const quantity=Number(fee.elements.quantity.value);
    const cents=row ? Math.round(row.amount*100)*quantity : NaN;
    const error=fee.querySelector('#calc-fee-error');
    if(!row || quantity<1 || !Number.isSafeInteger(quantity) || !Number.isSafeInteger(cents)) {
      W.notify(error,'请选择参考账单并填写有效份数。','error');
      return;
    }
    const output=fee.querySelector('output');
    W.notify(error,'');
    output.innerHTML=`<strong>${W.e(F.money(cents/100,row.currency))}</strong><span class="wb-small wb-muted">
      ${W.e(F.money(row.amount,row.currency))} × ${quantity} 份 ·
      <a href="${W.e(W.url('fees.html',{tab:'query',q:row.id}))}">查看参考账单</a></span>`;
    output.hidden=false;
  }
  date.addEventListener('submit', event => { event.preventDefault(); calculateDate(); syncReturnLinks(); });
  fee.addEventListener('submit', event => { event.preventDefault(); calculateFee(); syncReturnLinks(); });
  if (params.has('base') && params.has('days')) {
    date.elements.caseId.value = params.get('case') || '';
    date.elements.base.value = params.get('base');
    date.elements.days.value = params.get('days');
    if (date.checkValidity()) calculateDate();
  }
  if (params.has('fee') && params.has('quantity')) {
    fee.elements.fee.value = params.get('fee');
    fee.elements.quantity.value = params.get('quantity');
    if (fee.checkValidity()) calculateFee();
  }
  showLinks();
});
