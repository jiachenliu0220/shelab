// 本地 API 客户端 - 无需数据库版本
class LocalApiClient {
    constructor() {
        this.apiConfig = null;
        this.isConfigured = false;
        this.init();
    }

    // 初始化
    init() {
        this.loadAPIConfig();
    }

    // 从本地存储加载API配置
    loadAPIConfig() {
        try {
            this.apiConfig = window.config.loadAPIConfig();
            this.isConfigured = this.apiConfig && this.apiConfig.configured;
            console.log('API配置加载状态:', this.isConfigured ? '已配置' : '未配置');
            return this.isConfigured;
        } catch (error) {
            console.error('Failed to load API config:', error);
            this.isConfigured = false;
            return false;
        }
    }

    // 检查API配置
    hasValidConfig() {
        return this.isConfigured && 
               this.apiConfig && 
               this.apiConfig.url && 
               this.apiConfig.key && 
               this.apiConfig.model;
    }

    // 发送聊天消息到API
    async sendMessage(message, conversationHistory = []) {
        if (!this.hasValidConfig()) {
            throw new Error('API 配置未找到或不完整，请先配置 API 信息');
        }

        try {
            // 构建消息历史
            const messages = [
                {
                    role: 'system',
                    content: this.getSystemPrompt()
                },
                ...conversationHistory.slice(-10).map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                {
                    role: 'user',
                    content: message
                }
            ];

            const requestBody = {
                model: this.apiConfig.model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000,
                stream: false
            };

            console.log('发送API请求到:', this.apiConfig.url);

            const response = await fetch(this.apiConfig.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiConfig.key}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API 请求失败: ${response.status} ${response.statusText}\n${errorText}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('API 返回格式异常');
            }

            return {
                content: data.choices[0].message.content,
                role: 'assistant',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // 获取系统提示词
    getSystemPrompt() {
        const userName = window.config.get('user.name') || '小伙伴';
        
        return `你是一个温柔的打工人启动助手，名字叫"小花"🌸。你的任务是帮助用户温柔地开启每一天的工作和生活。

用户的昵称是：${userName}

你的特点：
- 温柔、鼓励、充满同理心
- 不会给用户压力或焦虑
- 专注于"开始"而不是"完成"
- 使用可爱的表情符号
- 语言风格轻松友好，像朋友一样
- 可以适当称呼用户的昵称，但不要过度使用

你可以帮助用户：
1. 每日启动流程：
   - 昨日回顾（确认发生过的事情，不是反省）
   - 今日规划（最重要的3件事 + 可选的额外事项）
   - Self-care 推荐（基于心情和需求）

2. 周一冷启动：
   - 询问心情状态
   - 了解本周关怀需求
   - 推荐适合的 self-care 活动
   - 选择陪伴动物

3. 情绪支持和鼓励

4. Self-care 建议和提醒

请始终保持温柔、鼓励的语调，避免任何形式的批评或压力。重点是让用户感到被理解和支持。

用户可能会说：
- "我想开始今天的启动"
- "帮我选择今天的self-care"
- "我感觉有点累"
- "今天是周一，我需要帮助"

请根据用户的具体需求提供个性化的温柔回应。回复要简洁而温暖，通常1-3句话即可。`;
    }

    // 测试API连接
    async testConnection() {
        if (!this.hasValidConfig()) {
            return {
                success: false,
                error: 'API 配置未找到或不完整'
            };
        }

        try {
            const response = await this.sendMessage('你好，这是一个连接测试。请简单回复"连接成功"。');
            return {
                success: true,
                message: '连接测试成功',
                response: response.content
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 保存API配置
    saveAPIConfig(apiConfig) {
        try {
            const success = window.config.saveAPIConfig(apiConfig);
            if (success) {
                this.loadAPIConfig(); // 重新加载配置
            }
            return success;
        } catch (error) {
            console.error('Failed to save API config:', error);
            return false;
        }
    }

    // 获取配置状态
    getConfigStatus() {
        return {
            configured: this.isConfigured,
            hasValidConfig: this.hasValidConfig(),
            model: this.apiConfig ? this.apiConfig.model : null
        };
    }
}

// 导出单例实例
window.apiClient = new LocalApiClient();