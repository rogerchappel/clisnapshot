# Security Policy

## Supported Versions

`clisnapshot` is pre-1.0. Security fixes target the latest `main` branch until versioned releases begin.

| Version | Supported |
| --- | --- |
| `main` | Yes |
| `< 0.1.0` | No |

## Reporting a Vulnerability

Please do not report suspected vulnerabilities in public issues, pull requests, or discussions.

Use GitHub private vulnerability reporting if it is enabled for the repository. If it is not enabled yet, open a public issue asking for a private reporting path without including exploit details, secrets, personal data, or sensitive technical details.

## Scope

In scope:

- Secret leakage caused by default scrubbing behavior.
- Unsafe snapshot path handling.
- Command execution behavior that differs from documented local-first expectations.
- CI, release, or dependency guidance maintained by this project.

Out of scope:

- Vulnerabilities in arbitrary commands users choose to snapshot.
- General support requests.
- Requests for guaranteed maintenance timelines.

## Response Expectations

Maintainers review good-faith reports as capacity allows. This project does not promise paid support, guaranteed response times, or service-level agreements.
