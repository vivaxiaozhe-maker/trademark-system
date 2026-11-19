document.addEventListener('DOMContentLoaded', () => {
  const W = CaseWorkspace;
  const D = DataService;
  const main = document.getElementById('main');
  const params = W.query();
  const back = W.returnLink(params.get('from'), 'cases.html');
  const cases = W.allCases().filter(record => record.enabled !== false);
  const caseId = params.get('case');
  const types = { legal: '法律文件', evidence: '证据材料', official: '官方文件', internal: '内部文件' };
  const options = cases.map(record => `<option value="${W.e(record.id)}">${W.e(record.brandName)} · ${W.e(record.id)}</option>`).join('');

  W.renderShell(W.navSection(back), [[W.pageLabel(back), back], ['新建文档']]);
  main.innerHTML = `<div class="wb-head">
    <div><h1>新建文档</h1><p class="wb-subtitle">把文档摘要和选填附件归档到同一案卷。</p></div>
    <div class="wb-actions"><a class="wb-btn" href="${W.e(back)}">返回${W.e(W.pageLabel(back))}</a></div>
  </div>
  <form class="wb-panel" id="archive-document" aria-labelledby="archive-doc-title" autocomplete="off">
    <div class="wb-panel-head"><h2 id="archive-doc-title">文档信息</h2></div>
    <div class="wb-panel-body">
      <div class="wb-fields">
        <label class="wb-field wb-field-wide">关联案卷<select required name="caseId" class="wb-input"><option value="">选择案卷</option>${options}</select></label>
        <label class="wb-field">文档类型<select name="type" class="wb-input">${Object.entries(types).map(([id, name]) => `<option value="${id}">${name}</option>`).join('')}</select></label>
        <label class="wb-field">文档名称<input required name="name" class="wb-input" maxlength="120" placeholder="例如，云智法务意见…"></label>
        <label class="wb-field wb-field-wide">文档摘要<textarea required name="note" class="wb-input" rows="4" maxlength="1000"></textarea></label>
        <label class="wb-field wb-field-wide">附件（选填）<input type="file" name="file" class="wb-input wb-file-input" accept=".pdf,.docx,.png,.jpg,.jpeg,.txt"><span class="wb-small wb-muted">单个文件不超过 10 MB，保存在当前浏览器。</span></label>
      </div>
      <div class="wb-status" id="archive-doc-notice" role="status"></div>
      <div class="wb-form-actions"><button class="wb-btn wb-btn-primary" type="submit">${W.icon('check', 15)} 归档到案卷</button></div>
    </div>
  </form>`;
  const form = main.querySelector('#archive-document');
  const notice = main.querySelector('#archive-doc-notice');
  const submit = form.querySelector('button[type="submit"]');
  if (cases.some(record => record.id === caseId)) form.elements.caseId.value = caseId;
  let dirty = false;
  form.addEventListener('input', () => { dirty = true; });
  window.addEventListener('beforeunload', event => {
    if (dirty) { event.preventDefault(); event.returnValue = ''; }
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const fields = form.elements;
    const id = fields.caseId.value;
    const name = fields.name.value.trim();
    const note = fields.note.value.trim();
    const type = fields.type.value;
    const file = fields.file.files[0];
    if (submit.disabled) return;
    if (!name || !note) {
      W.notify(notice, '请填写文档名称和摘要。', 'error');
      fields[name ? 'note' : 'name'].focus();
      return;
    }
    if (file && (!/\.(pdf|docx|png|jpe?g|txt)$/i.test(file.name) || file.size > 10 * 1024 * 1024)) {
      W.notify(notice, '请选用 10 MB 以内的 PDF、DOCX、图片或 TXT。', 'error');
      fields.file.focus();
      return;
    }
    const documentId = D.generateId('manual-doc');
    const fileKey = file ? documentId : '';
    submit.disabled = true;
    try {
      if (fileKey) await WorkbenchFiles.put(fileKey, file);
      const saved = D.addCaseDocument(id, {
        id: documentId, name, note, type, typeLabel: types[type], source: 'manual', fileKey,
        fileName: file?.name, size: file ? Math.max(1, Math.ceil(file.size / 1024)) + ' KB' : '',
        status: 'normal', statusLabel: '已归档'
      });
      if (!saved) throw new Error('保存失败');
      dirty = false;
      const origin = new URL(back, location.href);
      const sameCase = W.pageName(back) === 'case-detail.html' && origin.searchParams.get('id') === id;
      location.assign(sameCase ? back : W.caseHref(id, 'cases.html', '#materials'));
    } catch {
      if (fileKey) await WorkbenchFiles.remove(fileKey).catch(() => {});
      W.notify(notice, '文档未归档。输入已保留，请检查浏览器存储后重试。', 'error');
      submit.disabled = false;
    }
  });
});
