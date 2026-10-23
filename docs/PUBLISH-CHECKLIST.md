# Before publishing
- [ ] Rotate the ESPHome API key that used to be hard-coded in the original file; put the new one in `secrets.yaml`
- [ ] Confirm license (MIT placeholder)
- [ ] Provide Nextion `.HMI` source (only compiled `.tft` is here)
- [ ] Replace personal default entities in `substitutions` / HA package with generic ones
- [ ] Add screenshots (`ha-shot`) to README
- [ ] grep for IPs, names, tokens: `grep -rnE "192\.168|token|password" .`
