#!/bin/bash

cd /Users/taabasu5/parasmile/withswag/EasyPortrait

# Add home button component to LandingPage
# Find the return statement and add home button at the top
sed -i '' '/return (/a\
      <a href="/" className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 text-gray-700 hover:text-indigo-600 font-medium">\
        <span className="text-xl">🏠</span>\
        <span className="hidden sm:inline">Home</span>\
      </a>
' src/pages/LandingPage.tsx

# Add home button to EditorPage
sed -i '' '/return (/a\
      <a href="/" className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 text-gray-700 hover:text-indigo-600 font-medium">\
        <span className="text-xl">🏠</span>\
        <span className="hidden sm:inline">Home</span>\
      </a>
' src/pages/EditorPage.tsx

# Rebuild the app
npm run build

echo "✅ Home buttons added to EasyPortrait React app"
