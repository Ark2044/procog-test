import { config } from "dotenv";
import getOrCreateDB from "../models/server/dbSetup";

async function main() {
  // Load environment variables
  config();

  console.log("Starting database setup...");

  try {
    await getOrCreateDB();
    console.log("Database setup completed successfully!");
  } catch (error) {
    console.error("Error during database setup:", error);
    process.exit(1);
  }
}

main();
