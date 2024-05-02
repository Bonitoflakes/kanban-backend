import { db } from "../db";
import { cards, columns } from "../schema";

const main = async () => {
  console.log("Drop start");
  await db.delete(cards).execute();
  await db.delete(columns).execute();

  console.log("Drop done");
};

main();
