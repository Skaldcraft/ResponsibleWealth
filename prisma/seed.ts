import { seedDatabase } from "../src/lib/server/seed-database";

seedDatabase()
  .then(() => {
    console.log("Seed completed");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
