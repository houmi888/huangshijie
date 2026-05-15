'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ============================================
// 滚动进入视口动画 Hook
// ============================================

interface ScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -50px 0px', once = true } = options
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.unobserve(el)
  }, [threshold, rootMargin, once])

  return { ref, isVisible }
}

// ============================================
// 鼠标视差跟随 Hook
// ============================================

interface ParallaxState {
  x: number
  y: number
  rotateX: number
  rotateY: number
}

export function useParallax(sensitivity: number = 20) {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<ParallaxState>({ x: 0, y: 0, rotateX: 0, rotateY: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = (e.clientX - centerX) / rect.width
      const deltaY = (e.clientY - centerY) / rect.height

      setState({
        x: deltaX * sensitivity,
        y: deltaY * sensitivity,
        rotateX: -deltaY * (sensitivity / 2),
        rotateY: deltaX * (sensitivity / 2),
      })
    }

    const handleMouseLeave = () => {
      setState({ x: 0, y: 0, rotateX: 0, rotateY: 0 })
    }

    window.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [sensitivity])

  const style = {
    transform: `translate(${state.x}px, ${state.y}px) rotateX(${state.rotateX}deg) rotateY(${state.rotateY}deg)`,
    transition: 'transform 0.15s ease-out',
  }

  return { ref, style, state }
}

// ============================================
// 数字滚动动画 Hook
// ============================================

export function useCountUp(
  target: number,
  duration: number = 2000,
  startOnVisible: boolean = true
) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  // 视口检测
  useEffect(() => {
    if (!startOnVisible) {
      setStarted(true)
      return
    }

    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => { if (el) observer.unobserve(el) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startOnVisible])

  // 动画执行
  useEffect(() => {
    if (!started || target === 0) return

    let startTime: number | null = null
    let rafId: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCount(Math.round(eased * target))

      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      }
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [started, target, duration])

  return { count, ref }
}

// ============================================
// 交错动画延迟计算
// ============================================

export function staggerDelay(index: number, baseDelay: number = 100): string {
  return `${index * baseDelay}ms`
}

// ============================================
// 滚动动画 CSS class 生成
// ============================================

type AnimationType = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'fade'

export function getScrollAnimationClass(
  isVisible: boolean,
  type: AnimationType = 'fade-up',
  delay: number = 0
): string {
  const base = 'transition-all duration-700 ease-out'

  const hidden: Record<AnimationType, string> = {
    'fade-up': 'opacity-0 translate-y-8',
    'fade-down': 'opacity-0 -translate-y-8',
    'fade-left': 'opacity-0 -translate-x-8',
    'fade-right': 'opacity-0 translate-x-8',
    'scale': 'opacity-0 scale-90',
    'fade': 'opacity-0',
  }

  const visible = 'opacity-100 translate-y-0 translate-x-0 scale-100'

  const delayClass = delay > 0 ? `delay-[${delay}ms]` : ''

  return `${base} ${delayClass} ${isVisible ? visible : hidden[type]}`
}
