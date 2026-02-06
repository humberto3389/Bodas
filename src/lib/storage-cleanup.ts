import { supabase } from './supabase';

/**
 * Elimina todos los archivos de un cliente en los diferentes buckets de Storage.
 * Supabase Storage no permite borrar "carpetas" directamente, por lo que 
 * debemos listar los archivos y borrarlos uno por uno o por lotes.
 */
export async function deleteClientStorage(clientId: string): Promise<{ success: boolean; error?: string }> {
    const buckets: ('gallery' | 'audio' | 'videos')[] = ['gallery', 'audio', 'videos'];
    const folders: Record<string, string> = {
        'gallery': 'hero',
        'audio': 'audio',
        'videos': 'video'
    };

    try {
        for (const bucket of buckets) {
            const folder = folders[bucket];
            const fullFolderPath = `${clientId}/${folder}`;

            // 1. Listar archivos en la carpeta específica
            const { data: files, error: listError } = await supabase.storage
                .from(bucket)
                .list(fullFolderPath);

            if (listError) {
                console.error(`[Cleanup] Error listando ${bucket}/${fullFolderPath}:`, listError);
                continue; // Intentar con el siguiente bucket
            }

            if (files && files.length > 0) {
                // 2. Construir rutas completas para borrar
                const pathsToDelete = files.map(f => `${fullFolderPath}/${f.name}`);

                const { error: deleteError } = await supabase.storage
                    .from(bucket)
                    .remove(pathsToDelete);

                if (deleteError) {
                    console.error(`[Cleanup] Error borrando archivos en ${bucket}:`, deleteError);
                }
            }

            // 3. Opcional: Intentar borrar la carpeta raíz del clientId en ese bucket
            // (A veces quedan archivos sueltos o la carpeta vacía)
            const { data: rootFiles } = await supabase.storage.from(bucket).list(clientId);
            if (rootFiles && rootFiles.length > 0) {
                const rootPaths = rootFiles.map(f => `${clientId}/${f.name}`);
                await supabase.storage.from(bucket).remove(rootPaths);
            }
        }

        return { success: true };
    } catch (err: any) {
        console.error('[Cleanup] Error crítico en limpieza de storage:', err);
        return { success: false, error: err.message };
    }
}
