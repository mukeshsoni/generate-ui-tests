describe("Interaction test 1", () => {
  it("should pass", () => {
    cy.visit("/")
    cy.get('[data-test-id="input_to_test"]').type("a")
    cy.get('[data-test-id="input_to_test"]').type("{enter}")
    cy.get('[data-test-id="input_to_test"]').type("b")
    cy.get('[data-test-id="input_to_test"]').type("{enter}")
    cy.get('[data-test-id="input_to_test"]').type("c")
    cy.get('[data-test-id="input_to_test"]').type("{enter}")
    cy
      .get('[data-test-id="src_todoitem_test_id_2"]')
      .eq(1)
      .check()
    cy
      .get('[data-test-id="src_todoitem_test_id_2"]')
      .eq(0)
      .check()
    cy.get('[data-test-id="src_footer_test_id_5"]').click()
    cy.get('[data-test-id="src_footer_test_id_4"]').click()
    cy.get('[data-test-id="src_footer_test_id_3"]').click()
    cy
      .get('[data-test-id="src_todoitem_test_id_2"]')
      .eq(1)
      .uncheck()
  })
})
