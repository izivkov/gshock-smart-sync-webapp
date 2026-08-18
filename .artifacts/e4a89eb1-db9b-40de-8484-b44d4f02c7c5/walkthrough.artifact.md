# Walkthrough - GShock Web App Alignment with Kotlin API

I have successfully updated the `gshock-smart-sync-webapp` to match the architecture and feature set of the Kotlin `GShockAPI` library.

## Key Changes

### 1. Enhanced Watch Information & Matching
- **Ported `exactModelMap`**: Added a detailed mapping of official Casio model names and module numbers to functional models, ensuring accurate feature detection.
- **Updated `WATCH_MODEL`**: Added support for new models like `GW-BX5600`, `MTG-B1000`, and `MTG-B3000`.
- **New `ModelInfo` fields**: Added tracking for step counters, second dials, fine watch conditions, and more.

### 2. Protocol-Based Architecture
Introduced a protocol layer to handle differences in communication between different watch families:
- **`WatchProtocol`**: A common interface for all protocols.
- **`StandardProtocol`**: For most modern G-Shock watches.
- **`MipProtocol`**: Specialized for MIP (Memory-in-Pixel) display models like the `GW-BX5600`.
- **`AnalogueProtocol`**: For analogue-heavy models like the `MTG` series, handling multi-dial synchronization.

### 3. Functional IO Layer
Refactored the IO layer to separate pure logic (parsing, encoding) from side effects (BLE writes). Each major IO now includes a `*Functional` counterpart:
- **Step Counter Support**: Implemented `StepCounterIO` and `StepCounterIOFunctional` to parse the 400-byte activity record from the `ABL-100WE`.
- **`GW-BX5600` Time Sync**: Added `GwBx5600TimeIO` to handle the multi-step initialization and time setting protocol.
- **`MTG-B1000/3000` Second Dial**: Added `MtgB1000TimeIO` for second-dial time synchronization.
- **Improved Settings & Alarms**: Refactored `SettingsIO`, `AlarmsIO`, `TimeAdjustmentIO`, and others to use functional principles and match the Kotlin API data structures.

### 4. Robust BLE Communication
- **Multi-characteristic Notifications**: Updated `Connection.ts` to subscribe to all characteristics in the Watch Features service, ensuring that data-request responses (like step counts) are correctly captured.
- **Protocol-Aware Dispatching**: `MessageDispatcher.ts` now uses the active watch's protocol to extract keys and unwrap payloads, allowing for more flexible data handling.

## How to use the Step Counter API

You can now retrieve step counter data using `GShockAPI`:

```typescript
const stepData = await GShockAPI.getStepCount();
console.log(`Current steps: ${stepData.currentDaySteps}`);
```

## Supported Models (Highlights)
- **GW-BX5600**: Full support including the new MIP time-sync protocol.
- **MTG-B1000/B3000**: Support for second-dial synchronization.
- **ABL-100WE**: Support for step counter data retrieval.

---
> [!NOTE]
> All changes are consistent with the `GShockAPI` Kotlin library at `/home/izivkov/projects/GShockAPI`, facilitating easier cross-platform feature parity in the future.
