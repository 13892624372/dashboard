# AI面试模拟器数据看板 - 配置指南

## 一、Google Sheets API 配置步骤

### 步骤 1：创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 点击左上角项目选择器，创建新项目
3. 项目名称建议：`ai-interview-dashboard`

### 步骤 2：启用 Google Sheets API

1. 在控制台左侧菜单选择 "API 和服务" > "库"
2. 搜索 "Google Sheets API"
3. 点击启用

### 步骤 3：创建 API Key

1. 左侧菜单选择 "API 和服务" > "凭据"
2. 点击 "创建凭据" > "API 密钥"
3. 复制生成的 API Key（稍后需要填入 config.js）

### 步骤 4：限制 API Key（重要！）

1. 点击刚创建的 API Key
2. 在 "应用程序限制" 中选择 "HTTP 引荐来源网址"
3. 添加你的 GitHub Pages 域名，例如：
   - `https://yourusername.github.io/*`
4. 在 "API 限制" 中选择 "限制密钥"
5. 只勾选 "Google Sheets API"
6. 保存

### 步骤 5：创建 Google Sheets

1. 访问 [Google Sheets](https://sheets.google.com/)
2. 创建新的电子表格，命名为 `面试模拟器数据看板`
3. 创建以下 4 个工作表：
   - `user_behavior` - 用户行为埋点
   - `user_feedback` - 用户反馈
   - `model_evaluation` - 模型效果人工标注
   - `mock_data` - 模拟数据（可选）

### 步骤 6：获取 Spreadsheet ID

1. 打开你的 Google Sheets
2. 从浏览器地址栏复制 Spreadsheet ID：
   ```
   https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   ```
3. 只需要复制 `/d/` 和 `/edit` 之间的部分

### 步骤 7：配置 config.js

1. 打开 `js/config.js` 文件
2. 替换以下配置：
   ```javascript
   API_KEY: '你的_API_Key',
   SPREADSHEET_ID: '你的_Spreadsheet_ID'
   ```

### 步骤 8：设置 Sheets 权限

1. 在 Google Sheets 中点击 "共享"
2. 将权限设置为 "知道链接的任何人都可以查看"
3. 注意：不需要设置为"可编辑"，API Key 只需要读取权限

---

## 二、Google Forms 配置

### 表单 1：用户反馈表单

创建表单，包含以下字段：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| session_id | 简答题 | 通过 URL 预填充传递 |
| feedback_score | 线性量表 1-5 | 整体评分 |
| question_relevant | 线性量表 1-5 | 问题与简历匹配度 |
| comment_helpful | 线性量表 1-5 | 点评有帮助度 |
| feedback_text | 段落 | 文字反馈 |

**预填充 URL 设置：**
1. 点击表单右上角的三个点
2. 选择 "获取预填充的链接"
3. 在 session_id 字段填入占位符 `{SESSION_ID}`
4. 复制生成的链接格式
5. 在你的面试模拟器中，将 `{SESSION_ID}` 替换为实际的 session_id

### 表单 2：模型效果标注表单（内部使用）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| session_id | 简答题 | 要标注的会话ID |
| week | 简答题 | 周次，如 2024-W03 |
| has_hallucination | 单选题 | 是否有杜撰内容（是/否） |
| question_match_score | 线性量表 1-5 | 问题与简历匹配度 |

---

## 三、连接表单到 Sheets

### 方法 1：表单自动连接（推荐）

1. 在 Google Forms 中，点击 "响应" 标签
2. 点击 Sheets 图标（绿色表格图标）
3. 选择 "创建新的电子表格"
4. 表单提交的数据会自动写入 Sheets

### 方法 2：使用 IMPORTRANGE 合并数据

如果表单创建了单独的 Sheets，可以在主表格中使用公式：

```
=IMPORTRANGE("表单Sheets的ID", "表单响应 1!A:Z")
```

---

## 四、工作表表头格式

### user_behavior 工作表表头

```
session_id|timestamp|has_uploaded_resume|has_uploaded_jd|completed_intro|completed_q1|completed_q2|completed_q3|completed_q4|completed_q5|interrupt_at|total_answer_chars|is_returning
```

### user_feedback 工作表表头

```
session_id|feedback_score|question_relevant|comment_helpful|feedback_text
```

### model_evaluation 工作表表头

```
session_id|week|has_hallucination|question_match_score
```

---

## 五、部署到 GitHub Pages

### 步骤 1：创建 GitHub 仓库

1. 在 GitHub 创建新仓库，命名为 `ai-interview-dashboard`
2. 将代码推送到仓库

### 步骤 2：启用 GitHub Pages

1. 进入仓库的 Settings
2. 左侧选择 "Pages"
3. Source 选择 "Deploy from a branch"
4. Branch 选择 "main"，文件夹选择 "/ (root)"
5. 保存

### 步骤 3：访问看板

等待几分钟后，访问：
```
https://yourusername.github.io/ai-interview-dashboard/
```

---

## 六、常见问题

### Q1: API Key 泄露了怎么办？
A: 立即在 Google Cloud Console 中删除该 Key 并创建新的，同时限制新 Key 的 HTTP Referer。

### Q2: 数据不更新？
A: 
1. 检查 Sheets 权限是否为"知道链接的任何人都可以查看"
2. 检查 API Key 是否正确
3. 检查 Spreadsheet ID 是否正确
4. 打开浏览器开发者工具查看网络请求错误

### Q3: 词云不显示？
A: 词云需要足够的中文文本数据。如果反馈文本太少，词云可能无法正常显示。

### Q4: 如何切换到真实数据？
A: 在看板页面右上角取消勾选"模拟数据模式"，看板会自动尝试从 Google Sheets 拉取真实数据。

---

## 七、安全建议

1. **永远不要将包含真实 API Key 的代码提交到公共仓库**
2. **始终限制 API Key 的 HTTP Referer**
3. **定期轮换 API Key**
4. **监控 API 使用量**，防止被滥用

---

## 八、自定义配置

如需修改图表颜色、布局等，可编辑以下文件：

- `css/style.css` - 样式和布局
- `js/charts.js` - 图表配置
- `js/config.js` - API 和数据配置
