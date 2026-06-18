# Feature: Monthly Activity Data – All User Stories & Requirements

---

## Background / Architecture Reference

```
Browser
  └─ localStorage.access_token (JWT)
       └─ useUserSession() → decoded org/user/mappings

Component mounts → two parallel fetches:
  A. useOrganizationDetails()
       └─ Apollo → Hasura → "does org have WWTP? water activity?"

  B. server actions (in activity-data-records-server-action.ts)
       ├─ getBuyerSupplierRole  → GraphQL/Hasura → role (BUYER/SUPPLIER)
       ├─ getActivitiesByOrg   → GraphQL/Hasura → which columns to show
       └─ getMonthlyActivityData
             ├─ getOrgData       → GraphQL → baseline year
             ├─ GetTaskRequests  → GraphQL → task IDs
             ├─ (if buyers) getBulkBuyerShareDetails → GraphQL → buyer counts
             └─ Raw SQL (PostgreSQL via Drizzle)
                   └─ 7-CTE query across 20+ GHG tables
                   └─ Returns: one row per (location × month),
                               each with completed/pending/na per activity,
                               pagination, and total counts

UI renders MantineReactTable with:
  - Dynamic columns (from activity config)
  - Status icons per cell (✓ / ✗ / ⊘)
  - BUYER role gets extra validation in getData() before render
  - Buyer share badges (clickable → postMessage to parent iframe)
  - Filter tabs (All/Completed/Pending) + search + pagination
    all trigger fresh SQL re-fetches via server actions
```

---

## User Story 1: All Monthly Activity Summary Page – Filters

**User Story:**
As an Organisation Admin, I want to filter the summary page by location, year type, and month, so that I can view activity data for a specific time period and location.

**Title:** All Monthly Activity Summary Page – Filters

**Acceptance Criteria:**
The page has three filters: Location (multi-select) and All Duration (single select — Financial Year or Calendar Year) Month (multi-select). By default filter, All location, the latest available year and the latest month with uploaded data are selected on page load.

---

### 1.1 Location Drop down

**Acceptance Criteria:**
- Clicking the dropdown opens a list of all locations the logged-in user has access to.
- Selecting a specific location filters, the month summary data and status counts (Total, Pending for Approval, Approved) accordingly.
- "All Locations" is the default selected option on page load.
- The selected location name is displayed inside the dropdown after selection.
- If there is only one location available, it is pre-selected and the dropdown is still accessible.
- If a location name is very long (e.g., 80+ characters), it should be truncated with an ellipsis in the dropdown — not overflow the UI.
- Typing inside the dropdown in the search should filter results in real time without page reload.
- Selecting and deselecting locations in rapid succession should not cause data inconsistency in the month tiles or status counts.
- Clicking on clear should uncheck all the selected locations
- Should display total location selected at bottom left corner i.e. 5 Selected

**Negative scenarios:**
- If the user has no assigned locations, the dropdown should show "No locations available" and be disabled — not show a blank list.
- If the location data API fails, the dropdown shows a fallback error state (e.g., "Failed to load locations") instead of being silently empty.

---

### 1.2 Year Selection

**Acceptance Criteria:**
- Clicking the dropdown opens a date range selector showing available financial/Calendar years.
- This Financial and Calendar year should be dynamic based on the selected option by Org admin in the organzation detail page
  - If Calendar year --- Range should be displayed as --- Jan 2025 to Dec 2025
  - If Financial year --- Range should be displayed as --- Apr 2024 to Mar 2025
- Only one year can be selected at a time (single select).
- The currently active date range is highlighted as selected.
- Changing the date range refreshes all month tiles and status counters to reflect data for the newly selected period.
- The selected date range label updates inside the dropdown after selection (e.g., "April 2024 to March 2025").
- Month tiles displayed always correspond to the selected date range (12 months shown).
- If a date range with no data exists, month tiles should all show "No Data" state — not throw an error.
- If a future financial year is selected (e.g., April 2026 to March 2027), months beyond today should be shown in a disabled/greyed-out state, not clickable.
  - Suppose Current month is April:
    - Mar ✅ Clickable — Current month, data entry may be open
    - Apr 2026 🚫 Disabled / Greyed out — Future month, not yet reached
    - May 2026 🚫 Disabled / Greyed out — Future month, not yet reached
    - Jun 2026 🚫 Disabled / Greyed out — Future month
    - Jul to Mar 2027 🚫 Disabled / Greyed out — Future months

