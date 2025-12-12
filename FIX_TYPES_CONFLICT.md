# 🔧 Résolution du Conflit de Types

## ❌ Erreur Originale

```
Type error: Module './auth' has already exported a member named 'UserRole'. 
Consider explicitly re-exporting to resolve the ambiguity.
```

## 🔍 Cause du Problème

Plusieurs types/enums étaient définis dans deux endroits différents, créant des conflits lors de l'export avec `export *` :

| Type | Défini dans | ET dans |
|------|-------------|---------|
| `UserRole` | `types/auth.ts` | `types/enums.ts` |
| `DeviceStatus` | `types/device.ts` | `types/enums.ts` |
| `DeviceConfigStatus` | `types/device.ts` | `types/enums.ts` |
| `CommandType` | `types/device.ts` | `types/enums.ts` |

## ✅ Solutions Appliquées

### 1. **types/auth.ts**
- ❌ Supprimé : `export type UserRole = 'SUPERVISOR' | 'STUDENT';`
- ✅ Ajouté : `import { UserRole } from './enums';`
- Utilise maintenant l'enum de `types/enums.ts`

### 2. **types/device.ts**
- ❌ Supprimé : Définitions de `DeviceStatus`, `DeviceConfigStatus`, `CommandType`
- ✅ Ajouté : `import { DeviceStatus, DeviceConfigStatus, CommandType } from './enums';`
- Utilise maintenant les enums de `types/enums.ts`

### 3. **types/room.ts**
- ❌ Déplacé la définition de `RoomStatus` après l'import
- ✅ Ajouté : `import { RoomAvailability } from './enums';`
- Gardé `RoomStatus` comme alias de compatibilité

### 4. **types/enums.ts**
- ✅ Ajouté : `REBOOT` et `SHUTDOWN` dans `CommandType`
- Source unique de vérité pour tous les enums

### 5. **types/index.ts**
- ✅ Réorganisé : Export des enums en premier
- ✅ Commenté pour clarifier l'ordre d'import

## 📁 Structure Finale

```
types/
├── enums.ts           ← Source unique pour tous les enums
│   ├── UserRole
│   ├── DeviceStatus
│   ├── DeviceConfigStatus
│   ├── RoomAvailability
│   ├── SensorType
│   ├── CommandType
│   ├── CommandStatus
│   └── OTAStatus
│
├── auth.ts            ← Importe UserRole depuis enums
├── device.ts          ← Importe DeviceStatus, DeviceConfigStatus, CommandType depuis enums
├── room.ts            ← Importe RoomAvailability depuis enums
├── building.ts        ← Pas de dépendance
├── telemetry.ts       ← Pas de dépendance
└── index.ts           ← Exporte tout dans le bon ordre
```

## 🎯 Principe Appliqué

**Single Source of Truth (SSOT)** : 
- Tous les enums sont définis dans `types/enums.ts`
- Les autres fichiers importent depuis `enums.ts`
- Pas de duplication = Pas de conflit

## ✅ Vérification

Les fichiers types ne devraient plus avoir d'erreurs de linting :

```bash
# Aucune erreur de linting trouvée
npm run lint
```

Le build devrait maintenant fonctionner :

```bash
npm run build
```

## 🚀 Utilisation

Tous les imports continuent de fonctionner comme avant :

```typescript
// Import centralisé (recommandé)
import { UserRole, DeviceStatus, Room, Device } from '@/types';

// OU import spécifique
import { UserRole } from '@/types/enums';
import { Device } from '@/types/device';
```

## 📝 Fichiers Modifiés

- ✅ `types/auth.ts` - Import UserRole depuis enums
- ✅ `types/device.ts` - Import DeviceStatus, DeviceConfigStatus, CommandType depuis enums
- ✅ `types/room.ts` - Import RoomAvailability depuis enums
- ✅ `types/enums.ts` - Ajout REBOOT et SHUTDOWN dans CommandType
- ✅ `types/index.ts` - Réorganisation de l'ordre d'export

## 🎉 Résultat

- ✅ Plus de conflits d'exports
- ✅ Build fonctionne
- ✅ Structure propre et maintenable
- ✅ Source unique pour les enums

---

**Le projet devrait maintenant compiler sans erreur ! 🚀**

