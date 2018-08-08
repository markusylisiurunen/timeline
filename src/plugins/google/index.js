/**
 * @overview Plugin to integrate with Google services.
 */

let refreshToken = async (args, context) => {};

let authenticate = async (args, context) => {};

let revoke = async (args, context) => {};

module.exports = (args, context) => {
  const { lifecycle, commands } = context;

  refreshToken = refreshToken.bind(null, args, context);
  authenticate = authenticate.bind(null, args, context);
  revoke = revoke.bind(null, args, context);

  // Refresh the access token on init if necessary
  lifecycle.on('init', refreshToken);

  // Register commands for this plugin
  commands.register('google.authenticate', authenticate, 'Help: authenticate.');
  commands.register('google.revoke', revoke, 'Help: revoke.');
};
