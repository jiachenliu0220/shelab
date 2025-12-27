// 数据管理器 - 处理本地存储操作
class DataManager {
  /**
   * 保存数据到本地存储
   * @param {string} key - 存储键名
   * @param {any} data - 要保存的数据
   */
  static save(key, data) {
    try {
      const jsonData = JSON.stringify(data);
      localStorage.setItem(key, jsonData);
      console.log(`数据已保存到 ${key}`);
    } catch (error) {
      console.error('保存数据失败:', error);
      // 如果localStorage失败，尝试使用sessionStorage作为备选
      try {
        sessionStorage.setItem(key, JSON.stringify(data));
        console.warn('使用sessionStorage作为备选存储');
      } catch (sessionError) {
        console.error('备选存储也失败:', sessionError);
        throw new Error('数据存储失败');
      }
    }
  }

  /**
   * 从本地存储加载数据
   * @param {string} key - 存储键名
   * @param {any} defaultValue - 默认值
   * @returns {any} 加载的数据或默认值
   */
  static load(key, defaultValue = null) {
    try {
      // 首先尝试从localStorage加载
      let data = localStorage.getItem(key);
      
      // 如果localStorage没有数据，尝试从sessionStorage加载
      if (data === null) {
        data = sessionStorage.getItem(key);
      }
      
      if (data === null) {
        console.log(`未找到 ${key} 的数据，使用默认值`);
        return defaultValue;
      }
      
      const parsedData = JSON.parse(data);
      console.log(`从 ${key} 加载数据成功`);
      return parsedData;
    } catch (error) {
      console.error('加载数据失败:', error);
      return defaultValue;
    }
  }

  /**
   * 删除存储的数据
   * @param {string} key - 存储键名
   */
  static remove(key) {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      console.log(`已删除 ${key} 的数据`);
    } catch (error) {
      console.error('删除数据失败:', error);
    }
  }

  /**
   * 检查存储是否可用
   * @returns {boolean} 存储是否可用
   */
  static isStorageAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('localStorage不可用，将使用内存存储');
      return false;
    }
  }

  /**
   * 获取存储使用情况
   * @returns {object} 存储使用情况信息
   */
  static getStorageInfo() {
    if (!this.isStorageAvailable()) {
      return { available: false };
    }

    try {
      let totalSize = 0;
      let itemCount = 0;
      
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
          itemCount++;
        }
      }
      
      return {
        available: true,
        itemCount,
        totalSize,
        formattedSize: this.formatBytes(totalSize)
      };
    } catch (error) {
      console.error('获取存储信息失败:', error);
      return { available: false };
    }
  }

  /**
   * 格式化字节大小
   * @param {number} bytes - 字节数
   * @returns {string} 格式化后的大小
   */
  static formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 创建数据备份
   */
  static backup() {
    try {
      const appState = this.load(STORAGE_KEYS.APP_STATE);
      if (appState) {
        const backup = {
          timestamp: new Date().toISOString(),
          data: appState
        };
        this.save(STORAGE_KEYS.BACKUP, backup);
        console.log('数据备份创建成功');
        return true;
      }
      return false;
    } catch (error) {
      console.error('创建备份失败:', error);
      return false;
    }
  }

  /**
   * 恢复数据备份
   */
  static restore() {
    try {
      const backup = this.load(STORAGE_KEYS.BACKUP);
      if (backup && backup.data) {
        this.save(STORAGE_KEYS.APP_STATE, backup.data);
        console.log('数据恢复成功');
        return true;
      }
      console.warn('未找到可用的备份数据');
      return false;
    } catch (error) {
      console.error('恢复备份失败:', error);
      return false;
    }
  }

  /**
   * 清除所有应用数据
   */
  static clearAll() {
    try {
      this.remove(STORAGE_KEYS.APP_STATE);
      this.remove(STORAGE_KEYS.BACKUP);
      console.log('所有应用数据已清除');
      return true;
    } catch (error) {
      console.error('清除数据失败:', error);
      return false;
    }
  }

  /**
   * 验证数据完整性
   * @param {object} data - 要验证的数据
   * @returns {boolean} 数据是否有效
   */
  static validateAppState(data) {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // 检查必需的顶级属性
    const requiredKeys = ['demoMode', 'user', 'currentWeek', 'weekHistory', 'settings'];
    for (const key of requiredKeys) {
      if (!(key in data)) {
        console.warn(`缺少必需的属性: ${key}`);
        return false;
      }
    }

    // 检查demoMode结构
    if (!data.demoMode || typeof data.demoMode.enabled !== 'boolean') {
      console.warn('demoMode结构无效');
      return false;
    }

    // 检查currentWeek结构
    if (!data.currentWeek || !data.currentWeek.animalGrowth) {
      console.warn('currentWeek结构无效');
      return false;
    }

    return true;
  }

  /**
   * 修复损坏的数据
   * @param {object} data - 可能损坏的数据
   * @returns {object} 修复后的数据
   */
  static repairAppState(data) {
    console.log('尝试修复应用数据...');
    
    // 从默认状态开始
    const repairedData = JSON.parse(JSON.stringify(DEFAULT_APP_STATE));
    
    if (data && typeof data === 'object') {
      // 尝试保留有效的数据
      if (data.user && data.user.createdAt) {
        repairedData.user.createdAt = data.user.createdAt;
      }
      
      if (data.currentWeek) {
        if (data.currentWeek.weekStart) {
          repairedData.currentWeek.weekStart = data.currentWeek.weekStart;
        }
        if (data.currentWeek.mood) {
          repairedData.currentWeek.mood = data.currentWeek.mood;
        }
        if (Array.isArray(data.currentWeek.selfCarePreferences)) {
          repairedData.currentWeek.selfCarePreferences = data.currentWeek.selfCarePreferences;
        }
        if (data.currentWeek.animalType) {
          repairedData.currentWeek.animalType = data.currentWeek.animalType;
        }
        if (data.currentWeek.dailyRecords) {
          repairedData.currentWeek.dailyRecords = data.currentWeek.dailyRecords;
        }
      }
      
      if (Array.isArray(data.weekHistory)) {
        repairedData.weekHistory = data.weekHistory;
      }
      
      if (data.settings) {
        repairedData.settings = { ...repairedData.settings, ...data.settings };
      }
    }
    
    console.log('数据修复完成');
    return repairedData;
  }
}

// 导出到全局作用域
window.DataManager = DataManager;