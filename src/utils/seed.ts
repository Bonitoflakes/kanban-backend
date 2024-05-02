import { db } from "../db";
import { cards, columns } from "../schema";

const columnDefault = ["todo", "doing", "done", "archived"];

const main = async () => {
  const columnData: (typeof columns.$inferInsert)[] = [];
  const cardData: (typeof cards.$inferInsert)[] = [];

  for (let i = 0; i < 4; i++) {
    columnData.push({
      name: columnDefault[i],
      title: columnDefault[i],
    });
  }
  console.log("Seed start");
  console.log(columnData);
  await db.insert(columns).values(columnData);

  for (let i = 0; i < 14; i++) {
    cardData.push({
      title: `Card ${i + 1}`,
      columnId: Math.ceil(Math.random() * 4) ,
    });
  }

  console.log(cardData);

  await db.insert(cards).values(cardData);
  console.log("Seed done");
};

main();
