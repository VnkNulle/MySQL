import { Database } from "../src/database";
import { minutes } from "./utils";

describe("Queries Across Tables", () => {
    let db: Database;

    beforeAll(async () => {
        db = await Database.fromExisting("03", "04");
    }, minutes(1));

    it("should select count of apps which have free pricing plan", async done => {
        const query = `
        SELECT COUNT(*) AS count
        FROM 
        apps_pricing_plans AS app_pricing
        INNER JOIN pricing_plans AS pricing ON app_pricing.pricing_plan_id = pricing.id
        WHERE pricing.price = 'Free' OR pricing.price = 'Free to install';
        `;
        const result = await db.selectSingleRow(query);
        expect(result).toEqual({
            count: 1112
        });
        done();
    }, minutes(1));

    it("should select top 3 most common categories", async done => {
        const query = `SELECT
        c.title AS category,
        COUNT(ac.app_id) AS count
        FROM
        categories c
        INNER JOIN apps_categories ac ON c.id = ac.category_id
        GROUP BY
        category
        ORDER BY
        count DESC
        LIMIT 3;
    `;
        const result = await db.selectMultipleRows(query);
        expect(result).toEqual([
            { count: 1193, category: "Store design" },
            { count: 723, category: "Sales and conversion optimization" },
            { count: 629, category: "Marketing" }
        ]);
        done();
    }, minutes(1));

    it("should select top 3 prices by appearance in apps and in price range from $5 to $10 inclusive (not matters monthly or one time payment)", async done => {
        const query = `
        SELECT
        SUM(subquery.count) AS count,
        subquery.price,
        CAST(SUBSTR(subquery.price, 2) AS DECIMAL(10, 2)) AS casted_price
      FROM (
        SELECT
          MAX(apps_pricing_plans.pricing_plan_id) AS pricing_plan_id,
          COUNT(*) AS count,
          MAX(pricing_plans.price) AS price
        FROM APPS_PRICING_PLANS AS apps_pricing_plans
        JOIN PRICING_PLANS AS pricing_plans ON apps_pricing_plans.pricing_plan_id = pricing_plans.id
        WHERE
          CAST(SUBSTR(pricing_plans.price, 2) AS DECIMAL(10, 2)) BETWEEN 5 AND 10
        GROUP BY CAST(SUBSTR(pricing_plans.price, 2) AS DECIMAL(10, 2))
        ORDER BY count DESC
        LIMIT 3
      ) AS subquery
      GROUP BY subquery.price, casted_price
      ORDER BY count DESC
      LIMIT 3;
    `;

        const result = await db.selectMultipleRows(query);
        expect(result).toEqual([
            { count: 225, price: "$9.99/month", casted_price: 9.99 },
            { count: 135, price: "$5/month", casted_price: 5 },
            { count: 114, price: "$10/month", casted_price: 10 }
        ]);
        done();
    }, minutes(1));
});