// 状态管理器 - 管理应用状态和数据操作
class StateManager {
  constructor() {
    this.state = null;
    this.listeners = [];
  }

  /**
   * 初始化状态管理器
   */
  init() {
    this.loadState();
    this.validateAndRepairState();
    console.log('状态管理器初始化完成');
  }

  /**
   * 从本地存储加载状态
   */
  loadState() {
    const savedState = DataManager.load(STORAGE_KEYS.APP_STATE);
    
    if (savedState && DataManager.validateAppState(savedState)) {
      this.state = savedState;
      console.log('状态加载成功');
    } else {
      console.log('使用默认状态或修复损坏的状态');
      this.state = savedState ? 
        DataManager.repairAppState(savedState) : 
        JSON.parse(JSON.stringify(DEFAULT_APP_STATE));
    }
    
    // 确保用户创建时间存在
    if (!this.state.user.createdAt) {
      this.state.user.createdAt = new Date().toISOString();
    }
    
    this.saveState();
  }

  /**
   * 保存状态到本地存储
   */
  saveState() {
    try {
      DataManager.save(STORAGE_KEYS.APP_STATE, this.state);
      this.notifyListeners();
    } catch (error) {
      console.error('保存状态失败:', error);
    }
  }

  /**
   * 验证并修复状态
   */
  validateAndRepairState() {
    let needsSave = false;

    // 检查并初始化当前周
    if (DateManager.needsWeeklySettlement()) {
      this.initializeCurrentWeek();
      needsSave = true;
    }

    // 确保每日记录对象存在
    if (!this.state.currentWeek.dailyRecords) {
      this.state.currentWeek.dailyRecords = {};
      needsSave = true;
    }

    // 确保动物成长状态完整
    if (!this.state.currentWeek.animalGrowth) {
      this.state.currentWeek.animalGrowth = {
        stage: 1,
        appearance: {
          size: 'small',
          color: 'orange',
          accessories: []
        }
      };
      needsSave = true;
    }

    if (needsSave) {
      this.saveState();
    }
  }

  /**
   * 初始化当前周
   */
  initializeCurrentWeek() {
    const currentWeekStart = DateManager.getWeekStart();
    
    // 如果有旧的周数据，移动到历史记录
    if (this.state.currentWeek.weekStart) {
      this.archiveCurrentWeek();
    }

    // 初始化新的周数据
    this.state.currentWeek = {
      weekStart: currentWeekStart.toISOString(),
      mood: 'neutral',
      selfCarePreferences: [],
      animalType: 'cat',
      animalGrowth: {
        stage: 1,
        appearance: {
          size: 'small',
          color: 'orange',
          accessories: []
        }
      },
      dailyRecords: {}
    };

    this.state.user.currentWeekStart = currentWeekStart.toISOString();
    console.log('新周已初始化:', DateManager.formatDate(currentWeekStart));
  }

  /**
   * 将当前周归档到历史记录
   */
  archiveCurrentWeek() {
    if (!this.state.currentWeek.weekStart) return;

    try {
      const weekStart = new Date(this.state.currentWeek.weekStart);
      const weekEnd = DateManager.getWeekEnd(weekStart);
      
      // 计算完成统计
      const stats = this.calculateWeekStats();
      
      // 生成周总结
      const summary = this.generateWeeklySummary(stats);

      const archivedWeek = {
        weekStart: this.state.currentWeek.weekStart,
        weekEnd: weekEnd.toISOString(),
        animal: {
          type: this.state.currentWeek.animalType,
          finalAppearance: { ...this.state.currentWeek.animalGrowth.appearance }
        },
        summary: summary,
        completionStats: stats,
        mood: this.state.currentWeek.mood,
        selfCarePreferences: [...this.state.currentWeek.selfCarePreferences],
        dailyRecords: { ...this.state.currentWeek.dailyRecords }
      };

      this.state.weekHistory.unshift(archivedWeek);
      
      // 限制历史记录数量（保留最近12周）
      if (this.state.weekHistory.length > 12) {
        this.state.weekHistory = this.state.weekHistory.slice(0, 12);
      }

      console.log('当前周已归档到历史记录');
    } catch (error) {
      console.error('归档当前周失败:', error);
    }
  }

