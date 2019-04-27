
//Array of objects representing heading rows (very top)
const heading = [
  ["Company", "Format", "Data", "Date"] // <-- It can be only values
];

//Here you specify the export structure
const specification = {
  company: {
    // <- the key should match the actual data key
    displayName: "", // <- Here you specify the column header
    headerStyle: {},
    width: "40"
  },
  format: {
    displayName: "",
    headerStyle: {},
    width: "30"
  },
  data: {
    displayName: "",
    headerStyle: {},
    width: "120"
  },
  date: {
    displayName: "",
    headerStyle: {},
    width: "30"
  }
};

module.exports = { heading, specification}