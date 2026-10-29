import { getCurrentUserId, supabase } from "./supabase";
import { deleteExpenseEvidence, signExpenseEvidence, uploadExpenseEvidence } from "./storage";

export async function getExpenseMembers() {
  const { data, error } = await supabase
    .from("usuarios")
    .select("auth_user_id,nombre")
    .not("auth_user_id", "is", null)
    .order("nombre");

  if (error) {
    console.error("ERROR OBTENIENDO INTEGRANTES:", error);
    return [];
  }

  return (data || [])
    .filter(user => ["dani", "mafer"].includes(String(user.nombre || "").trim().toLowerCase()))
    .map(user => ({ id: user.auth_user_id, nombre: user.nombre }));
}

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
    pagado_por_nombre: names.get(expense.pagado_por || expense.owner_id) || "Sin indicar",
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
      compartido: expense.compartido === true,
      pagado_por: expense.pagado_por,
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

export async function updateExpense(expenseId, expense) {
  const ownerId = await getCurrentUserId();
  if (!ownerId) return null;

  let evidencePath = expense.evidencia_path || null;
  let uploadedEvidencePath = null;
  if (expense.evidencia) {
    uploadedEvidencePath = await uploadExpenseEvidence(expense.evidencia);
    if (!uploadedEvidencePath) return null;
    evidencePath = uploadedEvidencePath;
  }

  const { data, error } = await supabase
    .from("gastos")
    .update({
      descripcion: expense.descripcion.trim(),
      monto: Number(expense.monto),
      fecha: expense.fecha,
      evidencia_path: evidencePath,
      compartido: expense.compartido === true,
      pagado_por: expense.pagado_por,
    })
    .eq("id", expenseId)
    .eq("owner_id", ownerId)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    console.error("ERROR ACTUALIZANDO GASTO:", error);
    await deleteExpenseEvidence(uploadedEvidencePath);
    return null;
  }

  if (uploadedEvidencePath && expense.evidencia_path && expense.evidencia_path !== uploadedEvidencePath) {
    await deleteExpenseEvidence(expense.evidencia_path);
  }
  return data;
}
