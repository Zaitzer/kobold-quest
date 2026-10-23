#!/bin/bash
# The server's updater (run every 2 minutes by kq-update.timer; installed as /usr/local/bin/kq-update by bootstrap.sh and
# refreshed by every install). It installs origin/main's release/ when that commit has not been installed yet. The last
# commit that installed without an error is kept in /opt/kobold-quest/installed, so an install that fails (a network blip
# in apt, say) is tried again 2 minutes later instead of being skipped for good.
set -euo pipefail
cd /opt/kobold-quest/repo
git fetch -q origin main
WANT=$(git rev-parse origin/main)
HAVE=$(cat /opt/kobold-quest/installed 2>/dev/null || true)
if [ "$WANT" != "$HAVE" ] || [ "${1:-}" = "--force" ]; then
  git reset -q --hard "$WANT"
  bash release/install.sh
  echo "$WANT" > /opt/kobold-quest/installed
  echo "updated to ${WANT:0:7}"
fi
