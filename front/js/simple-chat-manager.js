// 混合聊天管理器 - API + 本地存储版本
class HybridChatManager {
    constructor() {
        this.messages = [];
        this.chatContainer = null;
        this.messageInput = null;
        this.sendBtn = null;
        this.storageKey = 'workingDayStarter_messages';
        
        this.init();
    }

    // 初始化
    init() {
        this.bindElements();
        this.bindEvents();
        this.loadChatHistory();
        this.displayWelcomeMessage();
    }

    // 绑定DOM元素
    bindElements() {
        this.chatContainer = document.getElementById('chat-messages');
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
    }

    // 绑定事件
    bindEvents() {
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
    }

    // 发送消息
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // 清空输入框
        this.messageInput.value = '';

        // 添加用户消息
        this.addMessage({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });

        // 显示加载指示器
        this.showLoading();

        try {
            let aiResponse;
            
            // 尝试使用API
            if (window.apiClient.hasValidConfig()) {
                console.log('使用API生成回复...');
                try {
                    const response = await window.apiClient.sendMessage(message, this.getRecentMessages());
                    aiResponse = response.content;
                } catch (apiError) {
                    console.warn('API调用失败，切换到本地回复:', apiError.message);
                    aiResponse = this.generateLocalResponse(message) + '\n\n💡 (API暂时不可用，这是本地回复)';
                }
            } else {
                console.log('API未配置，使用本地回复...');
                aiResponse = this.generateLocalResponse(message);
            }

            // 模拟思考时间
            setTimeout(() => {
                this.hideLoading();
                
                this.addMessage({
                    role: 'assistant',
                    content: aiResponse,
                    timestamp: new Date().toISOString()
                });
            }, 500 + Math.random() * 1000); // 0.5-1.5秒随机延迟

        } catch (error) {
            console.error('发送消息失败:', error);
            this.hideLoading();
            
            this.addMessage({
                role: 'assistant',
                content: '抱歉，我现在有点困惑 😅 请稍后再试，或者检查一下网络连接～',
                timestamp: new Date().toISOString()
            });
        }
    }

    // 获取最近的消息历史（用于API上下文）
    getRecentMessages() {
        return this.messages.slice(-10); // 最近10条消息
    }

    // 生成本地回复（降级方案）
    generateLocalResponse(userMessage) {
        const responses = {
            // 问候语
            greetings: [
                "你好呀！🌸 我是你的温柔启动助手小花，很高兴见到你～",
                "嗨！今天过得怎么样呢？🦊",
                "你好！有什么我可以帮助你的吗？✨"
            ],
            
            // 启动相关
            startup: [
                "让我们一起开启美好的一天吧！🌅 你想从哪里开始呢？",
                "每一天都是新的开始呢～ 🌸 告诉我你今天的心情如何？",
                "今天想要完成什么特别的事情吗？我来帮你规划一下～ 📝"
            ],
            
            // 情绪支持
            emotional: [
                "我理解你的感受 💕 每个人都会有这样的时候，你已经很棒了！",
                "没关系的，慢慢来就好 🌿 我会一直陪着你的～",
                "你很勇敢呢！🌟 相信自己，一切都会好起来的"
            ],
            
            // Self-care建议
            selfcare: [
                "要不要试试深呼吸呢？🌸 或者听听轻松的音乐？",
                "记得要好好照顾自己哦～ 💕 喝点水，休息一下",
                "今天有没有做让自己开心的事情呢？🦋"
            ],
            
            // API相关
            api: [
                "如果你想要更智能的对话，可以在设置中配置AI API哦～ 🤖",
                "我现在是本地模式，如果配置了API会更聪明呢！✨"
            ],
            
            // 默认回复
            default: [
                "嗯嗯，我在认真听呢～ 🌸 还有什么想和我分享的吗？",
                "谢谢你告诉我这些 💕 你的想法很有趣呢！",
                "我觉得你说得很有道理呢～ ✨ 继续说说吧！",
                "听起来很不错呢！🌿 我很高兴能和你聊天～"
            ]
        };

        const message = userMessage.toLowerCase();
        
        // 检测消息类型并返回相应回复
        if (message.includes('你好') || message.includes('hi') || message.includes('hello')) {
            return this.getRandomResponse(responses.greetings);
        }
        
        if (message.includes('启动') || message.includes('开始') || message.includes('今天')) {
            return this.getRandomResponse(responses.startup);
        }
        
        if (message.includes('累') || message.includes('难过') || message.includes('压力') || message.includes('焦虑')) {
            return this.getRandomResponse(responses.emotional);
        }
        
        if (message.includes('休息') || message.includes('放松') || message.includes('self-care')) {
            return this.getRandomResponse(responses.selfcare);
        }
        
        if (message.includes('api') || message.includes('智能') || message.includes('配置')) {
            return this.getRandomResponse(responses.api);
        }
        
        return this.getRandomResponse(responses.default);
    }

    // 获取随机回复
    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // 添加消息
    addMessage(message) {
        this.messages.push(message);
        this.displayMessage(message);
        this.saveChatHistory();
        this.scrollToBottom();
    }

    // 显示消息
    displayMessage(message) {
        if (!this.chatContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.role}-message`;
        
        const avatar = message.role === 'user' ? '👤' : '🌸';
        const time = new Date(message.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-text">${this.formatMessage(message.content)}</div>
                <div class="message-time">${time}</div>
            </div>
        `;

        this.chatContainer.appendChild(messageDiv);
    }

    // 格式化消息内容
    formatMessage(content) {
        return content.replace(/\n/g, '<br>');
    }

    // 显示欢迎消息
    displayWelcomeMessage() {
        if (this.messages.length === 0) {
            setTimeout(() => {
                const hasAPI = window.apiClient.hasValidConfig();
                const welcomeText = hasAPI 
                    ? '你好！我是你的温柔启动助手小花 🌸\n\n我已经连接到AI，可以为你提供更智能的对话！\n\n有什么想和我分享的吗？'
                    : '你好！我是你的温柔启动助手小花 🌸\n\n我可以帮你：\n• 开启美好的一天\n• 提供情绪支持和鼓励\n• 给出 self-care 建议\n• 陪你聊天解压\n\n💡 在设置中配置AI API可以获得更智能的对话哦～';

                this.addMessage({
                    role: 'assistant',
                    content: welcomeText,
                    timestamp: new Date().toISOString()
                });
            }, 500);
        }
    }

    // 显示加载指示器
    showLoading() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.remove('hidden');
        }
    }

    // 隐藏加载指示器
    hideLoading() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
    }

    // 滚动到底部
    scrollToBottom() {
        if (this.chatContainer) {
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        }
    }

    // 保存聊天历史
    saveChatHistory() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    }

    // 加载聊天历史
    loadChatHistory() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.messages = JSON.parse(saved);
                this.messages.forEach(message => this.displayMessage(message));
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
            this.messages = [];
        }
    }

    // 清除聊天历史
    clearChatHistory() {
        this.messages = [];
        if (this.chatContainer) {
            // 保留欢迎消息
            const welcomeMessage = this.chatContainer.querySelector('.welcome-message');
            this.chatContainer.innerHTML = '';
            if (welcomeMessage) {
                this.chatContainer.appendChild(welcomeMessage);
            }
        }
        localStorage.removeItem(this.storageKey);
        
        // 重新显示欢迎消息
        setTimeout(() => {
            this.displayWelcomeMessage();
        }, 500);
    }

    // 添加系统消息
    addSystemMessage(content) {
        this.addMessage({
            role: 'assistant',
            content: content,
            timestamp: new Date().toISOString()
        });
    }
}

// 导出单例实例
window.chatManager = new HybridChatManager();