  /**
   * 计算周完成统计
   * @returns {object} 统计数据
   */
  calculateWeekStats() {
    const records = this.state.currentWeek.dailyRecords;
    let daysStarted = 0;
    let totalSelfCareCompleted = 0;
    let totalSelfCarePlanned = 0;
    let totalTasksCompleted = 0;

    Object.values(records).forEach(record => {
      if (record.started) {
        daysStarted++;
      }
      
      if (record.selfCare) {
        totalSelfCarePlanned += record.selfCare.planned?.length || 0;
        totalSelfCareCompleted += record.selfCare.completed?.length || 0;
      }
      
      if (record.importantTasks) {
        totalTasksCompleted += record.importantTasks.completed?.length || 0;
      }
    });

    const selfCareRate = totalSelfCarePlanned > 0 ? 
      totalSelfCareCompleted / totalSelfCarePlanned : 0;

    return {
      daysStarted,
      selfCareRate: Math.round(selfCareRate * 100) / 100,
      tasksCompleted: totalTasksCompleted
    };
  }

  /**
   * 生成周总结文案
   * @param {object} stats - 统计数据
   * @returns {string} 总结文案
   */
  generateWeeklySummary(stats) {
    const messages = ENCOURAGING_MESSAGES.weeklyReflection;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // 可以根据stats调整消息，但保持积极性
    if (stats.daysStarted >= 5) {
      return '这一周你坚持得很好，小动物也因此茁壮成长！';
    } else if (stats.daysStarted >= 3) {
      return '这一周你温柔地对待了自己，每一天的努力都很珍贵。';
    } else {
      return '这一周虽然有挑战，但你依然在尝试，这份勇气很了不起。';
    }
  }

  /**
   * 获取当前周数据
   * @returns {object} 当前周数据
   */
  getCurrentWeekData() {
    return this.state.currentWeek;
  }

  /**
   * 获取上周数据
   * @returns {object|null} 上周数据
   */
  getPreviousWeekData() {
    return this.state.weekHistory.length > 0 ? this.state.weekHistory[0] : null;
  }

  /**
   * 获取今日记录
   * @returns {object|null} 今日记录
   */
  getTodayRecord() {
    const today = DateManager.getDateKey(DateManager.getCurrentDate());
    return this.state.currentWeek.dailyRecords[today] || null;
  }

  /**
   * 获取昨日记录
   * @returns {object|null} 昨日记录
   */
  getYesterdayRecord() {
    const yesterday = DateManager.getYesterday();
    const yesterdayKey = DateManager.getDateKey(yesterday);
    
    // 首先检查当前周的记录
    let yesterdayRecord = this.state.currentWeek.dailyRecords[yesterdayKey];
    
    // 如果当前周没有，检查是否跨周了
    if (!yesterdayRecord && this.state.weekHistory.length > 0) {
      const lastWeek = this.state.weekHistory[0];
      if (lastWeek.dailyRecords && lastWeek.dailyRecords[yesterdayKey]) {
        yesterdayRecord = lastWeek.dailyRecords[yesterdayKey];
      }
    }
    
    return yesterdayRecord || null;
  }

  /**
   * 标记今日已启动
   * @param {object} dailyData - 今日数据
   */
  markDayStarted(dailyData) {
    const today = DateManager.getDateKey(DateManager.getCurrentDate());
    
    // 处理昨日回顾数据更新
    if (dailyData.yesterdayReview) {
      this.updateYesterdayRecord(dailyData.yesterdayReview);
    }
    
    if (!this.state.currentWeek.dailyRecords[today]) {
      this.state.currentWeek.dailyRecords[today] = {};
    }
    
    // 创建今日记录（不包含昨日回顾数据）
    const todayRecord = {
      selfCare: dailyData.selfCare,
      importantTasks: dailyData.importantTasks,
      extraTasks: dailyData.extraTasks,
      bonusCompleted: dailyData.bonusCompleted,
      started: true,
      startedAt: new Date().toISOString()
    };
    
    this.state.currentWeek.dailyRecords[today] = {
      ...this.state.currentWeek.dailyRecords[today],
      ...todayRecord
    };
    
    // 更新动物成长
    if (window.AnimalSystem) {
      window.AnimalSystem.updateGrowth(todayRecord);
    }
    
    this.saveState();
    console.log('今日已标记为启动');
  }

