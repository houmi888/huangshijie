'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getSupabase } from '@/lib/supabase'
import {
  BarChart3, MousePointerClick, Users, Globe, Monitor,
  RefreshCw, LogIn, LogOut, TrendingUp, Calendar, Eye,
  FileText, Filter, ChevronDown, ArrowUpRight, ArrowDownRight,
  MessageCircle
} from 'lucide-react'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { format, subDays, isWithinInterval, parseISO } from 'date-fns'

interface RawClick {
  id: string
  button_name: string
  button_type: string
  target_url: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  device_type: string | null
  browser: string | null
  os: string | null
  visitor_id: string | null
  session_id: string | null
  clicked_at: string
}

interface DailyStat {
  click_date: string
  button_name: string
  button_type: string
  click_count: number
  unique_visitors: number
  unique_sessions: number
}

interface LeaderboardItem {
  button_name: string
  button_type: string
  target_url: string
  total_clicks: number
  unique_visitors: number
  unique_sessions: number
  first_click: string
  last_click: string
}

interface SourceStat {
  source: string
  medium: string
  campaign: string | null
  click_count: number
  unique_visitors: number
  unique_sessions: number
  buttons_clicked: number
}

interface DeviceStat {
  device_type: string
  browser: string
  os: string
  click_count: number
  unique_visitors: number
}

