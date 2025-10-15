// cypress/e2e/Exercise2/celestrakTests.cy.ts

describe("Celestrak.org API Tests", () => {
  const endpoint =
    "https://celestrak.org/NORAD/elements/gp.php?GROUP=last-30-days&FORMAT=json";

  // Função auxiliar para verificar se a data está dentro dos últimos 30 dias
  function isWithinLast30Days(epochString: string): boolean {
    const epochDate = new Date(epochString);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Subtrai 30 dias
    return epochDate >= thirtyDaysAgo && epochDate <= now;
  }

  it("TC2-1: Deve retornar dados na chamada a API", () => {
    cy.request(endpoint).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.not.be.empty;
    });
  });

  it("TC2-2: Deve retornar 204 quando não tem dados", () => {
    cy.intercept("GET", endpoint, { statusCode: 204, body: {} }).as(
      "noDataResponse"
    ); // Especifica o método GET
    cy.request(endpoint).then((response) => {
      cy.wait("@noDataResponse"); // Aguarda o intercept ser aplicado
      expect(response.status).to.eq(204); // Verifica o status
      expect(response.body).to.be.empty; // Verifica se o body está vazio
    });
  });

  it("TC2-3: Verificar se a data de EPOCH está dentro dos 30 dias", () => {
    cy.request(endpoint).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array").and.not.be.empty;
      response.body.forEach((object: any) => {
        expect(object.EPOCH).to.exist;
        expect(isWithinLast30Days(object.EPOCH)).to.be.true;
      });
    });
  });

  it("TC2-4: Deve verificar se EPOCH está fora dos 30 dias (usando mock)", () => {
    cy.intercept(endpoint, {
      statusCode: 200,
      body: [{ EPOCH: "2022-01-01T00:00:00" }],
    }).as("invalidEpoch"); // Data mais antiga
    cy.request(endpoint).then((response) => {
      cy.wait("@invalidEpoch"); // Aguarda o intercept
      expect(response.body[0]).to.exist; // Verifica se o objeto existe
      expect(isWithinLast30Days(response.body[0].EPOCH)).to.be.false; // Espera falhar
    });
  });

  it("TC2-5: Deve verificar se OBJECT_ID está no formato COSPAR_ID", () => {
    cy.request(endpoint).then((response) => {
      expect(response.status).to.eq(200);
      const pattern = /^(\d{4})-(\d{3})([A-Z]{1,3})$/;
      response.body.forEach((object: any) => {
        expect(object.OBJECT_ID).to.match(pattern);
      });
    });
  });

  it("TC2-6: Deve verificar se NORAD_CAT_ID tem exatamente 5 dígitos", () => {
    cy.request(endpoint).then((response) => {
      expect(response.status).to.eq(200);
      response.body.forEach((object: any) => {
        expect(object.NORAD_CAT_ID).to.match(/^\d{5}$/);
      });
    });
  });

  it("TC2-7: Deve verificar se NORAD_CAT_ID tem mais de 5 dígitos (usando mock)", () => {
    cy.intercept(endpoint, {
      statusCode: 200,
      body: [{ NORAD_CAT_ID: "123456" }],
    }).as("invalidNorad");
    cy.request(endpoint).then((response) => {
      cy.wait("@invalidNorad"); // Aguarda o intercept
      expect(response.body[0]).to.exist; // Verifica se o objeto existe
      expect(response.body[0].NORAD_CAT_ID).to.exist; // Verifica se NORAD_CAT_ID existe
      expect(response.body[0].NORAD_CAT_ID.length).to.be.greaterThan(5); // Espera falhar
    });
  });

  it("TC2-8: Deve verificar se NORAD_CAT_ID tem menos de 5 dígitos (usando mock)", () => {
    cy.intercept(endpoint, {
      statusCode: 200,
      body: [{ NORAD_CAT_ID: "123" }],
    }).as("invalidNorad");
    cy.request(endpoint).then((response) => {
      cy.wait("@invalidNorad"); // Aguarda o intercept
      expect(response.body[0]).to.exist; // Verifica se o objeto existe
      expect(response.body[0].NORAD_CAT_ID).to.exist; // Verifica se NORAD_CAT_ID existe
      expect(response.body[0].NORAD_CAT_ID.length).to.be.lessThan(5); // Espera falhar
    });
  });
});
