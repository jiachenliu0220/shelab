// 混合设置管理器 - API + 本地存储版本
class HybridSettingsManager {
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
        this.userNameInput = null;
        
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
        this.userNameInput = document.getElementById('user-name');
        
        // 数据管理按钮
        this.clearDataBtn = document.getElementById('clear-data');
        this.testApiBtn = document.getElementById('test-api');
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

        // 测试API连接
        if (this.testApiBtn) {
            this.testApiBtn.addEventListener('click', () => this.testAPIConnection());
        }

        // 主题变化
        if (this.themeSelect) {
            this.themeSelect.addEventListener('change', () => this.applyTheme());
        }

        // 用户名变化
        if (this.userNameInput) {
            this.userNameInput.addEventListener('blur', () => this.saveUserName());
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
            // 总是显示API配置区域，但根据配置状态调整提示
            apiConfigSection.style.display = 'block';
            this.updateAPIConfigStatus();
        }
    }

    // 更新API配置状态显示
    updateAPIConfigStatus() {
        const statusElement = document.getElementById('api-status');
        const hasConfig = window.apiClient.hasValidConfig();
        
        if (statusElement) {
            if (hasConfig) {
                statusElement.innerHTML = '✅ API已配置并可用';
                statusElement.className = 'api-status success';
            } else {
                statusElement.innerHTML = '⚠️ 未配置API，将使用本地回复';
                statusElement.className = 'api-status warning';
            }
        }
    }

    // 打开设置面板
    openSettings() {
        if (this.settingsPanel) {
            this.settingsPanel.classList.remove('hidden');
            this.isOpen = true;
            this.loadSettings(); // 重新加载当前设置
            this.updateAPIConfigStatus();
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
        
        if (this.userNameInput) {
            this.userNameInput.value = window.config.get('user.name') || '小伙伴';
        }

        // 加载API配置（不显示敏感信息）
        const apiConfig = window.config.loadAPIConfig();
        if (apiConfig && apiConfig.configured) {
            if (this.apiUrlInput) {
                this.apiUrlInput.value = apiConfig.url;
            }
            if (this.modelNameInput) {
                this.modelNameInput.value = apiConfig.model;
            }
            if (this.apiKeyInput) {
                this.apiKeyInput.placeholder = '已配置 (点击重新输入)';
            }
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

            // 保存到本地存储
            console.log('💾 正在保存到本地存储...');
            const success = window.apiClient.saveAPIConfig(apiConfig);
            
            if (success) {
                console.log('✅ API配置保存成功');
                
                this.showNotification('API配置保存成功！ 🌸', 'success');
                
                // 更新状态显示
                this.updateAPIConfigStatus();
                
                // 清空密钥输入框
                if (this.apiKeyInput) {
                    this.apiKeyInput.value = '';
                    this.apiKeyInput.placeholder = '已配置 (点击重新输入)';
                }
                
                // 重新加载聊天管理器的欢迎消息
                setTimeout(() => {
                    window.chatManager.clearChatHistory();
                }, 1000);
                
            } else {
                console.error('❌ 保存失败');
                this.showNotification('API配置保存失败，请重试', 'error');
            }
            
        } catch (error) {
            console.error('❌ 保存API配置时发生错误:', error);
            this.showNotification('API配置保存失败：' + error.message, 'error');
        }
    }

    // 测试API连接
    async testAPIConnection() {
        try {
            this.showNotification('正在测试API连接...', 'info');
            
            const result = await window.apiClient.testConnection();
            
            if (result.success) {
                this.showNotification('API连接测试成功！ ✅', 'success');
            } else {
                this.showNotification('API连接测试失败：' + result.error, 'error');
            }
        } catch (error) {
            this.showNotification('API连接测试失败：' + error.message, 'error');
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

    // 保存用户名
    saveUserName() {
        if (this.userNameInput) {
            const userName = this.userNameInput.value.trim() || '小伙伴';
            window.config.set('user.name', userName);
            this.showNotification('用户名已保存！ 🌸', 'success');
        }
    }

    // 清除数据
    clearData() {
        if (confirm('确定要清除所有聊天记录吗？这个操作不可撤销。')) {
            try {
                // 清除聊天历史
                window.chatManager.clearChatHistory();
                
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
            theme: window.config.get('ui.theme'),
            userName: window.config.get('user.name'),
            apiConfigured: window.apiClient.hasValidConfig()
        };
    }
}

// 导出单例实例
window.settingsManager = new HybridSettingsManager();