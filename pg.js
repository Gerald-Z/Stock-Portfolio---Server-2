const { Pool, Client } = require('pg');
 
require('dotenv').config();

 

const add_user_query = `INSERT INTO "Users" (usernames, passwords, user_id) VALUES('A User', 'A Password', 2)`;


const authenticateUser = async () => {
  const client = new Client({
    user: process.env.User,
    host: process.env.Host,
    database: process.env.Database_2,
    password: process.env.Password,
    port: 5432,
  })
  await client.connect();
  
  const result = await client.query(`SELECT * FROM "Users" WHERE usernames = 'A User'`);
  
  await client.end();
  if (result.rowCount > 0) {
    return true;
  } else {
    return false;
  }
}


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


const insertNewPosition = async (username, password, ticker, shares, cost, value) => {
  const client = new Client({
    user: process.env.User,
    host: process.env.Host,
    database: process.env.Database_2,
    password: process.env.Password,
    port: 5432,
  })
  await client.connect();
  




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


const deletePosition = async (username, password, ticker, shares, cost, value) => {

}

const deleteProfile = async (username, password) => {
  

}









const getDate = async () => {
  const client = new Client({
    user: process.env.User,
    host: process.env.Host,
    database: process.env.Database_2,
    password: process.env.Password,
    port: 5432,
  })
  
  await client.connect();
  
  await client.query(add_user_query);

  const date = await client.query('SELECT * FROM "Users"');
  
  await client.end();
  return date;
}

//retrievePortfolio('A User', 'A Password').then(result => console.log(result));
module.exports = {authenticateUser, retrievePortfolio};


                                  