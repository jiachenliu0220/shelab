-- 打工人启动助手 Supabase 数据库架构
-- 请在 Supabase SQL 编辑器中执行以下 SQL 语句

-- 1. API配置表 (存储用户的API配置信息)
CREATE TABLE IF NOT EXISTS api_configs (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    api_url TEXT NOT NULL,
    api_key TEXT NOT NULL, -- 注意：在生产环境中应该加密存储
    model_name TEXT NOT NULL DEFAULT 'gpt-3.5-turbo',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id) -- 每个用户只能有一个API配置
);

-- 为 user_id 创建索引
CREATE INDEX IF NOT EXISTS idx_api_configs_user_id ON api_configs(user_id);

-- 2. 聊天消息表
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为 user_id 和 timestamp 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_timestamp ON chat_messages(user_id, timestamp DESC);

-- 3. 启用行级安全策略（RLS）
ALTER TABLE api_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. 创建安全策略（允许所有操作，因为我们使用简单的用户标识）
-- 注意：在生产环境中，你可能需要更严格的安全策略

-- API配置表策略
CREATE POLICY "Allow all operations on api_configs" ON api_configs
    FOR ALL USING (true) WITH CHECK (true);

-- 聊天消息表策略
CREATE POLICY "Allow all operations on chat_messages" ON chat_messages
    FOR ALL USING (true) WITH CHECK (true);

-- 5. 创建更新时间戳的函数和触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 api_configs 表添加自动更新时间戳的触发器
CREATE TRIGGER update_api_configs_updated_at 
    BEFORE UPDATE ON api_configs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. 插入示例数据（可选，用于测试）
-- 注意：请不要在生产环境中使用这些示例数据

-- INSERT INTO api_configs (user_id, api_url, api_key, model_name) VALUES 
-- ('demo_user', 'https://api.openai.com/v1/chat/completions', 'demo_key', 'gpt-3.5-turbo');

-- INSERT INTO chat_messages (user_id, role, content) VALUES 
-- ('demo_user', 'assistant', '你好！我是你的温柔启动助手 🌸');

-- 7. 创建视图（可选）- 用于查询用户的最新聊天记录
CREATE OR REPLACE VIEW user_recent_messages AS
SELECT 
    user_id,
    role,
    content,
    timestamp,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY timestamp DESC) as message_rank
FROM chat_messages
WHERE timestamp >= NOW() - INTERVAL '7 days'; -- 只显示最近7天的消息

-- 8. 创建函数 - 清除用户的聊天历史
CREATE OR REPLACE FUNCTION clear_user_chat_history(p_user_id TEXT)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM chat_messages WHERE user_id = p_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 9. 创建函数 - 获取用户的聊天统计
CREATE OR REPLACE FUNCTION get_user_chat_stats(p_user_id TEXT)
RETURNS TABLE(
    total_messages INTEGER,
    user_messages INTEGER,
    assistant_messages INTEGER,
    first_message_date TIMESTAMPTZ,
    last_message_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_messages,
        COUNT(CASE WHEN role = 'user' THEN 1 END)::INTEGER as user_messages,
        COUNT(CASE WHEN role = 'assistant' THEN 1 END)::INTEGER as assistant_messages,
        MIN(timestamp) as first_message_date,
        MAX(timestamp) as last_message_date
    FROM chat_messages 
    WHERE chat_messages.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 完成提示
-- 数据库架构创建完成！
-- 
-- 使用说明：
-- 1. 在你的前端代码中配置 SUPABASE_URL 和 SUPABASE_PUBLISHABLE_KEY
-- 2. 用户首次使用时会被要求配置API信息，这些信息会存储在 api_configs 表中
-- 3. 所有聊天消息会存储在 chat_messages 表中
-- 4. 每个用户通过 user_id 进行区分（在前端自动生成）
--
-- 安全注意事项：
-- - API密钥以明文形式存储，在生产环境中应该考虑加密
-- - 当前的RLS策略允许所有操作，你可能需要根据实际需求调整
-- - 建议定期备份数据库
--
-- 可选的管理查询：
-- - 查看所有用户：SELECT DISTINCT user_id FROM chat_messages;
-- - 查看用户聊天统计：SELECT * FROM get_user_chat_stats('your_user_id');
-- - 清除用户聊天记录：SELECT clear_user_chat_history('your_user_id');