  /**
   * 更新昨日记录
   * @param {object} yesterdayReview - 昨日回顾数据
   */
  updateYesterdayRecord(yesterdayReview) {
    const yesterday = DateManager.getYesterday();
    const yesterdayKey = DateManager.getDateKey(yesterday);
    
    // 查找昨日记录的位置
    let targetRecord = null;
    let isInCurrentWeek = false;
    
    // 首先检查当前周
    if (this.state.currentWeek.dailyRecords[yesterdayKey]) {
      targetRecord = this.state.currentWeek.dailyRecords[yesterdayKey];
      isInCurrentWeek = true;
    }
    // 然后检查历史周
    else if (this.state.weekHistory.length > 0) {
      const lastWeek = this.state.weekHistory[0];
      if (lastWeek.dailyRecords && lastWeek.dailyRecords[yesterdayKey]) {
        targetRecord = lastWeek.dailyRecords[yesterdayKey];
        isInCurrentWeek = false;
      }
    }
    
    if (targetRecord) {
      // 更新完成状态
      if (yesterdayReview.selfCare) {
        targetRecord.selfCare = {
          ...targetRecord.selfCare,
          completed: yesterdayReview.selfCare.completed || []
        };
      }
      
      if (yesterdayReview.importantTasks) {
        targetRecord.importantTasks = {
          ...targetRecord.importantTasks,
          completed: yesterdayReview.importantTasks.completed || []
        };
      }
      
      if (yesterdayReview.extraTasks) {
        targetRecord.extraTasks = {
          ...targetRecord.extraTasks,
          completed: yesterdayReview.extraTasks.completed || []
        };
      }
      
      // 添加奖励完成事项
      if (yesterdayReview.bonusCompleted && yesterdayReview.bonusCompleted.length > 0) {
        if (!targetRecord.bonusCompleted) {
          targetRecord.bonusCompleted = [];
        }
        targetRecord.bonusCompleted.push(...yesterdayReview.bonusCompleted);
      }
      
      console.log('昨日记录已更新');
    }
  }

  /**
   * 更新周一设置
   * @param {object} mondayData - 周一设置数据
   */
  updateMondaySettings(mondayData) {
    this.state.currentWeek = {
      ...this.state.currentWeek,
      mood: mondayData.mood,
      selfCarePreferences: mondayData.selfCarePreferences,
      animalType: mondayData.animalType,
      generatedSelfCare: mondayData.generatedSelfCare || []
    };
    
    // 如果选择了新动物，重新初始化动物成长
    if (mondayData.animalType && window.AnimalSystem) {
      const animalData = window.AnimalSystem.createWeeklyAnimal(mondayData.animalType);
      this.state.currentWeek.animalGrowth = animalData;
    }
    
    this.saveState();
    console.log('周一设置已更新');
  }

  /**
   * 为演示模式创建前一天的模拟记录
   */
  createYesterdayDemoRecord() {
    if (!DateManager.isDemoModeEnabled()) {
      return;
    }
    
    const yesterday = DateManager.getYesterday();
    const yesterdayKey = DateManager.getDateKey(yesterday);
    const today = DateManager.getCurrentDate();
    const todayKey = DateManager.getDateKey(today);
    
    // 确保今天没有启动记录（演示模式下前进一天应该是新的开始）
    if (this.state.currentWeek.dailyRecords[todayKey]) {
      delete this.state.currentWeek.dailyRecords[todayKey];
      console.log('演示模式：清除今日记录，准备新的一天');
    }
    
    // 检查是否已经有昨日记录，如果有就不需要重新创建
    if (this.state.currentWeek.dailyRecords[yesterdayKey]) {
      console.log('演示模式：昨日记录已存在，无需重新创建');
      this.saveState(); // 保存清除今日记录的状态
      return;
    }
    
    // 创建模拟的昨日记录
    const mockYesterdayRecord = {
      selfCare: {
        planned: ['hydration', 'gentle_movement', 'breathing'],
        completed: ['hydration', 'breathing'] // 部分完成
      },
      importantTasks: {
        planned: ['完成工作报告', '整理邮件', '准备明天的会议'],
        completed: ['完成工作报告', '整理邮件'] // 部分完成
      },
      extraTasks: {
        planned: ['阅读30分钟', '整理桌面'],
        completed: ['阅读30分钟'] // 部分完成
      },
      bonusCompleted: [],
      started: true,
      startedAt: new Date(yesterday.getTime() + 9 * 60 * 60 * 1000).toISOString() // 昨天上午9点启动
    };
    
    this.state.currentWeek.dailyRecords[yesterdayKey] = mockYesterdayRecord;
    this.saveState();
    console.log('为演示模式创建了昨日模拟记录');
  }

