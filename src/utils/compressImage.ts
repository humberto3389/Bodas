import imageCompression from 'browser-image-compression';

/**
 * Comprime un archivo de imagen en el cliente antes de subirlo.
 * @param {File} imageFile - Archivo de imagen original (JPEG, PNG, WebP).
 * @returns {Promise<File>} - Archivo comprimido, con el mismo nombre y tipo.
 */
export const compressImageForWeb = async (imageFile: File): Promise<File> => {
    // Excluir GIFs animados para evitar pérdida de animación o distorsión
    if (imageFile.type === 'image/gif') {
        return imageFile;
    }

    // Opciones de compresión equilibradas para web
    const options = {
        maxSizeMB: 0.5,           // Tamaño máximo objetivo: 500KB
        maxWidthOrHeight: 1200,   // Redimensionar si es más grande (mantiene aspecto)
        useWebWorker: true,       // No bloquear el hilo principal
        initialQuality: 0.8,      // Calidad del 80% (buen balance)
        fileType: imageFile.type as any  // Mantener el tipo original
    };

    try {
        const compressedBlob = await imageCompression(imageFile, options);

        // Convertir el Blob de vuelta a File, manteniendo nombre y tipo
        const compressedFile = new File(
            [compressedBlob],
            imageFile.name,
            { type: imageFile.type }
        );

        return compressedFile;
    } catch (error) {
        console.error('❌ Error comprimiendo imagen:', error);
        // En caso de error, devolver el archivo original para no romper el flujo
        return imageFile;
    }
};