// 图表颜色
const COLORS = ['#39FF14', '#00F5FF', '#0EA5E9', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#10B981']

type Tab = 'overview' | 'trend' | 'source' | 'device' | 'operator' | 'contact'
type DateRange = '7d' | '14d' | '30d' | '90d' | 'all'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const [rawClicks, setRawClicks] = useState<RawClick[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([])
  const [sourceStats, setSourceStats] = useState<SourceStat[]>([])
  const [deviceStats, setDeviceStats] = useState<DeviceStat[]>([])
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // 筛选
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [operatorFilter, setOperatorFilter] = useState<string>('all')

  // 检查登录状态
  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
      if (session) fetchAllData()
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })
    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthError('')
    const supabase = getSupabase()
    if (!supabase) { setAuthError('Supabase 未配置'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setAuthError(error.message) } else { setIsLoggedIn(true); fetchAllData() }
  }

  async function handleLogout() {
    const supabase = getSupabase()
    if (!supabase) return
    await supabase.auth.signOut()
    setIsLoggedIn(false)
  }

  const fetchAllData = useCallback(async () => {
    const supabase = getSupabase()
    if (!supabase) return
    setLoading(true)
    const [lb, ds, ss, dvs, raw] = await Promise.all([
      supabase.from('v_button_leaderboard').select('*').limit(20),
      supabase.from('v_daily_stats').select('*').limit(200),
      supabase.from('v_source_stats').select('*').limit(50),
      supabase.from('v_device_stats').select('*').limit(50),
      supabase.from('button_clicks').select('*').order('clicked_at', { ascending: false }).limit(2000),
    ])
    if (lb.data) setLeaderboard(lb.data)
    if (ds.data) setDailyStats(ds.data)
    if (ss.data) setSourceStats(ss.data)
    if (dvs.data) setDeviceStats(dvs.data)
    if (raw.data) setRawClicks(raw.data)
    setLastRefresh(new Date())
    setLoading(false)
  }, [])

  // 日期筛选
  const dateFilteredClicks = useMemo(() => {
    if (dateRange === 'all') return rawClicks
    const days = { '7d': 7, '14d': 14, '30d': 30, '90d': 90 }[dateRange]
    const start = subDays(new Date(), days)
    return rawClicks.filter(c => {
      try { return isWithinInterval(parseISO(c.clicked_at), { start, end: new Date() }) } catch { return false }
    })
  }, [rawClicks, dateRange])

  // 运营人员筛选（按 utm_campaign 区分运营人员）
  const operators = useMemo(() => {
    const set = new Set<string>()
    rawClicks.forEach(c => { if (c.utm_campaign) set.add(c.utm_campaign) })
    return Array.from(set).sort()
  }, [rawClicks])

  const filteredClicks = useMemo(() => {
    if (operatorFilter === 'all') return dateFilteredClicks
    return dateFilteredClicks.filter(c => c.utm_campaign === operatorFilter)
  }, [dateFilteredClicks, operatorFilter])

  // 计算统计
  const totalClicks = filteredClicks.length
  const totalVisitors = new Set(filteredClicks.map(c => c.visitor_id).filter(Boolean)).size
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayClicks = filteredClicks.filter(c => c.clicked_at.startsWith(today)).length
  const todayVisitors = new Set(filteredClicks.filter(c => c.clicked_at.startsWith(today)).map(c => c.visitor_id).filter(Boolean)).size

  // 昨日对比
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
  const yesterdayClicks = filteredClicks.filter(c => c.clicked_at.startsWith(yesterday)).length
  const clicksChange = yesterdayClicks > 0 ? ((todayClicks - yesterdayClicks) / yesterdayClicks * 100) : 0

  // 趋势数据（按天聚合）
  const trendData = useMemo(() => {
    const map = new Map<string, { date: string; clicks: number; visitors: Set<string> }>()
    filteredClicks.forEach(c => {
      const date = c.clicked_at.split('T')[0]
      if (!map.has(date)) map.set(date, { date, clicks: 0, visitors: new Set() })
      const d = map.get(date)!
      d.clicks++
      if (c.visitor_id) d.visitors.add(c.visitor_id)
    })
    return Array.from(map.values())
      .map(d => ({ date: d.date, clicks: d.clicks, visitors: d.visitors.size }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredClicks])

  // 按钮分布（饼图）
  const buttonPieData = useMemo(() => {
    const map = new Map<string, number>()
    filteredClicks.forEach(c => map.set(c.button_name, (map.get(c.button_name) || 0) + 1))
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [filteredClicks])

  // 设备分布（环形图）
  const devicePieData = useMemo(() => {
    const map = new Map<string, number>()
    filteredClicks.forEach(c => {
      const dt = c.device_type || 'unknown'
      map.set(dt, (map.get(dt) || 0) + 1)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [filteredClicks])

  // 运营人员统计
  const operatorStats = useMemo(() => {
    const map = new Map<string, { clicks: number; visitors: Set<string>; buttons: Set<string> }>()
    dateFilteredClicks.forEach(c => {
      const op = c.utm_campaign || '(无标记)'
      if (!map.has(op)) map.set(op, { clicks: 0, visitors: new Set(), buttons: new Set() })
      const d = map.get(op)!
      d.clicks++
      if (c.visitor_id) d.visitors.add(c.visitor_id)
      d.buttons.add(c.button_name)
    })
    return Array.from(map.entries())
      .map(([name, d]) => ({ name, clicks: d.clicks, visitors: d.visitors.size, buttons: d.buttons.size }))
      .sort((a, b) => b.clicks - a.clicks)
  }, [dateFilteredClicks])

  // 联系方式统计
  const contactStats = useMemo(() => {
    const map = new Map<string, { clicks: number; visitors: Set<string>; url: string }>()
    filteredClicks.filter(c => c.button_type === 'cta' && c.target_url).forEach(c => {
      const key = c.button_name
      if (!map.has(key)) map.set(key, { clicks: 0, visitors: new Set(), url: c.target_url! })
      const d = map.get(key)!
      d.clicks++
      if (c.visitor_id) d.visitors.add(c.visitor_id)
    })
    return Array.from(map.entries())
      .map(([name, d]) => ({ name, clicks: d.clicks, visitors: d.visitors.size, url: d.url }))
      .sort((a, b) => b.clicks - a.clicks)
  }, [filteredClicks])

  // 导出 CSV
  const exportCSV = useCallback(() => {
    const headers = ['时间', '按钮名称', '类型', '目标链接', '来源', '媒介', '活动', '设备', '浏览器', '系统']
    const rows = filteredClicks.map(c => [
      c.clicked_at, c.button_name, c.button_type, c.target_url || '',
      c.utm_source || '', c.utm_medium || '', c.utm_campaign || '',
      c.device_type || '', c.browser || '', c.os || ''
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `clicks-${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click()
    URL.revokeObjectURL(url)
  }, [filteredClicks])

  // ====== 登录页 ======
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🐔</span>
            </div>
            <h1 className="text-xl font-bold text-white">小鸡AI 数据中心</h1>
            <p className="text-gray-500 text-sm mt-1">请登录查看数据</p>
          </div>
          <form onSubmit={handleLogin} className="glass rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">邮箱</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white text-sm focus:border-neon-green/50 focus:outline-none transition-colors"
                placeholder="admin@example.com" required />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">密码</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white text-sm focus:border-neon-green/50 focus:outline-none transition-colors"
                placeholder="••••••••" required />
            </div>
            {authError && <p className="text-red-400 text-xs">{authError}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-green to-neon-cyan text-dark-900 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              <LogIn className="w-4 h-4" /> {loading ? '登录中...' : '登录'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ====== 仪表盘 ======
  return (
    <div className="min-h-screen bg-dark-900 bg-grid">
      {/* 顶栏 */}
      <header className="sticky top-0 z-50 glass-strong border-b border-white/5 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">🐔</span>
            <h1 className="text-sm font-bold text-white">数据分析中心</h1>
            <a href="/admin/content" className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-lg bg-dark-700 border border-white/5 text-[10px] text-gray-400 hover:text-white transition-colors">
              <FileText className="w-3 h-3" /> 内容管理
            </a>
          </div>
          <div className="flex items-center gap-2">
            {/* 日期筛选 */}
            <div className="relative">
              <select value={dateRange} onChange={e => setDateRange(e.target.value as DateRange)}
                className="appearance-none px-3 py-1.5 pr-7 rounded-lg bg-dark-700 border border-white/10 text-xs text-gray-300 focus:outline-none focus:border-neon-green/30">
                <option value="7d">近 7 天</option>
                <option value="14d">近 14 天</option>
                <option value="30d">近 30 天</option>
                <option value="90d">近 90 天</option>
                <option value="all">全部</option>
              </select>
              <ChevronDown className="w-3 h-3 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {/* 运营人员筛选 */}
            {operators.length > 0 && (
              <div className="relative hidden sm:block">
                <select value={operatorFilter} onChange={e => setOperatorFilter(e.target.value)}
                  className="appearance-none px-3 py-1.5 pr-7 rounded-lg bg-dark-700 border border-white/10 text-xs text-gray-300 focus:outline-none focus:border-neon-green/30">
                  <option value="all">全部人员</option>
                  {operators.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
                <Filter className="w-3 h-3 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
            <button onClick={exportCSV} className="p-1.5 rounded-lg bg-dark-700 border border-white/10 text-gray-400 hover:text-neon-green transition-colors" title="导出CSV">
              <FileText className="w-4 h-4" />
            </button>
            <button onClick={fetchAllData} disabled={loading} className="p-1.5 rounded-lg bg-dark-700 border border-white/10 text-gray-400 hover:text-neon-green transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={handleLogout} className="p-1.5 rounded-lg bg-dark-700 border border-white/10 text-gray-400 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        {lastRefresh && <p className="max-w-7xl mx-auto text-[10px] text-gray-600 mt-1">上次刷新: {lastRefresh.toLocaleTimeString()}</p>}
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 核心指标 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={<MousePointerClick className="w-4 h-4" />} label="总点击" value={totalClicks} color="green" />
          <StatCard icon={<Users className="w-4 h-4" />} label="独立访客" value={totalVisitors} color="cyan" />
          <StatCard icon={<TrendingUp className="w-4 h-4" />} label="今日点击" value={todayClicks} color="green"
            change={clicksChange} />
          <StatCard icon={<Eye className="w-4 h-4" />} label="今日访客" value={todayVisitors} color="cyan" />
        </div>

        {/* Tab 导航 */}
        <div className="flex gap-1 p-1 rounded-xl bg-dark-800 border border-white/5 overflow-x-auto">
          {([
            { key: 'overview' as Tab, label: '排行榜', icon: <BarChart3 className="w-3.5 h-3.5" /> },
            { key: 'trend' as Tab, label: '趋势图', icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { key: 'source' as Tab, label: '来源分析', icon: <Globe className="w-3.5 h-3.5" /> },
            { key: 'device' as Tab, label: '设备分析', icon: <Monitor className="w-3.5 h-3.5" /> },
            { key: 'operator' as Tab, label: '运营人员', icon: <Users className="w-3.5 h-3.5" /> },
            { key: 'contact' as Tab, label: '联系方式', icon: <MessageCircle className="w-3.5 h-3.5" /> },
          ]).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap px-3 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-neon-green/20 to-neon-cyan/20 text-neon-green border border-neon-green/20'
                  : 'text-gray-500 hover:text-gray-300'
              }`}>
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ====== 排行榜 ====== */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-5 gap-4">
            {/* 排行列表 */}
            <div className="lg:col-span-3 glass rounded-2xl p-4 border border-white/5">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-neon-green" /> 按钮点击排行
              </h2>
              {leaderboard.length === 0 ? <EmptyState /> : (
                <div className="space-y-2">
                  {leaderboard.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 border border-white/5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-dark-700 text-gray-500'
                      }`}>{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.button_name}</p>
                        <p className="text-[10px] text-gray-500">{item.button_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-neon-green">{item.total_clicks}</p>
                        <p className="text-[10px] text-gray-500">{item.unique_visitors} UV</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* 按钮分布饼图 */}
            <div className="lg:col-span-2 glass rounded-2xl p-4 border border-white/5">
              <h2 className="text-sm font-bold text-white mb-3">按钮点击分布</h2>
              {buttonPieData.length === 0 ? <EmptyState /> : (
                <>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={buttonPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                          {buttonPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                          itemStyle={{ color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    {buttonPieData.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-gray-400 flex-1 truncate">{item.name}</span>
                        <span className="text-white font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ====== 趋势图 ====== */}
        {activeTab === 'trend' && (
          <div className="glass rounded-2xl p-4 border border-white/5">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neon-cyan" /> 点击趋势
            </h2>
            {trendData.length === 0 ? <EmptyState /> : (
              <div className="h-72 lg:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="gClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#39FF14" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#39FF14" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00F5FF" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00F5FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }} labelStyle={{ color: '#9ca3af' }} />
                    <Area type="monotone" dataKey="clicks" name="点击" stroke="#39FF14" fillOpacity={1} fill="url(#gClicks)" strokeWidth={2} />
                    <Area type="monotone" dataKey="visitors" name="访客" stroke="#00F5FF" fillOpacity={1} fill="url(#gVisitors)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ====== 来源分析 ====== */}
        {activeTab === 'source' && (
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-4 border border-white/5">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-neon-green" /> 流量来源
              </h2>
              {sourceStats.length === 0 ? <EmptyState /> : (
                <div className="space-y-2">
                  {sourceStats.map((item, i) => {
                    const maxC = Math.max(...sourceStats.map(s => s.click_count))
                    return (
                      <div key={i} className="p-3 rounded-xl bg-dark-800/50 border border-white/5">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-neon-green" />
                            <span className="text-sm font-medium text-white">{item.source}</span>
                            <span className="text-[10px] text-gray-500">{item.medium}</span>
                          </div>
                          <span className="text-sm font-bold text-neon-cyan">{item.click_count}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-dark-700 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-neon-green to-neon-cyan" style={{ width: `${(item.click_count / maxC) * 100}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            {/* 来源饼图 */}
            <div className="glass rounded-2xl p-4 border border-white/5">
              <h2 className="text-sm font-bold text-white mb-3">来源分布</h2>
              {sourceStats.length === 0 ? <EmptyState /> : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sourceStats.map(s => ({ name: s.source, value: s.click_count }))} cx="50%" cy="50%" outerRadius={90} dataKey="value" stroke="none" label={({ name, percent }: any) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}>
                        {sourceStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====== 设备分析 ====== */}
        {activeTab === 'device' && (
          <div className="grid lg:grid-cols-2 gap-4">
            {/* 设备列表 */}
            <div className="glass rounded-2xl p-4 border border-white/5">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-neon-cyan" /> 设备明细
              </h2>
              {deviceStats.length === 0 ? <EmptyState /> : (
                <div className="space-y-2">
                  {deviceStats.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                        <Monitor className="w-4 h-4 text-neon-cyan" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white capitalize">{item.device_type}</p>
                        <p className="text-[10px] text-gray-500">{item.browser} · {item.os}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-neon-green">{item.click_count}</p>
                        <p className="text-[10px] text-gray-500">{item.unique_visitors} UV</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* 设备环形图 */}
            <div className="glass rounded-2xl p-4 border border-white/5">
              <h2 className="text-sm font-bold text-white mb-3">设备类型分布</h2>
              {devicePieData.length === 0 ? <EmptyState /> : (
                <>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={devicePieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="none">
                          {devicePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-2">
                    {devicePieData.map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-gray-400 capitalize">{item.name}</span>
                        <span className="text-white font-bold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ====== 运营人员分析 ====== */}
        {activeTab === 'operator' && (
          <div className="glass rounded-2xl p-4 border border-white/5">
            <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-neon-green" /> 运营人员业绩（按 utm_campaign 区分）
            </h2>
            <p className="text-[10px] text-gray-500 mb-4">推广链接添加 ?utm_campaign=人员名 即可自动归属</p>
            {operatorStats.length === 0 ? <EmptyState /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left py-2.5 px-3 text-[10px] text-gray-500 uppercase">人员/标记</th>
                      <th className="text-right py-2.5 px-3 text-[10px] text-gray-500 uppercase">点击数</th>
                      <th className="text-right py-2.5 px-3 text-[10px] text-gray-500 uppercase">独立访客</th>
                      <th className="text-right py-2.5 px-3 text-[10px] text-gray-500 uppercase">触达按钮</th>
                      <th className="text-right py-2.5 px-3 text-[10px] text-gray-500 uppercase">转化率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operatorStats.map((op, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 flex items-center justify-center text-[10px] font-bold text-neon-green">
                              {op.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-white">{op.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-neon-green">{op.clicks}</td>
                        <td className="py-3 px-3 text-right text-neon-cyan">{op.visitors}</td>
                        <td className="py-3 px-3 text-right text-gray-400">{op.buttons}</td>
                        <td className="py-3 px-3 text-right">
                          <span className="text-yellow-400">{op.visitors > 0 ? (op.clicks / op.visitors).toFixed(1) : '0'}x</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ====== 联系方式分析 ====== */}
        {activeTab === 'contact' && (
          <div className="glass rounded-2xl p-4 border border-white/5">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-neon-cyan" /> 联系方式转化分析
            </h2>
            {contactStats.length === 0 ? <EmptyState /> : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {contactStats.map((item, i) => {
                  const maxC = Math.max(...contactStats.map(s => s.clicks))
                  return (
                    <div key={i} className="p-5 rounded-xl bg-dark-800/50 border border-white/5 hover:border-neon-green/20 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-white">{item.name}</h3>
                        <span className="text-2xl font-black text-neon-green">{item.clicks}</span>
                      </div>
                      <div className="h-2 rounded-full bg-dark-700 overflow-hidden mb-3">
                        <div className="h-full rounded-full bg-gradient-to-r from-neon-green to-neon-cyan" style={{ width: `${(item.clicks / maxC) * 100}%` }} />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">{item.visitors} 独立访客</span>
                        <span className="text-gray-500">{item.visitors > 0 ? (item.clicks / item.visitors).toFixed(1) : '0'}x 人均</span>
                      </div>
                      <p className="text-[10px] text-gray-600 mt-2 truncate">{item.url}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// 指标卡片
function StatCard({ icon, label, value, color, change }: {
  icon: React.ReactNode; label: string; value: number; color: 'green' | 'cyan'; change?: number
}) {
  const colorCls = color === 'green'
    ? 'text-neon-green bg-neon-green/10 border-neon-green/20'
    : 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20'

  return (
    <div className="glass rounded-xl p-4 border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg ${colorCls} flex items-center justify-center`}>{icon}</div>
        {change !== undefined && change !== 0 && (
          <div className={`flex items-center gap-0.5 text-[10px] font-medium ${change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change).toFixed(0)}%
          </div>
        )}
      </div>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-black mt-0.5 ${color === 'green' ? 'text-neon-green' : 'text-neon-cyan'}`}>
        {value.toLocaleString()}
      </p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <MousePointerClick className="w-8 h-8 text-gray-600 mx-auto mb-2" />
      <p className="text-gray-500 text-sm">暂无数据</p>
      <p className="text-gray-600 text-xs mt-1">等待用户点击按钮后，数据将在此展示</p>
    </div>
  )
}
