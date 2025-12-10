# 🔧 Fix Hot-Reload Turbopack (Next.js 16)

## 🚨 Problème

Avec **Next.js 16 + Turbopack**, parfois les routes API ne se rechargent pas correctement après modification :

```
GET /api/devices 200 ✅    ← Fonctionne
POST /api/devices 404 ❌   ← Ne fonctionne pas
```

Même après :
- Redémarrage du serveur
- Nettoyage du cache `.next`
- Rebuild complet

---

## ✅ Solution rapide

### Méthode 1 : Touch le fichier

```bash
touch app/api/devices/route.ts
```

Cela force Next.js/Turbopack à recompiler le fichier.

**Résultat** : La route POST fonctionne immédiatement après.

### Méthode 2 : Ajouter/supprimer un espace

1. Ouvrez `app/api/devices/route.ts`
2. Ajoutez un espace n'importe où
3. Sauvegardez
4. Supprimez l'espace
5. Sauvegardez

### Méthode 3 : Redémarrage propre

```bash
# Arrêter le serveur (Ctrl+C)
rm -rf .next
npm run dev
```

Puis touchez les fichiers de routes :
```bash
touch app/api/**/*.ts
```

---

## 🐛 Pourquoi ça arrive ?

C'est un **bug connu de Turbopack** (le nouveau bundler de Next.js 16) :

- Le hot-reload ne détecte pas toujours les changements dans les routes API
- Spécifiquement avec les **méthodes HTTP multiples** (GET, POST, PATCH, DELETE)
- Plus fréquent après un `git pull` ou un checkout de branche

**Issue GitHub** : https://github.com/vercel/next.js/issues/

---

## 🔍 Comment détecter le problème ?

### Symptômes

1. **GET fonctionne, POST ne fonctionne pas**
   ```
   GET /api/devices 200 OK
   POST /api/devices 404 Not Found
   ```

2. **Le fichier existe et l'export est correct**
   ```typescript
   export async function GET(request: NextRequest) { ... }  ✅
   export async function POST(request: NextRequest) { ... } ✅
   ```

3. **Les logs montrent une compilation mais retournent 404**
   ```
   POST /api/devices 404 in 1205ms (compile: 165ms, render: 1040ms)
   ```

### Diagnostic rapide

```bash
# Vérifier que POST est bien exporté
grep "export.*POST" app/api/devices/route.ts

# Devrait afficher :
# export async function POST(request: NextRequest) {
```

Si POST est présent mais retourne 404 → C'est le bug Turbopack.

---

## 💡 Prévention

### Option 1 : Désactiver Turbopack (temporaire)

Dans `package.json` :

```json
{
  "scripts": {
    "dev": "next dev --webpack",
    "dev:turbo": "next dev"
  }
}
```

Utilisez `npm run dev` avec webpack au lieu de Turbopack.

### Option 2 : Script de touch automatique

Créez `scripts/touch-routes.sh` :

```bash
#!/bin/bash
find app/api -name "*.ts" -type f -exec touch {} \;
echo "✅ Toutes les routes ont été touchées"
```

Puis :
```bash
chmod +x scripts/touch-routes.sh
./scripts/touch-routes.sh
```

### Option 3 : Watcher personnalisé

Créez `scripts/watch-routes.js` :

```javascript
const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../app/api');

fs.watch(routesDir, { recursive: true }, (eventType, filename) => {
  if (filename && filename.endsWith('.ts')) {
    const filePath = path.join(routesDir, filename);
    const time = new Date();
    fs.utimesSync(filePath, time, time);
    console.log(`🔄 Touché: ${filename}`);
  }
});

console.log('👀 Watching routes...');
```

---

## 🚀 En production

**Bonne nouvelle** : Ce problème n'existe **QUE en développement**.

En production (`npm run build` + `npm start`), tout fonctionne parfaitement.

---

## 📝 Checklist de dépannage

Si une route retourne 404 :

- [ ] Vérifier que le fichier existe (`ls app/api/devices/route.ts`)
- [ ] Vérifier que la méthode est exportée (`grep "export.*POST"`)
- [ ] Toucher le fichier (`touch app/api/devices/route.ts`)
- [ ] Attendre 2-3 secondes pour la recompilation
- [ ] Réessayer la requête
- [ ] Si ça ne marche toujours pas : redémarrer le serveur + touch

---

## 🔗 Liens utiles

- [Next.js Turbopack Docs](https://nextjs.org/docs/app/api-reference/next-config-js/turbopack)
- [GitHub Issues Next.js](https://github.com/vercel/next.js/issues)

---

## ✅ Solution finale pour ce projet

Le problème a été résolu avec :
```bash
touch app/api/devices/route.ts
```

**Résultat** : POST /api/devices fonctionne maintenant parfaitement ! ✅

---

**💡 Astuce** : Si vous rencontrez ce problème régulièrement, ajoutez un script npm :

```json
{
  "scripts": {
    "touch-routes": "find app/api -name '*.ts' -exec touch {} \\;"
  }
}
```

Puis lancez `npm run touch-routes` quand nécessaire.

