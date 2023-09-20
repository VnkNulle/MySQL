import _ from "lodash";
import { Database } from "../src/database";
import { selectRowById } from "../src/queries/select";
import { minutes } from "./utils";
import { CATEGORIES, PRICING_PLANS, APPS, APPS_PRICING_PLANS } from "../src/shopify-table-names";

describe("Foreign Keys", () => {
    let db: Database;

    beforeAll(async () => {
        db = await Database.fromExisting("04", "05");
        await db.execute("PRAGMA foreign_keys = ON");
    }, minutes(1));

    it("should not be able to delete category if any app is linked", async (done) => {
      const categoryId = 6;
      const categoryQuery = `DELETE FROM ${CATEGORIES} WHERE id = ${categoryId}`;
      const appsCategoryQuery = `SELECT * FROM APPS_CATEGORIES WHERE category_id = ${categoryId}`;
  
      try {
        await db.execute(categoryQuery);
        const appsCategoriesRow = await db.selectSingleRow(appsCategoryQuery);
        const categoryRow = await db.selectSingleRow(
          selectRowById(categoryId, CATEGORIES)
        );
  
        expect(categoryRow).toBeDefined();
        expect(appsCategoriesRow).toBeDefined();
      } catch (e) {
      }
      done();
    }, minutes(1));
    

    it("should not be able to delete pricing plan if any app is linked", async (done) => {
      const pricingPlanId = 100;
      const pricingPlanQuery = `DELETE FROM ${PRICING_PLANS} WHERE id = ${pricingPlanId}`;
      const appsPricingPlansQuery = `SELECT * FROM APPS_PRICING_PLANS WHERE pricing_plan_id = ${pricingPlanId}`;
  
      try {
        await db.execute(pricingPlanQuery);
        const appsPricingPlansRow = await db.selectSingleRow(appsPricingPlansQuery);
        const pricingPlanRow = await db.selectSingleRow(
          selectRowById(pricingPlanId, PRICING_PLANS)
        );
  
        expect(pricingPlanRow).toBeDefined();
        expect(appsPricingPlansRow).toBeDefined();
      } catch (e) {
      }
  
      done();
    }, minutes(1));

    it("should not be able to delete app if any data is linked", async (done) => {
      const appId = 245;
      const appQuery = `DELETE FROM ${APPS} WHERE id = ${appId}`;
      const reviewsQuery = `SELECT * FROM REVIEWS WHERE app_id = ${appId}`;
  
      try {
        await db.execute(appQuery);
        const reviewsRow = await db.selectSingleRow(reviewsQuery);
        const appRow = await db.selectSingleRow(selectRowById(appId, APPS));
  
        expect(appRow).toBeDefined();
        expect(reviewsRow).toBeDefined();
      } catch (e) {
      }
  
      done();
    }, minutes(1));
  

  it("should be able to delete app", async (done) => {
    const id = 355;
    const query = `
        DELETE FROM ${APPS} WHERE id = ${id};
    `;

    try {
      await db.execute(query);
    } catch (e) {}

    const rows = await db.selectSingleRow(selectRowById(id, APPS));
    expect(rows).toBeUndefined();

    done();
  }, minutes(1));
});