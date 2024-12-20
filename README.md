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
In <code>config.json</code>, add the following content
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
            "query": ""
        }
    ]
}
```
<br/>
<br/>
Key <code>"title"</code> for add header title in the excel template. Key <code>"category"</code> and <code>"report"</code> for the name of file will be exported (must be camelCase).
<br/>
<br/>
In <code>"excelConfig"</code> key, define the header name and the key value that matches to the query output table such as <code>SELECT agent_name AS agentName FROM agents</code> that has <code>agentName</code> header name in query output. Then put it in <code>"key"</code> value for mapping in excel. <code>"width"</code> key for adjust excel output column width.
<br/>
<br/>
In <code>xmlConfig.xml</code>, add this following value
<br/>

```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <element name="report">
    <output range="@headerRange"/>
    <iteration>
        <element name="row">
            <output range="@rowRange" />
        </element>
    </iteration>
    </element>
```
<br/>
There are 2 properties that has "@" symbol to be replaced with <code>"xmlConfig"</code> key from <code>config.json</code>. The <code>headerRange</code> tag is for determine where is the excel file header column and rows, in this example we have "A7:E12" where the header starts that covers header title and table headers in excel file. As for <code>rowRange</code>, it is for mapping form query to excel data table "A13:E13" as itteratable row datas that has been mapped from config file (check from <code>./excelOutputExample.xlsx</code>). 
<br/>
<br/>
Add queryTemplate.ini for query and add <code>[row]</code> on the top of the query. Example
<br/>
<br/>
If <code>ost_staff.lastlogin = :lastLogin</code> filter is mandatory
<br/>

```sql
    [row]
    SELECT
	    ost_staff.staff_id AS 'userId',
	    CONCAT(ost_staff.firstname, ost_staff.lastname) AS 'agentFullname',
	    ost_staff.username AS 'agentUsername', 
	    DATE_FORMAT(ost_staff.lastlogin, '%H:%i') AS 'timeLastLogin',
	    ost_staff.lastlogin AS 'dateAndTime'
    FROM
	    ost_staff 
    WHERE
        ost_staff.lastlogin = :lastLogin @replace
    ORDER BY
	    CONCAT(ost_staff.firstname, ost_staff.lastname) ASC
```
<br/>
<br/>
If all filters are optional
<br/>

```sql
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
```
<br/>
Form query above, there are <code>@where</code> and/or <code>@replace</code> keys ini .ini file. These key will be replaced when the fillter applied. The <code>@where</code> is mandatory if no <code>WHERE</code> in query. If already defined, don't add <code>@where</code>. <code>@replace</code> is mandatory for filter queries replacement. If there are mandatory filters such as <code>ost_staff.lastLogin = :lastLogin</code>, define it in the .ini file and no need to add to <code>"filtersData"</code> key.
<br/>
<br/>
In <code>"filtersData"</code> key in <code>config.json</code>, add filters that will be applied to query where clause using <code>"query"</code> key. Example, if the filter is optional, add <code>"query": "ost_task.staff_id IN (:staffIds)"</code>. The <code>"name"</code> key in <code>"filtersData"</code> key is for file naming.
<br/>
<br/>
After add all configurations, change value in variable <code>configName</code> in <code>generate.js</code> using directory name in configurations. Then run <code>npm run generate</code> to generate the files and the output files in <code>./exports</code> directory.