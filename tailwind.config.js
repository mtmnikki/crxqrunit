 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/tailwind.config.js b/tailwind.config.js
index 8627cbd37db5da9866884376811a6c02f8197e54..2d99a012d9c724ed28d1a10d8b134873862e2af6 100644
--- a/tailwind.config.js
+++ b/tailwind.config.js
@@ -1,25 +1,34 @@
 /** @type {import('tailwindcss').Config} */
 export default {
-  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
+  content: [
+    './index.html',
+    './components/**/*.{js,ts,jsx,tsx}',
+    './pages/**/*.{js,ts,jsx,tsx}',
+    './routes/**/*.{js,ts,jsx,tsx}',
+    './state/**/*.{js,ts,jsx,tsx}',
+    './lib/**/*.{js,ts,jsx,tsx}',
+    './App.tsx',
+    './main.tsx'
+  ],
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
 
EOF
)
