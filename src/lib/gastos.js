import { getCurrentUserId, supabase } from "./supabase";
import { deleteExpenseEvidence, signExpenseEvidence, uploadExpenseEvidence } from "./storage";

export async function getExpenses() {
  const { data, error } = await supabase
    .from("gastos")
    .select("*")
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("ERROR OBTENIENDO GASTOS:", error);
    return [];
  }

  const [withEvidence, usersResult] = await Promise.all([
    signExpenseEvidence(data || []),
    supabase.from("usuarios").select("auth_user_id,nombre"),
  ]);
  const names = new Map((usersResult.data || []).map(user => [user.auth_user_id, user.nombre]));
  return withEvidence.map(expense => ({
    ...expense,
    registrado_por: names.get(expense.owner_id) || "Cherry Club",
  }));
}

export async function createExpense(expense) {
  const ownerId = await getCurrentUserId();
  if (!ownerId) return null;

  let evidencePath = null;
  if (expense.evidencia) {
    evidencePath = await uploadExpenseEvidence(expense.evidencia);
    if (!evidencePath) return null;
  }

  const { data, error } = await supabase
    .from("gastos")
    .insert({
      owner_id: ownerId,
      descripcion: expense.descripcion.trim(),
      monto: Number(expense.monto),
      fecha: expense.fecha,
      evidencia_path: evidencePath,
    })
    .select("*")
    .single();

  if (error) {
    console.error("ERROR REGISTRANDO GASTO:", error);
    await deleteExpenseEvidence(evidencePath);
    return null;
  }

  return data;
}
