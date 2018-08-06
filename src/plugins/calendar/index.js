/**
 * @overview Google Calendar plugin.
 */

const documentation = require('./documentation');
const { requestDeviceAndUserCodes, pollAuthorization, revokeAuthorization } = require('./util');
const { calendar } = require('../../config');

/** Authenticate with the user's Google Calendar. */
const init = async (_, config) => {
  console.log("Welcome! Let's set up the Google Calendar plugin.");

  // Start the OAuth flow
  let deviceAndUserCodes = null;

  try {
    deviceAndUserCodes = await requestDeviceAndUserCodes(calendar.clientId);
  } catch (e) {
    console.log('Oh snap :( Something went wrong.');
    return;
  }

  // Show instructions to continue the authorisation
  console.log(
    `Open ${deviceAndUserCodes.verification_url} in a browser and enter ${
      deviceAndUserCodes.user_code
    } when prompted.`
  );

  console.log('Waiting for your response...');

  // Start polling the Google OAuth server for the users response
  let interval = setInterval(async () => {
    const { error, error_description: errorDescription, ...pollResult } = await pollAuthorization(
      calendar.clientId,
      calendar.clientSecret,
      deviceAndUserCodes.device_code
    );

    // User hasn't responded to the consent prompt yet
    if (error && error === 'authorization_pending') return;

    // User refused to grant access
    if (error && error === 'access_denied') {
      console.log('Looks like you refused to grant access. You can try again if it was a mistake.');
    } else if (error) {
      console.log("Oops :( Something doesn't seem right...");
      console.log(`Error (${error}): ${errorDescription}`);
    }

    // Access granted
    if (!error) {
      config.set('calendar.authorization', {
        accessToken: pollResult.access_token,
        refreshToken: pollResult.refresh_token,
        tokenType: pollResult.token_type,
        expiresAt: Date.now() + pollResult.expires_in * 1000,
      });

      console.log('Google Calendar plugin is now ready.');
    }

    clearInterval(interval);
  }, deviceAndUserCodes.interval * 1000);
};

/** Reset the tokens for the user's Google Calendar. */
const reset = async (_, config) => {
  const token = config.get('calendar.authorization.accessToken');

  if (token) await revokeAuthorization(token);

  config.delete('calendar.authorization');
  console.log('Google Calendar is now reset.');
};

/** Insert new events to the user's Google Calendar. */
const onAdd = () => {
  console.log('Calendar: Event added.');
};

/** Update an existing event in the user's Google Calendar. */
const onUpdate = () => {
  console.log('Calendar: Event updated.');
};

module.exports = async (args, config, timeline) => {
  Object.entries({ init, reset }).forEach(([name, handler]) => {
    timeline.registerCommand(
      `calendar.${name}`,
      handler.bind(null, args, config, timeline),
      documentation[name]
    );
  });

  timeline.on('event.add', onAdd);
  timeline.on('event.update', onUpdate);
};
