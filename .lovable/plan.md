

# Forensic CSV Reader — Splunk-Style Offline Analysis Tool

A clean, professional, offline-first CSV analysis tool designed for digital forensics investigators. Load multiple CSV files, search across them with Splunk-like syntax, and extract fields for rapid investigation.

---

## 1. File Upload & Index Assignment
- **Drag-and-drop zone + file picker** supporting both individual CSV files and folder uploads
- Automatically assigns an index name based on the CSV filename (e.g., `LocalUsers.csv` → `LocalUsers` index)
- Supports the 21 predefined index names with automatic spelling/casing normalization
- Displays a sidebar listing all loaded indexes with row counts

## 2. Splunk-Style Search Bar
- Prominent search bar at the top of the interface
- **Index-specific search**: typing `index=localusers` filters to only the LocalUsers CSV
- **Global search**: typing a plain term like `administrator` searches across all loaded CSVs — matching column names, row values, and extracted fields
- Search is case-insensitive and returns results instantly
- Results show which index each row came from

## 3. Results Table
- Clean, professional table displaying all matching rows and columns
- File/index source shown inline for each result row
- **Column resizing** via drag handles
- **Drag-to-reorder columns** for custom readability
- Pagination or virtual scrolling for large datasets
- Row count and search stats displayed (e.g., "342 results from 3 indexes")

## 4. Field Extraction Panel (Sidebar)
- Automatically extracts all unique key-value pairs from each CSV's columns
- Displays extracted fields in a left sidebar, grouped by index, similar to Splunk's "Interesting Fields"
- Each field shows top values and their counts
- Clicking a field value adds it as a search filter
- Example: `Username` field showing `Administrator (12)`, `SYSTEM (8)`, etc.

## 5. Export
- "Export Results" button that downloads the current filtered/search results as a new CSV file
- Preserves all visible columns and applied filters

## 6. Visual Design
- Light, professional theme with high contrast for readability
- Monospace font for data values to aid forensic readability
- Color-coded index badges for quick visual identification
- Responsive layout: sidebar (fields) + main area (search bar + results table)
- Entirely client-side — no network requests, fully offline

