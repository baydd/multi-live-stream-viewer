
# Live Stream Dashboard

A modern, responsive dashboard for viewing multiple live streams and Twitter feeds simultaneously. Supports various streaming platforms and formats including HLS (.m3u8), YouTube Live, Kick, Twitch, and Twitter user timelines.

## Features

- 📺 Multiple stream support with grid layout
- 🔄 Drag and drop stream rearrangement
- 🌓 Always dark theme for eye comfort
- 🌐 Bilingual support (TR/EN/ES/中文/РУС/PT/عربي) — switch with the globe button
- 🎛️ Individual stream controls (mute, playback speed, fullscreen)
- 💾 Save and Load System
- 🏷️ Stream categorization and notes
- 🐦 Twitter user timeline embed (add any public Twitter username as a grid item)
- 🖱️ Resize grid items from the corner; when you resize one, all grid items auto-optimize to fit the screen

## Supported Stream Types

- HLS streams (.m3u8)
- YouTube Live embed links or video IDs
- Twitch embed links
- Kick embed links
- DASH streams
- Twitter user timelines (public accounts)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. Click the settings gear (⚙️) in the top right corner
2. Add stream URLs or Twitter usernames in the settings panel
   - For Twitter, select "Twitter" as the platform and enter the username (e.g. `trthaber`)
3. Change the number of grid items (4, 6, 9, etc.)
4. Drag and drop streams to rearrange them
5. Resize any grid item from the corner — all items will auto-optimize to fit the screen
6. Use individual stream controls to adjust playback settings

## Smart TV & Mobile Support

- Large, easy-to-read controls
- Remote control navigation support
- Touch-friendly interface
- Responsive layout

## Twitter Integration

- Add a Twitter username as a grid item to see their latest tweets
- Videos in tweets play directly in the grid (no new window)
- Only public Twitter accounts are supported

## Development

Built with:
- React
- TypeScript
- Styled Components
- i18next for internationalization
- HLS.js for HLS stream support
- React Grid Layout for stream arrangement

## License

MIT 
