document.addEventListener('DOMContentLoaded', () => {
  const W = CaseWorkspace;
  const params = W.query();
  const id = params.get('id');
  const main = document.getElementById('main');
  const back = W.returnLink(params.get('from'), 'cases.html');
  const readOnly = W.pageName(back) === 'cc.html';
  const archiveOrigin = W.url('case-detail.html', { id, from: back });
  const taskLink = task => W.pageName(back) === (W.isComplete(task) ? 'done.html' : 'todo.html')
    && new URL(back, location.href).searchParams.get('task') === String(task.id) ? back : W.taskHref(task, archiveOrigin);
  let record = id && DataService.getCaseById(id);
  const backName = W.pageLabel(back);
  W.renderShell(W.navSection(back), [[backName, back], [id || '案卷详情']]);

  if (!record) {
    main.innerHTML = `<section class="wb-panel">
      <div class="wb-empty"><h1>未找到案件</h1>
        <p>${id ? '案卷 ' + W.e(id) + ' 不在当前演示数据中。' : '此链接缺少案号，请从案件清单重新打开。'}</p>
        <a class="wb-btn wb-btn-primary" href="${W.e(back)}">返回${backName}</a>
      </div></section>`;
    document.title = '未找到案件 · 小米商标管理系统';
    return;
  }
  if (readOnly) DataService.markCaseCopyRead(id);
  let dirty = false;
  let messageDirty = false;

  const labelStatus = { current: '当前节点', completed: '已完成', pending: '待开始', rejected: '驳回记录' };
  const yuan = amount => amount === undefined || amount === null || !Number.isFinite(Number(amount))
    ? '未登记'
    : new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 2 }).format(Number(amount));
  const field = (title, value, wide = false) => `<div class="${wide ? 'wb-field-wide' : ''}"><dt>${title}</dt><dd>${W.e(value || '未登记')}</dd></div>`;
  const section = (id, title, contents) => `<section class="wb-panel wb-detail-section" id="${id}" aria-labelledby="${id}-title">
    <div class="wb-panel-head"><h2 id="${id}-title">${title}</h2></div>${contents}</section>`;

  function timelineItem(entry) {
    return `<li class="${entry.status === 'current' ? 'is-current' : ''}">
      <div class="wb-title-line"><strong>${W.e(entry.title)}</strong>${entry.status === 'current' ? W.chip('当前节点', 'info') : ''}</div>
      <div class="wb-muted wb-small">${W.e([entry.date, entry.actor, labelStatus[entry.status]].filter(Boolean).join(' · '))}</div>
      ${entry.detail ? '<p class="wb-list-preserve">' + W.e(entry.detail) + '</p>' : ''}
    </li>`;
  }

  function taskRow(task) {
    const completed = W.isComplete(task);
    return `<li><div>
      ${readOnly ? `<strong>${W.e(task.title)}</strong>` : `<a class="wb-data-link" href="${W.e(taskLink(task))}">${W.e(task.title)}</a>`}
      <div class="wb-task-row-meta">
        ${W.taskStatus(task)}
        <span>${completed ? '完成日期' : '待办截止'} ${W.e((completed ? task.completedAt : task.deadline) || '未登记')}</span>
        <span>${W.e(task.assignee || '未分配')}</span>
      </div>
      ${task.note ? '<p class="wb-small wb-muted wb-list-preserve">' + W.e(task.note) + '</p>' : ''}
    </div>
    ${readOnly ? '' : `<a class="wb-btn wb-btn-quiet wb-btn-small" href="${W.e(taskLink(task))}">${completed ? '查看记录' : '处理待办'} ${W.icon('arrow', 14)}</a>`}</li>`;
  }

  function dateBadge(info) {
    return info.bucket === 'unknown' ? '' : W.chip(info.label, info.tone);
  }

  function officialDeadline(value) {
    const info = W.deadlineInfo(value);
    const parts = info.bucket === 'unknown' ? [] : value.split('-').map(Number);
    return `<div class="wb-official-band">
      <span class="wb-date-symbol" aria-hidden="true">${W.icon('calendar', 23)}</span>
      <dl class="wb-official-date"><dt>官方绝限</dt><dd>
        ${parts.length ? `<time class="wb-official-day wb-num" datetime="${W.e(value)}">${parts[0]}年${parts[1]}月${parts[2]}日</time>${dateBadge(info)}` : '未登记'}
      </dd></dl>
    </div>`;
  }

  function secondaryDeadline(label, value) {
    const info = W.deadlineInfo(value);
    return `<div class="wb-procedure-date">
      <dt>${label}</dt>
      <dd>${info.bucket === 'unknown' ? '<span class="wb-muted">未登记</span>'
        : `<time class="wb-num" datetime="${W.e(value)}">${W.e(value)}</time>${dateBadge(info)}`}</dd>
    </div>`;
  }

  function render() {
    document.title = record.brandName + ' · 案卷详情';
    const pending = W.relatedTasks(id).filter(task => !W.isComplete(task)).sort((a, b) => W.dateSort(a, b, 'deadline'));
    const completed = W.relatedTasks(id).filter(W.isComplete).sort((a, b) => W.compareText(b.completedAt, a.completedAt));
    const nextTask = pending[0];
    const current = (record.timeline || []).findLast(item => item.status === 'current');
    const linkedTask = nextTask || completed[0];
    const nextHref = linkedTask ? taskLink(linkedTask) : W.url('todo.html', { case: id, from: archiveOrigin });
    const nextLabel = nextTask ? '办理下一项' : completed.length ? '查看办理记录' : '查看关联待办';
    const documents = [...(record.documents || [])].reverse();
    const hasAgent = !readOnly && Boolean(record.lawFirmId || (record.lawFirmName && record.lawFirmName !== '-'));
    const timeline = (record.timeline || []).slice().reverse();
    const messages = (record.messages || []).slice().reverse();
    const fees = [record.feeTotal, record.feePaid, record.feePending];
    const editOpen = !readOnly && W.query().get('mode') === 'edit';
    const sealHref = W.url('seal-process.html', { case: id, from: archiveOrigin });
    const launchSealHref = W.url('seal-process.html', { case: id, action: 'new', from: archiveOrigin });
    const sealCount = readOnly ? 0 : DataService.getSealRequests(id).length;

    main.innerHTML = `
      <div class="wb-status" role="status" id="detail-notice"${params.get('created') === '1' ? ' data-kind="success"' : ''}>${params.get('created') === '1' ? '案件已创建 · ' + W.e(record.id) : ''}</div>
      ${readOnly ? '' : `<section class="wb-panel wb-edit" id="case-edit" aria-labelledby="case-edit-title"${editOpen ? '' : ' hidden'}>
        <div class="wb-panel-head"><h2 id="case-edit-title">编辑案卷</h2></div>
        <form class="wb-panel-body" id="case-edit-form" autocomplete="off">
          <div class="wb-fields wb-fields-3">
            <label class="wb-field">商标名称<input class="wb-input" name="brandName" value="${W.e(record.brandName)}" required maxlength="100"></label>
            <label class="wb-field">申请号<input class="wb-input" name="applicationNumber" value="${W.e(record.applicationNumber)}" maxlength="60" spellcheck="false"></label>
            <label class="wb-field">注册号<input class="wb-input" name="registrationNumber" value="${W.e(record.registrationNumber)}" maxlength="60" spellcheck="false"></label>
            <label class="wb-field">官方绝限<input class="wb-input" name="officialDeadline" type="date" value="${W.e(record.officialDeadline)}"></label>
            <label class="wb-field">内部期限<input class="wb-input" name="internalDeadline" type="date" value="${W.e(record.internalDeadline)}"></label>
            <label class="wb-field">办理状态<select class="wb-input" name="statusCode">
              ${Object.entries(DataService.STATUS_MAP).map(([code, data]) => `<option value="${W.e(code)}"${code === record.statusCode ? ' selected' : ''}>${W.e(data.label)}</option>`).join('')}
              ${Object.hasOwn(DataService.STATUS_MAP, record.statusCode) ? '' : `<option value="${W.e(record.statusCode)}" selected>${W.e(record.status || '未更新')}</option>`}
            </select></label>
          </div>
          <div class="wb-status" id="edit-error" role="alert"></div>
          <div class="wb-form-actions">
            <button class="wb-btn" id="cancel-edit" type="button">取消</button>
            <button class="wb-btn wb-btn-primary" type="submit">保存修改</button>
          </div>
        </form>
      </section>`}
      <div class="wb-folio">
        <div class="wb-folio-identity">
          <div class="wb-identity">
            ${W.thumb(record, true)}
            <div>
              <div class="wb-title-line"><h1 class="wb-wrap">${W.e(record.brandName || '未命名商标')}</h1>${W.caseStatus(record)}</div>
              <p class="wb-meta-line"><span class="wb-mono" translate="no">${W.e(record.id)}</span><span>${W.e(record.businessType || '未登记业务')}</span><span>${W.e(record.country || '未登记法域')}</span></p>
            </div>
          </div>
        </div>
        <section class="wb-folio-dates" id="deadlines" tabindex="-1" aria-label="案卷期限">
          ${officialDeadline(record.officialDeadline)}
          <dl class="wb-internal-date">${secondaryDeadline('内部期限', record.internalDeadline)}</dl>
        </section>
        <aside class="wb-docket" aria-labelledby="docket-heading">
          <h2 id="docket-heading">${W.icon('tasks', 18)} ${readOnly ? '当前办理节点' : '下一步'}</h2>
          <div class="wb-docket-body">
            <p class="wb-docket-title wb-wrap">${W.e(nextTask && !readOnly ? nextTask.title : current?.title || '暂无待跟进节点')}</p>
            ${nextTask && !readOnly ? `<p class="wb-task-owner"><span>负责人</span><strong>${W.e(nextTask.assignee || '未分配')}</strong></p>
              ${current?.title ? `<p class="wb-node wb-wrap">当前节点 · ${W.e(current.title)}</p>` : ''}
              <dl>${secondaryDeadline('待办截止', nextTask.deadline)}</dl>` : ''}
            ${readOnly ? '' : `<a class="wb-btn wb-btn-primary wb-docket-go" href="${W.e(nextHref)}">${nextLabel} ${W.icon('arrow', 15)}</a>`}
          </div>
          <div class="wb-actions wb-docket-tools">
            ${readOnly ? W.chip('抄送阅览', 'info') : `
            <button class="wb-btn" id="edit-case" type="button" aria-controls="case-edit" aria-expanded="${editOpen}">编辑案卷</button>
            <a class="wb-btn" href="${W.e(launchSealHref)}">${W.icon('stamp', 16)} 发起用印</a>`}
          </div>
        </aside>
        <section class="wb-folio-info" aria-labelledby="case-overview-title">
          <div class="wb-folio-info-head"><h2 id="case-overview-title">案件概况</h2><span class="wb-small wb-muted">更新于 ${W.e(record.updatedAt || '未登记')}</span></div>
          <dl class="wb-panel-body wb-key-values">
            ${field('负责人', record.responsibleUser)}
            ${field('代理律所', DataService.resolveCaseLawFirm(record)?.name || record.lawFirmName)}
            ${field('申请号', record.applicationNumber)}
            ${field('注册号', record.registrationNumber)}
            ${field('申请日', record.applicationDate)}
            ${field('尼斯分类', (record.niceClasses || []).map(value => '第 ' + value + ' 类').join('、') || record.niceClassNames)}
            ${record.applicant ? field('申请人', record.applicant, true) : ''}
            ${record.goodsServices ? field('商品与服务', record.goodsServices, true) : ''}
          </dl>
        </section>
      </div>
      <nav class="wb-section-nav" aria-label="案卷内容">
        <a href="#case-tasks">关联待办</a><a href="#progress">办理记录</a>
        <a href="#materials">案卷材料</a><a href="#case-fees">费用</a><a href="#case-notes">协作与备注</a>
      </nav>
      ${section('case-tasks', '关联待办', pending.length || completed.length
        ? '<ul class="wb-detail-tasks">' + [...pending, ...completed].map(taskRow).join('') + '</ul>'
        : readOnly ? '<p class="wb-panel-body wb-small wb-muted">暂无关联待办</p>'
          : W.empty('暂无关联待办', '可从待办事项为此案新建任务。', `<a class="wb-btn" href="${W.e(nextHref)}">前往待办</a>`))}
      ${section('progress', '办理记录', timeline.length
        ? '<ol class="wb-timeline">' + timeline.slice(0, 3).map(timelineItem).join('') + '</ol>'
          + (timeline.length > 3 ? `<details class="wb-disclose"><summary>查看其余 ${timeline.length - 3} 条记录</summary><ol class="wb-timeline" start="4">${timeline.slice(3).map(timelineItem).join('')}</ol></details>` : '')
        : W.empty('暂无办理记录', '录入办理结果后，可在关联待办查看处理历史。'))}
      ${section('materials', '案卷材料',
        (!readOnly ? `<div class="wb-panel-body wb-material-tools wb-actions">
          ${hasAgent ? `<a class="wb-btn wb-btn-small" href="${W.e(W.url('collab.html', { case: id }))}">${W.icon('firm', 14)} 前往律所协作</a>` : ''}
          <a class="wb-btn wb-btn-small" href="${W.e(W.url('doc-new.html', { case: id, from: archiveOrigin + '#materials' }))}">${W.icon('plus', 14)} 新建文档</a>
          <a class="wb-btn wb-btn-small" href="${W.e(sealHref)}">${W.icon('stamp', 14)} 用印记录（${sealCount}）</a></div>` : '') +
        '<div class="wb-status" id="document-notice" role="status"></div>' + (documents.length
        ? '<ul class="wb-docs">' + documents.map(item => `<li><div>
          <p class="wb-strong wb-wrap">${W.e(item.name)}</p>
          <p class="wb-small wb-muted">${W.e([item.typeLabel, item.firmName, item.uploadDate, item.size, item.version ? 'v' + item.version : ''].filter(Boolean).join(' · '))}</p>
          ${item.note ? '<p class="wb-small wb-list-preserve">' + W.e(item.note) + '</p>' : ''}
          </div><div class="wb-actions">
            ${item.source === 'lawfirm-return' ? W.chip('律所回传', 'positive') : W.chip(item.status === 'pending_review' ? '待审阅' : item.source === 'manual' ? '已归档' : '样例目录', item.status === 'pending_review' ? 'warning' : '')}
            ${item.fileKey ? `<button class="wb-btn wb-btn-small" type="button" data-download-document="${W.e(item.id)}" aria-label="下载 ${W.e(item.name)}">${W.icon('download', 14)} 下载</button>` : ''}
          </div></li>`).join('') + '</ul>'
        : W.empty('暂无案卷材料', '此案还没有模拟材料记录。')))}
      ${section('case-fees', '费用', '<dl class="wb-panel-body wb-key-values">' +
        field('费用合计', yuan(fees[0])) + field('已支付', yuan(fees[1])) + field('待支付', yuan(fees[2])) + '</dl>')}
      ${section('case-notes', '协作与备注', `
        ${readOnly ? '' : `<form class="wb-panel-body" id="case-note-form" autocomplete="off">
          <label class="wb-field">内部备注<textarea class="wb-input" name="note" rows="2" maxlength="500" required placeholder="记录需要同事了解的处理情况…"></textarea></label>
          <div class="wb-form-actions"><button class="wb-btn" type="submit">保存备注</button></div>
          <div class="wb-status" id="note-status" role="status"></div>
        </form>`}
        ${messages.length ? '<ol class="wb-timeline">' + messages.slice(0, 3).map(message => timelineItem({
          title: message.sender, date: message.date, detail: message.content
        })).join('') + '</ol>' : ''}
        ${messages.length > 3 ? `<details class="wb-disclose"><summary>查看其余 ${messages.length - 3} 条协作记录</summary><ol class="wb-timeline" start="4">${messages.slice(3).map(message => timelineItem({ title: message.sender, date: message.date, detail: message.content })).join('')}</ol></details>` : ''}`) }
    `;
  }

  function edit(open) {
    const state = W.query();
    if (open) state.set('mode', 'edit');
    else state.delete('mode');
    history.replaceState(null, '', W.url(location.pathname, Object.fromEntries(state)));
    document.getElementById('case-edit').hidden = !open;
    const trigger = document.getElementById('edit-case');
    trigger.setAttribute('aria-expanded', open);
    if (open) document.querySelector('#case-edit-form input').focus();
    else trigger.focus();
  }

  main.addEventListener('click', async event => {
    const download = event.target.closest('[data-download-document]');
    if (download) {
      const material = (record.documents || []).find(doc => doc.id === download.dataset.downloadDocument);
      if (!material?.fileKey) return;
      const notice = main.querySelector('#document-notice');
      download.disabled = true;
      try {
        await WorkbenchFiles.download(material.fileKey, material.fileName || material.name);
        W.notify(notice, '材料已开始下载。', 'success');
      } catch (error) {
        W.notify(notice, '当前浏览器找不到该文件，请在律所协作中重新回传。', 'error');
      } finally {
        download.disabled = false;
      }
      return;
    }
    if (readOnly) return;
    if (event.target.closest('#edit-case')) edit(true);
    if (event.target.closest('#cancel-edit')) {
      main.querySelector('#case-edit-form').reset();
      W.notify(main.querySelector('#edit-error'), '');
      dirty = false;
      edit(false);
    }
  });

  main.addEventListener('input', event => {
    if (event.target.form?.id === 'case-edit-form') dirty = true;
    if (event.target.form?.id === 'case-note-form') messageDirty = Boolean(event.target.value.trim());
  });

  window.addEventListener('beforeunload', event => {
    if (dirty || messageDirty) { event.preventDefault(); event.returnValue = ''; }
  });

  main.addEventListener('submit', event => {
    event.preventDefault();
    if (readOnly) return;
    const form = event.target;
    const values = Object.fromEntries(new FormData(form));
    if (form.id === 'case-edit-form') {
      const output = main.querySelector('#edit-error');
      const update = {
        brandName: values.brandName.trim(), applicationNumber: values.applicationNumber.trim(),
        registrationNumber: values.registrationNumber.trim(), officialDeadline: values.officialDeadline,
        internalDeadline: values.internalDeadline, statusCode: values.statusCode,
        status: DataService.STATUS_MAP[values.statusCode]?.label || record.status
      };
      if (!update.brandName) {
        W.notify(output, '请输入商标名称后再保存。', 'error');
        form.elements.brandName.focus();
        return;
      }
      if (update.officialDeadline && update.internalDeadline && update.internalDeadline > update.officialDeadline) {
        W.notify(output, '内部期限应早于或等于官方绝限，请核对后再保存。', 'error');
        form.elements.internalDeadline.focus();
        return;
      }
      const saved = DataService.updateCase(id, update);
      if (!saved) {
        W.notify(output, '浏览器未保存修改。输入已保留，请检查存储设置后重试。', 'error');
        return;
      }
      const draft = main.querySelector('#case-note-form textarea').value;
      dirty = false;
      record = saved;
      edit(false);
      render();
      main.querySelector('#case-note-form textarea').value = draft;
      W.notify(main.querySelector('#detail-notice'), '案卷修改已保存。', 'success');
      main.querySelector('#edit-case').focus({ preventScroll: true });
    }
    if (form.id === 'case-note-form') {
      const note = values.note.trim();
      if (!note) {
        W.notify(main.querySelector('#note-status'), '请输入备注后再保存。', 'error');
        form.elements.note.focus();
        return;
      }
      const messages = [...(record.messages || []), {
        id: DataService.generateId('msg'), sender: 'Missy', senderType: 'internal', content: note,
        date: DataService.getToday(), type: 'message'
      }];
      const saved = DataService.updateCase(id, { messages });
      if (!saved) {
        W.notify(main.querySelector('#note-status'), '备注未保存。请检查浏览器存储设置后重试。', 'error');
        return;
      }
      const editForm = main.querySelector('#case-edit-form');
      const draft = Object.fromEntries(new FormData(editForm));
      record = saved;
      messageDirty = false;
      render();
      if (dirty) Object.entries(draft).forEach(([key, value]) => { main.querySelector('#case-edit-form').elements[key].value = value; });
      W.notify(main.querySelector('#note-status'), '内部备注已保存。', 'success');
      main.querySelector('#case-note-form textarea').focus({ preventScroll: true });
    }
  });

  window.addEventListener('pageshow', event => {
    const latest = event.persisted && DataService.getCaseById(id);
    if (latest && !dirty && !messageDirty) {
      record = latest;
      render();
    }
  });
  render();
  if (!readOnly && params.get('mode') === 'edit') main.querySelector('#case-edit-form input').focus();
  if (location.hash) requestAnimationFrame(() => {
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'nearest' });
  });
});
