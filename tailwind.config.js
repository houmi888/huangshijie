/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* ===== 色彩系统 ===== */
      colors: {
        neon: {
          green: 'var(--neon-green)',
          cyan: 'var(--neon-cyan)',
          blue: 'var(--neon-blue)',
        },
        dark: {
          950: 'var(--dark-950)',
          900: 'var(--dark-900)',
          800: 'var(--dark-800)',
          700: 'var(--dark-700)',
          600: 'var(--dark-600)',
          500: 'var(--dark-500)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          hover: 'var(--surface-hover)',
          active: 'var(--surface-active)',
        },
      },
      /* ===== 字体系统 ===== */
      fontFamily: {
        sans: ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      /* ===== 间距系统 ===== */
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
      },
      /* ===== 圆角系统 ===== */
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      /* ===== 阴影系统 ===== */
      boxShadow: {
        'glow-green': '0 0 20px rgba(57, 255, 20, 0.3), 0 0 60px rgba(57, 255, 20, 0.1)',
        'glow-cyan': '0 0 20px rgba(0, 245, 255, 0.3), 0 0 60px rgba(0, 245, 255, 0.1)',
        'glow-green-lg': '0 0 30px rgba(57, 255, 20, 0.4), 0 0 80px rgba(57, 255, 20, 0.15)',
        'glow-cyan-lg': '0 0 30px rgba(0, 245, 255, 0.4), 0 0 80px rgba(0, 245, 255, 0.15)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.06)',
        'card': '0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
      },
      /* ===== 动画系统 ===== */
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'ripple': 'ripple 1s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-up': 'fade-up 0.6s ease-out',
        'fade-down': 'fade-down 0.6s ease-out',
        'scale-in': 'scale-in 0.4s ease-out',
        'slide-in-left': 'slide-in-left 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        'spin-slow': 'spin 8s linear infinite',
        'gradient-x': 'gradient-x 6s ease infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(57, 255, 20, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(57, 255, 20, 0.6)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'ripple': {
          '0%': { transform: 'scale(0)', opacity: '0.6' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      /* ===== 响应式断点（参考） ===== */
      screens: {
        'xs': '375px',
        '3xl': '1920px',
      },
      /* ===== 最大宽度 ===== */
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [],
}