---

### 1.3 RESET TO DEFAULT Button

**Acceptance Criteria:**
- Clicking "Reset to Default" resets the Location dropdown to "All Locations".
- Date range resets to the current active financial year.
- All individually selected month tiles are deselected.
- Status counters (Total, Pending for Approval, Approved) refresh to reflect the default state data.
- The button is always visible and enabled, even when no filters have been changed.
- Clicking reset when already in the default state should produce no visible change.

---

### 1.4 Month Tiles (Apr – Mar)

**Acceptance Criteria:**
- Each month tile is displayed in order from April to March (as per selected financial year).
- Months with submitted/approved data are shown with a green border ("Data Available" state). [TBD]
- Months with no data are shown in grey ("No Data" state).
- Clicking a month tile selects it; it is visually highlighted with the "Selected" state (dark border/filled circle per legend).
- Multiple month tiles can be selected simultaneously.
- Clicking an already-selected tile deselects it.
- Selected months filter the data table or summary below accordingly.

**Negative scenarios:**
- Months that are future months (beyond current month and later) are shown in a disabled state and cannot be selected.
- Clicking a disabled/greyed-out month tile (current month or no data) should produce no action — no selection, no API call.
- If all months are deselected, the page should show an appropriate empty state message — not a blank content area. [TBD]
- Selecting all 12 months simultaneously should not cause performance degradation or a timeout.
- If a financial year has fewer than 12 active months (e.g., mid-year company start), only the active months should be shown; the rest should be clearly disabled in no data available state.

---

## User Story 2: All Monthly Activity Summary Page – Summary Status Counter Labels

**User Story:**
As an Organisation Admin, I want to see summary showing Total Records, Pending for Approval, and Approved counts, so that I can quickly understand the data status for the selected filters.

**Title:** All Monthly Activity Summary Page – Summary. Status Counter Labels (Total | Pending for Approval | Approved)

**Acceptance Criteria:**
- Three summary are displayed: Total Records, Pending for Approval, and Approved.
- The counts on the cards reflect the data matching the current filter selection (location, year, month).
- When filters are changed, all three card counts update accordingly.
- Total Records = Pending for Approval + Approved.

**Negative / Edge Cases:**
- If all data is approved, "Pending for Approval" card shows 0.
- If no data has been uploaded for the selected filter, all three cards show 0.
- Card counts must include data from locations the admin have access to.
- Multiple Org Admin Simultaneous View: If Admin A approves data while Admin B is viewing the same summary page, Admin B's counts must reflect the updated values only upon their next filter change or page refresh — not in real time. [TBD]

---

## User Story 3: Activity Summary View (Default Table View)

**User Story:**
As an Organisation Admin or Location Executive, I want to see a table with activity-wise data statistics, so that I can see the status of records for each activity type.

**Title:** Activity Summary View (Default Table View)

**Acceptance Criteria:**
- Name: Activity Type Summary. The table is the default view when the page loads.
- Columns displayed: Activity Type | Total Records | Pending for Approval | Approved | Actions.
- Each row represents one activity type.
- For Org admin: The action column shows Approve and Export Data buttons for Org Admin.
- For Location executive: The action column shows only Export Data button for Location Executive.
- The data in the table matches the applied filters.

**Negative / Edge Cases:**
- If an activity has no records for the selected filter, that activity row shows 0 in all count columns.
- If a Location Executive has no access to a particular activity, that activity must not appear in the left activity menu.
- If the page is accessed without any filter selected, default filter values (All location, latest year, latest month) must auto-apply and load the data in the table.
- Pagination – All Table Views: All table views (Activity Type Summary, Location Wise Activity Summary, Data Upload Logs) must support pagination with a default page size of 10 rows. Page size options (10, 25, 50) must be available via a dropdown at the bottom of each table.

---

## User Story 4: Location Wise Activity Summary (Secondary Tab)

**User Story:**
As an Organisation Admin or Location Executive, I want to switch to a location-wise breakdown view, so that I can see data statistics per location and activity combination.

**Title:** Location Wise Activity Summary (Secondary Tab)

