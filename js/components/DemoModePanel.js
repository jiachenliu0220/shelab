// 演示模式控制面板组件
class DemoModePanel {
  constructor() {
    this.isVisible = false;
    this.init();
  }

  init() {
    this.createPanel();
    this.bindEvents();
    this.updateDisplay();
  }

  // 创建演示模式面板
  createPanel() {
    const panel = document.createElement('div');
    panel.id = 'demo-mode-panel';
    panel.className = 'demo-mode-panel';
    panel.innerHTML = `
      <div class="demo-panel-header">
        <h3>🎮 演示模式</h3>
        <button class="demo-close-btn" id="demo-close-btn">×</button>
      </div>
      
      <div class="demo-panel-content">
        <div class="demo-status">
          <div class="demo-status-item">
            <span class="demo-label">状态:</span>
            <span class="demo-value" id="demo-status">未启用</span>
          </div>
          <div class="demo-status-item">
            <span class="demo-label">虚拟日期:</span>
            <span class="demo-value" id="virtual-date">-</span>
          </div>
          <div class="demo-status-item">
            <span class="demo-label">星期:</span>
            <span class="demo-value" id="virtual-weekday">-</span>
          </div>
        </div>

        <div class="demo-controls">
          <div class="demo-control-group">
            <h4>基础控制</h4>
            <div class="demo-buttons">
              <button class="demo-btn demo-btn-primary" id="toggle-demo-mode">
                <span id="demo-toggle-text">启用演示模式</span>
              </button>
              <button class="demo-btn demo-btn-secondary" id="reset-real-time" disabled>
                🔄 重置为真实时间
              </button>
            </div>
          </div>

          <div class="demo-control-group" id="time-controls" style="display: none;">
            <h4>时间控制</h4>
            <div class="demo-buttons">
              <button class="demo-btn demo-btn-time" id="go-back-day">
                ⬅️ 后退一天
              </button>
              <button class="demo-btn demo-btn-time" id="advance-day">
                ➡️ 前进一天
              </button>
            </div>
            <div class="demo-buttons">
              <button class="demo-btn demo-btn-special" id="jump-monday">
                📅 跳到下周一
              </button>
              <button class="demo-btn demo-btn-special" id="trigger-weekend">
                🏁 触发周末结算
              </button>
            </div>
          </div>

          <div class="demo-control-group" id="scenario-controls" style="display: none;">
            <h4>快速场景</h4>
            <div class="demo-buttons">
              <button class="demo-btn demo-btn-scenario" id="scenario-monday">
                🌅 模拟周一冷启动
              </button>
              <button class="demo-btn demo-btn-scenario" id="scenario-midweek">
                📝 模拟周中日常
              </button>
              <button class="demo-btn demo-btn-scenario" id="scenario-weekend">
                🎉 模拟周末结算
              </button>
            </div>
          </div>
        </div>

        <div class="demo-tips">
          <h4>💡 使用提示</h4>
          <ul>
            <li>演示模式让你可以快速体验不同时间场景</li>
            <li>虚拟时间会影响所有日期相关的功能</li>
            <li>刷新页面后演示模式状态会保持</li>
            <li>可以随时重置为真实时间</li>
          </ul>
        </div>
      </div>
    `;

    document.body.appendChild(panel);
    this.panel = panel;
  }

