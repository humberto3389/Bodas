import { supabase } from './supabase';

/**
 * Cuenta los archivos en un bucket de storage para un cliente específico
 * @param clientId ID del cliente
 * @param bucket Bucket a contar ('gallery' para fotos, 'videos' para videos)
 * @returns Número de archivos
 */
export async function countFilesInStorage(
  clientId: string,
  bucket: 'gallery' | 'videos'
): Promise<number> {
  try {
    let folder = '';
    if (bucket === 'gallery') folder = 'hero';
    else if (bucket === 'videos') folder = 'video';

    const listPath = `${clientId}/${folder}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(listPath, { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });

    if (error) {
      console.error(`Error counting files in ${bucket}:`, error);
      return 0;
    }

    // Filtrar archivos ocultos y contar solo archivos válidos
    const count = (data || []).filter(
      file => !file.name.startsWith('.') && file.id
    ).length;

    return count;
  } catch (err) {
    console.error(`Error counting files in ${bucket}:`, err);
    return 0;
  }
}
