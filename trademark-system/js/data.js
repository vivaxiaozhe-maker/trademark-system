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
    { id: "BILL-2026-0156", lawFirm: "智联知识产权", amount: 85000, caseNo: "TM-2026-0042", type: "代理费", date: "2026-04-28", status: "待审批" },
    { id: "BILL-2026-0155", lawFirm: "WIPO", amount: 12000, caseNo: "TM-2025-0189", type: "官费", date: "2026-04-25", status: "已审批" },
    { id: "BILL-2026-0154", lawFirm: "元健律师事务所", amount: 35000, caseNo: "TM-2026-0031", type: "代理费", date: "2026-04-22", status: "已付款" },
    { id: "BILL-2026-0153", lawFirm: "Horizon Law Group", amount: 45000, caseNo: "TM-2025-0203", type: "代理费", date: "2026-04-20", status: "待审批" },
    { id: "BILL-2026-0152", lawFirm: "智联知识产权", amount: 28000, caseNo: "TM-2025-0098", type: "官费+代理", date: "2026-04-18", status: "已付款" }
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
