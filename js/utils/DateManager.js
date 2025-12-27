// 日期管理器 - 处理日期计算和演示模式
class DateManager {
  /**
   * 获取当前有效日期（考虑演示模式）
   * @returns {Date} 当前日期
   */
  static getCurrentDate() {
    const state = DataManager.load(STORAGE_KEYS.APP_STATE);
    
    if (state?.demoMode?.enabled && state?.demoMode?.virtualDate) {
      try {
        const virtualDate = new Date(state.demoMode.virtualDate);
        if (!isNaN(virtualDate.getTime())) {
          return virtualDate;
        }
      } catch (error) {
        console.warn('虚拟日期无效，使用真实日期:', error);
      }
    }
    
    return new Date();
  }

  /**
   * 检查指定日期是否为周一
   * @param {Date} date - 要检查的日期，默认为当前日期
   * @returns {boolean} 是否为周一
   */
  static isMonday(date = this.getCurrentDate()) {
    return date.getDay() === 1;
  }

  /**
   * 检查指定日期是否为周末（周日）
   * @param {Date} date - 要检查的日期，默认为当前日期
   * @returns {boolean} 是否为周末
   */
  static isWeekEnd(date = this.getCurrentDate()) {
    return date.getDay() === 0; // 周日
  }

  /**
   * 获取指定日期所在周的开始日期（周一）
   * @param {Date} date - 指定日期，默认为当前日期
   * @returns {Date} 周开始日期
   */
  static getWeekStart(date = this.getCurrentDate()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 调整周日
    d.setDate(diff);
    d.setHours(0, 0, 0, 0); // 设置为当天开始
    return d;
  }

