const Todoist_Token = '66ac17f871e01c54b951d09a3408d6182558a158'
const Notion_Token = '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'
const Database_ID = '180397872e1080e8ab8be45de92c3b8a'

// api
const Todoist_API = 'https://api.todoist.com/rest/v2/tasks'
const Notion_API = 'https://api.notion.com/v1'

function Todoist_And_Notin_Talk() {

  try {
    const todoist_data = fetch_Todoist_Data_Value();

    const database = fetch_database();
    //console.log(database)

    todoist_data.forEach(task => {
      // const isvalue = task?.labels[0]
      // console.log(isvalue)
      // return
      try {

        let pageFound = null;

        Object.values(database).forEach(page => {
          //console.log(page)
          if (page?.properties?.['My']?.rich_text?.[0]?.text.content.trim() === task?.id) {
            pageFound = page;
            //console.log(task.id)
          }
        })

        if (!pageFound) {
          // too database mai create krdo
          //now check if the task is synced or not
          const isvalue = task?.labels[0]
          if (isvalue == "notSync") {
            create(task);
          } else if (isvalue == "Sync") {
            delete_task(task)
          }
        } else {
          update(pageFound, task)
        }
      } catch (error) {
        console.error(`Error processing task ${task.content}:`, error.message);
      }
    })
  } catch (error) {
    console.error('Error in Todoist_And_Notion_Talk:', error.message);
  }
}

function fetch_Todoist_Data_Value() {
  try {
    const options = {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${Todoist_Token}`
      },
    };

    const response = UrlFetchApp.fetch(Todoist_API, options);

    if (response.getResponseCode() === 200) {
      console.log(response.getContentText())
      return JSON.parse(response.getContentText());
    } else {
      throw new Error(`Failed to fetch Todoist data: ${response.getContentText()}`);
    }
  } catch (error) {
    console.error('Error in fetch_Todoist_Data:', error.message);
    return [];
  }

}

function fetch_database() {
  try {
    const options = {
      contentType: 'application/json',
      headers: {
        'Authorization': `Bearer ${Notion_Token}`,
        'Notion-Version': '2022-06-28',
      },
      payload: JSON.stringify({})
    }
    const url = `https://api.notion.com/v1/databases/${Database_ID}/query`;
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText())
    //console.log(data)
    return data.results;
  } catch (error) {
    throw new Error("The database not found ", error.message)
  }
}

function delete_task(task) {
  // getting task id 
  const task_id = task?.id

  try {
    const options = {
      method: 'delete',
      headers: {
        'Authorization': `Bearer ${Todoist_Token}`,
      },
    };

    const response = UrlFetchApp.fetch(`${Todoist_API}/${task_id}`, options)

    if (response.getResponseCode() !== 204) {
      throw new Error(`Failed to delete task in Todoist: ${response.getContentText()}`);
    }

    console.log(`Task deleted in Todoist: ${task_id}`);

  } catch (error) {
    console.error(`Error deleting task ${task_id} in Todoist:`, error.message);
  }
}

function create(task) {

  try {

    let pri = task.priority.toString();
    console.log(pri)
    if(pri == "1"){
      pri = "P4"
    } else if(pri == "2"){
      pri = "P3"
    }else if(pri == "3"){
      pri = "P2"
    }else pri = "P1"

    const formattedDueDate = task.due?.['date'] ? new Date(task.due.date).toISOString() : task.created_at;
    //const formattedReminder = task.reminder ? new Date(task.reminder).toISOString() : null;

    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': `Bearer ${Notion_Token}`,
        'Notion-Version': '2022-06-28',
      },
      payload: JSON.stringify({
        "parent": {
          "database_id": Database_ID
        },
        "properties": {
          "Name": {
            "title": [
              {
                "text": {
                  "content": task.content
                }
              }
            ]
          },
          "Date": {
            "date": {
              "start": formattedDueDate
            }
          },
          "priority": {
            "type": "select",
            "select": {
              "name": pri
            }
          },
          "My": {
            "rich_text": [
              {
                "text": {
                  "content": task.id
                }
              }
            ]
          },
          "description": {
            "rich_text": [
              {
                "text": {
                  "content": task.description || "no description"
                }
              }
            ]
          },
          "isSync": {
            "checkbox": true
          }
        }
      }),
    };

    const url = 'https://api.notion.com/v1/pages';
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());

    if (response.getResponseCode() !== 200) {
      throw new Error(`Failed to create page in Notion: ${data.message}`);
    }

    console.log('Page created in Notion:', data);

    // now call the function for updating labels 
    //update_labels(task)

  } catch (error) {
    console.error('Error creating page in Notion:', error.message);
  }
}

function update_labels(task) {
  // id lo 
  const labels = task?.labels;
  if (!labels || labels.length === 0) {
    //console.error("No labels found in the task.");
    return;
  }

  //console.log(labels)

  const label_Id = labels[0]?.id;
  if (!label_Id) {
    console.error("No valid label ID found.");
    return;
  }

  try {

    const option = {
      method: "put",
      headers: {
        "Content-Type": 'application/json',
        'Authorization': `Bearer ${Todoist_Token}`,
        'X-Request-Id': Utilities.getUuid()
      },
      payload: JSON.stringify({
        "name": "Sync"
      })
    }
    const response_new = UrlFetchApp.fetch(`https://api.todoist.com/rest/v2/labels` , option)
    const response_data = response_new.getContentText()
    console.log(response_data)
  } catch (error) {
    throw new Error("Failed to update the labels")
  }
  //options 

}

function get_labels(){
  const option = {
    method: "get",
    headers: {
      'Authorization': `Bearer ${Todoist_Token}`,
    }
  }

  const response = UrlFetchApp.fetch(`https://api.todoist.com/rest/v2/labels`,option)
  //console.log(response.getContentText())
}

function update(page, task) {

  try {

    const formattedDueDate = task.due?.['date'] ? new Date(task.due.date).toISOString() : task.created_at;

    const pageId = page.id;

    let pri = task.priority.toString();
    console.log(pri)
    if(pri == "1"){
      pri = "P4"
    } else if(pri == "2"){
      pri = "P3"
    }else if(pri == "3"){
      pri = "P2"
    }else pri = "P1"

    const options = {
      method: 'patch',
      contentType: 'application/json',
      headers: {
        'Authorization': `Bearer ${Notion_Token}`,
        'Notion-Version': '2022-06-28',
      },
      payload: JSON.stringify({
        "properties": {
          "Name": {
            "title": [
              {
                "text": {
                  "content": task.content
                }
              }
            ]
          },
          "Date": {
            "date": {
              "start": formattedDueDate
            }
          },
          "priority": {
            "type": "select",
            "select": {
              "name": pri
            }
          },
          My: {
            "rich_text": [
              {
                "text": {
                  "content": task.id
                }
              }
            ]
          },
          "description": {
            "rich_text": [
              {
                "text": {
                  "content": task.description || "no description"
                }
              }
            ]
          },
          "isSync": {
            "checkbox": true
          }
        }
      }),
    };

    const url = `https://api.notion.com/v1/pages/${pageId}`;
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());

    if (response.getResponseCode() !== 200) {
      throw new Error(`Failed to update page in Notion: ${data.message}`);
    }

    //update_labels(task)

    //console.log('Page updated in Notion:', data);
  } catch (error) {
    console.error('Error updating page in Notion:', error.message);
  }
}
