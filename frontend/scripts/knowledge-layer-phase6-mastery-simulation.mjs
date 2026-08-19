// =============================================================================
// NEXUS Knowledge Layer – Phase 6 Facet Mastery & Cooldown Simulation
//
// Simulates 100 sessions x 15 questions under different facet mastery profiles
// and reports selection frequency, inter-question gaps, and diversity metrics.
//
// Profiles:
// A) neutral        - every facet starts at 0
// B) oneWeak        - one facet locked at -5, rest at 0
// C) severalWeak    - three facets locked at -3, rest at 0
// D) severalMastered- three facets locked at +5, rest at 0
// E) realistic      - mixed mastery roughly shaped like a mid-game learner
// =============================================================================

import {
  getAllKnowledgeItems,
  generateQuestion,
  listApplicableTemplates,
  generateBalancedQuestion,
  createBalancerState,
  recordFacetCorrect,
  recordFacetWrong,
  setFacetMasteryOverride,
} from '../src/lib/knowledge/index.js';

function allFacetIds() {
  const items = getAllKnowledgeItems();
  const facets = new Set();
  for (const item of items) {
    const templates = listApplicableTemplates(item.id);
    for (const tmpl of templates) {
      try {
        const q = generateQuestion(item.id, tmpl.id, { contextType: 'direct_question', seed: 'facet-discovery' });
        if (q.knowledgeFacet) facets.add(q.knowledgeFacet);
      } catch {
        // ignore templates that cannot generate in isolation
      }
    }
  }
  return Array.from(facets);
}

function signatureFromQuestion(q) {
  return {
    knowledgeItemId: q.knowledgeItemId,
    topicKey: q.topicKey,
    conceptCluster: q.conceptCluster,
    learningObjective: q.learningObjective,
    knowledgeFacet: q.knowledgeFacet,
    questionArchetype: q.questionArchetype,
    templateId: q.context?.templateId,
    calculationFamily: q.calculationParams?.family || null,
    calculationTarget: q.calculationParams?.target || null,
    prefixBucket: q.calculationParams?.prefixBucket || null,
    roleHints: q.context?.roleHints || null,
  };
}

function simulate(profile, sessions = 100, questionsPerSession = 15) {
  setFacetMasteryOverride(profile);
  const history = { session: [], longTerm: [] };
  const selections = [];
  const facetCounts = {};
  const facetGaps = {};
  const facetLastSeen = {};
  const topicCounts = {};
  const loCounts = {};

  for (let s = 0; s < sessions; s += 1) {
    for (let q = 0; q < questionsPerSession; q += 1) {
      const seed = `sim-${s}-${q}`;
      const state = createBalancerState({ history });
      let question;
      try {
        question = generateBalancedQuestion(state, { seed, contextType: 'coworker_question' });
      } catch (e) {
        console.error('Selection failed:', e.message);
        break;
      }
      if (!question) break;

      selections.push(question);
      const record = signatureFromQuestion(question);
      history.session.push(record);
      history.longTerm.push(record);

      const facet = question.knowledgeFacet || 'unknown';
      facetCounts[facet] = (facetCounts[facet] || 0) + 1;
      if (facet in facetLastSeen) {
        facetGaps[facet] = facetGaps[facet] || [];
        facetGaps[facet].push(selections.length - facetLastSeen[facet] - 1);
      }
      facetLastSeen[facet] = selections.length - 1;

      topicCounts[question.topicKey] = (topicCounts[question.topicKey] || 0) + 1;
      loCounts[question.learningObjective || 'unknown'] = (loCounts[question.learningObjective || 'unknown'] || 0) + 1;

      // Simulate answer correctness: 50/50, with a small pity bonus for weak facets.
      const currentScore = profile[facet] ?? 0;
      const pityBonus = currentScore <= -5 ? 0.25 : currentScore <= -3 ? 0.15 : 0;
      const correct = Math.random() < (0.5 + pityBonus);
      if (correct) {
        recordFacetCorrect(facet);
        profile[facet] = Math.min(5, (profile[facet] ?? 0) + 1);
      } else {
        recordFacetWrong(facet);
        profile[facet] = Math.max(-5, (profile[facet] ?? 0) - 1);
      }
    }
  }

  const total = selections.length;
  const facetStats = Object.keys(facetCounts).map((facet) => {
    const gaps = facetGaps[facet] || [];
    const avgGap = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : null;
    return {
      facet,
      count: facetCounts[facet],
      ratio: facetCounts[facet] / total,
      minGap: gaps.length ? Math.min(...gaps) : null,
      maxGap: gaps.length ? Math.max(...gaps) : null,
      avgGap,
    };
  });
  facetStats.sort((a, b) => b.count - a.count);

  return {
    total,
    facetStats,
    topicDiversity: Object.keys(topicCounts).length,
    loDiversity: Object.keys(loCounts).length,
    topTopicRatio: total ? Math.max(...Object.values(topicCounts)) / total : 0,
    topFacetRatio: total ? facetStats[0]?.ratio : 0,
  };
}

