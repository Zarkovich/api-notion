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
require("dotenv").config();
const client_1 = require("@notionhq/client");
const express_1 = __importDefault(require("express"));
const notionToken = process.env.NOTION_TOKEN;
const notionDatabase = process.env.NOTION_DATABASE_ID;
if (!notionToken || !notionDatabase) {
    throw Error("Não existe TOKEN");
}
const notion = new client_1.Client({
    auth: notionToken,
});
const app = (0, express_1.default)();
const PORT = 8000;
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = yield notion.databases.query({
        database_id: notionDatabase,
    });
    const list = query.results.map((row) => {
        var _a;
        const descriptionCell = row.properties.description;
        const imageCell = row.properties.image;
        const titleCell = row.properties.title;
        const isdescription = descriptionCell.type === "rich_text";
        const isimage = imageCell.type === "url";
        const istitle = titleCell.type === "title";
        if (isdescription && isimage && istitle) {
            const description = descriptionCell.rich_text[0]
                ? descriptionCell.rich_text[0].plain_text
                : null;
            const image = (_a = imageCell.url) !== null && _a !== void 0 ? _a : "";
            const title = titleCell.title[0]
                ? titleCell.title[0].plain_text
                : null;
            return { description, image, title };
        }
        return { description: null, image: "", title: null };
    });
    res.send(list);
}));
app.listen(PORT, () => {
    console.log(`O servidor on http://localhost:${PORT}`);
});
