import React, { useState, useMemo, useEffect } from "react";
import {
  Trophy,
  Settings,
  Users,
  Lock,
  Unlock,
  Plus,
  Trash2,
  GitMerge,
  Medal,
  Clock,
  MapPin,
  X,
  Cloud,
  Loader2,
  Check,
  ChevronLeft,
  FileText,
  ArrowRightCircle,
} from "lucide-react";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// --- CONFIGURATION FIREBASE ---
// Adaptation pour supporter à la fois l'environnement de développement et votre propre projet
const isEnvConfigAvailable = typeof __firebase_config !== "undefined";
const finalFirebaseConfig = isEnvConfigAvailable
  ? JSON.parse(__firebase_config)
  : {
      apiKey: "AIzaSyBu7CLCQKuXHpidQmeTsPC4ms7xOJxEA8Y",
      authDomain: "challenge-guy-touya.firebaseapp.com",
      projectId: "challenge-guy-touya",
      storageBucket: "challenge-guy-touya.firebasestorage.app",
      messagingSenderId: "143466489536",
      appId: "1:143466489536:web:4b035edd0da24a0e6eef25",
    };

const app = initializeApp(finalFirebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const envAppId =
  typeof __app_id !== "undefined" ? __app_id : "challenge-touya-2026";

// --- CONFIGURATIONS PAR DÉFAUT SELON LE PDF ---
const U11_GROUPS = [
  { id: "gA", name: "Poule A" },
  { id: "gB", name: "Poule B" },
  { id: "gC", name: "Poule C" },
  { id: "gD", name: "Poule D" },
];
// Pré-rempli avec les équipes du PDF
const U11_TEAMS = [
  { id: "u11_1", name: "FCLR 1", groupId: "gA" },
  { id: "u11_2", name: "ASMUR 2", groupId: "gA" },
  { id: "u11_3", name: "UJ", groupId: "gA" },
  { id: "u11_4", name: "GELOS", groupId: "gA" },
  { id: "u11_5", name: "ES NAY 1", groupId: "gB" },
  { id: "u11_6", name: "FCVO 2", groupId: "gB" },
  { id: "u11_7", name: "FAMEB", groupId: "gB" },
  { id: "u11_8", name: "HAUT BEARN", groupId: "gB" },
  { id: "u11_9", name: "FCLR 2", groupId: "gC" },
  { id: "u11_10", name: "FCVO 1", groupId: "gC" },
  { id: "u11_11", name: "GAN", groupId: "gC" },
  { id: "u11_12", name: "TARON SEVIGNACQ", groupId: "gC" },
  { id: "u11_13", name: "FCLR 3", groupId: "gD" },
  { id: "u11_14", name: "ES NAY 2", groupId: "gD" },
  { id: "u11_15", name: "ASMUR 1", groupId: "gD" },
  { id: "u11_16", name: "FC 3A", groupId: "gD" },
];

const U13_GROUPS = [
  { id: "g1", name: "Poule A" },
  { id: "g2", name: "Poule B" },
  { id: "g3", name: "Poule C" },
];
const U13_TEAMS = [
  { id: "u13_1", name: "FCLR 1", groupId: "g1" },
  { id: "u13_2", name: "UJ", groupId: "g1" },
  { id: "u13_3", name: "CŒUR DU BEARN 2", groupId: "g1" },
  { id: "u13_4", name: "PAPILLONS DES ENCLAVES 1", groupId: "g1" },
  { id: "u13_5", name: "NAY 2", groupId: "g2" },
  { id: "u13_6", name: "ESMAN", groupId: "g2" },
  { id: "u13_7", name: "GAN", groupId: "g2" },
  { id: "u13_8", name: "CŒUR DE BEARN 1", groupId: "g2" },
  { id: "u13_9", name: "FCLR 2", groupId: "g3" },
  { id: "u13_10", name: "NAY 1", groupId: "g3" },
  { id: "u13_11", name: "PAPILLONS DES ENCLAVES 2", groupId: "g3" },
  { id: "u13_12", name: "FC BAAL", groupId: "g3" },
];

// --- COMPOSANT : Affichage intelligent du Terrain ---
const PitchDisplay = ({ pitch }) => {
  const isNueno =
    pitch === "Terrain 1" ||
    pitch === "T1" ||
    pitch === "Terrain NUENO TRUCKS Pyrénées" ||
    pitch === "Terrain NUENO TRUCKS Pyrénnées";
  const isBazarland =
    pitch === "Terrain 2" || pitch === "T2" || pitch === "Terrain BAZARLAND";
  const isIntermarche =
    pitch === "Terrain 3" || pitch === "T3" || pitch === "Terrain INTERMARCHE";
  const isGitem =
    pitch === "Terrain 4" || pitch === "T4" || pitch === "Terrain GITEM";

  if (isBazarland) {
    return (
      <span className="flex items-center text-orange-700 font-extrabold uppercase tracking-tight">
        <img
          src="https://i.imgur.com/PMbVMAk.png"
          alt="Bazarland"
          className="h-3 sm:h-3.5 w-auto object-contain mr-1.5"
        />
        Terrain 2 - Bazarland
      </span>
    );
  }

  if (isGitem) {
    return (
      <span className="flex items-center text-blue-700 font-extrabold uppercase tracking-tight">
        <img
          src="https://i.imgur.com/2p97Yqh.png"
          alt="GITEM"
          className="h-3 sm:h-3.5 w-auto object-contain mr-1.5"
        />
        Terrain 4 - GITEM
      </span>
    );
  }

  if (isIntermarche) {
    return (
      <span className="flex items-center text-red-700 font-extrabold uppercase tracking-tight">
        <img
          src="https://i.imgur.com/tJhHAtM.png"
          alt="Intermarché"
          className="h-3 sm:h-3.5 w-auto object-contain mr-1.5"
        />
        Terrain 3 - INTERMARCHÉ
      </span>
    );
  }

  if (isNueno) {
    return (
      <span className="flex items-center text-amber-600 font-extrabold uppercase tracking-tight">
        <img
          src="https://i.imgur.com/gsTY5B8.png"
          alt="Nueno Trucks Pyrénées"
          className="h-3 sm:h-3.5 w-auto object-contain mr-1.5"
        />
        Terrain 1 - NUENO TRUCKS
      </span>
    );
  }

  return (
    <span className="flex items-center">
      <MapPin size={13} className="mr-1" /> {pitch}
    </span>
  );
};

export default function App() {
  // --- ÉTATS GLOBAUX ---
  const [activeCategory, setActiveCategory] = useState(null);
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("standings");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState(false);

  const ADMIN_PASSWORD = "fclr1994";

  // --- DONNÉES DU TOURNOI ---
  const [pointsConfig, setPointsConfig] = useState({
    win: 3,
    draw: 1,
    loss: 0,
    bonusLargeWin: 1,
  });

  const [groups, setGroups] = useState([]);
  const [phase2Groups, setPhase2Groups] = useState([]); // Poules E, F, G, H
  const [teams, setTeams] = useState([]); // contient groupId (Phase 1) et phase2GroupId (Phase 2)
  const [matches, setMatches] = useState([]); // contient property phase: 1 ou 2
  const [knockoutMatches, setKnockoutMatches] = useState([]);

  const knockoutStages =
    activeCategory === "U11"
      ? ["Demi-finales", "Matchs de Classement", "Finales"]
      : [
          "Barrages",
          "Quarts de finale",
          "Demi-finales",
          "Matchs de Classement",
          "Finales",
        ];
  const [koError, setKoError] = useState(null);
  const [newTeamInputs, setNewTeamInputs] = useState({});
  const [showFullRanking, setShowFullRanking] = useState(false);

  // --- 1. CONNEXION INITIALE AU CLOUD ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== "undefined" &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Erreur Auth:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- 2. ÉCOUTE DES DONNÉES EN TEMPS RÉEL ---
  useEffect(() => {
    if (!user || !activeCategory) return;
    const docRef = doc(
      db,
      "artifacts",
      envAppId,
      "public",
      "data",
      "tournament",
      `main_${activeCategory}`
    );

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.groups) setGroups(data.groups);
          if (data.phase2Groups) setPhase2Groups(data.phase2Groups);
          if (data.teams) setTeams(data.teams);
          if (data.matches) setMatches(data.matches);
          if (data.knockoutMatches) setKnockoutMatches(data.knockoutMatches);
          if (data.pointsConfig) setPointsConfig(data.pointsConfig);
        } else {
          setGroups(activeCategory === "U11" ? U11_GROUPS : U13_GROUPS);
          setPhase2Groups([]);
          setTeams(activeCategory === "U11" ? U11_TEAMS : U13_TEAMS);
          setMatches([]);
          setKnockoutMatches([]);
        }
      },
      (error) => console.error("Erreur Sync:", error)
    );

    return () => unsubscribe();
  }, [user, activeCategory]);

  // --- 3. FONCTION POUR SAUVEGARDER DANS LE CLOUD ---
  const saveToCloud = async (updates) => {
    if (!user || !activeCategory) return;
    setIsSyncing(true);
    try {
      const docRef = doc(
        db,
        "artifacts",
        envAppId,
        "public",
        "data",
        "tournament",
        `main_${activeCategory}`
      );
      await setDoc(docRef, updates, { merge: true });
      setToastMessage("Enregistré en ligne !");
    } catch (error) {
      console.error("Erreur de sauvegarde:", error);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleToggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      if (activeTab === "settings") setActiveTab("standings");
    } else {
      setShowLoginModal(true);
      setLoginError(false);
      setPasswordInput("");
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setLoginError(false);
      if (user && activeCategory)
        saveToCloud({
          groups,
          phase2Groups,
          teams,
          matches,
          knockoutMatches,
          pointsConfig,
        });
    } else {
      setLoginError(true);
    }
  };

  const selectCategory = (category) => {
    setGroups(category === "U11" ? U11_GROUPS : U13_GROUPS);
    setPhase2Groups([]);
    setTeams(category === "U11" ? U11_TEAMS : U13_TEAMS);
    setMatches([]);
    setKnockoutMatches([]);
    setActiveCategory(category);
    setActiveTab("standings");
  };

  // --- MISSING ADMIN FUNCTIONS IMPLEMENTATION ---
  const handleGroupNameChange = (groupId, newName) => {
    const updatedGroups = groups.map((g) =>
      g.id === groupId ? { ...g, name: newName } : g
    );
    setGroups(updatedGroups);
    saveToCloud({ groups: updatedGroups });
  };

  const handleTeamNameChange = (teamId, newName) => {
    const updatedTeams = teams.map((t) =>
      t.id === teamId ? { ...t, name: newName } : t
    );
    setTeams(updatedTeams);
    saveToCloud({ teams: updatedTeams });
  };

  const deleteTeam = (teamId) => {
    const updatedTeams = teams.filter((t) => t.id !== teamId);
    setTeams(updatedTeams);
    saveToCloud({ teams: updatedTeams });
  };

  const handleAddTeam = (groupId) => {
    const teamName = newTeamInputs[groupId];
    if (!teamName || teamName.trim() === "") return;
    const newTeam = {
      id: `t_${Date.now()}`,
      name: teamName.trim(),
      groupId: groupId,
    };
    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    setNewTeamInputs({ ...newTeamInputs, [groupId]: "" });
    saveToCloud({ teams: updatedTeams });
  };
  // ----------------------------------------------

  // --- LOGIQUE DE CALCUL DU CLASSEMENT ---
  const computeStandings = (
    teamsList,
    matchesList,
    groupsList,
    groupIdField
  ) => {
    let table = teamsList.map((team) => ({
      ...team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    }));

    matchesList
      .filter((m) => m.isPlayed)
      .forEach((match) => {
        const home = table.find((t) => t.id === match.homeTeamId);
        const away = table.find((t) => t.id === match.awayTeamId);
        if (home && away) {
          home.played++;
          away.played++;
          home.goalsFor += match.homeScore;
          home.goalsAgainst += match.awayScore;
          away.goalsFor += match.awayScore;
          away.goalsAgainst += match.homeScore;

          if (match.homeScore > match.awayScore) {
            home.won++;
            home.points += pointsConfig.win;
            if (match.homeScore - match.awayScore >= 3)
              home.points += pointsConfig.bonusLargeWin;
            away.lost++;
            away.points += pointsConfig.loss;
          } else if (match.homeScore < match.awayScore) {
            away.won++;
            away.points += pointsConfig.win;
            if (match.awayScore - match.homeScore >= 3)
              away.points += pointsConfig.bonusLargeWin;
            home.lost++;
            home.points += pointsConfig.loss;
          } else {
            home.drawn++;
            away.drawn++;
            home.points += pointsConfig.draw;
            away.points += pointsConfig.draw;
          }
        }
      });

    table.forEach((t) => (t.goalDifference = t.goalsFor - t.goalsAgainst));
    const grouped = {};
    groupsList.forEach((g) => (grouped[g.id] = []));
    table.forEach((t) => {
      if (t[groupIdField] && grouped[t[groupIdField]]) {
        grouped[t[groupIdField]].push(t);
      }
    });

    Object.keys(grouped).forEach((groupId) => {
      grouped[groupId].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        // 1. Confrontation directe
        const h2hMatch = matchesList.find(
          (m) =>
            m.isPlayed &&
            ((m.homeTeamId === a.id && m.awayTeamId === b.id) ||
              (m.homeTeamId === b.id && m.awayTeamId === a.id))
        );
        if (h2hMatch) {
          let aScore =
            h2hMatch.homeTeamId === a.id
              ? h2hMatch.homeScore
              : h2hMatch.awayScore;
          let bScore =
            h2hMatch.homeTeamId === b.id
              ? h2hMatch.homeScore
              : h2hMatch.awayScore;
          if (aScore !== bScore) return bScore - aScore;
        }
        // 2. Goal-average général
        if (b.goalDifference !== a.goalDifference)
          return b.goalDifference - a.goalDifference;
        // 3. Buts marqués
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        // 4. Fair-Play (Ordre alphabétique faute de cartons)
        return a.name.localeCompare(b.name);
      });
    });
    return grouped;
  };

  const standingsPhase1 = useMemo(
    () =>
      computeStandings(
        teams,
        matches.filter((m) => m.phase === 1 || !m.phase),
        groups,
        "groupId"
      ),
    [teams, matches, pointsConfig, groups]
  );
  const standingsPhase2 = useMemo(
    () =>
      computeStandings(
        teams,
        matches.filter((m) => m.phase === 2),
        phase2Groups,
        "phase2GroupId"
      ),
    [teams, matches, pointsConfig, phase2Groups]
  );

  const getMatchWinner = (m) => {
    if (m.homeScore > m.awayScore) return m.homeTeamId;
    if (m.awayScore > m.homeScore) return m.awayTeamId;
    if (m.homePenalties != null && m.awayPenalties != null) {
      if (m.homePenalties > m.awayPenalties) return m.homeTeamId;
      if (m.awayPenalties > m.homePenalties) return m.awayTeamId;
    }
    return null;
  };

  const getMatchLoser = (m) => {
    if (m.homeScore > m.awayScore) return m.awayTeamId;
    if (m.awayScore > m.homeScore) return m.homeTeamId;
    if (m.homePenalties != null && m.awayPenalties != null) {
      if (m.homePenalties > m.awayPenalties) return m.awayTeamId;
      if (m.awayPenalties > m.homePenalties) return m.homeTeamId;
    }
    return null;
  };

  const podium = useMemo(() => {
    const finalMatch = knockoutMatches.find(
      (m) =>
        (m.label === "Finale Ligue des Champions (1-2)" ||
          m.label === "Finale Principale (1-2)") &&
        m.isPlayed
    );
    const bronzeMatch = knockoutMatches.find(
      (m) => m.label === "Places 3-4" && m.isPlayed
    );
    let result = { first: null, second: null, third: null };
    if (finalMatch) {
      result.first = getMatchWinner(finalMatch) || "Égalité (TAB requis)";
      result.second = getMatchLoser(finalMatch) || "Égalité";
    }
    if (bronzeMatch) result.third = getMatchWinner(bronzeMatch);
    return result;
  }, [knockoutMatches]);

  const fullRanking = useMemo(() => {
    let ranking = [];
    knockoutMatches
      .filter((m) => m.isPlayed)
      .forEach((m) => {
        const w = getMatchWinner(m);
        const l = getMatchLoser(m);
        if (w && m.finalRankWinner) ranking[m.finalRankWinner - 1] = w;
        if (l && m.finalRankLoser) ranking[m.finalRankLoser - 1] = l;
      });
    return ranking.filter(Boolean);
  }, [knockoutMatches]);

  // --- ACTIONS MATCHS ---
  const handleScoreChange = (matchId, type, value, isKnockout = false) => {
    let numValue = parseInt(value, 10);
    if (isNaN(numValue)) numValue = null;

    const updater = (list) =>
      list.map((m) => {
        if (m.id === matchId) {
          const updatedMatch = { ...m, [type]: numValue };
          updatedMatch.isPlayed =
            updatedMatch.homeScore !== null && updatedMatch.awayScore !== null;
          return updatedMatch;
        }
        return m;
      });

    if (isKnockout) {
      const updated = updater(knockoutMatches);
      setKnockoutMatches(updated);
      saveToCloud({ knockoutMatches: updated });
    } else {
      const updated = updater(matches);
      setMatches(updated);
      saveToCloud({ matches: updated });
    }
  };

  const resetMatch = (matchId, isKnockout = false) => {
    const updater = (list) =>
      list.map((m) =>
        m.id === matchId
          ? {
              ...m,
              homeScore: null,
              awayScore: null,
              homePenalties: null,
              awayPenalties: null,
              isPlayed: false,
            }
          : m
      );
    if (isKnockout) {
      const updated = updater(knockoutMatches);
      setKnockoutMatches(updated);
      saveToCloud({ knockoutMatches: updated });
    } else {
      const updated = updater(matches);
      setMatches(updated);
      saveToCloud({ matches: updated });
    }
  };

  const handleLabelChange = (matchId, newLabel) => {
    const newKoMatches = knockoutMatches.map((m) =>
      m.id === matchId ? { ...m, label: newLabel } : m
    );
    setKnockoutMatches(newKoMatches);
    saveToCloud({ knockoutMatches: newKoMatches });
  };

  const deleteKnockoutMatch = (matchId) => {
    const newKoMatches = knockoutMatches.filter((m) => m.id !== matchId);
    setKnockoutMatches(newKoMatches);
    saveToCloud({ knockoutMatches: newKoMatches });
  };

  // --- ACTIONS GENERATION ---
  const generatePhase1Matches = () => {
    let assigned = [];

    if (activeCategory === "U13") {
      const gA = teams.filter((t) => t.groupId === "g1");
      const gB = teams.filter((t) => t.groupId === "g2");
      const gC = teams.filter((t) => t.groupId === "g3");

      const scheduleU13 = [
        {
          t: "15h20",
          m: [
            { h: gA[0], a: gA[1], p: "Terrain NUENO TRUCKS Pyrénées" },
            { h: gB[0], a: gB[1], p: "Terrain BAZARLAND" },
            { h: gC[0], a: gC[1], p: "Terrain INTERMARCHE" },
          ],
        },
        {
          t: "15h40",
          m: [
            { h: gC[2], a: gC[3], p: "Terrain NUENO TRUCKS Pyrénées" },
            { h: gA[2], a: gA[3], p: "Terrain BAZARLAND" },
            { h: gB[2], a: gB[3], p: "Terrain INTERMARCHE" },
          ],
        },
        {
          t: "16h00",
          m: [
            { h: gB[0], a: gB[2], p: "Terrain NUENO TRUCKS Pyrénées" },
            { h: gC[0], a: gC[2], p: "Terrain BAZARLAND" },
            { h: gA[0], a: gA[2], p: "Terrain INTERMARCHE" },
          ],
        },
        {
          t: "16h20",
          m: [
            { h: gA[1], a: gA[3], p: "Terrain NUENO TRUCKS Pyrénées" },
            { h: gB[1], a: gB[3], p: "Terrain BAZARLAND" },
            { h: gC[1], a: gC[3], p: "Terrain INTERMARCHE" },
          ],
        },
        {
          t: "16h40",
          m: [
            { h: gC[0], a: gC[3], p: "Terrain NUENO TRUCKS Pyrénées" },
            { h: gA[0], a: gA[3], p: "Terrain BAZARLAND" },
            { h: gB[0], a: gB[3], p: "Terrain INTERMARCHE" },
          ],
        },
        {
          t: "17h00",
          m: [
            { h: gB[1], a: gB[2], p: "Terrain NUENO TRUCKS Pyrénées" },
            { h: gC[1], a: gC[2], p: "Terrain BAZARLAND" },
            { h: gA[1], a: gA[2], p: "Terrain INTERMARCHE" },
          ],
        },
      ];

      scheduleU13.forEach((slot) => {
        slot.m.forEach((matchInfo) => {
          if (matchInfo.h && matchInfo.a) {
            assigned.push({
              id: `p1_${matchInfo.h.id}_${matchInfo.a.id}`,
              homeTeamId: matchInfo.h.id,
              awayTeamId: matchInfo.a.id,
              homeScore: null,
              awayScore: null,
              isPlayed: false,
              groupId: matchInfo.h.groupId,
              phase: 1,
              time: slot.t,
              pitch: matchInfo.p,
            });
          }
        });
      });
    } else {
      let allMatches = [];
      groups.forEach((group) => {
        const groupTeams = teams.filter((t) => t.groupId === group.id);
        for (let i = 0; i < groupTeams.length; i++) {
          for (let j = i + 1; j < groupTeams.length; j++) {
            allMatches.push({
              id: `p1_${groupTeams[i].id}_${groupTeams[j].id}`,
              homeTeamId: groupTeams[i].id,
              awayTeamId: groupTeams[j].id,
              homeScore: null,
              awayScore: null,
              isPlayed: false,
              groupId: group.id,
              phase: 1,
              time: null,
              pitch: null,
            });
          }
        }
      });
      // Entrelacement et attribution Terrains/Heures (9h00)
      const interleaved = [];
      const queues = {};
      groups.forEach((g) => {
        queues[g.id] = allMatches.filter((m) => m.groupId === g.id);
      });
      let keepGoing = true;
      while (keepGoing) {
        keepGoing = false;
        groups.forEach((g) => {
          if (queues[g.id] && queues[g.id].length > 0) {
            interleaved.push(queues[g.id].shift());
            keepGoing = true;
          }
        });
      }
      let currentTime = new Date();
      currentTime.setHours(9, 0, 0, 0);
      let unassigned = [...interleaved];
      while (unassigned.length > 0) {
        let teamsBusy = new Set();
        for (let p = 1; p <= 4; p++) {
          const idx = unassigned.findIndex(
            (m) => !teamsBusy.has(m.homeTeamId) && !teamsBusy.has(m.awayTeamId)
          );
          if (idx !== -1) {
            const match = unassigned[idx];
            match.time = currentTime
              .toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })
              .replace(":", "h");
            match.pitch =
              p === 4
                ? "Terrain GITEM"
                : p === 3
                ? "Terrain INTERMARCHE"
                : p === 2
                ? "Terrain BAZARLAND"
                : "Terrain NUENO TRUCKS Pyrénées";
            teamsBusy.add(match.homeTeamId);
            teamsBusy.add(match.awayTeamId);
            assigned.push(match);
            unassigned.splice(idx, 1);
          }
        }
        currentTime.setMinutes(currentTime.getMinutes() + 20);
      }
    }

    const updatedTeams = teams.map((t) => ({ ...t, phase2GroupId: null }));

    setPhase2Groups([]);
    setKnockoutMatches([]);
    setTeams(updatedTeams);
    setMatches(assigned);

    saveToCloud({
      matches: assigned,
      phase2Groups: [],
      knockoutMatches: [],
      teams: updatedTeams,
    });

    setActiveTab("matches");
  };

  const sortTeamsAcrossGroups = (a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.name.localeCompare(b.name);
  };

  const generatePhase2Groups = () => {
    const p1Matches = matches.filter((m) => m.phase === 1 || !m.phase);
    if (p1Matches.length === 0 || !p1Matches.every((m) => m.isPlayed)) {
      setKoError("Terminez tous les matchs de la Phase 1 d'abord.");
      setTimeout(() => setKoError(null), 5000);
      return;
    }

    let newP2Groups = [];
    let updatedTeams = [...teams];
    const assign = (teamId, p2GroupId) => {
      const t = updatedTeams.find((x) => x.id === teamId);
      if (t) t.phase2GroupId = p2GroupId;
    };

    if (activeCategory === "U11") {
      newP2Groups = [
        { id: "gE", name: "Poule E (Ligue des Champions)" },
        { id: "gF", name: "Poule F (Ligue des Champions)" },
        { id: "gG", name: "Poule G (Ligue Europa)" },
        { id: "gH", name: "Poule H (Ligue Europa)" },
      ];
      const A = standingsPhase1[groups[0].id] || [];
      const B = standingsPhase1[groups[1].id] || [];
      const C = standingsPhase1[groups[2].id] || [];
      const D = standingsPhase1[groups[3].id] || [];

      // Structure exacte du PDF
      if (A[0]) assign(A[0].id, "gE");
      if (B[1]) assign(B[1].id, "gE");
      if (C[0]) assign(C[0].id, "gE");
      if (D[1]) assign(D[1].id, "gE");
      if (A[1]) assign(A[1].id, "gF");
      if (B[0]) assign(B[0].id, "gF");
      if (C[1]) assign(C[1].id, "gF");
      if (D[0]) assign(D[0].id, "gF");
      if (A[2]) assign(A[2].id, "gG");
      if (B[3]) assign(B[3].id, "gG");
      if (C[2]) assign(C[2].id, "gG");
      if (D[3]) assign(D[3].id, "gG");
      if (A[3]) assign(A[3].id, "gH");
      if (B[2]) assign(B[2].id, "gH");
      if (C[3]) assign(C[3].id, "gH");
      if (D[2]) assign(D[2].id, "gH");
    }

    const finalMatches = matches.filter((m) => m.phase !== 2); // Supprime les anciens matchs de phase 2 s'ils existaient

    setPhase2Groups(newP2Groups);
    setTeams(updatedTeams);
    setMatches(finalMatches);
    saveToCloud({
      phase2Groups: newP2Groups,
      teams: updatedTeams,
      matches: finalMatches,
    });
    setActiveTab("standings");
  };

  const generatePhase2Matches = () => {
    let allMatches = [];
    phase2Groups.forEach((group) => {
      const groupTeams = teams.filter((t) => t.phase2GroupId === group.id);
      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          allMatches.push({
            id: `p2_${groupTeams[i].id}_${groupTeams[j].id}`,
            homeTeamId: groupTeams[i].id,
            awayTeamId: groupTeams[j].id,
            homeScore: null,
            awayScore: null,
            isPlayed: false,
            phase2GroupId: group.id,
            phase: 2,
            time: null,
            pitch: null,
          });
        }
      }
    });

    const interleaved = [];
    const queues = {};
    phase2Groups.forEach((g) => {
      queues[g.id] = allMatches.filter((m) => m.phase2GroupId === g.id);
    });
    let keepGoing = true;
    while (keepGoing) {
      keepGoing = false;
      phase2Groups.forEach((g) => {
        if (queues[g.id] && queues[g.id].length > 0) {
          interleaved.push(queues[g.id].shift());
          keepGoing = true;
        }
      });
    }
    let currentTime = new Date();
    currentTime.setHours(11, 0, 0, 0); // Reprise à 11h00
    const assigned = [];
    let unassigned = [...interleaved];
    while (unassigned.length > 0) {
      let teamsBusy = new Set();
      for (let p = 1; p <= 4; p++) {
        const idx = unassigned.findIndex(
          (m) => !teamsBusy.has(m.homeTeamId) && !teamsBusy.has(m.awayTeamId)
        );
        if (idx !== -1) {
          const match = unassigned[idx];
          match.time = currentTime
            .toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
            .replace(":", "h");
          match.pitch =
            p === 4
              ? "Terrain GITEM"
              : p === 3
              ? "Terrain INTERMARCHE"
              : p === 2
              ? "Terrain BAZARLAND"
              : "Terrain NUENO TRUCKS Pyrénées";
          teamsBusy.add(match.homeTeamId);
          teamsBusy.add(match.awayTeamId);
          assigned.push(match);
          unassigned.splice(idx, 1);
        }
      }
      currentTime.setMinutes(currentTime.getMinutes() + 20);

      // Pause repas APRÈS le match de 12h00 (donc quand l'heure calculée est 12h20)
      if (currentTime.getHours() === 12 && currentTime.getMinutes() > 0) {
        currentTime.setHours(13, 0, 0, 0);
      }
    }
    const finalMatches = [...matches.filter((m) => m.phase !== 2), ...assigned];
    setMatches(finalMatches);
    saveToCloud({ matches: finalMatches });
    setActiveTab("matches");
  };

  const generateBarragesU13 = () => {
    const p1Matches = matches.filter((m) => m.phase === 1 || !m.phase);
    if (p1Matches.length === 0 || !p1Matches.every((m) => m.isPlayed)) {
      setKoError("Terminez la Phase 1 d'abord !");
      setTimeout(() => setKoError(null), 5000);
      return;
    }

    const A = standingsPhase1[groups[0].id] || [];
    const B = standingsPhase1[groups[1].id] || [];
    const C = standingsPhase1[groups[2].id] || [];
    const thirds = [A[2], B[2], C[2]]
      .filter(Boolean)
      .sort(sortTeamsAcrossGroups);

    if (thirds.length < 3) {
      setKoError("Équipes manquantes pour le barrage.");
      setTimeout(() => setKoError(null), 5000);
      return;
    }

    const newMatch = {
      id: `ko_bar_1_${Date.now()}`,
      round: "barrages",
      stage: "Barrages",
      label: "Barrage",
      homeTeamId: thirds[1].id,
      awayTeamId: thirds[2].id,
      homeScore: null,
      awayScore: null,
      isPlayed: false,
      matchIndex: 1,
      time: "17h20",
      pitch: "Terrain NUENO TRUCKS Pyrénées",
    };

    const updatedKo = [
      ...knockoutMatches.filter((m) => m.stage !== "Barrages"),
      newMatch,
    ];
    setKnockoutMatches(updatedKo);
    saveToCloud({ knockoutMatches: updatedKo });
    setKoError(null);
  };

  const generateQuartersU13 = () => {
    const barrage = knockoutMatches.find((m) => m.stage === "Barrages");
    if (!barrage || !barrage.isPlayed || getMatchWinner(barrage) === null) {
      setKoError("Terminez le Barrage d'abord !");
      setTimeout(() => setKoError(null), 5000);
      return;
    }

    const A = standingsPhase1[groups[0].id] || [];
    const B = standingsPhase1[groups[1].id] || [];
    const C = standingsPhase1[groups[2].id] || [];
    const firsts = [A[0], B[0], C[0]]
      .filter(Boolean)
      .sort(sortTeamsAcrossGroups);
    const seconds = [A[1], B[1], C[1]]
      .filter(Boolean)
      .sort(sortTeamsAcrossGroups);
    const thirds = [A[2], B[2], C[2]]
      .filter(Boolean)
      .sort(sortTeamsAcrossGroups);

    const wBar = getMatchWinner(barrage);

    const newMatches = [
      {
        id: `ko_qf1_${Date.now()}`,
        round: "quarters",
        stage: "Quarts de finale",
        label: "Q1 (P)",
        homeTeamId: firsts[0].id,
        awayTeamId: wBar,
        homeScore: null,
        awayScore: null,
        isPlayed: false,
        matchIndex: 1,
        time: "18h00",
        pitch: "Terrain NUENO TRUCKS Pyrénées",
      },
      {
        id: `ko_qf2_${Date.now() + 1}`,
        round: "quarters",
        stage: "Quarts de finale",
        label: "Q2 (P)",
        homeTeamId: firsts[1].id,
        awayTeamId: thirds[0].id,
        homeScore: null,
        awayScore: null,
        isPlayed: false,
        matchIndex: 2,
        time: "18h00",
        pitch: "Terrain BAZARLAND",
      },
      {
        id: `ko_qf3_${Date.now() + 2}`,
        round: "quarters",
        stage: "Quarts de finale",
        label: "Q3 (P)",
        homeTeamId: firsts[2].id,
        awayTeamId: seconds[2].id,
        homeScore: null,
        awayScore: null,
        isPlayed: false,
        matchIndex: 3,
        time: "18h20",
        pitch: "Terrain NUENO TRUCKS Pyrénées",
      },
      {
        id: `ko_qf4_${Date.now() + 3}`,
        round: "quarters",
        stage: "Quarts de finale",
        label: "Q4 (P)",
        homeTeamId: seconds[0].id,
        awayTeamId: seconds[1].id,
        homeScore: null,
        awayScore: null,
        isPlayed: false,
        matchIndex: 4,
        time: "18h20",
        pitch: "Terrain BAZARLAND",
      },
    ];

    const updatedKo = [
      ...knockoutMatches.filter((m) => m.stage !== "Quarts de finale"),
      ...newMatches,
    ];
    setKnockoutMatches(updatedKo);
    saveToCloud({ knockoutMatches: updatedKo });
    setKoError(null);
  };

  const generateSemis = () => {
    const p2Matches = matches.filter((m) => m.phase === 2);
    if (
      activeCategory === "U11" &&
      (phase2Groups.length === 0 ||
        p2Matches.length === 0 ||
        !p2Matches.every((m) => m.isPlayed))
    ) {
      setKoError("Terminez la Phase 2 d'abord !");
      setTimeout(() => setKoError(null), 5000);
      return;
    }

    let newMatches = [];
    const E = standingsPhase2["gE"] || [];
    const F = standingsPhase2["gF"] || [];
    const G = standingsPhase2["gG"] || [];
    const H = standingsPhase2["gH"] || [];

    if (activeCategory === "U11") {
      newMatches = [
        // 13h40 : Ligue Europa et 13-16
        {
          id: `ko_sf3_${Date.now() + 2}`,
          round: "semis",
          stage: "Demi-finales",
          label: "Demi Ligue Europa 1",
          homeTeamId: G[0].id,
          awayTeamId: H[1].id,
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          matchIndex: 3,
          time: "13h40",
          pitch: "Terrain NUENO TRUCKS Pyrénées",
        },
        {
          id: `ko_sf4_${Date.now() + 3}`,
          round: "semis",
          stage: "Demi-finales",
          label: "Demi Ligue Europa 2",
          homeTeamId: H[0].id,
          awayTeamId: G[1].id,
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          matchIndex: 4,
          time: "13h40",
          pitch: "Terrain BAZARLAND",
        },
        {
          id: `ko_cl_1314_${Date.now() + 6}`,
          round: "semis",
          stage: "Matchs de Classement",
          label: "Places 13-14",
          homeTeamId: G[2].id,
          awayTeamId: H[2].id,
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          finalRankWinner: 13,
          finalRankLoser: 14,
          time: "13h40",
          pitch: "Terrain INTERMARCHE",
        },
        {
          id: `ko_cl_1516_${Date.now() + 7}`,
          round: "semis",
          stage: "Matchs de Classement",
          label: "Places 15-16",
          homeTeamId: G[3].id,
          awayTeamId: H[3].id,
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          finalRankWinner: 15,
          finalRankLoser: 16,
          time: "13h40",
          pitch: "Terrain GITEM",
        },

        // 14h00 : LdC et 5-8
        {
          id: `ko_sf1_${Date.now()}`,
          round: "semis",
          stage: "Demi-finales",
          label: "Demi Ligue des Champions 1",
          homeTeamId: E[0].id,
          awayTeamId: F[1].id,
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          matchIndex: 1,
          time: "14h00",
          pitch: "Terrain NUENO TRUCKS Pyrénées",
        },
        {
          id: `ko_sf2_${Date.now() + 1}`,
          round: "semis",
          stage: "Demi-finales",
          label: "Demi Ligue des Champions 2",
          homeTeamId: F[0].id,
          awayTeamId: E[1].id,
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          matchIndex: 2,
          time: "14h00",
          pitch: "Terrain BAZARLAND",
        },
        {
          id: `ko_cl_56_${Date.now() + 4}`,
          round: "semis",
          stage: "Matchs de Classement",
          label: "Places 5-6",
          homeTeamId: E[2].id,
          awayTeamId: F[2].id,
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          finalRankWinner: 5,
          finalRankLoser: 6,
          time: "14h00",
          pitch: "Terrain INTERMARCHE",
        },
        {
          id: `ko_cl_78_${Date.now() + 5}`,
          round: "semis",
          stage: "Matchs de Classement",
          label: "Places 7-8",
          homeTeamId: E[3].id,
          awayTeamId: F[3].id,
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          finalRankWinner: 7,
          finalRankLoser: 8,
          time: "14h00",
          pitch: "Terrain GITEM",
        },
      ];
    } else {
      // U13 Knockouts from Quarters
      const qfs = knockoutMatches
        .filter((m) => m.stage === "Quarts de finale")
        .sort((a, b) => a.matchIndex - b.matchIndex);

      if (
        qfs.length < 4 ||
        !qfs.every((m) => m.isPlayed && getMatchWinner(m) !== null)
      ) {
        setKoError("Terminez les Quarts de finale d'abord !");
        setTimeout(() => setKoError(null), 5000);
        return;
      }

      const barrage = knockoutMatches.find((m) => m.stage === "Barrages");
      const lBar = getMatchLoser(barrage);

      const A = standingsPhase1[groups[0].id] || [];
      const B = standingsPhase1[groups[1].id] || [];
      const C = standingsPhase1[groups[2].id] || [];
      const fourths = [A[3], B[3], C[3]]
        .filter(Boolean)
        .sort(sortTeamsAcrossGroups);

      newMatches = [
        // Demis Secondaires (Consolante)
        {
          id: `ko_sf_s1_${Date.now() + 4}`,
          round: "semis",
          stage: "Demi-finales",
          label: "Demi Secondaire 1",
          homeTeamId: lBar,
          awayTeamId: fourths[2].id,
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          matchIndex: 5,
          time: "18h40",
          pitch: "Terrain NUENO TRUCKS Pyrénées",
        },
        {
          id: `ko_sf_s2_${Date.now() + 5}`,
          round: "semis",
          stage: "Demi-finales",
          label: "Demi Secondaire 2",
          homeTeamId: fourths[0].id,
          awayTeamId: fourths[1].id,
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          matchIndex: 6,
          time: "18h40",
          pitch: "Terrain BAZARLAND",
        },
        // Demis Principales
        {
          id: `ko_sf1_${Date.now()}`,
          round: "semis",
          stage: "Demi-finales",
          label: "Demi Principale 1",
          homeTeamId: getMatchWinner(qfs[0]),
          awayTeamId: getMatchWinner(qfs[2]),
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          matchIndex: 1,
          time: "19h00",
          pitch: "Terrain NUENO TRUCKS Pyrénées",
        },
        {
          id: `ko_sf2_${Date.now() + 1}`,
          round: "semis",
          stage: "Demi-finales",
          label: "Demi Principale 2",
          homeTeamId: getMatchWinner(qfs[1]),
          awayTeamId: getMatchWinner(qfs[3]),
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          matchIndex: 2,
          time: "19h20",
          pitch: "Terrain NUENO TRUCKS Pyrénées",
        },
        // Matchs de Classement (Perdants Quarts)
        {
          id: `ko_cl_58_1_${Date.now() + 2}`,
          round: "semis",
          stage: "Matchs de Classement",
          label: "Croisé 5-8 (1)",
          homeTeamId: getMatchLoser(qfs[0]),
          awayTeamId: getMatchLoser(qfs[2]),
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          matchIndex: 3,
          time: "19h00",
          pitch: "Terrain BAZARLAND",
        },
        {
          id: `ko_cl_58_2_${Date.now() + 3}`,
          round: "semis",
          stage: "Matchs de Classement",
          label: "Croisé 5-8 (2)",
          homeTeamId: getMatchLoser(qfs[1]),
          awayTeamId: getMatchLoser(qfs[3]),
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          matchIndex: 4,
          time: "19h00",
          pitch: "Terrain INTERMARCHE",
        },
      ];
    }

    // Nettoyage robuste pour supprimer toutes traces de l'ancienne nomenclature
    const updatedKo = [
      ...knockoutMatches.filter(
        (m) =>
          m.round !== "semis" &&
          m.stage !== "Demi-finales" &&
          m.stage !== "Matchs de Classement" &&
          !(m.time === "13h40" || m.time === "14h00")
      ),
      ...newMatches,
    ];

    setKnockoutMatches(updatedKo);
    saveToCloud({ knockoutMatches: updatedKo });
    setKoError(null);
  };

  const generateFinals = () => {
    let newMatches = [];

    if (activeCategory === "U11") {
      // Ne sélectionne que les demis (ignorant les matchs de classement)
      const sfs = knockoutMatches
        .filter((m) => m.label && m.label.startsWith("Demi"))
        .sort((a, b) => (a.matchIndex || 0) - (b.matchIndex || 0));

      if (
        sfs.length === 0 ||
        !sfs.every((m) => m.isPlayed && getMatchWinner(m) !== null)
      ) {
        setKoError(
          "Veuillez terminer les Demi-finales (et Tirs au But éventuels) d'abord."
        );
        setTimeout(() => setKoError(null), 5000);
        return;
      }

      newMatches = [
        // 14h20
        {
          id: `ko_f3_${Date.now() + 2}`,
          round: "finals",
          stage: "Finales",
          label: "Finale Ligue Europa (9-10)",
          homeTeamId: getMatchWinner(sfs[2]),
          awayTeamId: getMatchWinner(sfs[3]),
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          finalRankWinner: 9,
          finalRankLoser: 10,
          time: "14h20",
          pitch: "Terrain NUENO TRUCKS Pyrénées",
        },
        {
          id: `ko_f4_${Date.now() + 3}`,
          round: "finals",
          stage: "Matchs de Classement",
          label: "Places 11-12",
          homeTeamId: getMatchLoser(sfs[2]),
          awayTeamId: getMatchLoser(sfs[3]),
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          finalRankWinner: 11,
          finalRankLoser: 12,
          time: "14h20",
          pitch: "Terrain BAZARLAND",
        },
        {
          id: `ko_f2_${Date.now() + 1}`,
          round: "finals",
          stage: "Matchs de Classement",
          label: "Places 3-4",
          homeTeamId: getMatchLoser(sfs[0]),
          awayTeamId: getMatchLoser(sfs[1]),
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          finalRankWinner: 3,
          finalRankLoser: 4,
          time: "14h20",
          pitch: "Terrain INTERMARCHE",
        },

        // 14h40
        {
          id: `ko_f1_${Date.now()}`,
          round: "finals",
          stage: "Finales",
          label: "Finale Ligue des Champions (1-2)",
          homeTeamId: getMatchWinner(sfs[0]),
          awayTeamId: getMatchWinner(sfs[1]),
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          finalRankWinner: 1,
          finalRankLoser: 2,
          time: "14h40",
          pitch: "Terrain NUENO TRUCKS Pyrénées",
        },
      ];
    } else {
      // U13 Finals logic
      const semisP = knockoutMatches
        .filter((m) => m.label.startsWith("Demi Principale"))
        .sort((a, b) => a.matchIndex - b.matchIndex);
      const croises = knockoutMatches
        .filter((m) => m.label.startsWith("Croisé 5-8"))
        .sort((a, b) => a.matchIndex - b.matchIndex);
      const semisS = knockoutMatches
        .filter((m) => m.label.startsWith("Demi Secondaire"))
        .sort((a, b) => a.matchIndex - b.matchIndex);

      if (
        semisP.length < 2 ||
        croises.length < 2 ||
        semisS.length < 2 ||
        !semisP.every((m) => m.isPlayed && getMatchWinner(m) !== null) ||
        !croises.every((m) => m.isPlayed && getMatchWinner(m) !== null) ||
        !semisS.every((m) => m.isPlayed && getMatchWinner(m) !== null)
      ) {
        setKoError("Veuillez terminer toutes les Demi-finales d'abord.");
        setTimeout(() => setKoError(null), 5000);
        return;
      }

      newMatches = [
        // Finales (S)
        {
          id: `ko_f_910_${Date.now() + 1}`,
          round: "finals",
          stage: "Finales",
          label: "Finale Secondaire (9-10)",
          homeTeamId: getMatchWinner(semisS[0]),
          awayTeamId: getMatchWinner(semisS[1]),
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          finalRankWinner: 9,
          finalRankLoser: 10,
          time: "19h20",
          pitch: "Terrain BAZARLAND",
        },
        {
          id: `ko_f_1112_${Date.now()}`,
          round: "finals",
          stage: "Matchs de Classement",
          label: "Places 11-12",
          homeTeamId: getMatchLoser(semisS[0]),
          awayTeamId: getMatchLoser(semisS[1]),
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          finalRankWinner: 11,
          finalRankLoser: 12,
          time: "19h20",
          pitch: "Terrain INTERMARCHE",
        },
        // Matchs de classement (Principal)
        {
          id: `ko_f_34_${Date.now() + 4}`,
          round: "finals",
          stage: "Matchs de Classement",
          label: "Places 3-4",
          homeTeamId: getMatchLoser(semisP[0]),
          awayTeamId: getMatchLoser(semisP[1]),
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          finalRankWinner: 3,
          finalRankLoser: 4,
          time: "19h40",
          pitch: "Terrain NUENO TRUCKS Pyrénées",
        },
        {
          id: `ko_f_56_${Date.now() + 3}`,
          round: "finals",
          stage: "Matchs de Classement",
          label: "Places 5-6",
          homeTeamId: getMatchWinner(croises[0]),
          awayTeamId: getMatchWinner(croises[1]),
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          finalRankWinner: 5,
          finalRankLoser: 6,
          time: "19h40",
          pitch: "Terrain BAZARLAND",
        },
        {
          id: `ko_f_78_${Date.now() + 2}`,
          round: "finals",
          stage: "Matchs de Classement",
          label: "Places 7-8",
          homeTeamId: getMatchLoser(croises[0]),
          awayTeamId: getMatchLoser(croises[1]),
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          finalRankWinner: 7,
          finalRankLoser: 8,
          time: "19h40",
          pitch: "Terrain INTERMARCHE",
        },
        // Finales (P)
        {
          id: `ko_f_12_${Date.now() + 5}`,
          round: "finals",
          stage: "Finales",
          label: "Finale Principale (1-2)",
          homeTeamId: getMatchWinner(semisP[0]),
          awayTeamId: getMatchWinner(semisP[1]),
          homeScore: null,
          awayScore: null,
          isPlayed: false,
          finalRankWinner: 1,
          finalRankLoser: 2,
          time: "20h00",
          pitch: "Terrain NUENO TRUCKS Pyrénées",
        },
      ];
    }

    // Nettoyage robuste
    const updatedKo = [
      ...knockoutMatches.filter(
        (m) =>
          m.round !== "finals" &&
          m.stage !== "Finales" &&
          !(m.time === "14h20" || m.time === "14h40")
      ),
      ...newMatches,
    ];

    setKnockoutMatches(updatedKo);
    saveToCloud({ knockoutMatches: updatedKo });
    setKoError(null);
  };

  const getTeamName = (id) =>
    teams.find((t) => t.id === id)?.name || "Équipe supprimée";
  const getTeamNameWithGroup = (id) => {
    if (id === "Égalité (Tirs au but requis)" || id === "Égalité") return id;
    const team = teams.find((t) => t.id === id);
    if (!team) return "Équipe supprimée";
    const p1Group = groups.find((g) => g.id === team.groupId);
    const p2Group = phase2Groups.find((g) => g.id === team.phase2GroupId);
    // Priorité à l'affichage de la poule Phase 2 si elle existe
    return `${team.name} (${
      p2Group ? p2Group.name.substring(0, 7) : p1Group ? p1Group.name : "?"
    })`;
  };

  // --- RENDUS DES ONGLETS ---
  const renderRules = () => (
    <div className="space-y-6 pb-8">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Règlement du Tournoi
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Vous pouvez zoomer sur les documents en pinçant l'écran avec vos
          doigts.
        </p>
        <div className="space-y-4 max-w-2xl mx-auto">
          <img
            src="https://i.imgur.com/aNrihQ7.png"
            alt="Règlement Page 1"
            className="w-full h-auto rounded-lg border border-slate-200 shadow-sm"
            style={{ touchAction: "pan-x pan-y pinch-zoom" }}
          />
          <img
            src="https://i.imgur.com/uMqvtLz.png"
            alt="Règlement Page 2"
            className="w-full h-auto rounded-lg border border-slate-200 shadow-sm"
            style={{ touchAction: "pan-x pan-y pinch-zoom" }}
          />
        </div>
      </div>
    </div>
  );

  const renderStandings = (title, standingsData, groupsData) => (
    <div className="space-y-8 mt-6">
      <h2 className="text-2xl font-black text-purple-900 border-b-2 border-purple-200 pb-2">
        {title}
      </h2>
      {groupsData.length === 0 && (
        <p className="text-slate-500 italic">
          Générez d'abord cette phase pour voir les poules.
        </p>
      )}
      {groupsData.map((group) => (
        <div
          key={group.id}
          className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200"
        >
          <div className="px-4 py-3 bg-purple-800 text-white font-bold rounded-t-xl">
            {group.name}
          </div>
          <table className="w-full text-sm text-left text-slate-700">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Pos</th>
                <th className="px-4 py-3">Équipe</th>
                <th className="px-4 py-3 text-center">Pts</th>
                <th className="px-4 py-3 text-center">J</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">
                  G
                </th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">
                  N
                </th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">
                  P
                </th>
                <th className="px-4 py-3 text-center">Diff</th>
              </tr>
            </thead>
            <tbody>
              {(standingsData[group.id] || []).map((team, index) => (
                <tr
                  key={team.id}
                  className="border-b border-slate-100 hover:bg-slate-50 last:border-0"
                >
                  <td className="px-4 py-3 font-bold">{index + 1}</td>
                  <td className="px-4 py-3 font-medium">{team.name}</td>
                  <td className="px-4 py-3 text-center font-bold text-purple-700">
                    {team.points}
                  </td>
                  <td className="px-4 py-3 text-center">{team.played}</td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell text-green-600">
                    {team.won}
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell text-slate-400">
                    {team.drawn}
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell text-red-500">
                    {team.lost}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    <span
                      className={
                        team.goalDifference > 0
                          ? "text-green-600"
                          : team.goalDifference < 0
                          ? "text-red-500"
                          : "text-slate-500"
                      }
                    >
                      {team.goalDifference > 0 ? "+" : ""}
                      {team.goalDifference}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );

  const renderMatchesList = (phaseMatches) => {
    if (phaseMatches.length === 0)
      return <p className="text-slate-500 italic">Aucun match généré.</p>;

    const sortedMatches = [...phaseMatches].sort((a, b) => {
      const timeA = a.time || "";
      const timeB = b.time || "";
      if (timeA !== timeB) return timeA.localeCompare(timeB);
      const pitchA = a.pitch || "";
      const pitchB = b.pitch || "";
      return pitchA.localeCompare(pitchB);
    });

    const matchesByTime = {};
    sortedMatches.forEach((m) => {
      const t = m.time || "Non défini";
      if (!matchesByTime[t]) matchesByTime[t] = [];
      matchesByTime[t].push(m);
    });

    return (
      <div className="space-y-6 mt-6">
        {Object.entries(matchesByTime).map(([time, timeMatches]) => {
          const showPauseU13 =
            activeCategory === "U13" &&
            time === "17h00" &&
            phaseMatches[0].phase === 1;
          const showPauseU11 =
            activeCategory === "U11" &&
            time === "13h00" &&
            phaseMatches[0].phase === 2;

          return (
            <React.Fragment key={time}>
              {showPauseU11 && (
                <div className="flex justify-center items-center py-3 px-4 bg-orange-50 border border-orange-200 text-orange-800 font-bold rounded-xl mb-4 shadow-sm">
                  🍽️ Pause Repas (12h20 - 13h00) 🍽️
                </div>
              )}
              <div className="space-y-3">
                <h3 className="font-bold text-lg text-slate-800 border-b pb-2 flex items-center">
                  <Clock size={18} className="mr-2 text-purple-600" /> Heure :{" "}
                  {time}
                </h3>
                <div className="grid gap-3">
                  {timeMatches.map((match) => (
                    <div
                      key={match.id}
                      className={`flex flex-col p-4 bg-white rounded-xl border ${
                        match.isPlayed
                          ? "border-green-200 bg-green-50/30"
                          : "border-slate-200"
                      } shadow-sm`}
                    >
                      {match.pitch && (
                        <div className="flex justify-center items-center text-xs font-semibold text-purple-700 mb-3 bg-purple-100 rounded-full px-3 py-1 w-max mx-auto">
                          <PitchDisplay pitch={match.pitch} />
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row items-center justify-between">
                        <div className="flex-1 text-right font-medium text-slate-800 pr-4">
                          {getTeamNameWithGroup(match.homeTeamId)}
                        </div>
                        <div className="flex items-center space-x-3 my-3 sm:my-0 bg-slate-100 px-4 py-2 rounded-lg">
                          {isAdmin ? (
                            <>
                              <input
                                type="number"
                                value={match.homeScore ?? ""}
                                onChange={(e) =>
                                  handleScoreChange(
                                    match.id,
                                    "homeScore",
                                    e.target.value
                                  )
                                }
                                className="w-12 h-10 text-center font-bold text-lg rounded bg-white border border-slate-300 outline-none"
                                placeholder="-"
                              />
                              <span className="text-slate-400 font-bold">
                                :
                              </span>
                              <input
                                type="number"
                                value={match.awayScore ?? ""}
                                onChange={(e) =>
                                  handleScoreChange(
                                    match.id,
                                    "awayScore",
                                    e.target.value
                                  )
                                }
                                className="w-12 h-10 text-center font-bold text-lg rounded bg-white border border-slate-300 outline-none"
                                placeholder="-"
                              />
                            </>
                          ) : (
                            <div className="flex items-center space-x-2 font-bold text-xl text-slate-800 px-4">
                              <span>{match.homeScore ?? "-"}</span>
                              <span className="text-slate-400">:</span>
                              <span>{match.awayScore ?? "-"}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-left font-medium text-slate-800 pl-4 flex justify-between items-center">
                          <span>{getTeamNameWithGroup(match.awayTeamId)}</span>
                          {isAdmin && match.isPlayed && (
                            <button
                              onClick={() => resetMatch(match.id)}
                              className="text-slate-400 hover:text-red-500 p-1 ml-4"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {showPauseU13 && (
                <div className="flex justify-center items-center py-3 px-4 bg-orange-50 border border-orange-200 text-orange-800 font-bold rounded-xl mt-4 shadow-sm">
                  ☕ Barrage (17h20) et Pause - Début des phases finales à 18h00
                  ☕
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  if (!activeCategory) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <img
          src="https://i.imgur.com/syGnFy0.png"
          alt="Logo FC La Ribère"
          className="w-32 h-32 mb-6 rounded-full bg-white object-contain p-2 border border-purple-200 shadow-md"
        />
        <h1 className="text-3xl sm:text-4xl font-bold text-purple-900 mb-2 text-center">
          Challenge Guy TOUYA 2026
        </h1>
        <p className="text-slate-500 mb-10 text-center text-lg">
          Sélectionnez la catégorie du tournoi
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
          <button
            onClick={() => selectCategory("U11")}
            className="py-8 bg-purple-700 hover:bg-purple-800 text-white rounded-2xl shadow-xl transition-transform hover:scale-105 flex flex-col items-center justify-center space-y-3"
          >
            <Trophy size={40} className="text-purple-200" />
            <span className="text-3xl font-bold tracking-wider">U11</span>
          </button>

          <button
            onClick={() => selectCategory("U13")}
            className="py-8 bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl shadow-xl transition-transform hover:scale-105 flex flex-col items-center justify-center space-y-3"
          >
            <Trophy size={40} className="text-yellow-100" />
            <span className="text-3xl font-bold tracking-wider">U13</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12 relative">
      <header className="bg-white text-purple-900 sticky top-0 z-10 shadow-md border-b border-purple-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setActiveCategory(null)}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-full transition-colors mr-1"
            >
              <ChevronLeft size={24} />
            </button>
            <img
              src="https://i.imgur.com/syGnFy0.png"
              alt="Logo FC La Ribère"
              referrerPolicy="no-referrer"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white object-contain p-0.5 border border-purple-200"
            />
            <h1 className="text-lg sm:text-xl font-bold tracking-tight hidden sm:block">
              Challenge Guy TOUYA{" "}
              <span className="text-purple-600 ml-1">{activeCategory}</span>
            </h1>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight sm:hidden">
              TOUYA{" "}
              <span className="text-purple-600 ml-1">{activeCategory}</span>
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 text-xs font-medium text-slate-500">
              {isSyncing ? (
                <Loader2 size={14} className="animate-spin text-purple-500" />
              ) : (
                <Cloud size={14} className="text-green-500" />
              )}
              <span className="hidden sm:inline">
                {isSyncing ? "Synchronisation..." : "En ligne"}
              </span>
            </div>

            <button
              onClick={handleToggleAdmin}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isAdmin
                  ? "bg-purple-100 text-purple-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {isAdmin ? <Unlock size={14} /> : <Lock size={14} />}
              <span className="hidden sm:inline">
                {isAdmin ? "Mode Admin" : "Vue Publique"}
              </span>
            </button>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 flex space-x-1 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab("standings")}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === "standings"
                ? "border-purple-700 text-purple-800"
                : "border-transparent text-slate-500"
            }`}
          >
            Poules
          </button>
          <button
            onClick={() => setActiveTab("matches")}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === "matches"
                ? "border-purple-700 text-purple-800"
                : "border-transparent text-slate-500"
            }`}
          >
            Matchs
          </button>
          <button
            onClick={() => setActiveTab("knockouts")}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap flex items-center ${
              activeTab === "knockouts"
                ? "border-purple-700 text-purple-800"
                : "border-transparent text-slate-500"
            }`}
          >
            <GitMerge size={14} className="mr-1.5" /> Phases Finales
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap flex items-center ${
              activeTab === "rules"
                ? "border-purple-700 text-purple-800"
                : "border-transparent text-slate-500"
            }`}
          >
            <FileText size={14} className="mr-1.5" /> Règlement
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap flex items-center ${
                activeTab === "settings"
                  ? "border-yellow-500 text-yellow-600"
                  : "border-transparent text-slate-500"
              }`}
            >
              <Settings size={14} className="mr-1.5" /> Admin
            </button>
          )}
        </div>
      </header>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">
                  Accès Administrateur
                </h3>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Code d'accès
                  </label>
                  <input
                    autoFocus
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${
                      loginError
                        ? "border-red-500 bg-red-50"
                        : "border-slate-300 focus:border-purple-500"
                    }`}
                    placeholder="••••••••"
                  />
                  {loginError && (
                    <p className="text-red-500 text-xs mt-1">
                      Code incorrect. Réessayez.
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full bg-purple-700 text-white font-bold py-2 rounded-lg hover:bg-purple-800 transition-colors"
                >
                  Déverrouiller
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-green-700 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 z-50 transition-all duration-300">
          <div className="bg-green-600 rounded-full p-1">
            <Check size={16} />
          </div>
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 mt-6">
        {/* BANNIÈRE SPONSOR (Globale) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center space-y-3 hover:shadow-md transition-shadow mb-8">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-widest text-center">
            Avec le soutien de nos partenaires
          </span>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            <a
              href="https://www.ntp-nueno-pau.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <img
                src="https://i.imgur.com/gsTY5B8.png"
                alt="Sponsor NUENO TRUCKS Pyrénées"
                className="h-10 sm:h-14 w-auto object-contain"
              />
            </a>
            <a
              href="https://www.bazarland.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <img
                src="https://i.imgur.com/PMbVMAk.png"
                alt="Sponsor Bazarland"
                className="h-10 sm:h-14 w-auto object-contain"
              />
            </a>
            <a
              href="https://www.gitem.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <img
                src="https://i.imgur.com/2p97Yqh.png"
                alt="Sponsor GITEM"
                className="h-10 sm:h-14 w-auto object-contain"
              />
            </a>
            <a
              href="https://www.intermarche.com/magasins/01060/bordes-64510/infos-pratiques?utm_source=gmb"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <img
                src="https://i.imgur.com/tJhHAtM.png"
                alt="Sponsor Intermarché"
                className="h-10 sm:h-14 w-auto object-contain"
              />
            </a>
            <a
              href="https://www.sportr.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <img
                src="https://i.imgur.com/93uykTI.png"
                alt="Sponsor Sport R"
                className="h-10 sm:h-14 w-auto object-contain"
              />
            </a>
            <a
              href="https://www.7radio.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <img
                src="https://i.imgur.com/00kdI5S.png"
                alt="Sponsor 7 Radio"
                className="h-10 sm:h-14 w-auto object-contain"
              />
            </a>
            <a
              href="https://www.lorangebleue.fr/clubs/pau-est-assat/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <img
                src="https://i.imgur.com/RpvxftE.png"
                alt="Sponsor L'Orange Bleue"
                className="h-10 sm:h-14 w-auto object-contain"
              />
            </a>
            <a
              href="https://bernede-ramonage.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <img
                src="https://i.imgur.com/6Ao1H2R.png"
                alt="Sponsor Bernède Ramonage"
                className="h-10 sm:h-14 w-auto object-contain"
              />
            </a>
            <a
              href="https://www.facebook.com/horticulturepoumes/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <img
                src="https://i.imgur.com/tpc0eYQ.png"
                alt="Sponsor Horticulture Poumès"
                className="h-10 sm:h-14 w-auto object-contain"
              />
            </a>
            <a
              href="https://www.maxiliterie.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <img
                src="https://i.imgur.com/UioObpd.png"
                alt="Sponsor Maxi Literie"
                className="h-10 sm:h-14 w-auto object-contain"
              />
            </a>
            <a
              href="https://www.pagesjaunes.fr/pros/61179846"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <img
                src="https://i.imgur.com/kM3SdGB.png"
                alt="Sponsor Partenaire"
                className="h-10 sm:h-14 w-auto object-contain"
              />
            </a>
            <a
              href="https://autoecoledominique.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <img
                src="https://i.imgur.com/sDXAQDu.png"
                alt="Sponsor Auto École Dominique"
                className="h-10 sm:h-14 w-auto object-contain"
              />
            </a>
            <a
              href="https://rambo-construction.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <img
                src="https://i.imgur.com/bEgEYIV.png"
                alt="Sponsor Rambo Construction"
                className="h-10 sm:h-14 w-auto object-contain"
              />
            </a>
          </div>
        </div>

        {/* ONGLET : POULES & CLASSEMENT */}
        {activeTab === "standings" && (
          <div>
            {renderStandings(
              "Phase 1 : Poules Qualificatives",
              standingsPhase1,
              groups
            )}

            {activeCategory === "U11" && phase2Groups.length > 0 && (
              <div className="mt-12">
                {renderStandings(
                  "Phase 2 : Ligue des Champions & Europa",
                  standingsPhase2,
                  phase2Groups
                )}
              </div>
            )}

            {isAdmin && activeCategory === "U11" && (
              <div className="mt-10 bg-blue-50 p-6 rounded-xl border border-blue-200 text-center">
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  {phase2Groups.length > 0
                    ? "Mettre à jour la Phase 2"
                    : "Générer la Phase 2"}
                </h3>
                <p className="text-blue-700 text-sm mb-4">
                  Répartit les équipes en LdC et Ligue Europa selon leur
                  classement de Phase 1.
                </p>
                <button
                  onClick={generatePhase2Groups}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center mx-auto"
                >
                  <ArrowRightCircle className="mr-2" size={18} />{" "}
                  {phase2Groups.length > 0
                    ? "Regénérer la Phase 2"
                    : "Lancer la Phase 2"}
                </button>
                {koError && (
                  <p className="text-red-500 font-bold mt-3 text-sm">
                    {koError}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ONGLET : MATCHS */}
        {activeTab === "matches" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-purple-200 pb-2 mb-6">
              <h2 className="text-2xl font-black text-purple-900 mb-4 sm:mb-0">
                Phase 1
              </h2>
              {isAdmin && (
                <button
                  onClick={generatePhase1Matches}
                  className="px-4 py-2 bg-purple-700 text-white text-sm font-medium rounded-lg hover:bg-purple-800 transition-colors"
                >
                  {matches.filter((m) => m.phase === 1 || !m.phase).length > 0
                    ? "Regénérer les matchs P1"
                    : "Générer les matchs P1"}
                </button>
              )}
            </div>
            {renderMatchesList(
              matches.filter((m) => m.phase === 1 || !m.phase)
            )}

            {activeCategory === "U11" && phase2Groups.length > 0 && (
              <div className="mt-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-blue-200 pb-2 mb-6">
                  <h2 className="text-2xl font-black text-blue-900 mb-4 sm:mb-0">
                    Phase 2
                  </h2>
                  {isAdmin && (
                    <button
                      onClick={generatePhase2Matches}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {matches.filter((m) => m.phase === 2).length > 0
                        ? "Regénérer les matchs P2 (11h00)"
                        : "Générer les matchs P2 (11h00)"}
                    </button>
                  )}
                </div>
                {renderMatchesList(matches.filter((m) => m.phase === 2))}
              </div>
            )}
          </div>
        )}

        {/* ONGLET : PHASES FINALES */}
        {activeTab === "knockouts" && (
          <div className="space-y-8">
            {koError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <strong className="font-bold">Attention: </strong>
                <span className="block sm:inline">{koError}</span>
              </div>
            )}
            {(podium.first || podium.third) && (
              <div className="bg-gradient-to-br from-yellow-50 to-amber-100 p-6 rounded-xl border border-yellow-200 shadow-sm mb-8 text-center">
                <h3 className="font-bold text-xl text-yellow-800 mb-4 flex items-center justify-center">
                  <Medal className="w-6 h-6 mr-2" /> Podium Final
                </h3>
                <div className="space-y-3">
                  {podium.first && (
                    <div className="text-lg font-bold bg-white px-6 py-3 rounded-full shadow-sm border border-yellow-300">
                      🥇 1. {getTeamNameWithGroup(podium.first)}
                    </div>
                  )}
                  {podium.second && (
                    <div className="text-base font-semibold bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-300">
                      🥈 2. {getTeamNameWithGroup(podium.second)}
                    </div>
                  )}
                  {podium.third && (
                    <div className="text-sm font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-orange-200">
                      🥉 3. {getTeamNameWithGroup(podium.third)}
                    </div>
                  )}
                </div>

                {isAdmin && fullRanking.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-yellow-200/50">
                    <button
                      onClick={() => setShowFullRanking(!showFullRanking)}
                      className="mx-auto block px-6 py-2 bg-yellow-100 text-yellow-800 font-bold rounded-lg hover:bg-yellow-200 transition-colors shadow-sm"
                    >
                      {showFullRanking
                        ? "Masquer le classement complet"
                        : "Voir le classement complet"}
                    </button>
                    {showFullRanking && (
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                        {fullRanking.map((teamId, index) => (
                          <div
                            key={teamId}
                            className="flex items-center px-4 py-3 bg-white border border-yellow-100 rounded-xl shadow-sm"
                          >
                            <span className="font-black text-xl text-slate-300 w-10">
                              {index + 1}.
                            </span>
                            <span className="font-bold text-slate-700">
                              {getTeamNameWithGroup(teamId)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {knockoutStages.map((stage) => {
              // On trie les matchs de chaque section par horaire pour garder la logique chronologique !
              const stageMatches = knockoutMatches
                .filter((m) => m.stage === stage)
                .sort(
                  (a, b) =>
                    (a.time || "").localeCompare(b.time || "") ||
                    (a.matchIndex || 0) - (b.matchIndex || 0)
                );
              if (!isAdmin && stageMatches.length === 0) return null;

              return (
                <div
                  key={stage}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  <div className="px-4 py-3 bg-purple-800 text-white font-bold flex justify-between items-center text-sm">
                    <span>{stage}</span>
                    {isAdmin && (
                      <div className="flex space-x-2">
                        {stage === "Barrages" && activeCategory === "U13" && (
                          <button
                            onClick={generateBarragesU13}
                            className="bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded transition-colors shadow-sm text-xs sm:text-sm"
                          >
                            {knockoutMatches.some((m) => m.stage === "Barrages")
                              ? "Regénérer"
                              : "Générer Auto"}
                          </button>
                        )}
                        {stage === "Quarts de finale" &&
                          activeCategory === "U13" && (
                            <button
                              onClick={generateQuartersU13}
                              className="bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded transition-colors shadow-sm text-xs sm:text-sm"
                            >
                              {knockoutMatches.some(
                                (m) => m.stage === "Quarts de finale"
                              )
                                ? "Regénérer"
                                : "Générer Auto"}
                            </button>
                          )}
                        {stage === "Demi-finales" && (
                          <button
                            onClick={generateSemis}
                            className="bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded transition-colors shadow-sm text-xs sm:text-sm"
                          >
                            {knockoutMatches.some((m) => m.round === "semis")
                              ? "Regénérer Auto"
                              : "Générer Auto"}
                          </button>
                        )}
                        {stage === "Finales" && (
                          <button
                            onClick={generateFinals}
                            className="bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded transition-colors shadow-sm text-xs sm:text-sm"
                          >
                            {knockoutMatches.some((m) => m.round === "finals")
                              ? "Regénérer Auto"
                              : "Générer Auto"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-4 bg-slate-50">
                    {stageMatches.length === 0 && (
                      <p className="text-slate-400 text-sm text-center italic py-2">
                        En attente des résultats...
                      </p>
                    )}
                    {stageMatches.map((match) => (
                      <div
                        key={match.id}
                        className={`flex flex-col p-4 bg-white rounded-xl border ${
                          match.isPlayed
                            ? "border-green-200 bg-green-50/30"
                            : "border-slate-200"
                        } shadow-sm relative`}
                      >
                        {isAdmin && (
                          <button
                            onClick={() => deleteKnockoutMatch(match.id)}
                            className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1.5 hover:bg-red-200 transition-colors z-10"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}

                        <div className="flex justify-center items-center mb-3 border-b border-slate-100 pb-2">
                          {isAdmin ? (
                            <input
                              type="text"
                              value={match.label || stage}
                              onChange={(e) =>
                                handleLabelChange(match.id, e.target.value)
                              }
                              className="text-xs font-bold text-center text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full outline-none focus:ring-2 focus:ring-purple-300 w-full max-w-xs"
                            />
                          ) : (
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
                              {match.label || stage}
                            </span>
                          )}
                        </div>

                        {(match.time || match.pitch) && (
                          <div className="flex justify-center items-center text-xs font-semibold text-purple-700 mb-3 bg-purple-50 rounded-full px-3 py-1 w-max mx-auto">
                            {match.time && (
                              <span className="flex items-center">
                                <Clock size={13} className="mr-1" />{" "}
                                {match.time}
                              </span>
                            )}
                            {match.time && match.pitch && (
                              <span className="text-purple-300 mx-2">•</span>
                            )}
                            {match.pitch && (
                              <PitchDisplay pitch={match.pitch} />
                            )}
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row items-center justify-between">
                          <div className="flex-1 text-right font-medium pr-4">
                            {getTeamNameWithGroup(match.homeTeamId)}
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="flex items-center space-x-3 my-3 sm:my-0 bg-slate-100 px-4 py-2 rounded-lg">
                              {isAdmin ? (
                                <>
                                  <input
                                    type="number"
                                    value={match.homeScore ?? ""}
                                    onChange={(e) =>
                                      handleScoreChange(
                                        match.id,
                                        "homeScore",
                                        e.target.value,
                                        true
                                      )
                                    }
                                    className="w-12 h-10 text-center font-bold outline-none"
                                    placeholder="-"
                                  />
                                  <span className="text-slate-400 font-bold">
                                    :
                                  </span>
                                  <input
                                    type="number"
                                    value={match.awayScore ?? ""}
                                    onChange={(e) =>
                                      handleScoreChange(
                                        match.id,
                                        "awayScore",
                                        e.target.value,
                                        true
                                      )
                                    }
                                    className="w-12 h-10 text-center font-bold outline-none"
                                    placeholder="-"
                                  />
                                </>
                              ) : (
                                <div className="flex items-center space-x-2 font-bold px-4">
                                  <span>{match.homeScore ?? "-"}</span>
                                  <span className="text-slate-400">:</span>
                                  <span>{match.awayScore ?? "-"}</span>
                                </div>
                              )}
                            </div>
                            {match.homeScore !== null &&
                              match.homeScore === match.awayScore && (
                                <div className="flex items-center space-x-2 mt-2 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                                  <span className="text-[10px] font-bold text-blue-700 uppercase">
                                    TAB
                                  </span>
                                  {isAdmin ? (
                                    <>
                                      <input
                                        type="number"
                                        value={match.homePenalties ?? ""}
                                        onChange={(e) =>
                                          handleScoreChange(
                                            match.id,
                                            "homePenalties",
                                            e.target.value,
                                            true
                                          )
                                        }
                                        className="w-8 h-6 text-center text-xs font-bold border rounded outline-none"
                                        placeholder="-"
                                      />
                                      <span className="text-blue-300 font-bold text-xs">
                                        -
                                      </span>
                                      <input
                                        type="number"
                                        value={match.awayPenalties ?? ""}
                                        onChange={(e) =>
                                          handleScoreChange(
                                            match.id,
                                            "awayPenalties",
                                            e.target.value,
                                            true
                                          )
                                        }
                                        className="w-8 h-6 text-center text-xs font-bold border rounded outline-none"
                                        placeholder="-"
                                      />
                                    </>
                                  ) : (
                                    <span className="text-xs font-bold text-blue-800">
                                      {match.homePenalties ?? "-"} -{" "}
                                      {match.awayPenalties ?? "-"}
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>
                          <div className="flex-1 text-left font-medium pl-4 flex justify-between items-center">
                            <span>
                              {getTeamNameWithGroup(match.awayTeamId)}
                            </span>
                            {isAdmin && match.isPlayed && (
                              <button
                                onClick={() => resetMatch(match.id, true)}
                                className="text-slate-400 hover:text-red-500 p-1 ml-4"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ONGLET : REGLEMENT */}
        {activeTab === "rules" && renderRules()}

        {/* ONGLET : ADMIN */}
        {activeTab === "settings" && isAdmin && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-600" /> Équipes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200"
                >
                  <input
                    type="text"
                    value={group.name}
                    onChange={(e) =>
                      handleGroupNameChange(group.id, e.target.value)
                    }
                    className="font-bold text-slate-800 bg-white border border-slate-300 rounded px-2 py-1 w-full mb-4 outline-none"
                  />
                  <ul className="space-y-2 mb-4">
                    {teams
                      .filter((t) => t.groupId === group.id)
                      .map((team) => (
                        <li
                          key={team.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="text"
                            value={team.name}
                            onChange={(e) =>
                              handleTeamNameChange(team.id, e.target.value)
                            }
                            className="flex-1 text-sm bg-white border border-slate-300 rounded px-2 py-1 outline-none"
                          />
                          <button
                            onClick={() => deleteTeam(team.id)}
                            className="text-red-400 hover:text-red-600 p-1 bg-white rounded border border-slate-200"
                          >
                            <Trash2 size={14} />
                          </button>
                        </li>
                      ))}
                  </ul>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTeamInputs[group.id] || ""}
                      onChange={(e) =>
                        setNewTeamInputs({
                          ...newTeamInputs,
                          [group.id]: e.target.value,
                        })
                      }
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddTeam(group.id)
                      }
                      placeholder="Ajouter équipe..."
                      className="flex-1 text-sm px-2 py-1 border border-slate-300 rounded outline-none"
                    />
                    <button
                      onClick={() => handleAddTeam(group.id)}
                      className="px-2 py-1 bg-purple-800 text-white rounded"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
