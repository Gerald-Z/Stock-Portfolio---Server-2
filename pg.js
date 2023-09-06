const { Pool, Client } = require('pg');
 
require('dotenv').config();

// Connect to the postgreSQL database using the credentials in .env.
const connectPg = async () => {
  const client = new Client({
    user: process.env.User,
    host: process.env.Host,
    database: process.env.Database_2,
    password: process.env.Password,
    port: 5432,
  })
  await client.connect();
  return client;
}

// Returns the number of shares username as for ticker. 
// WIP (response may need to be modified). Untested. 
const getShare = async (username, ticker) => {
  const connect = await connectPg();

  const response = connect.query(
    "".concat(
      `SELECT p.shares_owned FROM "User" AS u 
      JOIN "Position" AS p 
      ON u.user_id = p.user_id
      JOIN "Stock" AS s
      ON p.stock_id = s.stock_id
      WHERE u.username=`, username, ` AND s.ticker=`, ticker)
  );

  return response;
}

// Returns the internal stock id given ticker. 
// Finished and Tested
const getTickerId = async (ticker) => {
  const client = await connectPg();
  
  const result = await client.query("".concat(`SELECT * FROM "Stock" WHERE ticker = '`, ticker, "'"));
  
  await client.end();
  return result.rows[0].stock_id;
}

// Returns the internal user id given ticker. 
// Finished and Untested
const getUserId = async (username, password) => {
  const client = await connectPg();

  
  const result = await client.query("".concat(`SELECT * FROM "Users" WHERE usernames = '`, username, `' AND passwords = '`, password, "'"));
  
  await client.end();
  if (result.rowCount > 0) {
    return result.rows[0].user_id;;
  } else {
    return -1;
  }
}

// Returns a new id that is generated from the maximum user_id of a table. 
// Finished and Untested 
const getNewUserId = async () => { 
  const client = await connectPg();
  let response = await client.query(`SELECT MAX(user_id) FROM "Users"`);
  response = parseInt(response);
  response += 1;
  await client.end();
  return response;
}


// Returns a new id that is generated from the maximum stock_id of a table. 
// Finished and Untested 
const getNewStockId = async () => { 
  const client = await connectPg();

  let response = await client.query(`SELECT MAX(stock_id) FROM "Stock"`);
  response = parseInt(response);
  response += 1;
  await client.end();
  return response;
}



// Checks if the username and the password match to a user already in the database.
// Finished. Untested.
// Exported. 
const authenticateUser = async (username, password) => {
  const client = await connectPg();

  const result = await client.query("".concat(`SELECT * FROM "Users" WHERE u.usernames = '`, username, `' AND u.passwords = '`, password, "'"));
  
  await client.end();
  if (result.rowCount > 0) {
    return true;
  } else {
    return false;
  }
}


// Checks if the username and the password match to a user already in the database. If so, return the portfolio. If not, returns 0.
// Finished. Untested.
// Exported. 
const retrievePortfolio = async (username, password) => {
  const client = await connectPg();
  const result = await client.query("".concat(`SELECT u.usernames, pos.shares_owned, pos.total_cost, pos.total_value FROM "Users" AS u
                                  JOIN "Position" AS pos
                                  ON u.user_id = pos.user_id
                                  WHERE u.usernames = '`, username, `' AND u.passwords = '`, password, "'"));
  
  await client.end();
  if (result.rowCount > 0) {
    return result;
  } else {
    return 0;
  }
}


// Checks if a username already exists in the db. If it does, return false. Otherwise, create a new user profile with details.
// Unfinished. 
// Exported. 
const createUser = async (username, password) => {
  const client = await connectPg();

  const user_id = await getUserId(username, password);
  if (user_id != -1) {
    return false;
  } else {
    const newId = getNewUserId();

    await client.query("".concat(`INSERT INTO "Users" (user_id, username, password) 
                        VALUES(`, newId, `, `, username, `, `, password, `)`));

    return true;
  }
}



const insertNewPosition = async (username, password, ticker, shares, cost, value) => {
  const client = await connectPg();
  
  ticker_id = getTickerId(ticker);
  user_id = getUserId(username, password);


  const result = await client.query(`SELECT * FROM "Users" WHERE usernames = 'A User'`);
  
  await client.end();
  if (result.rowCount > 0) {
    return true;
  } else {
    return false;
  }
}


const buyShare = async (username, password, ticker, shares, cost, value) => {

}


const SellShare = async (username, password, ticker, shares, cost, value) => {

}


// Given a pair of credentials and stock-related data, make the changes to the database if possible. 
//  Return a true/false based on if the change was successful. 
// WIP. Untested. 
// Exported. 
const updatePosition = async (username, password, order, ticker, shares, cost, value) => {
  const authenticated = await authenticateUser(username, password);
  if (!authenticated)  {
    return false;
  }
  const sharesOwned = await getShare(username, ticker);

  if (order == "Sell" & shares > sharesOwned) {
    return false;
  } else if (order == "Buy" & sharesOwned == 0) {
    return await insertNewPosition(username, password, ticker, shares, cost, value);
  } else if (order == "Sell") {
    return await sellShare(username, password, ticker, shares, cost, value);
  } else if (order == "Buy") {
    return await buyShare(username, password, ticker, shares, cost, value);
  }
}




// Deletes from the user's portfolio the position with the provided ticker. 
// Finished. Untested.
// Exported.
const deletePosition = async (username, password, ticker) => {
  const authenticated = authenticateUser(username, password);
  if (authenticated) {
    const client = await connectPg();

    await client.connect();
    await client.query("".concat("DELETE FROM 'Position' WHERE stock_id = ", ticker_id));
    await client.end();
  }
}


// Deletes from the database the profile of the user and all associated data. 
// Finished. Untested.
// Exported.
const deleteProfile = async (username, password) => {
    const authenticated = authenticateUser(username, password);
    if (authenticated) {
      const client = await connectPg();

      await client.query("".concat("DELETE FROM 'Position' WHERE user_id = '", username, "'"));
      await client.query("".concat("DELETE FROM 'Users' WHERE user_id = '", username, "' AND password = '", password, "'"));
      await client.end();
  }
}

//retrievePortfolio('A User', 'A Password').then(result => console.log(result));
module.exports = {authenticateUser, retrievePortfolio, createUser, updatePosition, deletePosition, deleteProfile};


                                  