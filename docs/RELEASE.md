## Fluxora · 流光

**English** — A native LuCI WAN observatory: persistent totals, live pulse, daily trends, usage calendar and billing allowance. English / 中文 / 日本語 UI. Universal ARM32 / ARM64 / x86 packages, IPK for opkg and APK for apk-tools v3. ARM/x86 ZIPs contain the same universal binaries-free packages.

**中文** — 原生 LuCI 外网流量观察站：重启保留历史、今日 / 7 天 / 30 天 / 总量、实时曲线、用量日历、账期额度。支持中英日界面。ARM 和 x86 下载包都包含同一套通用 IPK / APK；按固件包管理器选择文件。

**日本語** — 履歴を永続保存するネイティブ LuCI WAN ダッシュボード。リアルタイム速度、日別トレンド、カレンダー、集計期間と上限。英語・中国語・日本語 UI、ARM / x86 共通パッケージです。ファームウェアのマネージャーに合わせて IPK または APK を選択してください。

### Downloads

- `*_all.ipk`: OpenWrt 23.05 / 24.10 and compatible opkg-based iStoreOS.
- `*.apk`: OpenWrt 25.12, unsigned community release; use `apk add --allow-untrusted /tmp/<file>.apk` after checksum verification.
- `fluxora-*-arm.zip` / `fluxora-*-x86.zip`: convenience bundles with packages and three-language instructions.
- `SHA256SUMS`: file integrity checks.

Package ID remains `luci-app-wan-traffic`, preserving upgrades from earlier versions. Open **Services → Fluxora 流光** after signing back into LuCI.

Checks are gated by backend/browser tests and verified official rootfs package-manager tests, including ARM emulation. These are isolated checks with dependency fixtures, not a claim of long-term verification on every physical router. See the compatibility document and README for scope, accounting limits and installation instructions.