**Acceptance Criteria:**
- A button is available to switch between "Activity Type Summary" and "Location Type Activity Summary" views.
- In this view, columns displayed: Location | Activity Type | Total Records | Pending for Approval | Approved | Actions.
- Each row shows the count for a specific location + activity combination.
- Search - should work on Location and Activity type [TBD]
- For Org admin: The action column shows Approve and Export Data for Org Admin.
- For Location executive: The action column shows only Export Data for Location Executive.
- Pagination – All Table Views: All table views (Activity Type Summary, Location Wise Activity Summary, Data Upload Logs) must support pagination with a default page size of 10 rows. Page size options (10, 25, 50) must be available via a dropdown at the bottom of each table.

---

## User Story 5: Approve (Lock) Functionality

**User Story:**
As an Organisation Admin, I want to approve/lock data for a specific activity, month, and location, so that no further changes can be made to that data once it is verified.

**Title:** Approve (Lock) Functionality

**Acceptance Criteria:**

A. The Approve button is visible and active for the Admin when at least one record for an activity is in "Pending for Approval" status.
B. Clicking Approve locks all pending records for that activity based on the current filters (month, year, location) in one action.
C. After approval, the "Pending for Approval" count for that activity becomes 0 and the "Approved" count increases accordingly.
D. The Approve button becomes inactive (greyed out) after all records for that activity are approved.
E. Once data is approved, the Location Executive can no longer upload or modify data for that same month, location, and activity.

**Negative / Edge Cases:**

A. If all records are already approved, the Approve button must be disabled/greyed out.
B. A Location Executive must NOT see the Approve button at all.
C. Approving data for one month/location/activity must NOT affect data in other month/location/activity combinations.
D. There is no Reject option in V1. The flow is: Pending for approval → Approved.
E. Unlocking of approved data is out of scope. If unlocking is required, it must be raised as a support ticket.

**Browser Back Button After Approval:**
If the Org Admin clicks the browser's back button after approving data, the system must reload the summary page in its latest state (post-approval). The system must not allow re-submission of the same approval action via the browser back button.

**Approval Scope Clarity:**
The Approve button at the row level must Approve data based on the currently applied filters (selected months, selected locations, and the specific activity row).

---

## User Story 6: Bulk Upload with Approval-based Validation

**User Story:**
As a Location Executive, I want to upload activity data via bulk upload, so that I can submit data for a specific month and location.

**Title:** Bulk Upload with Approval-based Validation

**Acceptance Criteria:**
- Location Executive can upload a file for any activity, location, and month that is not yet approved.
- On successful upload, the records appear in the summary page with "Pending for Approval" status.
- On successful upload, an email notification is sent to the Organisation Admin. (Note: Email content pending)

**Negative / Edge Cases:**
- If the Location Executive attempts to upload data for a month and location that has already been approved (locked), the upload must fail with a clear validation error message (e.g., "Data for this month and location has already been approved and cannot be modified").
- If the uploaded file contains records for a mix of approved and non-approved months/locations, the entire upload must fail — no partial uploads are allowed.
- Uploading data for the current month or a future month must not be allowed. The system must block it with a validation error.
- If the file format is incorrect or columns are missing, the upload must fail with a descriptive error message.
- If the file is empty, the upload must fail with an appropriate error.

---

## User Story 7: Activity-wise Navigation Sub Menu (Data Upload Logs Revamp)

**User Story:**
As a Location Executive, I want to navigate between activities using a left-side menu and see the upload history for each, so that I can easily find records and manage uploads activity by activity.

**Title:** Activity-wise Navigation Sub Menu (Data Upload Logs Revamp)

**Acceptance Criteria:**
- The left navigation panel shows a list of all activities the user has permission to access.
- Clicking on an activity in the left nav loads that activity's upload history table on the right.
- The upload history table shows existing search and filter functionality.
- A Location (multi-select) dropdown filter is available on this page. Default will be All Locations.
- Download Template downloads the template for the currently active activity.
- Bulk Upload functionality works the same as existing behaviour with existing pop-up for uploading data. Clicking on Bulk Upload will open the existing pop up for selection of Bulk Upload | Manual Uploads | AI Uploads basis on activity. e.g.: Current AI upload is available for Energy grid only. So this option will not be available for other activities.
- For AI-enabled activities, the AI option is shown when clicked on bulk upload.

