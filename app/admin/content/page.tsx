'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Save, RotateCcw, Download, Upload, ChevronRight, Check,
  Layout, Type, Zap, Grid3X3, Users, MessageCircle, Settings,
  Plus, Trash2, ArrowLeft, Eye
} from 'lucide-react'
import {
  getSiteContent, setSiteContent, resetSiteContent, getDefaultContent,
  type SiteContent, type FeatureItem, type CoreFunction, type CaseItem,
  type ContactButton
} from '@/lib/content'

type Section = 'hero' | 'nav' | 'features' | 'core' | 'cases' | 'contact' | 'footer'

const sectionList: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: 'hero', label: 'Hero 区', icon: <Layout className="w-4 h-4" /> },
  { key: 'nav', label: '导航栏', icon: <Type className="w-4 h-4" /> },
  { key: 'features', label: '功能优势', icon: <Zap className="w-4 h-4" /> },
  { key: 'core', label: '核心功能', icon: <Grid3X3 className="w-4 h-4" /> },
  { key: 'cases', label: '用户案例', icon: <Users className="w-4 h-4" /> },
  { key: 'contact', label: '联系按钮', icon: <MessageCircle className="w-4 h-4" /> },
  { key: 'footer', label: '页脚', icon: <Settings className="w-4 h-4" /> },
]

