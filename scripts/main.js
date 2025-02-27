class GPTCombatAssistant {
    static cache = new Map(); // Cache para armazenar sugestões
  
    static async analyzeCombat() {
      try {
        const combat = game.combat;
        if (!combat) {
          ui.notifications.warn("Nenhum combate ativo.");
          return;
        }
  
        // Verifica se já há sugestões em cache para este combate
        const cacheKey = GPTCombatAssistant.generateCacheKey(combat);
        if (this.cache.has(cacheKey)) {
          const cachedSuggestions = this.cache.get(cacheKey);
          GPTCombatAssistant.showSuggestions(cachedSuggestions);
          return;
        }
  
        // Coleta dados do combate
        const combatData = GPTCombatAssistant.collectCombatData(combat);
  
        // Solicita sugestões da API
        const suggestions = await GPTCombatAssistant.getGPTSuggestions(combatData);
  
        // Armazena as sugestões no cache
        this.cache.set(cacheKey, suggestions);
  
        // Exibe as sugestões
        GPTCombatAssistant.showSuggestions(suggestions);
      } catch (error) {
        console.error("Erro ao analisar combate:", error);
        ui.notifications.error("Ocorreu um erro ao analisar o combate. Verifique o console para mais detalhes.");
      }
    }
  
    static generateCacheKey(combat) {
      // Gera uma chave única para o combate com base no ID e no round atual
      return `combat-${combat.id}-round-${combat.round}`;
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
        ui.notifications.error("Chave da API não configurada!");
        return "Configure a chave da API nas configurações do módulo.";
      }
  
      const prompt = `Analise o seguinte combate de RPG e sugira táticas para os inimigos:\n${JSON.stringify(combatData, null, 2)}`;
  
      try {
        const response = await fetch("https://api.deepseek.com/v1/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "deepseek-v3",
            prompt: prompt,
            max_tokens: 150,
            temperature: 0.7 // Ajuste a criatividade das sugestões
          })
        });
  
        if (!response.ok) {
          throw new Error(`Erro na API: ${response.statusText}`);
        }
  
        const data = await response.json();
        return data.choices[0]?.text.trim() || "Nenhuma sugestão gerada.";
      } catch (error) {
        console.error("Erro ao chamar a API:", error);
        return "Erro ao obter sugestões. Verifique o console para mais detalhes.";
      }
    }
  
    static showSuggestions(suggestions) {
      new Dialog({
        title: "Sugestões de Combate",
        content: `<p><strong>Táticas sugeridas:</strong></p><p>${suggestions}</p>`,
        buttons: {
          ok: {
            label: "Entendido",
            callback: () => console.log("Sugestões aceitas")
          },
          customize: {
            label: "Personalizar",
            callback: () => GPTCombatAssistant.customizeSuggestions()
          }
        }
      }).render(true);
    }
  
    static customizeSuggestions() {
      new Dialog({
        title: "Personalizar Sugestões",
        content: `
          <form>
            <div>
              <label for="temperature">Criatividade das sugestões (0 a 1):</label>
              <input type="number" id="temperature" name="temperature" min="0" max="1" step="0.1" value="0.7">
            </div>
            <div>
              <label for="maxTokens">Comprimento máximo das sugestões:</label>
              <input type="number" id="maxTokens" name="maxTokens" min="50" max="500" value="150">
            </div>
          </form>
        `,
        buttons: {
          save: {
            label: "Salvar",
            callback: (html) => {
              const temperature = parseFloat(html.find("#temperature").val());
              const maxTokens = parseInt(html.find("#maxTokens").val());
              game.settings.set("gpt-combat-assistant", "temperature", temperature);
              game.settings.set("gpt-combat-assistant", "maxTokens", maxTokens);
              ui.notifications.info("Configurações salvas com sucesso!");
            }
          },
          cancel: {
            label: "Cancelar",
            callback: () => console.log("Personalização cancelada")
          }
        }
      }).render(true);
    }
  }
  
  // Hooks para chamar a análise de combate
  Hooks.on("createCombat", () => GPTCombatAssistant.analyzeCombat());
  Hooks.on("updateCombat", () => GPTCombatAssistant.analyzeCombat());


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