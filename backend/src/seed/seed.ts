import { connectDb } from "../db/connect.js";
import { ensureDemoPage } from "../services/layout.service.js";

await connectDb();
const page = await ensureDemoPage();
console.log(`Seeded demo page: ${page.title} (${page._id})`);
process.exit(0);
