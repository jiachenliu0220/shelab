// 应用常量定义

// 存储键名
const STORAGE_KEYS = {
  APP_STATE: 'workingDayStarter_appState',
  BACKUP: 'workingDayStarter_backup'
};

// 路由常量
const ROUTES = {
  DAILY: 'daily',
  MONDAY: 'monday',
  ZOO: 'zoo'
};

// 心情状态选项
const MOOD_OPTIONS = [
  { value: 'energetic', label: '挺有能量的，想做点事情', emoji: '✨', color: '#4CAF50' },
  { value: 'good', label: '状态还不错，能慢慢来', emoji: '🙂', color: '#8BC34A' },
  { value: 'neutral', label: '平平淡淡，没有太多感觉', emoji: '😐', color: '#FFC107' },
  { value: 'unmotivated', label: '提不起劲，什么都不太想做', emoji: '😔', color: '#FF9800' },
  { value: 'anxious', label: '有点焦虑，脑子停不下来', emoji: '😰', color: '#FF5722' },
  { value: 'tired', label: '有点累，但还能撑一撑', emoji: '😴', color: '#9E9E9E' }
];

// 自我关怀需求选项
const SELF_CARE_NEEDS = [
  { 
    value: 'rest', 
    label: '好好休息一下', 
    description: '睡够、别太逼自己',
    emoji: '😴',
    color: '#E1BEE7'
  },
  { 
    value: 'stress_relief', 
    label: '减少压力和焦虑', 
    description: '事情慢一点也没关系',
    emoji: '🌸',
    color: '#F8BBD9'
  },
  { 
    value: 'body_care', 
    label: '照顾身体状态', 
    description: '喝水、活动一下、别久坐',
    emoji: '💚',
    color: '#C8E6C9'
  },
  { 
    value: 'emotional_support', 
    label: '情绪被接住', 
    description: '被理解、不需要一直坚强',
    emoji: '🤗',
    color: '#FFCDD2'
  },
  { 
    value: 'control', 
    label: '找回一点掌控感', 
    description: '把事情理顺，而不是全堆在一起',
    emoji: '📋',
    color: '#DCEDC8'
  },
  { 
    value: 'rewards', 
    label: '给自己一些小奖励', 
    description: '做完就夸夸自己',
    emoji: '🎁',
    color: '#FFE0B2'
  }
];

// 动物类型选项 - 扩展到20个可爱的2D动物
const ANIMAL_OPTIONS = [
  { value: 'cat', label: '小猫咪', emoji: '🐱', style: 'cute' },
  { value: 'dog', label: '小狗狗', emoji: '🐶', style: 'loyal' },
  { value: 'rabbit', label: '小兔子', emoji: '🐰', style: 'gentle' },
  { value: 'fox', label: '小狐狸', emoji: '🦊', style: 'clever' },
  { value: 'bear', label: '小熊熊', emoji: '🐻', style: 'warm' },
  { value: 'panda', label: '小熊猫', emoji: '🐼', style: 'peaceful' },
  { value: 'hamster', label: '小仓鼠', emoji: '🐹', style: 'tiny' },
  { value: 'hedgehog', label: '小刺猬', emoji: '🦔', style: 'cozy' },
  { value: 'owl', label: '小猫头鹰', emoji: '🦉', style: 'wise' },
  { value: 'penguin', label: '小企鹅', emoji: '🐧', style: 'cool' },
  { value: 'koala', label: '小考拉', emoji: '🐨', style: 'sleepy' },
  { value: 'sloth', label: '小树懒', emoji: '🦥', style: 'chill' },
  { value: 'deer', label: '小鹿', emoji: '🦌', style: 'elegant' },
  { value: 'squirrel', label: '小松鼠', emoji: '🐿️', style: 'active' },
  { value: 'otter', label: '小水獭', emoji: '🦦', style: 'playful' },
  { value: 'seal', label: '小海豹', emoji: '🦭', style: 'smooth' },
  { value: 'duck', label: '小鸭子', emoji: '🦆', style: 'cheerful' },
  { value: 'chick', label: '小鸡仔', emoji: '🐣', style: 'fresh' },
  { value: 'turtle', label: '小乌龟', emoji: '🐢', style: 'steady' },
  { value: 'whale', label: '小鲸鱼', emoji: '🐋', style: 'majestic' }
];

