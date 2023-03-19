describe("smoke tests", () => {
    afterEach(() => {
        // cy.cleanupUser();
    });

    it("should allow user to add a dataset to the default workspace", () => {

        cy.viewport("macbook-16");

        cy.visitAndCheck("/");

        cy.findByRole("link", { name: /default workspace/i }).click();
        cy.findByRole("link", { name: /new dataset/i }).click();

        cy.wait(200);

        cy.get("#input-for-dataset-name").type("a dataset 123");
        cy.get("#select-for-dataset-type").select("Sqlite");
        cy.get("#input-for-dataset-connection").type("./fixtures/foobar.db");

        cy.findByRole("button", { name: /add dataset/i }).click();

        cy.wait(200);

        cy.findByRole("link", { name: /a dataset 123/i }).click();

    });
});
