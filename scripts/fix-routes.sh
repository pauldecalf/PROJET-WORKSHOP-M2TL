#!/bin/bash
# Script pour forcer la recompilation des routes API
# À utiliser quand les routes retournent 404 en dev

echo "🔄 Forçage de la recompilation des routes API..."

# Touch tous les fichiers de routes
find app/api -name "route.ts" -type f -exec touch {} \;

echo "✅ Routes touchées, Next.js va les recompiler"
echo "⏳ Attendez 2-3 secondes puis réessayez votre requête"





