// 每日启动页面组件
class DailyStartPage {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.currentStep = 'welcome'; // welcome, yesterday, today, complete
    this.formData = {
      yesterdayReview: {
        selfCare: { completed: [] },
        importantTasks: { completed: [] },
        extraTasks: { completed: [] },
        bonusCompleted: []
      },
      todayPlan: {
        selfCare: { planned: [] },
        importantTasks: { planned: [] },
        extraTasks: { planned: [] }
      }
    };
    
    // 绑定方法
    this.render = this.render.bind(this);
    this.handleStepChange = this.handleStepChange.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  /**
   * 渲染每日启动页面
   * @returns {string} HTML字符串
   */
  render() {
    const todayStarted = this.stateManager.isTodayStarted();
    
    if (todayStarted || this.currentStep === 'complete') {
      return this.renderCompletedState();
    }
    
    switch (this.currentStep) {
      case 'welcome':
        return this.renderWelcomeStep();
      case 'yesterday':
        return this.renderYesterdayStep();
      case 'today':
        return this.renderTodayStep();
      default:
        return this.renderWelcomeStep();
    }
  }

  /**
   * 渲染欢迎步骤
   */
  renderWelcomeStep() {
    const currentDate = DateManager.formatDate(DateManager.getCurrentDate());
    const isMonday = DateManager.isMonday();
    const mondayCompleted = this.stateManager.isMondayCompleted();
    
    let welcomeMessages = ENCOURAGING_MESSAGES.welcome;
    let randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    
    // 如果是周一且刚完成周一设置，使用特殊欢迎语
    if (isMonday && mondayCompleted) {
      randomMessage = '周一的设定已经完成了，现在让我们开始今天的温柔启动吧～';
    }
    
    return `
      <div class="daily-start-page">
        <div class="welcome-section text-center mb-lg">
          <h2>🌅 ${currentDate}</h2>
          <p class="encouraging-text">${randomMessage}</p>
        </div>
        
        <div class="start-actions text-center">
          <button class="btn-primary" onclick="dailyStartPage.handleStepChange('yesterday')">
            开始今天的温柔启动
          </button>
        </div>
        
        <div class="daily-tip mt-lg">
          <div class="tip-card">
            <span class="tip-icon">💡</span>
            <p class="tip-text">${isMonday && mondayCompleted ? '周一设定完成后，我们继续每天的10分钟启动仪式' : '每天只需要10分钟，温柔地确认昨天，规划今天'}</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染昨日回顾步骤
   */
  renderYesterdayStep() {
    const yesterdayRecord = this.stateManager.getYesterdayRecord();
    const wasYesterdayStarted = this.stateManager.wasYesterdayStarted();
    const yesterdayDate = DateManager.formatDate(DateManager.getYesterday());
    
    return `
      <div class="daily-start-page">
        <div class="step-header text-center mb-lg">
          <h2>🌙 昨日回顾</h2>
          <p class="encouraging-text">让我们温柔地确认一下昨天发生的美好</p>
          <p class="step-date">${yesterdayDate}</p>
        </div>
        
        <div class="yesterday-review">
          ${wasYesterdayStarted ? 
            this.renderYesterdayWithData(yesterdayRecord) : 
            this.renderYesterdayWithoutData()
          }
        </div>
        
        <div class="step-actions">
          <button class="btn-secondary" onclick="dailyStartPage.handleStepChange('welcome')">
            返回
          </button>
          <button class="btn-primary" onclick="dailyStartPage.handleStepChange('today')">
            继续规划今天
          </button>
        </div>
      </div>
    `;
  }

  /**
   * 渲染有数据的昨日回顾
   */
  renderYesterdayWithData(yesterdayRecord) {
    return `
      ${this.renderYesterdaySection('selfCare', '自我关怀', yesterdayRecord?.selfCare)}
      ${this.renderYesterdaySection('importantTasks', '重要任务', yesterdayRecord?.importantTasks)}
      ${this.renderYesterdaySection('extraTasks', '额外事项', yesterdayRecord?.extraTasks)}
      
      <div class="form-group">
        <label class="form-label">
          <span class="label-icon">✨</span>
          昨天还有什么意外完成的美好事情吗？
        </label>
        <textarea 
          class="form-input form-textarea" 
          id="bonus-completed"
          placeholder="比如：意外读了几页书，和朋友聊了天，看到了美丽的夕阳..."
          rows="3"
        ></textarea>
      </div>
    `;
  }

  /**
   * 渲染无数据的昨日回顾
   */
  renderYesterdayWithoutData() {
    return `
      <div class="no-yesterday-data">
        <div class="empty-state">
          <span class="empty-icon">🌙</span>
          <h3>昨天没有启动记录</h3>
          <p class="empty-text">没关系，每一天都是新的开始～</p>
        </div>
        
        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">✨</span>
            昨天有什么值得记录的美好事情吗？
          </label>
          <textarea 
            class="form-input form-textarea" 
            id="bonus-completed"
            placeholder="比如：读了几页书，和朋友聊了天，看到了美丽的夕阳，或者只是好好休息了..."
            rows="3"
          ></textarea>
          <p class="form-hint">即使没有计划，生活中的小美好也值得记录</p>
        </div>
      </div>
    `;
  }

  /**
   * 渲染昨日某个分类的回顾
   */
  renderYesterdaySection(type, title, data) {
    if (!data || !data.planned || data.planned.length === 0) {
      return '';
    }
    
    const planned = data.planned || [];
    const completed = data.completed || [];
    
    return `
      <div class="review-section mb-lg">
        <h3 class="section-title">${title}</h3>
        <div class="checklist">
          ${planned.map((item, index) => `
            <label class="checklist-item">
              <input 
                type="checkbox" 
                class="checklist-checkbox"
                data-type="${type}"
                data-item="${item}"
                ${completed.includes(item) ? 'checked' : ''}
                onchange="dailyStartPage.handleYesterdayCheck(this)"
              >
              <span class="checklist-text">${item}</span>
              <span class="checklist-mark">✓</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * 渲染今日规划步骤
   */
  renderTodayStep() {
    const recommendations = this.stateManager.getSelfCareRecommendations();
    
    return `
      <div class="daily-start-page">
        <div class="step-header text-center mb-lg">
          <h2>🌱 今日规划</h2>
          <p class="encouraging-text">让我们为今天设定一些温柔的目标</p>
        </div>
        
        <div class="today-planning">
          <!-- Self-care 推荐 -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">💚</span>
              今天想要关怀自己的哪些方面？
            </label>
            <p class="form-hint">基于你的偏好，我们推荐：</p>
            <div class="selfcare-grid">
              ${Object.entries(SELF_CARE_ACTIVITIES).map(([key, activity]) => `
                <label class="choice-item ${recommendations.includes(key) ? 'recommended' : ''}">
                  <input 
                    type="checkbox" 
                    name="selfcare" 
                    value="${key}"
                    ${recommendations.includes(key) ? 'checked' : ''}
                    onchange="dailyStartPage.handleSelfCareChange(this)"
                  >
                  <span class="choice-emoji">${activity.emoji}</span>
                  <span class="choice-label">${activity.label}</span>
                  ${recommendations.includes(key) ? '<span class="recommended-badge">推荐</span>' : ''}
                </label>
              `).join('')}
            </div>
          </div>
          
          <!-- 重要任务 -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">⭐</span>
              今天最重要的三件事
            </label>
            <p class="form-hint">不用太多，三件就够了</p>
            ${[1, 2, 3].map(i => `
              <input 
                type="text" 
                class="form-input mb-sm" 
                id="important-task-${i}"
                placeholder="第${i}件重要的事..."
                maxlength="50"
              >
            `).join('')}
          </div>
          
          <!-- 额外事项 -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">🌟</span>
              如果有力气的话...
            </label>
            <p class="form-hint">这些是加分项，不做也完全没关系</p>
            <div id="extra-tasks">
              <input 
                type="text" 
                class="form-input mb-sm" 
                placeholder="如果有精力，我想..."
                maxlength="50"
                onkeypress="dailyStartPage.handleExtraTaskKeypress(event, this)"
              >
            </div>
            <button type="button" class="btn-secondary small" onclick="dailyStartPage.addExtraTask()">
              + 添加更多
            </button>
          </div>
        </div>
        
        <div class="step-actions">
          <button class="btn-secondary" onclick="dailyStartPage.handleStepChange('${this.getPreviousStep()}')">
            返回
          </button>
          <button class="btn-primary" onclick="dailyStartPage.handleFormSubmit()">
            开启今日
          </button>
        </div>
      </div>
    `;
  }

  /**
   * 渲染已完成状态
   */
  renderCompletedState() {
    const todayRecord = this.stateManager.getTodayRecord();
    const currentAnimal = AnimalSystem.getCurrentAnimal();
    const completionMessages = ENCOURAGING_MESSAGES.completion;
    const randomMessage = completionMessages[Math.floor(Math.random() * completionMessages.length)];
    
    return `
      <div class="daily-start-page">
        <div class="completion-status text-center">
          <div class="success-message mb-lg">
            <h2>🎉 今天已经启动了！</h2>
            <p class="encouraging-text">${randomMessage}</p>
          </div>
          
          <div class="animal-status mb-lg">
            <div class="animal-display">
              <span class="animal-emoji">${ANIMAL_OPTIONS.find(a => a.value === currentAnimal?.type)?.emoji || '🐾'}</span>
              <p class="animal-stage">成长阶段 ${currentAnimal?.stage || 1}/7</p>
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
              <div class="summary-item">
                <span class="summary-label">额外事项</span>
                <span class="summary-value">${todayRecord?.extraTasks?.completed?.length || 0}/${todayRecord?.extraTasks?.planned?.length || 0}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">启动时间</span>
                <span class="summary-value">${todayRecord?.startedAt ? new Date(todayRecord.startedAt).toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'}) : '--'}</span>
              </div>
            </div>
          </div>
          
          <div class="completion-actions mt-lg">
            <button class="btn-secondary" onclick="dailyStartPage.showTodayDetails()">
              查看详情
            </button>
            <button class="btn-primary" onclick="appController.handleNavigation('zoo')">
              看看小伙伴
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 获取下一步
   */
  getNextStep() {
    switch (this.currentStep) {
      case 'welcome':
        return 'yesterday'; // 总是先进行昨日回顾
      case 'yesterday':
        return 'today';
      default:
        return 'welcome';
    }
  }

  /**
   * 获取上一步
   */
  getPreviousStep() {
    switch (this.currentStep) {
      case 'today':
        return 'yesterday'; // 总是从昨日回顾返回
      case 'yesterday':
        return 'welcome';
      default:
        return 'welcome';
    }
  }

  /**
   * 处理步骤变化
   */
  handleStepChange(newStep) {
    this.currentStep = newStep;
    
    // 重新渲染页面
    if (window.appController) {
      window.appController.render();
    }
  }

  /**
   * 处理昨日回顾勾选
   */
  handleYesterdayCheck(checkbox) {
    const type = checkbox.dataset.type;
    const item = checkbox.dataset.item;
    const isChecked = checkbox.checked;
    
    if (!this.formData.yesterdayReview[type]) {
      this.formData.yesterdayReview[type] = { completed: [] };
    }
    
    if (isChecked) {
      if (!this.formData.yesterdayReview[type].completed.includes(item)) {
        this.formData.yesterdayReview[type].completed.push(item);
      }
    } else {
      const index = this.formData.yesterdayReview[type].completed.indexOf(item);
      if (index > -1) {
        this.formData.yesterdayReview[type].completed.splice(index, 1);
      }
    }
  }

  /**
   * 处理Self-care选择变化
   */
  handleSelfCareChange(checkbox) {
    const value = checkbox.value;
    const isChecked = checkbox.checked;
    
    if (!this.formData.todayPlan.selfCare.planned) {
      this.formData.todayPlan.selfCare.planned = [];
    }
    
    if (isChecked) {
      if (!this.formData.todayPlan.selfCare.planned.includes(value)) {
        this.formData.todayPlan.selfCare.planned.push(value);
      }
    } else {
      const index = this.formData.todayPlan.selfCare.planned.indexOf(value);
      if (index > -1) {
        this.formData.todayPlan.selfCare.planned.splice(index, 1);
      }
    }
  }

  /**
   * 处理额外任务按键
   */
  handleExtraTaskKeypress(event, input) {
    if (event.key === 'Enter' && input.value.trim()) {
      this.addExtraTask();
    }
  }

  /**
   * 添加额外任务
   */
  addExtraTask() {
    const container = document.getElementById('extra-tasks');
    const inputs = container.querySelectorAll('input');
    const lastInput = inputs[inputs.length - 1];
    
    // 如果最后一个输入框有内容，添加新的输入框
    if (lastInput && lastInput.value.trim()) {
      const newInput = document.createElement('input');
      newInput.type = 'text';
      newInput.className = 'form-input mb-sm';
      newInput.placeholder = '还想做什么...';
      newInput.maxLength = 50;
      newInput.onkeypress = (e) => this.handleExtraTaskKeypress(e, newInput);
      
      container.appendChild(newInput);
      newInput.focus();
    } else if (lastInput) {
      lastInput.focus();
    }
  }

  /**
   * 收集表单数据
   */
  collectFormData() {
    // 收集重要任务
    const importantTasks = [];
    for (let i = 1; i <= 3; i++) {
      const input = document.getElementById(`important-task-${i}`);
      if (input && input.value.trim()) {
        importantTasks.push(input.value.trim());
      }
    }
    
    // 收集额外任务
    const extraTasks = [];
    const extraInputs = document.querySelectorAll('#extra-tasks input');
    extraInputs.forEach(input => {
      if (input.value.trim()) {
        extraTasks.push(input.value.trim());
      }
    });
    
    // 收集奖励完成事项
    const bonusCompleted = [];
    const bonusInput = document.getElementById('bonus-completed');
    if (bonusInput && bonusInput.value.trim()) {
      // 按行分割，支持多个奖励事项
      const bonusItems = bonusInput.value.trim().split('\n').filter(item => item.trim());
      bonusCompleted.push(...bonusItems);
    }
    
    // 合并昨日回顾数据（如果有的话）
    const yesterdayData = this.formData.yesterdayReview;
    
    return {
      selfCare: {
        planned: this.formData.todayPlan.selfCare.planned || [],
        completed: [] // 今天还没开始完成
      },
      importantTasks: {
        planned: importantTasks,
        completed: [] // 今天还没开始完成
      },
      extraTasks: {
        planned: extraTasks,
        completed: [] // 今天还没开始完成
      },
      bonusCompleted: bonusCompleted,
      // 如果有昨日回顾数据，也包含进来用于更新昨日记录
      yesterdayReview: yesterdayData
    };
  }

  /**
   * 处理表单提交
   */
  handleFormSubmit() {
    try {
      const formData = this.collectFormData();
      
      // 验证必填项
      if (formData.selfCare.planned.length === 0 && formData.importantTasks.planned.length === 0) {
        alert('请至少选择一些自我关怀项目或填写重要任务哦～');
        return;
      }
      
      // 标记今日已启动
      this.stateManager.markDayStarted(formData);
      
      // 直接设置为完成状态并重新渲染
      this.currentStep = 'complete';
      
      // 显示成功消息
      this.showSuccessMessage();
      
      // 重新渲染页面
      if (window.appController) {
        window.appController.render();
      }
      
    } catch (error) {
      console.error('提交表单失败:', error);
      alert('提交失败，请重试');
    }
  }

  /**
   * 显示成功消息
   */
  showSuccessMessage() {
    // 可以添加更好的成功提示
    const messages = ENCOURAGING_MESSAGES.completion;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // 临时使用alert，后续可以改进为更好的UI
    setTimeout(() => {
      alert(`🎉 ${randomMessage}`);
    }, 100);
  }

  /**
   * 显示今日详情
   */
  showTodayDetails() {
    const todayRecord = this.stateManager.getTodayRecord();
    
    let details = '📋 今日计划详情：\n\n';
    
    if (todayRecord.selfCare?.planned?.length > 0) {
      details += '💚 Self-care:\n';
      todayRecord.selfCare.planned.forEach(item => {
        const activity = SELF_CARE_ACTIVITIES[item];
        details += `  • ${activity ? activity.label : item}\n`;
      });
      details += '\n';
    }
    
    if (todayRecord.importantTasks?.planned?.length > 0) {
      details += '⭐ 重要任务:\n';
      todayRecord.importantTasks.planned.forEach(task => {
        details += `  • ${task}\n`;
      });
      details += '\n';
    }
    
    if (todayRecord.extraTasks?.planned?.length > 0) {
      details += '🌟 额外事项:\n';
      todayRecord.extraTasks.planned.forEach(task => {
        details += `  • ${task}\n`;
      });
      details += '\n';
    }
    
    if (todayRecord.bonusCompleted?.length > 0) {
      details += '✨ 意外收获:\n';
      todayRecord.bonusCompleted.forEach(bonus => {
        details += `  • ${bonus}\n`;
      });
    }
    
    alert(details);
  }

  /**
   * 重置表单数据
   */
  resetFormData() {
    this.formData = {
      yesterdayReview: {
        selfCare: { completed: [] },
        importantTasks: { completed: [] },
        extraTasks: { completed: [] },
        bonusCompleted: []
      },
      todayPlan: {
        selfCare: { planned: [] },
        importantTasks: { planned: [] },
        extraTasks: { planned: [] }
      }
    };
    this.currentStep = 'welcome';
  }
}

// 导出到全局作用域
window.DailyStartPage = DailyStartPage;