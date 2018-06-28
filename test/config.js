var nconf = require('nconf');

var defaults = {
  V1_TENANTID: '[tenant-id]',
  V1_APPPRINCIPALID: '[app-principal-id]',
  V1_SYMMETRICKEY: '[symmetric-key]',
  V1_UPN: '[user-upn]',
  V2_WAAD_TENANTDOMAIN: '[tenant-domain]',
  V2_WAAD_CLIENTID: '[client-id]',
  V2_WAAD_CLIENTSECRET: '[client-secret]',
  V2_UPN: '[user-upn]',
  USER_OBJECT_ID: '[user-object-id]',
  USER_DISPLAY_NAME : '[user-display-name]',
  USER_GROUPS: '[user-groups]',
  INVALID_EMAIL: '[invalid-email]'
};

nconf
  .env()
  .file('./test/env.json')
  .required(Object.keys(defaults)); // Require this file exist in order to run tests - fail hard and fast

var config = nconf.get.bind(nconf);

module.exports = {
  // for v1 access_tokens tests
  v1: {
    TENANTID: config('V1_TENANTID'),
    APPPRINCIPALID: config('V1_APPPRINCIPALID'),
    SYMMETRICKEY: config('V1_SYMMETRICKEY'),
    UPN: config('V1_UPN')
  },
  // for waad v2 tests
  v2: {
    WAAD_TENANTDOMAIN: config('V2_WAAD_TENANTDOMAIN'),
    WAAD_CLIENTID: config('V2_WAAD_CLIENTID'),
    WAAD_CLIENTSECRET: config('V2_WAAD_CLIENTSECRET'),
    UPN: config('V2_UPN')
  },
  user: {
    objectId: config('USER_OBJECT_ID'),
    displayName : config('USER_DISPLAY_NAME'),
    groups: config('USER_GROUPS').split(','),
    allGroups: config('USER_GROUPS').split(',')
  },
  invalid_email: config('INVALID_EMAIL')
};
