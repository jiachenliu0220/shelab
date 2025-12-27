// Supabase 客户端模块
class SupabaseClient {
    constructor() {
        this.client = null;
        this.isInitialized = false;
    }

    // 初始化 Supabase 客户端
    async initialize() {
        const config = window.config.getSupabaseConfig();
        
        if (!config.url || !config.key) {
            console.warn('Supabase configuration not found in config.js');
            return false;
        }

        try {
            // 使用 Supabase JavaScript 客户端
            this.client = {
                url: config.url,
                key: config.key,
                // 基础的 HTTP 请求方法
                request: async (method, endpoint, data = null) => {
                    const url = `${config.url}/rest/v1/${endpoint}`;
                    const headers = {
                        'apikey': config.key,
                        'Authorization': `Bearer ${config.key}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    };

                    const options = {
                        method,
                        headers
                    };

                    if (data && (method === 'POST' || method === 'PATCH')) {
                        options.body = JSON.stringify(data);
                    }

                    const response = await fetch(url, options);
                    
                    if (!response.ok) {
                        throw new Error(`Supabase request failed: ${response.status} ${response.statusText}`);
                    }

                    return response.json();
                }
            };

            this.isInitialized = true;
            console.log('Supabase client initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Supabase client:', error);
            return false;
        }
    }

    // 保存API配置到数据库
    async saveAPIConfig(apiConfig) {
        if (!this.isInitialized) {
            console.warn('Supabase client not initialized');
            return null;
        }

        try {
            const userId = window.config.get('user.id');
            const configData = {
                user_id: userId,
                api_url: apiConfig.url,
                api_key: apiConfig.key, // 注意：在生产环境中应该加密存储
                model_name: apiConfig.model,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // 先尝试更新，如果不存在则插入
            const result = await this.client.request('POST', 'api_configs', configData);
            return result[0];
        } catch (error) {
            console.error('Failed to save API config:', error);
            return null;
        }
    }

    // 获取API配置
    async getAPIConfig() {
        if (!this.isInitialized) {
            console.warn('Supabase client not initialized');
            return null;
        }

        try {
            const userId = window.config.get('user.id');
            const result = await this.client.request(
                'GET', 
                `api_configs?user_id=eq.${userId}&limit=1`
            );
            return result[0] || null;
        } catch (error) {
            console.error('Failed to get API config:', error);
            return null;
        }
    }

    // 保存聊天消息
    async saveMessage(message) {
        if (!this.isInitialized) {
            console.warn('Supabase client not initialized');
            return null;
        }

        try {
            const userId = window.config.get('user.id');
            const messageData = {
                user_id: userId,
                role: message.role,
                content: message.content,
                timestamp: message.timestamp || new Date().toISOString()
            };

            const result = await this.client.request('POST', 'chat_messages', messageData);
            return result[0];
        } catch (error) {
            console.error('Failed to save message:', error);
            return null;
        }
    }

    // 获取聊天历史
    async getChatHistory(limit = 50) {
        if (!this.isInitialized) {
            console.warn('Supabase client not initialized');
            return [];
        }

        try {
            const userId = window.config.get('user.id');
            const result = await this.client.request(
                'GET', 
                `chat_messages?user_id=eq.${userId}&order=timestamp.desc&limit=${limit}`
            );
            return result.reverse(); // 按时间正序返回
        } catch (error) {
            console.error('Failed to get chat history:', error);
            return [];
        }
    }

    // 清除聊天历史
    async clearChatHistory() {
        if (!this.isInitialized) {
            console.warn('Supabase client not initialized');
            return false;
        }

        try {
            const userId = window.config.get('user.id');
            await this.client.request('DELETE', `chat_messages?user_id=eq.${userId}`);
            return true;
        } catch (error) {
            console.error('Failed to clear chat history:', error);
            return false;
        }
    }

    // 检查连接状态
    async checkConnection() {
        if (!this.isInitialized) {
            return false;
        }

        try {
            // 简单的健康检查
            await this.client.request('GET', 'chat_messages?limit=1');
            return true;
        } catch (error) {
            console.error('Supabase connection check failed:', error);
            return false;
        }
    }
}

// 导出单例实例
window.supabaseClient = new SupabaseClient();