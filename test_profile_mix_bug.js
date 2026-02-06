// test_profile_mix_bug.js
// Script para detectar mezcla de perfiles en el endpoint BFF
// Ejecutar con: node test_profile_mix_bug.js

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:5173'; // Cambia a tu entorno local o producción si es necesario
const SUBDOMAINS = ['juan', 'miguel'];

async function testProfileMix() {
  for (const subdomain of SUBDOMAINS) {
    const url = `${BASE_URL}/api/public/wedding-data?subdomain=${subdomain}&t=${Date.now()}`;
    console.log(`\n[TEST] Fetching datos para subdomain: ${subdomain}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[ERROR] Respuesta HTTP ${res.status} para subdomain ${subdomain}`);
      continue;
    }
    const data = await res.json();
    if (!data.client || !data.client.subdomain) {
      console.error(`[ERROR] No se encontró client.subdomain en la respuesta para ${subdomain}`);
      continue;
    }
    if (data.client.subdomain !== subdomain) {
      console.error(`[BUG] Mezcla detectada: Pedí ${subdomain}, recibí ${data.client.subdomain}`);
    } else {
      console.log(`[OK] Recibí datos correctos para ${subdomain}`);
    }
  }
}

testProfileMix().catch(e => {
  console.error('Excepción en test:', e);
});
