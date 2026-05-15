'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Zap, Search, Image, Video, Shield, Layers, BookOpen, Smartphone,
  Camera, Menu, X, ChevronRight, Star, ArrowRight, MessageCircle
} from 'lucide-react'
import { trackAndNavigate } from '@/lib/tracker'
import { getSiteContent, type SiteContent } from '@/lib/content'
import { useScrollAnimation, useParallax, useCountUp, staggerDelay } from '@/lib/animations'

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-full h-full" />,
  Search: <Search className="w-full h-full" />,
  Image: <Image className="w-full h-full" />,
  Video: <Video className="w-full h-full" />,
  Shield: <Shield className="w-full h-full" />,
  Layers: <Layers className="w-full h-full" />,
  BookOpen: <BookOpen className="w-full h-full" />,
  Smartphone: <Smartphone className="w-full h-full" />,
  Camera: <Camera className="w-full h-full" />,
  Star: <Star className="w-full h-full" />,
}

function getIcon(name: string) {
  return iconMap[name] || <Zap className="w-full h-full" />
}

// 滚动动画包装组件
function ScrollReveal({ children, type = 'fade-up', delay = 0, className = '' }: {
  children: React.ReactNode
  type?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'fade'
  delay?: number
  className?: string
}) {
  const { ref, isVisible } = useScrollAnimation()
  const hidden: Record<string, string> = {
    'fade-up': 'opacity-0 translate-y-10',
    'fade-down': 'opacity-0 -translate-y-10',
    'fade-left': 'opacity-0 -translate-x-10',
    'fade-right': 'opacity-0 translate-x-10',
    'scale': 'opacity-0 scale-90',
    'fade': 'opacity-0',
  }
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0 translate-x-0 scale-100' : hidden[type]} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// 数字滚动组件
function CountUpNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const { count, ref } = useCountUp(target, 2000)
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [content, setContent] = useState<SiteContent | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [showQR, setShowQR] = useState(false)

  // 视差
  const { ref: parallaxRef, style: parallaxStyle } = useParallax(15)

  useEffect(() => {
    setMounted(true)
    setContent(getSiteContent())

    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
    }
    window.addEventListener('mousemove', handleMouseMove)

    const handleContentUpdate = (e: Event) => {
      setContent((e as CustomEvent).detail)
    }
    window.addEventListener('xj-content-update', handleContentUpdate)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('xj-content-update', handleContentUpdate)
    }
  }, [])

  const scrollTo = useCallback((href: string) => {
    setMobileMenuOpen(false)
    if (href.startsWith('#')) {
      const el = document.querySelector(href)
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  if (!content) return null

  const { nav, hero, features, coreFunctions, cases, contactButtons, footer } = content

  return (
    <main className="min-h-screen bg-dark-900 bg-grid relative">
      {/* 背景装饰 - 鼠标视差 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-neon-green/5 blur-[150px] transition-transform duration-[2s] ease-out"
          style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 20}px)` }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-neon-cyan/5 blur-[120px] transition-transform duration-[2s] ease-out"
          style={{ transform: `translate(${-mousePos.x * 20}px, ${-mousePos.y * 15}px)` }}
        />
        <div
          className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-neon-blue/3 blur-[100px] transition-transform duration-[2s] ease-out"
          style={{ transform: `translate(${mousePos.x * 15}px, ${-mousePos.y * 10}px)` }}
        />
      </div>

      {/* ====== 导航栏 ====== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-strong border-b border-white/5 py-3' : 'py-5'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img src="/images/logo.png" alt="小鸡AI" className="w-9 h-9 rounded-xl shadow-lg shadow-neon-green/20" />
            <span className="text-lg font-bold text-white">小鸡AI</span>
          </div>

          {/* PC 导航 */}
          <div className="hidden md:flex items-center gap-1">
            {nav.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollTo(item.href)}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* PC CTA */}
          <button
            onClick={() => { setShowQR(true); trackAndNavigate('导航-免费体验', 'nav', '') }}
            className="hidden md:flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-green to-emerald-500 text-dark-900 font-bold text-sm hover:shadow-lg hover:shadow-neon-green/20 transition-all active:scale-95"
          >
            免费体验 <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-400"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-strong border-t border-white/5 mt-2 px-4 py-4 space-y-1">
            {nav.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollTo(item.href)}
                className="w-full text-left px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => { setShowQR(true); trackAndNavigate('移动导航-免费体验', 'nav', ''); setMobileMenuOpen(false) }}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-neon-green to-emerald-500 text-dark-900 font-bold text-sm"
            >
              免费体验
            </button>
          </div>
        )}
      </nav>

      {/* ====== Hero 区 ====== */}
      <section id="hero" className="relative min-h-screen flex items-center pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* 左侧文案 */}
            <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-neon-green/20 text-xs text-neon-green mb-6 animate-fade-down" style={{ animationDelay: '200ms' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                {hero.badge}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight mb-6">
                <span className="text-white">{hero.title}</span>
                <br />
                <span className="text-gradient-slow">{hero.highlight}</span>
              </h1>

              <p className={`text-gray-400 text-sm sm:text-base lg:text-lg leading-relaxed mb-8 max-w-xl transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {hero.description}
              </p>

              {/* CTA 按钮 - PC 横排 / 移动竖排 */}
              <div className={`flex flex-col sm:flex-row gap-3 mb-6 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <button
                  onClick={() => { setShowQR(true); trackAndNavigate('Hero-主CTA', 'cta', '') }}
                  className="btn-ripple px-8 py-4 rounded-2xl bg-gradient-to-r from-neon-green to-emerald-500 text-dark-900 font-bold text-base flex items-center justify-center gap-2 animate-pulse-glow transition-transform active:scale-95 hover:shadow-glow-green-lg"
                >
                  {hero.ctaText} <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollTo(hero.secondaryCtaUrl)}
                  className="btn-ripple px-8 py-4 rounded-2xl glass border border-white/10 text-white font-semibold text-base flex items-center justify-center gap-2 hover:border-neon-cyan/30 hover:shadow-glow-cyan transition-all active:scale-95"
                >
                  {hero.secondaryCtaText}
                </button>
              </div>

              <p className="text-gray-600 text-xs">🔥 名额有限，先到先得，立即体验 AI 降维打击</p>
            </div>

            {/* 右侧双图展示 - 鼠标视差 */}
            <div className={`flex justify-center lg:justify-end transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
              <div className="relative" ref={parallaxRef}>
                {/* 双手机截图并列 */}
                <div className="flex gap-4 sm:gap-6" style={parallaxStyle}>
                  {/* 左图 - 创作中心 */}
                  <div className={`relative transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="w-[140px] sm:w-[180px] lg:w-[220px] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-neon-green/10 animate-float">
                      <img
                        src="/images/hero-1.png"
                        alt="小鸡AI创作中心"
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-b from-neon-green/5 to-transparent blur-xl -z-10" />
                  </div>

                  {/* 右图 - 多平台发布 */}
                  <div className={`relative mt-12 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="w-[140px] sm:w-[180px] lg:w-[220px] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-neon-cyan/10 animate-float" style={{ animationDelay: '1.5s' }}>
                      <img
                        src="/images/hero-2.jpg"
                        alt="小鸡AI多平台发布"
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-b from-neon-cyan/5 to-transparent blur-xl -z-10" />
                  </div>
                </div>

                {/* 浮动徽章 - 数字滚动 */}
                <div className={`absolute -left-8 top-16 glass rounded-xl px-3 py-2 border border-neon-green/20 animate-float-slow hidden lg:flex items-center gap-2 transition-all duration-1000 delay-[800ms] ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`} style={{ animationDelay: '1s' }}>
                  <div className="w-8 h-8 rounded-lg bg-neon-green/20 flex items-center justify-center text-neon-green">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">今日自动发布</p>
                    <p className="text-sm font-bold text-neon-green"><CountUpNumber target={1280} /> 篇</p>
                  </div>
                </div>

                <div className={`absolute -right-6 bottom-16 glass rounded-xl px-3 py-2 border border-neon-cyan/20 animate-float-slow hidden lg:flex items-center gap-2 transition-all duration-1000 delay-[1200ms] ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`} style={{ animationDelay: '2s' }}>
                  <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 flex items-center justify-center text-neon-cyan">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">获客私信</p>
                    <p className="text-sm font-bold text-neon-cyan">+<CountUpNumber target={328} /></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== 功能优势区 ====== */}
      <section id="features" className="relative py-20 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
                为什么选择<span className="text-gradient">小鸡AI</span>？
              </h2>
              <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
                告别传统获客玄学，一部手机打造自动化流量矩阵
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {features.map((item, i) => (
              <ScrollReveal key={i} type="fade-up" delay={i * 100}>
                <div
                  className={`card-3d glass rounded-2xl p-6 border transition-all h-full ${
                    item.color === 'green'
                      ? 'border-neon-green/10 hover:border-neon-green/30 hover:shadow-glow-green'
                      : 'border-neon-cyan/10 hover:border-neon-cyan/30 hover:shadow-glow-cyan'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${
                    item.color === 'green' ? 'bg-neon-green/10 text-neon-green' : 'bg-neon-cyan/10 text-neon-cyan'
                  }`}>
                    <div className="w-6 h-6">{getIcon(item.icon)}</div>
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 核心功能矩阵 ====== */}
      <section id="core" className="relative py-20 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
                <span className="text-gradient">核心功能</span>矩阵
              </h2>
              <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
                从爆款灵感、AI自动创作、矩阵铺量到防封号处理，打造全链路获客闭环
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
            {coreFunctions.map((item, i) => (
              <ScrollReveal key={i} type="scale" delay={i * 80}>
                <div
                  className="card-3d glass-strong rounded-xl p-5 lg:p-6 border border-white/5 hover:border-neon-cyan/20 transition-all text-center group relative overflow-hidden h-full"
                >
                  {item.tag && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green text-[10px] font-bold animate-pulse">
                      {item.tag}
                    </span>
                  )}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 flex items-center justify-center mx-auto mb-3 text-neon-cyan group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <div className="w-6 h-6">{getIcon(item.icon)}</div>
                  </div>
                  <h4 className="font-bold text-sm lg:text-base text-white mb-1.5">{item.title}</h4>
                  <p className="text-gray-500 text-xs lg:text-sm leading-relaxed">{item.description}</p>
                  {/* 底部流光 */}
                  <div className="absolute bottom-0 left-0 right-0 h-[1px] shimmer" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 用户案例区 ====== */}
      <section id="cases" className="relative py-20 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
                他们都在用<span className="text-gradient">小鸡AI</span>
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">
                来自各行各业的真实用户反馈
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {cases.map((item, i) => (
              <ScrollReveal key={i} type={i % 2 === 0 ? 'fade-up' : 'fade-up'} delay={i * 120}>
                <div className="card-3d glass rounded-2xl p-5 lg:p-6 border border-white/5 hover:border-neon-green/20 hover:shadow-card-hover transition-all h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 flex items-center justify-center text-lg animate-float-slow" style={{ animationDelay: `${i * 500}ms` }}>
                      {item.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{item.name}</p>
                      <p className="text-[10px] text-gray-500">{item.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{item.content}</p>
                  <div className="flex items-center gap-1 mb-2">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className="w-3 h-3 text-yellow-400 fill-yellow-400 transition-transform hover:scale-125" style={{ animationDelay: `${s * 100}ms` }} />
                    ))}
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-neon-green/10 border border-neon-green/20 inline-block">
                    <p className="text-xs font-bold text-neon-green">{item.metrics}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 联系我们 / CTA 区 ====== */}
      <section id="contact" className="relative py-20 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal type="scale">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
              立即开启<span className="text-gradient-slow">AI获客</span>之旅
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mb-4">
              30秒生成原创爆款图文/短片，防封号技术护航，小白也能轻松上手
            </p>
            <p className="text-gray-500 text-xs mb-10">
              点击下方按钮添加客服，领取 AI 自动获客免费体验名额
            </p>
          </ScrollReveal>

          <ScrollReveal type="fade-up" delay={200}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
              {contactButtons.map((btn, i) => {
                const styles: Record<string, string> = {
                  primary: 'bg-gradient-to-r from-neon-green to-emerald-500 text-dark-900 animate-pulse-glow hover:shadow-glow-green-lg',
                  'outline-cyan': 'glass border border-neon-cyan/30 text-neon-cyan hover:border-neon-cyan/60 hover:shadow-glow-cyan',
                  'outline-green': 'glass border border-green-400/30 text-green-400 hover:border-green-400/60 hover:shadow-glow-green',
                }
                const isWechat = btn.icon === 'wechat'
                return (
                  <button
                    key={btn.name}
                    onClick={() => {
                      if (isWechat) {
                        setShowQR(true)
                        trackAndNavigate(btn.name, btn.type, '')
                      } else {
                        trackAndNavigate(btn.name, btn.type, btn.url)
                      }
                    }}
                    className={`btn-ripple flex-1 py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${styles[btn.style] || styles.primary}`}
                    style={{ animationDelay: `${i * 200}ms` }}
                  >
                    {btn.name}
                  </button>
                )
              })}
            </div>
          </ScrollReveal>

          <p className="text-gray-600 text-xs mt-6">🔥 名额有限，先到先得</p>
        </div>
      </section>

      {/* ====== 微信二维码弹窗 ====== */}
      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative glass-strong rounded-3xl p-6 sm:p-8 max-w-sm w-full animate-scale-in border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-1">添加微信</h3>
              <p className="text-gray-400 text-xs mb-4">扫描二维码，添加客服领取免费体验名额</p>
              <div className="bg-white rounded-2xl p-3 inline-block mb-4">
                <img
                  src="/images/wechat-qr.png"
                  alt="微信二维码"
                  className="w-56 h-56 sm:w-64 sm:h-64"
                />
              </div>
              <p className="text-gray-500 text-xs">长按或截图保存，打开微信扫一扫</p>
            </div>
          </div>
        </div>
      )}

      {/* ====== Footer ====== */}
      <footer className="py-8 border-t border-white/5 animate-fade-in">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="小鸡AI" className="w-5 h-5 rounded" />
            <p className="text-gray-600 text-xs">{footer.copyright}</p>
          </div>
          <div className="flex items-center gap-4">
            {footer.links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                className="text-gray-600 hover:text-gray-400 text-xs transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  )
}
