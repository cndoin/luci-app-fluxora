# Changelog

## 1.5.0 — 2026-10-10

- Add a default-off standalone LAN dashboard with configurable port/interface and a LuCI open button.
- Share the existing collector, metrics and translations; add fullscreen and remembered theme/language.
- Bind only a private LAN IPv4 address; expose a read-only CGI allowlist, reject foreign Host/Origin and writes, limit concurrent requests.
- Package the listener and dashboard in universal IPK/APK; verify the real OpenWrt uhttpd and standalone browser bundle.

## 1.4.0 — 2026-10-10

- Introduce **Fluxora** branding, MIT licensing and a public source repository.
- Add English, Simplified Chinese and Japanese interfaces and documentation.
- Detect the logical WAN device by default on new installations; retain existing device overrides when upgrading.
- Publish universal ARM / x86 IPK and APK packages. Keep the package name `luci-app-wan-traffic` for upgrades.
- Add an OpenWrt build-system Makefile, CI, verified rootfs fixtures and ARM emulation checks.

## 1.3.0

- Selectable page refresh intervals and optional soft motion.
- Pause hidden-tab requests, serialize RPC reads and clean up on navigation.
- Reuse live chart nodes; separate live requests from minute-level history sync.
- Update only the current hour at each sample; merge the hourly archive on rollover/save.

## 1.2.0

- Hourly distributions, usage calendar, busiest days, allowance forecasts and interface counters.
- Correct OpenWrt IPK envelope and parent-directory entries in revision 2.
