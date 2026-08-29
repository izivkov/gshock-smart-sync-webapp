# Walkthrough - Filter Bots by Default in Activity Report

I have updated the activity report to hide bots by default, providing a cleaner view of real user activity.

## Key Changes

### 1. New `--all` Flag in `activity_report.sh`
The shell script now supports a `--all` argument. It correctly separates this flag from the time window input (e.g., `24`, `48h`, `7d`).

- **Default**: Shows only "REAL USERS".
- **`--all`**: Shows both "REAL USERS" and "BOTS / OTHER ACCESS".

### 2. Conditional Display in `analyze_logs.py`
The Python script now receives a boolean flag indicating whether to show bots. It uses this to conditionally print the bots table while always including them in the final summary counts.

### 3. Clearer Summary
Added a hint in the summary line when bots are hidden, informing the user how to see the full details.

## Verification Results

### Standard Run
`./activity_report.sh 24`
- Displays the "REAL USERS" table.
- Hides the "BOTS" table.
- Shows total counts for both in the summary.
- Includes a hint: `(Run with --all to see details for bots and other access)`.

### Run with All
`./activity_report.sh 24 --all`
- Displays both the "REAL USERS" and "BOTS / OTHER ACCESS" tables.

---
> [!TIP]
> You can combine the flag with any time window, for example: `./activity_report.sh 7d --all`.
