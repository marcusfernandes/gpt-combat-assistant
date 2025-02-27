class GPTCombatAssistant {
  static async analyzeCombat() {
      const combat = game.combat;
      if (!combat) {
          ui.notifications.warn("Nenhum combate ativo.");
          return;
      }

      let combatData = GPTCombatAssistant.collectCombatData(combat);
      let suggestions = await GPTCombatAssistant.getGPTSuggestions(combatData);

      GPTCombatAssistant.showSuggestions(suggestions);
  }

  static collectCombatData(combat) {
      return {
          round: combat.round,
          players: combat.combatants.filter(c => c.actor.hasPlayerOwner).map(c => ({
              name: c.name,
              hp: c.actor.system.attributes.hp,
              conditions: c.actor.effects.map(e => e.label)
          })),
          enemies: combat.combatants.filter(c => !c.actor.hasPlayerOwner).map(c => ({
              name: c.name,
              hp: c.actor.system.attributes.hp,
              cr: c.actor.system.details.cr || "Desconhecido",
              conditions: c.actor.effects.map(e => e.label)
          }))
      };
  }

  static async getGPTSuggestions(combatData) {
      const apiKey = game.settings.get("gpt-combat-assistant", "apiKey");
      if (!apiKey) {
          ui.notifications.error("Chave da API GPT não configurada!");
          return "Configure a chave da API nas configurações do módulo.";
      }

      const prompt = `Analise o seguinte combate de RPG e sugira táticas para os inimigos:\n${JSON.stringify(combatData, null, 2)}`;
      
      const response = await fetch("https://api.openai.com/v1/completions", {
          method: "POST",
          headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
              model: "gpt-4",
              prompt: prompt,
              max_tokens: 150
          })
      });

      const data = await response.json();
      return data.choices[0]?.text.trim() || "Nenhuma sugestão gerada.";
  }

  static showSuggestions(suggestions) {
      new Dialog({
          title: "Sugestões de Combate",
          content: `<p><strong>Táticas sugeridas:</strong></p><p>${suggestions}</p>`,
          buttons: {
              ok: {
                  label: "Entendido",
                  callback: () => console.log("Sugestões aceitas")
              }
          }
      }).render(true);
  }
}

Hooks.on("createCombat", () => GPTCombatAssistant.analyzeCombat());
Hooks.on("updateCombat", () => GPTCombatAssistant.analyzeCombat());
