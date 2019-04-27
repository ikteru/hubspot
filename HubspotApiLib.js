const request = require("request-promise");
const configs = require("./configs.js");
const excel = require("node-excel-export");
const fs = require("fs");
require('dotenv').config();


//Produce excel file ::: 
module.exports.produceExcelFile = async function(newApiCall){
  let engagements = [];
  if( newApiCall ){
     engagements = await this.getNewEngagements();
     
  } else {
    engagements = require('./engagements/engagements.json').engagements;
  } 
  this.getNewCompanies().then( (companiesList) => this.filterResults(engagements,companiesList)).then( filteredResults => this.saveExcelFile(filteredResults, configs.heading, configs.specification))
}


//Sends a request to the API to get all engagements then saves them in the "engagements" folder
//Then returns the contents of the saved file
module.exports.getNewEngagements = async function() {
  const finalUrl = "https://api.hubapi.com/engagements/v1/engagements/paged";
  const parameters = {
    hapikey: process.env.API_KEY,
    limit: 200,
    offset: ""
  };
  const result = await module.exports
  .makeRequest("GET", finalUrl, parameters, "engagements")
  .catch(
    err => console.log("ERROR IN GET ENGAGEMENTS :::: ", err)
  );
  return result;
};

//Get
module.exports.getRecentEngagements = async function(year, month, day) {
  const finalUrl = "https://api.hubapi.com/engagements/v1/engagements/recent/modified";
  var since = new Date(year, month, day).getTime()/1000 

  const parameters = {
    hapikey: "2ed5e06a-a545-4eec-914b-4c342ac995b6",
    since: since,
    count: 100, //100 is the maximum you can ask for 
    offset: ""
  };
  const result = await module.exports
  .makeRequest("GET", finalUrl, parameters, "engagements")
  .catch(
    err => console.log("ERROR IN GET ENGAGEMENTS :::: ", err)
  );
  return result;
};

//Sends a request to the API to get all companies then saves them in the "companies" folder
//Then returns the contents of the saved file
module.exports.getNewCompanies = async function() {
  const finalUrl = "https://api.hubapi.com/companies/v2/companies/paged";
  const parameters = {
    properties: "name",
    hapikey: "2ed5e06a-a545-4eec-914b-4c342ac995b6",
    limit: 200,
    offset: ""
  };

  const result = await this.makeRequest("GET", finalUrl, parameters, "companies")
  .catch( err => console.log("ERROR WHILE FETCHING COMPANIES :::: ", err));

  return result;
};



//Takes an array of "engagements" then
//Returns an array that the excel library can use to build an excel file
//The array has four columns: company, format, data, date
module.exports.filterResults = async function(engagementsList, companiesList) {
  let result = [];
  const COMPANIES = companiesList;
  for( engagementItem of engagementsList) {
    let temp = {};
    temp["format"] = engagementItem.engagement.type;
    temp["date"] = new Date(engagementItem.engagement.createdAt);

    switch (engagementItem.engagement.type) {
      case "MEETING":
        temp["data"] =
          " -- Start Time -- : " +
          new Date(engagementItem.metadata.startTime) +
          " -- End Time -- : " +
          new Date(engagementItem.metadata.endTime) +
          " -- Body -- : " +
          engagementItem.metadata.title +
          " -- Body -- : " +
          engagementItem.metadata.body;
        break;

      case "NOTE":
        temp["data"] = " -- Body -- : " + engagementItem.metadata.body;
        break;

      case "EMAIL":
        temp["data"] =
          " -- From -- : " +
          engagementItem.metadata.from.email +
          " -- Subject -- : " +
          engagementItem.metadata.subject +
          " -- Body -- : " +
          engagementItem.metadata.text;
        break;
      case "TASK":
        temp["data"] =
          " -- Status -- : " +
          engagementItem.metadata.status +
          " -- Subject -- : " +
          engagementItem.metadata.subject +
          " -- Task Type -- : " +
          engagementItem.metadata.taskType +
          " -- Body -- : " +
          engagementItem.metadata.body;
        break;
      case "INCOMING EMAIL":
        temp["data"] =
          " -- From -- : " +
          engagementItem.metadata.from.email +
          " -- Subject -- : " +
          engagementItem.metadata.subject +
          " -- Body -- : " +
          engagementItem.metadata.text;
        break;
      case "CALL":
        temp["data"] = engagementItem.metadata.body;
        break;
      default:
        temp["data"] = " -- Body -- : " + engagementItem.metadata.body;
    }
    const companyName = await this.getCompanyName(COMPANIES,engagementItem.associations.companyIds[0]);
    temp["company"] =
      engagementItem.associations.companyIds === undefined || engagementItem.associations.companyIds.length === 0
        ? "NO COMPANY FOUND"
        : companyName ? companyName : "COMPANY NAME NOT FOUND"
        
    result.push(temp);
  };

  return result;
};

