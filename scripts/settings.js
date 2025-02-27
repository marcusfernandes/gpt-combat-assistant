 // Configurações do módulo
 Hooks.once("init", () => {
  game.settings.register("gpt-combat-assistant", "apiKey", {
    name: "Chave da API",
    hint: "Insira a chave da API do DeepSeek.",
    scope: "world",
    config: true,
    type: String,
    default: ""
  });

  game.settings.register("gpt-combat-assistant", "temperature", {
    name: "Criatividade das Sugestões",
    hint: "Ajuste a criatividade das sugestões (0 = mais direto, 1 = mais criativo).",
    scope: "world",
    config: true,
    type: Number,
    default: 0.7,
    range: { min: 0, max: 1, step: 0.1 }
  });

  game.settings.register("gpt-combat-assistant", "maxTokens", {
    name: "Comprimento Máximo das Sugestões",
    hint: "Defina o número máximo de tokens (palavras) para as sugestões.",
    scope: "world",
    config: true,
    type: Number,
    default: 150,
    range: { min: 50, max: 500, step: 10 }
  });
});