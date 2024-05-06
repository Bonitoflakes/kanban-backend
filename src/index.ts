import express, { Response, Request } from "express";
import cors from "cors";
import invariant from "tiny-invariant";
import { asc, eq, max } from "drizzle-orm";
import morgan from "morgan";

import { db } from "./db";
import { cards, columns } from "./schema";

const app = express();
const port = process.env.PORT || "9000";

async function artificialDelay(req: Request, res: Response, next: () => void) {
  const ms = 1000;
  await new Promise((resolve) => setTimeout(resolve, ms));
  next();
}

app.use(cors());
app.use(morgan("dev"));
// app.use(artificialDelay);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  res.json("Hello World!!!");
});

app.get("/columnMap", async (req, res) => {
  const data = await db
    .select({
      card_ID: cards.id,
      card_title: cards.title,
      card_order: cards.order,
      card_desc: cards.description,

      column_order: columns.order,
      column_name: columns.title,
      column_ID: columns.id,
      column_color: columns.colorSpace,
    })
    .from(cards)
    .rightJoin(columns, eq(cards.columnId, columns.id))
    .orderBy(columns.order, asc(cards.order));

  const columnMap = data.reduce(function (prev, curr) {
    const {
      card_ID,
      card_order,
      card_title,
      card_desc,
      column_order,
      column_name,
      column_ID,
      column_color,
    } = curr;

    if (!prev[column_name]) {
      prev[column_name] = {
        id: column_ID,
        title: column_name,
        colorSpace: column_color,
        order: column_order,
        count: 0,
        cards: [],
      };
    }

    if (card_ID) {
      prev[column_name].count++;
      prev[column_name].cards.push({
        id: card_ID,
        title: card_title,
        column: column_name,
        order: card_order,
        desc: card_desc,
      });
    }

    return prev;
  }, {});

  res.json(Object.values(columnMap).sort((a, b) => a.order - b.order));
});

app.get("/columns", async (req, res) => {
  try {
    const data = await db.select().from(columns).orderBy(asc(columns.id));
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ app.get ~ error:", error);
  }
});

// TOOD: Ensure integrity for columnID and order.
// There should be no duplicates in order column for a particular user.
app.post("/columns", async (req, res) => {
  try {
    const { title, colorSpace = "red" }: { title: string; colorSpace: any } =
      req.body;

    const maxOrder = await db.select({ max: max(columns.order) }).from(columns);

    invariant(maxOrder[0].max, "max order not found");

    const data = await db
      .insert(columns)
      .values({
        title,
        colorSpace,
        order: maxOrder[0].max + 1,
      })
      .returning();

    res.json(data);
  } catch (error) {
    console.error(error);
    res.json(error);
  }
});

app.patch("/columns/:id", async (req, res) => {
  try {
    const { title, colorSpace, order } = req.body;
    const { id } = req.params;

    const data = await db
      .update(columns)
      .set({ title, colorSpace, order })
      .where(eq(columns.id, Number(id)))
      .returning();

    res.json(data);
  } catch (error) {
    res.json(JSON.stringify(error));
  }
});

app.delete("/columns/:id", async (req, res) => {
  const id = req.params.id;

  const data = await db
    .delete(columns)
    .where(eq(columns.id, Number(id)))
    .returning();

  res.json(data);
});

app.get("/cards", async (req, res) => {
  const allCards = await db
    .select({
      title: cards.title,
      id: cards.id,
      columnName: columns.title,
      order: cards.order,
    })
    .from(cards)
    .innerJoin(columns, eq(cards.columnId, columns.id));

  res.json(allCards);
});

app.get("/cards/:id", async (req, res) => {
  const { id } = req.params;
  const card = await db
    .select({
      title: cards.title,
      id: cards.id,
      order: cards.order,
      description: cards.description,
      column: columns.title,
    })
    .from(cards)
    .innerJoin(columns, eq(cards.columnId, columns.id))
    .where(eq(cards.id, Number(id)));

  // await new Promise((resolve) => setTimeout(resolve, 3000));

  res.json(card[0]);
});

// TOOD: Ensure integrity for columnID and order.
// There should be no duplicates in order column for a particular column.
app.post("/cards", async (req, res) => {
  const { title, column: columnName, description = "" } = req.body;

  const [{ id }] = await db
    .select({ id: columns.id })
    .from(columns)
    .where(eq(columns.title, columnName));

  const [{ val }] = await db
    .select({ val: max(cards.order) })
    .from(cards)
    .where(eq(cards.columnId, id));

  const card = await db
    .insert(cards)
    .values({
      title,
      columnId: id,
      order: val ? val + 1 : 1,
      description,
    })
    .returning();

  res.json(card);
});

// TOOD: Ensure integrity for columnID and order.
// There should be no duplicates in order column for a particular column.
app.patch("/cards/:id", async (req, res) => {
  const { id } = req.params;
  const { title, column: columnName, description, order } = req.body;

  // Initialize an empty object to store the fields to be updated
  const updates = {};

  // Check if title is provided
  if (title !== undefined) {
    updates.title = title;
  }

  // Check if column is provided
  if (columnName !== undefined) {
    // Fetch the column id based on the column name
    const [{ c_id }] = await db
      .select({ c_id: columns.id })
      .from(columns)
      .where(eq(columns.title, columnName));

    updates.columnId = c_id;
  }

  // Check if description is provided
  if (description !== undefined) {
    updates.description = description;
  }

  // Check if order is provided
  if (order !== undefined) {
    updates.order = order;
  }

  // Update the card with the provided fields
  const card = await db
    .update(cards)
    .set(updates)
    .where(eq(cards.id, Number(id)))
    .returning();

  res.json(card);
});

app.delete("/cards/:id", async (req, res) => {
  const { id } = req.params;
  const card = await db
    .delete(cards)
    .where(eq(cards.id, Number(id)))
    .returning();

  res.json(card);
});

app.listen(port, (err: any) => {
  if (err) return console.error(err);
  return console.log(`Server is listening on ${port}`);
});