  /**
   * 检查周一设置是否已完成
   * @returns {boolean} 周一设置是否已完成
   */
  isMondayCompleted() {
    const currentWeekStart = DateManager.getWeekStart();
    const savedWeekStart = this.state.currentWeek.weekStart;
    
    // 如果周开始时间不匹配，说明是新的一周，周一设置未完成
    if (!savedWeekStart) {
      return false;
    }
    
    try {
      const savedDate = new Date(savedWeekStart);
      const isSameWeek = currentWeekStart.getTime() === savedDate.getTime();
      
      // 如果不是同一周，周一设置未完成
      if (!isSameWeek) {
        return false;
      }
      
      // 如果是同一周，检查是否有周一设置数据
      const hasSettings = !!(this.state.currentWeek.mood && 
                           this.state.currentWeek.animalType && 
                           this.state.currentWeek.selfCarePreferences);
      
      // 在演示模式下，如果是周一且没有今日启动记录，重置周一设置状态
      if (DateManager.isDemoModeEnabled() && DateManager.isMonday()) {
        const todayKey = DateManager.getDateKey(DateManager.getCurrentDate());
        const todayStarted = this.state.currentWeek.dailyRecords[todayKey]?.started;
        
        if (!todayStarted) {
          // 清除周一设置，强制重新设置
          this.state.currentWeek.mood = '';
          this.state.currentWeek.animalType = '';
          this.state.currentWeek.selfCarePreferences = [];
          this.state.currentWeek.generatedSelfCare = [];
          console.log('演示模式：重置周一设置状态');
          return false;
        }
      }
      
      return hasSettings;
    } catch (error) {
      console.warn('检查周一完成状态失败:', error);
      return false;
    }
  }

  /**
   * 检查今日是否已启动
   * @returns {boolean} 今日是否已启动
   */
  isTodayStarted() {
    const todayRecord = this.getTodayRecord();
    return todayRecord?.started === true;
  }

  /**
   * 检查昨日是否已启动
   * @returns {boolean} 昨日是否已启动
   */
  wasYesterdayStarted() {
    const yesterdayRecord = this.getYesterdayRecord();
    return yesterdayRecord?.started === true;
  }

  /**
   * 获取Self-care推荐
   * @returns {array} 推荐的Self-care项目
   */
  getSelfCareRecommendations() {
    // 优先使用AI生成的推荐
    if (this.state.currentWeek.generatedSelfCare && this.state.currentWeek.generatedSelfCare.length > 0) {
      return this.state.currentWeek.generatedSelfCare.slice(0, 3);
    }
    
    // 备用逻辑：基于偏好和历史数据
    const preferences = this.state.currentWeek.selfCarePreferences || [];
    const recentRecords = this.getRecentRecords(3);
    
    // 分析未完成的self-care项目
    const incompleteItems = new Set();
    recentRecords.forEach(record => {
      if (record.selfCare) {
        const planned = record.selfCare.planned || [];
        const completed = record.selfCare.completed || [];
        planned.forEach(item => {
          if (!completed.includes(item)) {
            incompleteItems.add(item);
          }
        });
      }
    });
    
    // 基于偏好和未完成项目生成推荐
    const recommendations = [];
    
    // 优先推荐偏好中未完成的项目
    preferences.forEach(pref => {
      if (incompleteItems.has(pref)) {
        recommendations.push(pref);
      }
    });
    
    // 如果推荐不够，添加其他偏好项目
    preferences.forEach(pref => {
      if (!recommendations.includes(pref) && recommendations.length < 3) {
        recommendations.push(pref);
      }
    });
    
    // 如果还是不够，随机添加一些常见项目
    const commonItems = ['hydration', 'gentle_movement', 'breathing'];
    commonItems.forEach(item => {
      if (!recommendations.includes(item) && recommendations.length < 3) {
        recommendations.push(item);
      }
    });
    
    return recommendations.slice(0, 3);
  }

  /**
   * 获取最近几天的记录
   * @param {number} days - 天数
   * @returns {array} 最近的记录
   */
  getRecentRecords(days = 7) {
    const records = [];
    const currentDate = DateManager.getCurrentDate();
    
    for (let i = 1; i <= days; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const dateKey = DateManager.getDateKey(date);
      const record = this.state.currentWeek.dailyRecords[dateKey];
      if (record) {
        records.push({ date: dateKey, ...record });
      }
    }
    
    return records;
  }

  /**
   * 添加状态变化监听器
   * @param {function} listener - 监听器函数
   */
  addListener(listener) {
    this.listeners.push(listener);
  }

  /**
   * 移除状态变化监听器
   * @param {function} listener - 监听器函数
   */
  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 通知所有监听器状态已变化
   */
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        console.error('监听器执行失败:', error);
      }
    });
  }

  /**
   * 获取完整状态
   * @returns {object} 完整的应用状态
   */
  getState() {
    return this.state;
  }

  /**
   * 重置应用状态
   */
  resetState() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_APP_STATE));
    this.state.user.createdAt = new Date().toISOString();
    this.saveState();
    console.log('应用状态已重置');
  }
}

// 导出到全局作用域
window.StateManager = StateManager;