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
    { id: 7, title: "金诚律所Q2服务评价", type: "服务评价", priority: "normal", deadline: "2026-05-25", caseNo: "EV-2026-0018", status: "待评价" },
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
    { id: "TM-2026-0042", name: "云智", type: "驳回复审", category: "国内案件", status: "审查中", agent: "金诚律师事务所", deadline: "2026-05-06", owner: "张法务", progress: 65 },
    { id: "TM-2026-0031", name: "智联", type: "异议答辩", category: "国内案件", status: "答辩期", agent: "中誉知识产权", deadline: "2026-05-07", owner: "张法务", progress: 30 },
    { id: "TM-2025-0189", name: "海翼", type: "马德里申请", category: "海外案件", status: "WIPO审查", agent: "WIPO/当地所", deadline: "2026-05-15", owner: "李流程", progress: 45 },
    { id: "TM-2026-0028", name: "明达", type: "不予注册复审", category: "国内案件", status: "准备材料", agent: "金诚律师事务所", deadline: "2026-05-22", owner: "张法务", progress: 20 },
    { id: "TM-2026-0056", name: "悦动", type: "新申请", category: "国内案件", status: "受理中", agent: "中誉知识产权", deadline: "2026-06-01", owner: "王流程", progress: 15 },
    { id: "TM-2025-0098", name: "星联", type: "续展", category: "国内案件", status: "待缴费", agent: "金诚律师事务所", deadline: "2026-05-10", owner: "张法务", progress: 80 },
    { id: "TM-2026-0071", name: "睿思", type: "撤三答辩", category: "国内案件", status: "证据收集", agent: "中誉知识产权", deadline: "2026-06-10", owner: "张法务", progress: 40 },
    { id: "TM-2025-0203", name: "启航", type: "单一国家申请", category: "海外案件", status: "审查中", agent: "美国Baker律所", deadline: "2026-06-20", owner: "李流程", progress: 55 }
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
    { name: "金诚律师事务所", cases: 45, rating: 4.8, responseTime: "2.3h", successRate: "92%", feeLevel: "高", status: "合作中" },
    { name: "中誉知识产权", cases: 38, rating: 4.5, responseTime: "4.1h", successRate: "88%", feeLevel: "中", status: "合作中" },
    { name: "美国Baker律所", cases: 12, rating: 4.7, responseTime: "8.5h", successRate: "90%", feeLevel: "高", status: "合作中" },
    { name: "德国Müller事务所", cases: 8, rating: 4.3, responseTime: "12h", successRate: "85%", feeLevel: "中高", status: "合作中" },
    { name: "日本东京特许事务所", cases: 6, rating: 4.6, responseTime: "6h", successRate: "91%", feeLevel: "中", status: "合作中" }
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
    { id: "BILL-2026-0156", lawFirm: "金诚律师事务所", amount: 85000, caseNo: "TM-2026-0042", type: "代理费", date: "2026-04-28", status: "待审批" },
    { id: "BILL-2026-0155", lawFirm: "WIPO", amount: 12000, caseNo: "TM-2025-0189", type: "官费", date: "2026-04-25", status: "已审批" },
    { id: "BILL-2026-0154", lawFirm: "中誉知识产权", amount: 35000, caseNo: "TM-2026-0031", type: "代理费", date: "2026-04-22", status: "已付款" },
    { id: "BILL-2026-0153", lawFirm: "美国Baker律所", amount: 45000, caseNo: "TM-2025-0203", type: "代理费", date: "2026-04-20", status: "待审批" },
    { id: "BILL-2026-0152", lawFirm: "金诚律师事务所", amount: 28000, caseNo: "TM-2025-0098", type: "官费+代理", date: "2026-04-18", status: "已付款" }
  ],

  monitors: [
    { id: 1, keyword: "云智", type: "商标监测", matchCount: 3, risk: "high", lastUpdate: "2026-05-03" },
    { id: 2, keyword: "智联", type: "主体监测", matchCount: 1, risk: "medium", lastUpdate: "2026-05-03" },
    { id: 3, keyword: "海翼", type: "商标监测", matchCount: 0, risk: "low", lastUpdate: "2026-05-02" },
    { id: 4, keyword: "竞争对手A", type: "主体监测", matchCount: 5, risk: "high", lastUpdate: "2026-05-01" }
  ],

  messages: [
    { id: 1, title: "商标'云智'驳回复审期限将至", time: "10分钟前", type: "urgent", read: false },
    { id: 2, title: "金诚律所提交了新的答辩材料", time: "1小时前", type: "normal", read: false },
    { id: 3, title: "5月费用预算执行率达到85%", time: "3小时前", type: "normal", read: true },
    { id: 4, title: "马德里申请进入WIPO审查阶段", time: "昨天", type: "normal", read: true }
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
