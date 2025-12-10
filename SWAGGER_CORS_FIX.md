# 🔧 Fix CORS pour Swagger UI

## 🚨 Problème

Dans Swagger UI, lorsque vous cliquez sur "Try it out" → "Execute", vous voyez :

```
Failed to fetch.
Possible Reasons:
- CORS
- Network Failure
- URL scheme must be "http" or "https" for CORS request.
```

## 🔍 Cause

Swagger UI (qui tourne dans votre navigateur) essaie d'appeler vos API, mais le navigateur bloque la requête car les en-têtes CORS ne sont pas configurés.

**CORS** = Cross-Origin Resource Sharing (sécurité du navigateur)

---

## ✅ Solution appliquée

### 1️⃣ Middleware CORS créé

Un fichier `middleware.ts` a été créé à la racine qui ajoute automatiquement les en-têtes CORS à toutes les routes API.

**Ce que ça fait** :
- Autorise les requêtes depuis n'importe quelle origine (`*`)
- Permet les méthodes GET, POST, PUT, DELETE, PATCH, OPTIONS
- Gère les requêtes preflight OPTIONS

### 2️⃣ Redémarrage du serveur

Le serveur a été redémarré pour prendre en compte le middleware.

---

## 🧪 Tester la correction

### 1. Ouvrez Swagger UI

```
http://localhost:3000/api-docs
```

### 2. Testez une route simple

1. Trouvez **GET /api/devices**
2. Cliquez sur **"Try it out"**
3. Cliquez sur **"Execute"**

**✅ Vous devriez voir** :
```json
{
  "success": true,
  "count": 1,
  "data": [...]
}
```

**❌ Si vous voyez encore "Failed to fetch"** :
- Vérifiez que le serveur est bien démarré
- Rafraîchissez la page Swagger (Ctrl+Shift+R)
- Vérifiez les logs du terminal

### 3. Testez POST /api/devices

1. Trouvez **POST /api/devices**
2. Cliquez sur **"Try it out"**
3. Modifiez le JSON :
   ```json
   {
     "serialNumber": "SWAGGER-TEST-001",
     "name": "Test depuis Swagger",
     "status": "ONLINE",
     "batteryLevel": 100
   }
   ```
4. Cliquez sur **"Execute"**

**✅ Vous devriez voir** : `201 Created` avec les données du device créé

---

## 🔧 Si ça ne fonctionne toujours pas

### Solution 1 : Vérifier que le middleware est actif

Testez avec curl :
```bash
curl -I http://localhost:3000/api/devices
```

Vous devriez voir dans les headers :
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
```

### Solution 2 : Vérifier l'URL dans Swagger

Dans Swagger UI, en haut, vous devriez voir :
```
Servers: http://localhost:3000
```

Si l'URL est incorrecte, Swagger ne peut pas appeler l'API.

### Solution 3 : Désactiver temporairement HTTPS (si applicable)

Si vous êtes en HTTPS local, passez en HTTP :
```
http://localhost:3000/api-docs
```

### Solution 4 : Vider le cache du navigateur

```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

Ou ouvrez en navigation privée.

---

## 🌐 En production (Railway)

Le middleware CORS fonctionnera aussi sur Railway. Après le prochain push :

```bash
git add middleware.ts
git commit -m "Add CORS middleware for Swagger UI"
git push
```

Swagger UI sur Railway fonctionnera également :
```
https://projet-workshop-m2tl-production.up.railway.app/api-docs
```

---

## 🔐 Sécurité CORS en production

**Note** : Actuellement, CORS est configuré avec `*` (toutes origines autorisées).

### Pour la production réelle, limitez les origines :

```typescript
// middleware.ts
const allowedOrigins = [
  'https://votre-domaine.com',
  'https://projet-workshop-m2tl-production.up.railway.app',
];

const origin = request.headers.get('origin');
if (origin && allowedOrigins.includes(origin)) {
  response.headers.set('Access-Control-Allow-Origin', origin);
}
```

---

## 📊 Configuration actuelle

| Paramètre | Valeur |
|-----------|--------|
| Allow-Origin | `*` (toutes) |
| Allow-Methods | GET, POST, PUT, DELETE, PATCH, OPTIONS |
| Allow-Headers | Content-Type, Authorization |
| Max-Age | 86400 (24h) |

---

## 🎯 Checklist

- [x] Middleware CORS créé (`middleware.ts`)
- [x] Serveur redémarré
- [ ] Testez Swagger UI : http://localhost:3000/api-docs
- [ ] GET /api/devices fonctionne
- [ ] POST /api/devices fonctionne
- [ ] Pushez sur Railway pour production

---

## 💡 Pourquoi ce problème arrive ?

**Sécurité du navigateur** : Par défaut, les navigateurs bloquent les requêtes JavaScript vers des API qui ne déclarent pas explicitement autoriser ces requêtes.

**Swagger UI** est une application JavaScript qui tourne dans votre navigateur et qui appelle vos API. Sans CORS, le navigateur bloque ces appels.

**Le middleware** ajoute les en-têtes nécessaires pour dire au navigateur : "Oui, ces requêtes sont autorisées".

---

## 🚀 Prochaine étape

Une fois que Swagger UI fonctionne :

1. **Documentez vos tests** dans Swagger
2. **Partagez l'URL** avec votre équipe
3. **Exportez le spec OpenAPI** : `/api/swagger`
4. **Utilisez dans Postman/Insomnia** pour tests automatisés

---

**✅ Swagger UI devrait maintenant fonctionner parfaitement !**

Rafraîchissez la page et testez "Try it out" → "Execute" ! 🎉

