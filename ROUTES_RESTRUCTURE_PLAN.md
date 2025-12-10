# 🔄 Plan de restructuration des routes

## ❌ Problème actuel

Les routes avec `[id]` peuvent créer des conflits :

```
/api/devices/[id]         ← Peut capturer toutes les routes
/api/devices/[id]/data    
/api/devices/[id]/commands/...
```

Si on ajoute `/api/devices/stats`, Next.js peut le considérer comme un `[id]`.

---

## ✅ Solution : Préfixer les routes dynamiques

### Nouvelle structure recommandée

```
/api/devices                      ← Liste (GET, POST)
/api/devices/by-id/[id]          ← Détails (GET, PATCH, DELETE)
/api/devices/by-id/[id]/data     
/api/devices/by-id/[id]/commands/...

/api/buildings                    ← Liste (GET, POST)
/api/buildings/by-id/[id]        ← Détails
/api/buildings/by-id/[id]/rooms
/api/buildings/by-id/[id]/stats

/api/rooms                        ← Liste (GET, POST)
/api/rooms/by-id/[id]            ← Détails
/api/rooms/by-id/[id]/data
/api/rooms/by-id/[id]/status
```

### Avantages

✅ Pas de conflits entre routes statiques et dynamiques  
✅ URLs plus explicites  
✅ Possibilité d'ajouter des routes statiques sans conflit  
✅ Meilleure organisation  

---

## 🔄 Alternative : Utiliser des query params

```
/api/devices?id=xxx              ← Plus simple mais moins REST
/api/devices/data?id=xxx
```

❌ Moins RESTful, pas recommandé

---

## 📝 Recommandation

**Option 1 (Recommandée)** : Préfixer avec `/by-id/`
- Plus explicite
- Évite tous les conflits
- REST compliant

**Option 2** : Garder `[id]` mais éviter les routes statiques au même niveau
- Moins de changements
- Risque de conflits futurs

Quelle option préférez-vous ?

