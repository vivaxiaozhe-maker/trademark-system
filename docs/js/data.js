const AppData = {
  user: {
    name: "张法务", role: "高级法务经理", avatar: "张",
    dept: "知识产权部", company: "科技创新集团"
  },

  stats: {
    pendingCases: 42,
    weeklyDeadlines: 18,
    totalTrademarks: 1256,
    monthlyNewApply: 23,
    monthlyNewReg: 15,
    overdueCount: 3
  },

  kpis: [
    { label: "待处理案件", value: 42, trend: "+5", up: true, icon: "📋", color: "blue" },
    { label: "本周到期期限", value: 18, trend: "-2", up: false, icon: "⏰", color: "orange" },
    { label: "在册商标总量", value: 1256, trend: "+12", up: true, icon: "🏷️", color: "green" },
    { label: "本月新申请", value: 23, trend: "+8", up: true, icon: "📝", color: "purple" }
  ],

  todos: [
    { id: 1, title: "商标'云智'驳回复审材料准备", type: "案件处理", priority: "urgent", deadline: "2026-05-06", caseNo: "TM-2026-0042", status: "待处理" },
    { id: 2, title: "马德里国际申请WIPO费用支付确认", type: "费用审批", priority: "high", deadline: "2026-05-07", caseNo: "TM-2025-0189", status: "待审批" },
    { id: 3, title: "律所提交的异议答辩书审核", type: "文件批注", priority: "high", deadline: "2026-05-08", caseNo: "TM-2026-0031", status: "待批注" },
    { id: 4, title: "品牌A 第35类补充注册评估", type: "风险评估", priority: "medium", deadline: "2026-05-12", caseNo: "EV-2026-0015", status: "待评估" },
    { id: 5, title: "年度商标续展预算编制", type: "预算编制", priority: "medium", deadline: "2026-05-15", caseNo: "BG-2026-0003", status: "待编制" },
    { id: 6, title: "'星联'商标使用证据收集", type: "证据管理", priority: "normal", deadline: "2026-05-20", caseNo: "TM-2025-0098", status: "待收集" },
    { id: 7, title: "智联知识产权Q2服务评价", type: "服务评价", priority: "normal", deadline: "2026-05-25", caseNo: "EV-2026-0018", status: "待评价" },
    { id: 8, title: "商标监测周报确认", type: "监测报告", priority: "low", deadline: "2026-05-30", caseNo: "MN-2026-0012", status: "待确认" }
  ],

  deadlines: [
    { id: 1, name: "云智-驳回复审", type: "官方绝限", date: "2026-05-06", days: 2, level: "urgent", caseNo: "TM-2026-0042" },
    { id: 2, name: "智联-异议答辩", type: "内部期限", date: "2026-05-07", days: 3, level: "urgent", caseNo: "TM-2026-0031" },
    { id: 3, name: "星联-续展申请", type: "客户期限", date: "2026-05-10", days: 6, level: "high", caseNo: "TM-2025-0098" },
    { id: 4, name: "海翼-Madrid审查答复", type: "官方绝限", date: "2026-05-15", days: 11, level: "high", caseNo: "TM-2025-0189" },
    { id: 5, name: "明达-不予注册复审", type: "内部期限", date: "2026-05-22", days: 18, level: "medium", caseNo: "TM-2026-0028" }
  ],

  cases: [
    { id: "TM-2026-0042", name: "云智", type: "驳回复审", category: "国内案件", status: "审查中", agent: "智联知识产权", deadline: "2026-05-06", owner: "张法务", progress: 65 },
    { id: "TM-2026-0031", name: "智联", type: "异议答辩", category: "国内案件", status: "答辩期", agent: "元健律师事务所", deadline: "2026-05-07", owner: "张法务", progress: 30 },
    { id: "TM-2025-0189", name: "海翼", type: "马德里申请", category: "海外案件", status: "WIPO审查", agent: "WIPO/当地所", deadline: "2026-05-15", owner: "李流程", progress: 45 },
    { id: "TM-2026-0028", name: "明达", type: "不予注册复审", category: "国内案件", status: "准备材料", agent: "智联知识产权", deadline: "2026-05-22", owner: "张法务", progress: 20 },
    { id: "TM-2026-0056", name: "悦动", type: "新申请", category: "国内案件", status: "受理中", agent: "元健律师事务所", deadline: "2026-06-01", owner: "王流程", progress: 15 },
    { id: "TM-2025-0098", name: "星联", type: "续展", category: "国内案件", status: "待缴费", agent: "智联知识产权", deadline: "2026-05-10", owner: "张法务", progress: 80 },
    { id: "TM-2026-0071", name: "睿思", type: "撤三答辩", category: "国内案件", status: "证据收集", agent: "元健律师事务所", deadline: "2026-06-10", owner: "张法务", progress: 40 },
    { id: "TM-2025-0203", name: "启航", type: "单一国家申请", category: "海外案件", status: "审查中", agent: "Horizon Law Group", deadline: "2026-06-20", owner: "李流程", progress: 55 }
  ],

  brands: [
    { name: "云智", categories: [9,35,38,42], total: 4, registered: 3, pending: 1, expired: 0, risk: "low" },
    { name: "智联", categories: [9,35,38,42,45], total: 5, registered: 4, pending: 1, expired: 0, risk: "medium" },
    { name: "海翼", categories: [12,35,37], total: 3, registered: 2, pending: 1, expired: 0, risk: "low" },
    { name: "星联", categories: [9,35,38,41,42,45], total: 6, registered: 5, pending: 0, expired: 1, risk: "high" },
    { name: "悦动", categories: [25,35], total: 2, registered: 0, pending: 2, expired: 0, risk: "low" },
    { name: "睿思", categories: [9,35,38,42], total: 4, registered: 3, pending: 1, expired: 0, risk: "medium" },
    { name: "明达", categories: [35,36,42], total: 3, registered: 2, pending: 1, expired: 0, risk: "medium" },
    { name: "启航", categories: [35,39], total: 2, registered: 1, pending: 1, expired: 0, risk: "low" }
  ],

  lawFirms: [
    { name: "智联知识产权", logo: "tm-zhilian.png", cases: 52, rating: 4.9, responseTime: "1.8h", successRate: "94%", feeLevel: "高", status: "合作中", contact: { person: "李律师·合伙人", phone: "138-0013-8001", email: "lizl@zhilianip.com", wechat: "zhilian_li", feishu: "李智联" } },
    { name: "元健律师事务所", logo: "tm-yuanjian.png", cases: 41, rating: 4.7, responseTime: "3.2h", successRate: "91%", feeLevel: "中高", status: "合作中", contact: { person: "王律师·主任", phone: "139-0014-9002", email: "wangyj@yuanjianlaw.com", wechat: "yuanjian_wang", feishu: "王元健" } },
    { name: "启航知识产权", logo: "tm-qihang.png", cases: 35, rating: 4.5, responseTime: "4.5h", successRate: "89%", feeLevel: "中", status: "合作中", contact: { person: "张律师·合伙人", phone: "137-0012-7003", email: "zhangqh@qihangip.com", wechat: "qihang_zhang", feishu: "张启航" } },
    { name: "海翼律师事务所", logo: "tm-haiyi.png", cases: 28, rating: 4.6, responseTime: "3.8h", successRate: "90%", feeLevel: "中高", status: "合作中", contact: { person: "陈律师·合伙人", phone: "136-0011-6004", email: "chenhy@haiyilaw.com", wechat: "haiyi_chen", feishu: "陈海翼" } },
    { name: "Horizon Law Group", logo: "tm-horizon.png", cases: 15, rating: 4.8, responseTime: "6h", successRate: "93%", feeLevel: "高", status: "合作中", contact: { person: "Michael Chen·Partner", phone: "+1-415-555-0101", email: "m.chen@horizonlaw.com", wechat: "horizon_mike", feishu: "MichaelChen" } },
    { name: "云智知识产权", logo: "tm-yunzhi.png", cases: 38, rating: 4.4, responseTime: "5h", successRate: "87%", feeLevel: "中", status: "合作中", contact: { person: "刘律师·合伙人", phone: "135-0010-5005", email: "liuyz@yunzhiip.com", wechat: "yunzhi_liu", feishu: "刘云智" } },
    { name: "瑞思律师事务所", logo: "tm-ruisi.png", cases: 22, rating: 4.3, responseTime: "5.5h", successRate: "86%", feeLevel: "中", status: "合作中", contact: { person: "赵律师·合伙人", phone: "134-0009-4006", email: "zhaors@ruisilaw.com", wechat: "ruisi_zhao", feishu: "赵瑞思" } },
    { name: "明达律师事务所", logo: "tm-mingda.png", cases: 19, rating: 4.7, responseTime: "2.5h", successRate: "92%", feeLevel: "高", status: "合作中", contact: { person: "孙律师·主任", phone: "133-0008-3007", email: "sunmd@mingdalaw.com", wechat: "mingda_sun", feishu: "孙明达" } },
    { name: "星联知识产权", logo: "tm-xinglian.png", cases: 30, rating: 4.5, responseTime: "4h", successRate: "88%", feeLevel: "中", status: "合作中", contact: { person: "周律师·合伙人", phone: "132-0007-2008", email: "zhouxl@xinglianip.com", wechat: "xinglian_zhou", feishu: "周星联" } },
    { name: "跃动律师事务所", logo: "tm-yuedong.png", cases: 16, rating: 4.2, responseTime: "6.5h", successRate: "85%", feeLevel: "低", status: "合作中", contact: { person: "吴律师·合伙人", phone: "131-0006-1009", email: "wuyd@yuedonglaw.com", wechat: "yuedong_wu", feishu: "吴跃动" } },
    { name: "云智科技", logo: "tm-yunzhi-tech.png", cases: 24, rating: 4.4, responseTime: "4.8h", successRate: "89%", feeLevel: "中", status: "合作中", contact: { person: "郑经理·技术总监", phone: "130-0005-0010", email: "zheng@yunzhitech.com", wechat: "yunzhitech_zheng", feishu: "郑云智" } }
  ],

  fees: {
    budget: 2800000,
    spent: 1865000,
    pending: 450000,
    approved: 1415000,
    byType: [
      { type: "官费", amount: 520000, pct: 28 },
      { type: "代理费", amount: 1120000, pct: 60 },
      { type: "翻译费", amount: 125000, pct: 7 },
      { type: "其他", amount: 100000, pct: 5 }
    ]
  },

  bills: [
    { id: "BILL-2026-0156", caseFileNo: "CF-2026-0042", trademarkNo: "TM-2026-0042", appNo: "20260115001", caseFileType: "代理费", feeType: "代理费", feeName: "驳回复审代理费（一审）", amount: 85000, currency: "CNY", paymentDeadline: "2026-05-15", paidDate: "", createdDate: "2026-04-28", applicant: "深圳市唯德科创信息有限公司", lawFirm: "智联知识产权", caseNo: "TM-2026-0042", type: "代理费", status: "待审批" },
    { id: "BILL-2026-0155", caseFileNo: "CF-2025-0189", trademarkNo: "TM-2025-0189", appNo: "20250815002", caseFileType: "官费", feeType: "官费", feeName: "WIPO基础费+指定国费", amount: 12000, currency: "CNY", paymentDeadline: "2026-05-10", paidDate: "2026-04-26", createdDate: "2026-04-25", applicant: "北京海翼科技有限公司", lawFirm: "WIPO", caseNo: "TM-2025-0189", type: "官费", status: "已审批" },
    { id: "BILL-2026-0154", caseFileNo: "CF-2026-0031", trademarkNo: "TM-2026-0031", appNo: "20251110002", caseFileType: "代理费", feeType: "代理费", feeName: "异议答辩代理费", amount: 35000, currency: "CNY", paymentDeadline: "2026-05-08", paidDate: "2026-04-23", createdDate: "2026-04-22", applicant: "上海智联信息技术有限公司", lawFirm: "元健律师事务所", caseNo: "TM-2026-0031", type: "代理费", status: "已付款" },
    { id: "BILL-2026-0153", caseFileNo: "CF-2025-0203", trademarkNo: "TM-2025-0203", appNo: "98765432", caseFileType: "代理费", feeType: "代理费", feeName: "美国商标行政诉讼代理费", amount: 45000, currency: "USD", paymentDeadline: "2026-05-20", paidDate: "", createdDate: "2026-04-20", applicant: "广州启航科技有限公司", lawFirm: "Horizon Law Group", caseNo: "TM-2025-0203", type: "代理费", status: "待审批" },
    { id: "BILL-2026-0152", caseFileNo: "CF-2025-0098", trademarkNo: "TM-2025-0098", appNo: "20160110005", caseFileType: "官费", feeType: "官费", feeName: "6类续展官费（每类3000）", amount: 28000, currency: "CNY", paymentDeadline: "2026-05-10", paidDate: "2026-04-19", createdDate: "2026-04-18", applicant: "深圳市星联电子有限公司", lawFirm: "智联知识产权", caseNo: "TM-2025-0098", type: "官费+代理", status: "已付款" },
    { id: "BILL-2026-0151", caseFileNo: "CF-2026-0056", trademarkNo: "TM-2026-0056", appNo: "20260320003", caseFileType: "官费", feeType: "官费", feeName: "新申请官费（2类）", amount: 600, currency: "CNY", paymentDeadline: "2026-06-01", paidDate: "2026-04-15", createdDate: "2026-04-15", applicant: "杭州悦动服饰有限公司", lawFirm: "元健律师事务所", caseNo: "TM-2026-0056", type: "官费", status: "已付款" },
    { id: "BILL-2026-0150", caseFileNo: "CF-2026-0028", trademarkNo: "TM-2026-0028", appNo: "20260201004", caseFileType: "翻译费", feeType: "翻译费", feeName: "不予注册复审材料翻译", amount: 8000, currency: "CNY", paymentDeadline: "2026-05-22", paidDate: "", createdDate: "2026-04-12", applicant: "苏州明达照明有限公司", lawFirm: "智联知识产权", caseNo: "TM-2026-0028", type: "翻译费", status: "待审批" },
    { id: "BILL-2026-0149", caseFileNo: "CF-2026-0071", trademarkNo: "TM-2026-0071", appNo: "20240601006", caseFileType: "调查费", feeType: "调查费", feeName: "撤三证据收集调查费", amount: 15000, currency: "CNY", paymentDeadline: "2026-06-10", paidDate: "2026-04-10", createdDate: "2026-04-10", applicant: "南京睿思软件有限公司", lawFirm: "元健律师事务所", caseNo: "TM-2026-0071", type: "调查费", status: "已付款" },
    { id: "BILL-2026-0148", caseFileNo: "CF-2026-0012", trademarkNo: "TM-2026-0012", appNo: "20260120007", caseFileType: "检索费", feeType: "检索费", feeName: "异议申请前置检索费", amount: 5000, currency: "CNY", paymentDeadline: "2026-06-15", paidDate: "", createdDate: "2026-04-08", applicant: "成都远见科技有限公司", lawFirm: "金诚律师事务所", caseNo: "TM-2026-0012", type: "检索费", status: "待审批" },
    { id: "BILL-2026-0147", caseFileNo: "CF-2025-0156", trademarkNo: "TM-2025-0156", appNo: "98/765,432", caseFileType: "其他", feeType: "其他", feeName: "美国TTAB行政诉讼出庭费", amount: 25000, currency: "USD", paymentDeadline: "2026-06-15", paidDate: "2026-04-05", createdDate: "2026-04-05", applicant: "深圳Horizon科技（美国）", lawFirm: "Horizon Law Group", caseNo: "TM-2025-0156", type: "其他", status: "已付款" }
  ],

  monitors: [
    { id: 1, keyword: "云智", type: "商标监测", matchCount: 3, risk: "high", lastUpdate: "2026-05-03" },
    { id: 2, keyword: "智联", type: "主体监测", matchCount: 1, risk: "medium", lastUpdate: "2026-05-03" },
    { id: 3, keyword: "海翼", type: "商标监测", matchCount: 0, risk: "low", lastUpdate: "2026-05-02" },
    { id: 4, keyword: "竞争对手A", type: "主体监测", matchCount: 5, risk: "high", lastUpdate: "2026-05-01" }
  ],

  messages: [
    { id: 1, title: "商标'云智'驳回复审期限将至", time: "10分钟前", type: "urgent", read: false },
    { id: 2, title: "智联知识产权提交了新的答辩材料", time: "1小时前", type: "normal", read: false },
    { id: 3, title: "5月费用预算执行率达到85%", time: "3小时前", type: "normal", read: true },
    { id: 4, title: "马德里申请进入WIPO审查阶段", time: "昨天", type: "normal", read: true }
  ],

  caseDetail: {
    id: "TM-2026-0042",
    brandName: "云智",
    applicant: "深圳市唯德科创信息有限公司",
    priority: "high",
    feeDept: "知识产权部",
    agent: "金诚律师事务所",
    goodsServices: "计算机软件出租;计算机游戏软件的设计和开发;计算机软件维护和更新;为他人提供计算机软件设计;计算机设备出租;计算机系统远程监控;计算机数据的恢复;计算机软件和程序出租;数据加密服务;创建、设计和维护网站",
    rejection: {
      isRejection: true,
      rejectionType: "部分驳回",
      docNumber: "TMZC81140188BFBH01",
      officialDate: "2025-01-15",
      officialDeadline: "2025-01-25",
      internalDeadline: "2025-01-30",
      isSplit: "否",
      rejectedGoods: "振动按摩器,电疗器械",
      rejectionReason: "该商标与下列在先商标相同或近似:第79480607号、第80893707号...",
      agentSuggestion: "建议对驳回商品进行分割申请，核心商品予以保留，被驳回商品重新设计商标后再次提交。"
    }
  },

  caseWorkflow: [
    { node: "开始节点", handler: "李四", time: "2025-05-16 10:26:04", result: "-", duration: "-", opinion: "同意" },
    { node: "商标管理员确认复审", handler: "系统管理员", time: "2025-05-16 10:27:12", result: "-", duration: "0小时", opinion: "同意" },
    { node: "事务所撰写", handler: "李四", time: "2025-05-16 10:27:59", result: "-", duration: "0小时", opinion: "同意" },
    { node: "商标管理员审核", handler: "系统管理员", time: "2025-05-16 10:28:18", result: "-", duration: "0小时", opinion: "同意" },
    { node: "事务所递交", handler: "李四", time: "2025-05-16 10:31:22", result: "-", duration: "0小时", opinion: "同意" },
    { node: "上传受理通知书", handler: "李四", time: "2025-06-23 08:32:52", result: "-", duration: "910小时", opinion: "同意" },
    { node: "结束节点-复审", handler: "-", time: "-", result: "-", duration: "-", opinion: "-" }
  ],

  citedMarks: [
    { seq: 1, appNo: "79480607", appDate: "2024-06-12", image: "../assets/tm-cited-1.png", applicant: "深圳智云科技有限公司", niceClass: "10", goods: "振动按摩器,电疗器械", legalStatus: "有效", regDate: "2025-02-20", term: "2025-02-20 至 2035-02-19", action: "查看" },
    { seq: 2, appNo: "80893707", appDate: "2024-09-18", image: "../assets/tm-cited-2.png", applicant: "北京康健医疗设备有限公司", niceClass: "10", goods: "电疗器械,按摩仪器", legalStatus: "有效", regDate: "2025-04-15", term: "2025-04-15 至 2035-04-14", action: "查看" }
  ],

  // 新建案件下拉选项
  caseTypes: [
    { code: 'new_apply', label: '单一注册', category: 'new' },
    { code: 'madrid', label: '马德里申请', category: 'new' },
    { code: 'renewal', label: '续展', category: 'renewal' },
    { code: 'reexamination', label: '驳回复审', category: 'rejection' },
    { code: 'defense', label: '异议答辩', category: 'defense' },
    { code: 'cancellation', label: '撤三答辩', category: 'cancellation' },
    { code: 'invalidation', label: '无效宣告', category: 'other' },
    { code: 'other', label: '其他', category: 'other' }
  ],
  departments: ['知识产权部', '法务部', '品牌管理部', '海外市场部', '产品研发部', '财务部'],
  countries: ['中国', '美国', '欧盟', '日本', '韩国', '新加坡', '澳大利亚', '加拿大', '英国', '德国', '法国', '印度', '巴西', '俄罗斯'],
  priorities: ['高', '中', '低'],
  projects: ['云智项目', '智联项目', '海翼项目', '星联项目', '悦动项目'],
  productList: ['智能手机', '智能家居', '可穿戴设备', '云服务', '物联网平台', '人工智能'],
  brandList: ['云智', '智联', '海翼', '星联', '悦动', '睿思', '明达', '远见', 'Horizon'],
  sources: ['自主申请', '受让取得', '并购取得', '许可使用', '其他'],
  trademarkTypes: ['一般', '集体', '证明', '特殊'],
  legalStatusList: ['申请中', '初审公告', '已注册', '驳回复审中', '异议中', '无效宣告中', '撤销中', '已失效'],
  iprList: ['张法务', '李流程', '王流程', '赵法务'],
  agents: ['智联知识产权', '元健律师事务所', 'Horizon Law Group', '启航知识产权', '海翼律师事务所', '金诚律师事务所'],
  agentPersons: ['李律师·合伙人', '王律师·主任', 'Michael Chen·Partner', '张律师·合伙人', '陈律师·合伙人', '孙律师·主任'],
  priorityTypes: ['无', '在先优先权', '展会优先权'],
  rejectionTypes: ['部分驳回', '全部驳回'],
  statusList: ['申请中', '初审公告', '已注册', '驳回复审中', '异议中', '无效宣告中', '撤销中', '已失效', '待提交'],

  // 律所管理数据
  lawFirmsManagement: [
    { id: 'LF-001', name: '智联知识产权', serviceYears: 3, renewDate: '2026-08-15', contactPerson: '李律师·合伙人', contactEmail: 'lizl@zhilianip.com', contractFile: 'contract-zhilian-2026.pdf', baseFee: 85000, status: 'active' },
    { id: 'LF-002', name: '元健律师事务所', serviceYears: 2, renewDate: '2026-06-01', contactPerson: '王律师·主任', contactEmail: 'wangyj@yuanjianlaw.com', contractFile: 'contract-yuanjian-2026.pdf', baseFee: 65000, status: 'warning' },
    { id: 'LF-003', name: 'Horizon Law Group', serviceYears: 1, renewDate: '2026-12-20', contactPerson: 'Michael Chen·Partner', contactEmail: 'm.chen@horizonlaw.com', contractFile: 'contract-horizon-2026.pdf', baseFee: 120000, status: 'active' },
    { id: 'LF-004', name: '启航知识产权', serviceYears: 4, renewDate: '2026-05-10', contactPerson: '张律师·合伙人', contactEmail: 'zhangqh@qihangip.com', contractFile: 'contract-qihang-2026.pdf', baseFee: 55000, status: 'danger' },
    { id: 'LF-005', name: '海翼律师事务所', serviceYears: 2, renewDate: '2026-09-30', contactPerson: '陈律师·合伙人', contactEmail: 'chenhy@haiyilaw.com', contractFile: 'contract-haiyi-2026.pdf', baseFee: 72000, status: 'active' },
    { id: 'LF-006', name: '瑞思律师事务所', serviceYears: 5, renewDate: '2026-11-18', contactPerson: '赵律师·合伙人', contactEmail: 'zhaors@ruisilaw.com', contractFile: 'contract-ruisi-2026.pdf', baseFee: 58000, status: 'active' },
    { id: 'LF-007', name: '明达律师事务所', serviceYears: 3, renewDate: '2026-06-20', contactPerson: '孙律师·主任', contactEmail: 'sunmd@mingdalaw.com', contractFile: 'contract-mingda-2026.pdf', baseFee: 90000, status: 'warning' },
    { id: 'LF-008', name: '星联知识产权', serviceYears: 2, renewDate: '2026-10-08', contactPerson: '周律师·合伙人', contactEmail: 'zhouxl@xinglianip.com', contractFile: 'contract-xinglian-2026.pdf', baseFee: 68000, status: 'active' },
    { id: 'LF-009', name: '跃动律师事务所', serviceYears: 1, renewDate: '2026-05-25', contactPerson: '吴律师·合伙人', contactEmail: 'wuyd@yuedonglaw.com', contractFile: 'contract-yuedong-2026.pdf', baseFee: 45000, status: 'danger' },
    { id: 'LF-010', name: '云智知识产权', serviceYears: 4, renewDate: '2026-12-05', contactPerson: '刘律师·合伙人', contactEmail: 'liuyz@yunzhiip.com', contractFile: 'contract-yunzhi-2026.pdf', baseFee: 75000, status: 'active' },
    { id: 'LF-011', name: '金诚律师事务所', serviceYears: 3, renewDate: '2026-07-12', contactPerson: '郑律师·主任', contactEmail: 'zhengjc@jinchenglaw.com', contractFile: 'contract-jincheng-2026.pdf', baseFee: 82000, status: 'warning' },
    { id: 'LF-012', name: '北京中伦律师事务所', serviceYears: 6, renewDate: '2027-01-30', contactPerson: '钱律师·高级合伙人', contactEmail: 'qianzl@zhonglun.com', contractFile: 'contract-zhonglun-2026.pdf', baseFee: 150000, status: 'active' }
  ],

  // 检索中心相关数据
  searchCases: [
    { caseNo: 'SC-2026-0001', subject: '云智商标检索', currentNode: '检索完成', handler: '张法务', prevTime: '2026-05-03', searchMethod: '近似检索', agency: '智联知识产权', requester: '王经理', dept: '品牌管理部', brand: '云智', product: '智能手机', project: '云智项目', priority: '高', country: '中国', appNo: 'TM-2026-0042', agencyAdvice: '建议注册', adminAdvice: '同意', searchDeadline: '2026-05-10', completeDeadline: '2026-05-15', createdDate: '2026-05-01' },
    { caseNo: 'SC-2026-0002', subject: '智联海外多国检索', currentNode: '检索中', handler: '李流程', prevTime: '2026-05-02', searchMethod: '综合检索', agency: 'Horizon Law Group', requester: '赵总监', dept: '海外市场部', brand: '智联', product: '云服务', project: '智联项目', priority: '高', country: '美国', appNo: 'TM-2026-0031', agencyAdvice: '需补充检索', adminAdvice: '驳回', searchDeadline: '2026-05-08', completeDeadline: '2026-05-12', createdDate: '2026-04-28' },
    { caseNo: 'SC-2026-0003', subject: '海翼欧盟注册检索', currentNode: '审核中', handler: '张法务', prevTime: '2026-05-01', searchMethod: '官方数据库检索', agency: '启航知识产权', requester: '陈主管', dept: '知识产权部', brand: '海翼', product: '智能家居', project: '海翼项目', priority: '中', country: '欧盟', appNo: 'TM-2025-0189', agencyAdvice: '建议注册', adminAdvice: '同意', searchDeadline: '2026-05-05', completeDeadline: '2026-05-08', createdDate: '2026-04-25' },
    { caseNo: 'SC-2026-0004', subject: '星联续展前置检索', currentNode: '待分配', handler: '-', prevTime: '-', searchMethod: '近似检索', agency: '-', requester: '刘经理', dept: '法务部', brand: '星联', product: '可穿戴设备', project: '星联项目', priority: '中', country: '中国', appNo: 'TM-2025-0098', agencyAdvice: '-', adminAdvice: '-', searchDeadline: '2026-05-20', completeDeadline: '2026-05-25', createdDate: '2026-04-30' },
    { caseNo: 'SC-2026-0005', subject: '悦动新申请检索', currentNode: '检索完成', handler: '王流程', prevTime: '2026-04-29', searchMethod: '第三方平台检索', agency: '元健律师事务所', requester: '孙专员', dept: '产品研发部', brand: '悦动', product: '物联网平台', project: '悦动项目', priority: '低', country: '中国', appNo: 'TM-2026-0056', agencyAdvice: '不建议注册', adminAdvice: '需补充材料', searchDeadline: '2026-05-12', completeDeadline: '2026-05-18', createdDate: '2026-04-20' },
    { caseNo: 'SC-2026-0006', subject: '睿思驳回复审检索', currentNode: '检索完成', handler: '张法务', prevTime: '2026-04-28', searchMethod: '人工分析检索', agency: '智联知识产权', requester: '周主管', dept: '知识产权部', brand: '睿思', product: '人工智能', project: '智联项目', priority: '高', country: '中国', appNo: 'TM-2026-0071', agencyAdvice: '建议分割申请', adminAdvice: '同意', searchDeadline: '2026-05-06', completeDeadline: '2026-05-10', createdDate: '2026-04-22' },
    { caseNo: 'SC-2026-0007', subject: '明达异议答辩检索', currentNode: '检索中', handler: '李流程', prevTime: '2026-04-27', searchMethod: '综合检索', agency: '海翼律师事务所', requester: '吴经理', dept: '法务部', brand: '明达', product: '智能家居', project: '海翼项目', priority: '高', country: '中国', appNo: 'TM-2026-0028', agencyAdvice: '建议变更', adminAdvice: '转交上级', searchDeadline: '2026-05-09', completeDeadline: '2026-05-14', createdDate: '2026-04-26' },
    { caseNo: 'SC-2026-0008', subject: '远见日本注册检索', currentNode: '审核中', handler: '王流程', prevTime: '2026-04-25', searchMethod: '官方数据库检索', agency: '金诚律师事务所', requester: '郑总监', dept: '海外市场部', brand: '远见', product: '智能手机', project: '星联项目', priority: '中', country: '日本', appNo: 'TM-2026-0012', agencyAdvice: '建议注册', adminAdvice: '同意', searchDeadline: '2026-05-15', completeDeadline: '2026-05-20', createdDate: '2026-04-18' },
    { caseNo: 'SC-2026-0009', subject: 'Horizon品牌美国检索', currentNode: '待分配', handler: '-', prevTime: '-', searchMethod: '近似检索', agency: '-', requester: '钱经理', dept: '品牌管理部', brand: 'Horizon', product: '云服务', project: '智联项目', priority: '高', country: '美国', appNo: 'TM-2025-0156', agencyAdvice: '-', adminAdvice: '-', searchDeadline: '2026-05-25', completeDeadline: '2026-05-30', createdDate: '2026-05-01' },
    { caseNo: 'SC-2026-0010', subject: '启航韩国注册检索', currentNode: '检索完成', handler: '张法务', prevTime: '2026-04-24', searchMethod: '综合检索', agency: '启航知识产权', requester: '冯专员', dept: '知识产权部', brand: '启航', product: '物联网平台', project: '悦动项目', priority: '中', country: '韩国', appNo: 'TM-2025-0203', agencyAdvice: '建议注册', adminAdvice: '同意', searchDeadline: '2026-05-11', completeDeadline: '2026-05-16', createdDate: '2026-04-15' }
  ],
  searchNodes: ['待分配', '检索中', '检索完成', '审核中', '已归档'],
  searchMethods: ['近似检索', '综合检索', '官方数据库检索', '第三方平台检索', '人工分析检索'],
  searchAgencies: ['智联知识产权', '元健律师事务所', 'Horizon Law Group', '启航知识产权', '海翼律师事务所', '金诚律师事务所'],
  agencySuggestions: ['建议注册', '不建议注册', '需补充检索', '建议分割申请', '建议变更'],
  adminSuggestions: ['同意', '驳回', '需补充材料', '转交上级'],

  // 用印流程数据
  sealProcesses: [
    { id: 'SP-2026-0001', sealNo: 'SP-2026-0001', lawFirmName: '智联知识产权', fileName: '驳回复审委托书.pdf', originalFile: '驳回委托书_v1.pdf', stampedFile: '', initiator: '李律师·合伙人', initiatorRole: '律所', processSecretary: '', sealApprovalNo: '', status: 'pending_approval', submitTime: '2026-05-03', sealTime: '', confirmTime: '', remarks: '紧急', confirmOpinion: '' },
    { id: 'SP-2026-0002', sealNo: 'SP-2026-0002', lawFirmName: '元健律师事务所', fileName: '异议答辩授权书.pdf', originalFile: '授权书_v1.pdf', stampedFile: '', initiator: '王律师·主任', initiatorRole: '律所', processSecretary: '张秘书', sealApprovalNo: 'AP-2026-0042', status: 'approving', submitTime: '2026-05-02', sealTime: '', confirmTime: '', remarks: '', confirmOpinion: '' },
    { id: 'SP-2026-0003', sealNo: 'SP-2026-0003', lawFirmName: 'Horizon Law Group', fileName: '美国商标行政诉讼委托书.pdf', originalFile: '委托书_v1.pdf', stampedFile: '委托书_stamped.pdf', initiator: 'Michael Chen', initiatorRole: '律所', processSecretary: '李秘书', sealApprovalNo: 'AP-2026-0031', status: 'sealed', submitTime: '2026-04-28', sealTime: '2026-05-01', confirmTime: '', remarks: '', confirmOpinion: '' },
    { id: 'SP-2026-0004', sealNo: 'SP-2026-0004', lawFirmName: '启航知识产权', fileName: '续展申请书.pdf', originalFile: '续展申请_v1.pdf', stampedFile: '续展申请_stamped.pdf', initiator: '张律师·合伙人', initiatorRole: '律所', processSecretary: '王秘书', sealApprovalNo: 'AP-2026-0098', status: 'pending_confirm', submitTime: '2026-04-25', sealTime: '2026-04-30', confirmTime: '', remarks: '', confirmOpinion: '' },
    { id: 'SP-2026-0005', sealNo: 'SP-2026-0005', lawFirmName: '海翼律师事务所', fileName: '不予注册复审委托书.pdf', originalFile: '复审委托书_v1.pdf', stampedFile: '复审委托书_stamped.pdf', initiator: '陈律师·合伙人', initiatorRole: '律所', processSecretary: '赵秘书', sealApprovalNo: 'AP-2026-0028', status: 'completed', submitTime: '2026-04-20', sealTime: '2026-04-25', confirmTime: '2026-04-27', remarks: '', confirmOpinion: '盖章文件无误，确认通过' },
    { id: 'SP-2026-0006', sealNo: 'SP-2026-0006', lawFirmName: '金诚律师事务所', fileName: '马德里申请委托书.pdf', originalFile: '马德里委托书_v1.pdf', stampedFile: '', initiator: '孙律师·主任', initiatorRole: '律所', processSecretary: '', sealApprovalNo: '', status: 'pending_approval', submitTime: '2026-05-04', sealTime: '', confirmTime: '', remarks: '', confirmOpinion: '' },
    { id: 'SP-2026-0007', sealNo: 'SP-2026-0007', lawFirmName: '瑞思律师事务所', fileName: '商标转让协议.pdf', originalFile: '转让协议_v1.pdf', stampedFile: '', initiator: '赵律师·合伙人', initiatorRole: '律所', processSecretary: '刘秘书', sealApprovalNo: 'AP-2026-0056', status: 'approving', submitTime: '2026-04-30', sealTime: '', confirmTime: '', remarks: '', confirmOpinion: '' },
    { id: 'SP-2026-0008', sealNo: 'SP-2026-0008', lawFirmName: '明达律师事务所', fileName: '撤三答辩委托书.pdf', originalFile: '撤三委托书_v1.pdf', stampedFile: '撤三委托书_stamped.pdf', initiator: '孙律师·主任', initiatorRole: '律所', processSecretary: '周秘书', sealApprovalNo: 'AP-2026-0071', status: 'sealed', submitTime: '2026-04-22', sealTime: '2026-04-28', confirmTime: '', remarks: '', confirmOpinion: '' },
    { id: 'SP-2026-0009', sealNo: 'SP-2026-0009', lawFirmName: '星联知识产权', fileName: '无效宣告申请书.pdf', originalFile: '无效宣告_v1.pdf', stampedFile: '无效宣告_stamped.pdf', initiator: '周律师·合伙人', initiatorRole: '律所', processSecretary: '吴秘书', sealApprovalNo: 'AP-2026-0035', status: 'pending_confirm', submitTime: '2026-04-18', sealTime: '2026-04-26', confirmTime: '', remarks: '', confirmOpinion: '' },
    { id: 'SP-2026-0010', sealNo: 'SP-2026-0010', lawFirmName: '跃动律师事务所', fileName: '商标许可合同.pdf', originalFile: '许可合同_v1.pdf', stampedFile: '许可合同_stamped.pdf', initiator: '吴律师·合伙人', initiatorRole: '律所', processSecretary: '郑秘书', sealApprovalNo: 'AP-2026-0048', status: 'completed', submitTime: '2026-04-15', sealTime: '2026-04-20', confirmTime: '2026-04-22', remarks: '', confirmOpinion: '盖章清晰，通过' },
    { id: 'SP-2026-0011', sealNo: 'SP-2026-0011', lawFirmName: '云智知识产权', fileName: '变更代理人申请书.pdf', originalFile: '变更申请_v1.pdf', stampedFile: '', initiator: '刘律师·合伙人', initiatorRole: '律所', processSecretary: '', sealApprovalNo: '', status: 'pending_approval', submitTime: '2026-05-01', sealTime: '', confirmTime: '', remarks: '加急处理', confirmOpinion: '' },
    { id: 'SP-2026-0012', sealNo: 'SP-2026-0012', lawFirmName: '北京中伦律师事务所', fileName: '跨国商标共存协议.pdf', originalFile: '共存协议_v1.pdf', stampedFile: '', initiator: '钱律师·高级合伙人', initiatorRole: '律所', processSecretary: '冯秘书', sealApprovalNo: 'AP-2026-0062', status: 'approving', submitTime: '2026-04-26', sealTime: '', confirmTime: '', remarks: '', confirmOpinion: '' }
  ]
};

function getPriorityTag(p) {
  const map = { urgent: { cls: "tag-red", text: "紧急" }, high: { cls: "tag-orange", text: "高" }, medium: { cls: "tag-blue", text: "中" }, normal: { cls: "tag-green", text: "普通" }, low: { cls: "tag-gray", text: "低" } };
  const r = map[p] || map.normal;
  return `<span class="tag ${r.cls}">${r.text}</span>`;
}

function getStatusTag(s) {
  const map = { "审查中": "tag-blue", "答辩期": "tag-orange", "WIPO审查": "tag-blue", "准备材料": "tag-orange", "受理中": "tag-green", "待缴费": "tag-orange", "证据收集": "tag-blue", "已注册": "tag-green", "已驳回": "tag-red", "待审批": "tag-orange", "已审批": "tag-blue", "已付款": "tag-green", "合作中": "tag-green", "暂停": "tag-gray" };
  return `<span class="tag ${map[s]||'tag-gray'}">${s}</span>`;
}
