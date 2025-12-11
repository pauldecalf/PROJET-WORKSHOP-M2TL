/**
 * Script de seed pour initialiser la base de données avec des données de test
 * 
 * Usage:
 * 1. Assurez-vous que MongoDB est en cours d'exécution
 * 2. Configurez MONGODB_URI dans .env.local
 * 3. Exécutez: npx tsx scripts/seed-database.ts
 */

import mongoose from 'mongoose';
import {
  Building,
  Room,
  User,
  Device,
  Sensor,
  SensorMeasurement,
  RoomStatus,
  DeviceConfig,
} from '../models';
import {
  UserRole,
  DeviceStatus,
  RoomAvailability,
  SensorType,
} from '../types/enums';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/workshop';

async function seedDatabase() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Nettoyer les données existantes (optionnel - commentez si vous voulez garder les données)
    console.log('🧹 Nettoyage des collections...');
    await Promise.all([
      Building.deleteMany({}),
      Room.deleteMany({}),
      User.deleteMany({}),
      Device.deleteMany({}),
      Sensor.deleteMany({}),
      SensorMeasurement.deleteMany({}),
      RoomStatus.deleteMany({}),
      DeviceConfig.deleteMany({}),
    ]);

    // Créer des utilisateurs
    console.log('👥 Création des utilisateurs...');
    const users = await User.create([
      {
        email: 'supervisor@example.com',
        passwordHash: '$2a$10$dummyhash1', // En production, utilisez bcrypt
        role: UserRole.SUPERVISOR,
        displayName: 'Admin Superviseur',
      },
      {
        email: 'student@example.com',
        passwordHash: '$2a$10$dummyhash2',
        role: UserRole.STUDENT,
        displayName: 'Étudiant Test',
      },
    ]);
    console.log(`✅ ${users.length} utilisateurs créés`);

    // Créer des bâtiments
    console.log('🏢 Création des bâtiments...');
    const buildings = await Building.create([
      {
        name: 'Bâtiment A',
        address: '123 Rue de l\'Innovation, 75001 Paris',
      },
      {
        name: 'Bâtiment B',
        address: '456 Avenue des Sciences, 75001 Paris',
      },
    ]);
    console.log(`✅ ${buildings.length} bâtiments créés`);

    // Créer des salles
    console.log('🚪 Création des salles...');
    const rooms = await Room.create([
      {
        buildingId: buildings[0]._id,
        name: 'Salle 101',
        floor: 1,
        capacity: 30,
        mapX: 100,
        mapY: 100,
      },
      {
        buildingId: buildings[0]._id,
        name: 'Salle 102',
        floor: 1,
        capacity: 25,
        mapX: 200,
        mapY: 100,
      },
      {
        buildingId: buildings[0]._id,
        name: 'Salle 201',
        floor: 2,
        capacity: 40,
        mapX: 100,
        mapY: 200,
      },
      {
        buildingId: buildings[1]._id,
        name: 'Laboratoire 301',
        floor: 3,
        capacity: 20,
        mapX: 300,
        mapY: 300,
      },
    ]);
    console.log(`✅ ${rooms.length} salles créées`);

    // Créer des devices
    console.log('📟 Création des devices IoT...');
    const devices = await Device.create([
      {
        serialNumber: 'ESP32-001',
        name: 'Capteur Salle 101',
        roomId: rooms[0]._id,
        status: DeviceStatus.ONLINE,
        firmwareVersion: '1.0.0',
        batteryLevel: 95.5,
        isPoweredOn: true,
        lastSeenAt: new Date(),
      },
      {
        serialNumber: 'ESP32-002',
        name: 'Capteur Salle 102',
        roomId: rooms[1]._id,
        status: DeviceStatus.ONLINE,
        firmwareVersion: '1.0.0',
        batteryLevel: 87.2,
        isPoweredOn: true,
        lastSeenAt: new Date(),
      },
      {
        serialNumber: 'ESP32-003',
        name: 'Capteur Salle 201',
        roomId: rooms[2]._id,
        status: DeviceStatus.OFFLINE,
        firmwareVersion: '1.0.0',
        batteryLevel: 23.1,
        isPoweredOn: false,
        lastSeenAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
      },
      {
        serialNumber: 'ESP32-004',
        name: 'Capteur Laboratoire 301',
        roomId: rooms[3]._id,
        status: DeviceStatus.ONLINE,
        firmwareVersion: '1.1.0',
        batteryLevel: 100,
        isPoweredOn: true,
        lastSeenAt: new Date(),
      },
    ]);
    console.log(`✅ ${devices.length} devices créés`);

    // Créer des configurations de device
    console.log('⚙️ Création des configurations...');
    const configs = await DeviceConfig.create([
      {
        deviceId: devices[0]._id,
        samplingIntervalSec: 60,
        dataVisibilityPublic: true,
        ledAutoControl: true,
        createdByUserId: users[0]._id,
      },
      {
        deviceId: devices[1]._id,
        samplingIntervalSec: 120,
        dataVisibilityPublic: true,
        ledAutoControl: true,
        createdByUserId: users[0]._id,
      },
    ]);
    console.log(`✅ ${configs.length} configurations créées`);

    // Créer des capteurs
    console.log('🌡️ Création des capteurs...');
    const sensors = [];
    
    for (const device of devices) {
      // Capteur de température
      const tempSensor = await Sensor.create({
        deviceId: device._id,
        type: SensorType.TEMPERATURE,
        label: `Température ${device.name}`,
        unit: '°C',
        minValue: -10,
        maxValue: 50,
      });
      sensors.push(tempSensor);

      // Capteur d'humidité
      const humiditySensor = await Sensor.create({
        deviceId: device._id,
        type: SensorType.HUMIDITY,
        label: `Humidité ${device.name}`,
        unit: '%',
        minValue: 0,
        maxValue: 100,
      });
      sensors.push(humiditySensor);

      // Capteur CO2
      const co2Sensor = await Sensor.create({
        deviceId: device._id,
        type: SensorType.CO2,
        label: `CO2 ${device.name}`,
        unit: 'ppm',
        minValue: 0,
        maxValue: 5000,
      });
      sensors.push(co2Sensor);
    }
    console.log(`✅ ${sensors.length} capteurs créés`);

    // Créer des mesures pour les dernières 24h
    console.log('📊 Création des mesures...');
    const measurements = [];
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    for (const sensor of sensors) {
      // Créer une mesure toutes les 10 minutes pendant 24h
      for (let time = oneDayAgo; time <= now; time += 10 * 60 * 1000) {
        let value: number;

        switch (sensor.type) {
          case SensorType.TEMPERATURE:
            // Température entre 18 et 24°C avec variation
            value = 21 + Math.sin(time / (60 * 60 * 1000)) * 3 + (Math.random() - 0.5);
            break;
          case SensorType.HUMIDITY:
            // Humidité entre 40 et 60%
            value = 50 + Math.sin(time / (2 * 60 * 60 * 1000)) * 10 + (Math.random() - 0.5) * 2;
            break;
          case SensorType.CO2:
            // CO2 entre 400 et 1200 ppm
            value = 800 + Math.sin(time / (3 * 60 * 60 * 1000)) * 400 + (Math.random() - 0.5) * 50;
            break;
          default:
            value = Math.random() * 100;
        }

        measurements.push({
          sensorId: sensor._id,
          measuredAt: new Date(time),
          numericValue: Math.round(value * 10) / 10,
        });
      }
    }

    // Insérer par lots pour de meilleures performances
    const batchSize = 1000;
    for (let i = 0; i < measurements.length; i += batchSize) {
      const batch = measurements.slice(i, i + batchSize);
      await SensorMeasurement.insertMany(batch);
      console.log(`  ↳ ${Math.min(i + batchSize, measurements.length)} / ${measurements.length} mesures insérées`);
    }
    console.log(`✅ ${measurements.length} mesures créées`);

    // Créer les statuts de salles
    console.log('🔴🟢 Création des statuts de salles...');
    const roomStatuses = await RoomStatus.create([
      {
        roomId: rooms[0]._id,
        availability: RoomAvailability.OCCUPIED,
        lastUpdateAt: new Date(),
        sourceDeviceId: devices[0]._id,
        reason: 'Détection NFC',
      },
      {
        roomId: rooms[1]._id,
        availability: RoomAvailability.AVAILABLE,
        lastUpdateAt: new Date(),
        sourceDeviceId: devices[1]._id,
        reason: 'Pas de détection',
      },
      {
        roomId: rooms[2]._id,
        availability: RoomAvailability.UNKNOWN,
        lastUpdateAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        sourceDeviceId: devices[2]._id,
        reason: 'Device hors ligne',
      },
      {
        roomId: rooms[3]._id,
        availability: RoomAvailability.AVAILABLE,
        lastUpdateAt: new Date(),
        sourceDeviceId: devices[3]._id,
        reason: 'Planning',
      },
    ]);
    console.log(`✅ ${roomStatuses.length} statuts de salles créés`);

    console.log('\n🎉 Base de données initialisée avec succès !');
    console.log('\n📊 Résumé :');
    console.log(`   - ${users.length} utilisateurs`);
    console.log(`   - ${buildings.length} bâtiments`);
    console.log(`   - ${rooms.length} salles`);
    console.log(`   - ${devices.length} devices`);
    console.log(`   - ${sensors.length} capteurs`);
    console.log(`   - ${measurements.length} mesures`);
    console.log(`   - ${roomStatuses.length} statuts de salles`);

    console.log('\n💡 Vous pouvez maintenant tester les routes API !');
    console.log('   GET http://localhost:3000/api/devices');
    console.log('   GET http://localhost:3000/api/rooms/status');

  } catch (error) {
    console.error('❌ Erreur lors du seed de la base de données:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnecté de MongoDB');
  }
}

// Exécuter le script
seedDatabase();