// 基于心情和关怀需求的Self-care推荐映射
const SELF_CARE_RECOMMENDATIONS = {
  // 基于心情的推荐
  mood: {
    'energetic': ['exercise', 'creative', 'social', 'learning', 'organizing'],
    'good': ['exercise', 'nature', 'creative', 'social', 'meditation'],
    'neutral': ['gentle_movement', 'music', 'nature', 'creative', 'reading'],
    'unmotivated': ['gentle_movement', 'music', 'comfort', 'small_wins', 'rest'],
    'anxious': ['breathing', 'meditation', 'nature', 'gentle_movement', 'comfort'],
    'tired': ['rest', 'hydration', 'gentle_movement', 'comfort', 'early_sleep']
  },
  // 基于关怀需求的推荐
  needs: {
    'rest': ['nap', 'early_sleep', 'comfortable_space', 'gentle_stretching', 'no_pressure'],
    'stress_relief': ['breathing', 'meditation', 'slow_walk', 'music', 'declutter'],
    'body_care': ['hydration', 'stretching', 'posture_check', 'healthy_snack', 'movement_break'],
    'emotional_support': ['journaling', 'self_compassion', 'comfort_item', 'gentle_talk', 'hug'],
    'control': ['small_organizing', 'priority_list', 'one_thing', 'declutter', 'planning'],
    'rewards': ['small_treat', 'praise_self', 'favorite_activity', 'celebration', 'gratitude']
  }
};

// 具体的Self-care活动选项
const SELF_CARE_ACTIVITIES = {
  // 身体关怀
  'exercise': { label: '适度运动', emoji: '🏃‍♀️', category: 'body' },
  'gentle_movement': { label: '轻柔活动', emoji: '🚶‍♀️', category: 'body' },
  'stretching': { label: '伸展身体', emoji: '🤸‍♀️', category: 'body' },
  'hydration': { label: '多喝水', emoji: '💧', category: 'body' },
  'healthy_snack': { label: '健康小食', emoji: '🍎', category: 'body' },
  'posture_check': { label: '调整坐姿', emoji: '🪑', category: 'body' },
  'movement_break': { label: '活动休息', emoji: '⏰', category: 'body' },
  
  // 心理关怀
  'meditation': { label: '冥想放松', emoji: '🧘‍♀️', category: 'mind' },
  'breathing': { label: '深呼吸', emoji: '🌬️', category: 'mind' },
  'journaling': { label: '写写想法', emoji: '📝', category: 'mind' },
  'self_compassion': { label: '对自己温柔', emoji: '💝', category: 'mind' },
  'gratitude': { label: '感恩练习', emoji: '🙏', category: 'mind' },
  
  // 环境关怀
  'nature': { label: '亲近自然', emoji: '🌿', category: 'environment' },
  'declutter': { label: '整理空间', emoji: '✨', category: 'environment' },
  'comfortable_space': { label: '营造舒适空间', emoji: '🏠', category: 'environment' },
  'music': { label: '听喜欢的音乐', emoji: '🎵', category: 'environment' },
  
  // 休息关怀
  'rest': { label: '充分休息', emoji: '😴', category: 'rest' },
  'nap': { label: '小憩一会', emoji: '💤', category: 'rest' },
  'early_sleep': { label: '早点睡觉', emoji: '🌙', category: 'rest' },
  'no_pressure': { label: '不给自己压力', emoji: '🕊️', category: 'rest' },
  
  // 创造和学习
  'creative': { label: '创意表达', emoji: '🎨', category: 'growth' },
  'reading': { label: '阅读', emoji: '📚', category: 'growth' },
  'learning': { label: '学点新东西', emoji: '💡', category: 'growth' },
  
  // 社交关怀
  'social': { label: '联系朋友', emoji: '👥', category: 'social' },
  'gentle_talk': { label: '温柔的对话', emoji: '💬', category: 'social' },
  'hug': { label: '拥抱', emoji: '🤗', category: 'social' },
  
  // 奖励关怀
  'small_treat': { label: '小小奖励', emoji: '🍰', category: 'reward' },
  'praise_self': { label: '夸夸自己', emoji: '👏', category: 'reward' },
  'favorite_activity': { label: '做喜欢的事', emoji: '❤️', category: 'reward' },
  'celebration': { label: '小小庆祝', emoji: '🎉', category: 'reward' },
  
  // 掌控感
  'small_organizing': { label: '整理小事', emoji: '📋', category: 'control' },
  'priority_list': { label: '列优先级', emoji: '📝', category: 'control' },
  'one_thing': { label: '专注一件事', emoji: '🎯', category: 'control' },
  'planning': { label: '简单规划', emoji: '📅', category: 'control' },
  
  // 舒适关怀
  'comfort': { label: '寻求舒适', emoji: '🛋️', category: 'comfort' },
  'comfort_item': { label: '舒适物品', emoji: '🧸', category: 'comfort' },
  'slow_walk': { label: '慢慢散步', emoji: '🚶‍♀️', category: 'comfort' },
  'small_wins': { label: '小小成就', emoji: '⭐', category: 'comfort' }
};

