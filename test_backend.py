"""Run backend integration checks in an isolated Linux fixture via WSL."""
import pathlib, subprocess, json, tarfile, io
from linux_support import run_linux
base=pathlib.Path(__file__).resolve().parent
script=r'''
set -eu
T=$(mktemp -d /tmp/wan-traffic-test.XXXXXX)
trap 'rm -rf "$T"' EXIT
mkdir -p "$T/bin" "$T/sys/eth0/statistics" "$T/run" "$T/persist"
sed -e "s|R=/tmp/wan-traffic|R=$T/run|" -e "s|P=/etc/wan-traffic|P=$T/persist|" -e "s|S=/sys/class/net/|S=$T/sys/|" "$SOURCE/root/usr/libexec/wan-traffic-api" > "$T/api"
chmod +x "$T/api"
printf '#!/bin/sh\ncase "$*" in *device) cat "$FIXTURE/device";; *allow_virtual) echo 0;; esac\n' > "$T/bin/uci"
chmod +x "$T/bin/uci"
export PATH="$T/bin:$PATH"
export FIXTURE="$T"
echo eth0 > "$T/device"
printf '1000\n' > "$T/sys/eth0/statistics/rx_bytes"
printf '500\n' > "$T/sys/eth0/statistics/tx_bytes"
printf '100\n' > "$T/sys/eth0/statistics/rx_packets"
printf '10\n' > "$T/sys/eth0/statistics/tx_packets"
printf '0\n' > "$T/sys/eth0/statistics/rx_errors"
printf '0\n' > "$T/sys/eth0/statistics/rx_dropped"
printf '1,2000-01-01T00,999,999,10,10,10,10,10,10,10\n' > "$T/run/hourly.csv"
"$T/api" sample
cp "$T/run/hourly.csv" "$T/hourly-before"
awk 'BEGIN{for(i=0;i<200;i++)printf "%d,1,1\n",i}' > "$T/run/rates.csv"
printf '1600\n' > "$T/sys/eth0/statistics/rx_bytes"
printf '700\n' > "$T/sys/eth0/statistics/tx_bytes"
printf '110\n' > "$T/sys/eth0/statistics/rx_packets"
printf '15\n' > "$T/sys/eth0/statistics/tx_packets"
printf '2\n' > "$T/sys/eth0/statistics/rx_errors"
printf '3\n' > "$T/sys/eth0/statistics/rx_dropped"
"$T/api" sample
cmp "$T/run/hourly.csv" "$T/hourly-before"
"$T/api" status
"$T/api" live
# Proxy interfaces must not enter the WAN aggregate.
echo utun > "$T/device"
"$T/api" sample
"$T/api" status
echo eth0 > "$T/device"
"$T/api" sample
"$T/api" status
"$T/api" flush >/dev/null
cmp "$T/run/daily.csv" "$T/persist/daily.csv"
cmp "$T/run/hourly.csv" "$T/persist/hourly.csv"
# Counter reset counts the new counter instead of a negative delta.
printf '20\n' > "$T/sys/eth0/statistics/rx_bytes"
printf '10\n' > "$T/sys/eth0/statistics/tx_bytes"
"$T/api" sample
"$T/api" status
"$T/api" flush >/dev/null
rm "$T/run/daily.csv" "$T/run/hourly.csv" "$T/run/baseline" "$T/run/current.csv"
cp "$T/persist/daily.csv" "$T/run/daily.csv"
cp "$T/persist/hourly.csv" "$T/run/hourly.csv"
"$T/api" sample
"$T/api" status
# Simulate boot: new baseline must not count existing totals again.
rm "$T/run/baseline"
"$T/api" sample
"$T/api" status
# Roll an active hour into the archive without losing its accumulated values.
awk -F, 'BEGIN{OFS=","}{$1-=3600;print}' "$T/run/current.csv" > "$T/previous-hour"
mv "$T/previous-hour" "$T/run/current.csv"
awk -F, 'BEGIN{OFS=","}{$1-=3600;print}' "$T/run/hourly.csv" > "$T/previous-archive"
mv "$T/previous-archive" "$T/run/hourly.csv"
"$T/api" sample
"$T/api" status
for f in "$SOURCE/root/etc/init.d/wan-traffic" "$SOURCE/root/usr/libexec/wan-traffic-worker" "$SOURCE/root/usr/libexec/wan-traffic-api"; do sh -n "$f"; done
'''
result=run_linux(script,base)
assert result.returncode==0,result.stderr
rows=[json.loads(line) for line in result.stdout.splitlines()]
live=rows.pop(1)
assert 'days' not in live and 'hours' not in live
assert live['today']==rows[0]['days'][0]
assert live['current_hour']==rows[0]['hours']
assert live['rates']==rows[0]['rates']
assert rows[0]['days'][0]['rx']==600 and rows[0]['days'][0]['tx']==200,rows
assert rows[1]['live']['blocked'] is True
assert rows[1]['days']==rows[0]['days']
assert rows[2]['days']==rows[0]['days']
assert rows[3]['days'][0]['rx']==620 and rows[3]['days'][0]['tx']==210
assert rows[4]['days']==rows[3]['days']
assert rows[5]['days']==rows[4]['days']
assert rows[0]['hours'],result.stderr
assert rows[0]['hours'][0]['rx']==600 and rows[0]['hours'][0]['tx']==200
assert len(rows[0]['hours'])==1
assert rows[0]['hours'][0]['rx_packets']==10 and rows[0]['hours'][0]['tx_packets']==5
assert rows[0]['hours'][0]['errors']==2 and rows[0]['hours'][0]['drops']==3
assert rows[0]['hours'][0]['peak_rx']>0
assert len(rows[0]['rates'])==180
assert rows[5]['hours'][0]['rx']==620 and rows[5]['hours'][0]['tx']==210
assert len(rows[6]['hours'])==2
assert rows[6]['days']==rows[5]['days']
assert sum(h['rx'] for h in rows[6]['hours'])==620
version=(base/'VERSION').read_text().strip()
raw=(base/f'dist/luci-app-wan-traffic_{version}-1_all.ipk').read_bytes(); assert raw[:2]==b'\x1f\x8b'
with tarfile.open(fileobj=io.BytesIO(raw),mode='r:gz') as outer:
    members={item.name.removeprefix('./'):outer.extractfile(item).read() for item in outer.getmembers()}
assert set(members)=={'debian-binary','control.tar.gz','data.tar.gz'}
with tarfile.open(fileobj=io.BytesIO(members['data.tar.gz'])) as tar:
    names=tar.getnames(); assert './lib/upgrade/keep.d/wan-traffic' in names
    assert './etc/sysupgrade.conf' not in names
    assert tar.getmember('./usr/libexec/wan-traffic-api').mode==0o755
    for item in tar.getmembers():
        if item.isfile():
            for parent in pathlib.PurePosixPath(item.name).parents:
                if str(parent)!='.': assert './'+parent.as_posix() in names
for p in (base/'root').rglob('*.json'): json.loads(p.read_text(encoding='utf-8'))
print('PASS: hourly and daily deltas, packet/error/drop counters, peak samples, 90-day retention, 180-sample ring, virtual-interface exclusion, reboot restoration, archives and permissions')
