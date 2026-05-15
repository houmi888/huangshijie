import { getSupabase } from './supabase'

// ============================================
// 用户行为追踪系统
// ============================================

interface ClickData {
  button_name: string
  button_type: string
  target_url: string | null
  page_url: string
  page_title: string
  referrer: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
  user_agent: string
  device_type: string
  browser: string
  os: string
  screen_width: number
  screen_height: number
  session_id: string
  visitor_id: string
}

// ---------- 设备检测 ----------

function getDeviceType(): string {
  const width = window.innerWidth
  const ua = navigator.userAgent.toLowerCase()
  if (/mobile|android|iphone|ipod|blackberry|windows phone/.test(ua) || width <= 768) {
    return 'mobile'
  }
  if (/ipad|tablet/.test(ua) || (width > 768 && width <= 1024)) {
    return 'tablet'
  }
  return 'desktop'
}

function getBrowser(): string {
  const ua = navigator.userAgent
  if (ua.includes('Firefox/')) return 'Firefox'
  if (ua.includes('Edg/')) return 'Edge'
  if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera'
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome'
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari'
  if (ua.includes('MSIE') || ua.includes('Trident/')) return 'IE'
  return 'Unknown'
}

function getOS(): string {
  const ua = navigator.userAgent
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac OS')) return 'macOS'
  if (ua.includes('Linux') && !ua.includes('Android')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS'
  return 'Unknown'
}

// ---------- 来源智能分析 ----------

interface SourceInfo {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
  referrer: string | null
}

function analyzeSource(): SourceInfo {
  const params = new URLSearchParams(window.location.search)

  // 优先级1：UTM参数
  const utm_source = params.get('utm_source')
  const utm_medium = params.get('utm_medium')
  const utm_campaign = params.get('utm_campaign')
  const utm_term = params.get('utm_term')
  const utm_content = params.get('utm_content')

  if (utm_source) {
    return { utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer: document.referrer || null }
  }

  // 优先级2：分析 referrer 域名
  const referrer = document.referrer
  if (referrer) {
    try {
      const refUrl = new URL(referrer)
      const refHost = refUrl.hostname.toLowerCase()

      // 搜索引擎识别
      const searchEngines: Record<string, string> = {
        'google': 'google',
        'bing': 'bing',
        'baidu': 'baidu',
        'sogou': 'sogou',
        'so.com': '360search',
        'yahoo': 'yahoo',
        'duckduckgo': 'duckduckgo',
      }
      for (const [key, name] of Object.entries(searchEngines)) {
        if (refHost.includes(key)) {
          return {
            utm_source: name,
            utm_medium: 'organic',
            utm_campaign: null,
            utm_term: null,
            utm_content: null,
            referrer,
          }
        }
      }

      // 社交平台识别
      const socialPlatforms: Record<string, string> = {
        'weibo': 'weibo',
        'weixin': 'wechat',
        'qq.com': 'qq',
        'douyin': 'douyin',
        'tiktok': 'tiktok',
        'facebook': 'facebook',
        'instagram': 'instagram',
        'twitter': 'twitter',
        'x.com': 'twitter',
        'linkedin': 'linkedin',
        'xiaohongshu': 'xiaohongshu',
        'zhihu': 'zhihu',
        'bilibili': 'bilibili',
      }
      for (const [key, name] of Object.entries(socialPlatforms)) {
        if (refHost.includes(key)) {
          return {
            utm_source: name,
            utm_medium: 'social',
            utm_campaign: null,
            utm_term: null,
            utm_content: null,
            referrer,
          }
        }
      }

      // 其他来源
      return {
        utm_source: refHost,
        utm_medium: 'referral',
        utm_campaign: null,
        utm_term: null,
        utm_content: null,
        referrer,
      }
    } catch {
      // referrer 解析失败
    }
  }

  // 优先级3：直接访问
  return {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
    referrer: null,
  }
}

// ---------- 会话管理 ----------

function getSessionId(): string {
  let id = sessionStorage.getItem('xj_session_id')
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem('xj_session_id', id)
  }
  return id
}

