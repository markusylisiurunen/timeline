![build status](https://travis-ci.org/markusylisiurunen/timeline.svg?branch=master)
![npm version](https://badge.fury.io/js/%40markusylisiurunen%2Ftimeline.svg)
![github issues](https://img.shields.io/github/issues/markusylisiurunen/timeline.svg)
![license](https://img.shields.io/github/license/markusylisiurunen/timeline.svg)

# Timeline

A CLI tool for tracking events on a timeline.

## Installation

```sh
$ npm install -g @markusylisiurunen/timeline
```

## Setup

The application uses Google services (Calendar and Sheets) to display and store data. However, these
services require the user to grant permissions for the application. This can be done with a single
command.

`$ timeline google init`

This command will give you an URL and a code. To grant the required permissions, navigate to the
provided URL and write the code once prompted.

> **Tip** You can find the spreadsheet id from the URL in your browser.

If you want to revoke the permissions, you can run the following command.

`$ timeline google reset`

## Commands

Here is a list of all available commands.

| Command              | Description                                              |
| -------------------- | -------------------------------------------------------- |
| `event add`          | Add a new event to your timeline.                        |
| `event report label` | Show a report of your events by label.                   |
| `event report type`  | Show a report of your events by type.                    |
| `google init`        | Grant the application access to your Google services.    |
| `google reset`       | Revoke the application's access to your Google services. |
| `google sync`        | Synchronize your timeline with your Google Calendar.     |
| `work add`           | Add a new work event to your timeline.                   |
| `work live`          | Show a live report of your work events.                  |
| `work report`        | Show a report of your work events.                       |

You can run the following command to get a more detailed description.

`$ timeline <command> --help`.

## License

MIT
