# Extendify (WIP)

Enhance your Spotify experience with custom plugins.

The best [Spicetify](https://spicetify.app) alternative in [a familiar way](https://vencord.dev).

### Update as of March 17th

A couple days ago Spotify released an update built with a more recent version of Webpack.
This update came with the side effect of almost everything of importance to something like Extendify no longer being exported in Webpack modules.
Rather, they are anonymous iife methods. I don't know how I'll fix this.

# Inspirations

This project was largely inspired by [Vencord](https://vencord.dev).
A large part of this codebase is just a modified version of Vencord.
I've added a banner crediting the original source for every file where this is the case.

I also took inspiration from [Spicetify](https://spicetify.app). I just thought that there was a better way to do things.

# Running

If you're on Windows, Extendify requires installing Spotify from the installer. (**NOT THE MICROSOFT STORE!**)

Currently the `applyPatch.mjs` script supports Windows and Linux (tested on Arch + Hyprland).

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
