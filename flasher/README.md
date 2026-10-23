# Web flasher (experimental)

`index.html` + `manifest.json` use [ESP Web Tools](https://esphome.github.io/esp-web-tools/) to flash the
firmware from the browser. It can be hosted with GitHub Pages (Settings → Pages → `/flasher`).

**The binary is not in the repository yet.** It must be built with ESPHome first (the author's environment could
not compile it during publication):

1. `cp esphome/secrets.yaml.example esphome/secrets.yaml` (values are irrelevant for the web build)
2. `esphome compile esphome/nspanel-dom-web.yaml`
3. Copy `.esphome/build/nspanel-dom/.pioenvs/nspanel-dom/firmware.factory.bin` to
   `flasher/firmware/nspanel-dom.factory.bin` and commit (or attach to a GitHub release).

`esphome/nspanel-dom-web.yaml` is the variant for shared binaries: no hard-coded Wi-Fi, **no shared API key**
(a public key would let anyone control your panel) – Wi-Fi is provisioned with Improv over serial and the API
runs without encryption on your LAN, or you set your own key after the first flash by re-flashing with your config.
For a personal, secure install use `esphome/nspanel-dom.yaml` with your own `secrets.yaml`.

`docs/ci/build-firmware.yml` is a GitHub Actions workflow that builds the binary on every release
(copy it to `.github/workflows/`, needs a token with the `workflow` scope).
