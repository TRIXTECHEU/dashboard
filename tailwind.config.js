/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-gray-900',
    'bg-gray-50',
    'bg-black',
    'bg-slate-900',
    'bg-white',
    'bg-blue-50',
    'bg-blue-600',
    'bg-green-600',
    'bg-purple-600',
    'bg-red-600',
    'bg-orange-600',
    'bg-pink-600',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
