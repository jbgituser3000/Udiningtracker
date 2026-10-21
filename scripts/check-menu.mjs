// Quick check that the Dine On Campus endpoints still work and return nutrition.
// Run with: npm run check-menu
const API = "https://api.dineoncampus.com/v1";

async function get(path) {
  const res = await fetch(API + path, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} for ${path}`);
  return res.json();
}

const today = new Date().toISOString().slice(0, 10);
const site = await get("/sites/utah/info");
console.log("Site id:", site.site?.id);

const locs = await get(
  `/locations/all_locations?platform=0&site_id=${site.site.id}&for_menus=true&with_address=false&with_buildings=true`,
);
const locations = (locs.buildings ?? []).flatMap((b) => b.locations ?? []).concat(locs.locations ?? []);
console.log(`\n${locations.length} locations:`);
for (const l of locations) console.log(`  ${l.id}  ${l.name}`);

for (const loc of locations.slice(0, 3)) {
  try {
    const menu = await get(`/location/${loc.id}/periods?platform=0&date=${today}`);
    const items = (menu.menu?.periods?.categories ?? []).flatMap((c) => c.items ?? []);
    console.log(`\n${loc.name}: periods = ${(menu.periods ?? []).map((p) => p.name).join(", ") || "none"}; ${items.length} items`);
    const sample = items[0];
    if (sample) {
      console.log("  Sample item:", sample.name, "| portion:", sample.portion);
      console.log("  Nutrients:", (sample.nutrients ?? []).map((n) => `${n.name}=${n.value_numeric ?? n.value}`).join(", "));
    }
  } catch (err) {
    console.log(`\n${loc.name}: ${err.message}`);
  }
}
