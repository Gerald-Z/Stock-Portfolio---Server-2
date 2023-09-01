const { Pool, Client } = require('pg');
 
require('dotenv').config();



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


// Finished and Tested
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
  return result.rows[0].user_id;
}


// Finished. Untested.
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


// Finished. Untested.
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
    return true;
  } else {
    return false;
  }
}


// Unstarted
const createUser = async (username, password) => {
  const client = new Client({
    user: process.env.User,
    host: process.env.Host,
    database: process.env.Database_2,
    password: process.env.Password,
    port: 5432,
  })
  await client.connect();

  user_id = getUserId(username, password);


}




// WIP. 
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


// Finished. Untested.
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
  }
}


// Finished. Untested.
const deleteProfile = async (username, password) => {
    const client = new Client({
    user: process.env.User,
    host: process.env.Host,
    database: process.env.Database_2,
    password: process.env.Password,
    port: 5432,
  })
  await client.connect();
  await client.query("".concat("DELETE FROM 'Users' WHERE user_id = '", username, "' AND password = '", password, "'"));
}






//retrievePortfolio('A User', 'A Password').then(result => console.log(result));
module.exports = {authenticateUser, retrievePortfolio, deletePosition, deleteProfile};


                                  