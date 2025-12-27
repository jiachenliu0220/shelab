// 动物园页面组件
class ZooPage {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }

  /**
   * 渲染动物园页面
   */
  render() {
    const currentAnimal = AnimalSystem.getCurrentAnimal();
    const zooAnimals = AnimalSystem.getZooAnimals();
    
    return `
      <div class="page-content">
        <div class="zoo-header text-center mb-lg">
          <h2>🦊 我的动物园</h2>
          <p class="encouraging-text">这里住着陪伴你成长的小伙伴们</p>
        </div>
        
        ${this.renderCurrentAnimal(currentAnimal)}
        ${this.renderZooHistory(zooAnimals)}
      </div>
    `;
  }

  /**
   * 渲染当前动物
   */
  renderCurrentAnimal(currentAnimal) {
    if (!currentAnimal) {
      return `
        <div class="current-animal mb-lg">
          <h3>本周小伙伴</h3>
          <div class="animal-card">
            <span class="animal-emoji large">🐾</span>
            <div class="animal-info">
              <p class="animal-name">还没有小伙伴</p>
              <p class="animal-description">完成周一冷启动来获得你的第一个小伙伴吧～</p>
            </div>
          </div>
        </div>
      `;
    }

    const animalOption = ANIMAL_OPTIONS.find(a => a.value === currentAnimal.type);
    const progressPercentage = Math.round((currentAnimal.stage / 7) * 100);
    
    return `
      <div class="current-animal mb-lg">
        <h3>本周小伙伴</h3>
        <div class="animal-card">
          <span class="animal-emoji large">${animalOption?.emoji || '🐾'}</span>
          <div class="animal-info">
            <p class="animal-name">${animalOption?.label || '小动物'}</p>
            <p class="animal-stage">成长阶段: ${currentAnimal.stage}/7 (${progressPercentage}%)</p>
            <p class="animal-description">${AnimalSystem.getStageDescription(currentAnimal.stage)}</p>
            <div class="animal-progress">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染动物园历史
   */
  renderZooHistory(zooAnimals) {
    return `
      <div class="zoo-history">
        <h3>历史伙伴 (${zooAnimals.length})</h3>
        ${zooAnimals.length > 0 ? 
          zooAnimals.map(animal => this.renderHistoryAnimal(animal)).join('') :
          '<p class="text-center text-muted">还没有历史伙伴，继续努力吧～</p>'
        }
      </div>
    `;
  }

  /**
   * 渲染历史动物卡片
   */
  renderHistoryAnimal(animal) {
    const animalOption = ANIMAL_OPTIONS.find(a => a.value === animal.type);
    const weekStart = new Date(animal.weekStart);
    
    return `
      <div class="animal-card history">
        <span class="animal-emoji">${animalOption?.emoji || '🐾'}</span>
        <div class="animal-info">
          <p class="animal-name">${animalOption?.label || '小动物'}</p>
          <p class="animal-summary">${animal.summary}</p>
          <p class="animal-date">${DateManager.formatDate(weekStart, { month: 'short', day: 'numeric' })}</p>
        </div>
      </div>
    `;
  }
}

// 导出到全局作用域
window.ZooPage = ZooPage;