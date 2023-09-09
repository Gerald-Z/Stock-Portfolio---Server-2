The server, coded in the server.js file using Node.js and Express.js, will receive API calls using the /graphql endpoint. 
After that, the server.js file will use functions exported from pg.js to manipulate the local PostgreSQL database to create, read, update, or delete data related to users and their profiles.

The pg.js must export functions for the following purposes:

Create:
    Create a new user profile based on the username and password provided by the API call - createUser(username, password)

Read:
    Given a pair of credentials, return if they are valid or not - authenticateUser(username, password) 
    Given a pair of credentials, either return the correct portfolio if the credentials are correct or return a message if they are false - retrievePortfolio(username, password) 


Update:
    Given a pair of credentials and stock-related data, make the changes to the database if possible. Return a true/false based on if the change was successful. 
    Possibilities: 
        Selling stocks normally 
        Selling stocks that the user doesn't own
        Buying the first stocks in a position
        Buying stocks normally 




Delete:
    Delete a user profile - deleteProfile(username, password) 
    Delete a stock position - deletePosition(username, password, ticker) 

