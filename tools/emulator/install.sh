#!/bin/bash
# 把最新的调试包装进正在运行的模拟器并重新启动应用。
# 用法：bash tools/emulator/install.sh [build]
#   build  先执行 npm run build 再安装；不带参数则直接用 dist/ 里最新的调试包
# 前提：另一个终端里已经运行了 npm run emu:start。
# 模拟器序列号从 adb devices 里自动取（第一个 emulator-xxxx），也可以用环境变量 EMU_SERIAL 指定。
set -e
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ADB="$REPO/node_modules/@miwt/adb/bin/mac/adb"
PKG=com.curain.badminton
cd "$REPO"

if [ "${1:-}" = "build" ]; then
  npm run build
fi

RPK="$(ls -t dist/*.debug.*.rpk 2>/dev/null | head -1 || true)"
if [ -z "$RPK" ]; then
  echo "dist/ 里没有调试包，请先执行 npm run build（或 bash tools/emulator/install.sh build）" >&2
  exit 1
fi

SERIAL="${EMU_SERIAL:-$("$ADB" devices | awk '$1 ~ /^emulator-[0-9]+$/ && $2 == "device" { print $1; exit }')}"
if [ -z "$SERIAL" ]; then
  echo "没有找到在线的模拟器，请先在另一个终端运行 npm run emu:start，等终端里出现「已启动」再重试" >&2
  exit 1
fi

echo "安装 $RPK 到 $SERIAL"
"$ADB" -s "$SERIAL" shell am stop "$PKG" >/dev/null 2>&1 || true
sleep 1
"$ADB" -s "$SERIAL" push "$RPK" "/data/app/$PKG.rpk"

# pm install 的退出码不可靠（工具包自己也是看输出里有没有 "(success 0)"），所以抓输出来判断
INSTALL_OUT="$("$ADB" -s "$SERIAL" shell pm install "/data/app/$PKG.rpk" 2>&1 || true)"
echo "$INSTALL_OUT"
case "$INSTALL_OUT" in
  *"(success 0)"*) ;;
  *)
    echo "安装失败：输出里没有 (success 0)，应用没有装上，上面是模拟器返回的原始信息" >&2
    exit 1
    ;;
esac

"$ADB" -s "$SERIAL" shell am start "$PKG"
