/**
 * CyberLisans design tokens — Laravel Cloud–inspired premium dark.
 * Accent: electric blue (#0057FF). Surfaces: deep navy (#00001e).
 * Legacy `cyber.*` keys are remapped so existing classNames keep working.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#00001e',
          surface: '#0B1220',
          elevated: '#11181C',
          panel: '#0F1724',
          accent: '#0057FF',
          'accent-hover': '#0044CC',
          'accent-soft': 'rgba(0, 87, 255, 0.12)',
          muted: '#6F6F91',
          subtle: '#929b9e',
          text: '#F4F6F8',
          'text-secondary': '#B2B2D0',
          border: 'rgba(255, 255, 255, 0.08)',
          success: '#29A383',
          warning: '#FD8802',
          danger: '#E54666',
          deep: '#012139',
        },
        // Legacy aliases → new system (remove after full migration)
        cyber: {
          cyan: '#0057FF',
          magenta: '#6B7CFF',
          purple: '#5B6CFF',
          dark: '#0B1220',
          darker: '#00001e',
          lime: '#29A383',
          yellow: '#FD8802',
          text: '#F4F6F8',
          'text-dim': '#B2B2D0',
          bg: '#00001e',
          'bg-elevated': '#11181C',
          border: '#1a2332',
          pink: '#E54666',
        },
      },
      fontFamily: {
        display: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        body: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
        orbitron: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        'glow-cyan': '0 0 24px rgba(0, 87, 255, 0.35)',
        'glow-magenta': '0 0 24px rgba(107, 124, 255, 0.3)',
        'neon-cyan': '0 0 20px rgba(0, 87, 255, 0.4)',
        'neon-magenta': '0 0 20px rgba(107, 124, 255, 0.35)',
        soft: '0 8px 32px rgba(0, 0, 0, 0.35)',
        card: '0 1px 0 rgba(255,255,255,0.04), 0 12px 40px rgba(0,0,0,0.4)',
        'accent-glow': '0 8px 32px rgba(0, 87, 255, 0.28)',
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(0, 87, 255, 0.28), transparent 60%)',
        'panel-gradient':
          'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 100%)',
        'grid-faint':
          'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      animation: {
        glitch: 'glitch 1s linear infinite',
        scanline: 'scanline 8s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s ease-out both',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-1px, 1px)' },
          '40%': { transform: 'translate(-1px, -1px)' },
          '60%': { transform: 'translate(1px, 1px)' },
          '80%': { transform: 'translate(1px, -1px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.75' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
};
