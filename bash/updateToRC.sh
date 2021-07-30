#!/bin/bash

echo "Switching to RC..."
systemctl stop pavlov
runuser -l steam -c '~/Steam/steamcmd.sh +login anonymous +force_install_dir /home/steam/pavlovserver +app_update 622970 -beta shack_beta +exit'
systemctl start pavlov