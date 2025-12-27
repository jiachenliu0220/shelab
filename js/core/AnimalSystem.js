// 动物系统 - 管理动物成长和外观生成
class AnimalSystem {
  /**
   * 创建本周动物
   * @param {string} animalType - 动物类型
   * @returns {object} 动物数据
   */
  static createWeeklyAnimal(animalType) {
    const appearance = this.generateAnimalAppearance(animalType);
    
    const animalData = {
      stage: 1,
      appearance: appearance
    };
    
    console.log(`创建了新的${animalType}:`, animalData);
    return animalData;
  }

  /**
   * 生成动物外观
   * @param {string} animalType - 动物类型
   * @param {number} completionQuality - 完成质量 (0-1)
   * @returns {object} 动物外观数据
   */
  static generateAnimalAppearance(animalType, completionQuality = 0.5) {
    const colors = ANIMAL_APPEARANCE.colors[animalType] || ['brown'];
    const accessories = ANIMAL_APPEARANCE.accessories;
    const sizes = ANIMAL_APPEARANCE.sizes;
    
    // 基于完成质量确定大小（但永远不会是负面的）
    let sizeIndex;
    if (completionQuality >= 0.8) {
      sizeIndex = 3; // large
    } else if (completionQuality >= 0.6) {
      sizeIndex = 2; // medium
    } else if (completionQuality >= 0.3) {
      sizeIndex = 1; // small
    } else {
      sizeIndex = 0; // tiny，但仍然是可爱的
    }
    
    // 随机选择颜色
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // 基于完成质量随机选择配饰数量（0-3个）
    const accessoryCount = Math.min(3, Math.floor(completionQuality * 4));
    const selectedAccessories = [];
    
    // 随机选择配饰，避免重复
    const shuffledAccessories = [...accessories].sort(() => Math.random() - 0.5);
    for (let i = 0; i < accessoryCount && i < shuffledAccessories.length; i++) {
      selectedAccessories.push(shuffledAccessories[i]);
    }
    
    return {
      size: sizes[sizeIndex],
      color: color,
      accessories: selectedAccessories
    };
  }

  /**
   * 更新动物成长
   * @param {object} completionData - 完成数据
   */
  static updateGrowth(completionData) {
    const stateManager = window.appController?.stateManager;
    if (!stateManager) {
      console.warn('StateManager未找到，无法更新动物成长');
      return;
    }

    const currentWeek = stateManager.getCurrentWeekData();
    const currentStage = currentWeek.animalGrowth.stage;
    
    // 计算完成质量
    const quality = this.calculateCompletionQuality(completionData);
    
    // 动物成长阶段递增（1-7对应一周）
    const newStage = Math.min(7, currentStage + 1);
    
    // 基于新阶段和质量更新外观
    const newAppearance = this.generateAnimalAppearance(
      currentWeek.animalType, 
      quality
    );
    
    // 更新状态
    stateManager.state.currentWeek.animalGrowth = {
      stage: newStage,
      appearance: newAppearance
    };
    
    stateManager.saveState();
    
    console.log(`动物成长到阶段 ${newStage}，质量: ${quality.toFixed(2)}`);
  }

  /**
   * 计算完成质量
   * @param {object} completionData - 完成数据
   * @returns {number} 完成质量 (0-1)
   */
  static calculateCompletionQuality(completionData) {
    let totalScore = 0;
    let maxScore = 0;
    
    // Self-care完成度 (权重: 0.4)
    if (completionData.selfCare) {
      const planned = completionData.selfCare.planned?.length || 0;
      const completed = completionData.selfCare.completed?.length || 0;
      if (planned > 0) {
        totalScore += (completed / planned) * 0.4;
      } else {
        totalScore += 0.2; // 如果没有计划，给予基础分
      }
      maxScore += 0.4;
    }
    
    // 重要任务完成度 (权重: 0.4)
    if (completionData.importantTasks) {
      const planned = completionData.importantTasks.planned?.length || 0;
      const completed = completionData.importantTasks.completed?.length || 0;
      if (planned > 0) {
        totalScore += (completed / planned) * 0.4;
      } else {
        totalScore += 0.2; // 如果没有计划，给予基础分
      }
      maxScore += 0.4;
    }
    
    // 额外任务完成度 (权重: 0.1)
    if (completionData.extraTasks) {
      const planned = completionData.extraTasks.planned?.length || 0;
      const completed = completionData.extraTasks.completed?.length || 0;
      if (planned > 0) {
        totalScore += (completed / planned) * 0.1;
      }
      maxScore += 0.1;
    }
    
    // 奖励完成 (权重: 0.1)
    if (completionData.bonusCompleted?.length > 0) {
      totalScore += 0.1;
    }
    maxScore += 0.1;
    
    // 确保至少有基础分数（永远不会完全失败）
    const quality = maxScore > 0 ? totalScore / maxScore : 0.3;
    return Math.max(0.2, Math.min(1.0, quality)); // 最低0.2，最高1.0
  }

