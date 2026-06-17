# LifeFlow — 长事件进度追踪系统

现代化长事件进度追踪系统，以可视化流程图引擎为核心，支持四象限分类管理、无限层级分支流程、子任务清单和模版预置。专为个人/团队的长期目标追踪、项目管理、习惯养成等场景设计。

---

## 项目信息

| 项目 | 内容 |
|------|------|
| 项目名称 | LifeFlow（长事件进度追踪） |
| 版本 | v1.4.0 |
| 许可 | MIT |
| 技术栈 | React 19 + Vite 8 + Tailwind CSS 3 + Zustand + Framer Motion + Supabase Auth |
| 定位 | 纯前端 SPA，Supabase Auth 身份认证，LocalStorage 持久化 |

## 项目结构

```
lifeflow/
├── index.html                        # 入口 HTML
├── package.json                      # 依赖与脚本
├── vite.config.js                    # Vite 构建配置
├── tailwind.config.js                # Tailwind 配置（含品牌色）
├── postcss.config.js                 # PostCSS 配置
├── ATOMCODE.md                       # 项目 AI 协作规则
├── public/
│   └── favicon.svg
├── supabase/
│   └── profiles.sql                  # Supabase profiles 表 DDL + RLS
├── src/
│   ├── main.jsx                      # React 挂载入口
│   ├── App.jsx                       # 应用根组件（AuthGuard 包裹）
│   ├── index.css                     # Tailwind 指令 + 全局样式
│   │
│   ├── lib/
│   │   └── supabase.js               # Supabase 客户端单例
│   │
│   ├── store/
│   │   ├── useFlowStore.js           # 核心数据 Store（流程图/节点/模版/历史快照）
│   │   ├── useAppStore.js            # UI 状态 Store（Tab/侧边栏/视图导航）
│   │   └── useAuthStore.js           # 认证状态 Store（Supabase Auth）
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthGuard.jsx         # 路由守卫（未登录跳转登录页）
│   │   │   └── LoginPage.jsx         # 登录/注册页面
│   │   │
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx         # 四象限仪表盘容器
│   │   │   ├── TabNav.jsx            # 工作|学习|生活|兴趣 Tab
│   │   │   ├── WorkSection.jsx       # 工作区（按日期分组）
│   │   │   └── GenericSection.jsx    # 其他三区（卡片列表）
│   │   │
│   │   ├── flow/
│   │   │   ├── FlowChart.jsx         # 流程图引擎（递归渲染 + 拖拽排序）
│   │   │   ├── FishboneView.jsx      # 鱼骨图预览（SVG 渲染）
│   │   │   ├── FlowDetailView.jsx    # 流程图详情全屏视图
│   │   │   ├── FlowControls.jsx      # 流程图操作栏
│   │   │   ├── FlowInfoModal.jsx     # 流程简介/备注编辑弹窗
│   │   │   ├── BackupModal.jsx       # 备份与恢复面板
│   │   │   ├── NodeCard.jsx          # 节点卡片（拖拽、状态、快捷操作）
│   │   │   ├── NodeDetail.jsx        # 节点详情侧边栏编辑器
│   │   │   ├── SubFlowList.jsx       # 子分支列表（递归组件）
│   │   │   └── Checklist.jsx         # 子任务清单
│   │   │
│   │   ├── template/
│   │   │   ├── TemplateManager.jsx   # 模版管理器
│   │   │   ├── TemplateCard.jsx      # 模版卡片
│   │   │   └── ImportDialog.jsx      # 批量导入对话框
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.jsx            # 顶部导航栏（含用户菜单）
│   │   │   └── DataInitializer.jsx   # 预设数据初始化
│   │   │
│   │   └── ui/
│   │       ├── Button.jsx            # 统一按钮组件
│   │       ├── IconToggle.jsx        # 状态切换图标（带动画）
│   │       ├── Modal.jsx             # 通用模态弹窗
│   │       └── ConfirmDialog.jsx     # 确认对话框
│   │
│   └── utils/
│       ├── id.js                     # nanoid ID 生成
│       ├── defaultTemplates.js       # 4 套预设模版数据
│       └── backup.js                 # JSON 导入/导出工具
└── .env.local                        # Supabase 认证配置（不提交）
```