**Activities with no permissions:**
Activities with no permissions will be shown as locked and clicking on that will show upselling content pop up.

**Negative / Edge Cases:**
- Activities with no permission should be shown as locked.
- If a Location Executive has no upload history for an activity, the right panel shows an empty state (e.g., "No upload history found").
- The upload history must only show records belonging to the logged-in Location Executive's own locations.

---

## User Story 8: Email Notification – Data Uploaded

**User Story:**
As an Organisation Admin, I want to receive an email when a Location Executive uploads data for a location and activity, so that I know there is new data waiting for my approval.

**Title:** Email Notification: Data Uploaded

**Acceptance Criteria:**
- When a Location Executive successfully uploads data, one email notification is sent to the Org Admin.
- The email is sent per location + activity combination.
- The email content includes the location name, activity name, and a link to log in and approve the data.
- If two different location executives upload data for two different locations at the same time, two separate emails are sent to the admin.

**Negative / Edge Cases:**
- If the upload fails (validation error), no email must be sent to the admin.
- If the same location executive uploads data multiple times for the same location and activity (before approval), an email must be sent for each successful upload.
- The email must not be sent if the Org Admin themselves uploads data (if this scenario becomes applicable in future).
- Email content pending.

**Data Uploaded Notification (To: Org Admin)**

> Trigger: Location Executive successfully uploads data for a location and activity.
> To: Organisation Admin
> CC: —
> Subject: New Activity Data Uploaded
>
> Hi [Admin Name],
> New activity data has been uploaded on platform and is now pending your approval.
>
> Click on below link to download the file and view more details on the uploaded data:
> View uploaded data summary
>
> Please log in to review and approve the data.
> Approve Data → If you have any questions, please reach out to your platform administrator.

---

## User Story 9: Email Notification – Data Approved

**User Story:**
As a Location Executive, I want to receive an email when my uploaded data is approved by the Admin, so that I know the data has been locked and no further changes are needed.

**Title:** Email Notification: Data Approved

**Acceptance Criteria:**
- When the admin approves data for a location and activity, an email notification is sent to the Location Executive(s) assigned to that location and activity.
- The email clearly states which location and activity data has been approved.
- If multiple Location Executives are assigned to the same location and activity, each of them receives the email individually.

**Data Approved Notification (To: Location Executive)**

> Trigger: Org Admin approves/locks data for a location and activity.
> To: Location Executive
> CC: —
> Subject: Data Approved
>
> Hi [Location Executive Name],
> Your activity data has been reviewed and approved by the administrator.
>
> Click on below link to download the file and view more details on the approved data:
> View approve data summary
>
> Please note that this data is now locked. No further uploads or changes are allowed for this activity, location, and period.
> If you believe this was done in error or need the data to be unlocked, please raise a support request with your platform administrator.
> View Summary →

---

## User Story 10: Scheduled Reminder – Upload Pending (1st of Every Month)

**User Story:**
As a Location Executive, I want to receive a reminder email on the 1st of every month if I haven't uploaded data for the previous month, so that I don't miss submitting data on time.

**Title:** Scheduled Reminder: Upload Pending (1st of Every Month)

**Acceptance Criteria:**
- On the 1st of every month, the system automatically checks all location + activity combinations for pending (not uploaded) data from the previous month.
- If data is missing for a location + activity, a reminder email is sent to:
  - To: Location Executive for that location/activity
  - CC: Organisation Admin
- The email mentions the specific location, activity, and the month for which data is pending.

**1st Reminder: Upload Pending (To: Location Executive | CC: Org Admin)**

> Trigger: Scheduler runs on the 1st of every month. Data for the previous month has not been uploaded for a location and activity.
> To: Location Executive
> CC: Organisation Admin
> Subject: Reminder to Upload Activity Data
>
> Hi [Location Executive Name],
> This is a reminder that activity data for the previous month has not yet been uploaded.
>
> Click on below link to download the file and view more details:
> View pending activity data
>
> Kindly log in to the platform and upload the data at the earliest.
> Upload Data →
> If you have already submitted this data or believe you received this email in error, please ignore this message or contact your administrator.

