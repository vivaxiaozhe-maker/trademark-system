document.addEventListener('DOMContentLoaded', () => {
  const W = CaseWorkspace;
  const main = document.getElementById('main');
  const params = W.query();
  const back = W.returnLink(params.get('from'), 'cases.html');
  let draftKey = params.get('draft');
  const user = DataService.CURRENT_USER;
  const backName = W.pageLabel(back);
  if (draftKey) {
    const submitted = DataService.getCaseFromDraft(draftKey);
    if (submitted) {
      location.replace(W.caseHref(submitted.id, back));
      return;
    }
  }
  const draft = draftKey ? DataService.getCaseDrafts().find(item => item.id === draftKey) : null;
  const heading = draftKey ? '续编案件草稿' : '新建案件';
  W.renderShell(W.navSection(back), [[backName, back], [heading]]);
  if (draftKey && !draft) {
    main.innerHTML = '<section class="wb-panel">' + W.empty('未找到这份草稿', '可回到我的草稿，重新选择要续编的案件。',
      '<a class="wb-btn wb-btn-primary" href="drafts.html">返回我的草稿</a>') + '</section>';
    return;
  }
  const registration = draft?.data;
  const hasRegistration = registration && (registration.applicationNumber || registration.registrationNumber
    || registration.applicationDate || (registration.statusCode && registration.statusCode !== 'preparing'));
  const businessTypes = {
    new_apply: '新申请', rejection: '驳回复审', transfer_renewal: '续展',
    opposition: '异议申请', rights_protection: '维权相关', madrid: '国际申请', litigation: '商标诉讼'
  };
  const regions = ['中国', '中国香港', '中国澳门', '中国台湾', '美国', '欧盟', '英国', '日本', '韩国', '德国', '国际注册（马德里体系）', '其他法域'];
  const owners = new Map([[user.id, user.name]]);
  W.allCases().forEach(record => {
    if (record.responsibleUserId && record.responsibleUser) owners.set(record.responsibleUserId, record.responsibleUser);
  });
  const firms = DataService.getLawFirms();
  const selectOptions = items => Array.from(items, ([key, label]) => `<option value="${W.e(key)}">${W.e(label)}</option>`).join('');

  main.innerHTML = `
    <div class="wb-head">
      <h1>${heading}</h1>
      <div class="wb-actions"><a class="wb-btn wb-jump-summary" href="#intake-review">核对与保存</a><a class="wb-btn" href="${W.e(back)}">返回${backName}</a></div>
    </div>
    <form class="wb-entry-grid" id="create-case" autocomplete="off">
      <div class="wb-section-stack">
        <section class="wb-panel" aria-labelledby="create-basics">
          <div class="wb-panel-head"><h2 id="create-basics">案件基本信息</h2><span class="wb-small wb-muted">带 * 为必填项</span></div>
          <div class="wb-panel-body wb-fields">
            <label class="wb-field">商标名称 *<input class="wb-input" name="brandName" required maxlength="100" placeholder="例如，澄川…"></label>
            <label class="wb-field">申请人<input class="wb-input" name="applicant" maxlength="120" placeholder="申请人或企业名称…"></label>
            <label class="wb-field">国家或地区 *<select class="wb-input" name="country" required>${selectOptions(regions.map(region => [region, region]))}</select></label>
            <label class="wb-field">业务类型 *<select class="wb-input" name="businessTypeCode" required>${selectOptions(Object.entries(businessTypes))}</select></label>
            <label class="wb-field wb-field-wide">尼斯分类<input class="wb-input" name="niceClasses" maxlength="130" placeholder="例如，9、35、42…" spellcheck="false"></label>
            <label class="wb-field wb-field-wide">商品与服务<textarea class="wb-input" name="goodsServices" rows="2" maxlength="1000" placeholder="填写涉及的商品或服务…"></textarea></label>
          </div>
        </section>
        <section class="wb-panel" aria-labelledby="create-assignment">
          <div class="wb-panel-head"><h2 id="create-assignment">办理人与期限</h2></div>
          <div class="wb-panel-body wb-fields">
            <label class="wb-field">负责人 *<select class="wb-input" name="responsibleUserId" required>${selectOptions(owners)}</select></label>
            <label class="wb-field">代理律所<select class="wb-input" name="lawFirmId"><option value="">暂不委托</option>${selectOptions(firms.map(firm => [firm.id, firm.name]))}</select></label>
            <label class="wb-field">官方绝限<input class="wb-input" name="officialDeadline" type="date"></label>
            <label class="wb-field">内部期限<input class="wb-input" name="internalDeadline" type="date"></label>
            <label class="wb-field wb-field-wide">办理说明<textarea class="wb-input" name="description" rows="2" maxlength="500" placeholder="填写当前进展或下一步…"></textarea></label>
          </div>
        </section>
        <details class="wb-panel wb-registration"${hasRegistration ? ' open' : ''}>
          <summary><span>官方登记信息</span><small>可后补</small></summary>
          <div class="wb-panel-body wb-fields">
            <label class="wb-field">申请号<input class="wb-input" name="applicationNumber" maxlength="60" spellcheck="false"></label>
            <label class="wb-field">注册号<input class="wb-input" name="registrationNumber" maxlength="60" spellcheck="false"></label>
            <label class="wb-field">申请日<input class="wb-input" name="applicationDate" type="date"></label>
            <label class="wb-field">案件状态<select class="wb-input" name="statusCode">${selectOptions(Object.entries(DataService.STATUS_MAP).map(([code, status]) => [code, status.label]))}</select></label>
          </div>
        </details>
      </div>
      <section class="wb-panel wb-entry-summary" id="intake-review" tabindex="-1" aria-labelledby="create-summary">
        <div class="wb-panel-head"><h2 id="create-summary">${W.icon('file', 17)} 建案摘要</h2></div>
        <div class="wb-panel-body">
          <div class="wb-entry-preview">
            <p class="wb-muted wb-small">商标名称</p><strong id="preview-brand" class="wb-wrap">待填写</strong>
          </div>
          <dl class="wb-key-values wb-entry-preview-meta">
            <div><dt>法域</dt><dd id="preview-country"></dd></div>
            <div><dt>业务类型</dt><dd id="preview-type"></dd></div>
            <div><dt>负责人</dt><dd id="preview-owner"></dd></div>
            <div><dt>代理律所</dt><dd id="preview-firm"></dd></div>
          </dl>
          <dl class="wb-key-values wb-review-dates">
            <div><dt>官方绝限</dt><dd id="preview-deadline"></dd></div>
            <div><dt>内部期限</dt><dd id="preview-internal"></dd></div>
          </dl>
          <div class="wb-status" role="status" id="create-notice"></div>
          <p class="wb-small wb-muted wb-number-hint">内部案号在建案时生成。</p>
          <div class="wb-entry-actions">
            <button class="wb-btn wb-btn-primary" type="submit">保存并进入案卷 ${W.icon('arrow', 15)}</button>
            <button class="wb-btn" type="button" id="save-case-draft">保存草稿</button>
          </div>
        </div>
      </section>
    </form>`;

  const form = main.querySelector('#create-case');
  const notice = main.querySelector('#create-notice');
  let dirty = false;
  form.elements.statusCode.value = 'preparing';
  if (draft?.data) {
    Object.entries(draft.data).forEach(([name, value]) => {
      if (form.elements.namedItem(name)) form.elements.namedItem(name).value = value;
    });
    W.notify(notice, '已恢复上次保存的草稿。', 'success');
  }

  function updateSummary() {
    const values = Object.fromEntries(new FormData(form));
    const summary = {
      brand: values.brandName.trim() || '待填写', country: values.country,
      type: businessTypes[values.businessTypeCode], owner: owners.get(values.responsibleUserId),
      firm: firms.find(firm => firm.id === values.lawFirmId)?.name || '暂不委托',
      deadline: values.officialDeadline || '未登记', internal: values.internalDeadline || '未登记'
    };
    Object.entries(summary).forEach(([key, value]) => { main.querySelector('#preview-' + key).textContent = value; });
  }

  form.addEventListener('input', () => { dirty = true; updateSummary(); });
  main.querySelector('#save-case-draft').addEventListener('click', () => {
    const key = draftKey || 'case-draft-' + DataService.generateId('new');
    const saved = DataService.saveDraft(key, Object.fromEntries(new FormData(form)));
    if (saved) {
      draftKey = key;
      dirty = false;
      W.replaceQuery({ draft: key, from: back });
    }
    W.notify(notice, saved ? '草稿已保存，可从我的草稿继续编辑。' : '草稿未保存。请检查浏览器存储后重试。', saved ? 'success' : 'error');
  });
  window.addEventListener('beforeunload', event => {
    if (dirty) { event.preventDefault(); event.returnValue = ''; }
  });

  function report(field, message) {
    W.notify(notice, message, 'error');
    form.elements[field].focus();
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const brandName = values.brandName.trim();
    const officialDeadline = values.officialDeadline;
    const internalDeadline = values.internalDeadline;
    const rawClasses = values.niceClasses.trim().split(/[、，,；;\s]+/).filter(Boolean);
    if (!brandName) return report('brandName', '请填写商标名称。');
    if (rawClasses.some(value => !/^\d{1,2}$/.test(value) || Number(value) < 1 || Number(value) > 45)) {
      return report('niceClasses', '尼斯分类请填写 1 至 45 的整数。多个类别可用逗号分开。');
    }
    if (officialDeadline && internalDeadline && internalDeadline > officialDeadline) {
      return report('internalDeadline', '内部期限应早于或等于官方绝限。');
    }
    const firm = firms.find(item => item.id === values.lawFirmId);
    const id = DataService.nextCaseNumber();
    const today = DataService.getToday();
    const statusCode = values.statusCode;
    const niceClasses = [...new Set(rawClasses.map(Number))].sort((a, b) => a - b);
    const valuesToSave = {
      id, brandName, applicant: values.applicant.trim(), country: values.country,
      type: values.country === '中国' ? 'domestic' : 'overseas',
      businessType: businessTypes[values.businessTypeCode], businessTypeCode: values.businessTypeCode,
      status: DataService.STATUS_MAP[statusCode].label, statusCode,
      niceClasses, niceClassNames: niceClasses.join(', '), goodsServices: values.goodsServices.trim(),
      description: values.description.trim(), applicationNumber: values.applicationNumber.trim(),
      registrationNumber: values.registrationNumber.trim(), applicationDate: values.applicationDate,
      officialDeadline, internalDeadline, responsibleUserId: values.responsibleUserId,
      responsibleUser: owners.get(values.responsibleUserId), lawFirmId: firm?.id || '', lawFirmName: firm?.name || '',
      savedAt: new Date().toISOString(), documents: [], messages: [],
      timeline: [{ id: 'tl-' + id, title: '案件建档', date: today, actor: user.name, status: 'completed', detail: values.description.trim() }]
    };
    const record = draftKey ? DataService.createCaseFromDraft(draftKey, valuesToSave) : DataService.createCase(valuesToSave);
    if (!record) {
      W.notify(notice, '案件未保存，输入已保留。请检查浏览器存储后重试。', 'error');
      return;
    }
    dirty = false;
    location.replace(W.url('case-detail.html', { id: record.id, from: back, created: '1' }));
  });

  updateSummary();
});
