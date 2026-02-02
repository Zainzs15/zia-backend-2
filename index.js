import { connectDB } from "./src/config/db.js";
import { seedData } from "./src/seed.js";
import app from "./src/app.js";

const PORT = 5000;

await connectDB();
await seedData();

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
