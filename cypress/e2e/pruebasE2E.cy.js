/* eslint-disable cypress/no-unnecessary-waiting */
// cypress/e2e/pokemon-memorama.cy.js

describe("Memorama Pokémon pruebas e2e", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  describe("Página de Inicio (HomeView)", () => {
    it("debería mostrar el logo y las instrucciones", () => {
      cy.get(".logo").should("be.visible");
      cy.contains("¿Eres el mejor maestro Pokémon del mundo?").should("be.visible");
      cy.contains("Instrucciones:").should("be.visible");
    });

    it("debería mostrar el formulario de configuración", () => {
      cy.get('input[placeholder="Nombre"]').should("be.visible");
      cy.get("button").contains("Iniciar juego").should("be.visible").and("be.disabled");
    });

    it("debería mostrar los selectores progresivamente", () => {
      //  solo el nombre debería estar visible
      cy.get("select").should("not.be.visible");

      cy.get('input[placeholder="Nombre"]').type("TestPlayer");

      //region
      cy.get("select").first().should("be.visible");
      cy.get("select").first().select("kanto");

      // dificultad
      cy.get("select").eq(1).should("be.visible");
      cy.get("select").eq(1).select("easy");

      cy.get("button").contains("Iniciar juego").should("not.be.disabled");
    });

    it("debería iniciar el juego con configuración completa", () => {
      cy.get('input[placeholder="Nombre"]').type("TestPlayer");
      cy.get("select").first().select("kanto");
      cy.get("select").eq(1).select("easy");

      cy.get("button").contains("Iniciar juego").click();

      cy.url().should("include", "/game");
    });
  });

  describe("Página del Juego (GameView)", () => {
    beforeEach(() => {
      cy.get('input[placeholder="Nombre"]').type("TestPlayer");
      cy.get("select").first().select("kanto");
      cy.get("select").eq(1).select("easy");
      cy.get("button").contains("Iniciar juego").click();
      cy.url().should("include", "/game");
    });

    it("debería mostrar la información del juego", () => {
      cy.contains("Memorama Pokémon - TestPlayer").should("be.visible");
      cy.contains("Región: kanto").should("be.visible");
      cy.contains("Dificultad: Fácil").should("be.visible");
      cy.contains("Clicks: 0").should("be.visible");
    });

    it("debería mostrar el tablero de juego con el número correcto de cartas", () => {
      // 12 cartas
      cy.get(".pokemon-card").should("have.length", 12);
      cy.get(".game-board").should("have.class", "easy-grid");
    });

    it("debería mostrar cartas ocultas inicialmente", () => {
      cy.get(".pokemon-card").each(($card) => {
        cy.wrap($card).find("img").should("have.attr", "alt", "Carta oculta");
      });
    });

    it("debería mostrar error si el token no es válido", () => {
      cy.visit("/game");

      cy.get(".auth-error").should("be.visible");
      cy.contains("Error de autenticación").should("be.visible");
      cy.contains("Tu sesión no es válida o ha expirado").should("be.visible");
    });
    it("encuentra un par de Pokémon que coinciden", () => {
      const imagenesMostradas = {};
      let parEncontrado = false;
      let index = 0;

      //revisa las cartas una por una hasta encontrar par
      function siguienteCarta() {
        if (parEncontrado || index >= 12) return;

        cy.get(".pokemon-card")
          .eq(index)
          .then(($carta) => {
            //selecciona la carta index y si carta no  volteada
            if (!$carta.hasClass("flipped")) {
              //  click
              cy.wrap($carta).click();
              cy.wait(800);

              // obtener el src despues del click
              cy.wrap($carta)
                .find("img")
                .invoke("attr", "src")
                .then((src) => {
                  //  verificar que no sea ditto
                  if (src && !src.includes("132_c8kh6z.png")) {
                    //si ya esta en imagenesMostradas entonces se encontro el par
                    if (imagenesMostradas[src]) {
                      // par encontrado guarda el index del primer par
                      const indicePar = imagenesMostradas[src];
                      parEncontrado = true;

                      //  click en la carta del par encontrado
                      cy.get(".pokemon-card").eq(indicePar).click();
                      cy.wait(1000);

                      // verificar que permanecen volteadas
                      cy.get(".pokemon-card").eq(indicePar).should("have.class", "flipped");
                      cy.get(".pokemon-card").eq(index).should("have.class", "flipped");
                    } else {
                      // si no se vio antes se guarda imnagen e index se incrementa y se repite
                      imagenesMostradas[src] = index;
                      cy.wait(1000);

                      //  siguiente carta
                      index++;
                      siguienteCarta();
                    }
                  } else {
                    // si no se revelo, next
                    index++;
                    siguienteCarta();
                  }
                });
            } else {
              // si esta volteada, next
              index++;
              siguienteCarta();
            }
          });
      }

      // iniciar
      siguienteCarta();
    });
  });
});
describe("Página de Puntuaciones (ScoresView)", () => {
  beforeEach(() => {
    // agregar  puntuaciones de prueba
    cy.window().then((win) => {
      const mockScores = [
        {
          playerName: "TestPlayer1",
          region: "kanto",
          difficulty: "Fácil",
          clicks: 24,
          date: new Date().toISOString(),
        },
        {
          playerName: "TestPlayer2",
          region: "johto",
          difficulty: "Medio",
          clicks: 30,
          date: new Date().toISOString(),
        },
      ];
      win.localStorage.setItem("pokemonMemoryScores", JSON.stringify(mockScores));
    });

    cy.visit("/scores");
  });

  it("debería mostrar la tabla de puntuaciones", () => {
    cy.contains("Puntuaciones - Memorama Pokémon").should("be.visible");
    cy.get("table").should("be.visible");
    cy.get("tbody tr").should("have.length.at.least", 1);
  });

  it("debería mostrar los filtros de dificultad y región", () => {
    cy.get("select").should("have.length", 2);
    cy.contains("Todas las dificultades").should("be.visible");
    cy.contains("Todas las regiones").should("be.visible");
  });
  it("debería ordenar las puntuaciones por número de clicks", () => {
    //se seolecciona las celdas de la cklumna 5
    cy.get("tbody tr td:nth-child(5)").then((cells) => {
      //se convierte en array y se  vuelven numero para sumar
      const clicks = [...cells].map((c) => +c.textContent);
      //compara  el array  ordenado de menor a mayor  se usa eql para comparar
      expect(clicks).to.eql([...clicks].sort((a, b) => a - b));
    });
  });
});
