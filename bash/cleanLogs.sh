#!/bin/bash
#Wipes Logs

logFile="/home/steam/pavlovserver/Pavlov/Saved/Logs/Pavlov.log"
backupLogsDir="/home/steam/pavlovserver/Pavlov/Saved/Logs/"
echo "Cleaning $logFile"
:>$logFile
rm -r "$backupLogsDir"Pavlov-backup-*
rm -r "$backupLogsDir"Pavlov_*