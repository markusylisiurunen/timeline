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
const { authorization, calendars, events } = require('./util');
const { name, calendar } = require('../../config');

/** Authenticate with the user's Google Calendar. */
const init = async (_, config) => {
  if (await authorization.isAuthorized(config)) {
    console.log('Seems like you are already set up :)');
    return;
  }

  console.log("Welcome! Let's set up the Google Calendar plugin.\n");

  // Start the OAuth flow
  const codes = await authorization.getCodes(calendar.clientId);

  console.log(`Step 1. Open ${codes.verification_url} in a browser`);
  console.log(`Step 2. Enter ${codes.user_code}`);
  console.log('\nWaiting for your response...');

  // Start polling the Google OAuth server for the users response
  let interval = setInterval(async () => {
    try {
      await (async () => {
        let pollResult = null;

        try {
          pollResult = await authorization.poll(
            calendar.clientId,
            calendar.clientSecret,
            codes.device_code
          );
        } catch (data) {
          // User hasn't responded to the consent prompt yet
          if (data.error && data.error === 'authorization_pending') return;

          if (data.error) {
            if (data.error === 'access_denied') {
              console.log('You refused to give the needed permissions.');
            } else {
              console.log("Oops :( Something doesn't seem right...");
            }

            clearInterval(interval);
            return;
          }
        }

        clearInterval(interval);

        console.log('Permissions granted. Checking for the calendar...');

        // Access was granted
        const credentials = {
          accessToken: pollResult.access_token,
          refreshToken: pollResult.refresh_token,
          tokenType: pollResult.token_type,
          expiresAt: Date.now() + pollResult.expires_in * 1000,
        };

        config.set('calendar.credentials', credentials);

        // Ensure that there is a valid calendar to add the events to
        const cals = await calendars.list(credentials);
        let theCalendar = cals.find(({ summary }) => summary === name);

        if (!theCalendar) {
          theCalendar = await calendars.create(credentials, { summary: name });
          console.log('A new calendar created.');
        }

        config.set('calendar.calendarId', theCalendar.id);

        console.log('Calendar plugin is now ready to be used.');
      })();
    } catch (error) {
      console.log(JSON.stringify(error));
      clearInterval(interval);
    }
  }, codes.interval * 1000);
};

/** Reset the tokens for the user's Google Calendar. */
const reset = async (_, config) => {
  const credentials = config.get('calendar.credentials');

  if (credentials) {
    await authorization.revoke(credentials.accessToken);

    config.set('calendar.credentials', null);
    config.set('calendar.calendarId', null);
  }

  console.log('Google Calendar is now reset.');
};

/** Insert new events to the user's Google Calendar. */
const onAdd = async (config, timeline, event) => {
  if (!(await authorization.isAuthorized(config))) return;

  let { credentials, calendarId, colors = {} } = config.get('calendar');

  if (!colors[event.type]) {
    config.set(
      `calendar.colors.${event.type}`,
      `#${Array.from({ length: 6 }).map(() => Math.floor(Math.random() * 10))}`
    );
  }

  try {
    await events.insert(credentials, calendarId, {
      start: { dateTime: new Date(event.from).toISOString() },
      end: { dateTime: new Date(event.to).toISOString() },
      summary: event.description,
    });
  } catch (error) {
    console.log(JSON.stringify(error));
  }
};

module.exports = async (args, config, timeline) => {
  Object.entries({ init, reset }).forEach(([name, handler]) => {
    timeline.registerCommand(
      `calendar.${name}`,
      handler.bind(null, args, config, timeline),
      documentation[name]
    );
  });

  timeline.on('event.add', onAdd.bind(null, config, timeline));
};
