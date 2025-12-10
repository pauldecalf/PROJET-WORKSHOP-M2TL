# 🔧 Fix 404 sur les Routes API

## 🚨 Problème

Vous voyez dans les logs :
```
✅ Connecté à MongoDB
POST /api/devices 404 in 1277ms
```

MongoDB est bien connecté mais les routes retournent 404.

---

## ✅ Solutions

### Solution 1 : Nettoyer le cache Next.js (Recommandé)

```bash
# Arrêter le serveur (Ctrl+C)

# Nettoyer le cache
rm -rf .next

# Redémarrer
npm run dev
```

### Solution 2 : Redémarrage complet

```bash
# Arrêter le serveur (Ctrl+C)

# Nettoyer tout
rm -rf .next node_modules/.cache

# Redémarrer
npm run dev
```

### Solution 3 : Vérifier la structure des fichiers

Les routes doivent être dans :
```
app/api/devices/route.ts       ← GET, POST
app/api/devices/[id]/route.ts  ← GET, PATCH, DELETE
```

Si les fichiers sont là, c'est juste un problème de cache.

---

## 🧪 Tester après le fix

### 1. Vérifier que le serveur démarre

Vous devriez voir :
```
✅ Connecté à MongoDB
✓ Ready in 1234ms
- Local: http://localhost:3000
```

### 2. Tester GET

Ouvrez dans le navigateur :
```
http://localhost:3000/api/devices
```

Devrait retourner :
```json
{
  "success": true,
  "count": 0,
  "data": []
}
```

### 3. Tester POST

```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "serialNumber": "ESP32-TEST-001",
    "name": "Device de test",
    "status": "ONLINE",
    "batteryLevel": 100
  }'
```

Devrait retourner `201 Created` avec les données du device.

---

## 🐛 Si ça ne fonctionne toujours pas

### Vérifier que les fichiers existent

```bash
ls -la app/api/devices/
# Devrait afficher :
# route.ts
# [id]/
```

### Vérifier le contenu

```bash
head -20 app/api/devices/route.ts
# Devrait commencer par :
# import { NextRequest, NextResponse } from 'next/server';
# ...
# export async function GET(request: NextRequest) {
# export async function POST(request: NextRequest) {
```

### Forcer la recompilation

```bash
# Arrêter le serveur
# Supprimer TOUT le cache
rm -rf .next node_modules/.cache

# Rebuild complet
npm run build

# Redémarrer
npm run dev
```

---

## 🎯 Cause probable

Le **cache de Next.js** n'a pas détecté les changements dans les routes API.

C'est un problème connu avec Next.js 16 + Turbopack en mode dev.

**La solution est simple** : Nettoyer `.next` et redémarrer.

---

## ✅ Checklist

- [ ] Serveur arrêté (Ctrl+C)
- [ ] Cache nettoyé (`rm -rf .next`)
- [ ] Serveur redémarré (`npm run dev`)
- [ ] Logs montrent "✅ Connecté à MongoDB"
- [ ] Logs montrent "✓ Ready"
- [ ] GET /api/devices retourne 200
- [ ] POST /api/devices retourne 201

---

**Une fois le cache nettoyé, toutes vos routes fonctionneront ! 🚀**