  // 绑定事件
  bindEvents() {
    // 关闭面板
    document.getElementById('demo-close-btn').addEventListener('click', () => {
      this.hide();
    });

    // 切换演示模式
    document.getElementById('toggle-demo-mode').addEventListener('click', () => {
      this.toggleDemoMode();
    });

    // 重置为真实时间
    document.getElementById('reset-real-time').addEventListener('click', () => {
      this.resetToRealTime();
    });

    // 时间控制
    document.getElementById('go-back-day').addEventListener('click', () => {
      this.goBackDay();
    });

    document.getElementById('advance-day').addEventListener('click', () => {
      this.advanceDay();
    });

    document.getElementById('jump-monday').addEventListener('click', () => {
      this.jumpToNextMonday();
    });

    document.getElementById('trigger-weekend').addEventListener('click', () => {
      this.triggerWeekEnd();
    });

    // 快速场景
    document.getElementById('scenario-monday').addEventListener('click', () => {
      this.setScenarioMonday();
    });

    document.getElementById('scenario-midweek').addEventListener('click', () => {
      this.setScenarioMidweek();
    });

    document.getElementById('scenario-weekend').addEventListener('click', () => {
      this.setScenarioWeekend();
    });

    // 点击面板外部关闭 - 注释掉，让面板保持打开
    // document.addEventListener('click', (e) => {
    //   if (this.isVisible && !this.panel.contains(e.target) && !e.target.closest('.demo-mode-trigger')) {
    //     this.hide();
    //   }
    // });

    // ESC键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  // 显示面板
  show() {
    this.panel.classList.add('visible');
    this.isVisible = true;
    this.updateDisplay();
  }

  // 隐藏面板
  hide() {
    this.panel.classList.remove('visible');
    this.isVisible = false;
  }

  // 切换显示状态
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  // 更新显示
  updateDisplay() {
    const isDemoEnabled = DateManager.isDemoModeEnabled();
    const currentDate = DateManager.getCurrentDate();
    
    // 更新状态显示
    const statusElement = document.getElementById('demo-status');
    const virtualDateElement = document.getElementById('virtual-date');
    const virtualWeekdayElement = document.getElementById('virtual-weekday');
    
    if (statusElement) {
      statusElement.textContent = isDemoEnabled ? '已启用' : '未启用';
      statusElement.className = `demo-value ${isDemoEnabled ? 'enabled' : 'disabled'}`;
    }
    
    if (virtualDateElement && virtualWeekdayElement) {
      if (isDemoEnabled) {
        virtualDateElement.textContent = DateManager.formatDate(currentDate);
        virtualWeekdayElement.textContent = this.getWeekdayName(currentDate);
      } else {
        virtualDateElement.textContent = '-';
        virtualWeekdayElement.textContent = '-';
      }
    }

    // 更新按钮状态
    const toggleBtn = document.getElementById('toggle-demo-mode');
    const toggleText = document.getElementById('demo-toggle-text');
    const resetBtn = document.getElementById('reset-real-time');
    const timeControls = document.getElementById('time-controls');
    const scenarioControls = document.getElementById('scenario-controls');

    if (toggleBtn && toggleText) {
      if (isDemoEnabled) {
        toggleBtn.className = 'demo-btn demo-btn-danger';
        toggleText.textContent = '禁用演示模式';
      } else {
        toggleBtn.className = 'demo-btn demo-btn-primary';
        toggleText.textContent = '启用演示模式';
      }
    }
    
    if (resetBtn) {
      resetBtn.disabled = !isDemoEnabled;
    }
    
    if (timeControls) {
      timeControls.style.display = isDemoEnabled ? 'block' : 'none';
    }
    
    if (scenarioControls) {
      scenarioControls.style.display = isDemoEnabled ? 'block' : 'none';
    }
  }

  // 获取星期名称
  getWeekdayName(date) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[date.getDay()];
  }

  // 切换演示模式
  toggleDemoMode() {
    if (DateManager.isDemoModeEnabled()) {
      DateManager.disableDemoMode();
      this.showNotification('演示模式已禁用', 'info');
    } else {
      DateManager.enableDemoMode();
      this.showNotification('演示模式已启用', 'success');
    }
    this.updateDisplay();
    this.refreshApp();
  }

  // 重置为真实时间
  resetToRealTime() {
    DateManager.resetToRealTime();
    this.showNotification('已重置为真实时间', 'info');
    this.updateDisplay();
    this.refreshApp();
  }

  // 后退一天
  goBackDay() {
    const newDate = DateManager.goBackDay();
    if (newDate) {
      this.showNotification(`时间后退到: ${DateManager.formatDate(newDate)}`, 'info');
      this.updateDisplay();
      this.refreshApp();
    }
  }

