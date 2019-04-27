# HubSpot Engagements Excel Exporter

This project a simple Nodejs porgram to import Engagements from Hubspot and save them into an Excel file.

To download, clone this repository: 

```
git clone https://github.com/ikteru/hubspot.git
```
Then install all dependencies: 

```
npm install
```

Before you execute the script, you need to give it your Hubspot API Key, to do that, create a ".env" file and input the following: 
```
API_KEY="{YOUR_API_KEY_HERE}"
```

To execute the script, run: 
```
npm start
```
If everything went well, you'll notice a few folders appearing. One of them is called "excel_files", you'll notice a file inside it called result.<timestamp>.xlsl with the results from the API call.

If you open the "app.js" file, you'll see a more detailed description of what exactly is happening.
