/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2563EB', // blue-600
          secondary: '#06B6D4', // cyan-500
          accent: '#2DD4BF', // teal-400
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2563EB 0%, #06B6D4 50%, #2DD4BF 100%)',
        'brand-gradient-subtle': 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
      },
    },
  },
  plugins: [],
  safelist: [
    'text-brand-gradient',
    'bg-brand-gradient',
    'bg-brand-gradient-subtle',
  ],
};
