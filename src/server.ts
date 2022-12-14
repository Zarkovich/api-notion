require("dotenv").config();
import { Client } from "@notionhq/client";
import Express from "express";

interface ThingToLearn {
    description: string | null;
    image: string | null;
    title: string | null;
    link: string | null;
}

const notionToken = process.env.NOTION_TOKEN;
const notionDatabase = process.env.NOTION_DATABASE_ID;

if (!notionToken || !notionDatabase) {
    throw Error("Não existe TOKEN");
}

const notion = new Client({
    auth: notionToken,
});

const app = Express();
const PORT = process.env.PORT || 8080;

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

app.get("/", async (req, res) => {
    const query = await notion.databases.query({
        database_id: notionDatabase,
    });

    const list: ThingToLearn[] = query.results.map((row) => {
        const descriptionCell = row.properties.description;
        const imageCell = row.properties.image;
        const titleCell = row.properties.title;
        const linkCell = row.properties.link;

        const isdescription = descriptionCell.type === "rich_text";
        const isimage = imageCell.type === "url";
        const istitle = titleCell.type === "title";
        const isLink = linkCell.type === "url";

        if (isdescription && isimage && istitle && isLink) {
            const description = descriptionCell.rich_text[0]
                ? descriptionCell.rich_text[0].plain_text
                : null;
            const image = imageCell.url ?? "";
            const link = linkCell.url ?? "";
            const title = titleCell.title[0]
                ? titleCell.title[0].plain_text
                : null;

            return { description, image, title, link };
        }
        return { description: null, image: "", title: null, link: "" };
    });

    res.send(list);
});

app.listen(PORT, () => {
    console.log(`O servidor on http://localhost:${PORT}`);
});
