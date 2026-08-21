/**
 * Axis Mundi Google Apps Script Synchronizer Bridge.
 * 
 * Paste this script into Google Apps Script (script.google.com).
 * It runs on a lightweight time-driven trigger (e.g. every 1 minute)
 * to search for notes or documents tagged "#amra" or "[EXECUTE]",
 * then dispatches them to your Axis Mundi server endpoint with ZERO AI tokens.
 */

const AXIS_MUNDI_ENDPOINT = "http://YOUR_SERVER_OR_NGROK_HOST:3000/api/axismundi/keep/webhook";
const AUTH_SECRET = "AMRA_CORE_BEARER_TOKEN";

function syncNotesToAxisMundi() {
  try {
    // 1. Example: Search Google Drive / Docs with label #amra or [EXECUTE]
    const query = "title contains '[EXECUTE]' or fullText contains '#amra'";
    const files = DriveApp.searchFiles(query);
    
    while (files.hasNext()) {
      const file = files.next();
      const name = file.getName();
      const content = file.getBlob().getDataAsString();
      
      const payload = {
        title: name,
        content: content,
        tags: ["google_keep", "amra"],
        source: "google_apps_script",
        timestamp: new Date().toISOString()
      };

      const options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        headers: {
          "Authorization": "Bearer " + AUTH_SECRET
        },
        muteHttpExceptions: true
      };

      const response = UrlFetchApp.fetch(AXIS_MUNDI_ENDPOINT, options);
      Logger.log("Synced " + name + " to Axis Mundi: " + response.getResponseCode());
    }
  } catch (err) {
    Logger.log("Error syncing to Axis Mundi: " + err);
  }
}