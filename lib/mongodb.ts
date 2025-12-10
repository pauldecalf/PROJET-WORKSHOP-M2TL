import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/workshop';

if (!MONGODB_URI) {
  throw new Error('Veuillez définir la variable d\'environnement MONGODB_URI');
}

/**
 * Global est utilisé ici pour maintenir une connexion en cache pendant le développement.
 * Cela évite les connexions épuisées pendant le rechargement à chaud de Next.js.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 secondes max pour sélectionner un serveur
      socketTimeoutMS: 45000,           // 45 secondes de timeout socket
      maxPoolSize: 10,                  // Pool de connexions max
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('✅ Connecté à MongoDB');
      return mongooseInstance;
    }).catch((error) => {
      console.error('❌ Erreur de connexion MongoDB:', error.message);
      cached.promise = null; // Reset pour retry
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