function getVisitorId(): string {
  let id = localStorage.getItem('xj_visitor_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('xj_visitor_id', id)
  }
  return id
}

// ---------- 数据上报队列 ----------

let reportQueue: ClickData[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null
const FLUSH_INTERVAL = 2000 // 2秒批量上报
const MAX_QUEUE_SIZE = 5    // 队列满5条立即上报

async function flushQueue() {
  if (reportQueue.length === 0) return

  const batch = [...reportQueue]
  reportQueue = []

  const supabase = getSupabase()
  if (!supabase) {
    // Supabase 未配置，仅打印日志
    console.log('[Tracker] Supabase 未配置，点击数据:', batch.length, '条')
    return
  }

  try {
    const { error } = await supabase
      .from('button_clicks')
      .insert(batch)

    if (error) {
      console.warn('[Tracker] 上报失败，数据已缓存:', error.message)
      const failed = JSON.parse(localStorage.getItem('xj_failed_reports') || '[]')
      failed.push(...batch)
      if (failed.length > 100) failed.splice(0, failed.length - 100)
      localStorage.setItem('xj_failed_reports', JSON.stringify(failed))
    }
  } catch (err) {
    console.warn('[Tracker] 网络错误:', err)
  }
}

function scheduleFlush() {
  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = setTimeout(flushQueue, FLUSH_INTERVAL)
}

// 页面卸载前清空队列
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushQueue()
    }
  })

  window.addEventListener('beforeunload', () => {
    flushQueue()
  })
}

// ---------- 重试失败的上报 ----------

async function retryFailedReports() {
  const failed = JSON.parse(localStorage.getItem('xj_failed_reports') || '[]')
  if (failed.length === 0) return

  const supabase = getSupabase()
  if (!supabase) return

  localStorage.removeItem('xj_failed_reports')

  try {
    const { error } = await supabase
      .from('button_clicks')
      .insert(failed)

    if (error) {
      localStorage.setItem('xj_failed_reports', JSON.stringify(failed))
    }
  } catch {
    localStorage.setItem('xj_failed_reports', JSON.stringify(failed))
  }
}

// 页面加载后3秒重试
if (typeof window !== 'undefined') {
  setTimeout(retryFailedReports, 3000)
}

// ---------- 公共API ----------

/**
 * 追踪按钮点击
 * @param buttonName 按钮名称（如"添加微信"）
 * @param buttonType 按钮类型（如"cta"、"nav"、"footer"）
 * @param targetUrl 目标链接（可选）
 */
export function trackClick(buttonName: string, buttonType: string, targetUrl?: string) {
  if (typeof window === 'undefined') return

  const source = analyzeSource()

  const data: ClickData = {
    button_name: buttonName,
    button_type: buttonType,
    target_url: targetUrl || null,
    page_url: window.location.href,
    page_title: document.title,
    referrer: source.referrer,
    utm_source: source.utm_source,
    utm_medium: source.utm_medium,
    utm_campaign: source.utm_campaign,
    utm_term: source.utm_term,
    utm_content: source.utm_content,
    user_agent: navigator.userAgent,
    device_type: getDeviceType(),
    browser: getBrowser(),
    os: getOS(),
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    session_id: getSessionId(),
    visitor_id: getVisitorId(),
  }

  // 入队
  reportQueue.push(data)

  // 队列满则立即上报，否则延迟批量上报
  if (reportQueue.length >= MAX_QUEUE_SIZE) {
    flushQueue()
  } else {
    scheduleFlush()
  }
}

/**
 * 追踪按钮点击并跳转
 * 异步上报，不阻塞跳转
 */
export function trackAndNavigate(buttonName: string, buttonType: string, targetUrl: string) {
  trackClick(buttonName, buttonType, targetUrl)
  if (targetUrl) {
    // 异步跳转，给追踪数据入队留时间
    setTimeout(() => {
      window.open(targetUrl, '_blank')
    }, 50)
  }
}
