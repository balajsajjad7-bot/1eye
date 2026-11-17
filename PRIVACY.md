# Privacy policy

1EYE has no accounts, no analytics, no telemetry and no update checks. There is no 1EYE server: the app runs on your own
PC or phone (the *host*) and your other devices connect to it.

## What stays on the host

Files, chat, links, the PIN, linked devices and settings are stored only in the `1EYE_Data` and `1EYE_Shared` folders
next to the app. The AI key and the permanent-domain token are stored in `1EYE_Data/data.json`, readable only by your user
account, and are never sent to linked devices.

## When 1EYE contacts other systems

1EYE only connects to the services below when you turn on the feature that needs them:

| You do this | 1EYE connects to | What is sent |
|---|---|---|
| Use 1EYE on Wi-Fi | Only your own devices on your network | Whatever you share |
| Press **Go online** | Cloudflare (`trycloudflare.com`), or if that is blocked `localhost.run` or `pinggy.io` | Traffic between your devices passes through the tunnel service, encrypted with HTTPS |
| Press **Go online** for the first time on Windows | GitHub, to download Cloudflare's open-source `cloudflared` program | A normal download request |
| Add a permanent domain | Cloudflare Tunnel, using the token you paste | Same as Go online |
| Add a Groq key and use 1EYE AI or `@eye` | Groq (`api.groq.com`) | Your question and only the context you choose (chat, links, file names, attached text files) |
| Any of the above when your network has no DNS | Cloudflare DNS (`1.1.1.1`) | The name of the service being looked up |

Each of these services has its own privacy policy. Turning the feature off (Go offline, remove the domain, remove the AI key)
stops 1EYE contacting it.

## The website

1eye.dpdns.org is a static page hosted on Cloudflare Pages. It sets no cookies and has no analytics.

## Contact

Open an issue at https://github.com/balajsajjad7-bot/1eye/issues.
