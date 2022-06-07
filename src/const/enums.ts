export enum ELogEventType {
  AUTHORIZED = 'AUTHORIZED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  API_ACCESS = 'API_ACCESS',
  PAGE_ACCESS = 'PAGE_ACCESS',
  LOGIN = 'LOGIN',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  BAD_REQUEST = 'BAD_REQUEST',
}

export enum EMtrVerb {
  SIGN_TRAINEE = 'sign_trainee',
  SIGN_AUTHORITY = 'sign_authority',
  UPDATE_COMPLETION = 'update_completion',
}

export enum ERole {
  ADMIN = 'admin',
  MEMBER = 'member',
  MONITOR = 'monitor',
  NOROLE = 'norole',
}

export enum EResource {
  AUHTORITY_RECORDS = 'authorityrecords',
  ADMIN_PAGE = 'admin',
  DASHBOARD_PAGE = 'dashboard',
  PROFILE_PAGE = 'profile',
  MATTERMOST = 'mattermost',
  MEMBER_TRACKING_RECORD = 'membertrackingrecord',
  MEMBER_TRACKING_ITEM = 'membertrackingitem',
  ORGANIZATION = 'organization',
  RECORD = 'record',
  TRAINEE_RECORDS = 'traineerecords',
  TRACKING_ITEM = 'trackingitem',
  USER = 'user',
  ROLE = 'role',
  UPLOAD = 'upload',
}

// All must begin and end in a slash
export enum EUri {
  TRACKING_ITEMS = '/api/trackingitems/',
  PERMISSIONS = '/api/grants/',
  LOGIN = '/api/login/',
  MEMBER_TRACKING_RECORDS = '/api/membertrackingrecords/',
  MEMBER_TRACKING_ITEMS = '/api/membertrackingitems/',
  USERS = '/api/users/',
  ROLES = '/api/roles/',
  ORGANIZATIONS = '/api/organizations/',
  LOGS = '/api/logs',
  RESOURCES = '/api/resource',
}

export enum EAttribute {
  ALL = '*',
}

export enum EAction {
  READ_ANY = 'read:any',
  READ_OWN = 'read:own',
  CREATE_OWN = 'create:own',
  CREATE_ANY = 'create:any',
  UPDATE_OWN = 'update:own',
  UPDATE_ANY = 'update:any',
  DELETE_ANY = 'delete:any',
  DELETE_OWN = 'delete:own',
}

export enum EFuncAction {
  READ = 'read',
  READ_ANY = 'readAny',
  READ_OWN = 'readOwn',
  CREATE = 'create',
  CREATE_OWN = 'createOwn',
  CREATE_ANY = 'createAny',
  UPDATE = 'update',
  UPDATE_OWN = 'updateOwn',
  UPDATE_ANY = 'updateAny',
  DELETE = 'delete',
  DELETE_ANY = 'deleteAny',
  DELETE_OWN = 'deleteOwn',
}

export enum ECategories {
  ALL = 'All',
  DONE = 'Done',
  UPCOMING = 'Upcoming',
  OVERDUE = 'Overdue',
  SIGNATURE_REQUIRED = 'Awaiting_Signature',
  ARCHIVED = 'Archived',
  TODO = 'To_Do',
}
export interface ITempestApiError {
  message: string;
}

export enum EMtrVariant {
  ALL = 'all',
  COMPLETED = 'completed',
  IN_PROGRESS = 'in_progress',
}

export enum EUserResources {
  MEMBER_TRACKING_ITEMS = 'membertrackingitems',
  MEMBER_TRACKING_RECORDS = 'membertrackingrecords',
}
