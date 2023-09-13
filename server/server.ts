import express, { Request, Response } from "express";
import sql, { ConnectionPool, config as SQLConfig, IResult } from "mssql";
import bodyParser from "body-parser";
import fkill from "fkill";
import cors from "cors";
import net from "net";

const app = express();

app.use(express.static("public"));
app.use(cors());

const config: SQLConfig = {
  server: "10.180.10.65",
  database: "KATEK_System",
  password: "#T34mBlu3Kdegr4?",
  user: "SYS_EXPORT_WEBQUERY",
  options: {
    enableArithAbort: true,
    encrypt: false,
  },
};

const sqlQuery = 'SELECT * FROM dbo.ProcessLog';
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
    app.listen(port, () => console.log(`Succesfully started on:${port}`));
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

  let dateQuery = "";
  let query = "";
  const keysToAvoid = ['firstDate', 'secondDate', 'dateOption', 'fullTableHeaders', 'limiter'];

  let sqlQueryParams: string[] = [];

  sqlQueryParams = Object.entries(req.query)
    .map(([key, value]) => {
      if (!keysToAvoid.includes(key)) return `[${key}]='${value}'`;
    })
    .filter((param) => param !== undefined) as string[];

  if (req.query.firstDate && req.query.secondDate) {
    const firstDateString = req.query.firstDate.toString().substring(0, 19);
    const secondDateString = req.query.secondDate.toString().substring(0, 19);

    dateQuery += `${req.query.dateOption} BETWEEN CONVERT(datetime, '${firstDateString}', 120) AND CONVERT(datetime, '${secondDateString}', 120)`;
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

import ActiveDirectory from "activedirectory2";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ad = new ActiveDirectory({
  url: 'ldap://srv01-dc10.katek.int:389',
  baseDN: 'CN=Gruppe-PT,OU=KATEKGruppen,DC=katek,DC=int',
  username: '',
  password: ''
});

app.post('/login', async(req, res) => {

  try {

    console.log(req.body);

    /*const {username, password} = req.body;
    console.log(req.body);
    console.log(username, password);

    // Check if username and password are provided
    if (!username || !password) {

      res.status(400).send('Username and password are required');

      return;
    }

    // Attempt authentication
    ad.authenticate(username, password, (err, auth) => {

      if (err) {

        console.error('Error during authentication:', err);
        res.status(500).send('Internal Server Error');
        return;

      }

      if (auth) {

        // Assuming 'GroupA' is a valid group in your Active Directory
        ad.isUserMemberOf(username, 'Gruppe-PT', (err, isMember) => {

          if (err) {

            console.error('Error during group membership check:', err);
            res.status(500).send('Internal Server Error');

            return;
          }

          if (isMember) {

            res.status(200).send('Successful login');
          } 
          
          else {

            res.status(403).send('Access Denied');
          }
        });
      } 
      
      else {

        res.status(401).send('Unauthorized');
      }
    });*/
  } 
  
  catch (error) {

    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});