function printProfile(name, initialProfile, stats) {
  console.log(`\n=== Profile: ${name} ===`);
  console.log(`Initial scores (sample): ${JSON.stringify(initialProfile).slice(0, 120)}...`);
  console.log(`Total questions: ${stats.total}`);
  console.log(`Distinct topics: ${stats.topicDiversity}`);
  console.log(`Distinct learning objectives: ${stats.loDiversity}`);
  console.log(`Top topic ratio: ${(stats.topTopicRatio * 100).toFixed(1)}%`);
  console.log(`Top facet ratio: ${(stats.topFacetRatio * 100).toFixed(1)}%`);
  console.log('Facet distribution (top 12):');
  for (const f of stats.facetStats.slice(0, 12)) {
    const gapStr = f.avgGap === null ? 'first-only' : `avgGap=${f.avgGap.toFixed(1)} min=${f.minGap} max=${f.maxGap}`;
    console.log(`  ${f.facet}: ${f.count} (${(f.ratio * 100).toFixed(1)}%) ${gapStr}`);
  }
  const profileFacetIds = Object.keys(initialProfile);
  if (profileFacetIds.length > 0) {
    console.log('Profile-specific facets:');
    for (const facet of profileFacetIds) {
      const found = stats.facetStats.find((f) => f.facet === facet);
      if (found) {
        const gapStr = found.avgGap === null ? 'first-only' : `avgGap=${found.avgGap.toFixed(1)} min=${found.minGap}`;
        console.log(`  ${facet}: ${found.count} (${(found.ratio * 100).toFixed(1)}%) ${gapStr}`);
      } else {
        console.log(`  ${facet}: not selected`);
      }
    }
  }
}

const facets = allFacetIds();
console.log(`Discovered ${facets.length} facets`);

const profiles = {
  neutral: {},
  oneWeak: { [facets[0]]: -5 },
  severalWeak: {
    [facets[0]]: -3,
    [facets[1] || facets[0]]: -3,
    [facets[2] || facets[0]]: -3,
  },
  severalMastered: {
    [facets[0]]: 5,
    [facets[1] || facets[0]]: 5,
    [facets[2] || facets[0]]: 5,
  },
  realistic: facets.reduce((acc, f, i) => {
    if (i % 7 === 0) acc[f] = -3;
    else if (i % 5 === 0) acc[f] = 3;
    else if (i % 3 === 0) acc[f] = -1;
    else acc[f] = 0;
    return acc;
  }, {}),
};

for (const [name, profile] of Object.entries(profiles)) {
  const initialProfile = { ...profile };
  const stats = simulate(profile, 100, 15);
  printProfile(name, initialProfile, stats);
}

// Clear override so later tests don't keep these scores.
setFacetMasteryOverride(null);

console.log('\n✅ Mastery simulation completed');
