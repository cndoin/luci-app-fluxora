import io, tarfile, pathlib, gzip, hashlib, argparse, os, tempfile, shlex, zipfile
from linux_support import linux_path, run_linux
from generate_standalone import bundle
BASE = pathlib.Path(__file__).resolve().parent
(BASE/'test-cache').mkdir(exist_ok=True)
VERSION=(BASE/'VERSION').read_text().strip()
parser=argparse.ArgumentParser(description='Build Fluxora universal ARM/x86 packages')
parser.add_argument('--format',choices=['ipk','apk','all'],default='ipk')
args=parser.parse_args()
def archive(files):
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode='w', format=tarfile.GNU_FORMAT) as tar:
        # opkg's extractor requires directory entries before contained files.
        parents=set()
        for name, data, mode in files:
            for parent in pathlib.PurePosixPath(name).parents:
                if str(parent)!='.': parents.add(parent.as_posix())
        for name in sorted(parents):
            item=tarfile.TarInfo('./'+name+'/'); item.type=tarfile.DIRTYPE; item.mode=0o755; item.mtime=0
            tar.addfile(item)
        for name, data, mode in files:
            item = tarfile.TarInfo('./' + name); item.size = len(data); item.mode = mode; item.mtime = 0
            tar.addfile(item, io.BytesIO(data))
    return gzip.compress(buf.getvalue(), mtime=0)
payload=[]
for p in sorted((BASE/'root').rglob('*')):
    if p.is_file():
        name=p.relative_to(BASE/'root').as_posix()
        executable=name.startswith(('etc/init.d/', 'usr/libexec/', 'etc/uci-defaults/', 'www/wan-traffic/cgi-bin/'))
        payload.append((name,p.read_bytes(),0o755 if executable else 0o644))
resources=BASE/'root/www/luci-static/resources'
payload.append(('www/wan-traffic/dashboard.js',bundle(),0o644))
payload.append(('www/wan-traffic/dashboard.css',(resources/'wan-traffic/dashboard.css').read_bytes(),0o644))
payload.append(('usr/share/doc/luci-app-wan-traffic/LICENSE',(BASE/'LICENSE').read_bytes(),0o644))
control=f'''Package: luci-app-wan-traffic
Version: {VERSION}-1
Architecture: all
Maintainer: cndoin
License: MIT
Source: https://github.com/cndoin/luci-app-fluxora
Depends: libc, luci-base, rpcd, rpcd-mod-file, uci, ubus, jsonfilter, uhttpd
Section: luci
Priority: optional
Description: Fluxora - persistent WAN traffic observatory for LuCI
'''
post='''#!/bin/sh
[ -n "$IPKG_INSTROOT" ] && exit 0
/etc/init.d/wan-traffic enable
/etc/init.d/wan-traffic restart
rm -f /tmp/luci-indexcache
/etc/init.d/rpcd restart
exit 0
'''
pre='''#!/bin/sh
[ -n "$IPKG_INSTROOT" ] && exit 0
/etc/init.d/wan-traffic stop
/etc/init.d/wan-traffic disable
exit 0
'''
members=[('debian-binary',b'2.0\n'),('control.tar.gz',archive([('control',control.encode(),0o644),('conffiles',b'/etc/config/wan_traffic\n',0o644),('postinst',post.encode(),0o755),('prerm',pre.encode(),0o755)])),('data.tar.gz',archive(payload))]
out=BASE/'dist'; out.mkdir(exist_ok=True)
ipk=out/f'luci-app-wan-traffic_{VERSION}-1_all.ipk'
# OpenWrt ipkg-build uses gzip(tar), not a Debian-style ar envelope.
artifacts=[]
if args.format in ('ipk','all'):
    ipk.write_bytes(archive([(name,data,0o644) for name,data in members])); artifacts.append(ipk)
