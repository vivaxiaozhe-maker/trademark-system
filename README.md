# 商标管理系统

当前仓库包含可对照的静态 Demo，以及 T01 新增的 TypeScript / PostgreSQL 持久化底座。它**还不是可上线的生产系统**：身份授权、完整案卷、官文期限、律所协作等仍按改进书的 T02–T08 推进。

## 目录约定

- `trademark-system/`：静态 Demo 唯一手改源码，本地 Live Server 地址为 `http://127.0.0.1:5500/trademark-system/index.html`。
- `docs/`：GitHub Pages 构建产物，不再手改；执行 `npm run build:pages` 生成。
- `src/server/`：模块化单体 API、PostgreSQL 仓储和 CLI。
- `src/shared/`：前后端可复用的日历日规则。
- `migrations/`：按文件名顺序执行的增量 SQL 迁移。
- `tests/`：可重复运行的服务端及旧 Demo 回归测试。
- `documentation/t01-baseline.md`：基线路由、字段映射、API 和验收范围。

Demo 对照基线固定为提交 `8f3740a972279ee68a4703fbef52cb42a83a00dc`。旧 `trademark-data-layer.js` 保留作历史参考，不是运行入口。

## 环境与启动

要求 Node.js 22+、PostgreSQL 14+。依赖安装在项目内：

```bash
npm install
```

若本机 npm 全局缓存无写权限，可使用 `npm install --cache .npm-cache`。

```bash
export DATABASE_URL='postgresql://user:password@127.0.0.1:5432/trademark_system'
npm run migrate
npm run seed:demo       # 仅向固定 sample 工作区写入合成数据；已有数据时不重置
npm run dev             # 默认 http://127.0.0.1:3000
```

固定演示工作区 ID：`00000000-0000-4000-8000-000000000001`。默认组织时区为 `Asia/Shanghai`，可通过 `ORGANIZATION_TIME_ZONE` 修改。`PORT`、`HOST` 可覆盖监听地址。

创建独立正式工作区：

```bash
npm run workspace:create -- --name '企业工作区' --mode production
```

`npm run reset:demo` 会清空并重建**固定 sample 工作区**；命令会对正式工作区拒绝执行。生产数据没有重置 API。

## 构建与检查

```bash
npm test              # 服务端 + Demo 回归测试；使用 pg-mem，不依赖本机 PostgreSQL
npm run typecheck
npm run build         # 编译服务端并重建 docs/
npm run check:pages   # 检查 docs/ 是否与唯一源码一致
```

pg-mem 用于合成回归；真实 PostgreSQL 的备份、恢复、连接故障与部署演练仍属于 T07，不能由内存测试替代。

## T01 可用接口

所有接口都要求 `workspaceId`。T02 之前仅用于合成环境，不得暴露到公网或写入真实数据。

- `GET /health`
- `GET /api/cases?workspaceId=...&deadlineWithin=7`
- `GET /api/cases/:caseNo?workspaceId=...`
- `POST /api/cases`
- `POST /api/cases/batch-enabled`
- `POST /api/imports/cases/preflight`
- `POST /api/imports/cases/commit`
- `GET /api/imports/:batchId?workspaceId=...`

未知案卷返回 404，不创建或重置数据。存储失败返回明确错误，不返回虚假成功。导入先预检，提交采用单事务；相同内容重复提交返回原批次并保持幂等。
