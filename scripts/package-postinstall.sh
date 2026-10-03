#!/bin/sh
# Fresh installs pick up mode 0600 from the package payload. Upgrades keep
# an already-modified conffile, including its old mode, so tighten it here.
set -e
cfg=/usr/local/homer/etc/webapp_config.json
if [ -f "$cfg" ]; then
  chmod 0600 "$cfg"
fi
