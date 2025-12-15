#!/bin/bash
# Clean Next.js build cache and rebuild

echo "🧹 Cleaning Next.js build cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "✅ Build cache cleared!"
echo "📦 Run 'npm run dev' to start the development server"

