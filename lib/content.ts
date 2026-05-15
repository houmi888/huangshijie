// ============================================
// 内容管理系统 - 数据与视图分离
// 使用 localStorage 存储，支持后台实时修改
// ============================================

export interface HeroContent {
  badge: string
  title: string
  highlight: string
  subtitle: string
  description: string
  ctaText: string
  ctaUrl: string
  secondaryCtaText: string
  secondaryCtaUrl: string
}

export interface FeatureItem {
  icon: string
  title: string
  description: string
  color: 'green' | 'cyan'
}

export interface CoreFunction {
  icon: string
  title: string
  description: string
  tag?: string
}

export interface CaseItem {
  avatar: string
  name: string
  role: string
  content: string
  metrics: string
}

export interface NavItem {
  label: string
  href: string
}

export interface FooterContent {
  copyright: string
  links: { label: string; url: string }[]
}

export interface ContactButton {
  name: string
  type: string
  url: string
  icon: 'wechat' | 'whatsapp' | 'line'
  style: 'primary' | 'outline-cyan' | 'outline-green'
}

export interface SiteContent {
  nav: NavItem[]
  hero: HeroContent
  features: FeatureItem[]
  coreFunctions: CoreFunction[]
  cases: CaseItem[]
  contactButtons: ContactButton[]
  footer: FooterContent
}

// ---------- 默认内容 ----------

