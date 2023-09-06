The server, coded in the server.js file using Node.js and Express.js, will receive API calls using the /graphql endpoint. 
After that, the server.js file will use functions exported from pg.js to manipulate the local PostgreSQL database to create, read, update, or delete data related to users and their profiles.

The pg.js must export functions for the following purposes:

Create:
    Create a new user profile based on the username and password provided by the API call.
    Create new stock positions for a certain user. 

Read:
    Given a pair of credentials, either return the correct portfolio if the credentials are correct or return a message if they are false. 


Update:



Delete:
    Delete a user profile.
    Delete a stock position 

