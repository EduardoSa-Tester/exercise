// cypress/e2e/spaceObjectTests.cy.ts
describe("Testes da API de Satélites", () => {
  const baseUrl =
    "https://neuraspacedummyrsoapiappservicelinux-hyayfbdrg3gea6fd.westeurope-01.azurewebsites.net";
  const endpoint = "/api/space-objects"; // O caminho da API, confirme no Swagger

  // Função auxiliar para criar os dados básicos
  const getBasePayload = () => ({
    cosparId: "2023-001",
    noradId: "12345",
    name: "Test Satellite",
    objectType: "Payload",
    launchCountry: "USA",
    launchDate: "2023-12-08",
    launchSite: "Kennedy",
    decay: "2024-12-08",
    period: 90.5,
    inclination: 45.0,
    apogee: 400.0,
    perigee: 300.0,
    launchMass: 5000,
    dryMass: 4500,
  });

  it("TC01 - Criar objeto com dados válidos", () => {
    const validPayload = getBasePayload();

    cy.request({
      method: "POST",
      url: `${baseUrl}${endpoint}`,
      headers: { "Content-Type": "application/json" },
      body: validPayload,
    }).then((response) => {
      expect(response.status).to.eq(201); // Espera status 201 para sucesso
    });
  });

  it("TC02 - Dados inválidos: CosparId não é ano + 3 dígitos", () => {
    const invalidPayload = {
      ...getBasePayload(),
      cosparId: "Invalid-123",
    };

    cy.request({
      method: "POST",
      url: `${baseUrl}${endpoint}`,
      failOnStatusCode: false,
      headers: { "Content-Type": "application/json" },
      body: invalidPayload,
    }).then((response) => {
      expect(response.status).to.eq(400); // Espera erro 400
    });
  });

  it("TC03 - Dados inválidos: NoradId não tem exatamente 5 dígitos", () => {
    const invalidPayload = {
      ...getBasePayload(),
      noradId: "123",
    };

    cy.request({
      method: "POST",
      url: `${baseUrl}${endpoint}`,
      failOnStatusCode: false,
      headers: { "Content-Type": "application/json" },
      body: invalidPayload,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it("TC04 - Dados inválidos: ObjectType não é um valor permitido", () => {
    const invalidPayload = {
      ...getBasePayload(),
      objectType: "InvalidType",
    };

    cy.request({
      method: "POST",
      url: `${baseUrl}${endpoint}`,
      failOnStatusCode: false,
      headers: { "Content-Type": "application/json" },
      body: invalidPayload,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it("TC05 - Dados inválidos: Formato de launchDate incorreto", () => {
    const invalidPayload = {
      ...getBasePayload(),
      launchDate: "2023-12-08T04:06:32.929Z",
    };

    cy.request({
      method: "POST",
      url: `${baseUrl}${endpoint}`,
      failOnStatusCode: false,
      headers: { "Content-Type": "application/json" },
      body: invalidPayload,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it("TC06 - Dados inválidos: Valor negativo para campos positivos", () => {
    const invalidPayload = {
      ...getBasePayload(),
      period: -10,
    };

    cy.request({
      method: "POST",
      url: `${baseUrl}${endpoint}`,
      failOnStatusCode: false,
      headers: { "Content-Type": "application/json" },
      body: invalidPayload,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it("TC07 - Dados inválidos: Formato de decay incorreto", () => {
    const invalidPayload = {
      ...getBasePayload(),
      decay: "2024-12-08T10:00:00", // Formato inválido
    };

    cy.request({
      method: "POST",
      url: `${baseUrl}${endpoint}`,
      failOnStatusCode: false,
      headers: { "Content-Type": "application/json" },
      body: invalidPayload,
    }).then((response) => {
      expect(response.status).to.eq(400); // Espera erro 400
    });
  });

  it("TC08 - Dados inválidos: LaunchMass com valor negativo", () => {
    const invalidPayload = {
      ...getBasePayload(),
      launchMass: -5000, // Deve ser positivo
    };

    cy.request({
      method: "POST",
      url: `${baseUrl}${endpoint}`,
      failOnStatusCode: false,
      headers: { "Content-Type": "application/json" },
      body: invalidPayload,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it("TC09 - Dados inválidos: Period com valor zero", () => {
    const invalidPayload = {
      ...getBasePayload(),
      period: 0, // Deve ser positivo (maior que zero)
    };

    cy.request({
      method: "POST",
      url: `${baseUrl}${endpoint}`,
      failOnStatusCode: false,
      headers: { "Content-Type": "application/json" },
      body: invalidPayload,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });
});
