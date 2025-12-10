# 🚀 Déploiement Frontend - Railway

## ✅ Configuration actuelle

Votre application Next.js est **déjà configurée** pour le déploiement sur Railway avec le frontend intégré !

---

## 📦 Que déployer ?

Next.js combine **frontend et backend** dans une seule application :

```
Build Next.js
  ├── Frontend (pages React)
  │   ├── / (landing page)
  │   ├── /admin/* (dashboard admin)
  │   └── /public/* (dashboard public)
  └── Backend (API routes)
      └── /api/* (31 routes API)
```

**Avantage** : Un seul déploiement pour tout !

---

## 🔧 Configuration Railway

### 1. Variables d'environnement

**Essentielles** :
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/workshop?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this-too
NODE_ENV=production
PORT=8080
```

**Optionnelles** :
```env
NEXT_PUBLIC_API_URL=https://projet-workshop-m2tl-production.up.railway.app
```

### 2. Configuration des services

**railway.json** (déjà configuré) :
```json
{
  "healthcheckPath": "/api/health",
  "restartPolicy": "on-failure"
}
```

**nixpacks.toml** (déjà configuré) :
```toml
[phases.setup]
nixPkgs = ['nodejs_20']

[phases.build]
cmds = ['npm install', 'npm run build']

[start]
cmd = 'npm start'
```

---

## 🌐 URLs après déploiement

Votre URL Railway : `https://projet-workshop-m2tl-production.up.railway.app`

### Pages publiques
- Landing page : `https://projet-workshop-m2tl-production.up.railway.app/`
- Dashboard salles : `https://projet-workshop-m2tl-production.up.railway.app/public/rooms`
- API Docs : `https://projet-workshop-m2tl-production.up.railway.app/api-docs`

### Pages admin (auth requise)
- Login : `https://projet-workshop-m2tl-production.up.railway.app/admin/login`
- Register : `https://projet-workshop-m2tl-production.up.railway.app/admin/register`
- Dashboard : `https://projet-workshop-m2tl-production.up.railway.app/admin/dashboard`

### API
- Health : `https://projet-workshop-m2tl-production.up.railway.app/api/health`
- Toutes les routes : `https://projet-workshop-m2tl-production.up.railway.app/api/*`

---

## 🔄 Processus de déploiement

### Option 1 : Déploiement automatique (Git)

Si votre projet est connecté à GitHub :

```bash
# Commit et push
git add .
git commit -m "feat: Add frontend pages (landing, admin, public dashboard)"
git push origin main

# Railway détecte automatiquement et redéploie
```

### Option 2 : Déploiement manuel

Via Railway CLI :

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter
railway login

# Déployer
railway up
```

---

## 📊 Vérification post-déploiement

### 1. Vérifier le healthcheck

```bash
curl https://projet-workshop-m2tl-production.up.railway.app/api/health
```

**Réponse attendue** :
```json
{
  "status": "ok",
  "timestamp": "2025-12-10T12:00:00.000Z"
}
```

### 2. Vérifier la landing page

Ouvrir dans le navigateur :
```
https://projet-workshop-m2tl-production.up.railway.app/
```

✅ La page doit s'afficher avec le design complet

### 3. Tester le dashboard public

```
https://projet-workshop-m2tl-production.up.railway.app/public/rooms
```

✅ La liste des salles doit s'afficher (ou état vide si pas encore de données)

### 4. Tester l'authentification

**Créer un compte** :
```bash
curl -X POST https://projet-workshop-m2tl-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123!",
    "displayName": "Admin Test"
  }'
```

**Se connecter** :
```
https://projet-workshop-m2tl-production.up.railway.app/admin/login
```

✅ Le formulaire doit fonctionner et rediriger vers le dashboard

---

## 🐛 Troubleshooting

### Problème : Page blanche / 404

**Cause** : Le build Next.js a échoué

**Solution** :
```bash
# Vérifier les logs Railway
railway logs

