# Extendify (WIP)

Enhance your Spotify experience with custom plugins.

The best [Spicetify](https://spicetify.app) alternative in [a familiar way](https://vencord.dev).

# Inspirations

This project was largely inspired by [Vencord](https://vencord.dev).
A large part of this codebase is just a modified version of Vencord.
I've added a banner crediting the original source for every file where this is the case.

I also took inspiration from [Spicetify](https://spicetify.app). I just thought that there was a better way to do things.

# Running

Requires installing Spotify from the installer. (**NOT THE MICROSOFT STORE!**)

Currently the `applyPatch.mjs` script only supports Windows and Linux (tested on Arch + Hyprland).

To build, enable devtools and patch Spotify, run:

```bash
$ npm run dev
```

To undo the patch, run:

```bash
$ npm run unpatch
```

# Screenshots

![Plugins page](<assets/Screenshot 2025-02-10 224528.png>)

![Plugin modal](<assets/Screenshot 2025-02-10 224410.png>)
