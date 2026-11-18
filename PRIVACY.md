# Privacy policy

*Effective 18 November 2026*

1EYE has no accounts, no analytics, no telemetry and no update checks. There is no 1EYE server: the app runs on your own
PC or phone (the *host*) and your other devices connect to it.

## What stays on the host

Files, chat, links, the PIN, linked devices and settings are stored only in the `1EYE_Data` and `1EYE_Shared` folders
next to the app. The AI key, cloud sign-ins and the permanent-domain token are stored in `1EYE_Data/data.json`, readable only by your user
account, and are never sent to linked devices.

## When 1EYE contacts other systems

1EYE only connects to the services below when you turn on the feature that needs them:

| You do this | 1EYE connects to | What is sent |
|---|---|---|
| Use 1EYE on Wi-Fi | Only your own devices on your network | Whatever you share |
| Press **Go online** | Cloudflare (`trycloudflare.com`), or if that is blocked `localhost.run` or `pinggy.io` | Traffic between your devices passes through the tunnel service, encrypted with HTTPS |
| Press **Go online** for the first time on Windows, macOS or Linux | GitHub, to download Cloudflare's open-source `cloudflared` program | A normal download request |
| Add a permanent domain | Cloudflare Tunnel, using the token you paste | Same as Go online |
| Connect Google Drive or a WebDAV service in **Cloud** | Google (`accounts.google.com`, `googleapis.com`) or the WebDAV address you enter | Only files you save there, into a “1EYE” folder. Google access is limited to files 1EYE created |
| Add a Groq key and use 1EYE AI or `@eye` | Groq (`api.groq.com`) | Your question and only the context you choose (chat, links, file names, attached text files) |
| Any of the above when your network has no DNS | Cloudflare DNS (`1.1.1.1`) | The name of the service being looked up |

Each of these services has its own privacy policy. Turning the feature off (Go offline, remove the domain, remove the AI key, disconnect a cloud)
stops 1EYE contacting it.

## Cookies and browser storage

- **The site** sets no cookies, has no analytics and loads no third-party scripts or fonts.
- **The app** sets one essential cookie, `eye`, when a device signs in to your host. It keeps that device signed in and is sent only to your own host. It is not used for tracking and is removed when you disconnect the device.
- **The app** also saves your theme, sound and notification choices and your AI chat history in your browser's local storage on that device. Clearing site data removes them.

## Google user data

When you connect Google Drive, 1EYE asks only for the `drive.file` scope plus your email address. `drive.file` lets 1EYE see and manage only the files it creates or that you open with it, inside a "1EYE" folder. It cannot see the rest of your Drive.

1EYE uses this access only to save, list, download, share and delete the files you choose in the Cloud page. The Google sign-in token is stored on your host and never sent to us or to linked devices. Google user data is not sold, not used for advertising, not used to train AI models, and not transferred to anyone except as needed to provide these features you asked for or as required by law.

1EYE's use and transfer of information received from Google APIs adheres to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.

You can disconnect at any time in **Cloud → Disconnect**, which also revokes 1EYE's access, or at [myaccount.google.com/permissions](https://myaccount.google.com/permissions).

## How long data is kept

Everything 1EYE stores lives on your host until you delete it. Chat keeps the last 1,000 messages; files stay until someone deletes them. Removing the app and its `1EYE_Data` and `1EYE_Shared` folders removes all of it. Data you sent to a third-party service (a cloud, Groq) is kept under that service's own policy.

## Your choices and rights

Because the data is on your own device, you can see, export, correct or delete all of it yourself, at any time, without asking us. We hold no personal data about you, so we have nothing to send you or delete on request.

## Children

1EYE is not directed at children under 13, and we don't knowingly collect anyone's personal data. Children should use it with a parent or guardian.

## Changes to this policy

When this policy changes we update the date at the top and, for important changes, say so on the site or in the release notes.

## The website

1eye.dpdns.org is a static page hosted on Cloudflare Pages. It sets no cookies and has no analytics.

## Contact

Open an issue at https://github.com/balajsajjad7-bot/1eye/issues.