// 动物外观属性
const ANIMAL_APPEARANCE = {
  sizes: ['tiny', 'small', 'medium', 'large'],
  colors: {
    cat: ['orange', 'black', 'white', 'gray', 'calico'],
    dog: ['golden', 'brown', 'black', 'white', 'spotted'],
    rabbit: ['white', 'brown', 'gray', 'black'],
    fox: ['red', 'silver', 'arctic'],
    bear: ['brown', 'black', 'honey'],
    panda: ['classic'] // 熊猫只有经典黑白色
  },
  accessories: [
    'hat', 'bow', 'collar', 'scarf', 'glasses', 'flower', 'toy', 'book'
  ]
};

// 鼓励性文案
const ENCOURAGING_MESSAGES = {
  welcome: [
    '欢迎回来！今天也要温柔地对待自己哦～',
    '新的一天开始了，让我们一起慢慢来吧',
    '你已经很棒了，今天只需要做你能做的就好',
    '深呼吸，今天也是充满可能性的一天'
  ],
  monday: [
    '新的一周开始了！回来就已经很好了',
    '周一快乐！让我们温柔地开始这一周',
    '不用着急，慢慢找回节奏就好',
    '你已经迈出了重要的第一步'
  ],
  completion: [
    '太棒了！你完成了今天的启动',
    '做得很好！今天已经是一个好的开始',
    '你真的很用心，继续保持这份温柔',
    '完美！今天的你已经足够好了'
  ],
  weeklyReflection: [
    '这一周你温柔地对待了自己，真的很棒！',
    '每一个小小的努力都值得被看见和珍惜',
    '你的坚持让小动物也感到很开心呢',
    '这一周的成长都被记录在心里了'
  ]
};

// 默认应用状态
const DEFAULT_APP_STATE = {
  demoMode: {
    enabled: false,
    virtualDate: null
  },
  user: {
    createdAt: new Date().toISOString(),
    currentWeekStart: null
  },
  currentWeek: {
    weekStart: null,
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
  },
  weekHistory: [],
  settings: {
    theme: 'light',
    language: 'zh-CN',
    notifications: false
  }
};

// 日期格式化选项
const DATE_FORMAT_OPTIONS = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

// 导出到全局作用域（因为使用原生JS）
window.STORAGE_KEYS = STORAGE_KEYS;
window.ROUTES = ROUTES;
window.MOOD_OPTIONS = MOOD_OPTIONS;
window.SELF_CARE_NEEDS = SELF_CARE_NEEDS;
window.SELF_CARE_ACTIVITIES = SELF_CARE_ACTIVITIES;
window.SELF_CARE_RECOMMENDATIONS = SELF_CARE_RECOMMENDATIONS;
window.ANIMAL_OPTIONS = ANIMAL_OPTIONS;
window.ANIMAL_APPEARANCE = ANIMAL_APPEARANCE;
window.ENCOURAGING_MESSAGES = ENCOURAGING_MESSAGES;
window.DEFAULT_APP_STATE = DEFAULT_APP_STATE;
window.DATE_FORMAT_OPTIONS = DATE_FORMAT_OPTIONS;