## 项目解决的问题

| 问题 | 方案 |
|------|------|
| 长期目标缺乏结构化追踪 | 四象限分类（工作/学习/生活/兴趣）+ 无限层级分支流程图 |
| 项目管理步骤碎片化 | 每个节点可挂载 Checklist 子任务、备注、描述 |
| 重复工作浪费精力 | 预设模版库 + 自定义保存，一键加载 |
| 数据安全担忧 | 纯 LocalStorage 存储，支持 JSON 导出/导入备份 |
| 跨设备使用 | PWA 就绪架构，响应式设计适配桌面与平板 |

## 技术栈

### 前端

| 技术 | 用途 |
|------|------|
| React 19 | UI 框架 |
| Vite 8 | 构建工具（极快 HMR） |
| Tailwind CSS 3 | 样式框架（现代极简风格） |
| Zustand + persist | 状态管理 + LocalStorage 持久化 |
| Framer Motion 12 | 动画（节点展开/折叠/拖拽/状态切换） |
| Lucide React | 图标库（线条风格统一） |
| @dnd-kit (core + sortable) | 拖拽排序 |
| nanoid | 唯一 ID 生成 |
| @supabase/supabase-js | Supabase Auth 身份认证 |

### 架构设计

```
┌──────────────────────────────────────────────────┐
│                    用户界面层                      │
│  Header → Dashboard → FlowDetailView             │
│           ├─ WorkSection                         │
│           └─ GenericSection                      │
│  ├─ NodeDetail (侧边栏)                          │
│  ├─ FlowInfoModal (弹窗)                         │
│  └─ TemplateManager (弹窗)                       │
├──────────────────────────────────────────────────┤
│                   状态管理层                       │
│  useFlowStore (Zustand + persist)                │
│    ├─ flows: { [flowId]: Flow }                  │
│    ├─ nodes: { [nodeId]: Node }                  │
│    └─ templates: Template[]                      │
│  useAppStore (UI 状态)                            │
│    ├─ activeQuadrant / viewingFlowId             │
│    ├─ sidebarOpen / activeNodeId                 │
│    └─ modalOpen / modalType / modalData          │
├──────────────────────────────────────────────────┤
│                   数据持久化                       │
│  LocalStorage (zustand persist middleware)       │
│  → key: "lifeflow-storage"                      │
│  → 支持 JSON 导入/导出备份                       │
└──────────────────────────────────────────────────┘
```

### 分支流程数据递归渲染逻辑

```
FlowChart（顶层容器）
  └─ flow.nodes 是顶层 nodeId 数组
      └─ 每个 NodeCard 渲染一个节点
          └─ 如果 node.children.length > 0
              └─ 渲染 SubFlowList(parentNodeId)
                  └─ 从 store 读取 node.children
                      └─ 每个 childId → NodeCard
                          └─ 继续递归 SubFlowList...
```

数据采用**扁平化 + 链表指针**方案：所有节点平铺在 `nodes` 对象中，每个节点通过 `children: string[]` 数组指向子节点 ID。修改子节点列表只需更新数组（O(1)），无需深拷贝整棵树。

## 快速启动

```bash
# 1. 克隆仓库
git clone https://github.com/<你的用户名>/lifeflow.git
cd lifeflow

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器
open http://localhost:5173
```

## 构建部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

构建产物在 `dist/` 目录，可直接部署到任何静态服务器（Nginx、Vercel、Netlify、Cloudflare Pages 等）。

## 版本迭代

| 版本 | 内容 |
|------|------|
| v1.0.0 | 核心功能：四象限仪表盘 + 流程图引擎 + 节点 CRUD + 拖拽排序 + 预设模版 + JSON 备份 |
| v1.1.0 | 现代化 favicon 图标 + SEO meta 信息 |
| v1.2.0 | 历史备份系统（快照/撤销/重做/版本回滚）+ 鱼骨图预览模式（SVG 坐标布局算法） |
| v1.3.0 | Authing 身份认证集成（useAuthStore / AuthGuard / 登录页 / 用户菜单） |
| v1.4.0 | 迁移至 Supabase Auth（邮箱注册/登录/邮件验证 / profiles 表 RLS） |

## License

MIT
