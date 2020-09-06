#!/bin/bash

cp ./postPlayersMonitor.service /etc/systemd/system/postPlayersMonitor.service
cp ./postPlayersMonitor.sh /home/steam/pavlovserver/postPlayersMonitor.sh
systemctl enable postPlayersMonitor
systemctl start postPlayersMonitor