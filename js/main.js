// 应用主入口文件
(function() {
  'use strict';

  // 全局应用控制器实例
  let appController = null;

  /**
   * 应用初始化
   */
  async function initializeApp() {
    try {
      console.log('开始初始化打工人启动助手...');
      
      // 检查必要的依赖
      if (!checkDependencies()) {
        throw new Error('缺少必要的依赖');
      }
      
      // 创建应用控制器
      appController = new AppController();
      
      // 将控制器暴露到全局作用域（用于调试和组件间通信）
      window.appController = appController;
      
      // 初始化应用
      await appController.init();
      
      console.log('打工人启动助手初始化完成！');
      
    } catch (error) {
      console.error('应用初始化失败:', error);
      showInitializationError(error);
    }
  }

  /**
   * 检查必要的依赖
   */
  function checkDependencies() {
    const requiredClasses = [
      'DataManager',
      'DateManager', 
      'StateManager',
      'AnimalSystem',
      'AppController',
      'DemoModePanel'
    ];
    
    const requiredConstants = [
      'STORAGE_KEYS',
      'ROUTES',
      'DEFAULT_APP_STATE'
    ];
    
    // 检查类
    for (const className of requiredClasses) {
      if (!window[className]) {
        console.error(`缺少必要的类: ${className}`);
        return false;
      }
    }
    
    // 检查常量
    for (const constantName of requiredConstants) {
      if (!window[constantName]) {
        console.error(`缺少必要的常量: ${constantName}`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * 显示初始化错误
   */
  function showInitializationError(error) {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.innerHTML = `
        <div class="error-container text-center">
          <h2>😔 初始化失败</h2>
          <p>应用启动时遇到了问题，请尝试以下解决方案：</p>
          <ul style="text-align: left; max-width: 300px; margin: 0 auto;">
            <li>刷新页面重试</li>
            <li>清除浏览器缓存</li>
            <li>检查浏览器控制台错误信息</li>
          </ul>
          <button class="btn-primary mt-lg" onclick="location.reload()">
            刷新页面
          </button>
          <details class="mt-md">
            <summary>错误详情</summary>
            <pre style="text-align: left; font-size: 0.8rem; margin-top: 8px;">${error.message}</pre>
          </details>
        </div>
      `;
    }
  }

  /**
   * 处理未捕获的错误
   */
  function setupErrorHandling() {
    // 全局错误处理
    window.addEventListener('error', (event) => {
      console.error('全局错误:', event.error);
      
      if (appController) {
        appController.showError('发生了意外错误，请刷新页面重试');
      }
    });

    // Promise 拒绝处理
    window.addEventListener('unhandledrejection', (event) => {
      console.error('未处理的 Promise 拒绝:', event.reason);
      
      if (appController) {
        appController.showError('发生了意外错误，请刷新页面重试');
      }
    });
  }

  /**
   * 检查浏览器兼容性
   */
  function checkBrowserCompatibility() {
    // 检查 localStorage 支持
    if (!DataManager.isStorageAvailable()) {
      console.warn('localStorage 不可用，将使用内存存储');
    }
    
    // 检查基本的 ES6 特性
    try {
      // 测试箭头函数
      const testArrow = () => true;
      
      // 测试模板字符串
      const testTemplate = `test`;
      
      // 测试 const/let
      const testConst = 'test';
      let testLet = 'test';
      
      return true;
    } catch (error) {
      console.error('浏览器不支持必要的 JavaScript 特性');
      return false;
    }
  }

  /**
   * 显示加载状态
   */
  function showLoadingState() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.innerHTML = `
        <div class="loading text-center">
          <div class="loading-spinner">🌸</div>
          <p>正在温柔地准备中...</p>
        </div>
      `;
    }
  }

  /**
   * DOM 内容加载完成后的处理
   */
  function onDOMContentLoaded() {
    console.log('DOM 内容加载完成');
    
    // 显示加载状态
    showLoadingState();
    
    // 检查浏览器兼容性
    if (!checkBrowserCompatibility()) {
      showInitializationError(new Error('浏览器不兼容'));
      return;
    }
    
    // 设置错误处理
    setupErrorHandling();
    
    // 延迟一点时间再初始化，让用户看到加载状态
    setTimeout(initializeApp, 500);
  }

  /**
   * 页面完全加载后的处理
   */
  function onWindowLoad() {
    console.log('页面完全加载完成');
    
    // 可以在这里添加一些需要页面完全加载后才能执行的代码
    // 比如图片预加载、性能监控等
  }

  // 事件监听器设置
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
  } else {
    // DOM 已经加载完成
    onDOMContentLoaded();
  }

  window.addEventListener('load', onWindowLoad);

  // 导出一些有用的函数到全局作用域（用于调试）
  window.debugApp = {
    getAppController: () => appController,
    getState: () => appController?.getStateManager()?.getState(),
    clearData: () => {
      if (confirm('确定要清除所有数据吗？这个操作不可撤销。')) {
        DataManager.clearAll();
        location.reload();
      }
    },
    exportData: () => {
      const state = appController?.getStateManager()?.getState();
      if (state) {
        const dataStr = JSON.stringify(state, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `working-day-starter-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

})();