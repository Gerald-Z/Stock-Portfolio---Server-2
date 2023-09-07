const {authenticateUser, retrievePortfolio, createUser, updatePosition, deletePosition, deleteProfile} = require('./pg.js');

test('Is Jest Running', () => {
    expect(1).toBe(1);
});

test('Required the number of shares the investor has for ticker', () => {
    expect(getShare("Investor", "GS")).toBe(1);
});


