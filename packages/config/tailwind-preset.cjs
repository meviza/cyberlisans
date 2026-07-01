module.exports = {
  theme: {
    extend: {
      colors: {
        cyber: {
          cyan: '#00F0FF',
          magenta: '#FF00C8',
          purple: '#8B5CF6',
          dark: '#0A0A1F',
          darker: '#050510',
          lime: '#BEF264',
          text: '#E5E7EB',
          'text-dim': '#9CA3AF',
          bg: '#0A0A1F',
          border: '#1F2937',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0,240,255,0.5)',
        'glow-magenta': '0 0 20px rgba(255,0,200,0.5)',
      },
      animation: {
        glitch: 'glitch 1s linear infinite',
        scanline: 'scanline 8s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.3)' },
        },
      },
    },
  },
};