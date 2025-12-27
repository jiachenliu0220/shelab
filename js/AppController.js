// 应用主控制器 - 管理整个应用的状态和导航
class AppController {
  constructor() {
    this.stateManager = new StateManager();
    this.currentRoute = ROUTES.DAILY;
    this.components = {};
    
    // 绑定方法到实例
    this.handleNavigation = this.handleNavigation.bind(this);
    this.handleSettingsToggle = this.handleSettingsToggle.bind(this);
    this.render = this.render.bind(this);
  }

  /**
   * 初始化应用
   */
  async init() {
    try {
      console.log('初始化应用控制器...');
      
      // 初始化状态管理器
      this.stateManager.init();
      
      // 初始化组件
      this.initializeComponents();
      
      // 设置事件监听器
      this.setupEventListeners();
      
      // 确定初始路由
      this.determineInitialRoute();
      
      // 首次渲染
      this.render();
      
      console.log('应用初始化完成');
    } catch (error) {
      console.error('应用初始化失败:', error);
      this.showError('应用初始化失败，请刷新页面重试');
    }
  }

  /**
   * 初始化组件
   */
  initializeComponents() {
    this.components = {
      dailyStart: new DailyStartPage(this.stateManager),
      mondayStart: new MondayStartPage(this.stateManager),
      zoo: new ZooPage(this.stateManager), // 动物园页面
      settings: new SettingsPanel(), // 设置面板
      demoModePanel: new DemoModePanel() // 演示模式面板
    };
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 导航按钮事件
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const route = e.currentTarget.dataset.route;
        this.handleNavigation(route);
      });
    });

    // 设置按钮事件
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', this.handleSettingsToggle);
    }

    // 设置面板关闭事件
    const closeSettingsBtn = document.getElementById('close-settings');
    if (closeSettingsBtn) {
      closeSettingsBtn.addEventListener('click', this.handleSettingsToggle);
    }

    // 设置面板背景点击关闭
    const settingsPanel = document.getElementById('settings-panel');
    if (settingsPanel) {
      settingsPanel.addEventListener('click', (e) => {
        if (e.target === settingsPanel) {
          this.handleSettingsToggle();
        }
      });
    }

    // 演示模式控制
    this.setupDemoModeControls();

    // 演示模式变化监听
    window.addEventListener('demoModeChanged', () => {
      // 重新确定路由，因为日期可能改变了
      this.determineInitialRoute();
      this.render();
    });

    // 状态变化监听
    this.stateManager.addListener(this.render);

    console.log('事件监听器设置完成');
  }

  /**
   * 设置演示模式控制
   */
  setupDemoModeControls() {
    // 创建演示模式触发按钮
    this.createDemoModeTrigger();
    
    // 旧的演示模式控制（如果存在）
    const demoToggle = document.getElementById('demo-mode-toggle');
    const demoControls = document.getElementById('demo-time-controls');
    const virtualDateDisplay = document.getElementById('virtual-date-display');

    if (demoToggle) {
      // 初始化演示模式状态
      demoToggle.checked = DateManager.isDemoModeEnabled();
      this.updateDemoControlsVisibility();

      demoToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
          DateManager.enableDemoMode();
        } else {
          DateManager.disableDemoMode();
        }
        this.updateDemoControlsVisibility();
        this.render();
      });
    }

    // 演示模式按钮事件
    const advanceDayBtn = document.getElementById('advance-day');
    const jumpMondayBtn = document.getElementById('jump-monday');
    const triggerWeekendBtn = document.getElementById('trigger-weekend');
    const resetTimeBtn = document.getElementById('reset-time');

    if (advanceDayBtn) {
      advanceDayBtn.addEventListener('click', () => {
        DateManager.advanceDay();
        this.updateVirtualDateDisplay();
        // 重新确定路由，因为日期改变了
        this.determineInitialRoute();
        this.render();
      });
    }

    if (jumpMondayBtn) {
      jumpMondayBtn.addEventListener('click', () => {
        DateManager.jumpToNextMonday();
        this.updateVirtualDateDisplay();
        // 重新确定路由，因为日期改变了
        this.determineInitialRoute();
        this.render();
      });
    }

    if (triggerWeekendBtn) {
      triggerWeekendBtn.addEventListener('click', () => {
        DateManager.triggerWeekEnd();
        this.updateVirtualDateDisplay();
        // 重新确定路由，因为日期改变了
        this.determineInitialRoute();
        this.render();
      });
    }

    if (resetTimeBtn) {
      resetTimeBtn.addEventListener('click', () => {
        DateManager.resetToRealTime();
        const demoToggle = document.getElementById('demo-mode-toggle');
        if (demoToggle) {
          demoToggle.checked = false;
        }
        this.updateDemoControlsVisibility();
        // 重新确定路由，因为日期改变了
        this.determineInitialRoute();
        this.render();
      });
    }
  }

  /**
   * 创建演示模式触发按钮
   */
  createDemoModeTrigger() {
    // 检查是否已存在
    if (document.getElementById('demo-mode-trigger')) {
      return;
    }

    const trigger = document.createElement('button');
    trigger.id = 'demo-mode-trigger';
    trigger.className = 'demo-mode-trigger';
    trigger.innerHTML = '🎮';
    trigger.title = '演示模式';
    
    // 根据演示模式状态设置样式
    if (DateManager.isDemoModeEnabled()) {
      trigger.classList.add('active');
    }

    trigger.addEventListener('click', () => {
      if (this.components.demoModePanel) {
        this.components.demoModePanel.toggle();
      }
    });

    document.body.appendChild(trigger);
  }

  /**
   * 更新演示模式触发按钮状态
   */
  updateDemoModeTrigger() {
    const trigger = document.getElementById('demo-mode-trigger');
    if (trigger) {
      if (DateManager.isDemoModeEnabled()) {
        trigger.classList.add('active');
      } else {
        trigger.classList.remove('active');
      }
    }
  }

  /**
   * 更新演示模式控制显示
   */
  updateDemoControlsVisibility() {
    const demoControls = document.getElementById('demo-time-controls');
    const isDemoEnabled = DateManager.isDemoModeEnabled();
    
    if (demoControls) {
      if (isDemoEnabled) {
        demoControls.classList.remove('hidden');
        this.updateVirtualDateDisplay();
      } else {
        demoControls.classList.add('hidden');
      }
    }
  }

  /**
   * 更新虚拟日期显示
   */
  updateVirtualDateDisplay() {
    const virtualDateDisplay = document.getElementById('virtual-date-display');
    if (virtualDateDisplay) {
      virtualDateDisplay.textContent = DateManager.getVirtualDateDisplay();
    }
  }

  /**
   * 确定初始路由
   */
  determineInitialRoute() {
    const currentDate = DateManager.getCurrentDate();
    const isMonday = DateManager.isMonday(currentDate);
    const needsWeeklySetup = DateManager.needsWeeklySettlement();
    const mondayCompleted = this.stateManager.isMondayCompleted();
    
    // 如果是演示模式，为昨日创建模拟记录并清除今日记录
    if (DateManager.isDemoModeEnabled()) {
      this.stateManager.createYesterdayDemoRecord();
    }
    
    const todayStarted = this.stateManager.isTodayStarted();
    
    console.log('日期检查:', {
      currentDate: DateManager.formatDate(currentDate),
      isMonday,
      needsWeeklySetup,
      mondayCompleted,
      todayStarted,
      dayOfWeek: currentDate.getDay(),
      isDemoMode: DateManager.isDemoModeEnabled()
    });
    
    // 新的时间线逻辑
    if (isMonday && (!mondayCompleted || needsWeeklySetup)) {
      // 周一且未完成周一设置：进入周一流程
      this.currentRoute = ROUTES.MONDAY;
      if (this.components.mondayStart) {
        this.components.mondayStart.currentStep = 'welcome';
      }
      console.log('检测到周一且未完成周一设置，进入周一冷启动流程');
    } else if (todayStarted) {
      // 今日已启动：显示完成状态
      this.currentRoute = ROUTES.DAILY;
      if (this.components.dailyStart) {
        this.components.dailyStart.currentStep = 'complete';
      }
      console.log('今日已启动，进入每日启动完成状态');
    } else {
      // 今日未启动：进入每日流程，从昨日回顾开始
      this.currentRoute = ROUTES.DAILY;
      if (this.components.dailyStart) {
        // 强制设置为昨日回顾步骤
        this.components.dailyStart.currentStep = 'yesterday';
        console.log('设置每日启动页面步骤为昨日回顾');
      }
      console.log('今日未启动，进入昨日回顾步骤');
    }
    
    // 更新导航状态
    this.updateNavigation();
  }

  /**
   * 处理导航
   * @param {string} route - 目标路由
   */
  handleNavigation(route) {
    if (route === this.currentRoute) {
      return; // 已经在当前路由
    }

    // 检查是否需要强制周一流程
    const isMonday = DateManager.isMonday();
    const mondayCompleted = this.stateManager.isMondayCompleted();
    const needsWeeklySetup = DateManager.needsWeeklySettlement();
    
    if (isMonday && (!mondayCompleted || needsWeeklySetup) && route !== ROUTES.MONDAY) {
      this.showMessage('请先完成周一的温柔启动哦～每周一需要先回答3个问题');
      route = ROUTES.MONDAY;
    }

    this.currentRoute = route;
    this.updateNavigation();
    this.render();
    
    console.log('导航到:', route);
  }

  /**
   * 更新导航状态
   */
  updateNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      const btnRoute = btn.dataset.route;
      if (btnRoute === this.currentRoute) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * 处理设置面板切换
   */
  handleSettingsToggle() {
    if (this.components.settings) {
      this.components.settings.toggle();
    }
  }

  /**
   * 渲染当前页面
   */
  render() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
      console.error('主内容区域未找到');
      return;
    }

    try {
      // 更新演示模式触发按钮状态
      this.updateDemoModeTrigger();
      
      // 添加淡入动画
      mainContent.classList.remove('fade-in');
      
      let content = '';
      
      switch (this.currentRoute) {
        case ROUTES.MONDAY:
          content = this.renderMondayStart();
          break;
        case ROUTES.DAILY:
          content = this.renderDailyStart();
          break;
        case ROUTES.ZOO:
          content = this.renderZoo();
          break;
        default:
          content = this.renderDailyStart();
      }
      
      mainContent.innerHTML = content;
      
      // 设置页面特定的事件监听器
      this.setupPageEventListeners();
      
      // 添加淡入动画
      setTimeout(() => {
        mainContent.classList.add('fade-in');
      }, 10);
      
      // 确保演示模式面板的日期显示是最新的
      if (this.components.demoModePanel && DateManager.isDemoModeEnabled()) {
        setTimeout(() => {
          this.components.demoModePanel.updateDisplay();
        }, 50);
      }
      
    } catch (error) {
      console.error('渲染失败:', error);
      this.showError('页面渲染失败');
    }
  }

  /**
   * 刷新应用（供演示模式面板调用）
   */
  refresh() {
    this.render();
  }

  /**
   * 重新确定初始路由（供演示模式调用）
   */
  redetermineRoute() {
    this.determineInitialRoute();
  }

  /**
   * 渲染周一启动页面
   */
  renderMondayStart() {
    if (this.components.mondayStart) {
      return this.components.mondayStart.render();
    }
    
    // 备用渲染
    return `
      <div class="page-content">
        <div class="welcome-section text-center mb-lg">
          <h2>🌅 新的一周开始了</h2>
          <p class="encouraging-text">回来就已经很好了，让我们温柔地开始这一周吧～</p>
        </div>
        
        <div class="coming-soon">
          <p>周一冷启动功能加载中...</p>
          <button class="btn-primary" onclick="appController.handleNavigation('daily')">
            先去每日启动看看
          </button>
        </div>
      </div>
    `;
  }

  /**
   * 渲染每日启动页面
   */
  renderDailyStart() {
    if (this.components.dailyStart) {
      return this.components.dailyStart.render();
    }
    
    // 备用渲染
    const todayStarted = this.stateManager.isTodayStarted();
    const currentDate = DateManager.formatDate(DateManager.getCurrentDate());
    
    return `
      <div class="page-content">
        <div class="welcome-section text-center mb-lg">
          <h2>🌅 ${currentDate}</h2>
          <p class="encouraging-text">
            ${todayStarted ? '今天已经启动了！你真棒～' : '新的一天开始了，让我们一起慢慢来吧'}
          </p>
        </div>
        
        ${todayStarted ? this.renderTodayCompleted() : this.renderDailyStartForm()}
      </div>
    `;
  }

  /**
   * 渲染今日已完成状态
   */
  renderTodayCompleted() {
    const todayRecord = this.stateManager.getTodayRecord();
    const currentAnimal = AnimalSystem.getCurrentAnimal();
    
    return `
      <div class="completion-status">
        <div class="animal-status text-center mb-lg">
          <div class="animal-display">
            <span class="animal-emoji">${ANIMAL_OPTIONS.find(a => a.value === currentAnimal?.type)?.emoji || '🐾'}</span>
            <p class="animal-stage">阶段 ${currentAnimal?.stage || 1}/7</p>
            <p class="animal-description">${AnimalSystem.getStageDescription(currentAnimal?.stage || 1)}</p>
          </div>
        </div>
        
        <div class="today-summary">
          <h3>今日完成情况</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Self-care</span>
              <span class="summary-value">${todayRecord?.selfCare?.completed?.length || 0}/${todayRecord?.selfCare?.planned?.length || 0}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">重要任务</span>
              <span class="summary-value">${todayRecord?.importantTasks?.completed?.length || 0}/${todayRecord?.importantTasks?.planned?.length || 0}</span>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-lg">
          <p class="encouraging-text">今天的你已经足够好了！明天见～</p>
        </div>
      </div>
    `;
  }

  /**
   * 渲染每日启动表单
   */
  renderDailyStartForm() {
    return `
      <div class="daily-start-form">
        <div class="coming-soon text-center">
          <p>每日启动功能即将在任务3中实现</p>
          <button class="btn-primary" onclick="appController.simulateStartDay()">
            模拟启动今天
          </button>
        </div>
      </div>
    `;
  }

  /**
   * 渲染动物园页面
   */
  renderZoo() {
    if (this.components.zoo) {
      return this.components.zoo.render();
    }
    
    // 备用渲染
    const currentAnimal = AnimalSystem.getCurrentAnimal();
    const zooAnimals = AnimalSystem.getZooAnimals();
    
    return `
      <div class="page-content">
        <div class="zoo-header text-center mb-lg">
          <h2>🦊 我的动物园</h2>
          <p class="encouraging-text">这里住着陪伴你成长的小伙伴们</p>
        </div>
        
        <div class="current-animal mb-lg">
          <h3>本周小伙伴</h3>
          <div class="animal-card">
            <span class="animal-emoji large">${ANIMAL_OPTIONS.find(a => a.value === currentAnimal?.type)?.emoji || '🐾'}</span>
            <div class="animal-info">
              <p class="animal-name">${ANIMAL_OPTIONS.find(a => a.value === currentAnimal?.type)?.label || '小动物'}</p>
              <p class="animal-stage">成长阶段: ${currentAnimal?.stage || 1}/7</p>
              <p class="animal-description">${AnimalSystem.getStageDescription(currentAnimal?.stage || 1)}</p>
            </div>
          </div>
        </div>
        
        <div class="zoo-history">
          <h3>历史伙伴 (${zooAnimals.length})</h3>
          ${zooAnimals.length > 0 ? 
            zooAnimals.map(animal => `
              <div class="animal-card history">
                <span class="animal-emoji">${ANIMAL_OPTIONS.find(a => a.value === animal.type)?.emoji || '🐾'}</span>
                <div class="animal-info">
                  <p class="animal-name">${ANIMAL_OPTIONS.find(a => a.value === animal.type)?.label || '小动物'}</p>
                  <p class="animal-summary">${animal.summary}</p>
                  <p class="animal-date">${DateManager.formatDate(new Date(animal.weekStart), { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
            `).join('') :
            '<p class="text-center text-muted">还没有历史伙伴，继续努力吧～</p>'
          }
        </div>
      </div>
    `;
  }

  /**
   * 设置页面特定的事件监听器
   */
  setupPageEventListeners() {
    // 为每日启动页面设置全局引用
    if (this.currentRoute === ROUTES.DAILY && this.components.dailyStart) {
      window.dailyStartPage = this.components.dailyStart;
    }
    
    // 为周一启动页面设置全局引用
    if (this.currentRoute === ROUTES.MONDAY && this.components.mondayStart) {
      window.mondayStartPage = this.components.mondayStart;
    }
  }

  /**
   * 模拟启动今天（临时方法，用于测试）
   */
  simulateStartDay() {
    const mockData = {
      selfCare: {
        planned: ['exercise', 'reading'],
        completed: ['exercise']
      },
      importantTasks: {
        planned: ['工作任务', '生活安排'],
        completed: ['工作任务']
      },
      extraTasks: {
        planned: ['学习新技能'],
        completed: []
      },
      bonusCompleted: []
    };
    
    this.stateManager.markDayStarted(mockData);
    this.showMessage('今天已经启动！');
  }

  /**
   * 显示消息
   * @param {string} message - 消息内容
   * @param {string} type - 消息类型 ('success', 'error', 'info')
   */
  showMessage(message, type = 'info') {
    // 简单的消息显示，可以后续改进
    alert(message);
  }

  /**
   * 显示错误
   * @param {string} error - 错误信息
   */
  showError(error) {
    this.showMessage(error, 'error');
  }

  /**
   * 获取状态管理器
   * @returns {StateManager} 状态管理器实例
   */
  getStateManager() {
    return this.stateManager;
  }
}

// 导出到全局作用域
window.AppController = AppController;