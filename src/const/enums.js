'use strict';
exports.__esModule = true;
exports.EUserResources =
  exports.EUserIncludes =
  exports.ECategories =
  exports.EFuncAction =
  exports.EAction =
  exports.EAttribute =
  exports.EUri =
  exports.EResource =
  exports.ERole =
  exports.EMtrVerb =
  exports.ELogEventType =
    void 0;
var ELogEventType;
(function (ELogEventType) {
  ELogEventType['AUTHORIZED'] = 'AUTHORIZED';
  ELogEventType['UNAUTHORIZED'] = 'UNAUTHORIZED';
  ELogEventType['API_ACCESS'] = 'API_ACCESS';
  ELogEventType['PAGE_ACCESS'] = 'PAGE_ACCESS';
  ELogEventType['LOGIN'] = 'LOGIN';
  ELogEventType['METHOD_NOT_ALLOWED'] = 'METHOD_NOT_ALLOWED';
  ELogEventType['BAD_REQUEST'] = 'BAD_REQUEST';
})((ELogEventType = exports.ELogEventType || (exports.ELogEventType = {})));
var EMtrVerb;
(function (EMtrVerb) {
  EMtrVerb['SIGN_TRAINEE'] = 'sign_trainee';
  EMtrVerb['SIGN_AUTHORITY'] = 'sign_authority';
  EMtrVerb['UPDATE_COMPLETION'] = 'update_completion';
})((EMtrVerb = exports.EMtrVerb || (exports.EMtrVerb = {})));
var ERole;
(function (ERole) {
  ERole['ADMIN'] = 'admin';
  ERole['MEMBER'] = 'member';
  ERole['MONITOR'] = 'monitor';
  ERole['NOROLE'] = 'norole';
})((ERole = exports.ERole || (exports.ERole = {})));
var EResource;
(function (EResource) {
  EResource['AUHTORITY_RECORDS'] = 'authorityrecords';
  EResource['ADMIN_PAGE'] = 'admin';
  EResource['DASHBOARD_PAGE'] = 'dashboard';
  EResource['PROFILE_PAGE'] = 'profile';
  EResource['MATTERMOST'] = 'mattermost';
  EResource['MEMBER_TRACKING_RECORD'] = 'membertrackingrecord';
  EResource['MEMBER_TRACKING_ITEM'] = 'membertrackingitem';
  EResource['ORGANIZATION'] = 'organization';
  EResource['RECORD'] = 'record';
  EResource['TRAINEE_RECORDS'] = 'traineerecords';
  EResource['TRACKING_ITEM'] = 'trackingitem';
  EResource['USER'] = 'user';
  EResource['ROLE'] = 'role';
  EResource['UPLOAD'] = 'upload';
})((EResource = exports.EResource || (exports.EResource = {})));
// All must begin and end in a slash
var EUri;
(function (EUri) {
  EUri['TRACKING_ITEMS'] = '/api/trackingitems/';
  EUri['PERMISSIONS'] = '/api/grants/';
  EUri['LOGIN'] = '/api/login/';
  EUri['MEMBER_TRACKING_RECORDS'] = '/api/membertrackingrecords/';
  EUri['MEMBER_TRACKING_ITEMS'] = '/api/membertrackingitems/';
  EUri['USERS'] = '/api/users/';
  EUri['ROLES'] = '/api/roles/';
  EUri['ORGANIZATIONS'] = '/api/organizations/';
  EUri['LOGS'] = '/api/logs';
})((EUri = exports.EUri || (exports.EUri = {})));
var EAttribute;
(function (EAttribute) {
  EAttribute['ALL'] = '*';
})((EAttribute = exports.EAttribute || (exports.EAttribute = {})));
var EAction;
(function (EAction) {
  EAction['READ_ANY'] = 'read:any';
  EAction['READ_OWN'] = 'read:own';
  EAction['CREATE_OWN'] = 'create:own';
  EAction['CREATE_ANY'] = 'create:any';
  EAction['UPDATE_OWN'] = 'update:own';
  EAction['UPDATE_ANY'] = 'update:any';
  EAction['DELETE_ANY'] = 'delete:any';
  EAction['DELETE_OWN'] = 'delete:own';
})((EAction = exports.EAction || (exports.EAction = {})));
var EFuncAction;
(function (EFuncAction) {
  EFuncAction['READ'] = 'read';
  EFuncAction['READ_ANY'] = 'readAny';
  EFuncAction['READ_OWN'] = 'readOwn';
  EFuncAction['CREATE'] = 'create';
  EFuncAction['CREATE_OWN'] = 'createOwn';
  EFuncAction['CREATE_ANY'] = 'createAny';
  EFuncAction['UPDATE'] = 'update';
  EFuncAction['UPDATE_OWN'] = 'updateOwn';
  EFuncAction['UPDATE_ANY'] = 'updateAny';
  EFuncAction['DELETE'] = 'delete';
  EFuncAction['DELETE_ANY'] = 'deleteAny';
  EFuncAction['DELETE_OWN'] = 'deleteOwn';
})((EFuncAction = exports.EFuncAction || (exports.EFuncAction = {})));
var ECategories;
(function (ECategories) {
  ECategories['ALL'] = 'All';
  ECategories['DONE'] = 'Done';
  ECategories['UPCOMING'] = 'Upcoming';
  ECategories['OVERDUE'] = 'Overdue';
  ECategories['SIGNATURE_REQUIRED'] = 'Awaiting_Signature';
  ECategories['ARCHIVED'] = 'Archived';
  ECategories['TODO'] = 'To_Do';
})((ECategories = exports.ECategories || (exports.ECategories = {})));
var EUserIncludes;
(function (EUserIncludes) {
  EUserIncludes['TRACKING_ITEM'] = 'trackingitem';
})((EUserIncludes = exports.EUserIncludes || (exports.EUserIncludes = {})));
var EUserResources;
(function (EUserResources) {
  EUserResources['MEMBER_TRACKING_ITEMS'] = 'membertrackingitems';
  EUserResources['MEMBER_TRACKING_RECORDS'] = 'membertrackingrecords';
})((EUserResources = exports.EUserResources || (exports.EUserResources = {})));