if args.format in ('apk','all'):
    # Use apk-tools v3, as OpenWrt does; never rename an IPK to APK.
    with tempfile.TemporaryDirectory(prefix='fluxora-apk-',dir=BASE/'test-cache' if os.name=='nt' else None) as temp:
        stage=pathlib.Path(temp)/'files'; stage.mkdir()
        for name,data,mode in payload:
            p=stage/name; p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data);p.chmod(mode)
        meta=stage/'lib/apk/packages';meta.mkdir(parents=True,exist_ok=True)
        config='/etc/config/wan_traffic'
        (meta/'luci-app-wan-traffic.conffiles').write_text(config+'\n')
        (meta/'luci-app-wan-traffic.conffiles_static').write_text(config+' '+hashlib.sha256((stage/config.lstrip('/')).read_bytes()).hexdigest()+'\n')
        (meta/'luci-app-wan-traffic.list').write_text(''.join('/'+p.relative_to(stage).as_posix()+'\n' for p in sorted(stage.rglob('*')) if p.is_file()))
        scripts=pathlib.Path(temp)/'scripts';scripts.mkdir()
        for name,content in [('post-install',post),('post-upgrade',post),('pre-deinstall',pre)]:
            (scripts/name).write_text(content,encoding='utf8',newline='\n')
        for p in sorted(stage.rglob('*'),reverse=True):os.utime(p,(0,0))
        os.utime(stage,(0,0))
        apk=out/f'luci-app-wan-traffic-{VERSION}-r1.apk'
        q=shlex.quote
        cmd='set -eu\n'
        if os.name=='nt':
            for name,_,mode in payload:
                if mode==0o755:cmd+='chmod 755 '+q(linux_path(stage/name))+'\n'
        cmd+='apk mkpkg --info name:luci-app-wan-traffic --info version:'+VERSION+'-r1 --info arch:noarch --info license:MIT --info '+q('description:Fluxora - persistent WAN traffic observatory for LuCI')+' --info '+q('url:https://github.com/cndoin/luci-app-fluxora')+' --info maintainer:cndoin --info '+q('depends:luci-base rpcd rpcd-mod-file uci ubus jsonfilter uhttpd')+' --files '+q(linux_path(stage))+' --output '+q(linux_path(apk))
        for name in ['post-install','post-upgrade','pre-deinstall']:cmd+=' --script '+q(name+':'+linux_path(scripts/name))
        result=run_linux(cmd,BASE)
        if result.returncode:raise RuntimeError(result.stdout+result.stderr)
        artifacts.append(apk)
if args.format=='all':
    packages=list(artifacts)
    package_sums=''.join(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.name+'\n' for p in artifacts)
    for cpu in ['arm','x86']:
        bundle=out/f'fluxora-{VERSION}-{cpu}.zip'
        with zipfile.ZipFile(bundle,'w',zipfile.ZIP_DEFLATED) as z:
            contents={p.name:p.read_bytes() for p in packages}
            for name in ['README.md','README.zh-CN.md','README.ja.md','LICENSE']:contents[name]=(BASE/name).read_bytes()
            contents['SHA256SUMS']=package_sums.encode()
            contents['INSTALL.txt']=(f'Fluxora {VERSION} — {cpu.upper()} convenience bundle\nThese are identical universal ARM/x86 packages, not CPU-specific binaries.\nOn opkg firmware: install the .ipk. On apk firmware: install the .apk.\nSee https://github.com/cndoin/luci-app-fluxora for screenshots and instructions.\n').encode()
            for name,data in sorted(contents.items()):
                info=zipfile.ZipInfo(name,(2026,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;z.writestr(info,data)
        artifacts.append(bundle)
for name,func in [('SHA256SUMS',hashlib.sha256),('MD5SUMS',hashlib.md5)]:
    (out/name).write_text(''.join(func(p.read_bytes()).hexdigest()+'  '+p.name+'\n' for p in artifacts))
for p in artifacts:print(p)
