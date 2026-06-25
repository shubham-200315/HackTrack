/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        'xl': '1rem',      // 16px
        '2xl': '1.5rem',   // 24px
        '3xl': '2rem',     // 32px
        '4xl': '2.5rem',   // 40px
      },
      colors: {
        // Subtle neutral gray palette
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#030712',
        },
        // Soft accent colors
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#dbe2ff',
          300: '#c2cdff',
          400: '#9db0ff',
          500: '#6366f1', // Indigo core
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        accent: {
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            500: '#22c55e',
            600: '#16a34a',
          },
          amber: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            500: '#f59e0b',
            600: '#d97706',
          },
          rose: {
            50: '#fff1f2',
            100: '#ffe4e6',
            200: '#fecdd3',
            500: '#f43f5e',
            600: '#e11d48',
          }
        }
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 10px -1px rgba(0, 0, 0, 0.03)',
        'premium-hover': '0 10px 30px -4px rgba(0, 0, 0, 0.08), 0 4px 15px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
