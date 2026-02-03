import { connectDB } from "./src/config/db.js";
import app from "./src/app.js";

const PORT = 5000;

await connectDB();

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