export default function ContentEditorPage() {
  const [content, setContent] = useState<SiteContent | null>(null)
  const [activeSection, setActiveSection] = useState<Section>('hero')
  const [saved, setSaved] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setContent(getSiteContent())
  }, [])

  const handleSave = useCallback(() => {
    if (!content) return
    setSiteContent(content)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [content])

  const handleReset = useCallback(() => {
    if (!confirm('确定要重置所有内容为默认值吗？此操作不可撤销。')) return
    resetSiteContent()
    setContent(getDefaultContent())
  }, [])

  const handleExport = useCallback(() => {
    if (!content) return
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `xiaoji-content-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [content])

  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target?.result as string) as SiteContent
          setContent(imported)
          setSiteContent(imported)
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
        } catch {
          alert('JSON 文件格式错误')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }, [])

  // 更新content的辅助函数
  const update = useCallback((path: string, value: any) => {
    setContent(prev => {
      if (!prev) return prev
      const newContent = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj: any = newContent
      for (let i = 0; i < keys.length - 1; i++) {
        const k = isNaN(Number(keys[i])) ? keys[i] : Number(keys[i])
        obj = obj[k]
      }
      const lastKey = isNaN(Number(keys[keys.length - 1])) ? keys[keys.length - 1] : Number(keys[keys.length - 1])
      obj[lastKey] = value
      return newContent
    })
  }, [])

  if (!content) return null

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ====== 左侧菜单 ====== */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-white/5 flex flex-col transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* 头部 */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center">
              <span className="text-sm">🐔</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">内容管理</p>
              <p className="text-[10px] text-gray-500">编辑网站内容</p>
            </div>
          </div>

          <div className="flex gap-1.5">
            <a href="/" target="_blank" className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-dark-700 border border-white/5 text-gray-400 hover:text-white text-[10px] transition-colors">
              <Eye className="w-3 h-3" /> 预览
            </a>
            <a href="/admin" className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-dark-700 border border-white/5 text-gray-400 hover:text-white text-[10px] transition-colors">
              <ArrowLeft className="w-3 h-3" /> 数据
            </a>
          </div>
        </div>

        {/* 菜单列表 */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sectionList.map(s => (
            <button
              key={s.key}
              onClick={() => { setActiveSection(s.key); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeSection === s.key
                  ? 'bg-gradient-to-r from-neon-green/10 to-neon-cyan/10 text-neon-green border border-neon-green/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {s.icon}
              <span>{s.label}</span>
              {activeSection === s.key && <ChevronRight className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </nav>

        {/* 底部工具栏 */}
        <div className="p-3 border-t border-white/5 space-y-1.5">
          <button onClick={handleExport} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Download className="w-3.5 h-3.5" /> 导出配置
          </button>
          <button onClick={handleImport} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Upload className="w-3.5 h-3.5" /> 导入配置
          </button>
          <button onClick={handleReset} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-400/5 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> 重置默认
          </button>
        </div>
      </aside>

      {/* ====== 右侧编辑区 ====== */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* 顶栏 */}
        <header className="sticky top-0 z-30 glass-strong border-b border-white/5 px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg bg-dark-700 text-gray-400">
              <Layout className="w-4 h-4" />
            </button>
            <h1 className="text-sm font-bold text-white">
              {sectionList.find(s => s.key === activeSection)?.label}
            </h1>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
              saved
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-gradient-to-r from-neon-green to-emerald-500 text-dark-900'
            }`}
          >
            {saved ? <><Check className="w-3.5 h-3.5" /> 已保存</> : <><Save className="w-3.5 h-3.5" /> 保存并发布</>}
          </button>
        </header>

        {/* 编辑内容区 */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Hero 编辑 */}
            {activeSection === 'hero' && (
              <>
                <EditorCard title="徽章文案">
                  <Input label="徽章" value={content.hero.badge} onChange={v => update('hero.badge', v)} />
                </EditorCard>
                <EditorCard title="主标题">
                  <Input label="标题" value={content.hero.title} onChange={v => update('hero.title', v)} />
                  <Input label="高亮文字" value={content.hero.highlight} onChange={v => update('hero.highlight', v)} />
                  <Input label="副标题" value={content.hero.subtitle} onChange={v => update('hero.subtitle', v)} />
                </EditorCard>
                <EditorCard title="描述文案">
                  <Textarea label="详细描述" value={content.hero.description} onChange={v => update('hero.description', v)} />
                </EditorCard>
                <EditorCard title="CTA 按钮">
                  <Input label="主按钮文字" value={content.hero.ctaText} onChange={v => update('hero.ctaText', v)} />
                  <Input label="主按钮链接" value={content.hero.ctaUrl} onChange={v => update('hero.ctaUrl', v)} />
                  <Input label="次按钮文字" value={content.hero.secondaryCtaText} onChange={v => update('hero.secondaryCtaText', v)} />
                  <Input label="次按钮链接" value={content.hero.secondaryCtaUrl} onChange={v => update('hero.secondaryCtaUrl', v)} />
                </EditorCard>
              </>
            )}

            {/* 导航编辑 */}
            {activeSection === 'nav' && (
              <EditorCard title="导航菜单项" action={
                <button onClick={() => {
                  const nav = [...content.nav, { label: '新菜单', href: '#' }]
                  update('nav', nav)
                }} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neon-green/10 text-neon-green text-xs hover:bg-neon-green/20 transition-colors">
                  <Plus className="w-3 h-3" /> 添加
                </button>
              }>
                {content.nav.map((item, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1"><Input label={`菜单 ${i + 1} 文字`} value={item.label} onChange={v => update(`nav.${i}.label`, v)} /></div>
                    <div className="flex-1"><Input label="锚点链接" value={item.href} onChange={v => update(`nav.${i}.href`, v)} /></div>
                    <button onClick={() => {
                      const nav = content.nav.filter((_, idx) => idx !== i)
                      update('nav', nav)
                    }} className="p-2.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors mb-0.5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </EditorCard>
            )}

            {/* 功能优势编辑 */}
            {activeSection === 'features' && (
              <EditorCard title="功能优势卡片" action={
                <button onClick={() => {
                  const features: FeatureItem[] = [...content.features, { icon: 'Zap', title: '新功能', description: '功能描述', color: 'green' }]
                  update('features', features)
                }} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neon-green/10 text-neon-green text-xs hover:bg-neon-green/20 transition-colors">
                  <Plus className="w-3 h-3" /> 添加
                </button>
              }>
                {content.features.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-dark-800/50 border border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400">卡片 {i + 1}</span>
                      <button onClick={() => {
                        const features = content.features.filter((_, idx) => idx !== i)
                        update('features', features)
                      }} className="p-1 rounded text-red-400 hover:bg-red-400/10"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input label="图标名" value={item.icon} onChange={v => update(`features.${i}.icon`, v)} />
                      <Select label="颜色" value={item.color} options={[{ v: 'green', l: '绿色' }, { v: 'cyan', l: '青色' }]} onChange={v => update(`features.${i}.color`, v)} />
                    </div>
                    <Input label="标题" value={item.title} onChange={v => update(`features.${i}.title`, v)} />
                    <Textarea label="描述" value={item.description} onChange={v => update(`features.${i}.description`, v)} rows={2} />
                  </div>
                ))}
              </EditorCard>
            )}

            {/* 核心功能编辑 */}
            {activeSection === 'core' && (
              <EditorCard title="核心功能卡片" action={
                <button onClick={() => {
                  const fns: CoreFunction[] = [...content.coreFunctions, { icon: 'Zap', title: '新功能', description: '功能描述' }]
                  update('coreFunctions', fns)
                }} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neon-green/10 text-neon-green text-xs hover:bg-neon-green/20 transition-colors">
                  <Plus className="w-3 h-3" /> 添加
                </button>
              }>
                {content.coreFunctions.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-dark-800/50 border border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400">功能 {i + 1}</span>
                      <button onClick={() => {
                        const fns = content.coreFunctions.filter((_, idx) => idx !== i)
                        update('coreFunctions', fns)
                      }} className="p-1 rounded text-red-400 hover:bg-red-400/10"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input label="图标名" value={item.icon} onChange={v => update(`coreFunctions.${i}.icon`, v)} />
                      <Input label="标签（可选）" value={item.tag || ''} onChange={v => update(`coreFunctions.${i}.tag`, v || undefined)} />
                    </div>
                    <Input label="标题" value={item.title} onChange={v => update(`coreFunctions.${i}.title`, v)} />
                    <Textarea label="描述" value={item.description} onChange={v => update(`coreFunctions.${i}.description`, v)} rows={2} />
                  </div>
                ))}
              </EditorCard>
            )}

            {/* 用户案例编辑 */}
            {activeSection === 'cases' && (
              <EditorCard title="用户案例" action={
                <button onClick={() => {
                  const cs: CaseItem[] = [...content.cases, { avatar: '👤', name: '新用户', role: '职位', content: '评价内容', metrics: '数据指标' }]
                  update('cases', cs)
                }} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neon-green/10 text-neon-green text-xs hover:bg-neon-green/20 transition-colors">
                  <Plus className="w-3 h-3" /> 添加
                </button>
              }>
                {content.cases.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-dark-800/50 border border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400">案例 {i + 1}</span>
                      <button onClick={() => {
                        const cs = content.cases.filter((_, idx) => idx !== i)
                        update('cases', cs)
                      }} className="p-1 rounded text-red-400 hover:bg-red-400/10"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input label="头像 Emoji" value={item.avatar} onChange={v => update(`cases.${i}.avatar`, v)} />
                      <Input label="姓名" value={item.name} onChange={v => update(`cases.${i}.name`, v)} />
                      <Input label="职位" value={item.role} onChange={v => update(`cases.${i}.role`, v)} />
                    </div>
                    <Textarea label="评价内容" value={item.content} onChange={v => update(`cases.${i}.content`, v)} rows={3} />
                    <Input label="数据指标" value={item.metrics} onChange={v => update(`cases.${i}.metrics`, v)} />
                  </div>
                ))}
              </EditorCard>
            )}

            {/* 联系按钮编辑 */}
            {activeSection === 'contact' && (
              <EditorCard title="联系按钮" action={
                <button onClick={() => {
                  const btns: ContactButton[] = [...content.contactButtons, { name: '新按钮', type: 'cta', url: '#', icon: 'wechat', style: 'primary' }]
                  update('contactButtons', btns)
                }} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neon-green/10 text-neon-green text-xs hover:bg-neon-green/20 transition-colors">
                  <Plus className="w-3 h-3" /> 添加
                </button>
              }>
                {content.contactButtons.map((btn, i) => (
                  <div key={i} className="p-4 rounded-xl bg-dark-800/50 border border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400">按钮 {i + 1}</span>
                      <button onClick={() => {
                        const btns = content.contactButtons.filter((_, idx) => idx !== i)
                        update('contactButtons', btns)
                      }} className="p-1 rounded text-red-400 hover:bg-red-400/10"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input label="按钮名称" value={btn.name} onChange={v => update(`contactButtons.${i}.name`, v)} />
                      <Input label="按钮类型" value={btn.type} onChange={v => update(`contactButtons.${i}.type`, v)} />
                    </div>
                    <Input label="目标链接" value={btn.url} onChange={v => update(`contactButtons.${i}.url`, v)} />
                    <div className="grid grid-cols-2 gap-2">
                      <Select label="图标" value={btn.icon} options={[{ v: 'wechat', l: '微信' }, { v: 'whatsapp', l: 'WhatsApp' }, { v: 'line', l: 'LINE' }]} onChange={v => update(`contactButtons.${i}.icon`, v)} />
                      <Select label="样式" value={btn.style} options={[{ v: 'primary', l: '主色(绿)' }, { v: 'outline-cyan', l: '描边(青)' }, { v: 'outline-green', l: '描边(绿)' }]} onChange={v => update(`contactButtons.${i}.style`, v)} />
                    </div>
                  </div>
                ))}
              </EditorCard>
            )}

            {/* 页脚编辑 */}
            {activeSection === 'footer' && (
              <>
                <EditorCard title="版权信息">
                  <Input label="版权文字" value={content.footer.copyright} onChange={v => update('footer.copyright', v)} />
                </EditorCard>
                <EditorCard title="页脚链接" action={
                  <button onClick={() => {
                    const links = [...content.footer.links, { label: '新链接', url: '#' }]
                    update('footer.links', links)
                  }} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neon-green/10 text-neon-green text-xs hover:bg-neon-green/20 transition-colors">
                    <Plus className="w-3 h-3" /> 添加
                  </button>
                }>
                  {content.footer.links.map((link, i) => (
                    <div key={i} className="flex gap-2 items-end">
                      <div className="flex-1"><Input label={`链接 ${i + 1} 文字`} value={link.label} onChange={v => update(`footer.links.${i}.label`, v)} /></div>
                      <div className="flex-1"><Input label="URL" value={link.url} onChange={v => update(`footer.links.${i}.url`, v)} /></div>
                      <button onClick={() => {
                        const links = content.footer.links.filter((_, idx) => idx !== i)
                        update('footer.links', links)
                      }} className="p-2.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors mb-0.5">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </EditorCard>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

// ====== 表单组件 ======

function EditorCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {action}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function Input({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label className="text-[11px] text-gray-500 mb-1 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-white/10 text-white text-sm focus:border-neon-green/40 focus:outline-none transition-colors placeholder:text-gray-600"
      />
    </div>
  )
}

function Textarea({ label, value, onChange, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number
}) {
  return (
    <div>
      <label className="text-[11px] text-gray-500 mb-1 block">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-white/10 text-white text-sm focus:border-neon-green/40 focus:outline-none transition-colors resize-none placeholder:text-gray-600"
      />
    </div>
  )
}

function Select({ label, value, options, onChange }: {
  label: string; value: string; options: { v: string; l: string }[]; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-[11px] text-gray-500 mb-1 block">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-white/10 text-white text-sm focus:border-neon-green/40 focus:outline-none transition-colors"
      >
        {options.map(o => (
          <option key={o.v} value={o.v}>{o.l}</option>
        ))}
      </select>
    </div>
  )
}
