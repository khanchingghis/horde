# Pavlov VR - Horde - Scripts

## Serverside

After following the [Dedicated Server Guide](http://wiki.pavlov-vr.com/index.php?title=Dedicated_server) to set up a custom Pavlov server, SSH into your server and run this to clone or update the repo:

```bash
git clone https://github.com/khanchingghis/horde.git 2> /dev/null || git -C ./horde/ pull
chmod +x ./horde/bash/postPlayers.sh
chmod +x ./horde/bash/postPlayersMonitor.sh
chmod +x ./horde/bash/postPlayersMonitorInstall.sh
```

From there the following scripts can be run:

`./horde/bash/postPlayers.sh` - Reads Pavlov logs and posts a connection log to [this Google Sheet](https://docs.google.com/spreadsheets/d/1XTOp2iFGMDvrDBgMfDc4HO88EDUMAzAEvSc45xNKTCc/). This can be run again to update the log with any new players since the last time you ran the script, as long as you have not changed the server name.

`./horde/bash/postPlayersMonitorInstall.sh` - Must be run as root. Creates and enables a service that will continually post to [this Google Sheet](https://docs.google.com/spreadsheets/d/1XTOp2iFGMDvrDBgMfDc4HO88EDUMAzAEvSc45xNKTCc/) whenever a new player joins. 

