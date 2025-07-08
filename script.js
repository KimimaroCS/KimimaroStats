const API_KEY = "5904cfe3-86d7-479f-9773-7ad94405d1d0"; // ta clé API Faceit
const PSEUDO = "--Kimimaro--"; // ton pseudo Faceit
const CONTAINER = document.getElementById("matches");

// 🔍 Récupère l’ID du joueur
async function getPlayerId(nickname) {
  const res = await fetch(`https://open.faceit.com/data/v4/players?nickname=${encodeURIComponent(nickname)}`, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  });

  if (!res.ok) {
    throw new Error(`Erreur FACEIT : ${res.status} - ${res.statusText}`);
  }

  const data = await res.json();
  return data.player_id;
}

// 📜 Récupère la liste des 30 derniers matchs
async function getMatches(playerId) {
  const res = await fetch(`https://open.faceit.com/data/v4/players/${playerId}/history?game=cs2&limit=30`, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  });

  if (!res.ok) {
    throw new Error(`Erreur Matchs : ${res.status}`);
  }

  const data = await res.json();
  return data.items;
}

// 🎯 Affiche les matchs dans la page
async function displayMatches() {
  CONTAINER.innerHTML = "Chargement...";

  try {
    const playerId = await getPlayerId(PSEUDO);
    const matches = await getMatches(playerId);

    if (matches.length === 0) {
      CONTAINER.innerHTML = "Aucun match trouvé.";
      return;
    }

    CONTAINER.innerHTML = "";

    for (const match of matches) {
      const div = document.createElement("div");
      div.classList.add("match");

      // Date du match
      const timestamp = match.created_at || 0;
      const date = new Date(timestamp * 1000).toLocaleString("fr-FR");

      // Map
      const map = match?.stats?.map || match?.stats?.Map || "Inconnue";

      // Résultat
      const teams = match?.teams;
      let resultat = "❓ Inconnu";

      if (teams?.faction1 && teams?.faction2) {
        const f1 = teams.faction1;
        const f2 = teams.faction2;

        const isInF1 = f1.players.some(p => p.nickname === PSEUDO);
        const winF1 = f1.team_stats?.TeamWin === "1";
        const winF2 = f2.team_stats?.TeamWin === "1";

        if (isInF1) {
          resultat = winF1 ? "✅ Victoire" : "❌ Défaite";
        } else {
          resultat = winF2 ? "✅ Victoire" : "❌ Défaite";
        }
      }

      div.innerHTML = `
        <h3>ID Match : ${match.match_id}</h3>
        <p><strong>Carte :</strong> ${map}</p>
        <p><strong>Date :</strong> ${date}</p>
        <p><strong>Score :</strong> Non dispo dans cet endpoint</p>
        <p><strong>Résultat :</strong> ${resultat}</p>
      `;

      CONTAINER.appendChild(div);
    }
  } catch (error) {
    console.error(error);
    CONTAINER.innerHTML = `❌ Une erreur est survenue : ${error.message}`;
  }
}

displayMatches();
