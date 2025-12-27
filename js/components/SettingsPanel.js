// 设置面板组件
class SettingsPanel {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateDisplay();
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    // 演示模式切换
    const demoToggle = document.getElementById('demo-mode-toggle');
    if (demoToggle) {
      demoToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
          DateManager.enableDemoMode();
        } else {
          DateManager.disableDemoMode();
        }
        this.updateDisplay();
        this.notifyAppRefresh();
      });
    }

    // 演示模式控制按钮
    this.bindDemoControls();
  }

  /**
   * 绑定演示模式控制按钮
   */
  bindDemoControls() {
    const advanceDayBtn = document.getElementById('advance-day');
    const jumpMondayBtn = document.getElementById('jump-monday');
    const triggerWeekendBtn = document.getElementById('trigger-weekend');
    const resetTimeBtn = document.getElementById('reset-time');

    if (advanceDayBtn) {
      advanceDayBtn.addEventListener('click', () => {
        DateManager.advanceDay();
        this.updateDisplay();
        this.notifyAppRefresh();
      });
    }

    if (jumpMondayBtn) {
      jumpMondayBtn.addEventListener('click', () => {
        DateManager.jumpToNextMonday();
        this.updateDisplay();
        this.notifyAppRefresh();
      });
    }

    if (triggerWeekendBtn) {
      triggerWeekendBtn.addEventListener('click', () => {
        DateManager.triggerWeekEnd();
        this.updateDisplay();
        this.notifyAppRefresh();
      });
    }

    if (resetTimeBtn) {
      resetTimeBtn.addEventListener('click', () => {
        DateManager.resetToRealTime();
        const demoToggle = document.getElementById('demo-mode-toggle');
        if (demoToggle) {
          demoToggle.checked = false;
        }
        this.updateDisplay();
        this.notifyAppRefresh();
      });
    }
  }

  /**
   * 更新显示状态
   */
  updateDisplay() {
    const isDemoEnabled = DateManager.isDemoModeEnabled();
    const demoControls = document.getElementById('demo-time-controls');
    const virtualDateDisplay = document.getElementById('virtual-date-display');
    
    // 更新演示模式开关
    const demoToggle = document.getElementById('demo-mode-toggle');
    if (demoToggle) {
      demoToggle.checked = isDemoEnabled;
    }
    
    // 更新控制面板显示
    if (demoControls) {
      if (isDemoEnabled) {
        demoControls.classList.remove('hidden');
      } else {
        demoControls.classList.add('hidden');
      }
    }
    
    // 更新虚拟日期显示
    if (virtualDateDisplay) {
      virtualDateDisplay.textContent = DateManager.getVirtualDateDisplay();
    }
  }

  /**
   * 通知应用刷新
   */
  notifyAppRefresh() {
    // 触发自定义事件通知应用刷新
    window.dispatchEvent(new CustomEvent('demoModeChanged', {
      detail: {
        enabled: DateManager.isDemoModeEnabled(),
        currentDate: DateManager.getCurrentDate()
      }
    }));

    // 如果应用控制器存在，直接调用刷新
    if (window.appController) {
      window.appController.refresh();
    }
  }

  /**
   * 显示设置面板
   */
  show() {
    const settingsPanel = document.getElementById('settings-panel');
    if (settingsPanel) {
      settingsPanel.classList.remove('hidden');
      this.updateDisplay();
    }
  }

  /**
   * 隐藏设置面板
   */
  hide() {
    const settingsPanel = document.getElementById('settings-panel');
    if (settingsPanel) {
      settingsPanel.classList.add('hidden');
    }
  }

  /**
   * 切换设置面板显示状态
   */
  toggle() {
    const settingsPanel = document.getElementById('settings-panel');
    if (settingsPanel) {
      if (settingsPanel.classList.contains('hidden')) {
        this.show();
      } else {
        this.hide();
      }
    }
  }
}

// 导出到全局作用域
window.SettingsPanel = SettingsPanel;