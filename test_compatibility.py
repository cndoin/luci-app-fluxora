"""Real OpenWrt package-manager checks in isolated roots; ARM uses QEMU."""
import argparse, hashlib, json, os, pathlib, shlex, subprocess
from linux_support import run_linux
base=pathlib.Path(__file__).resolve().parent
cache=base/'test-cache';cache.mkdir(exist_ok=True)
version=(base/'VERSION').read_text().strip()
matrix={
 '23.05-x86':('23.05.6','x86/64','79add2eb647ff03d838cc25cc9d0f923fb9aba1e6e738198034d02ca5a2a8622','opkg','native'),
 '24.10-x86':('24.10.5','x86/64','fb3245bce37575f1fc9cc467909c37c5b12e49bf7993a34cd19893511bccf40e','opkg','native'),
 '24.10-arm64':('24.10.5','armsr/armv8','f8f6bba184d691365e15bf6241a3f88afe7af47fc443c6e9ee5de15e1c9d6d43','opkg','aarch64'),
 '24.10-arm32':('24.10.5','armsr/armv7','4c9050533cc261721d0c89dc4a459b0a70804350a14c320d3bb7f3be7a9bf860','opkg','arm'),
 '25.12-x86':('25.12.0','x86/64','11c2f26b9d48c02cbdb3b63d499e1f6413ed62bcdbbea78937b12279b95acb1e','apk','native'),
}
parser=argparse.ArgumentParser();parser.add_argument('--target',choices=list(matrix)+['all'],default='all');args=parser.parse_args()
reports=[]
for target,(release,platform,digest,manager,emulation) in matrix.items():
 if args.target not in ('all',target):continue
 name=f'openwrt-{release}-{platform.replace("/","-")}-rootfs.tar.gz';image=cache/name
 url=f'https://downloads.openwrt.org/releases/{release}/targets/{platform}/{name}'
 if not image.exists() or hashlib.sha256(image.read_bytes()).hexdigest()!=digest:
  print('Downloading '+name,flush=True)
  partial=image.with_suffix('.partial')
  subprocess.run(['curl.exe' if os.name=='nt' else 'curl','-fsSL','--retry','2','--connect-timeout','15','--max-time','600','-o',str(partial),url],check=True)
  assert hashlib.sha256(partial.read_bytes()).hexdigest()==digest,'Official rootfs checksum mismatch'
  partial.replace(image)
 package=f'luci-app-wan-traffic_{version}-1_all.ipk' if manager=='opkg' else f'luci-app-wan-traffic-{version}-r1.apk'
 setup='IMAGE='+shlex.quote(name)+'\nPACKAGE='+shlex.quote(package)+'\nEMULATION='+shlex.quote(emulation)+'\nMANAGER='+shlex.quote(manager)+'\n'
 script=setup+r'''
set -eu
T=$(mktemp -d /tmp/fluxora-compat.XXXXXX)
case "$T" in /tmp/fluxora-compat.*) ;; *) exit 1;; esac
trap 'rm -rf "$T"' EXIT
mkdir -p "$T/root" "$T/target/etc" "$T/target/tmp" "$T/target/var/lock" "$T/target/usr/lib/opkg/info"
tar -xzf "$SOURCE/test-cache/$IMAGE" -C "$T/root"
guest() {
 if [ "$EMULATION" = native ]; then chroot "$T/root" "$@"; return; fi
 program=$1; shift
 qemu=$(command -v "qemu-$EMULATION-static" || true)
 if [ -n "$qemu" ]; then "$qemu" -L "$T/root" "$T/root$program" "$@"; return; fi
 # Existing Windows WSL fixture: isolated Alpine packages, no binfmt changes.
 LD_LIBRARY_PATH=/tmp/fluxora-qemu/lib:/tmp/fluxora-qemu/usr/lib "/tmp/fluxora-qemu/usr/bin/qemu-$EMULATION" -U LD_LIBRARY_PATH -L "$T/root" "$T/root$program" "$@"
}
mkdir -p "$T/root/tmp" "$T/root/target"
case "$MANAGER" in opkg) EXT=ipk;; apk) EXT=apk;; esac
cp "$SOURCE/dist/$PACKAGE" "$T/root/tmp/plugin.$EXT"
if [ "$MANAGER" = opkg ]; then
 printf 'dest root /\nlists_dir ext /var/opkg-lists\narch all 1\narch x86_64 10\narch aarch64_generic 10\narch arm_cortex-a15_neon-vfpv4 10\n' > "$T/target/etc/opkg.conf"
 # Dependency stubs verify the package envelope, not LuCI integration.
 for pkg in libc luci-base rpcd rpcd-mod-file uci ubus jsonfilter; do
  printf 'Package: %s\nVersion: 1.0\nArchitecture: all\nStatus: install ok installed\n\n' "$pkg" >> "$T/target/usr/lib/opkg/status"
  touch "$T/target/usr/lib/opkg/info/$pkg.list"
 done
 if [ "$EMULATION" = native ]; then
  cp -a "$T/target/." "$T/root/target/"
  guest /bin/opkg --conf /target/etc/opkg.conf --offline-root /target install "/tmp/plugin.$EXT"
  guest /bin/opkg --conf /target/etc/opkg.conf --offline-root /target status luci-app-wan-traffic
  DEST="$T/root/target"
 else
  guest /bin/opkg --conf "$T/target/etc/opkg.conf" --offline-root "$T/target" install "$T/root/tmp/plugin.$EXT"
  guest /bin/opkg --conf "$T/target/etc/opkg.conf" --offline-root "$T/target" status luci-app-wan-traffic
  DEST="$T/target"
 fi
else
 mkdir -p "$T/empty" "$T/root/tmp/deps"
 for pkg in luci-base rpcd rpcd-mod-file uci ubus jsonfilter; do
  apk mkpkg --info "name:$pkg" --info version:1.0-r1 --info arch:noarch --files "$T/empty" --output "$T/root/tmp/deps/$pkg.apk"
 done
 guest /usr/bin/apk --version
 guest /usr/bin/apk --root /target --initdb --no-network --no-scripts --allow-untrusted add /tmp/deps/luci-base.apk /tmp/deps/rpcd.apk /tmp/deps/rpcd-mod-file.apk /tmp/deps/uci.apk /tmp/deps/ubus.apk /tmp/deps/jsonfilter.apk /tmp/plugin.apk
 guest /usr/bin/apk --root /target info luci-app-wan-traffic
 DEST="$T/root/target"
fi
test -x "$DEST/usr/libexec/wan-traffic-api"
test -x "$DEST/etc/init.d/wan-traffic"
test -f "$DEST/www/luci-static/resources/view/wan-traffic/dashboard.js"
test -f "$DEST/usr/share/doc/luci-app-wan-traffic/LICENSE"
cp "$DEST/usr/libexec/wan-traffic-api" "$T/root/tmp/api"
guest /bin/sh -n /tmp/api
guest /usr/bin/awk 'BEGIN {n=1099511627776;printf "LARGE_COUNTER=%.0f",n+12345}'
echo
echo 'PASS: package installation, executable permissions, shell syntax and >1 TiB counter arithmetic'
'''
 result=run_linux(script,base)
 log=result.stdout+result.stderr;(cache/f'compat-{target}.log').write_text(log,encoding='utf8')
 print(target+'\n'+log,flush=True)
 assert result.returncode==0,target+' failed'
 assert 'LARGE_COUNTER=1099511640121' in log
 reports.append({'target':target,'release':release,'manager':manager,'emulation':emulation,'result':'pass','scope':'offline install with dependency stubs; no hardware or full LuCI service integration'})
(cache/f'compatibility-{args.target}.json').write_text(json.dumps(reports,indent=2),encoding='utf8')
