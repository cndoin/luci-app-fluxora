"""Validate using the real OpenWrt 24.10.5 x86/64 opkg, in an offline target."""
import pathlib, hashlib, subprocess, shlex
from linux_support import run_linux
base=pathlib.Path(__file__).resolve().parent
cache=base/'test-cache'; cache.mkdir(exist_ok=True)
image=cache/'openwrt-24.10.5-x86-64-rootfs.tar.gz'
url='https://downloads.openwrt.org/releases/24.10.5/targets/x86/64/openwrt-24.10.5-x86-64-rootfs.tar.gz'
digest='fb3245bce37575f1fc9cc467909c37c5b12e49bf7993a34cd19893511bccf40e'
if not image.exists() or hashlib.sha256(image.read_bytes()).hexdigest()!=digest:
    print('Downloading official OpenWrt test rootfs...',flush=True)
    partial=image.with_suffix('.partial')
    subprocess.run(['curl.exe','-fL','--connect-timeout','15','--max-time','120','-o',str(partial),url],check=True)
    partial.replace(image)
assert hashlib.sha256(image.read_bytes()).hexdigest()==digest,'Rootfs checksum mismatch'
version=(base/'VERSION').read_text().strip()
old=base/'dist/luci-app-wan-traffic_1.2.0-1_all.ipk'
if not old.exists():
    old=cache/'malformed-ar.ipk';old.write_bytes(b'!<arch>\n')
script=r'''
set -eu
T=$(mktemp -d /tmp/wan-traffic-opkg.XXXXXX)
# Only this newly allocated test directory is removed.
case "$T" in /tmp/wan-traffic-opkg.*) ;; *) exit 1;; esac
trap 'rm -rf "$T"' EXIT
mkdir -p "$T/root"
tar -xzf "$SOURCE/test-cache/openwrt-24.10.5-x86-64-rootfs.tar.gz" -C "$T/root"
mkdir -p "$T/root/tmp" "$T/root/tmp/lock" "$T/root/target/var/lock" "$T/root/target/tmp"
mkdir -p "$T/root/target/etc" "$T/root/target/usr/lib/opkg/info"
printf 'dest root /\nlists_dir ext /var/opkg-lists\narch all 1\narch x86_64 10\n' > "$T/root/target/etc/opkg.conf"
# Metadata-only dependency fixtures: test unpacking, not dependency functionality.
for pkg in libc luci-base rpcd rpcd-mod-file uci ubus jsonfilter; do
 printf 'Package: %s\nVersion: 1.0\nArchitecture: all\nStatus: install ok installed\n\n' "$pkg" >> "$T/root/target/usr/lib/opkg/status"
 touch "$T/root/target/usr/lib/opkg/info/$pkg.list"
done
cp "$SOURCE/OLD_FILE" "$T/root/tmp/old.ipk"
cp "$SOURCE/dist/luci-app-wan-traffic_VERSION-1_all.ipk" "$T/root/tmp/new.ipk"
chroot "$T/root" /bin/opkg --version
set +e
chroot "$T/root" /bin/opkg --offline-root /target --force-depends install /tmp/old.ipk > "$T/old.log" 2>&1
old_rc=$?
set -e
cat "$T/old.log"
[ "$old_rc" -ne 0 ]
grep -q 'Malformed package file' "$T/old.log"
# No router services run: installation is into an offline root, without LuCI dependencies.
chroot "$T/root" /bin/opkg --offline-root /target --force-depends install /tmp/new.ipk
chroot "$T/root" /bin/opkg --offline-root /target status luci-app-wan-traffic
test -x "$T/root/target/usr/libexec/wan-traffic-api"
test -f "$T/root/target/www/luci-static/resources/view/wan-traffic/dashboard.js"
test -f "$T/root/target/etc/config/wan_traffic"
chroot "$T/root" /bin/sh -n /target/usr/libexec/wan-traffic-api
echo 'PASS: original Malformed error reproduced; fixed package accepted and installed by OpenWrt 24.10.5 opkg.'
'''
script=script.replace('OLD_FILE',old.relative_to(base).as_posix()).replace('_VERSION-','_'+version+'-')
result=run_linux(script,base)
log=result.stdout+result.stderr
(cache/'opkg-validation.log').write_text(log,encoding='utf-8')
print(log)
assert result.returncode==0,'Real opkg validation failed'