  /**
   * 完成本周（周结算）
   */
  static completeWeek() {
    const stateManager = window.appController?.stateManager;
    if (!stateManager) {
      console.warn('StateManager未找到，无法完成周结算');
      return;
    }

    const currentWeek = stateManager.getCurrentWeekData();
    
    // 计算本周整体完成质量
    const weekQuality = this.calculateWeekQuality(currentWeek);
    
    // 生成最终外观
    const finalAppearance = this.generateAnimalAppearance(
      currentWeek.animalType,
      weekQuality
    );
    
    // 更新动物最终外观
    stateManager.state.currentWeek.animalGrowth.appearance = finalAppearance;
    stateManager.state.currentWeek.animalGrowth.stage = 7; // 完成状态
    
    stateManager.saveState();
    
    console.log(`本周完成，动物最终质量: ${weekQuality.toFixed(2)}`);
    return finalAppearance;
  }

  /**
   * 计算本周完成质量
   * @param {object} weekData - 本周数据
   * @returns {number} 本周完成质量 (0-1)
   */
  static calculateWeekQuality(weekData) {
    const records = Object.values(weekData.dailyRecords || {});
    
    if (records.length === 0) {
      return 0.3; // 基础分数
    }
    
    let totalQuality = 0;
    let validDays = 0;
    
    records.forEach(record => {
      if (record.started) {
        const dayQuality = this.calculateCompletionQuality(record);
        totalQuality += dayQuality;
        validDays++;
      }
    });
    
    if (validDays === 0) {
      return 0.3; // 基础分数
    }
    
    const averageQuality = totalQuality / validDays;
    
    // 考虑启动天数的奖励
    const consistencyBonus = Math.min(0.2, validDays * 0.03);
    
    return Math.max(0.3, Math.min(1.0, averageQuality + consistencyBonus));
  }

  /**
   * 获取动物园历史
   * @returns {array} 历史动物数据
   */
  static getZooAnimals() {
    const stateManager = window.appController?.stateManager;
    if (!stateManager) {
      return [];
    }

    const history = stateManager.getState().weekHistory || [];
    return history.map(week => ({
      type: week.animal.type,
      appearance: week.animal.finalAppearance,
      weekStart: week.weekStart,
      weekEnd: week.weekEnd,
      summary: week.summary,
      stats: week.completionStats
    }));
  }

  /**
   * 获取当前动物状态
   * @returns {object|null} 当前动物状态
   */
  static getCurrentAnimal() {
    const stateManager = window.appController?.stateManager;
    if (!stateManager) {
      return null;
    }

    const currentWeek = stateManager.getCurrentWeekData();
    return {
      type: currentWeek.animalType,
      stage: currentWeek.animalGrowth.stage,
      appearance: currentWeek.animalGrowth.appearance,
      weekStart: currentWeek.weekStart
    };
  }

  /**
   * 生成周总结描述
   * @param {object} stats - 统计数据
   * @param {string} animalType - 动物类型
   * @returns {string} 总结描述
   */
  static generateWeeklySummary(stats, animalType) {
    const animalEmoji = ANIMAL_OPTIONS.find(a => a.value === animalType)?.emoji || '🐾';
    
    if (stats.daysStarted >= 6) {
      return `这一周你坚持得非常好！${animalEmoji}长得特别健康快乐，感谢你的用心陪伴。`;
    } else if (stats.daysStarted >= 4) {
      return `这一周你温柔地对待了自己，${animalEmoji}也因此茁壮成长，你们是很好的伙伴呢！`;
    } else if (stats.daysStarted >= 2) {
      return `这一周虽然有挑战，但你依然在努力，${animalEmoji}能感受到你的温柔。`;
    } else {
      return `这一周可能比较困难，但${animalEmoji}依然陪伴着你，每一个小小的尝试都很珍贵。`;
    }
  }

  /**
   * 获取动物外观描述
   * @param {object} appearance - 动物外观
   * @param {string} animalType - 动物类型
   * @returns {string} 外观描述
   */
  static getAppearanceDescription(appearance, animalType) {
    const animalName = ANIMAL_OPTIONS.find(a => a.value === animalType)?.label || '小动物';
    const sizeDesc = {
      tiny: '迷你的',
      small: '小小的',
      medium: '可爱的',
      large: '健壮的'
    }[appearance.size] || '可爱的';
    
    let description = `一只${sizeDesc}${appearance.color}色的${animalName}`;
    
    if (appearance.accessories.length > 0) {
      const accessoryDesc = appearance.accessories.map(acc => {
        const accMap = {
          hat: '帽子',
          bow: '蝴蝶结',
          collar: '项圈',
          scarf: '围巾',
          glasses: '眼镜',
          flower: '小花',
          toy: '玩具',
          book: '书本'
        };
        return accMap[acc] || acc;
      }).join('、');
      
      description += `，戴着${accessoryDesc}`;
    }
    
    return description;
  }

  /**
   * 获取成长阶段描述
   * @param {number} stage - 成长阶段 (1-7)
   * @returns {string} 阶段描述
   */
  static getStageDescription(stage) {
    const descriptions = [
      '', // 0 - 不使用
      '刚刚出生，充满好奇', // 1
      '开始探索世界', // 2
      '变得更加活泼', // 3
      '学会了新技能', // 4
      '越来越自信', // 5
      '已经很成熟了', // 6
      '完全成长，准备毕业' // 7
    ];
    
    return descriptions[stage] || '正在成长中';
  }
}

// 导出到全局作用域
window.AnimalSystem = AnimalSystem;