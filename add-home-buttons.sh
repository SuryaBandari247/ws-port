#!/bin/bash

cd /Users/taabasu5/parasmile/withswag

# Add home button to SRT editor
# Find the header-title div and add home button before it
sed -i '' '/<div class="header-title">/i\
                <a href="/" class="home-btn" title="Back to WithSwag Home">🏠</a>
' srt-editor/index.html

# Add CSS for home button in SRT editor
cat >> srt-editor/styles.css << 'EOF'

/* Home Button */
.home-btn {
    position: absolute;
    top: 20px;
    left: 20px;
    font-size: 24px;
    text-decoration: none;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    transition: all 0.2s;
    z-index: 100;
}

.home-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
}

@media (max-width: 768px) {
    .home-btn {
        top: 10px;
        left: 10px;
        font-size: 20px;
        padding: 6px 10px;
    }
}
EOF

echo "✅ Home button added to SRT editor"

# Now add home button to EasyPortrait
# We need to modify the LandingPage and EditorPage components

