#!/bin/bash
# 把最新的调试包装进正在运行的模拟器并重新启动应用。
# 用法：bash tools/emulator/install.sh [build]
#   build  先执行 npm run build 再安装；不带参数则直接用 dist/ 里最新的调试包
# 前提：另一个终端里已经运行了 npm run emu:start（模拟器序列号 emulator-5554）。
set -e
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ADB="$REPO/node_modules/@miwt/adb/bin/mac/adb"
SERIAL=emulator-5554
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

if ! "$ADB" devices | grep -q "^$SERIAL[[:space:]]*device"; then
  echo "没有找到模拟器 $SERIAL，请先在另一个终端运行 npm run emu:start，等模拟器启动完成" >&2
  exit 1
fi

echo "安装 $RPK"
"$ADB" -s "$SERIAL" shell am stop "$PKG" >/dev/null 2>&1 || true
sleep 1
"$ADB" -s "$SERIAL" push "$RPK" "/data/app/$PKG.rpk"
"$ADB" -s "$SERIAL" shell pm install "/data/app/$PKG.rpk"
"$ADB" -s "$SERIAL" shell am start "$PKG"
