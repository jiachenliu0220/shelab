// 配置管理模块
class Config {
    constructor() {
        // Supabase 配置 - 你需要在这里填入你的项目信息
        this.SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL'; // 替换为你的 Supabase Project URL
        this.SUPABASE_PUBLISHABLE_KEY = 'YOUR_SUPABASE_PUBLISHABLE_KEY'; // 替换为你的 Supabase Publishable Key
        
        this.storageKey = 'workingDayStarter_config';
        this.defaultConfig = {
            ui: {
                theme: 'pink'
            },
            user: {
                id: this.generateUserId(),
                hasConfiguredAPI: false
            }
        };
        this.config = this.loadConfig();
    }

    // 加载配置
    loadConfig() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...this.defaultConfig, ...parsed };
            }
        } catch (error) {
            console.warn('Failed to load config:', error);
        }
        return { ...this.defaultConfig };
    }

    // 保存配置
    saveConfig() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.config));
            return true;
        } catch (error) {
            console.error('Failed to save config:', error);
            return false;
        }
    }

    // 获取配置值
    get(path) {
        const keys = path.split('.');
        let value = this.config;
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return undefined;
            }
        }
        return value;
    }

    // 设置配置值
    set(path, value) {
        const keys = path.split('.');
        let current = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[keys[keys.length - 1]] = value;
        return this.saveConfig();
    }

    // 批量更新配置
    update(updates) {
        for (const [path, value] of Object.entries(updates)) {
            this.set(path, value);
        }
        return this.saveConfig();
    }

    // 重置配置
    reset() {
        this.config = { ...this.defaultConfig };
        return this.saveConfig();
    }

    // 生成用户ID
    generateUserId() {
        let userId = localStorage.getItem('user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('user_id', userId);
        }
        return userId;
    }

    // 获取Supabase配置
    getSupabaseConfig() {
        return {
            url: this.SUPABASE_URL,
            key: this.SUPABASE_PUBLISHABLE_KEY
        };
    }

    // 检查用户是否已配置API
    hasConfiguredAPI() {
        return this.get('user.hasConfiguredAPI') || false;
    }

    // 标记用户已配置API
    markAPIConfigured() {
        this.set('user.hasConfiguredAPI', true);
    }

    // 获取完整配置对象（用于调试）
    getAll() {
        return { ...this.config };
    }
}

// 导出单例实例
window.config = new Config();