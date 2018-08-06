/**
 * @overview Google Calendar plugin.
 *
 * Google Calendar plugin config:
 *
 * {
 *   "credentials": "Object|null <stored credentials for this plugin>",
 *   "calendarId": "String|null <id of the attached calendar>",
 *   "colors": "Object <assigned color for each type of event>"
 * }
 */

const documentation = require('./documentation');
const config = require('../../config');
const util = require('./util');

/**
 * Initialise the Google Calendar plugin and ask for permissions to access user's calendar.
 * @param {Configstore} configstore The global configuration store.
 */
const init = async (_, configstore) => {
  if (await util.authorization.isAuthorized(configstore)) {
    console.log('Seems like you are already set up :)');
    return;
  }

  console.log("Welcome! Let's set up the Google Calendar plugin.\n");

  // Start the OAuth flow
  const codes = await util.authorization.getCodes(config.calendar.clientId);

  console.log(`Step 1. Open ${codes.verification_url} in a browser`);
  console.log(`Step 2. Enter ${codes.user_code}`);
  console.log('\nWaiting for your response...');

  // Start polling the Google OAuth server for the users response
  let interval = setInterval(async () => {
    try {
      await (async () => {
        let pollingResponse = null;

        try {
          pollingResponse = await util.authorization.poll(
            config.calendar.clientId,
            config.calendar.clientSecret,
            codes.device_code
          );
        } catch (data) {
          // User hasn't responded to the consent prompt yet
          if (data.error && data.error === 'authorization_pending') return;

          // Some other error has occurred, abort
          if (data.error) {
            if (data.error === 'access_denied') {
              console.log('You refused to give the requested permissions.');
            } else {
              console.log('Oops :( Something went wrong.');
            }

            clearInterval(interval);
            return;
          }
        }

        clearInterval(interval);

        console.log('Permissions granted. Checking for the calendar...');

        // Access was granted
        const credentials = {
          accessToken: pollingResponse.access_token,
          refreshToken: pollingResponse.refresh_token,
          tokenType: pollingResponse.token_type,
          expiresAt: Date.now() + pollingResponse.expires_in * 1000,
        };

        // Ensure that there is a valid calendar to add the events to
        const calendars = await util.calendars.list(credentials);
        let calendar = calendars.find(({ summary }) => summary === config.name);

        if (!calendar) {
          calendar = await calendars.create(credentials, { summary: config.name });
          console.log("Didn't find an existing calendar, created a new one.");
        }

        config.set('calendar.credentials', credentials);
        config.set('calendar.calendarId', calendar.id);

        console.log('Calendar plugin is now set up.');
      })();
    } catch (error) {
      console.log('Oops :( Something went wrong.');
      clearInterval(interval);
    }
  }, codes.interval * 1000);
};

/**
 * Reset the Google Calendar plugin.
 * @param {Configstore} configstore The global configuration store.
 */
const reset = async (_, configstore) => {
  const credentials = configstore.get('calendar.credentials');

  if (credentials) {
    config.set('calendar.credentials', null);
    config.set('calendar.calendarId', null);

    await util.authorization.revoke(credentials.accessToken);
  }

  console.log('Calendar plugin is reset.');
};

/**
 * Insert new events to Google Calendar.
 * @param {Configstore} configstore The global configuration store.
 * @param {Timeline}    timeline    Timeline instance.
 * @param {Object}      event       Added event.
 */
const onAdd = async (configstore, timeline, event) => {
  // Skip this if the plugin has not been granted permission
  if (!(await util.authorization.isAuthorized(configstore))) return;

  let { credentials, calendarId, colors = {} } = configstore.get('calendar');

  if (!colors[event.type]) {
    config.set(
      `calendar.colors.${event.type}`,
      `#${Array.from({ length: 6 })
        .map(() => Math.floor(Math.random() * 10))
        .join('')}`
    );
  }

  try {
    const summary = `${event.type}: ${event.description}`;

    await util.events.insert(credentials, calendarId, {
      start: { dateTime: new Date(event.from).toISOString() },
      end: { dateTime: new Date(event.to).toISOString() },
      summary,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = async (args, configstore, timeline) => {
  Object.entries({ init, reset }).forEach(([name, handler]) => {
    timeline.registerCommand(
      `calendar.${name}`,
      handler.bind(null, args, configstore, timeline),
      documentation[name]
    );
  });

  timeline.on('event.add', onAdd.bind(null, configstore));
};
