#!/bin/bash
#Wipes Logs

journalConfPath="/etc/systemd/journald.conf"
limit="300M"
echo "Cleaning $journalConfPath and setting limit to $limit"

rm -r /var/log/journal/*
sed -i -e "s/#SystemMaxUse=/SystemMaxUse=$limit/" $journalConfPath
# sudo systemctl kill --kill-who=main --signal=SIGUSR2 systemd-journald.service
systemctl restart systemd-journald