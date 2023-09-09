const {authenticateUser, retrievePortfolio, createUser, updatePosition, deletePosition, deleteProfile} = require('./pg.js');


/*
test('Required the number of shares the investor has for ticker', () => {
    expect(getShare("Investor", "GS")).toBe(1);
});

*/


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

