# Security policy

*Effective 18 November 2026*

## Reporting a vulnerability

Please report security problems privately, not in a public issue:

1. Go to the [Security tab](https://github.com/balajsajjad7-bot/1eye/security) of the 1EYE repository and choose **Report a vulnerability**.
2. Describe the problem, the version, and the steps to reproduce it.

If private reporting isn't available, open an issue titled "Security contact request" without any details, and we will reply with a private way to send them.

We aim to acknowledge reports within 3 days and to ship a fix for confirmed high-severity issues within 30 days. We will credit you in the release notes unless you prefer not to be named.

## Supported versions

Only the latest release gets security fixes. Opening a newer 1EYE replaces an older copy that is still running.

## In scope

- The 1EYE apps (Windows, Android, macOS, Linux) and their web interface
- PIN sign-in, device sessions, host-only controls, file access, the Anywhere and permanent-domain entry points, AI and Cloud features
- The website at 1eye.dpdns.org

## Out of scope

- Problems in third-party services (Cloudflare, localhost.run, Pinggy, Groq, Google, WebDAV providers): report those to them
- Attacks that need physical access to an unlocked host, or the PIN already
- Denial of service by flooding, and social engineering

## Safe harbour

We won't take action against good-faith research that follows this policy, avoids privacy violations and data destruction, and only tests hosts you own.

## How 1EYE protects you

- A 6-digit PIN with sign-in limits, including a pause after repeated wrong PINs from the internet
- Host controls only from the host itself; DNS-rebinding and cross-site request protection
- Strict security headers and sandboxed previews for HTML, SVG and XML files
- Secure cookies over HTTPS; secrets stored in a file only your user account can read
- Open source, so anyone can review the code
