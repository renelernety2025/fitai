'use client';

import { useRef, useState } from 'react';
import {
  createRecipe,
  getFoodPhotoUploadUrl,
  generateRecipeFromPhoto,
  type Recipe,
} from '@/lib/api';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

interface IngredientRow {
  name: string;
  amount: string;
  unit: string;
}

export default function RecipeFormModal({ onClose, onSaved }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    { name: '', amount: '', unit: '' },
  ]);
  const [instructions, setInstructions] = useState('');
  const [prepMinutes, setPrepMinutes] = useState('');
  const [cookMinutes, setCookMinutes] = useState('');
  const [servings, setServings] = useState('1');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');

  function addIngredient() {
    setIngredients([...ingredients, { name: '', amount: '', unit: '' }]);
  }

  function updateIngredient(idx: number, field: keyof IngredientRow, val: string) {
    setIngredients(ingredients.map((ing, i) => (i === idx ? { ...ing, [field]: val } : ing)));
  }

  function removeIngredient(idx: number) {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== idx));
  }

  async function handleAiGenerate(file: File) {
    setAiLoading(true);
    setError('');
    try {
      const { uploadUrl, s3Key } = await getFoodPhotoUploadUrl();
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      const recipe = await generateRecipeFromPhoto(s3Key);
      prefillFromAi(recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI generovani selhalo');
    } finally {
      setAiLoading(false);
    }
  }

  function prefillFromAi(r: Partial<Recipe>) {
    if (r.name) setName(r.name);
    if (r.description) setDescription(r.description);
    if (r.instructions) setInstructions(r.instructions);
    if (r.prepMinutes != null) setPrepMinutes(String(r.prepMinutes));
    if (r.cookMinutes != null) setCookMinutes(String(r.cookMinutes));
    if (r.servings != null) setServings(String(r.servings));
    if (r.kcalPerServing != null) setKcal(String(r.kcalPerServing));
    if (r.proteinG != null) setProtein(String(r.proteinG));
    if (r.carbsG != null) setCarbs(String(r.carbsG));
    if (r.fatG != null) setFat(String(r.fatG));
    if (r.tags?.length) setTags(r.tags.join(', '));
    if (r.ingredients?.length) setIngredients(r.ingredients);
  }

  async function handleSave() {
    if (!name.trim()) { setError('Zadejte nazev receptu'); return; }
    setSaving(true);
    setError('');
    try {
      const validIngredients = ingredients.filter((i) => i.name.trim());
      await createRecipe({
        name: name.trim(),
        description: description.trim() || null,
        ingredients: validIngredients,
        instructions: instructions.trim() || null,
        prepMinutes: prepMinutes ? Number(prepMinutes) : null,
        cookMinutes: cookMinutes ? Number(cookMinutes) : null,
        servings: Number(servings) || 1,
        kcalPerServing: kcal ? Number(kcal) : null,
        proteinG: protein ? Number(protein) : null,
        carbsG: carbs ? Number(carbs) : null,
        fatG: fat ? Number(fat) : null,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri ukladani');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-xl sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-black p-8 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Novy recept</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">X</button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        {/* AI from photo */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={aiLoading}
            className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/50 transition hover:border-white/25 hover:text-white disabled:opacity-50"
          >
            {aiLoading ? 'AI generuje...' : 'Vytvorit z fotky (AI)'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAiGenerate(f); }}
          />
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <FormField label="Nazev" value={name} onChange={setName} />
          <FormField label="Popis" value={description} onChange={setDescription} />

          {/* Ingredients */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
              Ingredience
            </label>
            {ingredients.map((ing, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input value={ing.amount} onChange={(e) => updateIngredient(i, 'amount', e.target.value)} placeholder="Mnozstvi" className="w-20 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none" />
                <input value={ing.unit} onChange={(e) => updateIngredient(i, 'unit', e.target.value)} placeholder="Jednotka" className="w-20 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none" />
                <input value={ing.name} onChange={(e) => updateIngredient(i, 'name', e.target.value)} placeholder="Nazev" className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none" />
                <button onClick={() => removeIngredient(i)} className="text-xs text-white/20 hover:text-white/50">X</button>
              </div>
            ))}
            <button onClick={addIngredient} className="text-xs text-white/30 hover:text-white/60">+ Pridat ingredienci</button>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">Postup</label>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={4} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none" style={{ fontFamily: 'Georgia, serif' }} />
          </div>

          {/* Time + servings row */}
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Priprava (min)" value={prepMinutes} onChange={setPrepMinutes} type="number" />
            <FormField label="Vareni (min)" value={cookMinutes} onChange={setCookMinutes} type="number" />
            <FormField label="Porci" value={servings} onChange={setServings} type="number" />
          </div>

          {/* Macros row */}
          <div className="grid grid-cols-4 gap-3">
            <FormField label="kcal/porce" value={kcal} onChange={setKcal} type="number" />
            <FormField label="Protein (g)" value={protein} onChange={setProtein} type="number" />
            <FormField label="Sacharidy (g)" value={carbs} onChange={setCarbs} type="number" />
            <FormField label="Tuky (g)" value={fat} onChange={setFat} type="number" />
          </div>

          <FormField label="Tagy (oddelene carkou)" value={tags} onChange={setTags} />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full rounded-full py-3 text-sm font-bold text-black transition disabled:opacity-50"
          style={{ backgroundColor: '#A8FF00' }}
        >
          {saving ? 'Ukladam...' : 'Ulozit recept'}
        </button>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-white/25 focus:outline-none" />
    </div>
  );
}
