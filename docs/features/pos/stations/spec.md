# POS / Stations / Terminal Management

## Overview

The POS Stations module manages the identification, configuration, and lifecycle of physical POS terminals (registers) within each outlet. A station represents a specific device or counter position -- such as "Register A" at the Pro Shop or "Poolside Terminal 2" at the bar -- and carries its own peripheral assignments (receipt printer, cash drawer, card terminal), transaction audit trail, and device persistence.

Station identification uses a URL-based system: each station has a unique code that appears as a query parameter (/pos/sales?station=reg-a). This approach allows any web browser to become a POS terminal simply by navigating to the correct URL. For convenience, the selected station code is persisted in localStorage so devices remember their station assignment across sessions. A Station Selector Modal appears when a device first connects or when the saved station is no longer valid.

Station context flows through the POSConfigProvider to all POS components, enabling station-specific behavior such as receipt printer routing, cash drawer commands, card terminal pairing, and transaction attribution. All transactions record the station ID and name, with the name denormalized for historical accuracy even if the station is later renamed or deleted.

## Status

| Aspect | State |
|--------|-------|
| POSStation Prisma model | **Done** -- added to schema.prisma with club/outlet relations |
| Station CRUD API (GraphQL) | Not started |
| POSConfigProvider station support | Not started -- provider accepts outlet prop but not station |
| POSStationGuard component | Not started -- design specified |
| Station Selector Modal | Not started -- design specified |
| URL-based station identification | Not started -- sales page does not read ?station param |
| localStorage persistence | Not started |
| Station management admin UI | Not started |
| Peripheral configuration UI | Not started |
| QR code generation | Not started |
| Transaction station attribution | Not started -- POSTransaction model does not yet have stationId |
| Receipt station header | Not started |
| Station listing in outlet config | Not started |

## Capabilities

- Register named stations (terminals) within each outlet with unique URL-safe codes
- Identify the active station via URL query parameter (?station=code)
- Persist station selection in localStorage for automatic reconnection
- Show a Station Selector Modal when no station is identified
- Validate that the selected station exists, is active, and belongs to the current outlet
- Configure peripheral assignments per station (receipt printer, cash drawer, card terminal)
- Flow station context through POSConfigProvider to all child components
- Record station ID and name on every POS transaction for audit purposes
- Generate QR codes encoding the station URL for easy device setup
- Manage station lifecycle (create, update, deactivate) from the outlet admin page
- Display station name on printed receipts
- Support multiple simultaneous stations per outlet
- Deactivate stations without deleting historical transaction references

## Dependencies

### Interface Dependencies

| Component | Package | Purpose |
|-----------|---------|---------|
| POSConfigProvider | @/components/pos | Extended to accept station prop and include station in context value |
| POSStationGuard | @/components/pos (new) | Wrapper that ensures station is selected before rendering children |
| StationSelectorModal | @/components/pos (new) | Modal displaying available stations for user selection |
| useSearchParams | next/navigation | Read ?station query parameter from URL |
| useRouter | next/navigation | Redirect to URL with ?station parameter |
| usePOSConfig | @/components/pos | Access station and peripherals from context |

### Settings Dependencies

| Setting | Location | Impact |
|---------|----------|--------|
| Outlet station list | POSStation records | Available stations for the selector modal |
| Station peripheral config | POSStation.peripherals JSON | Determines which printer, drawer, terminal are used |
| Outlet active status | POSOutlet.isActive | Deactivated outlet stations are unavailable |
| Station active status | POSStation.isActive | Deactivated stations do not appear in selector |

### Data Dependencies

