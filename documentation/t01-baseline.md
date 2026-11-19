# T01 基线、数据映射与验收记录

版本：2026-11-19  
对照基线：`8f3740a972279ee68a4703fbef52cb42a83a00dc`  
范围：仅 T01，以及改进书明确要求的 F02、F05、F08 回归。

## 1. 构建与边界决策

- 新增代码使用 TypeScript；后端为 Fastify 单服务，数据层使用 `pg` 和 PostgreSQL。
- `trademark-system/` 是静态 Demo 唯一源码，`docs/` 由脚本全量生成，消除双份手改。
- Demo 继续使用隔离的浏览器存储；服务端业务记录进入 PostgreSQL。浏览器偏好与正式业务数据不混用。
- `workspaces.data_mode` 区分 `sample` 与 `production`。样例加载和重置只能作用于 sample 工作区。
- 本轮不接入企业身份、不做公网部署，不将 API 的 workspaceId 参数误认为授权；T02 必须替换为服务端身份与按案授权。

## 2. 静态路由与现有数据来源

| 路由 | 当前主要来源 |
| --- | --- |
| `index.html` | `AppData`、`DataService`、页内写死 Hero/KPI |
| `pages/cases.html` | `DataService` 的 `tm_data_cases` |
| `pages/case-detail.html` | `tm_data_cases`、`AppData.caseDetail`、`OCRMock` |
| `pages/case-new.html` | `AppData` 选项、`DataService`、草稿、`OCRMock` |
| `pages/todo.html` | `AppData.todos`、`tm_data_todos` |
| `pages/brand.html` | `AppData.brands`、`tm_data_brands` |
| `pages/collab.html` | `AppData.lawFirms`、`DataService`、页内演示状态 |
| `pages/admin-users.html` | `AppData`、当前页内存、`DataService` |
| `pages/fees.html` | `AppData.fees/bills`、`tm_data_fees`、`tm_data_fee_apps` |
| `pages/brand-map.html` | `tm_data_brands` 与固定缺口推导 |
| `pages/monitor.html` | `tm_data_monitor_tasks`、`tm_data_monitor_results` |
| `pages/law-firm-management.html` | `AppData.lawFirms`、`tm_data_law_firms` |
| `pages/search-case.html` | `AppData` 与页内样例 |
| `pages/search-new.html` | `AppData` 与页内样例 |
| `pages/seal-process.html` | 页内演示数据 |
| `pages/report.html` | `AppData` 与 `DataService` 聚合 |
| `pages/decision.html` | `AppData` 与 `DataService` 聚合 |
| `pages/brand-auth-internal.html` | 页内表单与证书生成脚本 |
| `pages/brand-auth-external.html` | 页内表单与证书生成脚本 |
| `pages/drafts.html` | `tm_drafts` |
| `pages/tools.html` | `AppData` 与 `DataService` |
| `pages/cc.html` | `AppData` 与 `DataService` |
| `pages/my-cases.html` | `tm_data_cases` |
| `pages/fee-apply.html` | `AppData`、`tm_data_fee_apps` |
| `pages/done.html` | `AppData`、`tm_data_todos` |
| `pages/staff-management.html` | `AppData` 与页内演示状态 |
| `pages/doc-new.html` | `AppData` 与页内演示状态 |

`data.js` 与 `data-service.js` 的日期和案号并非同一事实源；F01 的跨页面期限统一属于 T04，本轮没有宣称解决。

## 3. PostgreSQL 字段映射

核心查询字段独立成列，旧记录完整保留在 `cases.payload` JSONB 中，避免首轮迁移丢失未建模字段。

| 旧 Demo 字段 | 新字段 | 说明 |
| --- | --- | --- |
| `id` | `cases.case_no` | 工作区内唯一；新 API 另用 UUID `id` 作主键 |
| `brandName` | `brand_name` | T01 必填 |
| `businessTypeCode` / `businessType` | 同名蛇形列 | 编码与展示值分开 |
| `type` | `jurisdiction_type` | 仅 `domestic` / `overseas` |
| `country` | `country` | 法域展示原值 |
| `statusCode` / `status` | 同名蛇形列 | 完整案件状态机在 T03 定版 |
| `applicationNumber` | `application_number` | 不再从内部案号推导；允许空 |
| `registrationNumber` | `registration_number` | 与申请号分列 |
| `officialDeadline` | `official_deadline DATE` | 日历日，不带 UTC 偏移 |
| `responsibleUserId` / `responsibleUser` | 同名蛇形列 | T02 换成成员外键 |
| `lawFirmName` | `law_firm_name` | T02/T05 换成组织与委托关系 |
| `enabled` | `enabled` | 批量更新按实际行数反馈 |
| 其余字段 | `payload` | 原值保留，后续增量拆列 |
| 无 | `record_version` | 每次更新递增，为 409 冲突契约做准备 |

`import_batches` 保存内容哈希和分类计数，`import_rows` 保存原始行、案号、案件关联和结果。预检不写案件；提交在一个事务内写案件与报告。相同文件内容重复提交返回原批次，变化但同案号的记录进入冲突，不自动覆盖。

## 4. API 写入契约

| 接口 | 成功 | 主要错误 |
| --- | --- | --- |
| `POST /api/cases` | 201，返回持久化记录 | 400 字段错误；409 案号冲突；503 存储不可用 |
| `POST /api/cases/batch-enabled` | 200，逐项结果与真实成功/失败数 | 400 参数错误；503 存储不可用 |
| `POST /api/imports/cases/preflight` | 200，成功/重复/冲突/拒绝报告 | 400 空行或非对象；503 存储不可用 |
| `POST /api/imports/cases/commit` | 首次 201；同内容重试 200 且 `idempotent=true` | 400 参数错误；503 整体回滚 |
| `GET /api/cases/:caseNo` | 200 原案 | 404 `CASE_NOT_FOUND`，无任何重建副作用 |

本轮列表提供稳定 `case_no` 排序和到期窗口；完整后端分页、角色过滤和统计授权随 T02/T03 扩展。

## 5. 已实现修复与回归

- F02：详情不再 seed 或回退第一案；未知案卷显示明确错误页。旧 localStorage 版本升级不再清空新增案件。
- F05：默认按 `Asia/Shanghai` 日历日；逾期、今日、明日、第七天、第八天分别处理。“未来 7 天”从明日起算，列表和统计共用同一判断。
- F08：案号可直接进入详情；批量启停按 ID 更新，反馈真实成功与失败数。
- 存储真实性：服务端故障返回 503，Demo CRUD 写入失败返回 `null`，均不伪造成功。

## 6. 验收映射与遗留

- E01 存储部分：`tests/server.test.ts` 覆盖建两案、旧链接、未知案卷、导入预检、重复导入对账、迁移重跑。
- E09 存储部分：服务端 503 后恢复重试仅落一次；Demo 写入失败测试在 `tests/legacy-data-service.test.cjs`。
- E07 的日历边界仅完成基础规则；通知重试、法域完整矩阵属于 T04。
- 文件库和通知渠道故障、真实 PostgreSQL 故障、备份恢复不在本轮实测范围。
- T01 不向静态 Demo 接入后端业务写入，避免形成“半真半假”的生产入口；T03 再迁移案卷页面。
