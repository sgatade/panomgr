const User = require("../src/models/users");

test('Test User', () => {
    console.log('testing');
});

test("Async test", (done) => {

    setTimeout(() => {
        expect(1).toBe(1);    
        done();
    }, 2000);
});