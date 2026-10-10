# Compatibility and validation

Fluxora requires a modern native JavaScript LuCI, procd, UCI, ubus, jsonfilter, rpcd-mod-file, BusyBox shell/awk and readable interface statistics. It contains no CPU-specific executable. Browser features include SVG, MutationObserver and Web Animations (motion is optional). Current Chromium/Firefox-class browsers are the intended clients.

## Package-manager matrix

The following checks use checksum-verified official OpenWrt rootfs archives and the **real package manager from that rootfs**:

| Fixture | Architecture | Package | Validation |
| --- | --- | --- | --- |
| OpenWrt 23.05.6 | x86/64 | all IPK | Isolated opkg install, permissions, shell syntax, large-number arithmetic |
| OpenWrt 24.10.5 | x86/64 | all IPK | Same checks |
| OpenWrt 24.10.5 | ARMv7 / 32-bit | all IPK | Same checks under QEMU user emulation |
| OpenWrt 24.10.5 | ARMv8 / 64-bit | all IPK | Same checks under QEMU user emulation |
| OpenWrt 25.12.0 | x86/64 | noarch APK | Real apk-tools 3 install, same file/arithmetic checks |

Install tests use an isolated offline root and metadata-only dependency fixtures; APK tests skip service scripts. They validate package handling, not the functionality of stubbed dependencies or a complete booted LuCI session. ARM results are emulation results, not hardware benchmarks. ARM APK has the same noarch payload but is not separately exercised in an ARM apk rootfs in this matrix.

OpenWrt 23.05/24.10-compatible iStoreOS is an intended target. Other custom derivatives and snapshots need the same APIs and appropriate package manager. OpenWrt 22.03 and older are not in the release matrix; no blanket support promise is made. [OpenWrt 25.12 release notes](https://openwrt.org/releases/25.12/notes-25.12.0) document the transition to APK.

## Behavioral checks

- `test_backend.py`: simulated interface byte/packet/error/drop deltas, resets, initial baselines, virtual-interface exclusion, persistent restoration, active-hour rollover, retention, ring limits, JSON and package structure.
- `test_ui.cjs`: date boundaries, allowance basis, forecasting, percentiles, charts, calendar, grouping/pagination, CSV, settings, empty state, responsive/dark views, three languages, paused hidden tabs, request failures, concurrent-call prevention and cleanup after ancestor removal.
- 250 changing live updates: stable DOM element count and original card/SVG identities; one maximum concurrent request. Garbage-collected JS heap growth was small in the isolated Chromium run. This is not a proof that a long-running real session can never leak.
- `test_opkg.py`: retains the earlier malformed-IPK regression check and validates current installation with OpenWrt 24.10.5 opkg.
- `test_compatibility.py`: executes the matrix above, checks exact package-manager success and >1 TiB awk arithmetic, writes logs and JSON results.

## Resource bounds

Fixed 5-second collection, 180 rate records, 90 days of hourly history. The live response contains only today's cached row, current hour and short-term rates. Full responses expose eight days of hours plus daily history, about once per minute. Daily history is retained indefinitely; its memory/disk usage grows slowly with recorded days. Many simultaneously open browser sessions still create independent read requests.

With a simulated 3650-day / 2160-hour dataset in the original WSL benchmark, the small live response was about 7.4 KB, compared with about 575 KB for the old full response. 100 samples took approximately 1.24 seconds versus 2.59 seconds before current-hour optimization; these include process-launch overhead and are not real router CPU readings. For comparative benchmarking, supply an earlier IPK to `test_performance.py`.

## Physical-router limits

Full service lifecycle, firmware-specific LuCI theme behavior, power-loss recovery, offload counters and long-term hardware memory use should be checked on each deployment. Device counters depend on drivers/offload implementation; equality with ISP billing is not promised. Time synchronization is required. Install dependencies from the firmware's matching repositories.

Reports should include firmware, device name, package version, browser and reproduction steps, without credentials or private network information.

## Standalone checks (1.5.0)

`test_standalone.cjs` runs the shipped shared bundle over HTTP and checks refresh, theme persistence, language changes, fullscreen, mobile overflow and serialized requests. `test_web.py` uses the real OpenWrt 24.10.5 uhttpd in an isolated root, checking HTML/assets, read-only JSON, denied writes/commands/Host/Origin/traversal, the off switch and private-address/port validation. These do not replace live procd/network-event or long-term router hardware validation.
