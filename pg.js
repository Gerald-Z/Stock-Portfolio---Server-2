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

// Returns the number of shares username has for ticker. 
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

const getNewPositionId = async () => { 
  const client = await connectPg();
  let response = await client.query(`SELECT MAX(position_id) FROM "Position"`);
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

  const result = await client.query("".concat(`SELECT * FROM "Users" AS u WHERE u.usernames = '`, username, `' AND u.passwords = '`, password, "'"));
  
  await client.end();
 // await console.log(result);
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
    return result.rows;
  } else {
    return false;
  }
}


// Checks if a username already exists in the db. If it does, return false. Otherwise, create a new user profile with details.
// Finished. Untested. 
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

const addStock = async (username, password, ticker, client) => {
  const response = await client.query("".concat(
    `SELECT * FROM "Stock" WHERE ticker = '`, ticker, "';"));

    if (result.rowCount == 0) {
      const stock_id = getNewStockId();
      await client.query("".concat(
        `INSERT INTO "Stock" (ticker, stock_id) VALUES (`, 
        ticker, `, `, stock_id, `);`));    
    }

}

// Inserts a new position into the user's db. 
// Finished. Untested.
// Used in updatePosition()
const insertNewPosition = async (username, password, ticker, shares, cost, value) => {
  const client = await connectPg();
  
  const ticker_id = await getTickerId(ticker);
  const user_id = await getUserId(username, password);
  const position_id = await getNewPositionId();
  await addStock(username, password, ticker, client);

  await client.query("".concat(
    `INSERT INTO "Position" (user_id, position_id, stock_id, shares_owned, total_cost, total_value) VALUES (`, 
    user_id, `, `, position_id,  `, `, ticker_id,  `, `, shares,  `, `, cost,  `, `, value,  `);`));

  await client.end();
}


// Handles the purchase of shares. 
// Finished. Untested.
// Used in updatePosition()
const buyShare = async (username, password, ticker, shares, cost, value) => {
  const client = await connectPg();

  const ticker_id = await getTickerId(ticker);
  const user_id = await getUserId(username, password);
  const current = await client.query("".concat(`SELECT  FROM "Position" WHERE user_id = `, user_id, ' AND stock_id = ', ticker_id));

  let currentShare = current.rows[0].shares_owned + shares;
  let currentCost = current.rows[0].total_cost + cost;
  let currentValue = current.rows[0].total_value + value;

  await client.query("".concat(
    `UPDATE "Position"
    SET shares_owned = `, currentShare, `, total_cost = `, currentCost, ', total_value = ', currentValue,
    `WHERE user_id = `, user_id, `AND stock_id = `, ticker_id))

  await client.end();
}


// Handles the sale of shares. 
// Finished. Untested.
// Used in updatePosition()
const SellShare = async (username, password, ticker, shares, cost, value) => {
  const client = await connectPg();

  const ticker_id = await getTickerId(ticker);
  const user_id = await getUserId(username, password);
  const current = await client.query("".concat(`SELECT  FROM "Position" WHERE user_id = `, user_id, ' AND stock_id = ', ticker_id));

  let currentShare = current.rows[0].shares_owned - shares;
  let currentCost = current.rows[0].total_cost - cost;
  let currentValue = current.rows[0].total_value - value;

  await client.query("".concat(
    `UPDATE "Position"
    SET shares_owned = `, currentShare, `, total_cost = `, currentCost, ', total_value = ', currentValue,
    `WHERE user_id = `, user_id, `AND stock_id = `, ticker_id))

  await client.end();
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
    await insertNewPosition(username, password, ticker, shares, cost, value);
  } else if (order == "Sell") {
    await sellShare(username, password, ticker, shares, cost, value);
  } else if (order == "Buy") {
    await buyShare(username, password, ticker, shares, cost, value);
  }
  return true; 
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


                  