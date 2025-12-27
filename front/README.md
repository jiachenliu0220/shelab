# 打工人启动助手 - 聊天应用

这是一个温柔的聊天助手，帮助打工人用每天10分钟开启美好的一天。

## 🚀 快速开始

### 1. 配置 Supabase
在 `front/js/config.js` 文件中，找到这两行并替换为你的 Supabase 项目信息：

```javascript
this.SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL'; // 替换为你的 Supabase Project URL
this.SUPABASE_PUBLISHABLE_KEY = 'YOUR_SUPABASE_PUBLISHABLE_KEY'; // 替换为你的 Supabase Publishable Key
```

### 2. 创建数据库表
在 Supabase 的 SQL 编辑器中执行 `database-schema.sql` 文件中的所有 SQL 语句。

### 3. 打开应用
直接在浏览器中打开 `front/index.html` 文件。

### 4. 配置 API（首次使用）
- 点击右上角的设置按钮 ⚙️
- 填写你的 AI API 信息：
  - **API 地址**: 如 `https://api.openai.com/v1/chat/completions`
  - **API 密钥**: 你的 OpenAI API 密钥
  - **模型名称**: 如 `gpt-3.5-turbo`
- 点击"保存API配置"

**注意**: API 配置只需要在第一次使用时填写，之后会自动从数据库加载，前端不再显示这些敏感信息。

## 功能特点

### 💬 智能聊天助手
- **温柔对话**: 基于 AI API 的个性化温柔对话
- **启动流程**: 每日启动和周一冷启动指导
- **Self-care推荐**: 基于心情和需求的个性化建议

### 🔒 安全的配置管理
- **一次配置**: API 信息只需配置一次，安全存储在数据库中
- **前端隐藏**: 配置完成后，前端不再显示敏感的 API 信息
- **数据持久化**: 聊天记录和配置信息都保存在 Supabase 数据库中

### 🎨 美观的界面
- **可爱设计**: 粉色系为主的温柔设计风格
- **多主题**: 支持粉色、绿色、蓝色、紫色四种主题
- **响应式**: 完美适配桌面和移动设备

## 文件结构

```
front/
├── index.html              # 主聊天页面
├── css/
│   └── style.css          # 样式文件
├── js/
│   ├── config.js          # 配置管理（需要配置 Supabase 信息）
│   ├── supabase-client.js # Supabase 客户端
│   ├── api-client.js      # API 客户端
│   ├── chat-manager.js    # 聊天管理
│   ├── settings-manager.js # 设置管理
│   └── app.js             # 主应用
├── database-schema.sql     # PostgreSQL 数据库架构
└── README.md              # 说明文档
```

## 使用流程

### 首次使用
1. 配置 Supabase 项目信息
2. 创建数据库表
3. 打开应用，配置 API 信息
4. 开始聊天

### 日常使用
1. 打开应用
2. 直接开始聊天（API 配置已保存）
3. 享受温柔的启动服务

## 数据库架构

应用使用两个主要数据表：

### api_configs 表
- 存储用户的 API 配置信息
- 每个用户只能有一个配置
- 包含 API 地址、密钥、模型名称

### chat_messages 表
- 存储所有聊天消息
- 按用户和时间排序
- 支持用户、助手、系统消息

## 技术特点

- **纯前端**: 仅使用 HTML、CSS、JavaScript
- **安全存储**: API 配置安全存储在数据库中
- **一次配置**: 首次配置后自动加载
- **响应式设计**: 适配所有设备
- **模块化代码**: 清晰的代码结构

## 安全说明

1. **API 密钥**: 存储在 Supabase 数据库中，前端配置后不再显示
2. **用户隔离**: 每个用户的数据通过 user_id 隔离
3. **本地标识**: 使用浏览器生成的唯一 user_id
4. **数据加密**: 建议在生产环境中对敏感数据进行加密

## 常见问题

**Q: 如何获取 Supabase 项目信息？**
A: 在 Supabase 控制台的 Settings > API 中找到 Project URL 和 Publishable key。

**Q: API 配置保存后在哪里？**
A: 保存在 Supabase 数据库的 api_configs 表中，前端不再显示。

**Q: 如何更换 API 配置？**
A: 目前需要直接在数据库中修改，或清除用户数据重新配置。

**Q: 聊天记录保存在哪里？**
A: 保存在 Supabase 数据库的 chat_messages 表中。

## 支持与反馈

如果你在使用过程中遇到问题或有改进建议，欢迎反馈！

---

🌸 愿每一天都温柔开始 🌸