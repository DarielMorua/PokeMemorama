import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("https://pokeapi.co/api/v2/region", () => {
    return HttpResponse.json(
      {
        results: [
          { name: "kanto", url: "https://pokeapi.co/api/v2/region/0/" },
          { name: "johto", url: "https://pokeapi.co/api/v2/region/1/" },
          { name: "hoenn", url: "https://pokeapi.co/api/v2/region/2/" },
          { name: "sinnoh", url: "https://pokeapi.co/api/v2/region/3/" },
          { name: "unova", url: "https://pokeapi.co/api/v2/region/4/" },
          { name: "kalos", url: "https://pokeapi.co/api/v2/region/5/" },
          { name: "alola", url: "https://pokeapi.co/api/v2/region/6/" },
          { name: "galar", url: "https://pokeapi.co/api/v2/region/7/" },
          { name: "hisui", url: "https://pokeapi.co/api/v2/region/8/" },
          { name: "paldea", url: "https://pokeapi.co/api/v2/region/9/" },
        ],
      },
      {
        status: 200,
        statusText: "Mocked Regions",
      }
    );
  }),

  http.post("http://localhost:5173/get-user", () => {
    return HttpResponse.json(
      { authToken: "FAKE_MOCK_TOKEN_12345" },
      { status: 200, statusText: "Mocked User" }
    );
  }),

  http.get("https://pokeapi.co/api/v2/pokemon/:id", ({ params }) => {
    const { id } = params;

    return HttpResponse.json(
      {
        id: Number(id),
        name: `mock-${id}`,
        sprites: {
          front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        },
      },
      {
        status: 200,
        statusText: "Mocked Pokémon",
      }
    );
  }),
];
