const {authenticateUser, retrievePortfolio, createUser, updatePosition, deletePosition, deleteProfile} = require('./pg.js');

test('Is Jest Running', () => {
    expect(1).toBe(1);
});

/*
test('Required the number of shares the investor has for ticker', () => {
    expect(getShare("Investor", "GS")).toBe(1);
});

*/


test('Authenticates the right credentials', () => {
    expect(authenticateUser("Investor", "Password")).toBe(true);
});

test('Rejects the wrong credentials', () => {
    expect(authenticateUser("Not Investor", "Not Password")).toBe(false);
});

test('Retrieves the portfolio for the right credentials', () => {
    expect(retrievePortfolio("Investor", "Password")).toBe(true);
});