#!/bin/bash

# Smart Tiffin Box Dashboard - GitHub Pages Deployment Script

echo "🚀 Deploying Smart Tiffin Box Dashboard to GitHub Pages..."

# Build the project
npm run build

# Navigate to dist folder
cd dist

# Initialize git repo if not exists
if [ ! -d ".git" ]; then
    git init
    git branch -M main
fi

# Add all files
git add .

# Commit changes
git commit -m "Deploy Smart Tiffin Box Dashboard - $(date)"

# Push to GitHub Pages
git push -f https://github.com/$(git config --get user.name)/smart-tiffin-box-dashboard.git main:gh-pages

echo "✅ Deployment complete! Your dashboard is now live at: https://$(git config --get user.name).github.io/smart-tiffin-box-dashboard"
