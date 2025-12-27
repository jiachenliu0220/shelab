// API 客户端模块
class ApiClient {
    constructor() {
        this.apiConfig = null;
    }

    // 从数据库加载API配置
    async loadAPIConfig() {
        try {
            this.apiConfig = await window.supabaseClient.getAPIConfig();
            return this.apiConfig !== null;
        } catch (error) {
            console.error('Failed to load API config:', error);
            return false;
        }
    }

    // 检查API配置
    isConfigured() {
        return this.apiConfig && this.apiConfig.api_url && this.apiConfig.api_key && this.apiConfig.model_name;
    }

    // 发送聊天消息到API
    async sendMessage(message, conversationHistory = []) {
        if (!this.isConfigured()) {
            throw new Error('API 配置未找到，请先配置 API 信息');
        }

        try {
            // 构建消息历史
            const messages = [
                {
                    role: 'system',
                    content: this.getSystemPrompt()
                },
                ...conversationHistory.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                {
                    role: 'user',
                    content: message
                }
            ];

            const requestBody = {
                model: this.apiConfig.model_name,
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000,
                stream: false
            };

            const response = await fetch(this.apiConfig.api_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiConfig.api_key}`
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
        return `你是一个温柔的打工人启动助手，名字叫"小花"🌸。你的任务是帮助用户温柔地开启每一天的工作和生活。

你的特点：
- 温柔、鼓励、充满同理心
- 不会给用户压力或焦虑
- 专注于"开始"而不是"完成"
- 使用可爱的表情符号
- 语言风格轻松友好，像朋友一样

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

请根据用户的具体需求提供个性化的温柔回应。`;
    }

    // 测试API连接
    async testConnection() {
        if (!this.isConfigured()) {
            return {
                success: false,
                error: 'API 配置未找到'
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
}

// 导出单例实例
window.apiClient = new ApiClient();