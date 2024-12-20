const fs = require("fs");
const ExcelJS = require("exceljs");
const path = require("path");

/* 
Configurations --------------------------------
*/

// Changeable Configurations --------------------------------
const configName = "taskReport"; // Must define config name file from folder name in folder configurations

// All Config
const configJSON = require(`./configurations/${configName}/config.json`);

const catogory = configJSON.category;
const report = configJSON.report;

const filtersData = configJSON.filtersData;

// Excel config
const excelHeaderTitle = configJSON.title;
const excelConfig = configJSON.excelConfig;

// XML config
const xmlConfig = configJSON.xmlConfig;

// Proccessors --------------------------------
// Posiblities Generator
const getCombinations = (array) => {
  const result = [];

  // Helper function for generating combinations recursively
  const generateCombinations = (start, currentCombo) => {
    // Push the current combination to the result
    if (currentCombo.length > 0) {
      result.push(currentCombo); // Convert to number
    }

    // Loop through the array to generate further combinations
    for (let i = start; i < array.length; i++) {
      generateCombinations(i + 1, [...currentCombo, array[i]]);
    }
  };

  // Start the recursion with an empty combination
  generateCombinations(0, []);
  return result;
};

const possibleCombinations = getCombinations(filtersData);

// File Generator
const generator = async (filters) => {
  const filterNames = filters.map((f) => f.name);
  const combinationFileName = filtersData
    .map((e) => {
      return filterNames.includes(e.name)
        ? `${e.name}Selected`
        : `${e.name}All`;
    })
    .join("-");

  console.log(`Combinations: ${combinationFileName !== '' ?  combinationFileName : 'No Combinations'}`);

  // Query SQL Template
  let templateQuery = fs.readFileSync(
    path.join(__dirname, `./configurations/${configName}/queryTemplate.ini`),
    "utf8"
  );
  
  // Replace placeholder
  let isFirstClause = false;
  if (templateQuery.indexOf("@where") !== -1) {
    isFirstClause = true;
    templateQuery = templateQuery.replace(
      "@where",
      filters.length > 0 ? "\nWHERE" : ""
    );
  }

  let queryPlaceholder =
    filters.length > 0
      ? `\n    ${isFirstClause ? "" : "AND "}` +
        filters.map((e) => e.query).join("\n    AND ")
      : "";
  templateQuery = templateQuery.replace("@replace", queryPlaceholder);

  // XML Template
  let templateXML = fs.readFileSync(
    path.join(__dirname, `./configurations/${configName}/xmlTemplate.xml`),
    "utf8"
  );
  templateXML = templateXML.replace("@headerRange", xmlConfig.headerRange);
  templateXML = templateXML.replace("@rowRange", xmlConfig.rowRange);

  // Worksheet Templete
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Sheet1");

  // Add a header & Spaces
  sheet.addRow([]);
  sheet.addRow([]);
  sheet.addRow([]);
  sheet.addRow([]);
  sheet.addRow([]);
  sheet.addRow([]);
  sheet.addRow([]);
  sheet.addRow([]);

  sheet.mergeCells("A7:C8");
  sheet.getCell("A7").value = excelHeaderTitle;
  sheet.getCell("A7").font = { name: "Arial", size: 14, bold: true };
  sheet.getCell("A7").alignment = { horizontal: "center", vertical: "middle" };

  sheet.addRow([]);
  sheet.addRow([]);
  sheet.addRow([]);

  sheet.getCell("A10").value = "Tanggal";
  sheet.getCell("A10").font = { name: "Arial", size: 12, bold: true };

  sheet.getCell("B10").value = {
    text: "~{@dateFrom}",
    hyperlink: "mailto:~%7B@dateFrom%7D",
  };
  sheet.getCell("C10").value = {
    text: "~{@dateTo}",
    hyperlink: "mailto:~%7B@dateTo%7D",
  };

  sheet.addRow(excelConfig.map((e) => e.headerName));

  sheet.columns = excelConfig.map((e) => ({ ...e, headerName: undefined }));

  const headerRow = sheet.getRow(12);
  headerRow.eachCell((cell, colNum) => {
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
    cell.font = { name: "Arial", bold: true };
  });

  sheet.addRow(
    excelConfig.map((e) => ({
      text: `~{@${e.key}}`,
      hyperlink: `mailto:~%7B@${e.key}%7D`,
    }))
  );
  const valueRow = sheet.getRow(13);
  valueRow.eachCell((cell, colNum) => {
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
    cell.font = { name: "Arial" };
  });

  // Write Files
  const fileNameFormat = `${catogory}-${report}${combinationFileName !== '' ? `-${combinationFileName}` : ''}`;
  const exportDir = `./exports/${configName}`;

  if (!fs.existsSync(path.join(__dirname, exportDir)))
    fs.mkdirSync(path.join(__dirname, exportDir));

  // Write Excel
  await workbook.xlsx.writeFile(`${exportDir}/${fileNameFormat}.xlsx`);

  // Write .ini
  fs.writeFileSync(
    path.join(__dirname, `${exportDir}/${fileNameFormat}.ini`),
    templateQuery,
    { encoding: "utf8" }
  );

  // Write .xml
  fs.writeFileSync(
    path.join(__dirname, `${exportDir}/${fileNameFormat}.xml`),
    templateXML
  );
};

const start = async () => {
  console.log("GENERATING");

  // No Combinations
  generator([]);

  // With Combination
  for (let i = 0; i < possibleCombinations.length; i++) {
    const filters = possibleCombinations[i];

    generator(filters);
  }
};

if (!fs.existsSync(path.join(__dirname, "./exports")))
  fs.mkdirSync(path.join(__dirname, "./exports"));
start();