//Use a company ID and checks the companies json list in the "companies" folder for a hit
//Returns "false" if the company name isn't found
//Returns the company name if it is found
module.exports.getCompanyName = async function(companiesList, companyId){
  const result = companiesList.filter(company => {
    return companyId === company.companyId
  });
  return result.length !== 0 && result[0].properties.name.value;
}



//A function to simplify making requests to the Hubspot API
module.exports.makeRequest = async function(
  method,
  baseUrl,
  parameters,
  endpoint
) {
  let hasMore = true;
  let fullResult = [];
  let number = 1;
  var options = {
    method: method,
    url: baseUrl,
    qs: parameters
  };

  while (hasMore) {
    const scheduledTimeout = setTimeout(function() {
      console.log("Getting shard number   ::: ", number);
      console.log("Starting from offset   ::: ", options.qs.offset)
    }, 1500);

    const result = await request(options)
    .then(result => JSON.parse(result))
    .then(result => {
      options.qs.offset = result.offset;
      if (endpoint === "engagements") {
        hasMore = result.hasMore;
        return result.results;
      } else if (endpoint === "companies") {
        hasMore = result["has-more"];
        return result.companies;
      } else {
        console.log("Not companies nor engagements ... ");
        return result;
      }
    })
    .catch(err => {
      console.log("ERROR WHILE FETCHING REQUEST RESULTS, ERROR MESSAGE :::: ", err.message);
    });
    
    result !== undefined
      ? fullResult.push(...result)
      : console.log("THIS PARTICULAR REQUEST FAILED, REQUEST NUMBER ::: ", number);
      number++;
      clearTimeout(scheduledTimeout);
  }
  const temp ={};
  temp[endpoint] = fullResult ;

  const dir = __dirname + "/" + endpoint
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir)
  }

  fs.writeFile(
    "./" + endpoint + "/" + endpoint + ".json",
    JSON.stringify(temp),
    function() {
      console.log("Function: MakeRequest()");
      console.log("Successfully saved request result ::: ", endpoint);
    }
  );

  return fullResult;
};

//Takes the filtered results by the filterResults function and saves them in an excel file
module.exports.saveExcelFile = async function(filteredResults, heading, specification) {
  const report = excel.buildExport([
    // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
    {
      name: "Report", // <- Specify sheet name (optional)
      heading: heading, // <- Raw heading array (optional)
      specification: specification, // <- Report specification
      data: filteredResults // <-- Report data
    }
  ]);

  if (!fs.existsSync("./excel_files")){
    fs.mkdirSync("./excel_files")
  }
  fs.writeFile(
    "./excel_files/result" + "." + Date.now() + ".xlsx",
    report,
    function(err) {
      if (err) {
        console.log("ERROR ::: ", err);
      } else {
        console.log("SUCCESS");
      }
    }
  );

  return true;
};


//Check what format types are available
//Takes a list of engagements as a parameter
module.exports.getFormatTypes = async function(engagementsList) {
  let result = [];
  let samples = [];

  engagementsList.forEach( engagementItem => {
    if (!result.includes(engagementItem.engagement.type)) {
      result.push(engagementItem.engagement.type);
      console.log(engagementItem.engagement.type);
      let temp = {};
      temp[engagementItem.engagement.type] = engagementItem.metadata;
      samples.push(temp);
    }
  });

  console.log(
    " ************************************************************** "
  );
  console.log(samples);
  console.log(
    " ************************************************************** "
  );
  return result;
};


