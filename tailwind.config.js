/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FD8D14',
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#FD8D14',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
          hover: '#E67E0F',
          active: '#D6700A',
        },
        light: {
          bg: '#FAFBFD',
          surface: '#FFFFFF',
          'surface-subtle': '#F4F6F9',
          border: '#E7EAF0',
          'border-subtle': '#EEF1F6',
          text: '#172033',
          'text-secondary': '#667085',
          'text-muted': '#98A2B3',
        },
        dark: {
          bg: '#0C1018',
          surface: '#171D28',
          'surface-subtle': '#1F2735',
          border: '#303948',
          'border-subtle': '#252D3B',
          text: '#F8FAFC',
          'text-secondary': '#A7B0BF',
          'text-muted': '#6B7280',
        }
      },
      backdropBlur: {
        xs: '2px',
        glass: '16px',
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-primary': '0 0 20px -2px rgba(253, 141, 20, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulseSubtle 2.5s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      }
    },
  },
  plugins: [],
}
