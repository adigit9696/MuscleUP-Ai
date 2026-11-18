/**
 * Meal Nutrition Calculation Engine
 * Pure ES6 Module for MuscleUP Ai React App
 */

const NUTS = ['kcal', 'carbohydrates_g', 'protein_g', 'fat_g'];
const FIELD = {
  kcal: 'kcal_per_100g',
  carbohydrates_g: 'carbohydrates_g_per_100g',
  protein_g: 'protein_g_per_100g',
  fat_g: 'fat_g_per_100g'
};

export function portionNutrients(food, grams) {
  if (!(grams > 0)) return { kcal: 0, carbohydrates_g: 0, protein_g: 0, fat_g: 0 };
  const out = {};
  NUTS.forEach(n => {
    const v = food[FIELD[n]];
    out[n] = (v === null || v === undefined) ? 0 : Math.round((v * grams / 100) * 10) / 10;
  });
  return out;
}

export function sumItems(items) {
  const totals = { kcal: 0, carbohydrates_g: 0, protein_g: 0, fat_g: 0 };
  items.forEach(it => {
    totals.kcal += (it.calories || it.nutrients?.kcal || 0);
    totals.protein_g += (it.protein || it.nutrients?.protein_g || 0);
    totals.carbohydrates_g += (it.carbs || it.nutrients?.carbohydrates_g || 0);
    totals.fat_g += (it.fat || it.nutrients?.fat_g || 0);
  });
  totals.kcal = Math.round(totals.kcal);
  totals.protein_g = Math.round(totals.protein_g * 10) / 10;
  totals.carbohydrates_g = Math.round(totals.carbohydrates_g * 10) / 10;
  totals.fat_g = Math.round(totals.fat_g * 10) / 10;
  return totals;
}

