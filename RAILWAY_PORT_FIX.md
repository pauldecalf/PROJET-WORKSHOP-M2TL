# 🔧 Fix Railway : Application qui redémarre en boucle

## 🚨 Problème

Votre application sur Railway démarre avec succès mais s'arrête immédiatement :

```
✓ Ready in 507ms
Stopping Container
npm error signal SIGTERM
```

**Pattern** : Starting → Ready → Stopping → Starting (boucle infinie)

---

## 🔍 Causes possibles

### 1. Healthcheck qui échoue
Railway vérifie que l'app répond sur `/` mais si ça prend trop de temps ou si MongoDB n'est pas encore connecté, le healthcheck échoue.

### 2. Port incorrect
Next.js doit écouter sur le PORT fourni par Railway (variable d'environnement `$PORT`).

### 3. Timeout de démarrage
Railway a un timeout de 60 secondes. Si MongoDB prend trop de temps à se connecter, Railway pense que l'app a crashé.

---

## ✅ Solutions

### Solution 1 : Vérifier les variables Railway (Important!)

Sur Railway Dashboard → Votre service → Variables :

**Variables requises** :
```env
MONGODB_URI=mongodb+srv://admin:admin@atlascluster.vfolo9m.mongodb.net/workshop
PORT=8080
```

**Note** : Railway injecte automatiquement `PORT` mais vérifiez qu'il n'y a pas de conflit.

### Solution 2 : Augmenter le timeout healthcheck

Les fichiers `railway.json` et `nixpacks.toml` ont été créés avec :
- Healthcheck timeout augmenté à 100s
- Retry policy configurée
- Build et start optimisés

**Committez ces fichiers** :
```bash
git add railway.json nixpacks.toml
git commit -m "Configure Railway deployment settings"
git push
```

### Solution 3 : Vérifier MongoDB Atlas

1. **MongoDB Atlas** → **Network Access**
   - Vérifiez que `0.0.0.0/0` est autorisé
   - Ou ajoutez les IPs de Railway

2. **Testez la connexion** depuis votre machine :
   ```bash
   mongosh "mongodb+srv://admin:admin@atlascluster.vfolo9m.mongodb.net/workshop"
   ```

### Solution 4 : Améliorer la connexion MongoDB

Modifiez `lib/mongodb.ts` pour gérer mieux les timeouts :

```typescript
// lib/mongodb.ts
const opts = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 10000, // 10s max pour se connecter
  socketTimeoutMS: 45000,           // 45s timeout
  maxPoolSize: 10,
};
```

### Solution 5 : Route de healthcheck dédiée

Créez `app/api/health/route.ts` :

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  // Healthcheck sans dépendance à MongoDB
  return NextResponse.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}
```

Puis dans `railway.json`, changez :
```json
{
  "deploy": {
    "healthcheckPath": "/api/health"
  }
}
```

---

## 🧪 Diagnostic détaillé

### Voir les logs complets Railway

1. Railway Dashboard → Deployments
2. Cliquez sur le déploiement actif
3. Regardez les logs **COMPLETS**, pas seulement le début

**Cherchez** :
- `✅ Connecté à MongoDB` (MongoDB OK)
- Erreurs de connexion
- Timeout messages
- Healthcheck failures

### Tester localement en mode production

```bash
# Build production
npm run build

# Lancer en production avec le même port que Railway
PORT=8080 npm start
```

Si ça fonctionne localement en mode production, le problème est spécifique à Railway.

---

## 🎯 Solution la plus probable

Le problème est que **MongoDB prend du temps à se connecter** et Railway pense que l'app a crashé avant que la connexion soit établie.

### Fix immédiat

1. **Vérifiez que `MONGODB_URI` est correct** sur Railway
   ```
   mongodb+srv://admin:admin@atlascluster.vfolo9m.mongodb.net/workshop
   ```

2. **Vérifiez MongoDB Atlas Network Access** : `0.0.0.0/0` doit être autorisé

3. **Committez et poussez** les fichiers de config Railway :
   ```bash
   git add railway.json nixpacks.toml
   git commit -m "Fix Railway healthcheck and timeouts"
   git push
   ```

4. **Attendez le redéploiement** (2-3 minutes)

5. **Vérifiez les logs** - vous devriez voir :
   ```
   ✅ Connecté à MongoDB
   ✓ Ready in 507ms
   GET /api/health 200
   ```
   
   Et **PAS** :
   ```
   Stopping Container
   ```

---

## 🔍 Autres vérifications

### Vérifier que MongoDB répond

```bash
# Test de connexion depuis votre machine
mongosh "mongodb+srv://admin:admin@atlascluster.vfolo9m.mongodb.net/workshop" --eval "db.adminCommand('ping')"
```

Devrait retourner `{ ok: 1 }`

### Vérifier les credentials MongoDB

- Username : `admin`
- Password : `admin` (⚠️ changez ça en production !)
- Cluster : `atlascluster.vfolo9m.mongodb.net`
- Database : `workshop`

### Vérifier la whitelist IP MongoDB Atlas

Railway utilise des IPs dynamiques. Vous **DEVEZ** autoriser `0.0.0.0/0` (toutes les IPs) dans MongoDB Atlas → Network Access.

---

## 📊 Checklist de dépannage

- [ ] `MONGODB_URI` est configuré sur Railway
- [ ] MongoDB Atlas Network Access autorise `0.0.0.0/0`
- [ ] Connexion MongoDB testée avec mongosh
- [ ] Fichiers `railway.json` et `nixpacks.toml` ajoutés
- [ ] Git push effectué
- [ ] Nouveau déploiement lancé
- [ ] Logs montrent "✅ Connecté à MongoDB"
- [ ] Application ne redémarre plus en boucle

---

## 🚨 Si ça ne fonctionne toujours pas

### Option nucléaire : Désactiver le healthcheck temporairement

Dans Railway Dashboard → Settings → Health Check :
- **Désactivez temporairement** le healthcheck

Cela permet de voir si l'app fonctionne réellement une fois démarrée.

### Alternative : Utiliser un autre port

Railway devrait injecter automatiquement `PORT`. Vérifiez dans Variables qu'il n'y a pas de conflit.

---

## 💡 Pourquoi ça marche en local mais pas sur Railway ?

| Aspect | Local | Railway |
|--------|-------|---------|
| MongoDB | Connexion rapide (même réseau) | Connexion lente (Internet) |
| Port | 3000 par défaut | 8080 (variable `$PORT`) |
| Healthcheck | Aucun | Obligatoire dans les 60s |
| Build | Dev mode (`npm run dev`) | Production (`npm start`) |

---

## ✅ État final attendu

Après la correction, les logs Railway devraient montrer :

```
Starting Container
npm start
✓ Ready in 507ms
✅ Connecté à MongoDB
GET / 200 in 123ms
GET /api/devices 200 in 45ms
```

Et **AUCUN** :
```
Stopping Container ❌
SIGTERM ❌
```

---

**🎯 Action immédiate** :

1. Vérifiez Network Access sur MongoDB Atlas
2. Committez les fichiers de config Railway
3. Attendez le redéploiement
4. Surveillez les logs

Si le problème persiste, partagez les **logs complets** du déploiement Railway.

