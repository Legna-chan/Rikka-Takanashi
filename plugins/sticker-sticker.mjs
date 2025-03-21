import { sticker } from '../lib/sticker.mjs';
import uploadFile from '../lib/uploadFile.mjs';
import uploadImage from '../lib/uploadImage.mjs';
import { webp2png } from '../lib/webp2mp4.mjs';

export default {
  commands: ['sticker', 's', 'stiker'], // Comandos que activan el handler
  description: 'Convierte una imagen o video en un sticker.',
  category: 'sticker',
  exec: async (wss, { m, args, usedPrefix, command }) => {
    let stiker = false;
    try {
      let q = m.quoted ? m.quoted : m;
      let mime = (q.msg || q).mimetype || q.mediaType || '';

      // Verificación para asegurarnos de que mime esté bien definido
      if (mime && /webp|image|video/g.test(mime)) {
        if (/video/g.test(mime) && (q.msg || q).seconds > 15) {
          return wss.sendMessage(m.chat, { text: `❌ ¡El video no puede durar más de 15 segundos!` }, { quoted: m });
        }

        let img = await q.download?.();

        // Verificación para asegurarnos de que la imagen se descargue correctamente
        if (!img) {
          return wss.sendMessage(m.chat, { text: `❌ Por favor, envía una imagen o video para hacer un sticker.` }, { quoted: m });
        }

        let out;
        try {
          // Obtener los valores para los textos del sticker
          const packstickers = await getUserStickerPack(m.sender);
          const texto1 = packstickers?.text1 || 'Mi Sticker Pack'; // Texto por defecto
          const texto2 = packstickers?.text2 || 'Sticker Bot';      // Texto por defecto

          // Intentar crear el sticker
          stiker = await sticker(img, false, texto1, texto2);
        } catch (e) {
          console.error('Error al generar el sticker: ', e);
        } finally {
          if (!stiker) {
            // Si no se pudo generar el sticker, intentamos otras opciones
            if (/webp/g.test(mime)) out = await webp2png(img);
            else if (/image/g.test(mime)) out = await uploadImage(img);
            else if (/video/g.test(mime)) out = await uploadFile(img);

            // Si 'out' no es una cadena de texto, lo intentamos con la imagen
            if (typeof out !== 'string') out = await uploadImage(img);
            stiker = await sticker(false, out, 'Sticker Pack', 'Sticker Bot');
          }
        }
      } else if (args[0]) {
        // Validamos si el argumento es una URL válida
        if (isUrl(args[0])) {
          stiker = await sticker(false, args[0], 'Sticker Pack', 'Sticker Bot');
        } else {
          return wss.sendMessage(m.chat, { text: `❌ El URL es incorrecto...` }, { quoted: m });
        }
      }
    } catch (e) {
      console.error('Error inesperado: ', e);
      if (!stiker) stiker = e;
    } finally {
      if (stiker) {
        wss.sendFile(m.chat, stiker, 'sticker.webp', '', m);
      } else {
        return wss.sendMessage(m.chat, { text: `❌ Por favor, envía una imagen o video para hacer un sticker.` }, { quoted: m });
      }
    }
  }
};

// Función para obtener la configuración del usuario (puedes ajustarlo a tu lógica)
const getUserStickerPack = async (userId) => {
  // Aquí, verificamos si 'userId' existe y que los datos de stickers están disponibles.
  const userStickerPack = {
    text1: 'Pack Personalizado', // Cambia esto según tu necesidad
    text2: 'Bot de Stickers',    // Cambia esto según tu necesidad
  };

  // Si no hay datos del usuario, devuelve valores predeterminados
  if (!userStickerPack || !userStickerPack.text1 || !userStickerPack.text2) {
    return { text1: 'Sticker Pack', text2: 'Sticker Bot' };
  }

  return userStickerPack;
};

// Función para validar si el texto es una URL válida
const isUrl = (text) => {
  if (text && typeof text === 'string') {
    return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'));
  }
  return false;
};