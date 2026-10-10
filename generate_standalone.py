"""Bundle the shared LuCI dashboard without eval or browser dependencies."""
import pathlib, sys
BASE=pathlib.Path(__file__).resolve().parent
def bundle():
    resources=BASE/'root/www/luci-static/resources'
    result=(BASE/'standalone-runtime.js').read_text(encoding='utf8')+'\n'
    for variable,source in [('core',resources/'wan-traffic/core.js'),('i18n',resources/'wan-traffic/i18n.js'),('app',resources/'view/wan-traffic/dashboard.js')]:
        result+='var '+variable+'=(function(){\n'+source.read_text(encoding='utf8')+'\n})();\n'
    return (result+'startStandalone(app);\n').encode()
if __name__=='__main__':
    destination=pathlib.Path(sys.argv[1]);destination.mkdir(parents=True,exist_ok=True)
    (destination/'dashboard.js').write_bytes(bundle())
    (destination/'dashboard.css').write_bytes((BASE/'root/www/luci-static/resources/wan-traffic/dashboard.css').read_bytes())
