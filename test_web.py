"""Exercise the read-only CGI with the real OpenWrt 24.10 uhttpd binary."""
import pathlib
from linux_support import run_linux
from generate_standalone import bundle
base=pathlib.Path(__file__).resolve().parent
(base/'test-cache/web-bundle.js').write_bytes(bundle())
script=r'''
set -eu
T=$(mktemp -d /tmp/fluxora-web-test.XXXXXX)
pid=''
trap '[ -z "$pid" ] || kill "$pid" 2>/dev/null; rm -rf "$T"' EXIT
tar -xzf "$SOURCE/test-cache/openwrt-24.10.5-x86-64-rootfs.tar.gz" -C "$T"
mkdir -p "$T/www/wan-traffic" "$T/usr/libexec"
cp -R "$SOURCE/root/www/wan-traffic/"* "$T/www/wan-traffic/"
cp "$SOURCE/root/usr/libexec/wan-traffic-api" "$T/usr/libexec/"
cp "$SOURCE/root/usr/libexec/wan-traffic-web" "$T/usr/libexec/"
cp "$SOURCE/test-cache/web-bundle.js" "$T/www/wan-traffic/dashboard.js"
cp "$SOURCE/root/www/luci-static/resources/wan-traffic/dashboard.css" "$T/www/wan-traffic/"
cp "$SOURCE/root/etc/config/wan_traffic" "$T/etc/config/"
chmod 755 "$T/www/wan-traffic/cgi-bin/data" "$T/usr/libexec/wan-traffic-api" "$T/usr/libexec/wan-traffic-web"
chroot "$T" /usr/sbin/uhttpd -f -c /dev/null -p 127.0.0.1:40189 -h /www/wan-traffic -I index.html -x /cgi-bin -S -D -R -n 2 -N 16 -t 15 -T 20 -k 5 > "$T/server.log" 2>&1 &
pid=$!
for retry in 1 2 3 4 5; do
 if wget -q -O "$T/index" http://127.0.0.1:40189/ 2>/dev/null; then break; fi
 sleep 1
done
grep -q 'Fluxora' "$T/index"
wget -q -O "$T/bundle" http://127.0.0.1:40189/dashboard.js
grep -q 'startStandalone(app)' "$T/bundle"
wget -q -O "$T/config" 'http://127.0.0.1:40189/cgi-bin/data?config'
grep -q '"refresh_interval":"5"' "$T/config"
! grep -q 'web_port\|password\|device' "$T/config"
wget -q -O "$T/status" 'http://127.0.0.1:40189/cgi-bin/data?status'
grep -q '"days":\[' "$T/status"
wget -q -O "$T/live" 'http://127.0.0.1:40189/cgi-bin/data?live'
grep -q '"today":' "$T/live"
http_code() { wget -S -O /dev/null "$@" 2>&1 | awk '/HTTP\/1.[01]/ {sub(/^.*HTTP\/1.[01] /,"");split($0,a," ");code=a[1]} END{print code}'; }
test "$(http_code --post-data '' 'http://127.0.0.1:40189/cgi-bin/data?config')" = 405
test "$(http_code 'http://127.0.0.1:40189/cgi-bin/data?flush')" = 404
test "$(http_code --header 'Host: attacker.invalid' 'http://127.0.0.1:40189/cgi-bin/data?status')" = 403
test "$(http_code --header 'Origin: http://attacker.invalid' 'http://127.0.0.1:40189/cgi-bin/data?status')" = 403
test "$(http_code 'http://127.0.0.1:40189/../../etc/config/wan_traffic')" != 200
mkdir -p "$T/tmp/stubs"
printf '#!/bin/sh\ncat /tmp/network-status\n' > "$T/tmp/stubs/ubus"
chmod 755 "$T/tmp/stubs/ubus"
chroot "$T" /bin/sh -c 'uci set wan_traffic.main.web_enabled=1; uci commit wan_traffic'
printf '{"ipv4-address":[{"address":"192.168.100.1"}]}' > "$T/tmp/network-status"
chroot "$T" /bin/sh -c 'PATH=/tmp/stubs:$PATH /usr/libexec/wan-traffic-web address' > "$T/address"
grep -q '"address":"192.168.100.1","port":8810' "$T/address"
chroot "$T" /bin/sh -c 'uci set wan_traffic.main.web_interface=wan; uci commit wan_traffic'
if chroot "$T" /bin/sh -c 'PATH=/tmp/stubs:$PATH /usr/libexec/wan-traffic-web address'; then exit 1; fi
chroot "$T" /bin/sh -c 'uci set wan_traffic.main.web_interface=lan; uci commit wan_traffic'
for address in 8.8.8.8 0.0.0.0 127.0.0.1 192.168.1.999; do
 printf '{"ipv4-address":[{"address":"%s"}]}' "$address" > "$T/tmp/network-status"
 if chroot "$T" /bin/sh -c 'PATH=/tmp/stubs:$PATH /usr/libexec/wan-traffic-web address'; then exit 1; fi
done
printf '{"ipv4-address":[{"address":"10.0.0.1"}]}' > "$T/tmp/network-status"
chroot "$T" /bin/sh -c 'uci set wan_traffic.main.web_port=80; uci commit wan_traffic'
if chroot "$T" /bin/sh -c 'PATH=/tmp/stubs:$PATH /usr/libexec/wan-traffic-web address'; then exit 1; fi
chroot "$T" /bin/sh -c 'uci set wan_traffic.main.web_enabled=0; uci commit wan_traffic; /usr/libexec/wan-traffic-web address' > "$T/disabled"
grep -q '"enabled":false' "$T/disabled"
echo 'PASS: real OpenWrt uhttpd serves standalone HTML and read-only JSON; POST, unknown commands, foreign Host/Origin and traversal rejected'
echo 'PASS: default-off switch, private LAN address resolution, public/wildcard/loopback/invalid address and reserved port rejection'
'''
result=run_linux(script,base)
print(result.stdout+result.stderr)
if result.returncode:raise SystemExit(result.returncode)
