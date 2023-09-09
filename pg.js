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
const getShare = async (username, ticker) => {
  const connect = await connectPg();

  const response = await connect.query(
    "".concat(
      `SELECT p.shares_owned FROM "Users" AS u 
      JOIN "Position" AS p 
      ON u.user_id = p.user_id
      JOIN "Stock" AS s
      ON p.stock_id = s.stock_id
      WHERE u.usernames= '`, username, `' AND s.ticker= '`, ticker, "'")
  );
  await connect.end();
  if (response.rowCount > 0) {
    return response.rows[0].shares_owned;
  } else {
    return 0;
  }
}


// Returns the internal stock id given ticker. 
const getTickerId = async (ticker) => {
  const client = await connectPg();
  const result = await client.query("".concat(`SELECT * FROM "Stock" WHERE ticker = '`, ticker, "'"));
  
  await client.end();
  if (result.rowCount > 0) {
    return result.rows[0].stock_id;
  } else {
    const new_id = await addStock(ticker);
    return new_id;
  }
}

// Returns the internal user id given ticker. 
const getUserId = async (username, password) => {
  const client = await connectPg();
  const result = await client.query("".concat(`SELECT * FROM "Users" WHERE usernames = '`, username, `' AND passwords = '`, password, "'"));
  await client.end();
  if (result.rowCount > 0) {
    return result.rows[0].user_id;
  } else {
    return -1;
  }
}


// Returns a new id that is generated from the maximum user_id of a table. 
const getNewUserId = async () => { 
  const client = await connectPg();
  let response = await client.query(`SELECT MAX(user_id) FROM "Users"`);
  let max = response.rows[0].max;
  max += 1;
  await client.end();
  return max;
}


// Returns a new id that is generated from the maximum stock_id of a table. 
const getNewStockId = async () => { 
  const client = await connectPg();

  let response = await client.query(`SELECT MAX(stock_id) FROM "Stock"`);
  let max = response.rows[0].max;
  max += 1;
  await client.end();
  return max;
}

// Returns a new id that is generated from the maximum position_id of a table. 
const getNewPositionId = async () => { 
  const client = await connectPg();
  let response = await client.query(`SELECT MAX(position_id) FROM "Position"`);
  let max = response.rows[0].max;
  max += 1;
  await client.end();
  return max;
}


// Checks if the username and the password match to a user already in the database.
// Exported.
const authenticateUser = async (username, password) => {
  const client = await connectPg();
  const result = await client.query("".concat(`SELECT * FROM "Users" AS u WHERE u.usernames = '`, username, `' AND u.passwords = '`, password, "'"));
  await client.end();
  if (result.rowCount > 0) {
    return true;
  } else {
    return false;
  }
}


// Checks if the username and the password match to a user already in the database. If so, return the portfolio. If not, returns 0.
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
// Exported. 
const createUser = async (username, password) => {
    
  const client = await connectPg();

  const user_id = await getUserId(username, password);
  if (user_id != -1) {
    await client.end();
    return false;
  } else {
    const newId = await getNewUserId();
    await client.query("".concat(`INSERT INTO "Users" (user_id, usernames, passwords) 
                        VALUES(`, newId, `, '`, username, `', '`, password, `')`));
    await client.end();
    return true;
  }
}

const addStock = async (ticker) => {
  const client = await connectPg();
  const new_id = await getNewStockId();
  await client.query("".concat(
    `INSERT INTO "Stock" (ticker, stock_id) VALUES ('`, ticker, `', `, new_id, `);`
    )
  );
  await client.end();
  return new_id;

}

// Inserts a new position into the user's db. 
// Used in updatePosition()
const insertNewPosition = async (username, password, ticker, shares, cost, value) => {
  const client = await connectPg();
  
  const ticker_id = await getTickerId(ticker);
  const user_id = await getUserId(username, password);
  const position_id = await getNewPositionId();

  const res = await client.query("".concat(
    `INSERT INTO "Position" (user_id, position_id, stock_id, shares_owned, total_cost, total_value) VALUES (`, 
    user_id, `, `, position_id,  `, `, ticker_id,  `, `, shares,  `, `, cost,  `, `, value,  `);`));
  await client.end();
  if (res.rowCount > 0) {
    return true;
  } else {
    return false;
  }
}


