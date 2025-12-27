// 主应用模块
class App {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    // 初始化应用
    async init() {
        try {
            console.log('🌸 打工人启动助手正在启动...');
            
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.start());
            } else {
                this.start();
            }
        } catch (error) {
            console.error('App initialization failed:', error);
        }
    }

    // 启动应用
    async start() {
        try {
            // 初始化Supabase客户端
            await window.supabaseClient.initialize();
            
            // 加载API配置
            await window.apiClient.loadAPIConfig();

            // 设置初始化完成标志
            this.isInitialized = true;
            
            // 显示欢迎消息
            this.showWelcomeMessage();
            
            console.log('✨ 打工人启动助手已准备就绪！');
            
        } catch (error) {
            console.error('App start failed:', error);
        }
    }

    // 显示欢迎消息
    showWelcomeMessage() {
        if (!window.config.hasConfiguredAPI()) {
            setTimeout(() => {
                window.chatManager.addSystemMessage(
                    '欢迎使用打工人启动助手！🌸\n\n' +
                    '为了获得最佳体验，请先在设置中配置你的 API 信息：\n' +
                    '• API 地址\n' +
                    '• API 密钥\n' +
                    '• 模型名称\n\n' +
                    '配置完成后，我就可以为你提供个性化的温柔启动服务了～'
                );
            }, 1000);
        }
    }
}

// 当页面加载完成时启动应用
window.app = new App();