**Negative / Edge Cases:**
- If data has already been uploaded (even if not yet approved) for a location + activity for the previous month, no reminder email must be sent for that combination.
- If a location has no assigned Location Executive, the system must skip sending the email for that location (no unhandled errors).
- The reminder must only cover the previous month — not any month before that.
- If the scheduler runs late or fails, a retry mechanism must be in place (to be confirmed with dev team).

---

## User Story 11: Scheduled Reminder – Upload Pending (10th of Every Month)

**User Story:**
As a Location Executive, I want to receive a second reminder email on the 10th of every month if I still haven't uploaded data for the previous month, so that I have a final nudge to submit the missing data.

**Title:** Scheduled Reminder: Upload Pending (10th of Every Month)

**Acceptance Criteria:**
- On the 10th of every month, the system checks again for location + activity combinations with no uploaded data for the previous month.
- If data is still missing, a second reminder email is sent:
  - To: Location Executive for that location/activity
  - CC: Organisation Admin
- The email mentions the specific location, activity, and the overdue month.

**2nd Reminder: Upload Still Pending (To: Location Executive | CC: Org Admin)**

> Trigger: Scheduler runs on the 10th of every month. Data for the previous month is still not uploaded for a location and activity.
> To: Location Executive
> CC: Organisation Admin
> Subject: Second Reminder: Activity Data Still Pending
>
> Hi [Location Executive Name],
> This is a second reminder that activity data for the previous month is still pending.
>
> Click on below link to download the file and view more details:
> View pending activity data
>
> Please log in and upload the missing data as soon as possible.
> Upload Data →
> If this data has already been submitted after the 1st of this month, please disregard this reminder. For any issues or questions, contact your administrator.

**Negative / Edge Cases:**
- If data was uploaded between the 1st and 10th, no second reminder must be sent for that combination.
- This reminder must be independent of the 1st-of-month reminder — both run as separate scheduler jobs.

---

## Additional Scenarios

### A. Scheduler Timezone
- The scheduler for the 1st and 10th of every month reminders must run at 9:00 AM IST on the respective dates.
- The timezone must be hardcoded to IST in V1. Multi-region timezone support is out of scope for V1 (TBD with dev team).

### B. Org-Level Reminder Toggle
- In V1, there is no option for an Org Admin to disable scheduled reminders. All reminders are active by default for all organisations.
- A configuration toggle for reminders is a V2 item and must not be built in V1.

### C. Location Executive Deactivated Between 1st and 10th
- If a Location Executive is deactivated after the 1st-of-month reminder is sent but before the 10th-of-month reminder is due, the 10th reminder must NOT be sent to that deactivated user.
- In this case, the 10th reminder must be sent to the Org Admin (CC) only, with a note that no active Location Executive is assigned. (TBD with dev team.)

### D. Activity Deactivated Mid-Month
- If an activity is deactivated after the 1st-of-month reminder has been sent, the 10th-of-month reminder must NOT be sent for that deactivated activity.

### E. New Location or Activity Onboarded on Scheduler Run Day
- If a new location or activity is onboarded on the same day the scheduler runs (1st or 10th), it must be excluded from that day's reminder check.
- The new location or activity must be included in all subsequent monthly scheduler runs.

### F. First Month After Organisation Onboarding
- If an organisation is onboarded mid-month, no reminder must be sent for the current month's data.
- Reminder checks must begin from the 1st of the following month after onboarding.

### G. Multiple Org Admins – Reminder CC
- If an organisation has more than one Org Admin, all Org Admins must be included in the CC field of both the 1st and 10th reminder emails.

### H. Email Notifications (Upload + Approval) – Multiple Org Admins
- If an organisation has more than one Org Admin, the upload notification email must be sent to all Org Admins of that organisation.

### I. Multiple Org Admins – Approved By Field
- The "Approved by" field in the Data Approved notification email must reflect the name of the specific Org Admin who performed the approval action.

### K. Deep Link Behaviour in Email CTAs
- The "Approve Data →" link in the upload notification email must take the Org Admin directly to the All Monthly Activity Summary page with the relevant location, activity, and month pre-filtered.
- The "View Summary →" link in the approval notification email must take the Location Executive to the Data Upload Logs page with the relevant activity and month pre-selected.
- If the user is not logged in, they must be redirected to the login page first and then forwarded to the correct deep link after authentication.
