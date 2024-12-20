<h1>Export Config</h1>

<h2>Before start</h2>

Install all dependencies using
<code>npm i</code>

<h2>Create configurations</h2>
Create config folder in <code>./configurations</code> and create 3 required files with names:
<br/>
<code>config.json</code>
<br/>
<code>queryTemplate.ini</code>
<br/>
<code>xmlTemplate</code>
<br/>
<br/>
In <code>config.json</code>, add the following code
<br/>

```json
    {
    "title": "Raise Call Report",
    "category": "agent",
    "report": "loginLog",
    "excelConfig": [
        { "headerName": "User ID", "key": "userId", "width": 20 }, 
        { "headerName": "Agent Fullname", "key": "agentFullname", "width": 20 }, 
        { "headerName": "Agent Username", "key": "agentUsername", "width": 20 }, 
        { "headerName": "Time Last Login", "key": "timeLastLogin", "width": 20 },
        { "headerName": "Date And Time", "key": "dateAndTime", "width": 20 }
    ],
    "xmlConfig": {
        "headerRange": "A7:E12",
        "rowRange": "A13:E13"
    },
    "filtersData": [
        {
            "name": "agentFullname",
            "query": "ost_task.staff_id IN (:staffIds)"
        },
        {
            "name": "state",
            "query": "ost_task.team_id IN (:group)"
        }
    ]
}
```
<br/>
In <code>"excelConfig"</code> key, define the header name and the key value that matches to the query output table such as <code>SELECT agent_name AS agentName FROM agents</code> that has <code>agentName</code> header name in query output. Then put it in <code>"key"</code> value for mapping in excel. <code>"width"</code> key for adjust excel output column width.
<br/>
<br/>
In <code>xmlConfig.xml</code>, add this following value
<br/>

    <?xml version="1.0" encoding="UTF-8"?>
    <element name="report">
    <output range="@headerRange"/>
    <iteration>
        <element name="row">
            <output range="@rowRange" />
        </element>
    </iteration>
    </element>
<br/>
There are 2 properties that has "@" symbol to be replaced with <code>"xmlConfig"</code> key from <code>config.json</code>. The <code>headerRange</code> tag is for determine where is the excel file header column and rows, in this example we have "A7:E12" where the header starts that covers header title and table headers in excel file and "A13:E13" as itteratable row datas that has been mapped from config file (check from <code>./excelOutputExample.xlsx</code>). 
<br/>
<br/>
Add queryTemplate.ini for query and add <code>[row]</code> on the top of the query. Example
<br/>

    [row]
    SELECT
	    ost_staff.staff_id AS 'userId',
	    CONCAT(ost_staff.firstname, ost_staff.lastname) AS 'agentFullname',
	    ost_staff.username AS 'agentUsername', 
	    DATE_FORMAT(ost_staff.lastlogin, '%H:%i') AS 'timeLastLogin',
	    ost_staff.lastlogin AS 'dateAndTime'
    FROM
	    ost_staff @where @replace
    ORDER BY
	    CONCAT(ost_staff.firstname, ost_staff.lastname) ASC
<br/>