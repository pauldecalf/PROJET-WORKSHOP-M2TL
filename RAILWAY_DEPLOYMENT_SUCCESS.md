# ✅ Vérifier le Déploiement Railway

## 🔍 Comment surveiller

### 1️⃣ Accédez aux logs Railway

1. **Allez sur** : https://railway.app/dashboard
2. **Ouvrez** : `projet-workshop-m2tl`
3. **Cliquez sur** : Votre service Next.js
4. **Onglet** : **"Deployments"**
5. **Sélectionnez** : Le déploiement en cours (avec l'icône ⏳ ou ✅)

### 2️⃣ Logs à surveiller

**✅ Signes de succès** :
```
Building...
✓ Build completed
Starting Container
npm start
✓ Ready in 500ms
✅ Connecté à MongoDB
GET /api/health 200 in 5ms
```

**Et surtout, ABSENCE de** :
```
Stopping Container ❌
SIGTERM ❌
```

### 3️⃣ Testez l'application

Une fois déployé (attendez 2-3 minutes), testez :

```bash
# Test 1 : Healthcheck
curl https://projet-workshop-m2tl-production.up.railway.app/api/health

# Devrait retourner :
# {"status":"ok","timestamp":"...","uptime":123.45,"environment":"production"}

# Test 2 : Page d'accueil
curl https://projet-workshop-m2tl-production.up.railway.app/

# Test 3 : API Devices
curl https://projet-workshop-m2tl-production.up.railway.app/api/devices

# Test 4 : Créer un device
curl -X POST https://projet-workshop-m2tl-production.up.railway.app/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "serialNumber": "RAILWAY-PROD-001",
    "name": "Device Production",
    "status": "ONLINE",
    "batteryLevel": 100
  }'

# Devrait retourner 201 Created avec les données
```

---

## 📊 Checklist de déploiement réussi

- [ ] Build Railway terminé sans erreur
- [ ] Logs montrent "✅ Connecté à MongoDB"
- [ ] Logs montrent "✓ Ready"
- [ ] **AUCUN** "Stopping Container" dans les logs
- [ ] `curl /api/health` retourne 200 OK
- [ ] `curl /api/devices` retourne des données
- [ ] POST /api/devices fonctionne (201 Created)
- [ ] Swagger UI accessible : `/api-docs`

---

## 🎉 Si tout fonctionne

Votre application est **100% opérationnelle** sur Railway ! 🚀

**URLs disponibles** :
- **Production** : https://projet-workshop-m2tl-production.up.railway.app/
- **Swagger UI** : https://projet-workshop-m2tl-production.up.railway.app/api-docs
- **API Devices** : https://projet-workshop-m2tl-production.up.railway.app/api/devices
- **Healthcheck** : https://projet-workshop-m2tl-production.up.railway.app/api/health

---

## 🐛 Si ça ne fonctionne toujours pas

### Logs montrent encore SIGTERM

**Vérifiez** :
1. MongoDB Atlas Network Access → `0.0.0.0/0` autorisé
2. Variables Railway → `MONGODB_URI` correctement configuré
3. railway.json présent dans le repo

**Testez manuellement le healthcheck** :
```bash
curl https://projet-workshop-m2tl-production.up.railway.app/api/health
```

Si ça retourne 200 mais Railway crash quand même, **désactivez temporairement le healthcheck** :
- Railway Dashboard → Settings → Uncheck "Health Check"

### Logs montrent erreur MongoDB

```
MongooseServerSelectionError
```

**Solution** :
1. MongoDB Atlas → Network Access
2. Vérifiez que `0.0.0.0/0` est dans la liste
3. Si non, ajoutez-le
4. Redéployez sur Railway

### Build échoue

**Solution** :
```bash
# En local, testez le build
npm run build

# Si ça échoue localement, corrigez
# Puis push
git add .
git commit -m "Fix build"
git push
```

---

## 🔄 Forcer un redéploiement

Si Railway n'a pas redéployé automatiquement :

1. Railway Dashboard → Votre service
2. **Settings** → **Redeploy**
3. Ou modifiez une variable d'environnement (ajoutez un espace et supprimez-le)

---

## 📈 Monitoring continu

### Voir les logs en temps réel

```bash
# Installez Railway CLI
npm install -g @railway/cli

# Connectez-vous
railway login

# Voir les logs
railway logs
```

### Métriques

Railway Dashboard → **Metrics** :
- CPU usage
- Memory usage
- Network traffic
- Requests per minute

---

## 🎯 Performances attendues

| Métrique | Valeur normale |
|----------|----------------|
| Temps de démarrage | < 1 seconde |
| Temps de connexion MongoDB | < 10 secondes |
| Réponse /api/health | < 10ms |
| Réponse /api/devices | < 100ms |
| Mémoire utilisée | ~100-200 MB |
| CPU idle | < 5% |

---

## ✅ Prochaines étapes

Une fois l'application déployée avec succès :

1. **Initialisez la base de données** (si vide) :
   - Utilisez MongoDB Compass pour importer des données
   - Ou créez quelques devices via l'API

2. **Testez toutes les routes** dans Swagger UI

3. **Configurez un domaine personnalisé** (optionnel)
   - Railway → Settings → Domains

4. **Ajoutez des variables d'environnement** supplémentaires
   - `NEXT_PUBLIC_API_URL`
   - Secrets d'authentification (futur)

5. **Configurez les alertes** Railway
   - Pour être notifié en cas de crash

---

## 📚 Documentation déployée

Sur Railway, toute votre documentation sera accessible :
- **`/api-docs`** → Swagger UI interactif
- **`/api/swagger`** → Spec OpenAPI JSON

Partagez simplement l'URL avec votre équipe ! 🎉

---

**⏰ Temps estimé de déploiement** : 2-3 minutes

**🎯 Rendez-vous sur Railway Dashboard pour surveiller !**

