const { Pool, Client } = require('pg');
 
require('dotenv').config();


// Returns the internal stock id given ticker. 
// Finished and Tested
const getTickerId = async (ticker) => {
  const client = new Client({
    user: process.env.User,
    host: process.env.Host,
    database: process.env.Database_2,
    password: process.env.Password,
    port: 5432,
  })
  await client.connect();
  
  const result = await client.query("".concat(`SELECT * FROM "Stock" WHERE ticker = '`, ticker, "'"));
  
  await client.end();
  return result.rows[0].stock_id;
}

// Returns the internal user id given ticker. 
// Finished and Untested
const getUserId = async (username, password) => {
  const client = new Client({
    user: process.env.User,
    host: process.env.Host,
    database: process.env.Database_2,
    password: process.env.Password,
    port: 5432,
  })
  await client.connect();
  
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
  const client = new Client({
    user: process.env.User,
    host: process.env.Host,
    database: process.env.Database_2,
    password: process.env.Password,
    port: 5432,
  })
  await client.connect();
  let response = await client.query(`SELECT MAX(user_id) FROM "Users"`);
  response = parseInt(response);
  response += 1;
  await client.end();
  return response;
}


// Returns a new id that is generated from the maximum stock_id of a table. 
// Finished and Untested 
const getNewStockId = async () => { 
  const client = new Client({
    user: process.env.User,
    host: process.env.Host,
    database: process.env.Database_2,
    password: process.env.Password,
    port: 5432,
  })
  await client.connect();
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
  const client = new Client({
    user: process.env.User,
    host: process.env.Host,
    database: process.env.Database_2,
    password: process.env.Password,
    port: 5432,
  })
  await client.connect();
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
  const client = new Client({
    user: process.env.User,
    host: process.env.Host,
    database: process.env.Database_2,
    password: process.env.Password,
    port: 5432,
  })
  await client.connect();
  
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
  const client = new Client({
    user: process.env.User,
    host: process.env.Host,
    database: process.env.Database_2,
    password: process.env.Password,
    port: 5432,
  })
  await client.connect();
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



// Checks to see if the ticker is already pres
const insertNewPosition = async (username, password, ticker, shares, cost, value) => {
  const client = new Client({
    user: process.env.User,
    host: process.env.Host,
    database: process.env.Database_2,
    password: process.env.Password,
    port: 5432,
  })
  await client.connect();
  
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


const updatePosition = async (username, password, ticker, shares, cost, value) => {

}




// Deletes from the user's portfolio the position with the provided ticker. 
// Finished. Untested.
// Exported.
const deletePosition = async (username, password, ticker) => {
  const authenticated = authenticateUser(username, password);
  if (authenticated) {
    const client = new Client({
        user: process.env.User,
        host: process.env.Host,
        database: process.env.Database_2,
        password: process.env.Password,
        port: 5432,
    })
    const ticker_id = getTickerId(ticker); 

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
      const client = new Client({
      user: process.env.User,
      host: process.env.Host,
      database: process.env.Database_2,
      password: process.env.Password,
      port: 5432,
    })
    await client.connect();
    await client.query("".concat("DELETE FROM 'Position' WHERE user_id = '", username, "'"));
    await client.query("".concat("DELETE FROM 'Users' WHERE user_id = '", username, "' AND password = '", password, "'"));
    await client.end();
  }
}





//retrievePortfolio('A User', 'A Password').then(result => console.log(result));
module.exports = {authenticateUser, retrievePortfolio, createUser, deletePosition, deleteProfile};


                                  