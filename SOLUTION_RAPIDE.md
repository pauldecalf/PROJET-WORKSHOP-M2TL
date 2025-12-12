# ⚡ Solution Rapide au Problème de Connexion

## 🚨 Erreur : "Identifiants invalides"

### ✅ Solution en 3 étapes

#### Étape 1 : Créer l'utilisateur admin
```bash
npm run create-admin
```

#### Étape 2 : Vérifier le résultat
Vous devriez voir :
```
✅ Utilisateur admin créé

📋 Identifiants de connexion :
   Email: admin@campus.fr
   Mot de passe: admin123
```

#### Étape 3 : Se reconnecter
1. Aller sur http://localhost:3000/admin/login
2. Email : `admin@campus.fr`
3. Mot de passe : `admin123`
4. Cliquer sur "Se connecter"

### 🎉 Ça devrait marcher !

---

## 📚 Ce qui a été corrigé

1. ✅ **Script de création d'admin** (`scripts/create-admin-user.ts`)
   - Crée l'utilisateur avec un vrai hash bcrypt
   - Peut être exécuté plusieurs fois

2. ✅ **API Layer** (`lib/api.ts`)
   - Adaptation de la structure de réponse backend → frontend
   - Mapping correct des champs user

3. ✅ **Script de seed** (`scripts/seed-database.ts`)
   - Crée maintenant 3 utilisateurs avec vrais hash :
     - `admin@campus.fr` / `admin123` (SUPERVISOR)
     - `supervisor@example.com` / `supervisor123` (SUPERVISOR)
     - `student@example.com` / `student123` (STUDENT)

4. ✅ **Commande npm** ajoutée
   - `npm run create-admin` pour créer/maj l'admin

---

## 🔍 Alternative : Re-seed complet

Si vous voulez aussi des données de test (salles, devices, etc.) :

```bash
npm run seed
```

Cela créera :
- 3 utilisateurs (dont admin@campus.fr)
- 2-3 bâtiments
- 10-15 salles
- 10-15 devices
- Données de télémétrie

---

## 💡 Commandes Utiles

```bash
# Créer l'admin (rapide, juste l'utilisateur)
npm run create-admin

# Seed complet (plus long, toutes les données)
npm run seed

# Lancer le serveur
npm run dev
```

---

## 🎯 Résultat Attendu

Une fois connecté :
- ✅ Avatar avec votre initiale en haut à droite
- ✅ Menu "Administration" visible
- ✅ Accès au dashboard admin complet
- ✅ Possibilité de se déconnecter

---

## 🆘 Si ça ne marche toujours pas

Vérifier que MongoDB est lancé :
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Docker
docker start mongodb

# Vérifier
ps aux | grep mongod
```

Voir le fichier **FIX_LOGIN.md** pour un guide détaillé de résolution.

---

**Fichiers de documentation :**
- `FIX_LOGIN.md` - Guide détaillé du fix
- `COMMANDES.md` - Toutes les commandes
- `GUIDE_DEMARRAGE.md` - Guide complet
- `FRONTEND_README.md` - Documentation technique

Bon développement ! 🚀

