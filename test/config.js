module.exports = {
  // for v1 accesss_tokens tests
  v1: {
    TENANTID: process.env.TENANTID || '[tenant-id]',
    APPPRINCIPALID: process.env.APPPRINCIPALID || '[app-principal-id]',
    SYMMETRICKEY: process.env.SYMMETRICKEY || '[symmetric-key]',
    UPN: '[user-upn]',
  },
  // for waad v2 tests
  v2: {
    WAAD_TENANTDOMAIN: process.env.WAAD_TENANTDOMAIN || '[tenant-domain]',
    WAAD_CLIENTID: process.env.WAAD_CLIENTID || '[client-id]',
    WAAD_CLIENTSECRET: process.env.WAAD_CLIENTSECRET || '[client-secret]',
    UPN: '[user-upn]',
  },
  user: {
    objectId: '[sample-user-object-id]',
    displayName : '[sample-user-display-name]',
    groups: ['[sample-user-direct-groups]'],
    allGroups: ['[sample-user-groups]']
  },

  invalid_email: '[invalid-user]',
};
