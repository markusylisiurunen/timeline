![build status](https://travis-ci.org/markusylisiurunen/timeline.svg?branch=master)
![npm version](https://badge.fury.io/js/%40markusylisiurunen%2Ftimeline.svg)
![github issues](https://img.shields.io/github/issues/markusylisiurunen/timeline.svg)
![license](https://img.shields.io/github/license/markusylisiurunen/timeline.svg)

# Timeline

A CLI tool for flexible time tracking.

1. [Installation](#installation)
2. [Setup](#setup)
3. [Commands](#commands)
4. [Development](#development)
   1. [Running commands](#running-commands)
   2. [Google services](#google-services)
5. [License](#license)

## Installation

```sh
$ npm install -g @markusylisiurunen/timeline
```

or

```sh
$ yarn global add @markusylisiurunen/timeline
```

## Setup

This tool uses Google services to save and display the logged time. Google Sheets is used for
storing the logged entries and Google Calendar is used to display them. You need to grant
permissions to these services before you can start using this tool.

To grant the required permissions, you can run the following command and follow the instructions.

```sh
$ timeline google init
```

This process will set up Google Sheets and Google Calendar for the tool. You should create a new
Google Sheet document and it's also recommended to create a new Google Calendar calendar in order to
separate your personal calendar events from the events created by this tool.

> **Tip:** The Google Sheet document id can be found in the URL bar of your browser.

To revoke the access token granted to this tool, you can run the following command.

```sh
$ timeline google reset
```

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

```sh
$ timeline <command> --help
```

## Development

This section contains the instructions to develop this package.

### Running commands

You could run `npm link` to install the package globally but that would conflict with the real
published package from npm. Instead, you should run commands by doing `npm start -- <command>`. This
will make sure you are "sandboxed" in the development environment.

```sh
$ npm start -- event add
```

### Google services

Currently this package relies only on Google services to store events. You should setup the
development version in a same way as described in the [setup](#setup) section.

> Note! You should use the `npm start -- <command>` versions of the commands.

## License

MIT
