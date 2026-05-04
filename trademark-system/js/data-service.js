// ==================== DataService.js ====================
// 小米商标管理系统 - 前端数据层
// 基于 localStorage 的完整 CRUD 数据服务
// 技术栈：Vanilla JavaScript，零依赖

const DataService = (function() {
  'use strict';

  // ==================== 配置常量 ====================
  const STORAGE_KEYS = {
    VERSION: 'tm_data_version',
    CASES: 'tm_data_cases',
    BRANDS: 'tm_data_brands',
    TODOS: 'tm_data_todos',
    FEES: 'tm_data_fees',
    FEE_APPS: 'tm_data_fee_apps',
    LAW_FIRMS: 'tm_data_law_firms',
    MONITOR_TASKS: 'tm_data_monitor_tasks',
    MONITOR_RESULTS: 'tm_data_monitor_results',
    NOTIFICATIONS: 'tm_data_notifications',
    ACTIVITIES: 'tm_data_activities',
    USER_PREFS: 'tm_data_user_prefs',
    DRAFTS: 'tm_drafts'
  };

  const CURRENT_VERSION = '2.1';

  const NICE_CLASS_NAMES = {
    1: '化工原料', 2: '颜料油漆', 3: '日化用品', 4: '燃料油脂',
    5: '医药制剂', 6: '金属材料', 7: '机械设备', 8: '手工器具',
    9: '科学仪器', 10: '医疗器械', 11: '灯具空调', 12: '运输工具',
    13: '军火烟火', 14: '珠宝钟表', 15: '乐器乐器', 16: '办公用品',
    17: '橡胶制品', 18: '皮革皮具', 19: '建筑材料', 20: '家具工艺',
    21: '厨房洁具', 22: '绳网袋篷', 23: '纺织纱线', 24: '布料床单',
    25: '服装鞋帽', 26: '纽扣拉链', 27: '地毯席垫', 28: '健身器材',
    29: '肉蛋奶鱼', 30: '方便食品', 31: '农林生鲜', 32: '啤酒饮料',
    33: '酒精酒品', 34: '烟草烟具', 35: '广告销售', 36: '金融保险',
    37: '建筑修理', 38: '电信通讯', 39: '运输仓储', 40: '材料加工',
    41: '教育娱乐', 42: '科技服务', 43: '餐饮住宿', 44: '医疗园艺',
    45: '法律安全'
  };

  const STATUS_MAP = {
    'examining': { label: '审查中', color: 'blue' },
    'pending': { label: '受理中', color: 'green' },
    'defense_period': { label: '答辩期', color: 'orange' },
    'preparing': { label: '准备材料', color: 'gray' },
    'waiting_payment': { label: '待缴费', color: 'red' },
    'registered': { label: '已注册', color: 'success' },
    'rejected': { label: '已驳回', color: 'danger' },
    'appeal': { label: '行政诉讼', color: 'purple' },
    'evidence': { label: '证据收集', color: 'cyan' },
    'first_instance': { label: '一审中', color: 'indigo' }
  };

  // ==================== 工具函数 ====================
  function generateId(prefix) {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${ts}-${rand}`;
  }

  function getToday() {
    return new Date().toISOString().split('T')[0];
  }

  function daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
  }

  function storageGet(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Storage read error:', e);
      return null;
    }
  }

  function storageSet(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Storage write error:', e);
      return false;
    }
  }

  function getEntity(key) {
    return storageGet(key) || [];
  }

  function setEntity(key, data) {
    storageSet(key, data);
  }

  // ==================== 种子数据 ====================
  function seedData() {
    const today = getToday();
    const todayDate = new Date(today);
    const dateOffset = (days) => {
      const d = new Date(todayDate);
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    // --- 品牌数据 ---
    const brands = [
      {
        id: 'yunzhi', name: '云智', type: 'internal',
        trademarkImage: '../assets/tm-yunzhi.png',
        totalClasses: 4, registeredCount: 3, pendingCount: 1, expiredCount: 0, riskLevel: 'low',
        classMatrix: {
          '9': { status: 'registered', regNo: '78954321', regDate: '2025-01-20' },
          '35': { status: 'pending', appNo: 'TM-2026-0042', appDate: '2026-01-15' },
          '38': { status: 'registered', regNo: '78954322', regDate: '2025-02-10' },
          '42': { status: 'registered', regNo: '78954323', regDate: '2025-03-05' }
        },
        description: '云计算与智能服务平台',
        createdAt: '2024-01-15'
      },
      {
        id: 'zhilian', name: '智联', type: 'internal',
        trademarkImage: '../assets/tm-zhilian.png',
        totalClasses: 5, registeredCount: 4, pendingCount: 1, expiredCount: 0, riskLevel: 'medium',
        classMatrix: {
          '9': { status: 'registered', regNo: '78954401' },
          '35': { status: 'registered', regNo: '78954402' },
          '38': { status: 'registered', regNo: '78954403' },
          '42': { status: 'registered', regNo: '78954404' },
          '45': { status: 'pending', appNo: 'TM-2026-0031' }
        },
        description: '智能设备互联平台',
        createdAt: '2024-02-20'
      },
      {
        id: 'haiyi', name: '海翼', type: 'internal',
        trademarkImage: '../assets/tm-haiyi.png',
        totalClasses: 3, registeredCount: 2, pendingCount: 1, expiredCount: 0, riskLevel: 'low',
        classMatrix: {
          '12': { status: 'registered', regNo: '78954501' },
          '35': { status: 'registered', regNo: '78954502' },
          '37': { status: 'pending', appNo: 'TM-2026-0050' }
        },
        description: '智能出行与交通工具',
        createdAt: '2024-03-10'
      },
      {
        id: 'xinglian', name: '星联', type: 'internal',
        trademarkImage: '../assets/tm-xinglian.png',
        totalClasses: 6, registeredCount: 5, pendingCount: 0, expiredCount: 1, riskLevel: 'high',
        classMatrix: {
          '9': { status: 'registered', regNo: '78954601' },
          '35': { status: 'registered', regNo: '78954602' },
          '38': { status: 'registered', regNo: '78954603' },
          '41': { status: 'expired', regNo: '78954604', expiredDate: '2025-12-01' },
          '42': { status: 'registered', regNo: '78954605' },
          '45': { status: 'registered', regNo: '78954606' }
        },
        description: '星际通信与卫星网络',
        createdAt: '2024-01-05'
      },
      {
        id: 'yuedong', name: '悦动', type: 'internal',
        trademarkImage: '../assets/tm-yuedong.png',
        totalClasses: 2, registeredCount: 0, pendingCount: 2, expiredCount: 0, riskLevel: 'low',
        classMatrix: {
          '25': { status: 'pending', appNo: 'TM-2026-0056' },
          '35': { status: 'pending', appNo: 'TM-2026-0057' }
        },
        description: '运动健康生活方式品牌',
        createdAt: '2025-06-01'
      },
      {
        id: 'ruisi', name: '睿思', type: 'internal',
        trademarkImage: '../assets/tm-ruisi.png',
        totalClasses: 4, registeredCount: 3, pendingCount: 1, expiredCount: 0, riskLevel: 'medium',
        classMatrix: {
          '9': { status: 'registered', regNo: '78954801' },
          '35': { status: 'registered', regNo: '78954802' },
          '38': { status: 'pending', appNo: 'TM-2026-0071' },
          '42': { status: 'registered', regNo: '78954803' }
        },
        description: '人工智能与认知计算',
        createdAt: '2024-05-15'
      },
      {
        id: 'mingda', name: '明达', type: 'internal',
        trademarkImage: '../assets/tm-mingda.png',
        totalClasses: 3, registeredCount: 2, pendingCount: 1, expiredCount: 0, riskLevel: 'medium',
        classMatrix: {
          '35': { status: 'registered', regNo: '78954901' },
          '36': { status: 'registered', regNo: '78954902' },
          '42': { status: 'pending', appNo: 'TM-2026-0028' }
        },
        description: '智慧照明与能源管理',
        createdAt: '2024-07-20'
      },
      {
        id: 'qihang', name: '启航', type: 'internal',
        trademarkImage: '../assets/tm-qihang.png',
        totalClasses: 2, registeredCount: 1, pendingCount: 1, expiredCount: 0, riskLevel: 'low',
        classMatrix: {
          '35': { status: 'registered', regNo: '78955001' },
          '39': { status: 'pending', appNo: 'TM-2026-0080' }
        },
        description: '物流与供应链服务',
        createdAt: '2024-09-01'
      },
      {
        id: 'yuanjian', name: '远见', type: 'internal',
        trademarkImage: '../assets/tm-yuanjian.png',
        totalClasses: 2, registeredCount: 0, pendingCount: 2, expiredCount: 0, riskLevel: 'low',
        classMatrix: {
          '35': { status: 'pending', appNo: 'TM-2026-0012' },
          '42': { status: 'pending', appNo: 'TM-2026-0013' }
        },
        description: '战略咨询与数据分析',
        createdAt: '2025-01-10'
      }
    ];

    // --- 律所数据 ---
    const lawFirms = [
      {
        id: 'jincheng', name: '金诚律师事务所',
        casesCount: 45, rating: 4.8, responseTime: 2.3,
        responseTimeFormatted: '2.3h',
        successRate: 92, feeLevel: 'high', feeLevelLabel: '高',
        feeRange: '>500元/小时',
        status: 'active', contact: '陈律师',
        expertise: { '驳回复审': 92, '诉讼': 85, '新申请': 78, '异议': 88, '续展': 95 },
        reviews: [
          { rating: 5, text: '响应迅速，驳回复审材料质量高', author: '张法务', date: '2026-04-15' }
        ]
      },
      {
        id: 'zhongyu', name: '中誉知识产权',
        casesCount: 38, rating: 4.5, responseTime: 4.1,
        responseTimeFormatted: '4.1h',
        successRate: 88, feeLevel: 'medium', feeLevelLabel: '中',
        feeRange: '300-500元/小时',
        status: 'active', contact: '李代理',
        expertise: { '驳回复审': 82, '诉讼': 75, '新申请': 90, '异议': 85, '续展': 92 },
        reviews: []
      },
      {
        id: 'baker', name: '美国Baker律所',
        casesCount: 12, rating: 4.7, responseTime: 8.5,
        responseTimeFormatted: '8.5h',
        successRate: 90, feeLevel: 'high', feeLevelLabel: '高',
        feeRange: '>800美元/小时',
        status: 'active', contact: 'John Smith',
        expertise: { '海外申请': 95, '马德里': 92, '美国诉讼': 88 },
        reviews: []
      },
      {
        id: 'muller', name: '德国Müller事务所',
        casesCount: 8, rating: 4.3, responseTime: 12,
        responseTimeFormatted: '1.5工作日',
        successRate: 85, feeLevel: 'medium-high', feeLevelLabel: '中高',
        feeRange: '500-800欧元/小时',
        status: 'active', contact: 'Hans Müller',
        expertise: { '欧盟申请': 90, '德国诉讼': 85, '异议': 80 },
        reviews: []
      },
      {
        id: 'tokkyo', name: '日本东京特许事务所',
        casesCount: 6, rating: 4.6, responseTime: 6,
        responseTimeFormatted: '6h',
        successRate: 91, feeLevel: 'medium', feeLevelLabel: '中',
        feeRange: '300-600美元/小时',
        status: 'active', contact: '田中太郎',
        expertise: { '日本申请': 95, '东亚布局': 90 },
        reviews: []
      }
    ];

    // --- 案件数据 ---
    const cases = [
      {
        id: 'TM-2026-0042', brandId: 'yunzhi', brandName: '云智',
        trademarkImage: '../assets/tm-yunzhi.png',
        type: 'domestic', businessType: '驳回复审', businessTypeCode: 'reexamination',
        status: '审查中', statusCode: 'examining',
        niceClasses: [9, 35, 38, 42],
        niceClassNames: '9, 35, 38, 42',
        applicationDate: '2026-01-15',
        officialDeadline: dateOffset(2),
        internalDeadline: dateOffset(-1),
        currentProgress: 65,
        lawFirmId: 'jincheng', lawFirmName: '金诚律师事务所',
        responsibleUser: '张法务', responsibleUserId: 'zhang',
        feeTotal: 101500, feePaid: 4500, feePending: 97000,
        timeline: [
          { id: 'tl-1', title: '案件创建', date: '2026-01-15', actor: '张法务', actorType: 'internal', status: 'completed', detail: '知识产权部发起"云智"商标第35类新申请，指定金诚律所为代理机构' },
          { id: 'tl-2', title: '委托代理确认', date: '2026-01-18', actor: '金诚律师事务所', actorType: 'lawfirm', status: 'completed', detail: '陈律师确认接受委托，代理费报价¥85,000（一审），官费预估¥1,500' },
          { id: 'tl-3', title: '申请材料准备', date: '2026-01-20', actor: '金诚律所', actorType: 'lawfirm', status: 'completed', detail: '完成商标图样优化、商品/服务分类细化（35类：广告、商业管理、零售服务等）' },
          { id: 'tl-4', title: '提交新申请', date: '2026-01-22', actor: '商标局受理处', actorType: 'system', status: 'completed', detail: '申请号：TM-2026-0042，申请类别：第35类，规费已缴纳' },
          { id: 'tl-5', title: '形式审查通过', date: '2026-02-01', actor: '商标局审查一部', actorType: 'system', status: 'completed', detail: '申请文件齐全、图样清晰、类别划分符合要求，进入实质审查阶段' },
          { id: 'tl-6', title: '实质审查驳回', date: '2026-03-15', actor: '商标局审查二部', actorType: 'system', status: 'rejected', detail: '驳回理由：与在先注册商标"云智科技"（注册号78954321，第9类）构成近似商标，违反《商标法》第三十条' },
          { id: 'tl-7', title: '案件分析会议', date: '2026-03-20', actor: '张法务 / 陈律师', actorType: 'lawfirm', status: 'completed', detail: '会议结论：第9类与第35类商品/服务关联度较低，可尝试通过"商品/服务不类似"+"商标不近似"双路径论证' },
          { id: 'tl-8', title: '类似案例检索', date: '2026-03-25', actor: '金诚律所', actorType: 'lawfirm', status: 'completed', detail: '检索到3件支持性判例：（2024）京73行终1234号、（2023）京73行终5678号、（2023）商标异字第9012号' },
          { id: 'tl-9', title: '驳回复审理由书 v1', date: '2026-04-10', actor: '金诚律所', actorType: 'lawfirm', status: 'completed', detail: '完成初稿，重点论证：① 第35类与第9类商品/服务不构成类似；② "云智"与"云智科技"在呼叫、含义上存在差异' },
          { id: 'tl-10', title: '法务批注反馈', date: '2026-04-15', actor: '张法务', actorType: 'internal', status: 'completed', detail: '反馈意见：整体逻辑通顺，但需补充第35类近三年实际使用证据（合同、发票、宣传材料），增强"实际使用+知名度"论证' },
          { id: 'tl-11', title: '驳回复审材料准备', date: '2026-04-20', actor: '金诚律所', actorType: 'lawfirm', status: 'current', detail: '绝限 2026-05-06 | 正在进行：补充使用证据、市场调研报告、理由书v2修订' },
          { id: 'tl-12', title: '复审提交', date: '', actor: '', actorType: '', status: 'pending', detail: '待进行：理由书v2批注通过后，向商评委提交复审申请' }
        ],
        documents: [
          { id: 'doc-1', name: '商标注册申请书.pdf', type: 'official', typeLabel: '官方文件', size: '2.3MB', uploadDate: '2026-01-22', status: 'normal', statusLabel: '正常', url: '#' },
          { id: 'doc-2', name: '商标代理委托书.pdf', type: 'official', typeLabel: '官方文件', size: '520KB', uploadDate: '2026-01-18', status: 'normal', statusLabel: '正常', url: '#' },
          { id: 'doc-3', name: '驳回通知书.pdf', type: 'official', typeLabel: '官方文件', size: '1.1MB', uploadDate: '2026-04-03', status: 'normal', statusLabel: '正常', url: '#' },
          { id: 'doc-4', name: '驳回分析备忘录.docx', type: 'lawfirm', typeLabel: '律所提交', size: '320KB', uploadDate: '2026-03-22', status: 'normal', statusLabel: '正常', url: '#' },
          { id: 'doc-5', name: '类似案例检索报告.pdf', type: 'lawfirm', typeLabel: '律所提交', size: '2.1MB', uploadDate: '2026-03-25', status: 'normal', statusLabel: '正常', url: '#' },
          { id: 'doc-6', name: '驳回复审理由书_v1.docx', type: 'lawfirm', typeLabel: '律所提交', size: '780KB', uploadDate: '2026-04-10', status: 'normal', statusLabel: '正常', url: '#' },
          { id: 'doc-7', name: '法务批注意见_v1.pdf', type: 'internal', typeLabel: '内部文件', size: '450KB', uploadDate: '2026-04-15', status: 'normal', statusLabel: '正常', url: '#' },
          { id: 'doc-8', name: '市场调研报告_云智品牌.pdf', type: 'evidence', typeLabel: '证据材料', size: '8.2MB', uploadDate: '2026-04-25', status: 'normal', statusLabel: '正常', url: '#' },
          { id: 'doc-9', name: '商标使用证据汇总.zip', type: 'evidence', typeLabel: '证据材料', size: '15.6MB', uploadDate: '2026-04-28', status: 'normal', statusLabel: '正常', url: '#' },
          { id: 'doc-10', name: '驳回复审理由书_v2.docx', type: 'lawfirm', typeLabel: '律所提交', size: '950KB', uploadDate: '2026-05-03', status: 'pending_review', statusLabel: '待批注', url: '#' }
        ],
        messages: [
          { id: 'msg-1', sender: '系统通知', senderAvatar: '系', senderType: 'system', content: '商标新申请已提交，申请号：TM-2026-0042，申请类别：第35类，当前状态：受理中', date: '2026-01-22 09:00', type: 'message' },
          { id: 'msg-2', sender: '陈律师 · 金诚律所', senderAvatar: '陈', senderType: 'lawfirm', content: '已确认接受委托，开始准备申请材料。预计1月20日前完成材料准备，请确认商品/服务清单。', date: '2026-01-18 14:30', type: 'message' },
          { id: 'msg-3', sender: '张法务', senderAvatar: '张', senderType: 'internal', content: '商品/服务清单已确认，第35类包含：广告、商业管理辅助、替他人推销、零售服务等。请按此清单准备。', date: '2026-01-19 10:15', type: 'message' },
          { id: 'msg-4', sender: '系统通知', senderAvatar: '系', senderType: 'system', content: '形式审查已通过，申请文件齐全，图样清晰，进入实质审查阶段。预计审查周期：3-4个月。', date: '2026-02-01 11:00', type: 'message' },
          { id: 'msg-5', sender: '系统通知', senderAvatar: '系', senderType: 'system', content: '⚠️ 收到驳回通知书！商标局认定与在先商标"云智科技"（78954321，第9类）近似，违反《商标法》第三十条。官方绝限：2026-05-06。', date: '2026-04-03 16:20', type: 'message' },
          { id: 'msg-6', sender: '陈律师 · 金诚律所', senderAvatar: '陈', senderType: 'lawfirm', content: '建议尽快召开案件分析会议。初步判断：第9类（科学仪器）与第35类（广告销售）关联度较低，可尝试双路径论证。', date: '2026-04-03 17:00', type: 'message' },
          { id: 'msg-7', sender: '张法务', senderAvatar: '张', senderType: 'internal', content: '同意召开分析会议。请提前准备：① 类似案例检索；② 商品/服务类似性判断依据；③ 复审成功率评估。会议时间：3月20日14:00。', date: '2026-04-03 18:30', type: 'message' },
          { id: 'msg-8', sender: '陈律师 · 金诚律所', senderAvatar: '陈', senderType: 'lawfirm', content: '驳回复审理由书v1已提交，请审核。核心论点：第9类与第35类不构成类似商品/服务，且两商标在呼叫、含义上存在显著差异。', date: '2026-04-10 11:00', type: 'message' },
          { id: 'msg-9', sender: '张法务', senderAvatar: '张', senderType: 'internal', content: '理由书v1已审核。整体逻辑通顺，论证结构清晰，但存在以下不足：1）第35类实际使用证据不足；2）知名度论证缺少销售数据支撑；3）建议在"商标不近似"部分补充消费者认知调查。请修订后提交v2。', date: '2026-04-12 16:45', type: 'message' },
          { id: 'msg-10', sender: '陈律师 · 金诚律所', senderAvatar: '陈', senderType: 'lawfirm', content: '收到批注意见。已安排调研团队补充：① 近三年第35类使用合同及发票（预计15份）；② 品牌知名度市场调研（覆盖北上广深）；③ 消费者认知度问卷（样本量N=500）。预计4月25日前完成。', date: '2026-04-13 09:20', type: 'message' },
          { id: 'msg-11', sender: '陈律师 · 金诚律所', senderAvatar: '陈', senderType: 'lawfirm', content: '驳回复审理由书v2已提交，请法务审核。本次重点补充了：第35类使用证据（合同、发票、宣传材料）、品牌市场调研报告、消费者认知度调查数据。', date: '2026-05-03 10:30', type: 'message' },
          { id: 'msg-12', sender: '张法务', senderAvatar: '张', senderType: 'internal', content: '收到v2，我将在今日内完成审核。关于证据链的完整性请再确认一下：① 合同金额是否覆盖近三年；② 发票与合同是否一一对应；③ 调研样本是否具有代表性。', date: '2026-05-03 11:00', type: 'message' }
        ],
        tags: ['紧急', '复审', '近似驳回', '绝限临近'],
        createdAt: '2026-01-15', updatedAt: '2026-05-03'
      },
      {
        id: 'TM-2026-0031', brandId: 'zhilian', brandName: '智联',
        trademarkImage: '../assets/tm-zhilian.png',
        type: 'domestic', businessType: '异议答辩', businessTypeCode: 'defense',
        status: '答辩期', statusCode: 'defense_period',
        niceClasses: [9, 35, 38],
        niceClassNames: '9, 35, 38',
        applicationDate: '2025-11-10',
        officialDeadline: dateOffset(3),
        internalDeadline: dateOffset(1),
        currentProgress: 45,
        lawFirmId: 'zhongyu', lawFirmName: '中誉知识产权',
        responsibleUser: '张法务', responsibleUserId: 'zhang',
        feeTotal: 62000, feePaid: 2000, feePending: 60000,
        timeline: [
          { id: 'tl-1', title: '案件创建', date: '2025-11-10', actor: '张法务', actorType: 'internal', status: 'completed', detail: '' },
          { id: 'tl-2', title: '收到异议申请', date: '2026-02-20', actor: '中誉知识产权', actorType: 'lawfirm', status: 'completed', detail: '第三方提出异议' },
          { id: 'tl-3', title: '异议答辩准备', date: '2026-03-01', actor: '中誉知识产权', actorType: 'lawfirm', status: 'current', detail: '绝限 2026-05-07' }
        ],
        documents: [
          { id: 'doc-1', name: '异议答辩书.pdf', type: 'lawfirm', typeLabel: '律所提交', size: '1.8MB', uploadDate: '2026-04-25', status: 'pending_review', statusLabel: '待批注', url: '#' }
        ],
        messages: [
          { id: 'msg-1', sender: '中誉知识产权', senderAvatar: '中', senderType: 'lawfirm', content: '异议答辩书已提交，请确认是否需要补充证据材料。', date: '2026-04-25 16:00', type: 'message' }
        ],
        tags: ['高优先级', '异议'],
        createdAt: '2025-11-10', updatedAt: '2026-04-25'
      },
      {
        id: 'TM-2026-0056', brandId: 'yuedong', brandName: '悦动',
        trademarkImage: '../assets/tm-yuedong.png',
        type: 'domestic', businessType: '新申请', businessTypeCode: 'new_apply',
        status: '受理中', statusCode: 'pending',
        niceClasses: [25, 35],
        niceClassNames: '25, 35',
        applicationDate: '2026-03-20',
        officialDeadline: dateOffset(28),
        internalDeadline: dateOffset(21),
        currentProgress: 20,
        lawFirmId: 'zhongyu', lawFirmName: '中誉知识产权',
        responsibleUser: '王流程', responsibleUserId: 'wang',
        feeTotal: 35000, feePaid: 3500, feePending: 31500,
        timeline: [
          { id: 'tl-1', title: '案件创建', date: '2026-03-20', actor: '王流程', actorType: 'internal', status: 'completed', detail: '' },
          { id: 'tl-2', title: '提交申请', date: '2026-03-25', actor: '商标局', actorType: 'system', status: 'current', detail: '受理中' }
        ],
        documents: [],
        messages: [],
        tags: [],
        createdAt: '2026-03-20', updatedAt: '2026-03-25'
      },
      {
        id: 'TM-2026-0028', brandId: 'mingda', brandName: '明达',
        trademarkImage: '../assets/tm-mingda.png',
        type: 'domestic', businessType: '不予注册复审', businessTypeCode: 'reexamination',
        status: '准备材料', statusCode: 'preparing',
        niceClasses: [35, 36, 42],
        niceClassNames: '35, 36, 42',
        applicationDate: '2026-02-01',
        officialDeadline: dateOffset(18),
        internalDeadline: dateOffset(14),
        currentProgress: 35,
        lawFirmId: 'jincheng', lawFirmName: '金诚律师事务所',
        responsibleUser: '张法务', responsibleUserId: 'zhang',
        feeTotal: 72000, feePaid: 5000, feePending: 67000,
        timeline: [
          { id: 'tl-1', title: '案件创建', date: '2026-02-01', actor: '张法务', actorType: 'internal', status: 'completed', detail: '' },
          { id: 'tl-2', title: '收到不予注册决定', date: '2026-04-01', actor: '商标局', actorType: 'system', status: 'completed', detail: '引证商标：明达照明' },
          { id: 'tl-3', title: '复审材料准备', date: '2026-04-05', actor: '金诚律所', actorType: 'lawfirm', status: 'current', detail: '绝限 2026-05-22' }
        ],
        documents: [],
        messages: [],
        tags: ['复审'],
        createdAt: '2026-02-01', updatedAt: '2026-04-05'
      },
      {
        id: 'TM-2025-0098', brandId: 'xinglian', brandName: '星联',
        trademarkImage: '../assets/tm-xinglian.png',
        type: 'domestic', businessType: '续展', businessTypeCode: 'renewal',
        status: '待缴费', statusCode: 'waiting_payment',
        niceClasses: [9, 35, 38, 41, 42, 45],
        niceClassNames: '9, 35, 38, 41, 42, 45',
        applicationDate: '2016-01-10',
        officialDeadline: dateOffset(6),
        internalDeadline: dateOffset(3),
        currentProgress: 80,
        lawFirmId: 'jincheng', lawFirmName: '金诚律师事务所',
        responsibleUser: '张法务', responsibleUserId: 'zhang',
        feeTotal: 18000, feePaid: 0, feePending: 18000,
        timeline: [
          { id: 'tl-1', title: '案件创建', date: '2026-01-10', actor: '张法务', actorType: 'internal', status: 'completed', detail: '续展期届满前6个月' },
          { id: 'tl-2', title: '续展材料准备', date: '2026-01-15', actor: '金诚律所', actorType: 'lawfirm', status: 'completed', detail: '' },
          { id: 'tl-3', title: '缴纳官费', date: '', actor: '', actorType: '', status: 'current', detail: '待缴费 绝限 2026-05-10' }
        ],
        documents: [],
        messages: [],
        tags: ['紧急', '续展', '官费待缴'],
        createdAt: '2026-01-10', updatedAt: '2026-01-15'
      },
      {
        id: 'TM-2026-0071', brandId: 'ruisi', brandName: '睿思',
        trademarkImage: '../assets/tm-ruisi.png',
        type: 'domestic', businessType: '撤三答辩', businessTypeCode: 'defense',
        status: '证据收集', statusCode: 'evidence',
        niceClasses: [9, 35, 38, 42],
        niceClassNames: '9, 35, 38, 42',
        applicationDate: '2024-06-01',
        officialDeadline: dateOffset(36),
        internalDeadline: dateOffset(30),
        currentProgress: 40,
        lawFirmId: 'zhongyu', lawFirmName: '中誉知识产权',
        responsibleUser: '张法务', responsibleUserId: 'zhang',
        feeTotal: 55000, feePaid: 10000, feePending: 45000,
        timeline: [
          { id: 'tl-1', title: '收到撤三通知', date: '2026-03-15', actor: '商标局', actorType: 'system', status: 'completed', detail: '被申请撤销第38类注册' },
          { id: 'tl-2', title: '证据收集', date: '2026-04-01', actor: '中誉知识产权', actorType: 'lawfirm', status: 'current', detail: '绝限 2026-06-10' }
        ],
        documents: [],
        messages: [],
        tags: ['撤三', '证据'],
        createdAt: '2024-06-01', updatedAt: '2026-04-01'
      },
      {
        id: 'TM-2026-0012', brandId: 'yuanjian', brandName: '远见',
        trademarkImage: '../assets/tm-yuanjian.png',
        type: 'domestic', businessType: '异议申请', businessTypeCode: 'opposition',
        status: '准备材料', statusCode: 'preparing',
        niceClasses: [35, 42],
        niceClassNames: '35, 42',
        applicationDate: '2026-01-20',
        officialDeadline: dateOffset(41),
        internalDeadline: dateOffset(35),
        currentProgress: 25,
        lawFirmId: 'jincheng', lawFirmName: '金诚律师事务所',
        responsibleUser: '赵法务', responsibleUserId: 'zhao',
        feeTotal: 48000, feePaid: 8000, feePending: 40000,
        timeline: [
          { id: 'tl-1', title: '发现侵权商标', date: '2026-01-18', actor: '监测中心', actorType: 'system', status: 'completed', detail: '发现"远见科技"抢注' },
          { id: 'tl-2', title: '异议材料准备', date: '2026-01-20', actor: '金诚律所', actorType: 'lawfirm', status: 'current', detail: '绝限 2026-06-15' }
        ],
        documents: [],
        messages: [],
        tags: ['异议', '监测发现'],
        createdAt: '2026-01-20', updatedAt: '2026-01-20'
      },
      {
        id: 'TM-2025-0156', brandId: 'horizon', brandName: 'Horizon',
        trademarkImage: '../assets/tm-horizon.png',
        type: 'overseas', businessType: '行政诉讼', businessTypeCode: 'litigation',
        status: '一审中', statusCode: 'first_instance',
        niceClasses: [9, 38],
        niceClassNames: '9, 38',
        applicationDate: '2025-08-15',
        officialDeadline: dateOffset(58),
        internalDeadline: dateOffset(50),
        currentProgress: 50,
        lawFirmId: 'baker', lawFirmName: '美国Baker律所',
        responsibleUser: '张法务', responsibleUserId: 'zhang',
        feeTotal: 320000, feePaid: 160000, feePending: 160000,
        timeline: [
          { id: 'tl-1', title: '美国商标驳回', date: '2025-12-01', actor: 'USPTO', actorType: 'system', status: 'completed', detail: '驳回理由：描述性' },
          { id: 'tl-2', title: '行政诉讼提起', date: '2026-01-15', actor: 'Baker律所', actorType: 'lawfirm', status: 'current', detail: 'TTAB审理中' }
        ],
        documents: [],
        messages: [],
        tags: ['海外', '美国', '行政诉讼'],
        createdAt: '2025-08-15', updatedAt: '2026-01-15'
      }
    ];

    // --- 待办数据 ---
    const todos = [
      { id: 'todo-1', title: "商标'云智'驳回复审材料准备", caseId: 'TM-2026-0042', caseName: '云智-驳回复审', type: '案件处理', typeLabel: '案件处理', priority: 'urgent', priorityLabel: '紧急', deadline: dateOffset(2), status: 'pending', statusLabel: '待处理', createdAt: '2026-04-20', assignee: '张法务' },
      { id: 'todo-2', title: '马德里国际申请WIPO费用支付确认', caseId: 'TM-2025-0189', caseName: '海翼-马德里申请', type: '费用审批', typeLabel: '费用审批', priority: 'high', priorityLabel: '高', deadline: dateOffset(3), status: 'pending', statusLabel: '待审批', createdAt: '2026-04-25', assignee: '张法务' },
      { id: 'todo-3', title: '律所提交的异议答辩书审核', caseId: 'TM-2026-0031', caseName: '智联-异议答辩', type: '文件批注', typeLabel: '文件批注', priority: 'high', priorityLabel: '高', deadline: dateOffset(4), status: 'pending', statusLabel: '待批注', createdAt: '2026-04-28', assignee: '张法务' },
      { id: 'todo-4', title: '品牌A 第35类补充注册评估', caseId: null, caseName: null, type: '风险评估', typeLabel: '风险评估', priority: 'medium', priorityLabel: '中', deadline: dateOffset(8), status: 'pending', statusLabel: '待评估', createdAt: '2026-04-15', assignee: '张法务' },
      { id: 'todo-5', title: '年度商标续展预算编制', caseId: null, caseName: null, type: '预算编制', typeLabel: '预算编制', priority: 'medium', priorityLabel: '中', deadline: dateOffset(11), status: 'pending', statusLabel: '待编制', createdAt: '2026-04-01', assignee: '张法务' },
      { id: 'todo-6', title: "'星联'商标使用证据收集", caseId: 'TM-2025-0098', caseName: '星联-续展', type: '证据管理', typeLabel: '证据管理', priority: 'normal', priorityLabel: '普通', deadline: dateOffset(16), status: 'pending', statusLabel: '待收集', createdAt: '2026-04-10', assignee: '张法务' },
      { id: 'todo-7', title: '金诚律所Q2服务评价', caseId: null, caseName: null, type: '服务评价', typeLabel: '服务评价', priority: 'normal', priorityLabel: '普通', deadline: dateOffset(21), status: 'pending', statusLabel: '待评价', createdAt: '2026-04-05', assignee: '张法务' },
      { id: 'todo-8', title: '商标监测周报确认', caseId: null, caseName: null, type: '监测报告', typeLabel: '监测报告', priority: 'low', priorityLabel: '低', deadline: dateOffset(26), status: 'pending', statusLabel: '待确认', createdAt: '2026-04-20', assignee: '张法务' }
    ];

    // --- 费用数据 ---
    const fees = [
      { id: 'fee-1', caseId: 'TM-2026-0042', brandName: '云智', type: '代理费', typeLabel: '代理费', amount: 85000, currency: 'CNY', paid: 0, status: 'pending', note: '驳回复审代理费（一审）', createdAt: '2026-01-15' },
      { id: 'fee-2', caseId: 'TM-2026-0042', brandName: '云智', type: '官费', typeLabel: '官费', amount: 1500, currency: 'CNY', paid: 1500, status: 'paid', note: '驳回复审官费', createdAt: '2026-01-22' },
      { id: 'fee-6', caseId: 'TM-2026-0042', brandName: '云智', type: '调查费', typeLabel: '调查费', amount: 12000, currency: 'CNY', paid: 0, status: 'pending', note: '市场调研及证据收集（消费者认知度调查N=500）', createdAt: '2026-04-15' },
      { id: 'fee-7', caseId: 'TM-2026-0042', brandName: '云智', type: '检索费', typeLabel: '检索费', amount: 3000, currency: 'CNY', paid: 3000, status: 'paid', note: '类似案例检索及分析报告', createdAt: '2026-03-20' },
      { id: 'fee-3', caseId: 'TM-2026-0031', brandName: '智联', type: '代理费', typeLabel: '代理费', amount: 60000, currency: 'CNY', paid: 0, status: 'pending', note: '异议答辩代理费', createdAt: '2025-11-10' },
      { id: 'fee-4', caseId: 'TM-2026-0031', brandName: '智联', type: '官费', typeLabel: '官费', amount: 2000, currency: 'CNY', paid: 2000, status: 'paid', note: '异议答辩官费', createdAt: '2025-12-01' },
      { id: 'fee-5', caseId: 'TM-2025-0098', brandName: '星联', type: '官费', typeLabel: '官费', amount: 18000, currency: 'CNY', paid: 0, status: 'pending', note: '6类续展官费（每类3000）', createdAt: '2026-01-10' }
    ];

    // --- 费用申请数据 ---
    const feeApps = [
      {
        id: 'FA-2026-0089', title: '马德里国际申请WIPO费用支付',
        caseId: 'TM-2025-0189', caseName: '海翼-马德里申请',
        applicant: '张法务', applicantDept: '知识产权部',
        amount: 156000, currency: 'CNY',
        items: [
          { type: '官费', typeLabel: '官费', amount: 56000, note: 'WIPO基础费+指定国费' },
          { type: '代理费', typeLabel: '代理费', amount: 100000, note: 'Baker律所代理费' }
        ],
        status: 'pending', statusLabel: '待审批',
        flow: [
          { level: 1, role: '申请人', name: '张法务', dept: '知识产权部', status: 'completed', actionAt: '2026-05-01 10:00' },
          { level: 2, role: '部门审批', name: '李总监', dept: '知识产权部', status: 'current', actionAt: null },
          { level: 3, role: '财务审批', name: '王财务', dept: '财务部', status: 'pending', actionAt: null }
        ],
        cc: ['刘助理'],
        attachments: [{ name: 'Baker报价单.pdf', size: '1.2MB' }],
        createdAt: '2026-05-01', updatedAt: '2026-05-01'
      }
    ];

    // --- 监测任务数据 ---
    const monitorTasks = [
      { id: 'monitor-1', name: '云智品牌监测', keywords: ['云智', 'YunZhi'], classes: [9, 35, 38, 42], regions: ['CN'], alertThreshold: 80, status: 'active', matchCount: 3, createdAt: '2026-01-01' },
      { id: 'monitor-2', name: '智联品牌监测', keywords: ['智联', 'ZhiLian'], classes: [9, 35, 38], regions: ['CN', 'US'], alertThreshold: 75, status: 'active', matchCount: 2, createdAt: '2026-01-01' },
      { id: 'monitor-3', name: '竞品批量监测', keywords: ['星联', '海翼'], classes: [9, 12, 35], regions: ['CN', 'EU', 'US'], alertThreshold: 70, status: 'active', matchCount: 5, createdAt: '2026-02-01' }
    ];

    // --- 监测结果数据 ---
    const monitorResults = [
      { id: 'mr-1', taskId: 'monitor-1', taskName: '云智品牌监测', keyword: '云智', matchedName: '云智科技', appNo: '78954321', applicant: '深圳云智科技有限公司', niceClass: 9, similarity: 95, riskLevel: 'high', riskLabel: '高', myImage: '../assets/tm-yunzhi.png', matchedImage: '../assets/tm-yunzhi-tech.png', status: 'unhandled', monitorDate: dateOffset(-1), suggestion: '异议/谈判' },
      { id: 'mr-2', taskId: 'monitor-1', taskName: '云智品牌监测', keyword: '云智', matchedName: '智云', appNo: '78951234', applicant: '北京智云时代', niceClass: 38, similarity: 78, riskLevel: 'medium', riskLabel: '中', myImage: '../assets/tm-yunzhi.png', matchedImage: '../assets/tm-yunzhi.png', status: 'unhandled', monitorDate: dateOffset(-2), suggestion: '关注' },
      { id: 'mr-3', taskId: 'monitor-2', taskName: '智联品牌监测', keyword: '智联', matchedName: '智连', appNo: '78890123', applicant: '广州智连科技', niceClass: 38, similarity: 82, riskLevel: 'medium', riskLabel: '中', myImage: '../assets/tm-zhilian.png', matchedImage: '../assets/tm-zhilian.png', status: 'unhandled', monitorDate: dateOffset(-2), suggestion: '关注/异议' },
      { id: 'mr-4', taskId: 'monitor-1', taskName: '云智品牌监测', keyword: '云智', matchedName: '云之智慧', appNo: '78960001', applicant: '杭州云之公司', niceClass: 42, similarity: 65, riskLevel: 'low', riskLabel: '低', myImage: '../assets/tm-yunzhi.png', matchedImage: '../assets/tm-yunzhi.png', status: 'watching', monitorDate: dateOffset(-5), suggestion: '持续监测' },
      { id: 'mr-5', taskId: 'monitor-3', taskName: '竞品批量监测', keyword: '海翼', matchedName: '海翼出行', appNo: '78970001', applicant: '上海海翼科技', niceClass: 12, similarity: 88, riskLevel: 'high', riskLabel: '高', myImage: '../assets/tm-haiyi.png', matchedImage: '../assets/tm-haiyi.png', status: 'unhandled', monitorDate: dateOffset(-3), suggestion: '异议' }
    ];

    // --- 通知数据 ---
    const notifications = [
      { id: 'notif-1', type: 'deadline', typeLabel: '期限预警', title: '云智驳回复审官方绝限将至', content: '案件TM-2026-0042官方绝限为' + dateOffset(2) + '，剩余2天', relatedCaseId: 'TM-2026-0042', isRead: false, createdAt: dateOffset(0) + ' 09:00', actionUrl: 'case-detail.html?id=TM-2026-0042', actionText: '立即处理' },
      { id: 'notif-2', type: 'deadline', typeLabel: '期限预警', title: '智联异议答辩内部期限提醒', content: '案件TM-2026-0031内部期限为' + dateOffset(1) + '，剩余1天', relatedCaseId: 'TM-2026-0031', isRead: false, createdAt: dateOffset(0) + ' 09:30', actionUrl: 'case-detail.html?id=TM-2026-0031', actionText: '立即处理' },
      { id: 'notif-3', type: 'collaboration', typeLabel: '协作消息', title: '金诚律所提交新文件', content: '驳回复审理由书_v2已提交，请尽快审核', relatedCaseId: 'TM-2026-0042', isRead: false, createdAt: '2026-05-03 10:30', actionUrl: 'case-detail.html?id=TM-2026-0042&tab=docs', actionText: '查看文档' },
      { id: 'notif-4', type: 'approval', typeLabel: '审批提醒', title: '费用申请待审批', content: '张法务提交的马德里费用申请¥156,000等待您的审批', relatedCaseId: 'FA-2026-0089', isRead: false, createdAt: '2026-05-01 10:05', actionUrl: 'fees.html?tab=approval', actionText: '去审批' },
      { id: 'notif-5', type: 'deadline', typeLabel: '期限预警', title: '星联续展官费待缴纳', content: '案件TM-2025-0098续展官费待缴纳，绝限' + dateOffset(6), relatedCaseId: 'TM-2025-0098', isRead: true, createdAt: '2026-04-28 14:00', actionUrl: 'case-detail.html?id=TM-2025-0098', actionText: '查看案件' }
    ];

    // --- 近期动态 ---
    const activities = [
      { id: 'act-1', type: 'official', typeLabel: '官文', icon: '📄', title: '商标"云智"收到驳回通知书', content: '商标局下发驳回通知书，引证在先商标78954321', caseId: 'TM-2026-0042', caseName: '云智-驳回复审', createdAt: '2026-05-03 14:30' },
      { id: 'act-2', type: 'collaboration', typeLabel: '协作', icon: '💬', title: '马德里申请"海翼"进入WIPO审查阶段', content: 'WIPO已分配国际注册号，进入形式审查', caseId: 'TM-2025-0189', caseName: '海翼-马德里申请', createdAt: '2026-05-02 09:15' },
      { id: 'act-3', type: 'collaboration', typeLabel: '协作', icon: '💬', title: '金诚律所提交异议答辩书（智联）', content: '异议答辩书及证据材料已上传系统', caseId: 'TM-2026-0031', caseName: '智联-异议答辩', createdAt: '2026-05-01 16:45' },
      { id: 'act-4', type: 'fee', typeLabel: '费用', icon: '💰', title: '星联商标续展官费已缴纳', content: '¥18,000续展官费已支付至商标局', caseId: 'TM-2025-0098', caseName: '星联-续展', createdAt: '2026-04-30 11:20' },
      { id: 'act-5', type: 'system', typeLabel: '系统', icon: '🔔', title: '监测发现新近似商标', content: '监测到"云智科技"（78954321）与云智相似度95%', caseId: 'mr-1', caseName: '监测-云智科技', createdAt: '2026-04-29 08:00' },
      { id: 'act-6', type: 'official', typeLabel: '官文', icon: '📄', title: '明达收到不予注册复审决定', content: '商标局维持不予注册决定，建议提起复审', caseId: 'TM-2026-0028', caseName: '明达-不予注册复审', createdAt: '2026-04-25 10:00' },
      { id: 'act-7', type: 'fee', typeLabel: '费用', icon: '💰', title: 'Q2代理费结算单已生成', content: '金诚律所Q2代理费结算单共计¥420,000', caseId: null, caseName: null, createdAt: '2026-04-20 16:00' },
      { id: 'act-8', type: 'collaboration', typeLabel: '协作', icon: '💬', title: '美国Horizon商标行政诉讼开庭通知', content: 'TTAB已排期，预计2026-06-15开庭', caseId: 'TM-2025-0156', caseName: 'Horizon-行政诉讼', createdAt: '2026-04-18 09:30' }
    ];

    // 存储所有种子数据
    storageSet(STORAGE_KEYS.BRANDS, brands);
    storageSet(STORAGE_KEYS.LAW_FIRMS, lawFirms);
    storageSet(STORAGE_KEYS.CASES, cases);
    storageSet(STORAGE_KEYS.TODOS, todos);
    storageSet(STORAGE_KEYS.FEES, fees);
    storageSet(STORAGE_KEYS.FEE_APPS, feeApps);
    storageSet(STORAGE_KEYS.MONITOR_TASKS, monitorTasks);
    storageSet(STORAGE_KEYS.MONITOR_RESULTS, monitorResults);
    storageSet(STORAGE_KEYS.NOTIFICATIONS, notifications);
    storageSet(STORAGE_KEYS.ACTIVITIES, activities);
    storageSet(STORAGE_KEYS.USER_PREFS, {
      columnSettings: {},
      searchHistory: [],
      lastVisited: {}
    });
    storageSet(STORAGE_KEYS.VERSION, CURRENT_VERSION);

    console.log('[DataService] Seed data initialized successfully');
  }

  // ==================== 初始化 ====================
  function init() {
    const version = storageGet(STORAGE_KEYS.VERSION);
    if (!version || version !== CURRENT_VERSION) {
      // 清理旧数据或迁移
      if (version && version !== CURRENT_VERSION) {
        console.log('[DataService] Data version mismatch, re-seeding...');
        // 可选择性保留用户偏好
        const prefs = storageGet(STORAGE_KEYS.USER_PREFS);
        seedData();
        if (prefs) {
          storageSet(STORAGE_KEYS.USER_PREFS, prefs);
        }
      } else {
        seedData();
      }
    }
  }

  // ==================== CRUD 工厂 ====================
  function createCRUD(entityKey) {
    return {
      getAll: () => getEntity(entityKey),
      getById: (id) => getEntity(entityKey).find(item => item.id === id),
      query: (filters = {}) => {
        let results = getEntity(entityKey);
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            results = results.filter(item => {
              if (Array.isArray(value)) {
                return value.includes(item[key]);
              }
              if (typeof value === 'string' && value.includes('%')) {
                const searchTerm = value.replace(/%/g, '').toLowerCase();
                return String(item[key]).toLowerCase().includes(searchTerm);
              }
              return item[key] === value;
            });
          }
        });
        return results;
      },
      create: (data) => {
        const items = getEntity(entityKey);
        const newItem = { ...data, createdAt: getToday(), updatedAt: getToday() };
        items.push(newItem);
        setEntity(entityKey, items);
        return newItem;
      },
      update: (id, data) => {
        const items = getEntity(entityKey);
        const idx = items.findIndex(item => item.id === id);
        if (idx >= 0) {
          items[idx] = { ...items[idx], ...data, updatedAt: getToday() };
          setEntity(entityKey, items);
          return items[idx];
        }
        return null;
      },
      delete: (id) => {
        const items = getEntity(entityKey);
        const filtered = items.filter(item => item.id !== id);
        setEntity(entityKey, filtered);
        return filtered.length < items.length;
      }
    };
  }

  // ==================== 案件相关 ====================
  const casesCRUD = createCRUD(STORAGE_KEYS.CASES);

  function getCases(filters = {}) {
    let results = casesCRUD.getAll();

    if (filters.tab) {
      results = results.filter(c => c.type === (filters.tab === 'domestic' ? 'domestic' : 'overseas'));
    }
    if (filters.statusCode) {
      results = results.filter(c => c.statusCode === filters.statusCode);
    }
    if (filters.businessTypeCode) {
      results = results.filter(c => c.businessTypeCode === filters.businessTypeCode);
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      results = results.filter(c =>
        c.id.toLowerCase().includes(s) ||
        c.brandName.toLowerCase().includes(s) ||
        c.businessType.includes(s)
      );
    }
    if (filters.deadlineWithin) {
      const days = parseInt(filters.deadlineWithin);
      results = results.filter(c => {
        if (!c.officialDeadline) return false;
        return daysBetween(getToday(), c.officialDeadline) <= days;
      });
    }
    if (filters.assignee) {
      results = results.filter(c => c.responsibleUserId === filters.assignee);
    }

    return results;
  }

  function getCaseStats() {
    const all = casesCRUD.getAll();
    return {
      total: all.length,
      examining: all.filter(c => c.statusCode === 'examining').length,
      defensePeriod: all.filter(c => c.statusCode === 'defense_period').length,
      registered: all.filter(c => c.statusCode === 'registered').length,
      rejected: all.filter(c => c.statusCode === 'rejected').length,
      deadlineThisWeek: all.filter(c => c.officialDeadline && daysBetween(getToday(), c.officialDeadline) <= 7).length
    };
  }

  // ==================== 品牌相关 ====================
  const brandsCRUD = createCRUD(STORAGE_KEYS.BRANDS);

  function getBrandMatrix() {
    const brands = brandsCRUD.getAll();
    const matrix = {};
    brands.forEach(brand => {
      matrix[brand.id] = {};
      for (let i = 1; i <= 45; i++) {
        const cls = brand.classMatrix[String(i)];
        if (cls) {
          matrix[brand.id][i] = cls.status;
        } else {
          matrix[brand.id][i] = 'gap';
        }
      }
    });
    return { brands, matrix };
  }

  function getGapAnalysis() {
    const brands = brandsCRUD.getAll();
    const gaps = [];
    brands.forEach(brand => {
      for (let i = 1; i <= 45; i++) {
        const cls = brand.classMatrix[String(i)];
        if (!cls || cls.status === 'gap') {
          const isCore = [9, 35, 38, 42].includes(i);
          gaps.push({
            brandId: brand.id,
            brandName: brand.name,
            classNo: i,
            className: NICE_CLASS_NAMES[i],
            priority: isCore ? 'high' : 'medium',
            reason: isCore ? `核心类别，当前未注册，建议优先补注` : `防御性注册建议`
          });
        }
      }
    });
    return gaps.sort((a, b) => (a.priority === 'high' ? -1 : 1));
  }

  // ==================== 待办相关 ====================
  const todosCRUD = createCRUD(STORAGE_KEYS.TODOS);

  function getTodosByDeadline() {
    return todosCRUD.getAll().filter(t => t.status === 'pending').sort((a, b) => {
      return new Date(a.deadline) - new Date(b.deadline);
    });
  }

  function completeTodo(id) {
    return todosCRUD.update(id, { status: 'completed', completedAt: getToday() });
  }

  // ==================== 费用相关 ====================
  const feesCRUD = createCRUD(STORAGE_KEYS.FEES);
  const feeAppsCRUD = createCRUD(STORAGE_KEYS.FEE_APPS);

  function getFeeStats() {
    const fees = feesCRUD.getAll();
    const apps = feeAppsCRUD.getAll();
    const annualBudget = 2800000;
    const totalSpent = fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
    const totalPending = apps.filter(a => a.status === 'pending').reduce((s, a) => s + a.amount, 0);
    const remaining = annualBudget - totalSpent;
    const yearProgress = (new Date().getMonth() + 1) / 12;
    const budgetProgress = totalSpent / annualBudget;
    let executionStatus = 'normal';
    if (budgetProgress > yearProgress + 0.05) executionStatus = 'ahead';
    else if (budgetProgress < yearProgress - 0.05) executionStatus = 'behind';

    return {
      annualBudget,
      totalSpent,
      totalPending,
      remaining,
      executionRate: Math.round((totalSpent / annualBudget) * 100),
      yearProgress: Math.round(yearProgress * 100),
      executionStatus
    };
  }

  // ==================== 律所相关 ====================
  const lawFirmsCRUD = createCRUD(STORAGE_KEYS.LAW_FIRMS);

  function getLawFirmStats() {
    const firms = lawFirmsCRUD.getAll();
    return {
      total: firms.length,
      activeCases: firms.reduce((s, f) => s + f.casesCount, 0),
      avgRating: (firms.reduce((s, f) => s + f.rating, 0) / firms.length).toFixed(1),
      pendingReplies: 7 // 可从消息数据计算
    };
  }

  // ==================== 监测相关 ====================
  const monitorResultsCRUD = createCRUD(STORAGE_KEYS.MONITOR_RESULTS);

  function getMonitorStats() {
    const results = monitorResultsCRUD.getAll();
    return {
      taskCount: getEntity(STORAGE_KEYS.MONITOR_TASKS).length,
      todayMatches: results.filter(r => r.monitorDate === getToday()).length,
      highRiskCount: results.filter(r => r.riskLevel === 'high' && r.status === 'unhandled').length,
      handledCount: results.filter(r => r.status !== 'unhandled').length
    };
  }

  // ==================== 通知相关 ====================
  const notificationsCRUD = createCRUD(STORAGE_KEYS.NOTIFICATIONS);

  function getUnreadCount() {
    return notificationsCRUD.query({ isRead: false }).length;
  }

  function markAllNotificationsRead() {
    const items = notificationsCRUD.getAll();
    items.forEach(n => n.isRead = true);
    setEntity(STORAGE_KEYS.NOTIFICATIONS, items);
  }

  // ==================== 近期动态 ====================
  const activitiesCRUD = createCRUD(STORAGE_KEYS.ACTIVITIES);

  // ==================== 用户偏好 ====================
  function getUserPrefs() {
    return storageGet(STORAGE_KEYS.USER_PREFS) || { columnSettings: {}, searchHistory: [], lastVisited: {} };
  }

  function setColumnSettings(page, columns) {
    const prefs = getUserPrefs();
    prefs.columnSettings[page] = columns;
    storageSet(STORAGE_KEYS.USER_PREFS, prefs);
  }

  function getColumnSettings(page) {
    return getUserPrefs().columnSettings[page] || null;
  }

  // ==================== 草稿自动保存 ====================
  function saveDraft(key, data) {
    const drafts = storageGet(STORAGE_KEYS.DRAFTS) || {};
    drafts[key] = { data, savedAt: new Date().toISOString() };
    storageSet(STORAGE_KEYS.DRAFTS, drafts);
  }

  function getDraft(key) {
    const drafts = storageGet(STORAGE_KEYS.DRAFTS) || {};
    return drafts[key] || null;
  }

  function clearDraft(key) {
    const drafts = storageGet(STORAGE_KEYS.DRAFTS) || {};
    delete drafts[key];
    storageSet(STORAGE_KEYS.DRAFTS, drafts);
  }

  // ==================== 导出接口 ====================
  return {
    // 初始化
    init,
    seedData,

    // 常量
    NICE_CLASS_NAMES,
    STATUS_MAP,

    // 工具
    generateId,
    getToday,
    daysBetween,

    // 案件
    getCases,
    getCaseById: casesCRUD.getById,
    createCase: casesCRUD.create,
    updateCase: casesCRUD.update,
    deleteCase: casesCRUD.delete,
    getCaseStats,

    // 品牌
    getBrands: brandsCRUD.getAll,
    getBrandById: brandsCRUD.getById,
    getBrandMatrix,
    getGapAnalysis,
    updateBrand: brandsCRUD.update,

    // 待办
    getTodos: todosCRUD.getAll,
    getTodosByDeadline,
    getTodoById: todosCRUD.getById,
    createTodo: todosCRUD.create,
    updateTodo: todosCRUD.update,
    completeTodo,
    deleteTodo: todosCRUD.delete,

    // 费用
    getFees: feesCRUD.getAll,
    getFeeById: feesCRUD.getById,
    createFee: feesCRUD.create,
    getFeeStats,
    getFeeApplications: feeAppsCRUD.getAll,
    getFeeAppById: feeAppsCRUD.getById,
    createFeeApplication: feeAppsCRUD.create,
    updateFeeApplication: feeAppsCRUD.update,
    approveFeeApplication: (id, level) => {
      const app = feeAppsCRUD.getById(id);
      if (!app) return null;
      const flow = app.flow.map(f => {
        if (f.level === level) return { ...f, status: 'completed', actionAt: new Date().toISOString() };
        if (f.level === level + 1) return { ...f, status: 'current' };
        return f;
      });
      const allCompleted = flow.every(f => f.status === 'completed');
      return feeAppsCRUD.update(id, { flow, status: allCompleted ? 'approved' : app.status });
    },

    // 律所
    getLawFirms: lawFirmsCRUD.getAll,
    getLawFirmById: lawFirmsCRUD.getById,
    getLawFirmStats,
    rateLawFirm: (id, score, comment) => {
      const firm = lawFirmsCRUD.getById(id);
      if (!firm) return null;
      const reviews = firm.reviews || [];
      reviews.push({ rating: score, text: comment, author: '张法务', date: getToday() });
      const newRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
      return lawFirmsCRUD.update(id, { rating: parseFloat(newRating), reviews });
    },

    // 监测
    getMonitorTasks: () => getEntity(STORAGE_KEYS.MONITOR_TASKS),
    getMonitorResults: monitorResultsCRUD.getAll,
    getMonitorResultById: monitorResultsCRUD.getById,
    getMonitorStats,
    handleMonitorResult: (id, action) => {
      const statusMap = { oppose: 'opposed', negotiate: 'negotiating', watch: 'watching' };
      return monitorResultsCRUD.update(id, { status: statusMap[action] || 'handled' });
    },

    // 通知
    getNotifications: notificationsCRUD.getAll,
    getUnreadNotifications: () => notificationsCRUD.query({ isRead: false }),
    getUnreadCount,
    markNotificationRead: (id) => notificationsCRUD.update(id, { isRead: true }),
    markAllNotificationsRead,
    createNotification: notificationsCRUD.create,

    // 动态
    getActivities: () => activitiesCRUD.getAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),

    // 用户偏好
    getUserPrefs,
    setColumnSettings,
    getColumnSettings,

    // 草稿
    saveDraft,
    getDraft,
    clearDraft,

    // 通用
    getEntity,
    setEntity,
    storageGet,
    storageSet
  };
})();

// 自动初始化
if (typeof window !== 'undefined') {
  window.DataService = DataService;
  document.addEventListener('DOMContentLoaded', () => {
    DataService.init();
  });
}

// 兼容模块导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataService;
}
