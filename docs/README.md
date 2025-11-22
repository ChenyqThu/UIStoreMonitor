# UniFi Store Monitor - 开发文档

> 当前开发分支: `develop`
> 稳定分支: `main`

---

## 快速导航

| 文档 | 说明 | 状态 |
|------|------|------|
| [项目路线图](./project_roadmap.md) | 版本规划、任务清单、进度追踪 | 主文档 |
| [数据库方案](./database_redesign_proposal.md) | 表结构设计、SQL Schema | 已审阅 |
| [前端方案](./frontend_redesign_proposal.md) | 页面设计、组件规格 | 已审阅 |

---

## 分支策略

```
main (稳定版 v1.x)
  │
  └── develop (开发版 v2.x) ← 当前开发分支
        │
        ├── v2.0.0 - 数据库重构 + 爬虫更新
        ├── v2.1.0 - Dashboard 增强
        ├── v2.2.0 - ProductDetail 重构
        ├── v2.3.0 - 新增页面 (Deals/Alerts)
        └── v2.4.0 - 优化完善 → 合并回 main
```

### 开发规范

1. **所有 v2.x 开发在 `develop` 分支进行**
2. 每个 Phase 完成后打 Tag (如 `v2.0.0`)
3. 全部完成后通过 PR 合并回 `main`
4. `main` 分支的爬虫继续正常运行

### 常用命令

```bash
# 查看当前分支
git branch

# 切换到开发分支
git checkout develop

# 切换到稳定分支
git checkout main

# 提交代码 (确保在 develop 分支)
git add .
git commit -m "feat: xxx"
git push origin develop
```

---

## 版本规划概览

| 版本 | 内容 | 状态 |
|------|------|------|
| v2.0.0 | 数据库重构 + 爬虫更新 | [x] 已完成 (2025-11-22) |
| v2.1.0 | Dashboard 增强 | [x] 已完成 (2025-11-21) |
| v2.2.0 | ProductDetail 重构 | [ ] 待开始 |
| v2.3.0 | 新增 Deals/Alerts 页面 | [ ] 待开始 |
| v2.4.0 | 优化完善 | [ ] 待开始 |

详细任务清单见 [项目路线图](./project_roadmap.md)

---

## 技术栈

| 层面 | 技术 |
|------|------|
| 前端 | React + TypeScript + TailwindCSS |
| 图表 | Recharts |
| 路由 | React Router |
| 后端 | Supabase (PostgreSQL) |
| 爬虫 | Node.js + TypeScript |
| 部署 | Vercel + GitHub Actions |

---

## 核心改进点

### 数据库层
- 产品/变体分离 (支持多 SKU)
- 折扣信息存储 (原价、折扣价、折扣%)
- 标签系统 (促销、特性)
- 变体级别历史追踪

### 前端层
- 统计概览卡片
- 多维筛选 (库存/折扣)
- 变体选择器
- 折扣监控页面
- 变化提醒页面

---

## 新会话开发指引

开始新会话时，请告知 Claude：

```
我要继续开发 UniFi Store Monitor 项目的 v2.x 版本重构。

当前分支: develop
当前进度: Phase X (见 docs/project_roadmap.md)

请先阅读以下文档了解项目背景:
- docs/README.md (文档索引)
- docs/project_roadmap.md (任务清单)

然后继续 Phase X 的开发任务。
```

---

## 文档更新规范

1. **进度更新**: 修改 `project_roadmap.md` 中的任务状态
2. **方案调整**: 修改对应的方案文档并更新日期
3. **新增文档**: 添加到本索引的导航表中
4. **版本完成**: 更新变更日志和完成日期
