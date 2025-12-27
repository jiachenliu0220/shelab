// 简化主应用模块 - 纯本地版本
class SimpleApp {
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
            // 设置初始化完成标志
            this.isInitialized = true;
            
            // 显示欢迎提示
            this.showWelcomeHint();
            
            console.log('✨ 打工人启动助手已准备就绪！');
            
        } catch (error) {
            console.error('App start failed:', error);
        }
    }

    // 显示欢迎提示
    showWelcomeHint() {
        // 检查是否是首次访问
        const hasVisited = localStorage.getItem('hasVisited');
        if (!hasVisited) {
            setTimeout(() => {
                this.showNotification(
                    '欢迎使用打工人启动助手！🌸 这是一个纯本地版本，所有数据都保存在你的浏览器中。',
                    'info',
                    5000
                );
                localStorage.setItem('hasVisited', 'true');
            }, 2000);
        }
    }

    // 显示通知
    showNotification(message, type = 'info', duration = 3000) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 添加样式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            opacity: '0',
            transition: 'all 0.3s ease',
            maxWidth: '400px',
            textAlign: 'center'
        });

        // 根据类型设置背景色
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3'
        };
        notification.style.background = colors[type] || colors.info;

        // 添加到页面
        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);

        // 自动移除
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
}

// 当页面加载完成时启动应用
window.app = new SimpleApp();