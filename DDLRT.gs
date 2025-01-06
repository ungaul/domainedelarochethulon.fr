// Set an On Edit trigger on Google Sheets

function updateJSONOnGitHub() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");

  
  function sanitizeInput(input) {
    if (typeof input === 'string') {
      return input.normalize("NFC").trim(); 
    }
    return input;
  }

  
  function createMedalImageUrl(medalName) {
    if (!medalName) return null;
    return `assets/images/medailles/${medalName.toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, "")}.png`;
  }

  
  const wineData = {};
  const wineRange = sheet.getRange(3, 2, 9, 5).getValues(); 
  wineRange.forEach(row => {
    const appellation = sanitizeInput(row[0]);
    const vintage = sanitizeInput(row[1]);
    const description = sanitizeInput(row[2]);
    const servingTemp = sanitizeInput(row[3]);
    const price = parseFloat(row[4]);

    if (appellation) {
      wineData[appellation] = {
        vintage: vintage,
        description: description,
        servingTemp: servingTemp,
        price: price,
      };
    }
  });

  
  const salonData = sheet.getRange(3, 8, 4, 3).getValues();
  const salonDetails = salonData.map(row => ({
    location: sanitizeInput(row[0]),
    edition: sanitizeInput(row[1]),
    date: sanitizeInput(row[2]),
  }));

  
  const medalData = sheet.getRange(3, 12, 3, 2).getValues();
  const medalDetails = medalData.map(row => ({
    medal: sanitizeInput(row[0]),
    wine: sanitizeInput(row[1]),
    imageUrl: createMedalImageUrl(sanitizeInput(row[0])),
  }));

  
  const accueilContent = sanitizeInput(sheet.getRange("H9").getValue());
  const exploitationContent = sanitizeInput(sheet.getRange("J9").getValue());

  
  const jsonData = JSON.stringify({
    wines: wineData,
    salons: salonDetails,
    news: medalDetails,
    staticContent: {
      accueil: accueilContent,
      exploitation: exploitationContent,
    },
  }, null, 2);

  
  Logger.log("Generated JSON: " + jsonData);

  
  const GITHUB_USERNAME = "ungaul";
  const GITHUB_REPO = "domainedelarochethulon.fr";
  const GITHUB_FILE_PATH = "assets/js/data.json";
  const GITHUB_TOKEN = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');

  const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;

  
  const fileResponse = UrlFetchApp.fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  const fileData = JSON.parse(fileResponse.getContentText());
  const sha = fileData.sha;

  
  const utf8Content = Utilities.newBlob(jsonData, 'application/json', 'data.json').getBytes();
  const base64Content = Utilities.base64Encode(utf8Content);

  
  const payload = {
    message: "Mise à jour des données des vins, salons, médailles et contenus statiques",
    content: base64Content,
    sha: sha,
  };

  
  const response = UrlFetchApp.fetch(url, {
    method: "PUT",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
    payload: JSON.stringify(payload),
  });

  Logger.log("GitHub Response: " + response.getContentText());
}
