/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      // Custom colors if needed
      colors: {
        // You can add custom colors here if needed
      },
      // Animation extensions
      animation: {
        // Add custom animations if needed
      },
      // Screen breakpoints are already covered by default Tailwind
    },
  },
  plugins: [
    // Add any Tailwind plugins you need
    // For example: require('@tailwindcss/forms'),
  ],
  // Important: This ensures Tailwind classes work properly with dynamic class names
  safelist: [
    // Since you're using dynamic color classes from the subjects array
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-red-500',
    // Gradient classes used in special cards
    'from-purple-600',
    'to-pink-600',
    'from-cyan-600',
    'to-blue-600',
    'from-green-500',
    'to-emerald-500',
    'from-blue-500',
    'to-indigo-500',
    'from-purple-500',
    'to-pink-500',
    'from-red-500',
    'to-orange-500',
    'from-teal-500',
    'to-cyan-500',
    'from-yellow-500',
    'to-amber-500',
    'from-indigo-500',
    'to-purple-500',
  ]
}