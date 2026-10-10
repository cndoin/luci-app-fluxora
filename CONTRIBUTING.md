# Contributing to Fluxora

Use issues for reproducible bugs or focused feature ideas. English, 中文 and 日本語 are welcome.

For a bug, include firmware version, package manager, package version, selected WAN device, browser and exact reproduction steps. Remove credentials, MAC/IP addresses and other private information from logs or screenshots.

The router runtime must remain plain BusyBox shell and native LuCI JavaScript. Do not introduce CDN dependencies, client tracking or a browser framework for simple presentation changes. Keep one-device accounting, persistent-history compatibility and bounded short-term data intact.

```sh
python3 build.py
python3 test_backend.py
npm ci
npx playwright install chromium
npm test
```

Run `python3 test_compatibility.py --target all` as root in an isolated Linux development environment with apk-tools v3 and QEMU user static installed. This downloads checksum-verified official rootfs fixtures and installs only into temporary directories. It does not prove full LuCI integration or hardware performance. See [compatibility notes](docs/COMPATIBILITY.md).

`Makefile` supports OpenWrt SDK/buildroot integration. `build.py --format all` uses apk-tools v3 for the APK; Python and Node are development dependencies only.

Submit a focused pull request with the problem, behavior change and relevant checks. Preserve the template attribution in `root/usr/share/doc/luci-app-wan-traffic/TEMPLATE-LICENSE`.
