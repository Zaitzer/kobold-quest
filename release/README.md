# Putting Kobold Quest on joakimskar.no

You need: the file `kobold-quest-server.tar.gz`, a small server, and access to your domains' DNS settings.
It takes about 15 minutes the first time.

## 1. Rent a server (about €4–5 a month)

Hetzner Cloud (hetzner.com/cloud) works well. Any provider with Ubuntu 24.04 is fine.

1. Make an account and a project, then click **Add server**.
2. Choose **Ubuntu 24.04** and the smallest shared type (**CX22** or similar). Leave IPv4 on.
3. Under SSH keys, add your public key. If you don't have one, run `ssh-keygen` on your computer and paste in the
   contents of `~/.ssh/id_ed25519.pub`.
4. Create it and note its **IPv4 address**. Below it is written as `1.2.3.4`.

## 2. Point the domains at it

Where you bought the domains (for example Domeneshop), open the DNS settings for **joakimskar.no**:

| type | name | value |
|---|---|---|
| A | @ (or empty) | 1.2.3.4 |
| A | www | 1.2.3.4 |

Do the same for **joakimskar.com**. Remove any other A or AAAA records for those names. The .com and www addresses
all forward to https://joakimskar.no.

This replaces anything that is on joakimskar.no today. If you'd rather keep the main address free, use
`kobold.joakimskar.no` and change the first line of `Caddyfile` to match.

## 3. Install

On your computer, in the folder with the file (Terminal on Mac/Linux, PowerShell on Windows):

```
scp kobold-quest-server.tar.gz root@1.2.3.4:
ssh root@1.2.3.4 "tar xzf kobold-quest-server.tar.gz && kobold-quest/install.sh"
```

It installs Node and Caddy, starts the game server, gets HTTPS certificates, and turns on a firewall that lets
through only SSH and the web. When it prints **Kobold Quest is running**, open https://joakimskar.no. If the
DNS change is still spreading, the HTTPS certificate can take a few minutes.

## Updating

Run the same two commands with a new `kobold-quest-server.tar.gz`. Accounts, saves and the market are kept.

## Where the world lives, and backups

Everything is in `/var/lib/kobold-quest/world.json` on the server, with a copy from each day in `backups/`. Passwords
are stored only as salted hashes. To keep a copy on your own computer:

```
scp root@1.2.3.4:/var/lib/kobold-quest/world.json .
```

Logs: `ssh root@1.2.3.4 journalctl -u kobold-quest -n 50`
