# Architecture

```text
Linux WAN counters → 5-second sampler → RAM daily / active hour / 180-rate ring
                                          ↓ periodic atomic save
                                    /etc/wan-traffic/*.csv

LuCI page → fixed ACL reads → live (selected interval) / status (about once a minute)
```

## Collector

`wan-traffic-worker` is supervised by procd. The API has fixed `sample`, `flush`, `status` and `live` operations; only the last two are granted to the dashboard by its ACL. One validated device is selected from UCI or netifd's logical interface. Virtual device prefixes are rejected by default.

Boot ID plus device identify the baseline. A new boot/device creates a fresh baseline without recounting existing counters. Counter decreases are treated as resets and add the new value. Rate denominators use `/proc/uptime`; an interval over 15 seconds contributes no observed coverage. Cross-day/hour increments are attributed to the sample's ending bucket. Time must be synchronized.

Byte arithmetic uses awk doubles with integer formatting, avoiding 32-bit shell arithmetic on large byte counters. Day rows use `date,rx,tx`; hour rows include epoch, hour label, bytes, observed seconds, peaks, packets, errors and drops. Current-hour writes stay separate from the 90-day archive, merged on rollover or disk save. A lock serializes sample/save operations; files are replaced by rename.

Daily history is retained indefinitely and grows with recorded days. Hour history is limited to 90 days and short-term rates to 180 entries. Normal stop flushes data; power loss can lose the configured save interval. Configuration and history are included in sysupgrade keep rules. Uninstall stops the service and preserves history.

## Dashboard

Native LuCI `view`, `form`, `uci`, `fs`, and `poll` modules. The interface language follows LuCI/browser or an explicit override. Translation dictionaries are local. SVG is generated from real samples; gaps over 15 seconds break the live curve. No third-party scripts or telemetry.

The layout renders before the statistics request. One request can be active at a time, old data survives errors, and a slow-response label appears after 12 seconds; transport timeout is LuCI's responsibility. This avoids starting new requests while an old RPC remains active. The live endpoint supplies today/current-hour/rates, while full history is synced every minute or on manual full refresh. Hidden tabs pause polling; navigation cleans up listeners, observer, timers and animations.

Readonly components reconcile DOM nodes; interactive history/calendar controls rebuild only on full sync. Soft animations use native browser APIs and CSS transitions, respect reduced-motion preferences and can be disabled. Quotas are reminders only and cannot limit traffic.

## Packages

`luci-app-wan-traffic` remains the package name for upgrade compatibility, with Fluxora as the public brand. IPK metadata uses `all`; APK uses `noarch`. ARM / x86 convenience ZIP files contain the same universal package bytes. The OpenWrt Makefile uses `PKGARCH:=all`. APK files are generated with apk-tools v3, not by renaming IPKs.

References: [Linux statistics](https://docs.kernel.org/networking/statistics.html), [LuCI](https://github.com/openwrt/luci), [OpenWrt packaging](https://github.com/openwrt/openwrt/blob/openwrt-25.12/include/package-pack.mk).

## Optional standalone dashboard (1.5.0)

A second procd-managed uhttpd instance starts only when `web_enabled=1`. `wan-traffic-web address` validates the port and resolves the configured LAN interface to a private IPv4 address. Network interface events and UCI reload triggers refresh the listener. It serves only `/www/wan-traffic`, disables directory listings and out-of-root symlinks, enables the RFC1918 filter, limits CGI concurrency to 2/connections to 16 and script timeouts to 15 seconds. No ubus HTTP handler or LuCI session is exposed. The CGI accepts only GET with exact numeric Host and same Origin (if supplied), and a fixed `config/status/live` allowlist. Config is a presentation-only whitelist. No CORS or configuration writes. LAN viewers do not authenticate; do not forward the port.

`generate_standalone.py` wraps the same core, translation and view source into a static bundle without eval. A small adapter supplies DOM creation, read-only fetch and serialized polling instead of LuCI RPC. Assets are local. The standalone server does not run another sampler.
