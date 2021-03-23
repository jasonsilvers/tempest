export enum Role {
  ADMIN = 'admin',
  MEMBER = 'member',
  MONITOR = 'monitor'
}

export enum Resource {
  RECORD = 'record',
  DASHBOARD = 'dashboard',
  PROFILE = 'profile',
  TRAINING_RECORD = 'training_record'
}

export enum GrantType {
  ALL = '*'
}

export enum PermissionType {
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete'
}