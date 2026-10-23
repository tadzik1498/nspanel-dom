# Contributing
Issues and PRs welcome. Never commit `secrets.yaml`, API keys or personal IP addresses.
Keep one tile type per PR and update the preview and firmware together (they must render identically).

Before every commit run `bash tests/scan-secrets.sh` (keys, passwords, tokens, private IPs, e-mails, meter numbers).
If a secret ever lands in git, rotate it first, then rewrite history.
