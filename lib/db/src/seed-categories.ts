import { db } from "./index";
import { categoriesTable } from "./schema";

const categories = [
  { name: "Minaudières", slug: "minaudieres", description: "Sculptural evening minaudières — the signature Vespera silhouette.", displayOrder: 1 },
  { name: "Clutches", slug: "clutches", description: "Refined clutch bags for elegant evenings.", displayOrder: 2 },
  { name: "Evening Bags", slug: "evening-bags", description: "Statement evening bags for special occasions.", displayOrder: 3 },
];

async function seedCategories() {
  for (const cat of categories) {
    await db
      .insert(categoriesTable)
      .values(cat)
      .onConflictDoNothing();
  }
  console.log(`Seeded ${categories.length} categories`);
  process.exit(0);
}

seedCategories().catch((err) => {
  console.error("Failed to seed categories:", err);
  process.exit(1);
});
