# Extendify (WIP)

Enhance your Spotify experience with custom plugins.

The best [Spicetify](https://spicetify.app) alternative in [a familiar way](https://vencord.dev).

Join the official Extendify [Discord server](https://discord.gg/eWD5BahyBm)!

# Inspirations

This project was largely inspired by [Vencord](https://vencord.dev).
A large part of this codebase is just a modified version of Vencord.
I've added a banner crediting the original source for every file where this is the case.

I also took inspiration from [Spicetify](https://spicetify.app). I just thought that there was a better way to do things.

# Running

If you're on Windows, Extendify requires installing Spotify from the installer. (**NOT THE MICROSOFT STORE!**)

If you already have Spotify installed through this method, your install is probably not up to date, even if you're technically on the latest version.
See the next section for info on how to manually update your install.

Currently the `applyPatch.mjs` script supports Windows and Linux (tested on Arch + Hyprland).

## Manual Updating

The idea of manual updating is that you delete the `.spa` files in the `Apps` folder of the Spotify install and then re-run the installer.
This solves our problem of out of date archives 99.9% of the time.

You can get the latest installer from [here (Windows + MacOS + Linux)](https://loadspot.pages.dev/) or [here (Windows only)](https://download.scdn.co/SpotifySetup.exe).

## Scripts:

- `npm run build`: Build Extendify.
- `npm run dev`: Build, enable devtools and patch Spotify.
- `npm run patch`: Patch Spotify.
- `npm run unpatch`: Undo the patch.

## Flags:

- `--flatpak`: Use this flag when running on Linux with flatpak.
- `--spotifyPath`: Use this flag to specify the path to Spotify's installation directory. (It should contain an `Apps` folder)
- `--cachePath`: Use this flag to specify the path to the cache directory. (It should contain an `offline.bnk` file)

Apply flags like this:

```bash
$ npm [flags] run <script>
```

---

To build, enable devtools and patch Spotify, run:

```bash
$ npm run dev
```

To undo the patch, run:

```bash
$ npm run unpatch
```

# Running (Linux + flatpak)

```bash
$ npm --flatpak run dev
```

To undo the patch, run:

```bash
$ npm --flatpak run unpatch
```

# Screenshots

![Plugins page](<assets/Screenshot 2025-02-10 224528.png>)

![Plugin modal](<assets/Screenshot 2025-02-10 224410.png>)
