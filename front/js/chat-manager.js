// 聊天管理模块
class ChatManager {
    constructor() {
        this.messages = [];
        this.isLoading = false;
        this.maxMessages = 100; // 最大消息数量
        
        // DOM 元素
        this.chatMessages = null;
        this.messageInput = null;
        this.sendBtn = null;
        this.loadingIndicator = null;
        
        this.init();
    }

    // 初始化
    init() {
        this.bindElements();
        this.bindEvents();
        this.loadChatHistoryFromDB();
    }

    // 绑定DOM元素
    bindElements() {
        this.chatMessages = document.getElementById('chat-messages');
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
        this.loadingIndicator = document.getElementById('loading-indicator');
    }

    // 绑定事件
    bindEvents() {
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.handleSendMessage());
        }

        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendMessage();
                }
            });

            // 自动调整输入框高度
            this.messageInput.addEventListener('input', () => {
                this.adjustInputHeight();
            });
        }
    }

    // 处理发送消息
    async handleSendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isLoading) {
            return;
        }

        try {
            // 清空输入框
            this.messageInput.value = '';
            this.adjustInputHeight();

            // 添加用户消息
            this.addMessage({
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            });

            // 显示加载状态
            this.setLoading(true);

            // 检查API配置
            if (!window.apiClient.isConfigured()) {
                // 如果没有配置API，显示提示消息
                this.addMessage({
                    role: 'assistant',
                    content: '你好！我需要先配置API才能与你对话。请点击右上角的设置按钮 ⚙️ 配置你的API信息。\n\n配置完成后，我就可以为你提供温柔的启动服务了 🌸',
                    timestamp: new Date().toISOString(),
                    isSystem: true
                });
                return;
            }

            // 发送到API
            const response = await window.apiClient.sendMessage(message, this.getConversationHistory());

            // 添加助手回复
            this.addMessage(response);

            // 保存到数据库（如果配置了）
            if (window.supabaseClient.isInitialized) {
                await window.supabaseClient.saveMessage({
                    role: 'user',
                    content: message,
                    timestamp: new Date().toISOString()
                });
                await window.supabaseClient.saveMessage(response);
            }

        } catch (error) {
            console.error('Failed to send message:', error);
            this.addMessage({
                role: 'assistant',
                content: `抱歉，我遇到了一些问题：${error.message}\n\n请检查你的API配置是否正确，或者稍后再试 🌸`,
                timestamp: new Date().toISOString(),
                isError: true
            });
        } finally {
            this.setLoading(false);
        }
    }

    // 添加消息到聊天界面
    addMessage(message) {
        // 添加到消息数组
        this.messages.push(message);

        // 限制消息数量
        if (this.messages.length > this.maxMessages) {
            this.messages = this.messages.slice(-this.maxMessages);
        }

        // 创建消息元素
        const messageElement = this.createMessageElement(message);
        
        // 添加到DOM
        if (this.chatMessages) {
            // 移除欢迎消息（如果存在）
            const welcomeMessage = this.chatMessages.querySelector('.welcome-message');
            if (welcomeMessage && this.messages.length > 1) {
                welcomeMessage.remove();
            }

            this.chatMessages.appendChild(messageElement);
            this.scrollToBottom();
        }

        // 保存到本地存储
        this.saveChatHistory();
    }

    // 创建消息DOM元素
    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.role}-message`;
        
        if (message.isError) {
            messageDiv.classList.add('error-message');
        }

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = message.role === 'user' ? '😊' : '🌸';

        const content = document.createElement('div');
        content.className = 'message-content';
        
        // 处理消息内容（支持简单的markdown）
        const formattedContent = this.formatMessageContent(message.content);
        content.innerHTML = formattedContent;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        return messageDiv;
    }

    // 格式化消息内容
    formatMessageContent(content) {
        // 简单的markdown支持
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }

    // 获取对话历史（用于API调用）
    getConversationHistory() {
        // 返回最近的10条消息作为上下文
        return this.messages
            .filter(msg => !msg.isError)
            .slice(-10)
            .map(msg => ({
                role: msg.role,
                content: msg.content
            }));
    }

    // 设置加载状态
    setLoading(loading) {
        this.isLoading = loading;
        
        if (this.loadingIndicator) {
            if (loading) {
                this.loadingIndicator.classList.remove('hidden');
            } else {
                this.loadingIndicator.classList.add('hidden');
            }
        }

        if (this.sendBtn) {
            this.sendBtn.disabled = loading;
            this.sendBtn.style.opacity = loading ? '0.6' : '1';
        }

        if (this.messageInput) {
            this.messageInput.disabled = loading;
        }
    }

    // 滚动到底部
    scrollToBottom() {
        if (this.chatMessages) {
            setTimeout(() => {
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }, 100);
        }
    }

    // 调整输入框高度
    adjustInputHeight() {
        if (this.messageInput) {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
        }
    }

    // 保存聊天历史到本地存储
    saveChatHistory() {
        try {
            const chatData = {
                messages: this.messages,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('workingDayStarter_chatHistory', JSON.stringify(chatData));
        } catch (error) {
            console.warn('Failed to save chat history:', error);
        }
    }

    // 从数据库加载聊天历史
    async loadChatHistoryFromDB() {
        if (window.supabaseClient.isInitialized) {
            try {
                const messages = await window.supabaseClient.getChatHistory();
                if (messages && messages.length > 0) {
                    this.messages = messages;
                    this.renderMessages();
                    return;
                }
            } catch (error) {
                console.warn('Failed to load chat history from database:', error);
            }
        }
        
        // 如果数据库加载失败，尝试从本地存储加载
        this.loadChatHistoryFromLocal();
    }

    // 从本地存储加载聊天历史
    loadChatHistoryFromLocal() {
        try {
            const saved = localStorage.getItem('workingDayStarter_chatHistory');
            if (saved) {
                const chatData = JSON.parse(saved);
                if (chatData.messages && Array.isArray(chatData.messages)) {
                    this.messages = chatData.messages;
                    this.renderMessages();
                }
            }
        } catch (error) {
            console.warn('Failed to load chat history from local storage:', error);
        }
    }

    // 渲染所有消息
    renderMessages() {
        if (!this.chatMessages) return;

        // 清空现有消息（保留欢迎消息）
        const welcomeMessage = this.chatMessages.querySelector('.welcome-message');
        this.chatMessages.innerHTML = '';
        
        if (welcomeMessage && this.messages.length === 0) {
            this.chatMessages.appendChild(welcomeMessage);
        }

        // 渲染所有消息
        this.messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            this.chatMessages.appendChild(messageElement);
        });

        this.scrollToBottom();
    }

    // 清空聊天历史
    clearChatHistory() {
        this.messages = [];
        localStorage.removeItem('workingDayStarter_chatHistory');
        
        if (this.chatMessages) {
            // 保留欢迎消息
            const welcomeMessage = document.querySelector('.welcome-message');
            this.chatMessages.innerHTML = '';
            if (welcomeMessage) {
                this.chatMessages.appendChild(welcomeMessage.cloneNode(true));
            }
        }
    }

    // 发送预设消息
    sendPresetMessage(message) {
        if (this.messageInput) {
            this.messageInput.value = message;
            this.handleSendMessage();
        }
    }

    // 添加系统消息
    addSystemMessage(content) {
        this.addMessage({
            role: 'assistant',
            content: content,
            timestamp: new Date().toISOString(),
            isSystem: true
        });
    }

    // 获取消息统计
    getMessageStats() {
        const userMessages = this.messages.filter(msg => msg.role === 'user').length;
        const assistantMessages = this.messages.filter(msg => msg.role === 'assistant').length;
        
        return {
            total: this.messages.length,
            user: userMessages,
            assistant: assistantMessages
        };
    }
}

// 导出单例实例
window.chatManager = new ChatManager();