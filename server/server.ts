import express, { Request, Response } from "express";
import sql, { ConnectionPool, config as SQLConfig, IResult } from "mssql";
import fkill from "fkill";
import cors from "cors";
import net from "net";

const app = express();
app.use(express.static("public"));
app.use(cors());

const config: SQLConfig = {
  server: "KATSRV19",
  database: "KATEK_System",
  password: "#T34mBlu3Kdegr4?",
  user: "SYS_EXPORT_WEBQUERY",
  options: {
    enableArithAbort: true,
    encrypt: false,
  },
};

const sqlQuery = 'SELECT TOP 500 * FROM dbo.ProcessLOG';
const port = 3000;

let connection: ConnectionPool | undefined;

async function checkPortInUse(port: number): Promise<boolean> {

  return new Promise<boolean>((resolve, reject) => {

    const server = net.createServer();

    server.once("error", (err) => {

      if (err.message.includes("EADDRINUSE")) {

        resolve(true); // Port is in use
      } else {

        reject(err); // Other error occurred
      }
    });

    server.once("listening", () => {

      server.close(() => {

        resolve(false); // Port is available
      });
    });

    server.listen(port);
  });
}

async function startServer(): Promise<void> {

  try {

    const portInUse = await checkPortInUse(port);

    if (portInUse) {

      await fkill(`:${port}`, { force: true });
      console.log(`Processes on port ${port} terminated successfully.`);
    }

    connection = await sql.connect(config);

    console.log("Connected to the MSSQL database");
    app.listen(port, () => console.log(`Server started at localhost:${port}`));
  } 
  
  catch (error) {
    console.error("Failed to start the server:", error);
  }
}

startServer();

app.get("/load-fetch", async (req: Request, res: Response) => {
  try {
    const result: IResult<any> = await sql.query(sqlQuery);
    res.send(result.recordset);
  } catch (error) {
    console.error("Failed to execute SQL query:", error);
    res.status(500).send("Error fetching data from the database");
  }
});

app.get("/db-fetch", async (req: Request, res: Response) => {
  console.log(req.query);
  console.log(req.originalUrl);

  let dateQuery = "";
  let query = "";
  const keysToAvoid = ['firstDate', 'secondDate', 'dateOption', 'fullTableHeaders', 'limiter'];

  let sqlQueryParams: string[] = [];

  sqlQueryParams = Object.entries(req.query)
    .map(([key, value]) => {
      if (!keysToAvoid.includes(key)) return `[${key}]='${value}'`;
    })
    .filter((param) => param !== undefined) as string[];

  console.log(req.query.firstDate);
  console.log(req.query.secondDate);

  if (req.query.firstDate && req.query.secondDate) {
    const firstDateString = req.query.firstDate.toString().substring(0, 19);
    const secondDateString = req.query.secondDate.toString().substring(0, 19);

    dateQuery += `${req.query.dateOption} BETWEEN CONVERT(datetime, '${firstDateString}', 120) AND CONVERT(datetime, '${secondDateString}', 120)`;

    console.log(req.originalUrl);
    console.log(dateQuery);
  }

  if (sqlQueryParams.length === 0 && dateQuery !== "") {
    query =  `WHERE ${dateQuery}`;
    console.log(dateQuery);
  } else if (sqlQueryParams.length !== 0 && dateQuery === "") {
    query = `WHERE ${sqlQueryParams.join(" AND ")}`;
    console.log(dateQuery);
  } else if (sqlQueryParams.length !== 0 && dateQuery !== "") {
    query =  `WHERE ${dateQuery} AND ${sqlQueryParams.join(" AND ")}`;
    console.log(dateQuery);
  }

  // Properly handle the limiter parameter for pagination
  const limiter: number = parseInt(req.query.limiter as string, 10);

  if (isNaN(limiter) || limiter <= 0) {
    res.status(400).send("Invalid limiter value. Please provide a positive number.");
    return;
  }
    // Properly handle the limiter parameter for pagination
	const fullQuery = `
    WITH CTE AS (
      SELECT *, ROW_NUMBER() OVER (ORDER BY [tLogIn] DESC) AS RowNum
      FROM dbo.ProcessLOG
      ${query}
    )
    SELECT *
    FROM CTE
    WHERE RowNum BETWEEN 1 AND @limiter;
  `;

  try {
    const request = connection!.request();
    request.input("limiter", sql.Int, limiter);

    const result: IResult<any> = await request.query(fullQuery);
    res.send(result.recordset);
  } catch (error) {
    console.error("Failed to execute SQL query:", error);
    res.status(500).send("Error fetching data from the database");
  }
});