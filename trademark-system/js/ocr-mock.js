/**
 * OCR 智能识别 Mock 数据源
 * 纯前端模拟：上传文件后随机返回一组识别结果
 */
const OCRMock = {
  // 按文件类型分类的模拟识别结果
  results: [
    {
      type: 'rejection_notice',
      typeLabel: '驳回通知书',
      confidence: 96,
      fields: {
        brandName: '云智',
        appNo: '20260115001',
        niceClasses: ['9', '35'],
        applicant: '深圳市唯德科创信息有限公司',
        goodsServices: '计算机软件出租;计算机游戏软件的设计和开发;计算机软件维护和更新;为他人提供计算机软件设计;计算机设备出租',
        rejectionReason: '该商标与下列在先商标相同或近似：第79480607号"智云"、第80893707号"云智达"...',
        officialDate: '2025-01-15',
        officialDeadline: '2025-01-25'
      }
    },
    {
      type: 'acceptance_notice',
      typeLabel: '受理通知书',
      confidence: 98,
      fields: {
        brandName: '智联',
        appNo: '20260320003',
        niceClasses: ['38', '42'],
        applicant: '上海智联信息技术有限公司',
        goodsServices: '电信服务;计算机编程;数据存储;云计算;信息技术咨询',
        rejectionReason: '',
        officialDate: '2026-03-25',
        officialDeadline: ''
      }
    },
    {
      type: 'registration_certificate',
      typeLabel: '商标注册证',
      confidence: 99,
      fields: {
        brandName: '海翼',
        appNo: '20250815002',
        niceClasses: ['12', '35'],
        applicant: '北京海翼科技有限公司',
        goodsServices: '车辆轮胎;婴儿车;航空装置;广告;商业管理辅助',
        rejectionReason: '',
        officialDate: '2026-02-10',
        officialDeadline: ''
      }
    },
    {
      type: 'opposition_notice',
      typeLabel: '异议答辩通知书',
      confidence: 94,
      fields: {
        brandName: '星联',
        appNo: '20251110002',
        niceClasses: ['9'],
        applicant: '深圳市星联电子有限公司',
        goodsServices: '智能手机;智能手表;平板电脑;耳机;充电器',
        rejectionReason: '被异议人认为异议人的商标与引证商标构成近似...',
        officialDate: '2025-08-20',
        officialDeadline: '2025-08-30'
      }
    }
  ],

  /**
   * 字段映射配置
   * key: OCR 字段名
   * label: 显示名称
   * targetIds: 可能对应的 DOM 元素 ID 列表（按优先级）
   */
  fieldMap: {
    brandName:       { label: '商标名称',  targetIds: ['brandName', 'editBrandName'] },
    appNo:           { label: '申请号',    targetIds: ['appNo'] },
    niceClasses:     { label: '商标类别',  targetIds: ['niceClassInput'] },
    applicant:       { label: '申请人',    targetIds: ['applicant', 'applicantNew', 'applicantAddr'] },
    goodsServices:   { label: '商品/服务', targetIds: ['goodsServicesNew', 'tmDesc', 'rejectedGoods'] },
    rejectionReason: { label: '驳回理由',  targetIds: ['rejectionReason'] },
    officialDate:    { label: '官方发文日', targetIds: ['rejectionDocDate'] },
    officialDeadline:{ label: '官方期限',  targetIds: ['rejectionDeadline', 'editDeadline', 'officialDeadline'] }
  },

  /**
   * 模拟识别：随机返回一组结果
   * @param {string} fileName - 上传的文件名（用于简单匹配类型）
   * @returns {Object} 识别结果
   */
  recognize(fileName) {
    const name = (fileName || '').toLowerCase();
    let candidates = this.results;
    // 简单根据文件名匹配类型
    if (name.includes('驳回') || name.includes('rejection')) {
      candidates = this.results.filter(r => r.type === 'rejection_notice');
    } else if (name.includes('受理') || name.includes('acceptance')) {
      candidates = this.results.filter(r => r.type === 'acceptance_notice');
    } else if (name.includes('注册证') || name.includes('certificate')) {
      candidates = this.results.filter(r => r.type === 'registration_certificate');
    } else if (name.includes('异议') || name.includes('opposition')) {
      candidates = this.results.filter(r => r.type === 'opposition_notice');
    }
    if (candidates.length === 0) candidates = this.results;
    const result = candidates[Math.floor(Math.random() * candidates.length)];
    return {
      ...JSON.parse(JSON.stringify(result)),
      recognizedAt: new Date().toISOString(),
      fileName: fileName || 'unknown.pdf'
    };
  },

  /**
   * 统计有效字段数（值非空的字段）
   */
  countValidFields(result) {
    if (!result || !result.fields) return 0;
    return Object.values(result.fields).filter(v => {
      if (Array.isArray(v)) return v.length > 0;
      return v !== '' && v !== null && v !== undefined;
    }).length;
  },

  /**
   * 获取可填充的字段列表（包含 DOM 映射）
   */
  getFillableFields(result) {
    const list = [];
    if (!result || !result.fields) return list;
    Object.entries(result.fields).forEach(([key, value]) => {
      const config = this.fieldMap[key];
      if (!config) return;
      if (Array.isArray(value) && value.length === 0) return;
      if (value === '' || value === null || value === undefined) return;
      // 找到页面上实际存在的元素
      let targetEl = null;
      for (const id of config.targetIds) {
        const el = document.getElementById(id);
        if (el) { targetEl = el; break; }
      }
      if (targetEl) {
        list.push({ key, label: config.label, value, targetEl, targetId: targetEl.id });
      }
    });
    return list;
  },

  /**
   * 填充单个字段
   */
  fillField(fieldItem) {
    const { targetEl, value, key } = fieldItem;
    if (!targetEl) return false;
    const tagName = targetEl.tagName.toLowerCase();
    if (tagName === 'input') {
      const type = targetEl.type;
      if (type === 'date') {
        targetEl.value = value;
      } else if (type === 'radio' || type === 'checkbox') {
        // 不处理单选/多选
      } else {
        targetEl.value = value;
      }
    } else if (tagName === 'select') {
      // 尝试匹配选项
      const options = Array.from(targetEl.options);
      const matched = options.find(o => o.value === value || o.text === value);
      if (matched) {
        targetEl.value = matched.value;
      } else {
        // 如果无法匹配，创建新选项
        const newOpt = document.createElement('option');
        newOpt.value = value;
        newOpt.text = value;
        targetEl.add(newOpt, 0);
        targetEl.value = value;
      }
    } else if (tagName === 'textarea') {
      targetEl.value = value;
    }
    // 触发 change 事件
    targetEl.dispatchEvent(new Event('change', { bubbles: true }));
    targetEl.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  },

  /**
   * 一键确认填充所有字段
   */
  fillAll(result) {
    const fields = this.getFillableFields(result);
    let filled = 0;
    fields.forEach(f => {
      if (this.fillField(f)) filled++;
    });
    return { filled, total: fields.length, fields };
  }
};
