/**
 * Sync weather_data from Docker PostgreSQL to Neon.
 *
 * Run: npx tsx scripts/sync-weather-to-neon.ts
 *
 * Reads weather from the running petrol-db container and
 * inserts/upserts into the Neon weather_data table via Drizzle.
 */
import { execSync } from "child_process";
import { db } from "../src/db";
import { weatherData } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Fetching weather data from Docker PostgreSQL...");

  // Use docker exec to query weather data as CSV
  const csvOutput = execSync(
    `docker exec petrol-db psql -U postgres -d petrol_pump -t -A -F, -c "SELECT recorded_date, temperature_high, temperature_low, rainfall_mm, weather_condition FROM weather_data ORDER BY recorded_date;"`,
    { encoding: "utf-8", timeout: 15000 },
  ).trim();

  if (!csvOutput) {
    console.log("No weather data found in Docker PostgreSQL.");
    return;
  }

  const lines = csvOutput.split("\n").filter(Boolean);
  let inserted = 0;
  let skipped = 0;

  for (const line of lines) {
    const parts = line.split(",");
    if (parts.length < 5) {
      skipped++;
      continue;
    }
    const [recordedDate, tempHigh, tempLow, rainfall, condition] = parts.map((s) => s.trim());

    const entry = {
      recordedDate,
      temperatureHigh: tempHigh || null,
      temperatureLow: tempLow || null,
      rainfallMm: rainfall || null,
      weatherCondition: condition || null,
    };

    // Upsert on recorded_date unique constraint
    const existing = await db
      .select({ id: weatherData.id })
      .from(weatherData)
      .where(eq(weatherData.recordedDate, recordedDate))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(weatherData)
        .set(entry)
        .where(eq(weatherData.id, existing[0].id));
    } else {
      await db.insert(weatherData).values(entry);
    }
    inserted++;
  }

  console.log(`✅ Synced ${inserted} weather records to Neon (${skipped} skipped)`);
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
