const API_KEY = "5904cfe3-86d7-479f-9773-7ad94405d1d0";
const PSEUDO = "--Kimimaro--";
const CONTAINER = document.getElementById("matches");

async function getPlayerId(nickname) {
  const res = await fetch(`https://open.faceit.com/data/v4/players?nickname=${encodeURIComponent(nickname)}`, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  });
  const data = await res.json();
  return data.player_id;
}

async function getMatches(playerId) {
  const res = await fetch(`https://open.faceit.com/data/v4/players/${playerId}/history?game=cs2&limit=10`, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  });
  const data = await res.json();
  return data.items; // tableau de match_id
}

async function getMatchDetails(matchId) {
  const res = await fetch(`https://open.faceit.com/data/v4/matches/${matchId}`, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  });
  const data = await res.json();
  return data;
}

async function displayMatches() {
  CONTAINER.innerHTML = "Chargement...";

  try {
    const playerId = await getPlayerId(PSEUDO);
    const matches = await getMatches(playerId);

    if (!matches.length) {
      CONTAINER.innerHTML = "Aucun match trouvé.";
      return;
    }

    CONTAINER.innerHTML = "";

    for (const match of matches) {
      const details = await getMatchDetails(match.match_id);

      const date = new Date(details.started_at * 1000).toLocaleString("fr-FR");
      const map = details.voting?.map?.pick || details.game_mode || "Inconnue";
      const scoreF1 = details.teams.faction1.team_stats.Score;
      const scoreF2 = details.teams.faction2.team_stats.Score;

      const team1 = details.teams.faction1;
      const team2 = details.teams.faction2;

      // Déterminer si le joueur était dans la team gagnante
      let resultat = "❓";
      const inF1 = team1.players.some(p => p.nickname === PSEUDO);
      const winF1 = team1.team_stats.TeamWin === "1";
      const winF2 = team2.team_stats.TeamWin === "1";

      if (inF1) {
        resultat = winF1 ? "✅ Victoire" : "❌ Défaite";
      } else {
        resultat = winF2 ? "✅ Victoire" : "❌ Défaite";
      }

      const div = document.createElement("div");
      div.classList.add("match");
      div.innerHTML = `
        <h3>ID Match : ${match.match_id}</h3>
        <p><strong>Carte :</strong> ${map}</p>
        <p><strong>Date :</strong> ${date}</p>
        <p><strong>Score :</strong> ${scoreF1} - ${scoreF2}</p>
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
