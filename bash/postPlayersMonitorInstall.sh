#!/bin/bash

thisDir=$(dirname "$0")
cp $thisDir/postPlayersMonitor.service /etc/systemd/system/postPlayersMonitor.service
cp $thisDir/postPlayersMonitor.sh /home/steam/pavlovserver/postPlayersMonitor.sh
systemctl enable postPlayersMonitor
systemctl start postPlayersMonitor