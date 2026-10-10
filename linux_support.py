"""Run isolated Linux checks on Linux or the existing Windows WSL host."""
import os, pathlib, shlex, subprocess

def linux_path(path):
    path=pathlib.Path(path).resolve()
    return '/mnt/host/'+path.as_posix()[0].lower()+path.as_posix()[2:] if os.name=='nt' else path.as_posix()

def run_linux(script, source):
    prefix=['wsl','-d','docker-desktop','-e'] if os.name=='nt' else []
    return subprocess.run(prefix+['sh','-c','SOURCE='+shlex.quote(linux_path(source))+'\n'+script],capture_output=True,text=True,encoding='utf8')
