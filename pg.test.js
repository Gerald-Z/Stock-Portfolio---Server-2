const {authenticateUser, retrievePortfolio, createUser, updatePosition, deletePosition, deleteProfile, deleteTicker} = require('./pg.js');



describe('The Authentication Process is done correctly', () => {
    it('Authenticates the right credentials', async () => {
        authenticateUser("A User", "A Password").then(result => expect(result).toBe(true));
    });
    it('Rejects the wrong credentials', async () => {
        authenticateUser("Not A User", "Not A Password").then(result => expect(result).toBe(false));
    });
})




describe('The Portfolio Read Process is done correctly', () => {
    it('Provides the portfolio for the correct credentials', () => {
        retrievePortfolio("A User", "A Password").then(result => expect(result).not.toBe(false));

        const position_one = [{"shares_owned": "100", "total_cost": "1000", "total_value": "1000", "usernames": "A User"}];
        retrievePortfolio("A User", "A Password").then(result => expect(result).toEqual(expect.arrayContaining(position_one)));
    });
    it('Refuses to provide the portfolio for the incorrect credentials', () => {
        retrievePortfolio("Not A User", "Not A Password").then(result => expect(result).toBe(false));
    });
})


describe('The user Creation and Deletion processes work correctly', () => {
    it('A new user can be created if the username is not already used', async () => {
        await createUser("User_2", "Password_2").then(result => expect(result).toBe(true));
        await deleteProfile("User_2", "Password_2");
    });
    it('A new user cannot be created because the username is already used', () => {
        createUser("A User", "A Password").then(result => expect(result).toBe(false));
    });
})


describe('The Insert and Delete position processes work correctly', () => {
    it(`Inserting a new position works correctly`, async () => {
        await updatePosition("A User", "A Password", "Buy", "Ticker_Example", 10, 100, 100).then(result => expect(result).toBe(true));
        await deletePosition("A User", "A Password", "Ticker_Example").then(result => expect(result).toBe(true));;
    });
})


describe('The Position update processes work correctly', () => {
    it(`The order fails when a sell order greater than the currently owned shares is placed.`, async () => {
        await updatePosition("A User", "A Password", "Sell", "Ticker Not Owned", 10, 100, 100).then(result => expect(result).toBe(false));
    });
    it(`A buy order involving a pre-existing ticker succeeds.`, async () => {
        await updatePosition("A User", "A Password", "Buy", "Existing_Ticker", 10, 100, 100);
        await deletePosition("A User", "A Password", "Existing_Ticker").then(result => expect(result).toBe(true));
    });
    it(`A buy order involving a non-existing ticker succeeds.`, async () => {
        await updatePosition("A User", "A Password", "Buy", "Non_Existing_Ticker", 10, 100, 100);
        await deletePosition("A User", "A Password", "Non_Existing_Ticker").then(result => expect(result).toBe(true));
        await deleteTicker("Non_Existing_Ticker");
    });
    it(`A buy order involving a pre-existing ticker and position succeeds.`, async () => {
        await updatePosition("A User", "A Password", "Buy", "Non_Existing_Ticker", 1, 10, 10);
        await updatePosition("A User", "A Password", "Buy", "Non_Existing_Ticker", 10, 100, 100);
        const new_position = [{"shares_owned": "11", "total_cost": "110", "total_value": "110", "usernames": "A User"}];
        retrievePortfolio("A User", "A Password").then(result => expect(result).toEqual(expect.arrayContaining(new_position)));
        await deletePosition("A User", "A Password", "Non_Existing_Ticker").then(result => expect(result).toBe(true));
        await deleteTicker("Non_Existing_Ticker");
    });
    it(`A sell order involving a pre-existing ticker and position succeeds.`, async () => {
        await updatePosition("A User", "A Password", "Buy", "Non_Existing_Ticker", 1, 10, 10);
        await updatePosition("A User", "A Password", "Buy", "Non_Existing_Ticker", 10, 100, 100);
        await updatePosition("A User", "A Password", "Sell", "Non_Existing_Ticker", 1, 10, 10);
        
        const new_position = [{"shares_owned": "10", "total_cost": "100", "total_value": "100", "usernames": "A User"}];
        retrievePortfolio("A User", "A Password").then(result => expect(result).toEqual(expect.arrayContaining(new_position)));
        await deletePosition("A User", "A Password", "Non_Existing_Ticker").then(result => expect(result).toBe(true));
        await deleteTicker("Non_Existing_Ticker");
    });
})

