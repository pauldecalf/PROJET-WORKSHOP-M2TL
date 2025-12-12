# ⚡ Commandes Essentielles

## 🚀 Démarrage Rapide

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

Si `.env.local` n'existe pas, créer le fichier :

```bash
cat > .env.local << EOF
MONGODB_URI=mongodb://localhost:27017/campus-iot
JWT_SECRET=votre-secret-jwt-tres-securise-changez-moi-en-production
EOF
```

### 3. Créer l'utilisateur admin

**IMPORTANT** : Créez d'abord l'utilisateur admin pour pouvoir vous connecter :

```bash
npm run create-admin
```

### 4. Seed la base de données (optionnel)

Si vous voulez des données de test complètes :

```bash
npm run seed
```

### 5. Lancer le serveur de développement

```bash
npm run dev
```

Le serveur démarre sur http://localhost:3000

---

## 📱 Accès aux Pages

| Page | URL | Description |
|------|-----|-------------|
| **Accueil Public** | http://localhost:3000 | Page d'accueil avec liste des salles |
| **Login Admin** | http://localhost:3000/admin/login | Connexion administrateur |
| **Dashboard Admin** | http://localhost:3000/admin | Dashboard (après connexion) |
| **Dashboard** | http://localhost:3000/dashboard | Vue dashboard général |

---

## 🔑 Identifiants de Test

```
Email: admin@campus.fr
Mot de passe: admin123
Rôle: SUPERVISOR
```

---

## 🛠️ Commandes de Développement

### Lancer le serveur (mode dev)
```bash
npm run dev
```

### Build pour la production
```bash
npm run build
```

### Lancer en production
```bash
npm run start
```

### Linter
```bash
npm run lint
```

### Créer l'utilisateur admin
```bash
npm run create-admin
```

### Seed la database
```bash
npm run seed
```

---

## 🧪 Test des Fonctionnalités

### Test 1 : Espace Public
```bash
# 1. Lancer le serveur
npm run dev

# 2. Ouvrir dans le navigateur
open http://localhost:3000

# 3. Vérifier :
# - Hero section s'affiche
# - Liste des salles apparaît
# - Filtres fonctionnent
# - Bouton "Connexion administrateur" est visible
```

### Test 2 : Connexion Admin
```bash
# 1. Aller sur la page de login
open http://localhost:3000/admin/login

# 2. Se connecter avec :
# Email: admin@campus.fr
# Password: admin123

# 3. Vérifier :
# - Redirection vers /admin
# - Avatar apparaît en haut à droite
# - Menu "Administration" visible dans sidebar
```

### Test 3 : Dashboard Admin
```bash
# 1. Une fois connecté, aller sur /admin
open http://localhost:3000/admin

# 2. Tester :
# - Créer un bâtiment
# - Créer une salle
# - Créer un device
# - Modifier un device
# - Voir les logs
```

### Test 4 : Déconnexion
```bash
# 1. Cliquer sur avatar (en haut à droite)
# 2. Cliquer sur "Déconnexion"
# 3. Vérifier :
# - Redirection vers /
# - Menu "Administration" disparaît
# - Bouton "Connexion" apparaît
```

### Test 5 : Protection des Routes
```bash
# 1. Se déconnecter
# 2. Essayer d'accéder à /admin directement
open http://localhost:3000/admin

# 3. Vérifier :
# - Redirection automatique vers /admin/login
```

---

## 🔍 Debug

### Voir les tokens stockés (Console navigateur)
```javascript
localStorage.getItem('accessToken')
localStorage.getItem('refreshToken')
```

### Nettoyer les tokens
```javascript
localStorage.removeItem('accessToken')
localStorage.removeItem('refreshToken')
```

### Vérifier l'API
```bash
curl http://localhost:3000/api/health
```

### Vérifier MongoDB
```bash
# Si MongoDB local
mongosh campus-iot --eval "db.rooms.countDocuments()"
```

---

## 📊 Données de Test

### Créer des données de test
```bash
npm run seed
```

Cela créera :
- 2-3 bâtiments
- 10-15 salles
- 10-15 devices
- 1 utilisateur admin
- Données de télémétrie aléatoires

### Voir les données créées

#### Bâtiments
```bash
curl http://localhost:3000/api/buildings | jq
```

#### Salles
```bash
curl http://localhost:3000/api/rooms | jq
```

#### Devices
```bash
curl http://localhost:3000/api/devices | jq
```

---

## 🐛 Résolution de Problèmes

### Problème : Port 3000 déjà utilisé

```bash
# Trouver le process qui utilise le port 3000
lsof -ti:3000

# Tuer le process
kill -9 $(lsof -ti:3000)

# Ou utiliser un autre port
PORT=3001 npm run dev
```

### Problème : MongoDB ne se connecte pas

```bash
# Vérifier si MongoDB est lancé
ps aux | grep mongod

# Lancer MongoDB (macOS avec Homebrew)
brew services start mongodb-community

# Ou avec Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Problème : Types TypeScript

```bash
# Régénérer les types
rm -rf .next
npm run dev
```

### Problème : Cache Next.js

```bash
# Nettoyer le cache
rm -rf .next
npm run dev
```

### Problème : node_modules corrompus

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Production

### Build
```bash
npm run build
```

### Vérifier le build
```bash
npm run start
```

### Variables d'environnement pour la production

```bash
# .env.production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/campus-iot
JWT_SECRET=un-secret-tres-securise-minimum-32-caracteres
NODE_ENV=production
```

---

## 🚀 Déploiement

### Vercel (Recommandé pour Next.js)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Configurer les variables d'env sur vercel.com
# - MONGODB_URI
# - JWT_SECRET
```

### Docker

```bash
# Build l'image
docker build -t campus-iot .

# Lancer le container
docker run -p 3000:3000 \
  -e MONGODB_URI="mongodb://host.docker.internal:27017/campus-iot" \
  -e JWT_SECRET="your-secret" \
  campus-iot
```

---

## 📚 Commandes Utiles

### Voir les logs en temps réel
```bash
npm run dev 2>&1 | tee dev.log
```

### Vérifier la version de Node
```bash
node --version  # Doit être >= 18
```

### Vérifier la version de npm
```bash
npm --version
```

### Mettre à jour les dépendances
```bash
npm update
```

### Vérifier les dépendances obsolètes
```bash
npm outdated
```

---

## 🎯 Checklist de Démarrage

- [ ] `npm install` exécuté sans erreur
- [ ] `.env.local` créé avec bonnes variables
- [ ] MongoDB est lancé et accessible
- [ ] `npm run seed` a créé les données
- [ ] `npm run dev` démarre sans erreur
- [ ] http://localhost:3000 s'ouvre dans le navigateur
- [ ] Page d'accueil s'affiche correctement
- [ ] Connexion admin fonctionne
- [ ] Dashboard admin est accessible
- [ ] Déconnexion fonctionne
- [ ] Dark/Light mode fonctionne

---

## 💡 Astuces

### VSCode Extensions Recommandées
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Scripts package.json
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "seed": "tsx scripts/seed-database.ts"
  }
}
```

---

## 🎉 Tout est Prêt !

Maintenant vous pouvez :
1. ✅ Développer de nouvelles fonctionnalités
2. ✅ Tester l'application
3. ✅ Présenter le projet
4. ✅ Déployer en production

**Bon développement ! 🚀**

