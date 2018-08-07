# Timeline

A CLI application for tracking events on a timeline.

## Setup

The application uses Google services (Calendar and Sheets) to display and store data. However, these
services require the user to grant permissions for the application. This can be done with a single
command.

`$ timeline google authorize`

This command will give you a URL and a code. To grant the required permissions, navigate to the
provided URL and write the code once prompted.

If you want to revoke the permissions, you can run the following command.

`$ timeline google revoke`

## Commands

Here is a list of all available commands.

| Command            | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `calendar.sync`    | Synchronize your timeline with your Google Calendar.     |
| `google.authorize` | Grant the application access to your Google services.    |
| `google.revoke`    | Revoke the application's access to your Google services. |
| `work.add`         | Add a new work event to your timeline.                   |
| `work.live`        | Show a live report of your work events.                  |

You can run the following command to get a more detailed description.

`$ timeline <command> --help`.
