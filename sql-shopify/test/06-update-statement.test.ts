import { Database } from "../src/database";
import { minutes } from "./utils";
import { selectRowById, selectReviewByAppIdAuthor, selectColumnFromTable } from "../src/queries/select";
import { APPS, CATEGORIES } from "../src/shopify-table-names";
import moment from "moment";

describe("Update Statements", () => {
    let db: Database;

    beforeAll(async () => {
        db = await Database.fromExisting("05", "06");
    }, minutes(1));

    it("should update one app title by app id", async (done) => {
        const app = await db.selectSingleRow(selectRowById(200, APPS));
        const newTitle = "New App Title";
        const query = `
            UPDATE ${APPS}
            SET title = '${newTitle}'
            WHERE id = 200;
        `;
        try {
            await db.execute(query);
        } catch (e) {
            console.log(e);
        }

        const row = await db.selectSingleRow(selectRowById(200, APPS));
        expect(row.title).toEqual(newTitle);
        done();
    }, minutes(1));

    it("should update review developer reply and developer reply date by app id and author", async (done) => {
        const timeStamp = moment().format("DD-MM-YYYY hh:mm");
        const review = await db.selectSingleRow(selectReviewByAppIdAuthor(24, "PLAYBOY"));
        const newReply = "test reply";
        const query = `
            UPDATE REVIEWS
            SET developer_reply = '${newReply}', developer_reply_date = '${timeStamp}'
            WHERE app_id = 24 AND author = 'PLAYBOY';
        `;
        try {
            await db.execute(query);
        } catch (e) {
            console.log(e);
        }

        const row = await db.selectSingleRow(selectReviewByAppIdAuthor(review.app_id, review.author));
        expect(row.developer_reply).toEqual(newReply);
        expect(row.developer_reply_date).toEqual(timeStamp);
        done();
    }, minutes(1));

    it("should update all categories to uppercase", async (done) => {
        const query = `
            UPDATE CATEGORIES
            SET title = UPPER(title);
        `;
        try {
            await db.execute(query);
        } catch (e) {
            console.log(e);
        }

        const rows = await db.selectMultipleRows(selectColumnFromTable("title", CATEGORIES));
        for (const row of rows) {
            if (row.title !== row.title.toUpperCase()) {
                throw new Error(`Title '${row.title}' is not in uppercase!`);
            }
        }
        done();
    }, minutes(1));
});
