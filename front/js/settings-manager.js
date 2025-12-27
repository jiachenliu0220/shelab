// 设置管理模块
class SettingsManager {
    constructor() {
        this.isOpen = false;
        
        // DOM 元素
        this.settingsBtn = null;
        this.settingsPanel = null;
        this.closeBtn = null;
        this.saveApiConfigBtn = null;
        
        // 表单元素
        this.apiUrlInput = null;
        this.apiKeyInput = null;
        this.modelNameInput = null;
        this.themeSelect = null;
        
        this.init();
    }

    // 初始化
    init() {
        this.bindElements();
        this.bindEvents();
        this.loadSettings();
        this.applyTheme();
        this.checkAPIConfigVisibility();
    }

    // 绑定DOM元素
    bindElements() {
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsPanel = document.getElementById('settings-panel');
        this.closeBtn = document.getElementById('close-settings');
        this.saveApiConfigBtn = document.getElementById('save-api-config');
        
        // 表单元素
        this.apiUrlInput = document.getElementById('api-url');
        this.apiKeyInput = document.getElementById('api-key');
        this.modelNameInput = document.getElementById('model-name');
        this.themeSelect = document.getElementById('theme-select');
        
        // 数据管理按钮
        this.clearDataBtn = document.getElementById('clear-data');
    }

    // 绑定事件
    bindEvents() {
        // 打开/关闭设置面板
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => this.openSettings());
        }

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeSettings());
        }

        // 保存API配置
        if (this.saveApiConfigBtn) {
            this.saveApiConfigBtn.addEventListener('click', () => this.saveAPIConfig());
        }

        // 主题变化
        if (this.themeSelect) {
            this.themeSelect.addEventListener('change', () => this.applyTheme());
        }

        // 数据管理
        if (this.clearDataBtn) {
            this.clearDataBtn.addEventListener('click', () => this.clearData());
        }

        // 点击面板外部关闭
        document.addEventListener('click', (e) => {
            if (this.isOpen && this.settingsPanel && !this.settingsPanel.contains(e.target) && !this.settingsBtn.contains(e.target)) {
                this.closeSettings();
            }
        });

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeSettings();
            }
        });
    }

    // 检查API配置显示状态
    checkAPIConfigVisibility() {
        const apiConfigSection = document.getElementById('api-config-section');
        if (apiConfigSection) {
            if (window.config.hasConfiguredAPI()) {
                // 已配置API，隐藏配置区域
                apiConfigSection.style.display = 'none';
            } else {
                // 未配置API，显示配置区域
                apiConfigSection.style.display = 'block';
            }
        }
    }

    // 打开设置面板
    openSettings() {
        if (this.settingsPanel) {
            this.settingsPanel.classList.remove('hidden');
            this.isOpen = true;
            this.loadSettings(); // 重新加载当前设置
        }
    }

    // 关闭设置面板
    closeSettings() {
        if (this.settingsPanel) {
            this.settingsPanel.classList.add('hidden');
            this.isOpen = false;
        }
    }

    // 加载设置到表单
    loadSettings() {
        if (this.themeSelect) {
            this.themeSelect.value = window.config.get('ui.theme') || 'pink';
        }
    }

    // 保存API配置
    async saveAPIConfig() {
        try {
            console.log('🔧 开始保存API配置...');
            
            // 收集API配置数据
            const apiConfig = {
                url: this.apiUrlInput.value.trim(),
                key: this.apiKeyInput.value.trim(),
                model: this.modelNameInput.value.trim() || 'gpt-3.5-turbo'
            };

            console.log('📝 API配置数据:', {
                url: apiConfig.url,
                key: apiConfig.key ? '***已填写***' : '未填写',
                model: apiConfig.model
            });

            // 验证必填字段
            if (!apiConfig.url || !apiConfig.key) {
                this.showNotification('请填写完整的API信息', 'error');
                return;
            }

            // 检查Supabase连接状态
            console.log('🔗 检查Supabase连接状态...');
            if (!window.supabaseClient.isInitialized) {
                console.error('❌ Supabase客户端未初始化');
                this.showNotification('数据库连接失败，请检查Supabase配置', 'error');
                return;
            }

            console.log('✅ Supabase客户端已初始化');

            // 保存到数据库
            console.log('💾 正在保存到数据库...');
            const result = await window.supabaseClient.saveAPIConfig(apiConfig);
            
            console.log('📊 保存结果:', result);
            
            if (result) {
                console.log('✅ API配置保存成功');
                
                // 标记用户已配置API
                window.config.markAPIConfigured();
                
                // 重新加载API配置到客户端
                await window.apiClient.loadAPIConfig();
                
                this.showNotification('API配置保存成功！ 🌸', 'success');
                
                // 隐藏API配置区域
                this.checkAPIConfigVisibility();
                
                // 关闭设置面板
                setTimeout(() => {
                    this.closeSettings();
                }, 1500);
                
            } else {
                console.error('❌ 保存结果为空');
                this.showNotification('API配置保存失败，请检查数据库连接', 'error');
            }
            
        } catch (error) {
            console.error('❌ 保存API配置时发生错误:', error);
            console.error('错误详情:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            this.showNotification('API配置保存失败：' + error.message, 'error');
        }
    }

    // 应用主题
    applyTheme() {
        const theme = this.themeSelect ? this.themeSelect.value : window.config.get('ui.theme');
        if (theme) {
            document.documentElement.setAttribute('data-theme', theme);
            window.config.set('ui.theme', theme);
        }
    }

    // 清除数据
    clearData() {
        if (confirm('确定要清除所有聊天记录吗？这个操作不可撤销。')) {
            try {
                // 清除聊天历史
                window.chatManager.clearChatHistory();
                
                // 清除数据库中的聊天记录
                if (window.supabaseClient.isInitialized) {
                    window.supabaseClient.clearChatHistory();
                }
                
                this.showNotification('聊天记录清除成功！ 🗑️', 'success');
            } catch (error) {
                console.error('Failed to clear data:', error);
                this.showNotification('数据清除失败：' + error.message, 'error');
            }
        }
    }

    // 显示通知
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 添加样式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            opacity: '0',
            transform: 'translateY(-20px)',
            transition: 'all 0.3s ease'
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
            notification.style.transform = 'translateY(0)';
        }, 10);

        // 自动移除
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // 获取当前设置状态
    getSettingsStatus() {
        return {
            apiConfigured: window.config.hasConfiguredAPI(),
            theme: window.config.get('ui.theme')
        };
    }
}

// 导出单例实例
window.settingsManager = new SettingsManager();