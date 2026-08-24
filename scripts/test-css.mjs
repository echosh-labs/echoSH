import http from "http";

const routes = ["/", "/compendium", "/foundations", "/axis-mundi", "/echosh"];

function checkRoute(route) {
  return new Promise((resolve, reject) => {
    http.get("http://localhost:3000" + route, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Route ${route} returned HTTP ${res.statusCode}`));
        }
        const match = data.match(/\/_next\/static\/css\/[^\"]+/);
        if (!match) {
          return reject(new Error(`Route ${route} has no CSS link in HTML`));
        }
        const cssPath = match[0];
        http.get("http://localhost:3000" + cssPath, (cssRes) => {
          let cssData = "";
          cssRes.on("data", (chunk) => (cssData += chunk));
          cssRes.on("end", () => {
            if (cssRes.statusCode === 200 && cssData.length > 1000) {
              console.log(`✔ Route ${route.padEnd(14)} -> HTTP 200 | CSS: ${cssData.length} bytes (HTTP 200)`);
              resolve();
            } else {
              reject(new Error(`Route ${route} CSS failed: Status ${cssRes.statusCode}, size ${cssData.length}`));
            }
          });
        });
      });
    });
  });
}

async function runAll() {
  console.log("▶ Verifying all live routes and CSS delivery on http://localhost:3000 ...");
  for (const r of routes) {
    await checkRoute(r);
  }
  console.log("✅ ALL 4 ROUTES & TAILWIND CSS BUNDLES SERVED 100% CLEANLY!");
}

runAll().catch((err) => {
  console.error("❌ Test failed:", err.message);
  process.exit(1);
});


