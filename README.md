# Pavlov VR - Horde - Scripts

## Serverside

After following the [Dedicated Server Guide](http://wiki.pavlov-vr.com/index.php?title=Dedicated_server) to set up a custom Pavlov server, SSH into your server and run this to clone or update the repo:

```bash
git clone https://github.com/khanchingghis/horde.git 2> /dev/null || git -C ./horde/ pull
```

From there the following scripts can be run:

`.horde/bash/postPlayers.sh` - Reads Pavlov logs and posts a connection log to [this Google Sheet](https://docs.google.com/spreadsheets/d/1XTOp2iFGMDvrDBgMfDc4HO88EDUMAzAEvSc45xNKTCc/).

`.horde/bash/postPlayersMonitorInstall.sh` - Creates and enables a service that will continually post to [this Google Sheet](https://docs.google.com/spreadsheets/d/1XTOp2iFGMDvrDBgMfDc4HO88EDUMAzAEvSc45xNKTCc/) whenever a new player joins.

