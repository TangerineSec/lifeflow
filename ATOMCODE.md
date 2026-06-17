# LifeFlow 项目规则

## 版本管理

对大小版本的迭代更新都需要设置版本号，并且推送 commit 提交，在提交信息中写好：

- **修复了什么功能**
- **修复了什么 bug**
- **新增了什么功能**

### 版本命名规范

```
v<主版本>.<次版本>.<补丁>
```

| 级别 | 说明 | 示例 |
|------|------|------|
| 主版本 | 破坏性变更、架构重构 | v2.0.0 |
| 次版本 | 新功能、非破坏性增强 | v1.1.0 |
| 补丁 | Bug 修复、微小改进 | v1.0.1 |

### Commit 步骤模板

```bash
# 0. 同步更新 README.md 中的版本迭代表格
#    每次版本变更前，先在 README.md 的「版本迭代」表格中
#    添加新版本的行，更新版本号和技术栈说明

# 1. 所有变更提交
git add -A
git commit -m "类型: v<版本号> 描述

- 新增: ...
- 修复: ...
- 优化: ..."

# 2. 打版本标签
git tag v<版本号>

# 3. 推送到远程
git push origin main --tags
```

### 注意

- 版本标签 (`git tag`) 必须与 package.json 中的 `version` 字段保持一致
- 每次推送必须带 `--tags` 确保标签同步到远程
- **每次版本迭代必须同步更新 README.md**，包括：
  - 版本迭代表格中的最新版本行
  - 项目信息中的版本号
  - 技术栈变更（新增/移除依赖）
  - 项目结构的新增/删除文件
  - 功能列表的增补

## 部署相关

### 线上地址

- **域名**：`https://atomcode.find0day.cn`
- **服务器**：124.220.62.162
- **部署路径**：`/var/www/lifeflow/dist`
- **Nginx 配置**：`/etc/nginx/conf.d/atomcode.find0day.cn.conf`
- **SSL 证书**：Let's Encrypt（泛域名 `find0day.cn`）

### 自动部署

推送 `main` 分支后，GitHub Actions 会自动构建并部署：
`.github/workflows/deploy.yml`

### 首次部署

```bash
# 本地构建（注入 Supabase 环境变量）
VITE_SUPABASE_URL=https://wuphjjyudhekuhhwxncj.supabase.co \
VITE_SUPABASE_ANON_KEY=sb_publishable_NPjvtO9K8l_EZq7kvrsccg_KPkZhpg5 \
npm run build

# 上传到服务器
rsync -avz --delete dist/ root@124.220.62.162:/var/www/lifeflow/dist/

# 重载 Nginx
ssh root@124.220.62.162 "nginx -s reload"
```

### Supabase 控制台配置

在 [Supabase Dashboard → Authentication → Settings](https://supabase.com) 中设置：
- **Site URL**: `https://atomcode.find0day.cn`
- **Redirect URLs**: `https://atomcode.find0day.cn/**`
