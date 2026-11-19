document.addEventListener('DOMContentLoaded', () => {
  const W = CaseWorkspace;
  const main = document.getElementById('main');
  const params = W.query();
  const drafts = new Map();
  const firms = DataService.getLawFirms();
  const types = ['代理意见', '申请材料', '官文', '证据材料', '回执', '其他'];
  const filters = { firm: params.get('firm') || '', q: params.get('q') || '', case: params.get('case') || '' };
  const firmFor = record => DataService.resolveCaseLawFirm(record, firms);
  let selected;
  let listExpanded = false;
  let busy = false;

  W.renderShell('collab.html', [['律所协作']]);
  main.innerHTML = `
    <div class="wb-head">
      <h1>律所协作</h1>
      <div class="wb-actions"><a class="wb-btn" href="law-firm-management.html">${W.icon('firm')} 合作律所</a></div>
    </div>
    <div class="wb-panel wb-metrics wb-collab-metrics" id="collab-summary" aria-label="律所协作概况"></div>
    <div class="wb-collab-grid">
      <section class="wb-panel" aria-labelledby="firm-case-list">
        <div class="wb-panel-head"><div><h2 id="firm-case-list">受托案卷</h2><p class="wb-small wb-muted" id="firm-case-count" role="status"></p></div>
          <label class="wb-inline-select"><span class="wb-sr">按律所筛选</span><select id="firm-select" class="wb-input" name="firm"></select></label>
        </div>
        <div class="wb-filter"><label class="wb-search">${W.icon('search')}
          <span class="wb-sr">搜索受托案卷</span><input id="firm-query" name="q" type="search" placeholder="搜索商标、案号或律所…" maxlength="100" autocomplete="off" spellcheck="false"></label></div>
        <div id="firm-cases"></div>
        <button type="button" class="wb-btn wb-btn-quiet wb-picker-toggle" id="toggle-commissions" aria-controls="firm-cases" aria-expanded="false" hidden></button>
      </section>
      <section class="wb-panel wb-firm-send" id="firm-send" aria-labelledby="firm-send-title" tabindex="-1"></section>
    </div>`;

  const select = main.querySelector('#firm-select');
  const search = main.querySelector('#firm-query');
  const target = main.querySelector('#firm-send');
  select.innerHTML = '<option value="">全部律所</option>' + firms.map(firm =>
    `<option value="${W.e(firm.id)}">${W.e(firm.name)}</option>`).join('');
  if (!firms.some(firm => firm.id === filters.firm)) filters.firm = '';
  select.value = filters.firm;
  search.value = filters.q;

  const submitted = record => (record.documents || []).filter(doc => doc.source === 'lawfirm-return');

  function available() {
    return W.allCases().filter(record => record.enabled !== false && firmFor(record));
  }

  function metric(label, value) {
    return `<div class="wb-metric"><span class="wb-metric-label">${label}</span><strong class="wb-metric-value">${value}</strong></div>`;
  }

  function row(record) {
    const firm = firmFor(record);
    const active = selected?.id === record.id;
    return `<li><button type="button" class="wb-firm-case${active ? ' is-selected' : ''}" data-case="${W.e(record.id)}"
      aria-pressed="${active}" aria-controls="firm-send">
      ${W.thumb(record)}
      <span class="wb-wrap"><strong>${W.e(record.brandName)}</strong>
        <span class="wb-workspace-meta wb-mono">${W.e(record.id)}</span>
        <span class="wb-workspace-meta">${W.e(firm.name)}</span></span>
      <span class="wb-firm-case-date"><span class="wb-small wb-muted">官方绝限</span>${W.dateMarkup(record.officialDeadline)}</span>
      ${W.icon('chevron', 15)}
    </button></li>`;
  }

  function renderPanel(completed) {
    if (!selected) {
      target.innerHTML = `<div class="wb-panel-head"><h2 id="firm-send-title">材料回传</h2></div>${W.empty('请先选择案卷', '只有已委托律所的案卷可以回传材料。')}`;
      return;
    }
    const record = selected;
    const firm = firmFor(record);
    const history = submitted(record).slice().reverse();
    const draft = drafts.get(record.id) || {};
    const href = W.caseHref(record.id, W.currentLink(), '#materials');
    target.innerHTML = `
      <div class="wb-panel-head">
        <h2 id="firm-send-title">${W.icon('file', 17)} 材料回传</h2><a class="wb-btn wb-btn-quiet wb-btn-small" href="${W.e(href)}">查看案卷材料 ${W.icon('arrow', 14)}</a></div>
      <form class="wb-panel-body wb-firm-form" id="send-material" autocomplete="off">
        <div class="wb-delivery-target">
          ${W.thumb(record)}<div class="wb-wrap"><span class="wb-small wb-muted">回传至</span>
            <strong>${W.e(record.brandName)}</strong> <span class="wb-mono" translate="no">${W.e(record.id)}</span>
            <p class="wb-small wb-muted">${W.e(firm.name)}</p>
          </div>
        </div>
        <div class="wb-status" role="status" aria-live="polite" id="material-notice"></div>
        <label class="wb-field">材料类型<select class="wb-input" name="kind">${types.map(type => `<option>${type}</option>`).join('')}</select></label>
        <div class="wb-file-box">
          <label class="wb-field">材料文件<input class="wb-input wb-file-input" name="file" type="file" accept=".pdf,.docx,.png,.jpg,.jpeg,.txt"></label>
          <p class="wb-muted wb-small">PDF、DOCX、图片或 TXT，单个文件不超过 10 MB。文件保存在当前浏览器。</p>
          <div class="wb-actions"><button type="button" class="wb-btn wb-btn-small" id="select-sample">${W.icon('file', 14)} 使用示例材料</button>
            <span class="wb-small wb-muted wb-wrap" id="selected-material">${draft.file ? '已选 ' + W.e(draft.file.name) : ''}</span></div>
        </div>
        <label class="wb-field">回传说明<textarea class="wb-input" name="note" rows="2" maxlength="500" placeholder="补充本次材料的用途或变更…">${W.e(draft.note || '')}</textarea></label>
        <div class="wb-form-actions"><button class="wb-btn wb-btn-primary" type="submit">${W.icon('check', 15)} 回传到案卷</button></div>
      </form>
      <div class="wb-panel-head wb-firm-history"><h3>本案回传记录</h3><span class="wb-small wb-muted">${history.length} 份</span></div>
      ${history.length ? '<ul class="wb-docs">' + history.map(item => `<li><div class="wb-wrap">
        <strong>${W.e(item.name)}</strong><span class="wb-workspace-meta">${W.e(item.uploadDate)} · v${W.e(item.version)} · ${W.e(item.typeLabel)}</span>
      </div><a class="wb-btn wb-btn-quiet wb-btn-small" href="${W.e(href)}">在案卷查看</a></li>`).join('') + '</ul>'
        : '<p class="wb-panel-body wb-small wb-muted">暂无回传材料。</p>'}`;
    if (draft.kind) target.querySelector('select[name="kind"]').value = draft.kind;
    if (completed) W.notify(target.querySelector('#material-notice'), '已回传 ' + completed.name + '，可在案卷材料中查看。', 'success');
  }

  function render({ focus = false, completed } = {}) {
    const all = available();
    const keyword = W.searchText(filters.q);
    const visible = all.filter(record => {
      const firm = firmFor(record);
      return (!filters.firm || filters.firm === firm.id) &&
        [record.id, record.brandName, firm.name].some(value => W.searchText(value).includes(keyword));
    }).sort((a, b) => W.dateSort(a, b, 'officialDeadline') || W.compareText(a.id, b.id));
    selected = visible.find(record => record.id === filters.case) ||
      (!filters.firm && !keyword && !filters.case ? visible.find(record => record.id === 'TM-2026-0042') : null) ||
      visible[0];
    filters.case = selected?.id || '';
    W.replaceQuery(filters);
    main.querySelector('#collab-summary').innerHTML = metric('合作律所', firms.length) + metric('受托案卷', all.length)
      + metric('已回传材料', W.allCases().reduce((sum, record) => sum + submitted(record).length, 0));
    main.querySelector('#firm-case-count').textContent = visible.length + ' 件';
    main.querySelector('#firm-cases').innerHTML = visible.length
      ? '<ul class="wb-home-list">' + visible.map(row).join('') + '</ul>'
      : W.empty('暂无匹配案卷', '可清空检索，或在建案时选择代理律所。');
    updatePicker(visible.length);
    renderPanel(completed);
    if (focus) target.focus({ preventScroll: !matchMedia('(max-width: 760px)').matches });
  }

  const caseList = main.querySelector('#firm-cases');
  const picker = main.querySelector('#toggle-commissions');
  function updatePicker(count) {
    caseList.classList.toggle('show-all', listExpanded);
    picker.hidden = count < 2;
    picker.setAttribute('aria-expanded', String(listExpanded));
    picker.textContent = listExpanded ? '收起案卷清单' : '切换受托案卷（' + count + '）';
  }

  function updateDraft(changes) {
    if (selected) drafts.set(selected.id, { ...drafts.get(selected.id), ...changes });
  }

  search.addEventListener('input', () => {
    if (busy) { search.value = filters.q; return; }
    listExpanded = true;
    filters.q = search.value;
    render();
  });
  select.addEventListener('change', () => {
    if (busy) { select.value = filters.firm; return; }
    listExpanded = true;
    filters.firm = select.value;
    render();
  });

  main.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || busy) return;
    if (button === picker) {
      listExpanded = !listExpanded;
      updatePicker(caseList.querySelectorAll('[data-case]').length);
      if (listExpanded) caseList.querySelector('[aria-pressed="true"]')?.focus();
    }
    if (button.dataset.case) {
      listExpanded = false;
      filters.case = button.dataset.case;
      render({ focus: true });
    }
    if (button.id === 'select-sample' && selected) {
      target.querySelector('input[name="file"]').value = '';
      const sample = new File(['商标工作台模拟材料\n\n案卷：' + selected.brandName + ' ' + selected.id + '\n内容：确认委托范围、核对材料清单并登记回传。'],
        '材料核对清单.txt', { type: 'text/plain' });
      updateDraft({ file: sample });
      target.querySelector('#selected-material').textContent = '已选 ' + sample.name + '（示例）';
    }
  });
  target.addEventListener('input', event => {
    const input = event.target;
    if (input.name === 'note' || input.name === 'kind') updateDraft({ [input.name]: input.value });
  });
  target.addEventListener('change', event => {
    if (event.target.name !== 'file') return;
    const file = event.target.files[0];
    updateDraft({ file });
    target.querySelector('#selected-material').textContent = file ? '已选 ' + file.name : '';
  });

  target.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !selected) return;
    const form = event.target;
    const values = Object.fromEntries(new FormData(form));
    const notice = target.querySelector('#material-notice');
    const record = selected;
    const file = drafts.get(record.id)?.file;
    if (!file || !file.size || file.size > 10 * 1024 * 1024 || !/\.(pdf|docx|png|jpe?g|txt)$/i.test(file.name)) {
      W.notify(notice, '请选择非空的 PDF、DOCX、图片或 TXT 文件，大小不超过 10 MB。', 'error');
      form.elements.file.focus();
      return;
    }
    const firm = firmFor(record);
    const id = DataService.generateId('document');
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    busy = true;
    W.notify(notice, '正在保存材料…');
    let stored = false;
    let saved;
    try {
      await WorkbenchFiles.put(id, file);
      stored = true;
      const size = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 1 }).format(
        file.size < 1024 * 1024 ? Math.max(file.size / 1024, 0.1) : file.size / (1024 * 1024)
      ) + (file.size < 1024 * 1024 ? ' KB' : ' MB');
      saved = DataService.addCaseDocument(record.id, {
        id, name: file.name, type: 'lawfirm', typeLabel: values.kind, size,
        firmId: firm.id, firmName: firm.name, note: values.note.trim(), fileKey: id,
        source: 'lawfirm-return', status: 'received'
      });
      if (!saved) throw new Error('案卷未保存');
    } catch (error) {
      if (stored) await WorkbenchFiles.remove(id).catch(() => {});
      W.notify(notice, '材料未回传。已保留输入，请检查浏览器存储后重试。', 'error');
      submit.disabled = false;
    } finally {
      busy = false;
    }
    if (saved) {
      drafts.delete(record.id);
      render({ focus: true, completed: saved });
    }
  });
  window.addEventListener('beforeunload', event => {
    if (busy || [...drafts.values()].some(draft => draft.file || draft.note?.trim())) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
  window.addEventListener('pageshow', event => { if (event.persisted && !busy) render(); });
  render();
});
