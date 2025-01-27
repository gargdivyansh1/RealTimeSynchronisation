# Notion-Todoist Synchronization Tool

This script provides a two-way synchronization mechanism between **Notion** and **Todoist**, ensuring that tasks stay updated across both platforms. By automating the task synchronization process, this tool is ideal for users managing projects in both environments, reducing manual effort and preventing task discrepancies. This can be particularly valuable for professionals juggling complex workflows, students managing academic and personal tasks, or teams collaborating on shared objectives. The primary purpose of this tool is to ensure tasks are kept up-to-date across both platforms, enabling seamless task management.

## Features

### Two-Way Synchronization:
- Automatically sync tasks between **Notion** and **Todoist**.
- New tasks created in Notion are pushed to Todoist.
- New tasks created in Todoist are pushed to Notion.
- Updates in either platform are reflected in the other.

### Task Deletion Management:
- Deletes tasks in Todoist if marked with a specific label (e.g., "Sync") and not present in Notion.
- Archives tasks in Notion if marked as synced but missing in Todoist.

### Priority Mapping:
- Handles priority translation between the platforms.

### Date Synchronization:
- Ensures task due dates are consistent.

### Error Handling:
- Logs errors for better debugging and understanding of synchronization issues.

## Prerequisites

### Tools and APIs

#### Google Apps Script:
- Used to write and execute the synchronization logic.

#### Notion API:
- **Documentation:** [Notion API Docs](https://developers.notion.com/)
- **Authentication:** Integration token.

#### Todoist API:
- **Documentation:** [Todoist API Docs](https://developer.todoist.com/)
- **Authentication:** Todoist API token.

## Research Overview

### Summary
This research explores leveraging the Notion and Todoist APIs to achieve seamless task synchronization. Notion's API allows for efficient database querying and task management, while Todoist's API ensures robust task handling with priority and label support. Key takeaways include: effective authentication mechanisms, strategies to manage inconsistencies, and solutions to API rate limit challenges.

### Notion API
The Notion API allows developers to interact with Notion pages and databases programmatically.

#### Authentication:
- Authentication uses Bearer Tokens.
- The `Notion-Version` header ensures compatibility with specific API versions.

#### Querying Databases:
- Used the `/v1/databases/{database_id}/query` endpoint to fetch tasks stored in a Notion database.
- Explored filtering and pagination options to manage larger datasets.

#### Updating and Archiving Pages:
- Tasks are archived using the `PATCH /v1/pages/{page_id}` endpoint with the archived property set to true.

### Todoist API
The Todoist API is a robust tool for managing tasks programmatically.

#### Authentication:
- Used OAuth2 for authentication with a Todoist API token.

#### Fetching Tasks:
- Used the `/rest/v2/tasks` endpoint to retrieve all active tasks.
- Explored filtering by labels and priority.

#### Updating and Deleting Tasks:
- Implemented `POST` and `DELETE` requests for task management.
- Priority and label handling were critical for correct task synchronization.

### Challenges Resolved:
- Handling inconsistencies in data formatting between Notion and Todoist.
- Mapping priorities and labels effectively.
- Managing API rate limits and ensuring error resilience.

## Installation and Setup

### Clone or Copy the Script:
- Copy the script into the Google Apps Script editor.

### Set Environment Variables:
- Replace the placeholders for `Notion_Token`, `Todoist_Token`, and `Database_ID` with your actual credentials.
  - Tokens can be generated as per the official API documentation:
    - [Generate Notion Token](https://www.notion.so/my-integrations)
    - [Generate Todoist Token](https://developer.todoist.com/appconsole.html)

### Deploy the Script:
- Save and execute the script directly from the Google Apps Script editor.

## Script Structure

### Core Functions
- **Notion_And_Todoist_Talk:** Primary function for Notion-to-Todoist synchronization. Compares tasks in Notion with Todoist and synchronizes them.
- **Todoist_And_Notion_Talk:** Primary function for Todoist-to-Notion synchronization. Compares tasks in Todoist with Notion and synchronizes them.

### Helper Functions:
- **fetching_Notion_Data:** Fetches tasks from Notion.
- **fetch_Todoist_Data:** Fetches tasks from Todoist.
- **create_Todoist:** Creates a new task in Todoist.
- **delete_notion:** Archives a task in Notion.
- **update_Todoist:** Updates a task in Todoist.
- **create:** Creates a new task in Notion.
- **delete_task:** Deletes a task in Todoist.
- **update:** Updates a task in Notion.

## Usage Instructions
1. Ensure that both your Notion database and Todoist workspace are properly set up.
2. In **Notion**, create a database with properties: `Name`, `Date`, `Priority`, `My`, `Description`, and `isSync`.
3. In **Todoist**, set up tasks with labels to manage syncing.
4. Run the script from the Google Apps Script editor.
5. Monitor logs for synchronization success or errors.

## Additional Resources
- **Notion API Documentation:** [Notion Developers](https://developers.notion.com/)
- **Todoist API Documentation:** [Todoist Developers](https://developer.todoist.com/)
- **Google Apps Script Documentation:** [Google Apps Script](https://developers.google.com/apps-script)

## Troubleshooting

### Issue: API rate limit exceeded.
- **Solution:** Add delays between requests to ensure compliance with rate limits.

### Issue: Authentication errors.
- **Solution:** Verify tokens and ensure they have the necessary permissions.

### Issue: Data inconsistencies.
- **Solution:** Check mappings between Notion properties and Todoist fields.

## Future Enhancements
- Add support for additional labels and properties.
- Include more robust error handling and retry mechanisms.
- Implement UI-based execution for non-developers.

---

This synchronization tool bridges the gap between **Notion** and **Todoist**, enhancing productivity and ensuring your tasks are always in sync.
