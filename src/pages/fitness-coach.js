import React, { useEffect, useMemo, useState } from 'react';
import Layout from '@theme/Layout';
import styles from './fitness-coach.module.css';

const STORAGE_KEY = 'fitness-coach-v1';

const today = new Date().toISOString().slice(0, 10);

const defaultState = {
  selectedDate: today,
  foods: [
    { id: crypto.randomUUID(), name: 'Flocons d\'avoine', kcal: 370, protein: 13, carbs: 59, fat: 7, source: 'manuel' },
    { id: crypto.randomUUID(), name: 'Blanc de poulet', kcal: 121, protein: 23, carbs: 0, fat: 3, source: 'manuel' },
    { id: crypto.randomUUID(), name: 'Riz basmati cuit', kcal: 130, protein: 2.7, carbs: 28, fat: 0.3, source: 'manuel' },
  ],
  entries: [],
  biometrics: [],
  workouts: [
    { id: crypto.randomUUID(), name: 'Squat', category: 'Jambes' },
    { id: crypto.randomUUID(), name: 'Développé couché', category: 'Pectoraux' },
    { id: crypto.randomUUID(), name: 'Soulevé de terre', category: 'Dos' },
  ],
  sessions: [],
};

const emptyFood = { name: '', kcal: '', protein: '', carbs: '', fat: '' };

const toNumber = (v) => Number.parseFloat(v || 0);

function computeMacros(food, grams) {
  const ratio = grams / 100;
  return {
    kcal: food.kcal * ratio,
    protein: food.protein * ratio,
    carbs: food.carbs * ratio,
    fat: food.fat * ratio,
  };
}

