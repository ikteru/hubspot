// ================================================================ //
// ========================   IMPORTS  ============================ //
// ================================================================ //
const utils = require('./HubspotApiLib')

// ================================================================= //
// ======================   THE ACTUAL BUSINESS LOGIC  ============= //
// ================================================================= //

//This function produces an excel file from a list of engagements 
//If you want to call the API for new engagements, pass "true" as a parameter to ProduceExcelFile
//If you want to use an already existing list of engagements in the "engagements" folder, pass "false"

utils.produceExcelFile(true)

//If you just want to get a new list of engagements :

// utils.getNewEngagements()

//If you want to get only recent engagements, this function will get them for you
//But you need to specify since when in this format: getRecentEngagement(year, month, day)

// utils.getRecentEngagements(2019, 04, 01);

//When you get new engagements using getNewEngagement or getRecentEngagements, the engagements are saved 
//in a json file in the "engagements" folder
//To convert those into an Excel file, call the produceExcelFile function and give "false" as a parameter

// utils.produceExcelFile(false)