| Entity | Relation | Usage |
|--------|----------|-------|
| POSStation | Belongs to POSOutlet, belongs to Club | Core station record |
| POSOutlet | Has many POSStations | Parent container for stations |
| POSTransaction | References POSStation (nullable) | Transaction audit trail |
| Club | Has many POSStations via outlets | Organization boundary |

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| stationName | String | (required) | Club admin | Human-readable station name displayed in header and on receipts |
| stationCode | String | (required) | Club admin | URL-safe unique identifier used in ?station= parameter |
| stationDescription | String (nullable) | null | Club admin | Optional description such as "Main counter near entrance" |
| isActive | Boolean | true | Club admin | Whether the station is available for POS use |
| peripherals.receiptPrinter.type | Enum (network, cloud, usb, bluetooth) | null | Club admin | Connection type for the receipt printer |
| peripherals.receiptPrinter.address | String | null | Club admin | IP address, cloud ID, or device path for the printer |
| peripherals.receiptPrinter.name | String | null | Club admin | Human-readable printer name |
| peripherals.receiptPrinter.model | String (nullable) | null | Club admin | Printer model identifier (e.g., "Epson TM-T88VI") |
| peripherals.cashDrawer.type | Enum (printer-driven, network, usb) | null | Club admin | Connection type for the cash drawer |
| peripherals.cashDrawer.address | String | null | Club admin | Address or connection identifier for the drawer |
| peripherals.cashDrawer.name | String | null | Club admin | Human-readable drawer name |
| peripherals.cardTerminal.type | Enum (stripe, square, verifone, other) | null | Club admin | Payment terminal provider |
| peripherals.cardTerminal.address | String | null | Club admin | Terminal ID or IP address |
| peripherals.cardTerminal.name | String | null | Club admin | Human-readable terminal name |
| rememberStation | Boolean | true | Staff (per device) | Whether to save station code in localStorage |

## Data Model

