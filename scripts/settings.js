Hooks.once("init", () => {
  game.settings.register("gpt-combat-assistant", "apiKey", {
      name: "Chave API do GPT",
      hint: "Insira sua chave da API do OpenAI para habilitar sugestões de combate.",
      scope: "client",
      config: true,
      type: String,
      default: ""
  });

  game.settings.register("gpt-combat-assistant", "difficulty", {
      name: "Nível de Dificuldade",
      hint: "Ajuste o nível de dificuldade das sugestões do GPT.",
      scope: "world",
      config: true,
      type: String,
      choices: {
          "easy": "Fácil",
          "balanced": "Equilibrado",
          "hard": "Difícil"
      },
      default: "balanced"
  });
});
