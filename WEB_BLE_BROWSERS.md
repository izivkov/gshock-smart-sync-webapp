# Web Bluetooth browsers for the G-Shock web app

The web app connects to your G-Shock watch through **Web Bluetooth**. Not every
browser supports it. This page lists the browsers that work, and how to get one
on each platform.

---

## Requirements

- The web app must be opened over **HTTPS**. Web Bluetooth does not work on plain `http://` pages.
- Bluetooth must be **on** on the phone or computer.
- The watch must be **paired** with the device first, as described in the app's setup steps.

---

## Browser support by platform

| Platform | Browser | Web Bluetooth | Notes |
|---|---|---|---|
| Android | Google Chrome | Yes | Works out of the box |
| Windows | Google Chrome or Microsoft Edge | Yes | Works out of the box |
| macOS | Google Chrome or Microsoft Edge | Yes | Works out of the box |
| Linux | Google Chrome or Microsoft Edge | Yes | BlueZ must be running |
| iOS / iPadOS | Safari | No | Needs one of the options below |
| iOS / iPadOS | Bluefy | Yes | Separate app, see below |
| iOS / iPadOS | Safari with Beacio | Yes | Safari extension, see below |

Safari on iOS does not support Web Bluetooth by itself. On iPhone and iPad, you
need one of the two options below.

---

## iOS and iPadOS

### Option 1: Bluefy (recommended if you want a separate app)

Bluefy is a free browser made for Web Bluetooth. Open the web app inside Bluefy
and pair the watch as you would in Chrome.

- **App Store:** https://apps.apple.com/app/id1492822055
- Requires iOS 12.0 or later.

### Option 2: WebBLE

WebBLE is another Web Bluetooth browser for iOS. I haven't verified its App
Store page, so search the App Store for **"WebBLE"** and check the developer
before you install it.

### Option 3: Beacio (Safari extension)

Beacio adds Web Bluetooth to Safari. You keep using Safari, open the web app
there, and pair the watch the same way as in Chrome.

- **App Store:** https://apps.apple.com/app/id6761301368
- Requires iOS 18 or later.
- Enable it in **Settings > Apps > Safari > Extensions** (or **Settings > Safari > Extensions** on older layouts), then allow it for the web app's website.

---

## Pairing the watch in a Web Bluetooth browser

1. Turn on Bluetooth on the device.
2. Open the web app over HTTPS in the browser.
3. Choose the connect or pair option in the app.
4. The browser shows a list of nearby Bluetooth devices. Select your **CASIO** watch.
5. Confirm the pairing if the watch or the device asks you to.

If the watch doesn't appear in the list:

- Make sure the watch is awake (press a button on it).
- Make sure no other app, such as the official Casio app, is connected to the watch.
- Turn Bluetooth off and on on the device, then try again.

---

## Troubleshooting

| Problem | What to check |
|---|---|
| "Web Bluetooth is not supported" | You're using a browser without Web Bluetooth. On iPhone or iPad, use Bluefy or Safari with Beacio. |
| The page doesn't ask for a Bluetooth device | The page must be HTTPS. Reload it over a secure connection. |
| The watch doesn't appear in the device list | Wake the watch, close other connections to it, and turn Bluetooth off and on. |
| Connection drops during a sync | Keep the phone or computer close to the watch and avoid other heavy Bluetooth use. |
| Beacio doesn't work in Safari | Confirm the extension is enabled and allowed for this website, and that the device runs iOS 18 or later. |

---

## Links

- Bluefy on the App Store: https://apps.apple.com/app/id1492822055
- Beacio on the App Store: https://apps.apple.com/app/id6761301368