# Tester le build en local
npm run build
```

### Problème : "Failed to fetch" sur les API calls

**Cause** : CORS ou routes API non accessibles

**Solution** :
Vérifier que `middleware.ts` est bien déployé :
```typescript
// middleware.ts doit inclure les headers CORS
```

### Problème : "Unauthorized" sur le dashboard admin

**Cause** : Tokens JWT non valides ou expirés

**Solution** :
1. Vérifier que `JWT_SECRET` est défini dans Railway
2. Se reconnecter via `/admin/login`
3. Vider le localStorage si nécessaire

### Problème : Styles Tailwind manquants

**Cause** : Build CSS incomplet

**Solution** :
```bash
# Vérifier tailwind.config.ts
# Rebuild
npm run build
```

---

## 🔐 Sécurité en production

### 1. Variables d'environnement

⚠️ **Ne jamais commit** les secrets dans Git :

```bash
# .gitignore doit contenir :
.env
.env.local
.env.production
```

### 2. JWT Secrets

Générer des secrets forts :

```bash
# Générer un secret aléatoire
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. HTTPS

✅ Railway fournit automatiquement HTTPS

### 4. Rate limiting

**TODO** : Ajouter un rate limiter pour les routes auth :

```typescript
// À implémenter
import rateLimit from 'express-rate-limit';
```

---

## 📈 Performance

### 1. Vérifier les temps de chargement

```bash
# Lighthouse audit
npx lighthouse https://projet-workshop-m2tl-production.up.railway.app
```

### 2. Optimiser les images

Next.js optimise automatiquement les images avec `next/image` :

```tsx
import Image from 'next/image';

<Image 
  src="/logo.png" 
  width={100} 
  height={100} 
  alt="Logo"
/>
```

### 3. Monitoring

**Railway Dashboard** :
- CPU Usage
- Memory Usage
- Request Count
- Response Times

---

## 🎯 Checklist de déploiement

### Avant le déploiement

- [ ] Build local réussi (`npm run build`)
- [ ] Tests manuels en local
- [ ] Variables d'environnement configurées
- [ ] MongoDB Atlas accessible depuis Railway
- [ ] JWT secrets configurés

### Pendant le déploiement

- [ ] Push vers GitHub ou `railway up`
- [ ] Surveiller les logs (`railway logs`)
- [ ] Attendre "Deploy successful"

### Après le déploiement

- [ ] Healthcheck OK (`/api/health`)
- [ ] Landing page accessible
- [ ] Dashboard public accessible
- [ ] Login admin fonctionne
- [ ] Dashboard admin accessible après login
- [ ] API Docs accessible (`/api-docs`)
- [ ] Tester quelques routes API

---

## 🌍 Domaine personnalisé (optionnel)

### 1. Ajouter un domaine dans Railway

```
Settings > Domains > Add Custom Domain
```

### 2. Configurer le DNS

Ajouter un enregistrement CNAME :
```
CNAME  workshop  ->  projet-workshop-m2tl-production.up.railway.app
```

### 3. Attendre la propagation DNS

```bash
# Vérifier la propagation
dig workshop.votredomaine.com
```

---

## 📚 Ressources

- **Railway Docs** : https://docs.railway.app
- **Next.js Deployment** : https://nextjs.org/docs/deployment
- **MongoDB Atlas** : https://www.mongodb.com/cloud/atlas

---

## ✅ État actuel

✅ Frontend développé (landing, admin, public)  
✅ Backend API (31 routes)  
✅ Configuration Railway prête  
✅ Build sans erreur  
✅ Prêt pour le déploiement  

---

## 🚀 Déployer maintenant !

```bash
# Commit les changements
git add .
git commit -m "feat: Add complete frontend with admin and public dashboards"
git push origin main

# Railway redéploie automatiquement
# Surveiller : https://railway.app/dashboard
```

🎉 **Votre application sera live dans quelques minutes !**

