// 周一冷启动页面组件
class MondayStartPage {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.currentStep = 'welcome'; // welcome, mood, needs, animal, complete
    this.formData = {
      mood: '',
      selfCareNeeds: [],
      animalType: '',
      generatedSelfCare: []
    };
    
    // 绑定方法
    this.render = this.render.bind(this);
    this.handleStepChange = this.handleStepChange.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  /**
   * 渲染周一冷启动页面
   * @returns {string} HTML字符串
   */
  render() {
    switch (this.currentStep) {
      case 'welcome':
        return this.renderWelcomeStep();
      case 'mood':
        return this.renderMoodStep();
      case 'needs':
        return this.renderNeedsStep();
      case 'animal':
        return this.renderAnimalStep();
      case 'complete':
        return this.renderCompleteStep();
      default:
        return this.renderWelcomeStep();
    }
  }

  /**
   * 渲染欢迎步骤
   */
  renderWelcomeStep() {
    const previousWeek = this.stateManager.getPreviousWeekData();
    const mondayMessages = ENCOURAGING_MESSAGES.monday;
    const randomMessage = mondayMessages[Math.floor(Math.random() * mondayMessages.length)];
    
    return `
      <div class="monday-start-page">
        <div class="welcome-section text-center mb-lg">
          <h2>🌅 新的一周开始了</h2>
          <p class="encouraging-text">${randomMessage}</p>
        </div>
        
        ${previousWeek ? this.renderWeeklyReview(previousWeek) : ''}
        
        <div class="start-actions text-center">
          <button class="btn-primary" onclick="mondayStartPage.handleStepChange('mood')">
            开始这周的温柔设定
          </button>
        </div>
        
        <div class="weekly-tip mt-lg">
          <div class="tip-card">
            <span class="tip-icon">💝</span>
            <p class="tip-text">每逢周一，我们会先问你3个问题来了解你的状态，然后再进行正常的每日启动流程</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染上周回顾
   */
  renderWeeklyReview(weekData) {
    const stats = weekData.completionStats || {};
    
    return `
      <div class="weekly-review mb-lg">
        <h3 class="review-title">上周的美好回顾 ✨</h3>
        <div class="review-content">
          <div class="review-stats">
            <div class="stat-item">
              <span class="stat-number">${stats.daysStarted || 0}</span>
              <span class="stat-label">天启动了新的一天</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">${stats.tasksCompleted || 0}</span>
              <span class="stat-label">件事情完成了</span>
            </div>
          </div>
          
          <div class="review-summary">
            <p class="summary-text">${weekData.summary || '上周你已经很努力了，每一个小小的尝试都很珍贵。'}</p>
          </div>
          
          <div class="review-animal">
            <span class="animal-emoji">${ANIMAL_OPTIONS.find(a => a.value === weekData.animal?.type)?.emoji || '🐾'}</span>
            <span class="animal-name">${ANIMAL_OPTIONS.find(a => a.value === weekData.animal?.type)?.label || '小伙伴'}</span>
            <span class="animal-status">已经毕业啦！</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染心情步骤
   */
  renderMoodStep() {
    return `
      <div class="monday-start-page">
        <div class="step-header text-center mb-lg">
          <div class="step-indicator">1/3</div>
          <h2>💭 你现在的心情怎么样？</h2>
          <p class="encouraging-text">没有对错，只是想了解一下你现在的状态</p>
        </div>
        
        <div class="mood-selection">
          <div class="mood-grid">
            ${MOOD_OPTIONS.map(mood => `
              <label class="mood-item ${this.formData.mood === mood.value ? 'selected' : ''}">
                <input 
                  type="radio" 
                  name="mood" 
                  value="${mood.value}"
                  ${this.formData.mood === mood.value ? 'checked' : ''}
                  onchange="mondayStartPage.handleMoodChange(this)"
                >
                <div class="mood-content">
                  <span class="mood-emoji">${mood.emoji}</span>
                  <span class="mood-label">${mood.label}</span>
                </div>
              </label>
            `).join('')}
          </div>
        </div>
        
        <div class="step-actions">
          <button class="btn-secondary" onclick="mondayStartPage.handleStepChange('welcome')">
            返回
          </button>
          <button 
            class="btn-primary" 
            ${!this.formData.mood ? 'disabled' : ''}
            onclick="mondayStartPage.handleStepChange('needs')"
          >
            下一步
          </button>
        </div>
      </div>
    `;
  }

  /**
   * 渲染关怀需求步骤
   */
  renderNeedsStep() {
    return `
      <div class="monday-start-page">
        <div class="step-header text-center mb-lg">
          <div class="step-indicator">2/3</div>
          <h2>🤗 你这周希望从什么方面获得关怀？</h2>
          <p class="encouraging-text">可以选择多个，我们会据此为你推荐合适的self-care</p>
        </div>
        
        <div class="needs-selection">
          <div class="needs-grid">
            ${SELF_CARE_NEEDS.map(need => `
              <label class="need-item ${this.formData.selfCareNeeds.includes(need.value) ? 'selected' : ''}">
                <input 
                  type="checkbox" 
                  name="needs" 
                  value="${need.value}"
                  ${this.formData.selfCareNeeds.includes(need.value) ? 'checked' : ''}
                  onchange="mondayStartPage.handleNeedChange(this)"
                >
                <div class="need-content">
                  <span class="need-emoji">${need.emoji}</span>
                  <div class="need-text">
                    <span class="need-label">${need.label}</span>
                    <span class="need-description">${need.description}</span>
                  </div>
                </div>
              </label>
            `).join('')}
          </div>
        </div>
        
        <div class="step-actions">
          <button class="btn-secondary" onclick="mondayStartPage.handleStepChange('mood')">
            返回
          </button>
          <button 
            class="btn-primary" 
            ${this.formData.selfCareNeeds.length === 0 ? 'disabled' : ''}
            onclick="mondayStartPage.handleStepChange('animal')"
          >
            下一步
          </button>
        </div>
      </div>
    `;
  }

  /**
   * 渲染动物选择步骤
   */
  renderAnimalStep() {
    return `
      <div class="monday-start-page">
        <div class="step-header text-center mb-lg">
          <div class="step-indicator">3/3</div>
          <h2>🐾 完成这一周之后你希望获得一只什么动物？</h2>
          <p class="encouraging-text">选择一个你喜欢的小伙伴，它会陪伴你度过这一周</p>
        </div>
        
        <div class="animal-selection">
          <div class="animal-grid">
            ${ANIMAL_OPTIONS.map(animal => `
              <label class="animal-item ${this.formData.animalType === animal.value ? 'selected' : ''}">
                <input 
                  type="radio" 
                  name="animal" 
                  value="${animal.value}"
                  ${this.formData.animalType === animal.value ? 'checked' : ''}
                  onchange="mondayStartPage.handleAnimalChange(this)"
                >
                <div class="animal-content">
                  <span class="animal-emoji">${animal.emoji}</span>
                  <span class="animal-label">${animal.label}</span>
                  <span class="animal-style">${animal.style}</span>
                </div>
              </label>
            `).join('')}
          </div>
        </div>
        
        <div class="step-actions">
          <button class="btn-secondary" onclick="mondayStartPage.handleStepChange('needs')">
            返回
          </button>
          <button 
            class="btn-primary" 
            ${!this.formData.animalType ? 'disabled' : ''}
            onclick="mondayStartPage.handleFormSubmit()"
          >
            完成设定
          </button>
        </div>
      </div>
    `;
  }

  /**
   * 渲染完成步骤
   */
  renderCompleteStep() {
    const selectedAnimal = ANIMAL_OPTIONS.find(a => a.value === this.formData.animalType);
    const selectedMood = MOOD_OPTIONS.find(m => m.value === this.formData.mood);
    
    return `
      <div class="monday-start-page">
        <div class="completion-status text-center">
          <div class="success-message mb-lg">
            <h2>🎉 这周的设定完成了！</h2>
            <p class="encouraging-text">现在让我们继续今天的温柔启动吧</p>
          </div>
          
          <div class="week-summary mb-lg">
            <div class="summary-card">
              <h3>这周的小伙伴</h3>
              <div class="animal-preview">
                <span class="animal-emoji large">${selectedAnimal?.emoji || '🐾'}</span>
                <div class="animal-info">
                  <span class="animal-name">${selectedAnimal?.label || '小动物'}</span>
                  <span class="animal-description">一只${selectedAnimal?.style || '可爱'}的小伙伴</span>
                </div>
              </div>
            </div>
            
            <div class="summary-card">
              <h3>为你推荐的Self-care</h3>
              <div class="selfcare-preview">
                ${this.formData.generatedSelfCare.map(activity => {
                  const activityData = SELF_CARE_ACTIVITIES[activity];
                  return `
                    <div class="selfcare-item">
                      <span class="selfcare-emoji">${activityData?.emoji || '💚'}</span>
                      <span class="selfcare-label">${activityData?.label || activity}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
          
          <div class="completion-actions">
            <button class="btn-primary" onclick="mondayStartPage.proceedToDailyFlow()">
              开始今天的启动
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 处理心情变化
   */
  handleMoodChange(radio) {
    this.formData.mood = radio.value;
    
    // 重新渲染以更新选中状态
    if (window.appController) {
      window.appController.render();
    }
  }

  /**
   * 处理关怀需求变化
   */
  handleNeedChange(checkbox) {
    const value = checkbox.value;
    const isChecked = checkbox.checked;
    
    if (isChecked) {
      if (!this.formData.selfCareNeeds.includes(value)) {
        this.formData.selfCareNeeds.push(value);
      }
    } else {
      const index = this.formData.selfCareNeeds.indexOf(value);
      if (index > -1) {
        this.formData.selfCareNeeds.splice(index, 1);
      }
    }
    
    // 重新渲染以更新选中状态
    if (window.appController) {
      window.appController.render();
    }
  }

  /**
   * 处理动物选择变化
   */
  handleAnimalChange(radio) {
    this.formData.animalType = radio.value;
    
    // 重新渲染以更新选中状态
    if (window.appController) {
      window.appController.render();
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
   * 生成Self-care推荐
   */
  generateSelfCareRecommendations() {
    const recommendations = new Set();
    
    // 基于心情的推荐
    const moodRecs = SELF_CARE_RECOMMENDATIONS.mood[this.formData.mood] || [];
    moodRecs.forEach(rec => recommendations.add(rec));
    
    // 基于关怀需求的推荐
    this.formData.selfCareNeeds.forEach(need => {
      const needRecs = SELF_CARE_RECOMMENDATIONS.needs[need] || [];
      needRecs.forEach(rec => recommendations.add(rec));
    });
    
    // 转换为数组并限制数量
    const recArray = Array.from(recommendations);
    
    // 如果推荐太少，添加一些通用的
    const universalRecs = ['hydration', 'gentle_movement', 'breathing', 'gratitude', 'comfort'];
    universalRecs.forEach(rec => {
      if (recArray.length < 5 && !recArray.includes(rec)) {
        recArray.push(rec);
      }
    });
    
    // 随机排序并取前3-5个
    const shuffled = recArray.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(5, Math.max(3, shuffled.length)));
  }

  /**
   * 处理表单提交
   */
  handleFormSubmit() {
    try {
      // 生成Self-care推荐
      this.formData.generatedSelfCare = this.generateSelfCareRecommendations();
      
      // 准备周一设置数据
      const mondayData = {
        mood: this.formData.mood,
        selfCarePreferences: this.formData.selfCareNeeds,
        animalType: this.formData.animalType,
        generatedSelfCare: this.formData.generatedSelfCare
      };
      
      // 更新状态管理器
      this.stateManager.updateMondaySettings(mondayData);
      
      // 切换到完成步骤
      this.currentStep = 'complete';
      
      // 重新渲染页面
      if (window.appController) {
        window.appController.render();
      }
      
    } catch (error) {
      console.error('提交周一设置失败:', error);
      alert('设置失败，请重试');
    }
  }

  /**
   * 完成周一设置后进入每日流程
   */
  proceedToDailyFlow() {
    console.log('周一设置完成，进入每日流程');
    
    // 重置表单数据
    this.resetFormData();
    
    // 导航到每日启动页面，并设置为昨日回顾步骤
    if (window.appController) {
      window.appController.handleNavigation('daily');
      // 确保每日启动页面从昨日回顾开始
      if (window.appController.components.dailyStart) {
        window.appController.components.dailyStart.currentStep = 'yesterday';
      }
      // 重新渲染以确保显示正确的步骤
      window.appController.render();
    }
  }

  /**
   * 重置表单数据
   */
  resetFormData() {
    this.formData = {
      mood: '',
      selfCareNeeds: [],
      animalType: '',
      generatedSelfCare: []
    };
    this.currentStep = 'welcome';
  }

  /**
   * 检查是否可以进入下一步
   */
  canProceedToNext(step) {
    switch (step) {
      case 'needs':
        return !!this.formData.mood;
      case 'animal':
        return this.formData.selfCareNeeds.length > 0;
      case 'complete':
        return !!this.formData.animalType;
      default:
        return true;
    }
  }
}

// 导出到全局作用域
window.MondayStartPage = MondayStartPage;