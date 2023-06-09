import USERS_TEST from "../constants/usersTest";

describe("Given an array of user emails", () => {
    describe("When checking the users array", () => {
        test("Then it should contain correct emails", () => {
            const expectedEmails = [
                "cedric.hiely@billed.com",
                "christian.saluzzo@billed.com",
                "jean.limbert@billed.com",
                "joanna.binet@billed.com",
            ];

            expect(USERS_TEST).toEqual(expectedEmails);
        });
    });
});
