// =============================
// ENUMS
// =============================

export enum UserRole {
  SUPERVISOR = 'SUPERVISOR',
  STUDENT = 'STUDENT'
}

export enum DeviceStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  ERROR = 'ERROR',
  UNKNOWN = 'UNKNOWN'
}

export enum RoomAvailability {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  UNKNOWN = 'UNKNOWN'
}

export enum SensorType {
  TEMPERATURE = 'TEMPERATURE',
  HUMIDITY = 'HUMIDITY',
  CO2 = 'CO2',
  NOISE_LEVEL = 'NOISE_LEVEL',
  LUMINOSITY = 'LUMINOSITY',
  NFC_READER = 'NFC_READER',
  OTHER = 'OTHER'
}

export enum CommandType {
  SET_SAMPLING_INTERVAL = 'SET_SAMPLING_INTERVAL',
  SET_VISIBILITY = 'SET_VISIBILITY',
  TURN_OFF = 'TURN_OFF',
  TURN_ON = 'TURN_ON',
  SET_LED_STATE = 'SET_LED_STATE',
  OTA_UPDATE = 'OTA_UPDATE'
}

export enum CommandStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  FAILED = 'FAILED'
}

export enum OTAStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