// Handles the purchase of shares. 
// Used in updatePosition()
const buyShare = async (username, password, ticker, shares, cost, value) => {
  const ticker_id = await getTickerId(ticker);
  const user_id = await getUserId(username, password);
  const client = await connectPg();
  const current = await client.query("".concat(`SELECT * FROM "Position" WHERE user_id = `, user_id, ' AND stock_id = ', ticker_id));

  let currentShare = parseFloat(current.rows[0].shares_owned) + shares;
  let currentCost = parseFloat(current.rows[0].total_cost) + cost;
  let currentValue = parseFloat(current.rows[0].total_value) + value;

  await client.query("".concat(
    `UPDATE "Position"
    SET shares_owned = '`, currentShare, `', total_cost = '`, currentCost, `', total_value = '`, currentValue, `'`,
    `WHERE user_id = `, user_id, ` AND stock_id = `, ticker_id));

  await client.end();
}



// Handles the sale of shares. 
// Used in updatePosition()
const sellShare = async (username, password, ticker, shares, cost, value) => {
  const ticker_id = await getTickerId(ticker);
  const user_id = await getUserId(username, password);
  const client = await connectPg();
  const current = await client.query("".concat(`SELECT * FROM "Position" WHERE user_id = `, user_id, ' AND stock_id = ', ticker_id));

  let currentShare = parseFloat(current.rows[0].shares_owned) - shares;
  let currentCost = parseFloat(current.rows[0].total_cost) - cost;
  let currentValue = parseFloat(current.rows[0].total_value) - value;

  await client.query("".concat(
    `UPDATE "Position"
    SET shares_owned = '`, currentShare, `', total_cost = '`, currentCost, `', total_value = '`, currentValue, `'`,
    `WHERE user_id = `, user_id, ` AND stock_id = `, ticker_id));

  await client.end();
}


// Given a pair of credentials and stock-related data, make the changes to the database if possible. 
//  Return a true/false based on if the change was successful. 
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
    const success = await insertNewPosition(username, password, ticker, shares, cost, value);
    return success;
  } else if (order == "Sell") {
    await sellShare(username, password, ticker, shares, cost, value);
    return true;
  } else if (order == "Buy") {
    await buyShare(username, password, ticker, shares, cost, value);
    return true;
  }
}


// Deletes from the user's portfolio the position with the provided ticker. 
// Exported.
const deletePosition = async (username, password, ticker) => {
  const authenticated = await authenticateUser(username, password);
  if (authenticated) {
    const deleteId = await getTickerId(ticker);
    const userId = await getUserId(username, password);
    const client = await connectPg();
    await client.query("".concat(`DELETE FROM "Position" WHERE stock_id = `, deleteId, " AND user_id = ", userId));
    await client.end();
    return true;
  } else {
    return false;
  }
}

// Deletes the ticker from the database. Used for testing. 
const deleteTicker = async (ticker) => {
    const deleteId = await getTickerId(ticker);
    console.log(deleteId);
    const client = await connectPg();

    await client.query("".concat(`DELETE FROM "Stock" WHERE stock_id = `, deleteId));
    await client.end();
}


// Deletes from the database the profile of the user and all associated data. 
// Exported.
const deleteProfile = async (username, password) => {
    const authenticated = authenticateUser(username, password);
    if (authenticated) {
      const id = await getUserId(username, password);
      const client = await connectPg();
      await client.query("".concat(`DELETE FROM "Position" WHERE user_id = `, id));
      await client.query("".concat(`DELETE FROM "Users" WHERE user_id = `, id));
      await client.end();
  }
}

module.exports = {authenticateUser, retrievePortfolio, createUser, updatePosition, deletePosition, deleteProfile, deleteTicker};