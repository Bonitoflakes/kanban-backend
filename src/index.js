"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
const drizzle_orm_1 = require("drizzle-orm");
const morgan_1 = __importDefault(require("morgan"));
const db_1 = require("./db");
const schema_1 = require("./schema");
const app = (0, express_1.default)();
const port = process.env.PORT || "8000";
function artificialDelay(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const ms = 1000;
        yield new Promise((resolve) => setTimeout(resolve, ms));
        next();
    });
}
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
// app.use(artificialDelay);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json("Hello World!!!");
}));
app.get("/columnMap", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield db_1.db
        .select({
        card_ID: schema_1.cards.id,
        card_title: schema_1.cards.title,
        card_order: schema_1.cards.order,
        card_desc: schema_1.cards.description,
        column_order: schema_1.columns.order,
        column_name: schema_1.columns.title,
        column_ID: schema_1.columns.id,
        column_color: schema_1.columns.colorSpace,
    })
        .from(schema_1.cards)
        .rightJoin(schema_1.columns, (0, drizzle_orm_1.eq)(schema_1.cards.columnId, schema_1.columns.id))
        .orderBy(schema_1.columns.order, (0, drizzle_orm_1.asc)(schema_1.cards.order));
    const columnMap = data.reduce(function (prev, curr) {
        const { card_ID, card_order, card_title, card_desc, column_order, column_name, column_ID, column_color, } = curr;
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
}));
app.get("/columns", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield db_1.db.select().from(schema_1.columns).orderBy((0, drizzle_orm_1.asc)(schema_1.columns.id));
        res.json(data);
    }
    catch (error) {
        console.log("🚀 ~ app.get ~ error:", error);
    }
}));
// TOOD: Ensure integrity for columnID and order.
// There should be no duplicates in order column for a particular user.
app.post("/columns", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, colorSpace = "red" } = req.body;
        const maxOrder = yield db_1.db.select({ max: (0, drizzle_orm_1.max)(schema_1.columns.order) }).from(schema_1.columns);
        (0, tiny_invariant_1.default)(maxOrder[0].max, "max order not found");
        const data = yield db_1.db
            .insert(schema_1.columns)
            .values({
            title,
            colorSpace,
            order: maxOrder[0].max + 1,
        })
            .returning();
        res.json(data);
    }
    catch (error) {
        console.error(error);
        res.json(error);
    }
}));
app.patch("/columns/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, colorSpace, order } = req.body;
        const { id } = req.params;
        const data = yield db_1.db
            .update(schema_1.columns)
            .set({ title, colorSpace, order })
            .where((0, drizzle_orm_1.eq)(schema_1.columns.id, Number(id)))
            .returning();
        res.json(data);
    }
    catch (error) {
        res.json(JSON.stringify(error));
    }
}));
app.delete("/columns/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const data = yield db_1.db
        .delete(schema_1.columns)
        .where((0, drizzle_orm_1.eq)(schema_1.columns.id, Number(id)))
        .returning();
    res.json(data);
}));
app.get("/cards", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allCards = yield db_1.db
        .select({
        title: schema_1.cards.title,
        id: schema_1.cards.id,
        columnName: schema_1.columns.title,
        order: schema_1.cards.order,
    })
        .from(schema_1.cards)
        .innerJoin(schema_1.columns, (0, drizzle_orm_1.eq)(schema_1.cards.columnId, schema_1.columns.id));
    res.json(allCards);
}));
app.get("/cards/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const card = yield db_1.db
        .select({
        title: schema_1.cards.title,
        id: schema_1.cards.id,
        order: schema_1.cards.order,
        description: schema_1.cards.description,
        column: schema_1.columns.title,
    })
        .from(schema_1.cards)
        .innerJoin(schema_1.columns, (0, drizzle_orm_1.eq)(schema_1.cards.columnId, schema_1.columns.id))
        .where((0, drizzle_orm_1.eq)(schema_1.cards.id, Number(id)));
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    res.json(card[0]);
}));
// TOOD: Ensure integrity for columnID and order.
// There should be no duplicates in order column for a particular column.
app.post("/cards", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, column: columnName, description = "" } = req.body;
    const [{ id }] = yield db_1.db
        .select({ id: schema_1.columns.id })
        .from(schema_1.columns)
        .where((0, drizzle_orm_1.eq)(schema_1.columns.title, columnName));
    const [{ val }] = yield db_1.db
        .select({ val: (0, drizzle_orm_1.max)(schema_1.cards.order) })
        .from(schema_1.cards)
        .where((0, drizzle_orm_1.eq)(schema_1.cards.columnId, id));
    const card = yield db_1.db
        .insert(schema_1.cards)
        .values({
        title,
        columnId: id,
        order: val ? val + 1 : 1,
        description,
    })
        .returning();
    res.json(card);
}));
// TOOD: Ensure integrity for columnID and order.
// There should be no duplicates in order column for a particular column.
app.patch("/cards/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const [{ c_id }] = yield db_1.db
            .select({ c_id: schema_1.columns.id })
            .from(schema_1.columns)
            .where((0, drizzle_orm_1.eq)(schema_1.columns.title, columnName));
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
    const card = yield db_1.db
        .update(schema_1.cards)
        .set(updates)
        .where((0, drizzle_orm_1.eq)(schema_1.cards.id, Number(id)))
        .returning();
    res.json(card);
}));
app.delete("/cards/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const card = yield db_1.db
        .delete(schema_1.cards)
        .where((0, drizzle_orm_1.eq)(schema_1.cards.id, Number(id)))
        .returning();
    res.json(card);
}));
app.listen(port, (err) => {
    if (err)
        return console.error(err);
    return console.log(`Server is listening on ${port}`);
});
