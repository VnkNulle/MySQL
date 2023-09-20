import { Database } from "../src/database";
import { minutes } from "./utils";

describe("Queries Across Tables", () => {
  let db: Database;

  beforeAll(async () => {
    db = await Database.fromExisting("06", "07");
  }, minutes(3));

  it(
    "should select top three directors ordered by total budget spent in their movies",
    async (done) => {
      const query = `
      SELECT d.full_name AS director, ROUND(SUM(m.budget_adjusted),2) AS total_budget
      FROM DIRECTORS d
      JOIN MOVIE_DIRECTORS md ON d.id = md.director_id
      JOIN MOVIES m ON md.movie_id = m.id
      GROUP BY d.full_name
      ORDER BY total_budget DESC
      LIMIT 3; 
      `;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          director: "Ridley Scott",
          total_budget: 722882143.58,
        },
        {
          director: "Michael Bay",
          total_budget: 518297522.1,
        },
        {
          director: "David Yates",
          total_budget: 504100108.5,
        },
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select top 10 keywords ordered by their appearance in movies",
    async (done) => {
      const query = `
      SELECT k.keyword, COUNT(*) AS count
      FROM KEYWORDS k
      JOIN MOVIE_KEYWORDS mk ON k.id = mk.keyword_id
      GROUP BY k.keyword
      ORDER BY count DESC
      LIMIT 10
      `;

      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          keyword: "woman director",
          count: 162,
        },
        {
          keyword: "independent film",
          count: 115,
        },
        {
          keyword: "based on novel",
          count: 85,
        },
        {
          keyword: "duringcreditsstinger",
          count: 82,
        },
        {
          keyword: "biography",
          count: 78,
        },
        {
          keyword: "murder",
          count: 66,
        },
        {
          keyword: "sex",
          count: 60,
        },
        {
          keyword: "revenge",
          count: 51,
        },
        {
          keyword: "sport",
          count: 50,
        },
        {
          keyword: "high school",
          count: 48,
        },
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select all movies called Life and return the number of actors",
    async (done) => {
      const query = `
        SELECT m.original_title, COUNT(DISTINCT a.full_name) AS count
        FROM movies m
        JOIN movie_actors ma ON m.id = ma.movie_id
        JOIN actors a ON ma.actor_id = a.id
        WHERE m.original_title = 'Life'
        GROUP BY m.original_title;
      `;
      const result = await db.selectSingleRow(query);

      expect(result).toEqual({
        original_title: "Life",
        count: 12,
      });

      done();
    },
    minutes(3)
  );

  it(
    "should select three genres which have the most ratings with 5 stars",
    async (done) => {
      const query = `
      SELECT g.genre, COUNT(*) AS five_stars_count
      FROM MOVIE_RATINGS mr
      JOIN MOVIES m ON mr.movie_id = m.id
      JOIN MOVIE_GENRES mg ON m.id = mg.movie_id
      JOIN GENRES g ON mg.genre_id = g.id
      WHERE mr.rating = 5
      GROUP BY g.genre
      ORDER BY five_stars_count DESC
      LIMIT 3;
      
      `;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          genre: "Drama",
          five_stars_count: 15052,
        },
        {
          genre: "Thriller",
          five_stars_count: 11771,
        },
        {
          genre: "Crime",
          five_stars_count: 8670,
        },
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select top three genres ordered by average rating",
    async (done) => {
      const query = `
      SELECT g.genre, ROUND(AVG(mr.rating), 2) AS avg_rating
      FROM MOVIE_RATINGS mr
      JOIN MOVIES m ON mr.movie_id = m.id
      JOIN MOVIE_GENRES mg ON m.id = mg.movie_id
      JOIN GENRES g ON mg.genre_id = g.id
      GROUP BY g.genre
      ORDER BY avg_rating DESC
      LIMIT 3;
      `;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          genre: "Crime",
          avg_rating: 3.79,
        },
        {
          genre: "Music",
          avg_rating: 3.73,
        },
        {
          genre: "Documentary",
          avg_rating: 3.71,
        },
      ]);

      done();
    },
    minutes(3)
  );
});
