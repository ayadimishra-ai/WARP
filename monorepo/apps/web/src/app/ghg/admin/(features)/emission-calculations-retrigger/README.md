# Emission Calculations Retrigger

This feature module provides a lightweight interface for retriggering emission calculations based on selected filters.

## Structure

```
emission-calculations-retrigger/
├── page.tsx                                    # Main page with auth guard
├── components/
│   ├── emission-calculations-retrigger.tsx     # Main UI component
│   └── emission-calculations-retrigger-server.ts # Server actions
├── services/
│   └── emission-calculations-retrigger.service.ts # Placeholder service
└── types/
    └── index.ts                                # TypeScript types
```

## Features

- **Organization Dropdown**: Select from available organizations
- **Activity Dropdown**: Dynamically loads activities based on selected organization
- **Activity Month Dropdown**: Select from all 12 months
- **Year Dropdown**: Select from current year and previous 10 years
- **Retrigger Button**: Disabled until all filters are selected
- **Confirmation Modal**: Shows selected filters before confirming
- **Success Notification**: Toast notification on successful retrigger

## Usage

Navigate to:
```
/ghg/admin/emission-calculations-retrigger
```

## Implementation Status

✅ Page structure
✅ Form state management
✅ Filter dropdowns (Organization, Activity, Month, Year)
✅ Retrigger button with validation
✅ Confirmation modal
✅ Handler function with payload passing
✅ Success toast integration
✅ Placeholder service structure

⏳ Actual backend API integration (to be implemented)

## API Integration TODO

The service layer is currently a placeholder. To integrate with actual backend:

1. Update `services/emission-calculations-retrigger.service.ts`
2. Replace the placeholder `retriggerEmissions` function with actual API call
3. Add proper error handling
4. Add authentication/authorization checks
5. Integrate with actual emissions calculation service

## Component Details

### EmissionCalculationsRetrigger

Main client component that handles:
- Fetching organizations on mount
- Fetching activities when organization changes
- Form validation
- Modal state management
- API calls through the service layer

### Server Actions

- `getOrganizationList()`: Fetches all organizations
- `getActivitiesByOrganization(organizationId)`: Fetches activities for a specific organization

### Service

- `retriggerEmissions(payload)`: Placeholder for API call to retrigger emissions

## Styling

Matches existing Snowkap design system:
- Mantine 8 components
- Gradient button: `linear-gradient(90deg, #0B3C5D 0%, #1E6072 100%)`
- Brand color: `#003b52`
- Consistent spacing and layout with other admin features
