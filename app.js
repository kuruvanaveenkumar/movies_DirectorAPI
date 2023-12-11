const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

app.use(express.json());
let dataBase = null;

const initializeDbAndServer = async () => {
  try {
    dataBase = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};

initializeDbAndServer();

app.get("/movies/", async (request, response) => {
  const getQuery = `SELECT movie_name AS movieName FROM movie;`;
  const details = await dataBase.all(getQuery);
  response.send(details);
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addQuery = `INSERT INTO 
                       movie(director_id, movie_name, lead_actor)
                       VALUES('${directorId}', '${movieName}', '${leadActor}');`;
  const details = await dataBase.run(addQuery);
  response.send("Movie Successfully Added");
});

const convertData = (object) => {
  return {
    movieId: object.movie_id,
    directorId: object.director_id,
    movieName: object.movie_name,
    leadActor: object.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const getData = await dataBase.get(getQuery);
  response.send(convertData(getData));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;

  const updateQuery = `UPDATE 
                             movie
                           SET
                            director_id = '${directorId}',
                            movie_name = '${movieName}',
                            lead_actor = '${leadActor}'
                            WHERE
                            movie_id = ${movieId};`;
  const updateData = await dataBase.run(updateQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `DELETE FROM
                            movie
                        WHERE movie_id = ${movieId};`;
  await dataBase.run(deleteQuery);
  response.send("Movie Removed");
});

const convertDirectorsData = (object) => {
  return {
    directorId: object.director_id,
    directorName: object.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
                     SELECT * FROM director;
    `;
  const getDirectorsDetails = await dataBase.all(getDirectorsQuery);
  response.send(getDirectorsDetails.map((each) => convertDirectorsData(each)));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDMQuery = `SELECT
                            movie_name AS movieName
                          FROM
                          movie NATURAL JOIN
                          director
                          WHERE director.director_id = ${directorId};`;

  const getDMDetails = await dataBase.all(getDMQuery);
  response.send(getDMDetails);
});

module.exports = app;
