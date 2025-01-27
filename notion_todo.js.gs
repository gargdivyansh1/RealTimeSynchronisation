function Notion_And_Todoist_Talk() {
  try {
    const notion_data = fetching_Notion_Data()
    //console.log(notion_data)

    const todoistTasks = fetch_Todoist_Data()

    const todoistTaskMap = todoistTasks.reduce((map, task) => {
      map[task.id] = task
      return map
    }, {})

    //console.log(todoistTaskMap)

    Object.values(notion_data).forEach(page => {
      try {
        const taskId = page?.properties?.['My']?.rich_text?.[0]?.text.content.trim()
        const index = todoistTaskMap[taskId]
        //console.log(index)

        if (!index) {
          // now check if the value of the isSync is true then delete the task from then todoist 
          const isValue = page?.properties?.['isSync']?.checkbox
          if (isValue == true) {
            delete_notion(page)
          } else {
            create_Todoist(page)
          }
        } else {
          update_Todoist(index, page)
        }
      } catch (error) {
        console.error(`Error processing Notion page  ${page.id} data: `, error.message)
      }
    })
  } catch (error) {
    console.log(error.message)
    throw new Error("Error processing!", error.message)
  }
}

function fetching_Notion_Data() {
  try {
    const options = {
      contentType: 'application/json',
      headers: {
        'Authorization': `Bearer ${Notion_Token}`,
        'Notion-Version': '2022-06-28',
        "Content-Type": "application/json",
      },
      payload: JSON.stringify({

      })
    }

    const url = `https://api.notion.com/v1/databases/${Database_ID}/query`
    const response = UrlFetchApp.fetch(url, options)
    if (response.getResponseCode() == 200) {
      const data = JSON.parse(response.getContentText())
      //console.log(JSON.parse(response.getContentText()))
      return data.results;
    } else {
      throw new Error(`Failed to fetch notion data: ${response.getContentText()}`)
    }
  } catch (error) {
    console.error("Error in fetching notion data is: ", error.message)
    return [];
  }
}

function fetch_Todoist_Data() {
  try {
    const options = {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${Todoist_Token}`
      },
    };

    const response = UrlFetchApp.fetch(Todoist_API, options);

    if (response.getResponseCode() === 200) {
      //console.log(response.getContentText())
      return JSON.parse(response.getContentText());
    } else {
      throw new Error(`Failed to fetch Todoist data: ${response.getContentText()}`);
    }
  } catch (error) {
    console.error('Error in fetch_Todoist_Data:', error.message);
    return [];
  }

}

function delete_notion(page) {

  const page_id = page?.id

  try {
    const options = {
      method: 'patch',
      contentType: 'application/json',
      headers: {
        'Authorization': `Bearer ${Notion_Token}`,
        "Content-Type": "application/json",
        'Notion-Version': '2022-06-28',
      },
      payload: JSON.stringify({
        archived: true
      })
    }
    // get the page id 
    const response = UrlFetchApp.fetch(`https://api.notion.com/v1/pages/${page_id}`, options)

    if (response.getResponseCode() !== 200) {
      throw new Error(`Failed to delete Notion task: ${response.getContentText()}`);
    }

    console.log(`Notion task ${page_id} deleted successfully.`);

  } catch (error) {
    console.error(`Error deleting Notion task ${page_id}:`, error.message);
  }
}

function create_Todoist(page) {
  try {

    if (!page) {
      throw new Error("Page object is undefined")
    }

    const priorityMap = {
      'High': 1,
      'Medium': 2,
      'Low': 3,
      'None': 4
    };

    const rawDate = page.properties['Date']?.date?.start || null;
    let formattedDate = null;
    if (rawDate) {
      const date = new Date(rawDate);
      formattedDate = date.toISOString().split('T')[0];  // Format: YYYY-MM-DD
      //console.log('Formatted Date:', formattedDate);  // Debugging log
    }

    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': `Bearer ${Todoist_Token}`,
        "Content-Type": "application/json"
      },
      payload: JSON.stringify({
        content: page?.properties?.['Name']?.title?.[0]?.text.content || "Untitled Task",
        completed: page?.properties?.['Status']?.select?.name === 'Completed',
        priority: priorityMap[page?.properties?.['priority']?.select?.name] || 4,
        description: page?.properties?.['description']?.rich_text?.[0]?.text.content || "no description",
        labels: {
          "name": "Sync"
        }
      }),
      //muteHttpExceptions: true
    }
    const response = UrlFetchApp.fetch(Todoist_API, options)
    const responseData = JSON.parse(response.getContentText())

    if (response.getResponseCode() != 200) {
      throw new error(`Failed to create the new todo : `, error.message)
    }


    // now again call the update notion method 
    const required_id = responseData.id

    const notion_options = {
      method: 'patch',
      contentType: 'application/json',
      headers: {
        'Authorization': `Bearer ${Notion_Token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      payload: JSON.stringify({
        "properties": {
          My: {
            "rich_text": [
              {
                "text": {
                  "content": required_id
                }
              }
            ]
          },
          "isSync": {
            "checkbox": true
          }
        }
      })
    }

    const notion_response = UrlFetchApp.fetch(`https://api.notion.com/v1/pages/${page.id}`, notion_options)

    if (notion_response.getResponseCode() != 200) {
      throw new Error(`Failed to upadate the Notion Page: ${notion_response}`)
    }


  } catch (error) {
    throw new Error(`Failed to create the new todo : ${error.message}`)
  }
}

function update_Todoist(index, page) {
  try {
    const priorityMap = {
      'High': 1,
      'Medium': 2,
      'Low': 3,
      'None': 4
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': `Bearer ${Todoist_Token}`,
        "Content-Type": "application/json"
      },
      payload: JSON.stringify({
        content: page?.properties?.['Name']?.title?.[0]?.text.content || index.content,
        completed: page?.properties?.['Status']?.select?.name === 'Completed',
        priority: priorityMap[page?.properties?.['priority']?.select?.name] || 4,
        description: page?.properties?.['description']?.rich_text?.[0]?.text.content || "no description",

      }),
    }

    //console.log(page?.properties?.['Date']?.date?.start)
    const url = `${Todoist_API}/${index.id}`;
    const response = UrlFetchApp.fetch(url, options)
    //console.log(response.getContentText())
    if (response.getResponseCode() !== 200) {
      throw new Error(`Failed to get the data : ${response.getContentText()}`)
    }
  } catch (error) {
    throw new Error(`Failed to update the todo: `, error.message)
  }
}
