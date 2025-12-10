# 🔧 Fix Urgent : Configurer MongoDB sur Railway

## 🚨 Problème actuel

Votre application sur Railway ne peut pas démarrer car **MongoDB n'est pas configuré**.

**Logs d'erreur :**
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
Stopping Container
npm error signal SIGTERM
```

---

## ✅ Solution en 5 minutes

### Étape 1 : Créer MongoDB Atlas (Gratuit)

1. **Créer un compte** : https://www.mongodb.com/cloud/atlas/register
   
2. **Créer un cluster** :
   - Cliquez sur **"Build a Database"**
   - Choisissez **"M0 Free"** (gratuit)
   - Provider : AWS ou Google Cloud
   - Région : Choisissez la plus proche (Europe-West ou US-East)
   - Cliquez **"Create Cluster"**

3. **Créer un utilisateur** :
   - Dans la popup "Security Quickstart"
   - **Username** : `workshop_admin`
   - **Password** : Cliquez sur **"Autogenerate Secure Password"** et **COPIEZ-LE** !
   - Cliquez **"Create User"**

4. **Autoriser les connexions** :
   - Dans "Where would you like to connect from?"
   - Cliquez **"Add My Current IP Address"**
   - Puis cliquez sur **"Add Entry"** et ajoutez `0.0.0.0/0` (partout)
   - Cliquez **"Finish and Close"**

5. **Obtenir l'URI de connexion** :
   - Cliquez sur **"Connect"** (à côté de votre cluster)
   - Choisissez **"Drivers"**
   - Copiez l'URI qui ressemble à :
     ```
     mongodb+srv://workshop_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - **IMPORTANT** : Remplacez `<password>` par le mot de passe copié à l'étape 3
   - Ajoutez `/workshop` avant le `?` pour le nom de la base :
     ```
     mongodb+srv://workshop_admin:VOTRE_PASSWORD@cluster0.xxxxx.mongodb.net/workshop?retryWrites=true&w=majority
     ```

### Étape 2 : Configurer Railway

1. **Allez sur Railway** : https://railway.app/dashboard
   
2. **Ouvrez votre projet** : `projet-workshop-m2tl`
   
3. **Sélectionnez votre service** (celui avec Next.js)
   
4. **Cliquez sur l'onglet "Variables"**
   
5. **Cliquez sur "New Variable"**
   
6. **Ajoutez** :
   ```
   Name: MONGODB_URI
   Value: mongodb+srv://workshop_admin:VOTRE_PASSWORD@cluster0.xxxxx.mongodb.net/workshop?retryWrites=true&w=majority
   ```
   
7. **Railway va automatiquement redéployer** (attendez 1-2 minutes)

### Étape 3 : Vérifier que ça fonctionne

1. **Voir les logs Railway** :
   - Cliquez sur **"Deployments"**
   - Sélectionnez le dernier déploiement
   - Attendez que le build se termine

2. **Vérifier les logs** :
   
   **✅ Vous devriez voir** :
   ```
   ✅ Connecté à MongoDB
   ✓ Ready in 1234ms
   ```
   
   **❌ Si vous voyez encore** :
   ```
   MongooseServerSelectionError
   ```
   → Vérifiez que l'URI est correct et que le mot de passe est bon

3. **Tester l'application** :
   
   Ouvrez dans votre navigateur :
   ```
   https://projet-workshop-m2tl-production.up.railway.app/
   ```
   
   Vous devriez voir la page d'accueil.

---

## 🧪 Initialiser la base de données

Une fois que l'application démarre sans erreur, vous devez ajouter des données de test.

### Option 1 : Via MongoDB Compass (Recommandé)

1. **Téléchargez MongoDB Compass** : https://www.mongodb.com/try/download/compass
   
2. **Connectez-vous** avec votre URI MongoDB Atlas
   
3. **Créez la base `workshop`** si elle n'existe pas
   
4. **Exécutez le script seed en local** :
   ```bash
   cd /Users/pauldecalf/Desktop/PROJET-WORKSHOP
   npm run seed
   ```

### Option 2 : Importer les données depuis local

Si vous avez déjà des données en local :

```bash
# Exporter depuis local
mongodump --uri="mongodb://localhost:27017/workshop" --out=./backup

# Importer vers Atlas
mongorestore --uri="mongodb+srv://workshop_admin:PASSWORD@cluster0.xxxxx.mongodb.net/workshop" ./backup/workshop
```

### Option 3 : Créer manuellement quelques documents

Allez sur MongoDB Atlas → Browse Collections → Insert Document

---

## 🎯 Vérification finale

### ✅ Checklist

- [ ] Compte MongoDB Atlas créé
- [ ] Cluster M0 Free créé
- [ ] Utilisateur créé et mot de passe copié
- [ ] IP 0.0.0.0/0 autorisée dans Network Access
- [ ] URI de connexion copiée
- [ ] `MONGODB_URI` ajouté dans Railway Variables
- [ ] Application redéployée automatiquement
- [ ] Logs montrent "✅ Connecté à MongoDB"
- [ ] Page d'accueil accessible
- [ ] Données de test ajoutées

### 🧪 Tests

```bash
# Test 1 : Page d'accueil
curl https://projet-workshop-m2tl-production.up.railway.app/

# Test 2 : API Devices (peut être vide si pas de seed)
curl https://projet-workshop-m2tl-production.up.railway.app/api/devices

# Test 3 : Créer un device
curl -X POST https://projet-workshop-m2tl-production.up.railway.app/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "serialNumber": "TEST-001",
    "name": "Device Test",
    "status": "ONLINE",
    "batteryLevel": 100
  }'
```

---

## 🐛 Problèmes courants

### Erreur : "Authentication failed"

**Cause** : Mot de passe incorrect dans l'URI

**Solution** :
1. Retournez sur MongoDB Atlas
2. Database Access → Modifier votre utilisateur
3. Régénérez un nouveau mot de passe
4. Mettez à jour `MONGODB_URI` sur Railway

### Erreur : "Network timeout"

**Cause** : IP non autorisée

**Solution** :
1. MongoDB Atlas → Network Access
2. Ajoutez `0.0.0.0/0` (Allow access from anywhere)

### Application redémarre en boucle

**Cause** : `MONGODB_URI` mal formaté

**Solution** :
- Vérifiez qu'il n'y a pas d'espaces
- Format : `mongodb+srv://user:pass@host/database?options`
- Le nom de la base (`workshop`) doit être entre le host et le `?`

### Les logs Railway ne montrent rien

**Solution** :
1. Settings → Redeploy
2. Ou modifiez une variable pour forcer le redéploiement

---

## 📞 Support

Si vous avez encore des problèmes :

1. **Vérifiez les logs Railway** en détail
2. **Testez la connexion** depuis votre machine locale :
   ```bash
   mongosh "mongodb+srv://workshop_admin:PASSWORD@cluster0.xxxxx.mongodb.net/workshop"
   ```
3. **Vérifiez que l'URI est identique** entre local et Railway

---

## ⏱️ Temps estimé

- MongoDB Atlas : 5 minutes
- Configuration Railway : 1 minute
- Redéploiement : 2-3 minutes
- **Total : ~10 minutes**

---

**🎉 Une fois fait, votre application sera 100% fonctionnelle sur Railway !**

