import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Workshop - Système IoT de Gestion de Salles',
      version: '1.0.0',
      description: `
API REST pour la gestion d'un système IoT de salles connectées.

## Fonctionnalités principales

- **Devices IoT** : Gestion des boîtiers ESP32 avec capteurs
- **Capteurs** : Température, humidité, CO2, bruit, luminosité, NFC
- **Salles** : Gestion des salles et bâtiments
- **Statut temps réel** : Disponibilité des salles en temps réel
- **Commandes** : Envoi de commandes aux devices
- **Mesures** : Stockage et récupération des données time-series

## Authentification

🔒 **Note** : L'authentification n'est pas encore implémentée.
En production, ajoutez JWT ou NextAuth.js.

## Base de données

MongoDB avec 13 collections :
- buildings, rooms, roomstatuses
- users, devices, deviceconfigs, devicecommands, otaupdates
- sensors, sensormeasurements
- nfcbadges, nfcevents, auditlogs
      `.trim(),
      contact: {
        name: 'Support API',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement',
      },
      {
        url: 'https://votre-domaine.com',
        description: 'Serveur de production',
      },
    ],
    tags: [
      {
        name: 'Devices',
        description: 'Gestion des boîtiers IoT',
      },
      {
        name: 'Sensors',
        description: 'Gestion des capteurs et mesures',
      },
      {
        name: 'Rooms',
        description: 'Gestion des salles et statuts',
      },
      {
        name: 'Buildings',
        description: 'Gestion des bâtiments',
      },
      {
        name: 'Commands',
        description: 'Commandes envoyées aux devices',
      },
      {
        name: 'NFC',
        description: 'Gestion des badges et événements NFC',
      },
    ],
    components: {
      schemas: {
        Device: {
          type: 'object',
          required: ['serialNumber', 'status'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique MongoDB',
              example: '507f1f77bcf86cd799439011',
            },
            serialNumber: {
              type: 'string',
              description: 'Numéro de série du device',
              example: 'ESP32-001',
            },
            name: {
              type: 'string',
              description: 'Nom du device',
              example: 'Capteur Salle 101',
            },
            roomId: {
              type: 'string',
              description: 'ID de la salle',
              example: '507f1f77bcf86cd799439012',
            },
            status: {
              type: 'string',
              enum: ['ONLINE', 'OFFLINE', 'ERROR', 'UNKNOWN'],
              description: 'Statut du device',
              example: 'ONLINE',
            },
            firmwareVersion: {
              type: 'string',
              description: 'Version du firmware',
              example: '1.0.0',
            },
            batteryLevel: {
              type: 'number',
              format: 'float',
              minimum: 0,
              maximum: 100,
              description: 'Niveau de batterie en %',
              example: 95.5,
            },
            isPoweredOn: {
              type: 'boolean',
              description: 'Device allumé ou éteint',
              example: true,
            },
            lastSeenAt: {
              type: 'string',
              format: 'date-time',
              description: 'Dernière connexion',
              example: '2025-12-10T10:30:00Z',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création',
              example: '2025-12-01T00:00:00Z',
            },
          },
        },
        Room: {
          type: 'object',
          required: ['buildingId', 'name'],
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            buildingId: {
              type: 'string',
              example: '507f1f77bcf86cd799439012',
            },
            name: {
              type: 'string',
              example: 'Salle 101',
            },
            floor: {
              type: 'integer',
              example: 1,
            },
            capacity: {
              type: 'integer',
              example: 30,
            },
            mapX: {
              type: 'number',
              example: 100,
            },
            mapY: {
              type: 'number',
              example: 200,
            },
          },
        },
        RoomStatus: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            availability: {
              type: 'string',
              enum: ['AVAILABLE', 'OCCUPIED', 'UNKNOWN'],
              example: 'AVAILABLE',
            },
            lastUpdateAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-12-10T10:30:00Z',
            },
            reason: {
              type: 'string',
              example: 'Pas de détection NFC',
            },
            room: {
              $ref: '#/components/schemas/Room',
            },
            building: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                },
                name: {
                  type: 'string',
                },
              },
            },
          },
        },
        Sensor: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            deviceId: {
              type: 'string',
              example: '507f1f77bcf86cd799439012',
            },
            type: {
              type: 'string',
              enum: ['TEMPERATURE', 'HUMIDITY', 'CO2', 'NOISE_LEVEL', 'LUMINOSITY', 'NFC_READER', 'OTHER'],
              example: 'TEMPERATURE',
            },
            label: {
              type: 'string',
              example: 'Température ambiante',
            },
            unit: {
              type: 'string',
              example: '°C',
            },
            minValue: {
              type: 'number',
              example: -10,
            },
            maxValue: {
              type: 'number',
              example: 50,
            },
          },
        },
        Measurement: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            sensorId: {
              type: 'string',
              example: '507f1f77bcf86cd799439012',
            },
            measuredAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-12-10T10:30:00Z',
            },
            numericValue: {
              type: 'number',
              example: 22.5,
            },
            rawValue: {
              type: 'object',
              example: { humidity: 45.2, pressure: 1013.25 },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Message d\'erreur',
            },
            message: {
              type: 'string',
              example: 'Détails techniques de l\'erreur',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              description: 'Données retournées',
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Requête invalide',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFound: {
          description: 'Ressource non trouvée',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ServerError: {
          description: 'Erreur serveur',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./app/api/**/*.ts'], // Chemins vers les fichiers à documenter
};

export const swaggerSpec = swaggerJsdoc(options);

