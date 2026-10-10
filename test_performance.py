"""Isolated BusyBox benchmark; not a measurement of the user's router."""
import argparse, datetime, io, json, pathlib, subprocess, tarfile
from linux_support import run_linux
base=pathlib.Path(__file__).resolve().parent
cache=base/'test-cache'/'performance'
cache.mkdir(parents=True,exist_ok=True)
parser=argparse.ArgumentParser(description='Compare a supplied earlier IPK with the current collector')
parser.add_argument('--baseline-ipk',type=pathlib.Path,default=base/'dist/luci-app-wan-traffic_1.2.0-2_all.ipk')
args=parser.parse_args()
if not args.baseline_ipk.exists():parser.error('Supply an earlier package using --baseline-ipk PATH')
with tarfile.open(args.baseline_ipk,'r:gz') as outer:
    with tarfile.open(fileobj=io.BytesIO(outer.extractfile('./data.tar.gz').read()),mode='r:gz') as inner:
        (cache/'old-api').write_bytes(inner.extractfile('./usr/libexec/wan-traffic-api').read())
now=datetime.datetime.now().astimezone()
(cache/'daily.csv').write_text(''.join(f'{(now-datetime.timedelta(days=i)).date()},100000000,10000000\n' for i in range(3649,-1,-1)),encoding='utf8')
(cache/'hourly.csv').write_text(''.join(f'{int((now-datetime.timedelta(hours=i)).timestamp())//3600*3600},{(now-datetime.timedelta(hours=i)):%Y-%m-%dT%H},10000000,1000000,3600,2000000,100000,1000,1000,0,0\n' for i in range(2159,-1,-1)),encoding='utf8')
script=r'''
set -eu
T=$(mktemp -d /tmp/wan-traffic-perf.XXXXXX)
trap 'rm -rf "$T"' EXIT
mkdir -p "$T/bin" "$T/sys/eth0/statistics" "$T/persist" "$T/run"
printf '#!/bin/sh\ncase "$*" in *device) echo eth0;; *allow_virtual) echo 0;; esac\n' > "$T/bin/uci"
chmod +x "$T/bin/uci"
export PATH="$T/bin:$PATH"
for name in rx_bytes tx_bytes rx_packets tx_packets rx_errors tx_errors rx_dropped tx_dropped; do echo 1000 > "$T/sys/eth0/statistics/$name"; done
for version in old new; do
 if [ "$version" = old ]; then source="$SOURCE/test-cache/performance/old-api"; else source="$SOURCE/root/usr/libexec/wan-traffic-api"; fi
 sed -e "s|R=/tmp/wan-traffic|R=$T/run|" -e "s|P=/etc/wan-traffic|P=$T/persist|" -e "s|S=/sys/class/net/|S=$T/sys/|" "$source" > "$T/api"
 chmod +x "$T/api"
 cp "$SOURCE/test-cache/performance/daily.csv" "$T/run/daily.csv"
 cp "$SOURCE/test-cache/performance/hourly.csv" "$T/run/hourly.csv"
 "$T/api" sample
 /usr/bin/time -v -o "$SOURCE/test-cache/performance/$version-time.txt" sh -c 'i=0; while [ "$i" -lt 100 ]; do "$1" sample; i=$((i+1)); done' sh "$T/api"
 "$T/api" status > "$SOURCE/test-cache/performance/$version-status.json"
 if [ "$version" = new ]; then "$T/api" live > "$SOURCE/test-cache/performance/new-live.json"; fi
done
'''
r=run_linux(script,base)
assert r.returncode==0,r.stderr
report={'fixture':{'daily_rows':3650,'hourly_rows':2160,'samples':100},'environment':'WSL BusyBox; includes subprocess launch overhead; not real router'}
for version in ('old','new'):
    data=json.loads((cache/f'{version}-status.json').read_text())
    assert len(data['days'])==3650
    report[version]={'status_bytes':(cache/f'{version}-status.json').stat().st_size,'hour_rows':len(data['hours']),'time':(cache/f'{version}-time.txt').read_text()}
report['new']['live_bytes']=(cache/'new-live.json').stat().st_size
assert report['new']['hour_rows']<=193
assert report['new']['live_bytes']<report['old']['status_bytes']/10
(cache/'report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps(report,indent=2))
