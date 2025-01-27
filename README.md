# Notion-Todoist Synchronization Tool

This tool synchronizes tasks between Notion and Todoist, ensuring consistency and better task management across both platforms.

---

## Features

- **Two-Way Synchronization**:
  - Sync tasks created or updated in Notion to Todoist and vice versa.
- **Task Deletion Management**:
  - Automatically handles task deletions and archiving between platforms.
- **Priority and Date Mapping**:
  - Ensures priority and due dates are correctly synced.
- **Error Handling**:
  - Logs errors for debugging synchronization issues.

---

## Folder Structure
notion-todoist-sync/ ├── src/ │ ├── notion.js # Handles Notion API interactions │ ├── todoist.js # Handles Todoist API interactions │ ├── sync.js # Core synchronization logic │ ├── helpers.js # Utility functions for data handling ├── config/ │ └── credentials.js # Stores API tokens and configurations ├── logs/ │ └── sync.log # Logs synchronization activities and errors ├── .env # Environment variables for API keys ├── README.md # Project documentation ├── package.json # Node.js dependencies └── .gitignore # Ignored files and folders

