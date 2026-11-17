# Code signing policy

Free code signing provided by [SignPath.io](https://signpath.io), certificate by [SignPath Foundation](https://signpath.org).

*Status: applying to the SignPath Foundation programme. Until it is approved, Windows builds are unsigned.*

## What is signed

Only `1EYE.exe`, the Windows desktop app, built from the source in [`desktop/`](desktop) by the
[Windows build workflow](.github/workflows/windows-release.yml) on GitHub-hosted runners.
Nothing built on a personal machine and no third-party binaries are signed under this certificate.

## Team and roles

| Role | Members |
|---|---|
| Committers and reviewers | [Balaj (@balajsajjad7-bot)](https://github.com/balajsajjad7-bot) |
| Approvers | [Balaj (@balajsajjad7-bot)](https://github.com/balajsajjad7-bot) |

- Only committers can push to this repository. Pull requests from anyone else are reviewed by a reviewer before they are merged.
- Every signing request is approved by hand by an approver in SignPath.
- All team members use multi-factor authentication on GitHub and SignPath.

## Privacy

See the [privacy policy](PRIVACY.md). 1EYE does not send information to any networked system unless the user asks it to
(for example by pressing **Go online** or adding an AI key).

## Uninstalling

1EYE is a portable app with no installer. Close it from **Control → Shut down** and delete `1EYE.exe` and the
`1EYE_Data` and `1EYE_Shared` folders next to it. 1EYE writes nothing else to the system.
