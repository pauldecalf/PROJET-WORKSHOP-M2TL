/**
 * Script pour créer un utilisateur admin
 * 
 * Usage:
 * npx tsx scripts/create-admin-user.ts
 */

import mongoose from 'mongoose';
import { User } from '../models';
import { hashPassword } from '../lib/auth';
import { UserRole } from '../types/enums';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/workshop';

async function createAdminUser() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const adminEmail = 'admin@campus.fr';
    const adminPassword = 'admin123';

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: adminEmail });
    
    if (existingUser) {
      console.log('⚠️  L\'utilisateur admin existe déjà. Mise à jour du mot de passe...');
      
      // Hasher le nouveau mot de passe
      const hashedPassword = await hashPassword(adminPassword);
      
      // Mettre à jour l'utilisateur
      existingUser.passwordHash = hashedPassword;
      existingUser.role = UserRole.SUPERVISOR;
      existingUser.displayName = 'Administrateur Campus';
      await existingUser.save();
      
      console.log('✅ Utilisateur admin mis à jour');
    } else {
      console.log('👥 Création de l\'utilisateur admin...');
      
      // Hasher le mot de passe
      const hashedPassword = await hashPassword(adminPassword);
      
      // Créer l'utilisateur
      await User.create({
        email: adminEmail,
        passwordHash: hashedPassword,
        role: UserRole.SUPERVISOR,
        displayName: 'Administrateur Campus',
      });
      
      console.log('✅ Utilisateur admin créé');
    }

    console.log('\n📋 Identifiants de connexion :');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Mot de passe: ${adminPassword}`);
    console.log(`   Rôle: ${UserRole.SUPERVISOR}`);
    
    console.log('\n🎉 Vous pouvez maintenant vous connecter !');
    console.log('   → http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur admin:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnecté de MongoDB');
  }
}

// Exécuter le script
createAdminUser();

