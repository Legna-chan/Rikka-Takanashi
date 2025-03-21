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
      // Verificar si el mensaje tiene una imagen o video
      let q = m.quoted ? m.quoted : m;
      let mime = (q.msg || q).mimetype || q.mediaType || '';

      // Asegurarnos de que mime esté definido antes de proceder
      if (mime && /webp|image|video/g.test(mime)) {
        if (/video/g.test(mime) && (q.msg || q).seconds > 15) {
          return wss.sendMessage(m.chat, { text: `❌ ¡El video no puede durar más de 15 segundos!` }, { quoted: m });
        }

        let img = await q.download?.();

        // Verificar si la imagen se descargó correctamente
        if (!img) {
          return wss.sendMessage(m.chat, { text: `❌ Por favor, envía una imagen o video para hacer un sticker.` }, { quoted: m });
        }

        let out;
        try {
          // Aquí se asignan los textos predeterminados para el sticker
          const texto1 = 'Sticker Pack'; // Texto de ejemplo
          const texto2 = 'Sticker Bot';  // Texto de ejemplo

          // Generar el sticker
          stiker = await sticker(img, false, texto1, texto2);
        } catch (e) {
          console.error('Error al generar el sticker:', e);
        } finally {
          // Si no se pudo generar el sticker, se intentan otras opciones
          if (!stiker) {
            if (/webp/g.test(mime)) out = await webp2png(img);
            else if (/image/g.test(mime)) out = await uploadImage(img);
            else if (/video/g.test(mime)) out = await uploadFile(img);

            // Si 'out' no es una cadena de texto, probamos con la imagen
            if (typeof out !== 'string') out = await uploadImage(img);
            stiker = await sticker(false, out, 'Sticker Pack', 'Sticker Bot');
          }
        }
      } else if (args[0]) {
        // Si el primer argumento es un URL, intentamos generar un sticker a partir de ese URL
        if (isUrl(args[0])) {
          stiker = await sticker(false, args[0], 'Sticker Pack', 'Sticker Bot');
        } else {
          return wss.sendMessage(m.chat, { text: `❌ El URL es incorrecto...` }, { quoted: m });
        }
      }
    } catch (e) {
      console.error('Error inesperado:', e);
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

// Función para validar si el texto es una URL válida
const isUrl = (text) => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'));
};