# 🔧 Solution au Problème de Connexion

## ❌ Problème
"Identifiants invalides" lors de la tentative de connexion avec `admin@campus.fr` / `admin123`

## ✅ Solutions

### Solution 1 : Créer l'utilisateur admin (RECOMMANDÉ)

J'ai créé un script spécial pour créer/mettre à jour l'utilisateur admin :

```bash
npm run create-admin
```

Ce script va :
- ✅ Créer l'utilisateur `admin@campus.fr` avec le mot de passe `admin123`
- ✅ Hasher correctement le mot de passe avec bcrypt
- ✅ Lui donner le rôle SUPERVISOR
- ✅ Mettre à jour l'utilisateur s'il existe déjà

**Résultat attendu :**
```
🔌 Connexion à MongoDB...
✅ Connecté à MongoDB
👥 Création de l'utilisateur admin...
✅ Utilisateur admin créé

📋 Identifiants de connexion :
   Email: admin@campus.fr
   Mot de passe: admin123
   Rôle: SUPERVISOR

🎉 Vous pouvez maintenant vous connecter !
   → http://localhost:3000/admin/login
```

### Solution 2 : Re-seed toute la base de données

Si vous voulez repartir de zéro avec des données de test :

```bash
npm run seed
```

Le script de seed a été mis à jour pour :
- ✅ Créer `admin@campus.fr` (admin123)
- ✅ Créer `supervisor@example.com` (supervisor123)
- ✅ Créer `student@example.com` (student123)
- ✅ Tous avec de vrais hash bcrypt

---

## 🎯 Après avoir exécuté une des solutions

### 1. Vérifier que l'utilisateur existe

Vous pouvez vérifier avec MongoDB :

```bash
# Si vous avez mongosh installé
mongosh workshop --eval "db.users.find({ email: 'admin@campus.fr' }).pretty()"
```

### 2. Se connecter

1. Aller sur http://localhost:3000/admin/login
2. Entrer :
   - **Email** : `admin@campus.fr`
   - **Mot de passe** : `admin123`
3. Cliquer sur "Se connecter"

**Ça devrait fonctionner !** ✅

---

## 🔍 Ce qui a été corrigé

### 1. Structure de la réponse API adaptée
Le fichier `lib/api.ts` a été mis à jour pour adapter la structure de la réponse de l'API backend au format attendu par le frontend.

### 2. Script de création d'admin
Nouveau fichier : `scripts/create-admin-user.ts`
- Crée ou met à jour l'utilisateur admin
- Hash correctement le mot de passe
- Peut être exécuté plusieurs fois sans problème

### 3. Script de seed amélioré
Le fichier `scripts/seed-database.ts` a été mis à jour :
- Crée maintenant `admin@campus.fr` avec un vrai hash
- Tous les mots de passe sont correctement hashés avec bcrypt
- Ajout de 3 utilisateurs de test avec différents rôles

---

## 📝 Nouveaux Identifiants Disponibles

Après le seed, vous aurez accès à :

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `admin@campus.fr` | `admin123` | SUPERVISOR ⭐ |
| `supervisor@example.com` | `supervisor123` | SUPERVISOR |
| `student@example.com` | `student123` | STUDENT |

---

## 🐛 Si le problème persiste

### Vérifier MongoDB
```bash
# Vérifier que MongoDB tourne
ps aux | grep mongod

# Lancer MongoDB si nécessaire (macOS)
brew services start mongodb-community

# Ou avec Docker
docker start mongodb
```

### Vérifier les variables d'environnement
```bash
# Afficher le contenu de .env.local
cat .env.local

# Doit contenir :
# MONGODB_URI=mongodb://localhost:27017/workshop
# JWT_SECRET=votre-secret-jwt
```

### Vérifier les logs du serveur
Regarder dans le terminal où `npm run dev` tourne pour voir les erreurs détaillées.

### Debug dans la console navigateur
```javascript
// Ouvrir la console (F12)
// Après avoir tenté de se connecter, vérifier :
localStorage.getItem('accessToken')  // Doit être null si échec
```

---

## 💡 Commandes Utiles

```bash
# Créer/mettre à jour l'utilisateur admin
npm run create-admin

# Re-seed toute la base
npm run seed

# Lancer le serveur
npm run dev

# Vérifier les utilisateurs dans MongoDB
mongosh workshop --eval "db.users.find().pretty()"

# Supprimer tous les utilisateurs (pour repartir de zéro)
mongosh workshop --eval "db.users.deleteMany({})"
```

---

## ✅ Checklist de Vérification

- [ ] MongoDB est lancé
- [ ] `.env.local` contient les bonnes variables
- [ ] `npm run create-admin` a été exécuté avec succès
- [ ] Le serveur `npm run dev` est en cours d'exécution
- [ ] Aller sur http://localhost:3000/admin/login
- [ ] Se connecter avec `admin@campus.fr` / `admin123`
- [ ] ✨ Ça marche !

---

## 🎉 Résultat Attendu

Une fois connecté, vous devriez :
1. ✅ Être redirigé vers `/admin`
2. ✅ Voir votre avatar en haut à droite
3. ✅ Voir "Administration" dans le menu
4. ✅ Avoir accès au dashboard admin complet

---

**Si après tout ça le problème persiste, merci de me fournir :**
- Le message d'erreur exact
- Les logs du serveur (terminal `npm run dev`)
- Le résultat de `mongosh workshop --eval "db.users.find({ email: 'admin@campus.fr' }).pretty()"`

Bonne chance ! 🚀

