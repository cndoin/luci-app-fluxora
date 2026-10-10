'use strict';
'require baseclass';

// A compact, local dictionary. No translation service or external requests.
var dictionary = {
 "最近十五分钟速率": {
  "en": "Rates over the last fifteen minutes",
  "ja": "直近15分の速度"
 },
 "每日上传下载流量趋势": {
  "en": "Daily download and upload trends",
  "ja": "日別の送受信トレンド"
 },
 " · 无记录": {
  "en": " · no record",
  "ja": " · 記録なし"
 },
 "手动配置": {
  "en": "Settings",
  "ja": "設定"
 },
 "配置永久保存。固定设备优先于逻辑接口，留空则从逻辑接口自动识别；配置应用后下一次采样生效。": {
  "en": "Settings are saved permanently. A fixed device takes priority; leave it empty to resolve the logical interface. Applied changes take effect on the next sample.",
  "ja": "設定は永続保存されます。固定デバイスが優先され、空欄の場合は論理インターフェースから自動検出します。変更は次回のサンプリングから有効になります。"
 },
 "统计网口（固定设备）": {
  "en": "Device override",
  "ja": "統計対象デバイス"
 },
 "自动识别；推荐 eth0": {
  "en": "Empty: detect automatically",
  "ja": "空欄：自動検出"
 },
 " · 当前外网口": {
  "en": " · WAN device",
  "ja": " · WANデバイス"
 },
 "请输入单个有效网口名称": {
  "en": "Enter one valid device name",
  "ja": "有効なデバイス名を1つ入力してください"
 },
 "只选一个外网设备，勿将 wan、wan6、TUN 或 LAN 数据相加。留空自动识别，也可输入自定义设备名。": {
  "en": "Choose one WAN device. Do not add WAN, WAN6, TUN and LAN counters together. Leave empty for detection, or enter a device name.",
  "ja": "WANデバイスを1つ選択してください。WAN、WAN6、TUN、LANのカウンターは合算しません。空欄で自動検出、またはデバイス名を指定できます。"
 },
 "自动识别使用的逻辑接口": {
  "en": "Logical interface for auto detection",
  "ja": "自動検出に使用する論理インターフェース"
 },
 "每月账期开始日": {
  "en": "Monthly billing start day",
  "ja": "毎月の集計開始日"
 },
 "每月 ": {
  "en": "Day of month: ",
  "ja": "毎月 "
 },
 " 日": {
  "en": "",
  "ja": " 日"
 },
 "磁盘保存间隔": {
  "en": "Disk save interval",
  "ja": "ディスク保存間隔"
 },
 "1 分钟": {
  "en": "1 minute",
  "ja": "1分"
 },
 "5 分钟": {
  "en": "5 minutes",
  "ja": "5分"
 },
 "10 分钟": {
  "en": "10 minutes",
  "ja": "10分"
 },
 "30 分钟": {
  "en": "30 minutes",
  "ja": "30分"
 },
 "允许统计虚拟接口（高级）": {
  "en": "Allow a virtual device (advanced)",
  "ja": "仮想デバイスを許可（詳細設定）"
 },
 "默认拒绝常见 TUN、桥接和容器接口。只有明确需要统计虚拟接口时开启；开启后仍只统计一个设备。": {
  "en": "Common TUN, bridge and container devices are blocked by default. Enable only when intentionally measuring a virtual device; still only one device is counted.",
  "ja": "一般的なTUN、ブリッジ、コンテナのデバイスは既定で拒否します。仮想デバイスを計測する場合のみ有効にしてください。対象は常に1つです。"
 },
 "每账期流量额度（GiB）": {
  "en": "Billing allowance (GiB)",
  "ja": "集計期間の上限（GiB）"
 },
 "0：不设置": {
  "en": "0: no allowance",
  "ja": "0：上限なし"
 },
 "用于显示进度与剩余额度，不限速、不阻断网络。1 GiB = 1024³ 字节。": {
  "en": "Displays usage and remaining allowance; does not throttle or block traffic. 1 GiB = 1024³ bytes.",
  "ja": "使用量と残量を表示します。速度制限や通信遮断は行いません。1 GiB = 1024³バイト。"
 },
 "额度计费口径": {
  "en": "Allowance accounting basis",
  "ja": "上限の集計方式"
 },
 "上传 + 下载": {
  "en": "Upload + download",
  "ja": "送信 + 受信"
 },
 "仅下载": {
  "en": "Download only",
  "ja": "受信のみ"
 },
 "仅上传": {
  "en": "Upload only",
  "ja": "送信のみ"
 },
 "下载带宽（Mbps）": {
  "en": "Download capacity (Mbps)",
  "ja": "下り帯域（Mbps）"
 },
 "0：不显示利用率": {
  "en": "0: hide utilization",
  "ja": "0：使用率を表示しない"
 },
 "上传带宽（Mbps）": {
  "en": "Upload capacity (Mbps)",
  "ja": "上り帯域（Mbps）"
 },
 "速率显示单位": {
  "en": "Rate units",
  "ja": "速度の表示単位"
 },
 "KiB / MiB 每秒": {
  "en": "KiB / MiB per second",
  "ja": "KiB / MiB 毎秒"
 },
 "默认页面刷新间隔": {
  "en": "Default page refresh interval",
  "ja": "ページの既定更新間隔"
 },
 "2 秒": {
  "en": "2 seconds",
  "ja": "2秒"
 },
 "5 秒": {
  "en": "5 seconds",
  "ja": "5秒"
 },
 "10 秒": {
  "en": "10 seconds",
  "ja": "10秒"
 },
 "15 秒": {
  "en": "15 seconds",
  "ja": "15秒"
 },
 "30 秒": {
  "en": "30 seconds",
  "ja": "30秒"
 },
 "60 秒": {
  "en": "60 seconds",
  "ja": "60秒"
 },
 "仅手动刷新": {
  "en": "Manual refresh only",
  "ja": "手動更新のみ"
 },
 "只影响页面读取频率；后台每 5 秒采样，页面历史数据约每分钟同步一次。页面隐藏时暂停请求。": {
  "en": "Controls page requests only. Sampling stays at 5 seconds; history syncs about once a minute. Hidden pages pause requests.",
  "ja": "ページの取得頻度のみ変更します。計測は5秒間隔、履歴同期は約1分間隔です。非表示時はリクエストを停止します。"
 },
 "界面动画": {
  "en": "Motion",
  "ja": "アニメーション"
 },
 "轻柔动画": {
  "en": "Soft motion",
  "ja": "穏やかな動き"
 },
 "关闭动画": {
  "en": "Disable motion",
  "ja": "無効"
 },
 "界面语言": {
  "en": "Interface language",
  "ja": "表示言語"
 },
 "跟随 LuCI / 浏览器": {
  "en": "Follow LuCI / browser",
  "ja": "LuCI / ブラウザーに合わせる"
 },
 "读取中": {
  "en": "Loading",
  "ja": "読み込み中"
 },
 "后台 5 秒采样 · 历史每分钟同步": {
  "en": "5 s sampling · history sync every minute",
  "ja": "5秒ごとに計測 · 履歴は毎分同期"
 },
 "页面刷新间隔": {
  "en": "Page refresh interval",
  "ja": "ページ更新間隔"
 },
 "页面每 ": {
  "en": "Page refresh: every ",
  "ja": "ページ更新："
 },
 " 秒刷新 · 后台每 5 秒采样": {
  "en": " s · sampling every 5 s",
  "ja": "秒ごと · 計測は5秒間隔"
 },
 "自动刷新已暂停 · 后台采样继续": {
  "en": "Auto refresh paused · sampling continues",
  "ja": "自動更新停止 · バックグラウンド計測は継続"
 },
 "每 ": {
  "en": "Every ",
  "ja": ""
 },
 " 秒": {
  "en": " s",
  "ja": "秒ごと"
 },
 "仅手动": {
  "en": "Manual",
  "ja": "手動"
 },
 "立即刷新": {
  "en": "Refresh now",
  "ja": "今すぐ更新"
 },
 "收起配置": {
  "en": "Hide settings",
  "ja": "設定を閉じる"
 },
 "近 ": {
  "en": "Last ",
  "ja": "直近 "
 },
 " 天": {
  "en": " days",
  "ja": "日"
 },
 "每日下载与上传 · ": {
  "en": "Daily download and upload · ",
  "ja": "日別の送受信 · "
 },
 " 至 ": {
  "en": " to ",
  "ja": " ～ "
 },
 " · 无记录日期显示为 0": {
  "en": " · missing dates display as zero",
  "ja": " · 記録のない日は0で表示"
 },
 "━ 下载": {
  "en": "━ Download",
  "ja": "━ 受信"
 },
 "━ 上传": {
  "en": "━ Upload",
  "ja": "━ 送信"
 },
 "悬停查看每天数据": {
  "en": "Hover for daily values",
  "ja": "ホバーで日別の値を表示"
 },
 "每日记录": {
  "en": "Daily",
  "ja": "日別"
 },
 "历史账期": {
  "en": "Billing cycles",
  "ja": "集計期間"
 },
 "自然月": {
  "en": "Monthly",
  "ja": "月別"
 },
 "年度": {
  "en": "Yearly",
  "ja": "年別"
 },
 "日期": {
  "en": "Date",
  "ja": "日付"
 },
 "账期开始": {
  "en": "Cycle start",
  "ja": "期間開始"
 },
 "时间": {
  "en": "Period",
  "ja": "期間"
 },
 "下载": {
  "en": "Download",
  "ja": "受信"
 },
 "上传": {
  "en": "Upload",
  "ja": "送信"
 },
 "总流量": {
  "en": "Total traffic",
  "ja": "合計通信量"
 },
 "累计总流量": {
  "en": "All-time traffic",
  "ja": "累計通信量"
 },
 "暂无记录，服务启动后自动开始统计": {
  "en": "No records yet. Collection starts with the service.",
  "ja": "記録はまだありません。サービス起動後に計測が始まります。"
 },
 "流量记录": {
  "en": "Traffic ledger",
  "ja": "通信量の記録"
 },
 "共 ": {
  "en": "Total: ",
  "ja": "全 "
 },
 " 条 · 第 ": {
  "en": " records · page ",
  "ja": " 件 · "
 },
 " 页": {
  "en": "",
  "ja": " ページ"
 },
 "上一页": {
  "en": "Previous",
  "ja": "前へ"
 },
 "下一页": {
  "en": "Next",
  "ja": "次へ"
 },
 "近 7 天变化": {
  "en": "7-day change",
  "ja": "直近7日の変化"
 },
 "数据积累中": {
  "en": "Building history",
  "ja": "履歴を蓄積中"
 },
 "对比前 7 天 · 今天尚未结束": {
  "en": "Versus prior 7 days · today is incomplete",
  "ja": "前の7日と比較 · 本日は未完了"
 },
 "日均流量": {
  "en": "Daily average",
  "ja": "1日平均"
 },
 "近 30 天内 ": {
  "en": "Last 30 days: ",
  "ja": "直近30日："
 },
 " 个已记录结束日": {
  "en": " recorded completed days",
  "ja": " 日の記録済み完了日"
 },
 "高用量日": {
  "en": "Busiest day",
  "ja": "最大使用日"
 },
 "暂无记录": {
  "en": "No records yet",
  "ja": "記録なし"
 },
 "开始记录后自动统计": {
  "en": "Available after collection starts",
  "ja": "記録開始後に集計"
 },
 "上传占比": {
  "en": "Upload share",
  "ja": "送信の割合"
 },
 "近 7 天 · 上传 / 总流量": {
  "en": "Last 7 days · upload / combined",
  "ja": "直近7日 · 送信 / 合計"
 },
 "账期与流量预算": {
  "en": "Cycle & allowance",
  "ja": "集計期間と上限"
 },
 "剩余 ": {
  "en": "Remaining: ",
  "ja": "残り "
 },
 " · 未设置额度": {
  "en": " · no allowance configured",
  "ja": " · 上限未設定"
 },
 "剩余额度": {
  "en": "Remaining allowance",
  "ja": "残量"
 },
 "可在手动配置中设置": {
  "en": "Configure in Settings",
  "ja": "設定から指定できます"
 },
 "已使用 ": {
  "en": "Used: ",
  "ja": "使用済み "
 },
 "额度只用于提醒": {
  "en": "Allowance is informational",
  "ja": "上限は目安のみ"
 },
 "账期末预计": {
  "en": "Projected cycle total",
  "ja": "期間終了時の予測"
 },
 "等待更多数据": {
  "en": "Waiting for more data",
  "ja": "データ待ち"
 },
 "按近 7 天内 ": {
  "en": "Based on last 7 days: ",
  "ja": "直近7日以内の "
 },
 " 个结束日均值估算": {
  "en": " completed days averaged",
  "ja": " 完了日の平均から推定"
 },
 "计费口径：": {
  "en": "Accounting basis: ",
  "ja": "集計方式："
 },
 "。预测需至少 3 个已记录结束日，仅供参考。": {
  "en": ". Forecast needs at least 3 recorded completed days; estimate only.",
  "ja": "。予測には3日以上の記録済み完了日が必要です。参考値です。"
 },
 "按近期用量预计将超过额度。": {
  "en": "Recent usage suggests the allowance may be exceeded.",
  "ja": "最近の使用量から上限超過が見込まれます。"
 },
 "流量方向": {
  "en": "Traffic split",
  "ja": "送受信の割合"
 },
 "近 7 天": {
  "en": "Last 7 days",
  "ja": "直近7日"
 },
 "↓ 下载": {
  "en": "↓ Download",
  "ja": "↓ 受信"
 },
 "↑ 上传": {
  "en": "↑ Upload",
  "ja": "↑ 送信"
 },
 "速率脉搏": {
  "en": "Live pulse",
  "ja": "リアルタイム速度"
 },
 "最近 15 分钟 · 5 秒平均速率 · 重启后重新积累": {
  "en": "Last 15 minutes · 5 s average rates · resets on reboot",
  "ja": "直近15分 · 5秒平均速度 · 再起動後に再蓄積"
 },
 "等待采样": {
  "en": "WAITING",
  "ja": "計測待ち"
 },
 "正在积累速率记录…": {
  "en": "Collecting rate samples…",
  "ja": "速度サンプルを蓄積中…"
 },
 "近 7 天下载峰值": {
  "en": "7-day download peak",
  "ja": "直近7日の受信ピーク"
 },
 "等待采集": {
  "en": "Waiting for samples",
  "ja": "サンプル待ち"
 },
 "采样间隔平均值": {
  "en": "Sample-interval average",
  "ja": "計測間隔の平均値"
 },
 "近 7 天上传峰值": {
  "en": "7-day upload peak",
  "ja": "直近7日の送信ピーク"
 },
 "15 分钟 P95 合计速率": {
  "en": "15-minute P95 combined rate",
  "ja": "15分間の合計速度P95"
 },
 "等待 20 个样本": {
  "en": "Needs 20 samples",
  "ja": "20サンプル待ち"
 },
 "采样分位数，不是运营商计费 95 峰值": {
  "en": "Sample percentile; not ISP 95th-percentile billing",
  "ja": "サンプルの分位数です。ISPの95パーセンタイル課金とは異なります。"
 },
 " · 已采样 ": {
  "en": " · sampled: ",
  "ja": " · 計測済み "
 },
 " 分钟": {
  "en": " min",
  "ja": "分"
 },
 "周": {
  "en": "",
  "ja": ""
 },
 "日": {
  "en": "Sun",
  "ja": "日"
 },
 "一": {
  "en": "Mon",
  "ja": "月"
 },
 "二": {
  "en": "Tue",
  "ja": "火"
 },
 "三": {
  "en": "Wed",
  "ja": "水"
 },
 "四": {
  "en": "Thu",
  "ja": "木"
 },
 "五": {
  "en": "Fri",
  "ja": "金"
 },
 "六": {
  "en": "Sat",
  "ja": "土"
 },
 " · 已记录 ": {
  "en": " · recorded: ",
  "ja": " · 記録済み "
 },
 " 天 · 日均 ": {
  "en": " days · average ",
  "ja": "日 · 1日平均 "
 },
 "无记录": {
  "en": "No record",
  "ja": "記録なし"
 },
 "什么时候最忙？": {
  "en": "When is your network busiest?",
  "ja": "最も通信が多い時間帯は？"
 },
 "近 7 天按小时累计 · 小时统计从升级后开始": {
  "en": "Last 7 days by hour · hourly history starts after upgrade",
  "ja": "直近7日を時間帯別に集計 · 時間別履歴は更新後から"
 },
 "一周的节奏 · 近 30 天已记录日均（含今日）": {
  "en": "Weekly rhythm · recorded-day averages over 30 days, including today",
  "ja": "曜日別の傾向 · 直近30日の記録日平均（本日を含む）"
 },
 "此日期没有记录": {
  "en": "No record for this date",
  "ja": "この日の記録はありません"
 },
 "用量日历": {
  "en": "Usage calendar",
  "ja": "使用量カレンダー"
 },
 "最近 91 天 · 从左到右逐日排列，点击查看": {
  "en": "Last 91 days · chronological left to right · click for details",
  "ja": "直近91日 · 左から右へ日付順 · クリックで詳細"
 },
 "低": {
  "en": "Low",
  "ja": "少"
 },
 "高": {
  "en": "High",
  "ja": "多"
 },
 "高用量日 TOP 5": {
  "en": "Top 5 busiest days",
  "ja": "使用量の多い日 TOP 5"
 },
 "近 30 天": {
  "en": "Last 30 days",
  "ja": "直近30日"
 },
 "带宽利用率": {
  "en": " utilization",
  "ja": "使用率"
 },
 "未配置带宽": {
  "en": "Capacity not set",
  "ja": "帯域未設定"
 },
 "接口观察": {
  "en": "Interface health",
  "ja": "インターフェース状況"
 },
 "未连接": {
  "en": "Disconnected",
  "ja": "未接続"
 },
 "今日报文": {
  "en": "Packets today",
  "ja": "本日のパケット数"
 },
 "发送与接收合计": {
  "en": "Received + transmitted",
  "ja": "送受信の合計"
 },
 "今日错误": {
  "en": "Errors today",
  "ja": "本日のエラー"
 },
 "网口驱动计数": {
  "en": "Interface driver counters",
  "ja": "デバイスドライバーのカウンター"
 },
 "今日丢弃": {
  "en": "Drops today",
  "ja": "本日の破棄"
 },
 "并非端到端丢包率": {
  "en": "Not end-to-end packet loss",
  "ja": "エンドツーエンドの損失率ではありません"
 },
 "近 7 天采样时长": {
  "en": "7-day sample coverage",
  "ja": "直近7日の計測時間"
 },
 "小时统计从升级后开始": {
  "en": "Hourly tracking starts after upgrade",
  "ja": "時間別計測は更新後から開始"
 },
 "页面在后台，已暂停请求 · 流量采样继续": {
  "en": "Hidden page: requests paused · sampling continues",
  "ja": "ページ非表示：取得停止 · 計測は継続"
 },
 "刷新中": {
  "en": "Refreshing",
  "ja": "更新中"
 },
 "请求较慢，等待响应 · 已保留上次数据": {
  "en": "Slow response; waiting · previous values preserved",
  "ja": "応答待ち · 前回のデータを保持"
 },
 "等待响应": {
  "en": "Waiting",
  "ja": "応答待ち"
 },
 "读取失败": {
  "en": "Read failed",
  "ja": "読み込み失敗"
 },
 "已阻止虚拟接口 · ": {
  "en": "Virtual interface blocked · ",
  "ja": "仮想デバイスを拒否 · "
 },
 "● 正在统计 · ": {
  "en": "● Collecting · ",
  "ja": "● 計測中 · "
 },
 "○ 等待接口 / 时间同步 · ": {
  "en": "○ Waiting for device / clock · ",
  "ja": "○ デバイス / 時刻同期を待機 · "
 },
 "更新于 ": {
  "en": "Updated ",
  "ja": "更新 "
 },
 " · 后台 5 秒采样": {
  "en": " · 5 s sampling",
  "ja": " · 5秒間隔で計測"
 },
 " · 自动刷新已暂停": {
  "en": " · auto refresh paused",
  "ja": " · 自動更新停止"
 },
 "今日流量": {
  "en": "Today",
  "ja": "本日の通信量"
 },
 "近 7 天流量": {
  "en": "Last 7 days",
  "ja": "直近7日の通信量"
 },
 "包含今天 · ": {
  "en": "Including today · ",
  "ja": "本日を含む · "
 },
 " 起": {
  "en": " onwards",
  "ja": "から"
 },
 "近 30 天流量": {
  "en": "Last 30 days",
  "ja": "直近30日の通信量"
 },
 "从安装并启动统计开始累计": {
  "en": "Since installation and collection started",
  "ja": "インストールと計測開始以降の累計"
 },
 "↓ 实时下载": {
  "en": "↓ Live download",
  "ja": "↓ 受信速度"
 },
 "↑ 实时上传": {
  "en": "↑ Live upload",
  "ja": "↑ 送信速度"
 },
 "本月账期 · ": {
  "en": "Billing cycle · ",
  "ja": "集計期間 · "
 },
 "统计口径": {
  "en": "Accounting source",
  "ja": "計測対象"
 },
 "单网口 · ": {
  "en": "One device · ",
  "ja": "単一デバイス · "
 },
 "待连接": {
  "en": "Waiting",
  "ja": "接続待ち"
 },
 "读取失败：": {
  "en": "Read failed: ",
  "ja": "読み込み失敗："
 },
 " · 等待重试": {
  "en": " · will retry",
  "ja": " · 再試行待ち"
 },
 "导出 CSV": {
  "en": "Export CSV",
  "ja": "CSVを書き出す"
 },
 "让每一份流量，都看得清楚。": {
  "en": "Every byte, beautifully understood.",
  "ja": "すべての通信量を、わかりやすく。"
 },
 "趋势、节奏与预算 · 只看实际经过外网的流量": {
  "en": "Trends, rhythms & budgets · measured at your WAN device",
  "ja": "傾向、リズム、上限 · WANデバイスで計測"
 },
 "看板导航": {
  "en": "Dashboard navigation",
  "ja": "ダッシュボード内の移動"
 },
 "总览": {
  "en": "Overview",
  "ja": "概要"
 },
 "预算": {
  "en": "Allowance",
  "ja": "上限"
 },
 "实时速率": {
  "en": "Live rates",
  "ja": "リアルタイム速度"
 },
 "行为画像": {
  "en": "Patterns",
  "ja": "傾向"
 },
 "历史记录": {
  "en": "History",
  "ja": "履歴"
 },
 "读取中…": {
  "en": "Loading…",
  "ja": "読み込み中…"
 },
 "流量趋势": {
  "en": "Traffic trends",
  "ja": "通信量トレンド"
 },
 "仅累计选定外网口的 RX / TX，包含 IPv4、IPv6 与路由器自身流量；不叠加 OpenClash / UA3F / TUN 统计。真实代理开销与重传仍计入。历史记录重启保留，突然断电最多丢失一个保存间隔。": {
  "en": "Counts RX / TX on one selected WAN device, including IPv4, IPv6 and router traffic. OpenClash / UA3F / TUN counters are not added. Real overhead and retransmissions count. History survives reboots; sudden power loss may lose up to one save interval.",
  "ja": "選択したWANデバイス1つのRX / TXを集計します。IPv4、IPv6、ルーター自身の通信を含み、OpenClash / UA3F / TUNのカウンターは加算しません。実際のオーバーヘッドと再送は計上します。履歴は再起動後も保持し、突然の電源断では最大1保存間隔分を失う場合があります。"
 },
 "启用局域网独立面板": {
  "en": "Enable standalone LAN dashboard",
  "ja": "LAN専用ダッシュボードを有効化"
 },
 "默认关闭。启用后局域网设备可免登录查看流量，只读展示；配置仍在 LuCI 修改。": {
  "en": "Disabled by default. LAN devices can view traffic without signing in. Read-only; configure through LuCI.",
  "ja": "初期状態は無効です。有効にするとLAN内でログインせずに閲覧できます。読み取り専用で、設定はLuCIで行います。"
 },
 "独立面板端口": {
  "en": "Standalone dashboard port",
  "ja": "ダッシュボードのポート"
 },
 "独立面板 LAN 接口": {
  "en": "Standalone LAN interface",
  "ja": "ダッシュボードのLANインターフェース"
 },
 "只绑定此逻辑接口的私有 IPv4 地址，不创建外网放行规则。保存应用后刷新页面，使用打开按钮。": {
  "en": "Binds only to this interface’s private IPv4 address. No WAN firewall rule is added. Save & Apply, reload, then use the open button.",
  "ja": "このインターフェースのプライベートIPv4アドレスのみで待ち受けます。WANの許可ルールは追加しません。保存・適用後に再読込し、開くボタンを使用してください。"
 },
 "打开独立面板": {
  "en": "Open standalone dashboard",
  "ja": "独立ダッシュボードを開く"
 },
 "路由器配置": {
  "en": "Router settings",
  "ja": "ルーター設定"
 },
 "请选择 LAN 逻辑接口": {
  "en": "Select a LAN logical interface",
  "ja": "LAN論理インターフェースを選択してください"
 }
};

return baseclass.extend({
 t:function(language,text){var row=dictionary[text];return row && row[language]!==undefined?row[language]:text;},
 language:function(preference,luci,browser){var lang=preference && preference!=='auto'?preference:luci && luci!=='auto'?luci:browser;lang=(lang||'en').toLowerCase();return lang.indexOf('zh')===0?'zh-CN':lang.indexOf('ja')===0?'ja':'en';}
});
