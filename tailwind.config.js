export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                surface: '#050816',
                neon: '#39C5FF',
                neonAlt: '#61dafb',
                card: 'rgba(15, 23, 42, 0.78)',
                glow: '#0af6ff'
            },
            boxShadow: {
                glow: '0 0 40px rgba(57, 197, 255, 0.14)'
            }
        }
    },
    plugins: []
};