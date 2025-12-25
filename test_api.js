async function testGemini() {
    const API_KEY = process.env.GEMINI_API_KEY;
    console.log("Checking API Key...");
    if (!API_KEY) {
        console.error("❌ ERROR: GEMINI_API_KEY is missing from process.env");
        process.exit(1);
    }
    console.log("✅ API Key found (starts with " + API_KEY.substring(0, 4) + "...)");

    console.log("Listing available models...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    try {
        const response = await fetch(url); // GET by default

        if (!response.ok) {
            console.error(`❌ API Request Failed: ${response.status} ${response.statusText}`);
            const errorBody = await response.text();
            console.error(errorBody);
            process.exit(1);
        }

        const data = await response.json();
        console.log("✅ Models Fetched!");
        const models = data.models || [];
        console.log("Available Models:", models.map(m => m.name));

    } catch (e) {
        console.error("❌ Network/Script Error:", e);
    }
}

testGemini();
