# Implementation Plan - Filter Bots by Default in Activity Report

Modify the activity report to display only real users by default and add an `--all` flag to include bots and other access.

## Proposed Changes

### 1. Update `activity_report.sh`
- Add logic to parse a new `--all` command-line argument.
- Correctly extract the time window (hours/days) even if `--all` is present.
- Pass both the time window and the "show all" flag to `analyze_logs.py`.

### 2. Update `analyze_logs.py`
- Modify the script to accept a second optional argument for the "show all" flag.
- Conditionally print the "BOTS / OTHER ACCESS" table based on this flag.
- Ensure the summary line always shows counts for both, even if the table is hidden.

## Verification Plan

### Automated Tests
- Run `./activity_report.sh` and verify only "REAL USERS" are shown.
- Run `./activity_report.sh --all` and verify both tables are shown.
- Run `./activity_report.sh 48h --all` and verify it handles both the time window and the flag.

### Manual Verification
- Check the engagement and location data to ensure consistency.