  /**
   * 获取指定日期所在周的结束日期（周日）
   * @param {Date} date - 指定日期，默认为当前日期
   * @returns {Date} 周结束日期
   */
  static getWeekEnd(date = this.getCurrentDate()) {
    const weekStart = this.getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999); // 设置为当天结束
    return weekEnd;
  }

  /**
   * 检查是否需要周结算
   * @returns {boolean} 是否需要周结算
   */
  static needsWeeklySettlement() {
    const currentWeekStart = this.getWeekStart();
    const state = DataManager.load(STORAGE_KEYS.APP_STATE);
    
    if (!state?.currentWeek?.weekStart) {
      return true; // 如果没有当前周数据，需要初始化
    }
    
    try {
      const savedWeekStart = new Date(state.currentWeek.weekStart);
      return currentWeekStart.getTime() !== savedWeekStart.getTime();
    } catch (error) {
      console.warn('周开始日期格式错误:', error);
      return true;
    }
  }

  /**
   * 获取昨天的日期
   * @returns {Date} 昨天的日期
   */
  static getYesterday() {
    const yesterday = new Date(this.getCurrentDate());
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  }

  /**
   * 获取明天的日期
   * @returns {Date} 明天的日期
   */
  static getTomorrow() {
    const tomorrow = new Date(this.getCurrentDate());
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  /**
   * 格式化日期为字符串
   * @param {Date} date - 要格式化的日期
   * @param {object} options - 格式化选项
   * @returns {string} 格式化后的日期字符串
   */
  static formatDate(date, options = DATE_FORMAT_OPTIONS) {
    try {
      return date.toLocaleDateString('zh-CN', options);
    } catch (error) {
      console.warn('日期格式化失败:', error);
      return date.toLocaleDateString();
    }
  }

  /**
   * 获取日期的简短格式（YYYY-MM-DD）
   * @param {Date} date - 要格式化的日期
   * @returns {string} YYYY-MM-DD格式的日期字符串
   */
  static getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 从日期键解析日期
   * @param {string} dateKey - YYYY-MM-DD格式的日期字符串
   * @returns {Date} 解析后的日期
   */
  static parseDateKey(dateKey) {
    try {
      const [year, month, day] = dateKey.split('-').map(Number);
      return new Date(year, month - 1, day);
    } catch (error) {
      console.warn('日期键解析失败:', error);
      return new Date();
    }
  }

  /**
   * 检查两个日期是否为同一天
   * @param {Date} date1 - 第一个日期
   * @param {Date} date2 - 第二个日期
   * @returns {boolean} 是否为同一天
   */
  static isSameDay(date1, date2) {
    return this.getDateKey(date1) === this.getDateKey(date2);
  }

  /**
   * 获取两个日期之间的天数差
   * @param {Date} date1 - 开始日期
   * @param {Date} date2 - 结束日期
   * @returns {number} 天数差
   */
  static getDaysDifference(date1, date2) {
    const timeDiff = date2.getTime() - date1.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  // ===== 演示模式相关方法 =====

  /**
   * 启用演示模式
   */
  static enableDemoMode() {
    const state = DataManager.load(STORAGE_KEYS.APP_STATE, DEFAULT_APP_STATE);
    state.demoMode = {
      enabled: true,
      virtualDate: new Date().toISOString()
    };
    DataManager.save(STORAGE_KEYS.APP_STATE, state);
    console.log('演示模式已启用');
  }

  /**
   * 禁用演示模式
   */
  static disableDemoMode() {
    const state = DataManager.load(STORAGE_KEYS.APP_STATE, DEFAULT_APP_STATE);
    state.demoMode = {
      enabled: false,
      virtualDate: null
    };
    DataManager.save(STORAGE_KEYS.APP_STATE, state);
    console.log('演示模式已禁用');
  }

  /**
   * 检查演示模式是否启用
   * @returns {boolean} 演示模式是否启用
   */
  static isDemoModeEnabled() {
    const state = DataManager.load(STORAGE_KEYS.APP_STATE);
    return state?.demoMode?.enabled === true;
  }

  /**
   * 前进一天（演示模式）
   */
  static advanceDay() {
    const state = DataManager.load(STORAGE_KEYS.APP_STATE);
    if (state?.demoMode?.enabled) {
      try {
        const currentDate = new Date(state.demoMode.virtualDate || new Date());
        currentDate.setDate(currentDate.getDate() + 1);
        state.demoMode.virtualDate = currentDate.toISOString();
        DataManager.save(STORAGE_KEYS.APP_STATE, state);
        console.log('虚拟日期前进一天:', this.formatDate(currentDate));
        return currentDate;
      } catch (error) {
        console.error('前进日期失败:', error);
      }
    }
    return null;
  }

  /**
   * 后退一天（演示模式）
   */
  static goBackDay() {
    const state = DataManager.load(STORAGE_KEYS.APP_STATE);
    if (state?.demoMode?.enabled) {
      try {
        const currentDate = new Date(state.demoMode.virtualDate || new Date());
        currentDate.setDate(currentDate.getDate() - 1);
        state.demoMode.virtualDate = currentDate.toISOString();
        DataManager.save(STORAGE_KEYS.APP_STATE, state);
        console.log('虚拟日期后退一天:', this.formatDate(currentDate));
        return currentDate;
      } catch (error) {
        console.error('后退日期失败:', error);
      }
    }
    return null;
  }

  /**
   * 跳转到下周一（演示模式）
   */
  static jumpToNextMonday() {
    const state = DataManager.load(STORAGE_KEYS.APP_STATE);
    if (state?.demoMode?.enabled) {
      try {
        const currentDate = new Date(state.demoMode.virtualDate || new Date());
        const daysUntilMonday = (8 - currentDate.getDay()) % 7 || 7;
        currentDate.setDate(currentDate.getDate() + daysUntilMonday);
        state.demoMode.virtualDate = currentDate.toISOString();
        DataManager.save(STORAGE_KEYS.APP_STATE, state);
        console.log('跳转到下周一:', this.formatDate(currentDate));
        return currentDate;
      } catch (error) {
        console.error('跳转到下周一失败:', error);
      }
    }
    return null;
  }

  /**
   * 触发周末结算（演示模式）
   */
  static triggerWeekEnd() {
    if (this.isDemoModeEnabled()) {
      // 这里会调用AnimalSystem的周结算逻辑
      // 然后跳转到下周一
      console.log('触发周末结算...');
      
      // 先完成当前周的动物成长
      if (window.AnimalSystem) {
        window.AnimalSystem.completeWeek();
      }
      
      // 然后跳转到下周一
      return this.jumpToNextMonday();
    }
    return null;
  }

  /**
   * 重置为真实时间（演示模式）
   */
  static resetToRealTime() {
    this.disableDemoMode();
    console.log('已重置为真实时间');
    return new Date();
  }

  /**
   * 获取虚拟日期显示字符串
   * @returns {string} 虚拟日期的显示字符串
   */
  static getVirtualDateDisplay() {
    if (this.isDemoModeEnabled()) {
      const virtualDate = this.getCurrentDate();
      return this.formatDate(virtualDate);
    }
    return '未启用';
  }
}

// 导出到全局作用域
window.DateManager = DateManager;