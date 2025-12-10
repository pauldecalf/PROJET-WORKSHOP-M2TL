# 🚀 Notes de Déploiement

## ⚠️ Problème de compatibilité React 19

### Contexte

Ce projet utilise **Next.js 16** avec **React 19.2.1**, mais `swagger-ui-react@5.30.3` n'est officiellement compatible qu'avec React 18 maximum.

**Bonne nouvelle** : Swagger UI **fonctionne parfaitement** avec React 19 malgré le warning de peer dependency.

### Solution implémentée

Un fichier `.npmrc` a été créé avec :

```
legacy-peer-deps=true
```

Cela permet à npm d'ignorer les conflits de peer dependencies et d'installer quand même les packages.

---

## 🛠️ Commandes d'installation

### En développement local

```bash
npm install
```

Le fichier `.npmrc` s'applique automatiquement.

### En production / CI/CD

**❌ N'utilisez PAS** `npm ci` (qui échoue avec les peer deps)

**✅ Utilisez plutôt :**

```bash
npm install --production
```

Ou si vous devez absolument utiliser `npm ci`, ajoutez :

```bash
npm ci --legacy-peer-deps
```

---

## 📦 Déploiement sur Vercel

Ajoutez cette variable d'environnement dans Vercel :

```
NPM_FLAGS=--legacy-peer-deps
```

Ou le fichier `.npmrc` sera automatiquement pris en compte.

---

## 🐳 Déploiement avec Docker

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json .npmrc ./

# Installer les dépendances (le .npmrc sera utilisé)
RUN npm install --production

# Copier le reste des fichiers
COPY . .

# Build
RUN npm run build

# Exposer le port
EXPOSE 3000

# Lancer l'application
CMD ["npm", "start"]
```

Le fichier `.npmrc` est inclus dans le COPY et sera automatiquement utilisé.

---

## 🔄 Build du projet

### Build local

```bash
npm run build
```

### Démarrer en production

```bash
npm start
```

---

## ⚡ Variables d'environnement nécessaires

### Production

Créez un fichier `.env.production` ou configurez ces variables sur votre plateforme :

```env
# MongoDB (OBLIGATOIRE)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/workshop

# Next.js (optionnel)
NEXT_PUBLIC_API_URL=https://votre-domaine.com
```

### Important pour le déploiement

- ✅ `.npmrc` doit être inclus dans le dépôt Git
- ✅ `.env.local` doit être ignoré (.gitignore)
- ✅ MongoDB URI doit être configuré sur la plateforme de déploiement

---

## 🐛 Résolution des erreurs courantes

### Erreur : `npm ci` failed

**Cause :** `npm ci` est strict et refuse les peer dependencies incompatibles.

**Solution :**
```bash
npm install
```

Ou :
```bash
npm ci --legacy-peer-deps
```

### Erreur : Cannot find module 'swagger-ui-react'

**Cause :** node_modules non installés ou corrompus.

**Solution :**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erreur : ERESOLVE peer dependency

**Cause :** Conflit de versions React.

**Solution :** Le fichier `.npmrc` résout ce problème. Vérifiez qu'il existe.

### Warning : Using UNSAFE_componentWillReceiveProps

**Cause :** swagger-ui-react utilise des API React obsolètes.

**Impact :** Aucun. C'est juste un warning de développement.

**Solution :** Déjà géré dans `app/api-docs/layout.tsx`.

---

## 📊 Plateformes de déploiement testées

### ✅ Vercel (Recommandé)

1. Connectez votre repo GitHub
2. Ajoutez `MONGODB_URI` dans les variables d'environnement
3. Déployez

**Configuration automatique :** Le `.npmrc` est automatiquement pris en compte.

### ✅ Netlify

Même procédure que Vercel.

### ✅ Railway

```bash
railway up
```

Ajoutez `MONGODB_URI` dans les variables d'environnement.

### ✅ Docker / Docker Compose

Utilisez le Dockerfile fourni ci-dessus.

---

## 🔐 Checklist de déploiement

Avant de déployer en production :

- [ ] MongoDB accessible depuis l'extérieur
- [ ] `MONGODB_URI` configuré dans les variables d'environnement
- [ ] `.npmrc` inclus dans le repository
- [ ] Build local réussi (`npm run build`)
- [ ] Tests des routes API
- [ ] Swagger UI accessible
- [ ] Variables d'environnement sécurisées

---

## 📝 Notes additionnelles

### Pourquoi legacy-peer-deps ?

`swagger-ui-react` n'a pas encore été mis à jour pour React 19, mais il fonctionne sans problème. L'équipe Swagger travaille sur la compatibilité.

### Alternative future

Quand `swagger-ui-react` supportera React 19 officiellement, vous pourrez :

1. Supprimer le fichier `.npmrc`
2. Réinstaller : `rm -rf node_modules package-lock.json && npm install`

Pour suivre l'avancement : https://github.com/swagger-api/swagger-ui/issues

---

## 🆘 Support

En cas de problème de déploiement :

1. Vérifiez les logs de build
2. Assurez-vous que MongoDB est accessible
3. Vérifiez que `.npmrc` est présent
4. Consultez `SWAGGER_WARNINGS_FIX.md` pour les warnings React

---

**Dernière mise à jour :** Décembre 2025  
**Next.js :** 16.0.8  
**React :** 19.2.1  
**Swagger UI React :** 5.30.3