  // 前进一天
  advanceDay() {
    const newDate = DateManager.advanceDay();
    if (newDate) {
      this.showNotification(`时间前进到: ${DateManager.formatDate(newDate)}`, 'info');
      this.updateDisplay();
      this.refreshApp();
    }
  }

  // 跳转到下周一
  jumpToNextMonday() {
    const newDate = DateManager.jumpToNextMonday();
    if (newDate) {
      this.showNotification(`跳转到下周一: ${DateManager.formatDate(newDate)}`, 'success');
      this.updateDisplay();
      this.refreshApp();
    }
  }

  // 触发周末结算
  triggerWeekEnd() {
    const newDate = DateManager.triggerWeekEnd();
    if (newDate) {
      this.showNotification('周末结算完成，进入新的一周！', 'success');
      this.updateDisplay();
      this.refreshApp();
    }
  }

  // 设置周一场景
  setScenarioMonday() {
    if (!DateManager.isDemoModeEnabled()) {
      DateManager.enableDemoMode();
    }
    
    // 找到最近的周一
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysToMonday);
    
    const state = DataManager.load(STORAGE_KEYS.APP_STATE, DEFAULT_APP_STATE);
    state.demoMode.virtualDate = monday.toISOString();
    DataManager.save(STORAGE_KEYS.APP_STATE, state);
    
    this.showNotification('已设置为周一冷启动场景', 'success');
    this.updateDisplay();
    this.refreshApp();
  }

  // 设置周中场景
  setScenarioMidweek() {
    if (!DateManager.isDemoModeEnabled()) {
      DateManager.enableDemoMode();
    }
    
    // 设置为周三
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToWednesday = dayOfWeek <= 3 ? (3 - dayOfWeek) : (10 - dayOfWeek);
    
    const wednesday = new Date(today);
    wednesday.setDate(today.getDate() + daysToWednesday);
    
    const state = DataManager.load(STORAGE_KEYS.APP_STATE, DEFAULT_APP_STATE);
    state.demoMode.virtualDate = wednesday.toISOString();
    DataManager.save(STORAGE_KEYS.APP_STATE, state);
    
    this.showNotification('已设置为周中日常场景', 'success');
    this.updateDisplay();
    this.refreshApp();
  }

  // 设置周末场景
  setScenarioWeekend() {
    if (!DateManager.isDemoModeEnabled()) {
      DateManager.enableDemoMode();
    }
    
    // 设置为周日
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToSunday = dayOfWeek === 0 ? 0 : (7 - dayOfWeek);
    
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + daysToSunday);
    
    const state = DataManager.load(STORAGE_KEYS.APP_STATE, DEFAULT_APP_STATE);
    state.demoMode.virtualDate = sunday.toISOString();
    DataManager.save(STORAGE_KEYS.APP_STATE, state);
    
    this.showNotification('已设置为周末结算场景', 'success');
    this.updateDisplay();
    this.refreshApp();
  }

  // 刷新应用
  refreshApp() {
    // 通知应用控制器刷新并重新确定路由
    if (window.appController) {
      // 重新确定路由，因为日期改变了
      window.appController.determineInitialRoute();
      window.appController.render();
      
      // 强制更新演示模式面板的日期显示
      setTimeout(() => {
        this.updateDisplay();
      }, 100);
    }
    
    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('demoModeChanged', {
      detail: {
        enabled: DateManager.isDemoModeEnabled(),
        currentDate: DateManager.getCurrentDate()
      }
    }));
  }

  // 显示通知
  showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `demo-notification demo-notification-${type}`;
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
      zIndex: '10001',
      opacity: '0',
      transform: 'translateY(-20px)',
      transition: 'all 0.3s ease',
      maxWidth: '300px'
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
}

// 导出到全局作用域
window.DemoModePanel = DemoModePanel;