export default function FitnessCoachPage() {
  const [state, setState] = useState(defaultState);
  const [foodForm, setFoodForm] = useState(emptyFood);
  const [entryForm, setEntryForm] = useState({ foodId: '', grams: 100, meal: 'repas' });
  const [biometricForm, setBiometricForm] = useState({ date: today, weight: '', systolic: '', diastolic: '' });
  const [sessionForm, setSessionForm] = useState({ date: today, exerciseId: '', sets: '', reps: '', load: '', notes: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchStatus, setSearchStatus] = useState('idle');

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setState({ ...defaultState, ...parsed });
      } catch (error) {
        console.error('Impossible de charger les données locales', error);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const entriesForDay = useMemo(
    () => state.entries.filter((entry) => entry.date === state.selectedDate),
    [state.entries, state.selectedDate],
  );

  const dayTotals = useMemo(() => {
    return entriesForDay.reduce(
      (acc, entry) => ({
        kcal: acc.kcal + entry.macros.kcal,
        protein: acc.protein + entry.macros.protein,
        carbs: acc.carbs + entry.macros.carbs,
        fat: acc.fat + entry.macros.fat,
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }, [entriesForDay]);

  const biometricsForDay = useMemo(
    () => state.biometrics.find((entry) => entry.date === state.selectedDate),
    [state.biometrics, state.selectedDate],
  );

  const sessionsForDay = useMemo(
    () => state.sessions.filter((entry) => entry.date === state.selectedDate),
    [state.sessions, state.selectedDate],
  );

  const promptForChatGPT = useMemo(() => {
    const exerciseLines = sessionsForDay
      .map((s) => `- ${s.exerciseName}: ${s.sets}x${s.reps} @ ${s.load}kg (${s.notes || 'RAS'})`)
      .join('\n') || '- Aucune séance renseignée';

    const nutritionLines = entriesForDay
      .map((e) => `- ${e.meal} | ${e.foodName} (${e.grams}g): ${e.macros.kcal.toFixed(0)} kcal`) 
      .join('\n') || '- Aucun aliment saisi';

    const tension = biometricsForDay
      ? `${biometricsForDay.systolic}/${biometricsForDay.diastolic} mmHg`
      : 'Non renseignée';

    const poids = biometricsForDay?.weight ? `${biometricsForDay.weight} kg` : 'Non renseigné';

    return [
      `Agis comme coach nutrition + musculation. Analyse ma journée du ${state.selectedDate}.`,
      `Poids: ${poids}. Tension: ${tension}.`,
      `Macros totales: ${dayTotals.kcal.toFixed(0)} kcal, ${dayTotals.protein.toFixed(1)}g protéines, ${dayTotals.carbs.toFixed(1)}g glucides, ${dayTotals.fat.toFixed(1)}g lipides.`,
      'Détail nutrition:',
      nutritionLines,
      'Détail entraînement:',
      exerciseLines,
      'Donne: 1) points positifs, 2) risques/surcharge éventuelle, 3) ajustements pour demain (kcal/macros + séance).',
    ].join('\n');
  }, [biometricsForDay, dayTotals, entriesForDay, sessionsForDay, state.selectedDate]);

  async function searchFoodOnWeb() {
    if (!searchQuery.trim()) return;
    setSearchStatus('loading');
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        searchQuery,
      )}&search_simple=1&action=process&json=1&page_size=5`;
      const response = await fetch(url);
      const data = await response.json();
      const mapped = (data.products || [])
        .filter((p) => p.product_name && p.nutriments)
        .map((product) => ({
          id: product.id || product._id,
          name: product.product_name,
          brand: product.brands,
          url: `https://world.openfoodfacts.org/product/${product.code || product.id}`,
          kcal: product.nutriments['energy-kcal_100g'] || 0,
          protein: product.nutriments.proteins_100g || 0,
          carbs: product.nutriments.carbohydrates_100g || 0,
          fat: product.nutriments.fat_100g || 0,
        }));
      setSearchResults(mapped);
      setSearchStatus('done');
    } catch (error) {
      console.error(error);
      setSearchStatus('error');
    }
  }

  function addManualFood(e) {
    e.preventDefault();
    if (!foodForm.name.trim()) return;
    const food = {
      id: crypto.randomUUID(),
      name: foodForm.name.trim(),
      kcal: toNumber(foodForm.kcal),
      protein: toNumber(foodForm.protein),
      carbs: toNumber(foodForm.carbs),
      fat: toNumber(foodForm.fat),
      source: 'manuel',
    };
    setState((prev) => ({ ...prev, foods: [food, ...prev.foods] }));
    setFoodForm(emptyFood);
  }

  function importWebFood(product) {
    const food = {
      id: crypto.randomUUID(),
      name: product.brand ? `${product.name} (${product.brand})` : product.name,
      kcal: toNumber(product.kcal),
      protein: toNumber(product.protein),
      carbs: toNumber(product.carbs),
      fat: toNumber(product.fat),
      source: 'web-vérifié',
      sourceUrl: product.url,
    };
    setState((prev) => ({ ...prev, foods: [food, ...prev.foods] }));
  }

  function addEntry(e) {
    e.preventDefault();
    const food = state.foods.find((item) => item.id === entryForm.foodId);
    if (!food) return;
    const grams = toNumber(entryForm.grams);
    const macros = computeMacros(food, grams);
    const entry = {
      id: crypto.randomUUID(),
      date: state.selectedDate,
      foodId: food.id,
      foodName: food.name,
      meal: entryForm.meal,
      grams,
      macros,
    };
    setState((prev) => ({ ...prev, entries: [entry, ...prev.entries] }));
  }

  function saveBiometrics(e) {
    e.preventDefault();
    const record = {
      date: biometricForm.date,
      weight: toNumber(biometricForm.weight),
      systolic: toNumber(biometricForm.systolic),
      diastolic: toNumber(biometricForm.diastolic),
    };
    setState((prev) => {
      const filtered = prev.biometrics.filter((b) => b.date !== biometricForm.date);
      return { ...prev, biometrics: [record, ...filtered] };
    });
  }

  function addSession(e) {
    e.preventDefault();
    const exercise = state.workouts.find((w) => w.id === sessionForm.exerciseId);
    if (!exercise) return;
    const session = {
      id: crypto.randomUUID(),
      date: sessionForm.date,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: toNumber(sessionForm.sets),
      reps: toNumber(sessionForm.reps),
      load: toNumber(sessionForm.load),
      notes: sessionForm.notes,
    };
    setState((prev) => ({ ...prev, sessions: [session, ...prev.sessions] }));
  }

  return (
    <Layout title="Fitness Tracker" description="Suivi nutrition, biométrie et entraînement">
      <main className={styles.page}>
        <h1>Fitness Tracker personnel</h1>
        <p className={styles.subtitle}>Suivi nutrition, tension, poids, séances et prompt prêt pour ChatGPT.</p>

        <section className={styles.card}>
          <label>
            Date de suivi
            <input
              type="date"
              value={state.selectedDate}
              onChange={(e) => setState((prev) => ({ ...prev, selectedDate: e.target.value }))}
            />
          </label>
        </section>

        <div className={styles.grid}>
          <section className={styles.card}>
            <h2>1) Ajouter des aliments</h2>
            <form onSubmit={addManualFood} className={styles.formGrid}>
              <input placeholder="Nom" value={foodForm.name} onChange={(e) => setFoodForm((p) => ({ ...p, name: e.target.value }))} />
              <input placeholder="kcal/100g" type="number" value={foodForm.kcal} onChange={(e) => setFoodForm((p) => ({ ...p, kcal: e.target.value }))} />
              <input placeholder="Prot/100g" type="number" value={foodForm.protein} onChange={(e) => setFoodForm((p) => ({ ...p, protein: e.target.value }))} />
              <input placeholder="Gluc/100g" type="number" value={foodForm.carbs} onChange={(e) => setFoodForm((p) => ({ ...p, carbs: e.target.value }))} />
              <input placeholder="Lip/100g" type="number" value={foodForm.fat} onChange={(e) => setFoodForm((p) => ({ ...p, fat: e.target.value }))} />
              <button type="submit">Ajouter aliment manuel</button>
            </form>

            <div className={styles.inlineSearch}>
              <input
                placeholder="Recherche web (OpenFoodFacts)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="button" onClick={searchFoodOnWeb}>Chercher</button>
            </div>
            {searchStatus === 'loading' && <p>Recherche en cours…</p>}
            {searchStatus === 'error' && <p>Erreur API: vérifie la connexion réseau.</p>}
            {searchResults.length > 0 && (
              <ul className={styles.list}>
                {searchResults.map((item) => (
                  <li key={item.id}>
                    <div>
                      <strong>{item.name}</strong> <small>{item.brand}</small>
                      <p>
                        {item.kcal} kcal | P {item.protein} | G {item.carbs} | L {item.fat} (100g)
                      </p>
                      <a href={item.url} target="_blank" rel="noreferrer">Voir source</a>
                    </div>
                    <button type="button" onClick={() => importWebFood(item)}>Importer & vérifier</button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.card}>
            <h2>2) Saisie nutrition du jour</h2>
            <form onSubmit={addEntry} className={styles.formGrid}>
              <select value={entryForm.foodId} onChange={(e) => setEntryForm((p) => ({ ...p, foodId: e.target.value }))}>
                <option value="">Choisir aliment</option>
                {state.foods.map((food) => (
                  <option key={food.id} value={food.id}>{food.name} ({food.source})</option>
                ))}
              </select>
              <select value={entryForm.meal} onChange={(e) => setEntryForm((p) => ({ ...p, meal: e.target.value }))}>
                <option value="petit-déjeuner">Petit-déjeuner</option>
                <option value="déjeuner">Déjeuner</option>
                <option value="collation">Collation</option>
                <option value="dîner">Dîner</option>
              </select>
              <input type="number" value={entryForm.grams} onChange={(e) => setEntryForm((p) => ({ ...p, grams: e.target.value }))} />
              <button type="submit">Ajouter au jour</button>
            </form>

            <table className={styles.table}>
              <thead>
                <tr><th>kcal</th><th>Protéines</th><th>Glucides</th><th>Lipides</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>{dayTotals.kcal.toFixed(0)}</td>
                  <td>{dayTotals.protein.toFixed(1)} g</td>
                  <td>{dayTotals.carbs.toFixed(1)} g</td>
                  <td>{dayTotals.fat.toFixed(1)} g</td>
                </tr>
              </tbody>
            </table>

            <ul className={styles.list}>
              {entriesForDay.map((entry) => (
                <li key={entry.id}>
                  <strong>{entry.meal}</strong> - {entry.foodName} ({entry.grams}g) = {entry.macros.kcal.toFixed(0)} kcal
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className={styles.grid}>
          <section className={styles.card}>
            <h2>3) Poids et tension</h2>
            <form onSubmit={saveBiometrics} className={styles.formGrid}>
              <input type="date" value={biometricForm.date} onChange={(e) => setBiometricForm((p) => ({ ...p, date: e.target.value }))} />
              <input type="number" step="0.1" placeholder="Poids (kg)" value={biometricForm.weight} onChange={(e) => setBiometricForm((p) => ({ ...p, weight: e.target.value }))} />
              <input type="number" placeholder="Tension systolique" value={biometricForm.systolic} onChange={(e) => setBiometricForm((p) => ({ ...p, systolic: e.target.value }))} />
              <input type="number" placeholder="Tension diastolique" value={biometricForm.diastolic} onChange={(e) => setBiometricForm((p) => ({ ...p, diastolic: e.target.value }))} />
              <button type="submit">Enregistrer</button>
            </form>
            {biometricsForDay ? (
              <p>
                {state.selectedDate}: {biometricsForDay.weight} kg | {biometricsForDay.systolic}/{biometricsForDay.diastolic} mmHg
              </p>
            ) : <p>Aucune mesure pour la date sélectionnée.</p>}
          </section>

          <section className={styles.card}>
            <h2>4) Séances muscu (home gym)</h2>
            <form onSubmit={addSession} className={styles.formGrid}>
              <input type="date" value={sessionForm.date} onChange={(e) => setSessionForm((p) => ({ ...p, date: e.target.value }))} />
              <select value={sessionForm.exerciseId} onChange={(e) => setSessionForm((p) => ({ ...p, exerciseId: e.target.value }))}>
                <option value="">Choisir exo</option>
                {state.workouts.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>{exercise.name} - {exercise.category}</option>
                ))}
              </select>
              <input type="number" placeholder="Séries" value={sessionForm.sets} onChange={(e) => setSessionForm((p) => ({ ...p, sets: e.target.value }))} />
              <input type="number" placeholder="Reps" value={sessionForm.reps} onChange={(e) => setSessionForm((p) => ({ ...p, reps: e.target.value }))} />
              <input type="number" placeholder="Charge (kg)" value={sessionForm.load} onChange={(e) => setSessionForm((p) => ({ ...p, load: e.target.value }))} />
              <input placeholder="Notes" value={sessionForm.notes} onChange={(e) => setSessionForm((p) => ({ ...p, notes: e.target.value }))} />
              <button type="submit">Ajouter série</button>
            </form>
            <ul className={styles.list}>
              {sessionsForDay.map((session) => (
                <li key={session.id}>
                  {session.exerciseName}: {session.sets}x{session.reps} @ {session.load}kg ({session.notes || 'RAS'})
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className={styles.card}>
          <h2>5) Prompt généré pour ChatGPT</h2>
          <textarea className={styles.prompt} readOnly value={promptForChatGPT} />
        </section>
      </main>
    </Layout>
  );
}
