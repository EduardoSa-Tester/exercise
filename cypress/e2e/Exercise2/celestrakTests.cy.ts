describe("Testes API Celestrak.org", () => {
  const endpoint =
    "https://celestrak.org/NORAD/elements/gp.php?GROUP=last-30-days&FORMAT=json";

  // Função auxiliar para verificar se a data está dentro dos últimos 30 dias
  function isWithinLast30Days(epochString: string): boolean {
    const epochDate = new Date(epochString);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Subtrai 30 dias
    return epochDate >= thirtyDaysAgo && epochDate <= now;
  }

  it("TC2-1: Deve retornar dados na chamada à API", () => {
    cy.request(endpoint).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.not.be.empty;
    });
  });

  it("TC2-2: Verificar e criar registos do código de estado da resposta", () => {
    cy.request(endpoint).then((response) => {
      cy.log("Código de estado recebido: " + response.status); // Regista o código de estado
      if (response.status === 200) {
        cy.log(
          "Resposta 200: Body contém " +
            (Array.isArray(response.body)
              ? response.body.length + " elementos"
              : "conteúdo não array")
        );
      } else if (response.status === 204) {
        cy.log("Resposta 204: Sem conteúdo, body vazio");
      } else {
        cy.log("Código de estado inesperado: " + response.status);
      }

      // Opcional: Registo adicional para depuração
      cy.log("Detalhes da resposta: " + JSON.stringify(response.body));
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

  it("TC2-4: Verificar se EPOCH está acima ou abaixo dos 30 dias", () => {
    cy.request(endpoint).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array").and.not.be.empty;

      response.body.forEach((object: any) => {
        const epochDate = new Date(object.EPOCH);
        const now = new Date();
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000
        );

        const isWithin = isWithinLast30Days(object.EPOCH);

        if (!isWithin) {
          if (epochDate < thirtyDaysAgo) {
            cy.log(
              "EPOCH está ABAIXO dos 30 dias: A data (" +
                object.EPOCH +
                ") é mais antiga que 30 dias."
            );
          } else if (epochDate > now) {
            cy.log(
              "EPOCH está ACIMA dos 30 dias: A data (" +
                object.EPOCH +
                ") é no futuro."
            );
          }
        } else {
          cy.log(
            "EPOCH está DENTRO dos 30 dias: A data (" +
              object.EPOCH +
              ") é válida."
          );
        }

        cy.log("Detalhes do objeto: EPOCH " + object.EPOCH);
      });
    });
  });

  it("TC2-5: Verificar se OBJECT_ID está no formato internacial COSPAR_ID", () => {
    cy.request(endpoint).then((response) => {
      expect(response.status).to.eq(200);
      const pattern = /^(\d{4})-(\d{3})([A-Z]{1,3})$/; // Padrão: Ano (4 dígitos)-Número de lançamento (3 dígitos)-Código (até 3 letras)
      response.body.forEach((object: any) => {
        expect(object.OBJECT_ID).to.match(pattern);
      });
    });
  });

  it("TC2-6: Verificar se NORAD_CAT_ID tem exatamente 5 dígitos", () => {
    cy.request(endpoint).then((response) => {
      expect(response.status).to.eq(200);
      response.body.forEach((object: any) => {
        expect(object.NORAD_CAT_ID).to.match(/^\d{5}$/); // Exatamente 5 dígitos
      });
    });
  });

  it("TC2-7: Verificar se NORAD_CAT_ID tem mais ou menos de 5 dígitos", () => {
    cy.request(endpoint).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array").and.not.be.empty;

      let moreThan5 = 0; // Contador para IDs com mais de 5 dígitos
      let lessThan5 = 0; // Contador para IDs com menos de 5 dígitos
      let exactly5 = 0; // Contador para IDs com exatamente 5 dígitos

      response.body.forEach((object: any) => {
        if (object.NORAD_CAT_ID) {
          const length = object.NORAD_CAT_ID.length;

          if (length > 5) {
            moreThan5++;
            if (moreThan5 === 1)
              cy.log(
                "Exemplo de ID com mais de 5 dígitos: " + object.NORAD_CAT_ID
              );
          } else if (length < 5) {
            lessThan5++;
            if (lessThan5 === 1)
              cy.log(
                "Exemplo de ID com menos de 5 dígitos: " + object.NORAD_CAT_ID
              );
          } else {
            exactly5++;
          }
        }
      });

      cy.log("Resumo TC2-7:");
      cy.log("IDs com mais de 5 dígitos: " + moreThan5);
      cy.log("IDs com menos de 5 dígitos: " + lessThan5);
      cy.log("IDs com exatamente 5 dígitos: " + exactly5);
    });
  });

  it("TC2-8: Verificar o tempo de resposta da API", () => {
    const startTime = new Date().getTime(); // Marca o tempo inicial
    cy.request(endpoint).then((response) => {
      const endTime = new Date().getTime(); // Marca o tempo final
      const responseTime = endTime - startTime; // Calcula o tempo em ms
      cy.log("Tempo de resposta: " + responseTime + " ms");
      expect(responseTime).to.be.lessThan(
        5000,
        "A resposta demorou mais de 5 segundos"
      ); // Expectativa: menos de 5 segundos
    });
  });

  it("TC2-9: Verificar se campos obrigatórios estão presentes e não nulos", () => {
    cy.request(endpoint).then((response) => {
      expect(response.status).to.eq(200);
      let missingFields = 0;

      response.body.forEach((object: any) => {
        if (!object.EPOCH || object.EPOCH == null) missingFields++;
        if (!object.NORAD_CAT_ID || object.NORAD_CAT_ID == null)
          missingFields++;
        if (!object.OBJECT_ID || object.OBJECT_ID == null) missingFields++;
      });

      cy.log("Resumo TC2-9: Campos ausentes ou nulos: " + missingFields);
      expect(missingFields).to.eq(
        0,
        "Todos os campos obrigatórios devem estar presentes"
      );
    });
  });

  it("TC2-10: Verificar respostas de erro da API", () => {
    cy.request({
      url: endpoint,
      failOnStatusCode: false, // Permite que o teste continue mesmo com erro
    }).then((response) => {
      if (response.status >= 500) {
        cy.log("Erro de servidor detectado: Status " + response.status);
      } else {
        cy.log("Resposta bem-sucedida: Status " + response.status);
      }
    });
  });
});