const defaultContent: SiteContent = {
  nav: [
    { label: '首页', href: '#hero' },
    { label: '功能优势', href: '#features' },
    { label: '核心功能', href: '#core' },
    { label: '用户案例', href: '#cases' },
    { label: '联系我们', href: '#contact' },
  ],

  hero: {
    badge: '🔥 AI 自动获客神器',
    title: '你的同行，正在用 AI 偷偷',
    highlight: '「偷走」你的客户！',
    subtitle: '老板们别再亲自熬夜写文案了，把引流交给 AI！',
    description: '当你还在为了憋一条文案抓耳挠腮、为了一条短片熬夜剪辑修图时...你的同行早就开启了「自动提款机」模式。他们正用【小鸡AI】一键克隆全网的爆款基因，每天全自动生成图文和短片，几十个矩阵帐号在各大平台疯狂铺量。',
    ctaText: '免费领取体验名额',
    ctaUrl: 'https://work.weixin.qq.com/ca/cawcdeb10577209036',
    secondaryCtaText: '了解更多功能',
    secondaryCtaUrl: '#features',
  },

  features: [
    { icon: 'Smartphone', title: '手机即终端', description: '告别繁琐的电脑操作，一部手机就能随时随地完成小红书矩阵运营，让碎片化时间变现。', color: 'green' },
    { icon: 'Search', title: '爆款不靠猜', description: '拒绝盲目原创。输入同行链接，AI智能拆解爆款基因并提炼密码，30秒为你生成专属高转化图文。', color: 'cyan' },
    { icon: 'Image', title: 'AI智能生图/出片', description: '不会P图剪辑？一句文案秒出精美配图，更支持一键提取商品链接，自动生成带货大片。', color: 'green' },
    { icon: 'Shield', title: '深度去重防封号', description: '独家AI底层逻辑重构，规避平台低级洗稿查重风险。保护你的矩阵账号资产，存活率大幅提升。', color: 'cyan' },
    { icon: 'Zap', title: '0基础新手友好', description: '傻瓜式操作，打开即用。不强求文笔，不必懂排版，让AI成为你24小时全天候的免费运营助理。', color: 'green' },
    { icon: 'BookOpen', title: '保姆级陪跑服务', description: '不仅卖工具，更教你怎么赚钱。内置20节0-1实战运营课程，更有专属社群答疑与大咖直播赋能。', color: 'cyan' },
  ],

  coreFunctions: [
    { icon: 'Search', title: '灵感引擎', description: '一键搜索全网各行业爆款笔记，自动提炼爆款内容与图片，彻底告别灵感枯竭。', tag: '热门' },
    { icon: 'Zap', title: '一键爆款克隆', description: '复制同行爆款链接，AI智能分析标题、框架与关键词，一键生成高转化原创内容。', tag: '核心' },
    { icon: 'Image', title: 'AI智能生图', description: '不会P图也能做爆款。只需一句文案，AI模型自动为你生成多张高清原创配图。' },
    { icon: 'Camera', title: '拍照种草专家', description: '有产品就能卖。手机拍照上传产品图，AI自动提取卖点，极速生成种草海报与文案。' },
    { icon: 'Video', title: '爆款视频工厂', description: '无需拍摄剪辑，只需粘贴商品链接，AI提取卖点并在10秒内产出高质感带货短视频。', tag: '新功能' },
    { icon: 'Shield', title: '深度防封处理', description: '采用独家AI源创与深度去重技术，规避平台违规风险，保护你的矩阵账号安全。' },
    { icon: 'Layers', title: '全自动矩阵支持', description: '打破2天1篇笔记的低效，极简发布流程让你1分钟发百号，真正实现量大出奇迹。' },
    { icon: 'BookOpen', title: '内嵌实战课程', description: '工具内置从小红书0-1获客教学到最新防封技巧，不仅给工具，更教你运营思路。' },
  ],

  cases: [
    { avatar: '👩‍💼', name: '李女士', role: '美妆电商老板', content: '用小鸡AI三个月，小红书矩阵从3个号扩展到30个号，每天自动发布内容，私信咨询量翻了5倍。', metrics: '月增客户 500+' },
    { avatar: '👨‍💻', name: '张先生', role: '知识付费创业者', content: '以前一篇笔记要写2小时，现在30秒生成，质量还更好。AI防封技术让我的账号存活率从60%提升到95%。', metrics: '效率提升 10x' },
    { avatar: '👩‍🍳', name: '王女士', role: '餐饮连锁品牌', content: '拍照种草功能太好用了，拍一下菜品就能自动生成种草文案和配图，我们6家门店都在用。', metrics: '到店率提升 300%' },
    { avatar: '👨‍🏫', name: '陈先生', role: '教培行业运营', content: '内置的实战课程帮我从0开始搭建了完整的获客体系，现在每月稳定获取200+精准客户。', metrics: '获客成本降低 80%' },
  ],

  contactButtons: [
    { name: '添加微信', type: 'cta', url: 'https://work.weixin.qq.com/ca/cawcdeb10577209036', icon: 'wechat', style: 'primary' },
    { name: '添加 WhatsApp', type: 'cta', url: 'https://wa.me/8617575011483', icon: 'whatsapp', style: 'outline-cyan' },
    { name: '添加 LINE', type: 'cta', url: 'https://line.me/ti/p/H6tCtVGGSA', icon: 'line', style: 'outline-green' },
  ],

  footer: {
    copyright: '© 2026 小鸡AI. 保留所有权利.',
    links: [
      { label: '隐私政策', url: '#' },
      { label: '服务条款', url: '#' },
      { label: '联系我们', url: '#contact' },
    ],
  },
}

// ---------- 存储 API ----------

const STORAGE_KEY = 'xj_site_content'

export function getSiteContent(): SiteContent {
  if (typeof window === 'undefined') return defaultContent

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // 合并：以存储的为主，缺失的用默认值补充
      return { ...defaultContent, ...parsed }
    }
  } catch {
    // JSON解析失败，使用默认值
  }

  return defaultContent
}

export function setSiteContent(content: Partial<SiteContent>) {
  if (typeof window === 'undefined') return

  const current = getSiteContent()
  const merged = { ...current, ...content }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))

  // 触发自定义事件，让页面实时响应
  window.dispatchEvent(new CustomEvent('xj-content-update', { detail: merged }))
}

export function resetSiteContent() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('xj-content-update', { detail: defaultContent }))
}

export function getDefaultContent(): SiteContent {
  return defaultContent
}
