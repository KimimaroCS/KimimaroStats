const API_KEY = "5904cfe3-86d7-479f-9773-7ad94405d1d0";
const PSEUDO = "--Kimimaro--";
const CONTAINER = document.getElementById("matches");

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

    matches.forEach(match => {
      const div = document.createElement("div");
      div.classList.add("match");

      const date = new Date(match.created_at * 1000).toLocaleString("fr-FR");
      const map = match.stats?.Map || "Inconnue";
      const score = match.results?.score || "N/A";
      const winner = match.teams?.faction1?.players?.some(p => p.nickname === PSEUDO)
        ? match.teams.faction1?.team_stats?.TeamWin || "?"
        : match.teams.faction2?.team_stats?.TeamWin || "?";

      div.innerHTML = `
        <h3>${match.match_id}</h3>
        <p><strong>Carte :</strong> ${map}</p>
        <p><strong>Date :</strong> ${date}</p>
        <p><strong>Score :</strong> ${score}</p>
        <p><strong>Résultat :</strong> ${winner === "1" ? "✅ Victoire" : "❌ Défaite"}</p>
      `;

      CONTAINER.appendChild(div);
    });
  } catch (error) {
    console.error(error);
    CONTAINER.innerHTML = `❌ Une erreur est survenue : ${error.message}`;
  }
}

displayMatches();