interface POSStation {
  id: string;
  clubId: string;
  outletId: string;
  name: string;
  code: string;
  description?: string;
  peripherals?: StationPeripherals;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StationPeripherals {
  receiptPrinter?: {
    type: 'network' | 'cloud' | 'usb' | 'bluetooth';
    address: string;
    name: string;
    model?: string;
  };
  cashDrawer?: {
    type: 'printer-driven' | 'network' | 'usb';
    address: string;
    name: string;
  };
  cardTerminal?: {
    type: 'stripe' | 'square' | 'verifone' | 'other';
    address: string;
    name: string;
  };
}

// Extended POSConfigProvider props
interface POSConfigProviderProps {
  outlet: string;
  station?: string | null;
  children: React.ReactNode;
  userRole?: string;
  userPermissions?: string[];
  onError?: (error: Error) => void;
  initialSelection?: POSSelection;
}

// Extended context value
interface POSConfigContextValue {
  // ... existing fields ...
  station: POSStation | null;
  peripherals: StationPeripherals | null;
}

// Updated GetPOSConfig query variables
interface GetPOSConfigVariables {
  outletId: string;
  stationCode?: string;
  userRole: string;
  userPermissions: string[];
}

// Station selector props
interface StationSelectorModalProps {
  outletId: string;
  onSelect: (code: string, remember: boolean) => void;
}

// Station guard props
interface POSStationGuardProps {
  children: React.ReactNode;
  onSelectStation: (code: string, remember: boolean) => void;
}

// Transaction model update
interface POSTransaction {
  // ... existing fields ...
  stationId?: string;
  stationName?: string;
}

## Business Rules

1. Station codes must be unique within an outlet. The code is URL-safe (lowercase alphanumeric with hyphens) and is used in the ?station= query parameter. Examples: "reg-a", "register-1", "poolside-2".

2. The station identification flow follows this priority: (a) check URL for ?station= parameter, (b) if no URL parameter, check localStorage for pos-station-{outletId} key, (c) if no localStorage value, show the Station Selector Modal.

3. When a station code is found in the URL, the system validates that the station exists, is active, and belongs to the current outlet. If validation fails, the user is shown an error message and redirected to the Station Selector Modal.

4. When a valid station is selected (via URL or modal), the code is saved to localStorage under the key pos-station-{outletId} if the "Remember this register" checkbox is checked (default: true). This allows the device to automatically reconnect to the same station on subsequent visits.

5. The POSStationGuard component wraps the POS UI and blocks rendering until a valid station is established. It checks for a saved station in localStorage before showing the selector modal, providing a seamless experience for registered devices.

6. Station context is included in the GetPOSConfig API response when a stationCode is provided. The resolved config includes the station record with its peripheral assignments. Components access station data via usePOSConfig().station and usePOSConfig().peripherals.

7. All POS transactions record stationId (foreign key) and stationName (denormalized string). The stationName is captured at transaction creation time so it remains accurate in historical records even if the station is later renamed or deleted. The foreign key uses onDelete: SetNull so deleting a station does not cascade-delete transactions.

8. Peripheral configurations are stored as a JSON field on the station record. Each peripheral type (receipt printer, cash drawer, card terminal) has a type discriminator, an address, and a human-readable name. The address format depends on the type (IP for network, cloud ID for cloud, device path for USB/Bluetooth).

9. Deactivating a station (setting isActive to false) removes it from the Station Selector Modal and prevents new POS sessions from using it. Existing sessions on that station continue working until the config is refreshed. Deactivation does not delete the station or its transaction history.

10. QR codes are generated client-side by encoding the full station URL (e.g., https://app.clubvantage.com/pos/sales?station=reg-a). The QR code can be printed and affixed to the physical terminal for easy device setup.

11. Multiple devices can be assigned to the same station code, but this is discouraged as it can cause cash drawer and printer routing conflicts. The system does not enforce single-device-per-station, but admins can see the last activity time for each station to detect conflicts.

12. Station name appears in the receipt header below the outlet name, formatted as:
    [OUTLET NAME]
    [Station Name]
    This helps identify which register processed the transaction for audit purposes.

13. When a device's localStorage is cleared or the saved station code no longer maps to a valid station, the Station Selector Modal appears on the next POS page load. This handles device reset scenarios gracefully.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Station code in URL does not exist | Show "Station not found" error; redirect to Station Selector Modal |
| Station code in URL belongs to different outlet | Show "Station does not belong to this outlet" error; redirect to Station Selector Modal |
| Station code in URL is deactivated | Show "Station is no longer active" warning; redirect to Station Selector Modal |
| localStorage has stale station code | Validate against API on load; if invalid, clear localStorage entry and show Station Selector Modal |
| All stations at outlet are deactivated | Station Selector Modal shows empty state with message "No stations available -- contact your administrator" |
| Outlet has no stations configured | Station Selector Modal shows empty state; POS operations can proceed without station (stationId is nullable) |
| Two devices using same station simultaneously | Allow both; station name appears on both devices' transactions; warn admin via last-activity timestamp comparison |
| Station renamed while device is connected | Current session retains old name for in-progress transactions; new transactions after config refresh use new name |
| Station deleted while device is connected | Foreign key set to null (onDelete: SetNull); current session shows warning "Station removed"; redirects to selector on next action |
| Network offline when station selector opens | Show cached stations from last successful fetch; if no cache, show "Unable to load stations -- check network" |
| Station code contains invalid URL characters | Reject at creation time with validation error; code must match pattern /^[a-z0-9][a-z0-9-]*[a-z0-9]$/ with max length 50 |
| Device browser does not support localStorage | Fall back to session-only memory; station must be selected every time the page loads |
| QR code URL base changes (domain migration) | QR codes must be regenerated; old QR codes will redirect if domain redirect is configured |
| Multiple outlets on same device (shared kiosk) | Each outlet has its own localStorage key (pos-station-{outletId}); switching outlets triggers station selection for the new outlet |
| Station peripheral address unreachable | Peripheral operations (print, drawer open) fail with specific error; transaction itself still succeeds; staff can retry peripheral action |
| Cash drawer assigned to station but peripheral type is null | Treat as no cash drawer configured; drawer-related buttons are disabled |
| Admin changes station peripheral config while station is in use | Changes take effect on next config fetch (within 5 minutes); in-progress print jobs use old config |
