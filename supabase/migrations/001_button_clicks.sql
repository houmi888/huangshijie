-- ============================================
-- 小鸡AI - 按钮点击追踪系统
-- ============================================

-- 1. 创建主表：button_clicks
CREATE TABLE IF NOT EXISTS public.button_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    -- 按钮信息
    button_name TEXT NOT NULL,           -- 按钮名称（如：添加微信、添加WhatsApp）
    button_type TEXT NOT NULL,           -- 按钮类型（如：cta、nav、footer）
    target_url TEXT,                     -- 目标链接
    -- 页面信息
    page_url TEXT,                       -- 当前页面URL
    page_title TEXT,                     -- 页面标题
    -- 来源分析
    referrer TEXT,                       -- 来源页面
    utm_source TEXT,                     -- UTM来源
    utm_medium TEXT,                     -- UTM媒介
    utm_campaign TEXT,                   -- UTM活动
    utm_term TEXT,                       -- UTM关键词
    utm_content TEXT,                    -- UTM内容
    -- 设备信息
    user_agent TEXT,                     -- 浏览器UA
    device_type TEXT,                    -- 设备类型（mobile/desktop/tablet）
    browser TEXT,                        -- 浏览器名称
    os TEXT,                             -- 操作系统
    screen_width INTEGER,               -- 屏幕宽度
    screen_height INTEGER,              -- 屏幕高度
    -- 地理信息（可选，由后端填充）
    ip_address INET,                    -- IP地址
    country TEXT,                        -- 国家
    city TEXT,                           -- 城市
    -- 时间
    clicked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- 会话
    session_id TEXT,                     -- 会话ID（前端生成）
    visitor_id TEXT                      -- 访客ID（持久化标识）
);

-- 2. 创建索引以优化查询性能
CREATE INDEX idx_button_clicks_clicked_at ON public.button_clicks (clicked_at DESC);
CREATE INDEX idx_button_clicks_button_name ON public.button_clicks (button_name);
CREATE INDEX idx_button_clicks_button_type ON public.button_clicks (button_type);
CREATE INDEX idx_button_clicks_device_type ON public.button_clicks (device_type);
CREATE INDEX idx_button_clicks_utm_source ON public.button_clicks (utm_source);
CREATE INDEX idx_button_clicks_page_url ON public.button_clicks (page_url);

-- 3. 视图：每日统计
CREATE OR REPLACE VIEW public.v_daily_stats AS
SELECT
    DATE(clicked_at) AS click_date,
    button_name,
    button_type,
    COUNT(*) AS click_count,
    COUNT(DISTINCT visitor_id) AS unique_visitors,
    COUNT(DISTINCT session_id) AS unique_sessions
FROM public.button_clicks
GROUP BY DATE(clicked_at), button_name, button_type
ORDER BY click_date DESC, click_count DESC;

-- 4. 视图：按钮排行榜
CREATE OR REPLACE VIEW public.v_button_leaderboard AS
SELECT
    button_name,
    button_type,
    target_url,
    COUNT(*) AS total_clicks,
    COUNT(DISTINCT visitor_id) AS unique_visitors,
    COUNT(DISTINCT session_id) AS unique_sessions,
    MIN(clicked_at) AS first_click,
    MAX(clicked_at) AS last_click
FROM public.button_clicks
GROUP BY button_name, button_type, target_url
ORDER BY total_clicks DESC;

-- 5. 视图：来源统计
CREATE OR REPLACE VIEW public.v_source_stats AS
SELECT
    COALESCE(utm_source, 'direct') AS source,
    COALESCE(utm_medium, 'none') AS medium,
    utm_campaign AS campaign,
    COUNT(*) AS click_count,
    COUNT(DISTINCT visitor_id) AS unique_visitors,
    COUNT(DISTINCT session_id) AS unique_sessions,
    COUNT(DISTINCT button_name) AS buttons_clicked
FROM public.button_clicks
GROUP BY utm_source, utm_medium, utm_campaign
ORDER BY click_count DESC;

-- 6. 视图：设备统计
CREATE OR REPLACE VIEW public.v_device_stats AS
SELECT
    device_type,
    browser,
    os,
    COUNT(*) AS click_count,
    COUNT(DISTINCT visitor_id) AS unique_visitors
FROM public.button_clicks
GROUP BY device_type, browser, os
ORDER BY click_count DESC;

-- ============================================
-- RLS（行级安全策略）
-- ============================================

-- 启用 RLS
ALTER TABLE public.button_clicks ENABLE ROW LEVEL SECURITY;

-- 策略1：允许匿名用户插入（上报点击数据）
CREATE POLICY "允许匿名插入点击数据"
    ON public.button_clicks
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 策略2：只允许认证用户查看数据
CREATE POLICY "仅认证用户可查看点击数据"
    ON public.button_clicks
    FOR SELECT
    TO authenticated
    USING (true);

-- 视图的访问控制（通过授权）
GRANT SELECT ON public.v_daily_stats TO authenticated;
GRANT SELECT ON public.v_button_leaderboard TO authenticated;
GRANT SELECT ON public.v_source_stats TO authenticated;
GRANT SELECT ON public.v_device_stats TO authenticated;

-- 允许匿名用户对主表执行 INSERT
GRANT INSERT ON public.button_clicks TO anon;
GRANT INSERT ON public.button_clicks TO authenticated;
GRANT SELECT ON public.button_clicks TO authenticated;
