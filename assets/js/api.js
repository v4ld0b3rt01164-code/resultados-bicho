import { API_URL } from './config.js';

export async function fetchResultados(data) {
  const res = await fetch(`${API_URL}?data=${data}`);
  if (!res.ok) throw new Error('network');
  const json = await res.json();
  if (!json.loterias || !json.loterias.length) throw new Error('empty');
  return json;
}