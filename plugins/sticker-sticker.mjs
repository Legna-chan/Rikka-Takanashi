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
      // Verificar que m.quoted está definido, si no, asignamos m
      let q = m.quoted ? m.quoted : m;
      console.log('q:', q);  // Registra el valor de q para verificar

      // Verifica que 'mime' esté bien definido
      let mime = (q.msg || q).mimetype || q.mediaType || '';
      console.log('mime:', mime);  // Registra el tipo de mime

      // Verifica que mime sea válido antes de proceder
      if (mime && /webp|image|video/g.test(mime)) {
        // Verificar que el video no sea mayor a 15 segundos
        if (/video/g.test(mime) && (q.msg || q).seconds > 15) {
          return wss.sendMessage(m.chat, { text: `❌ ¡El video no puede durar más de 15 segundos!` }, { quoted: m });
        }

        // Intentar descargar la imagen
        let img = await q.download?.();
        console.log('img:', img);  // Registra la descarga de la imagen

        // Si no se pudo descargar la imagen, enviar un mensaje de error
        if (!img) {
          return wss.sendMessage(m.chat, { text: `❌ Por favor, envía una imagen o video para hacer un sticker.` }, { quoted: m });
        }

        let out;

        try {
          // Si tienes texto para los stickers, lo definimos aquí
          const texto1 = 'Sticker Pack';  // Texto de ejemplo
          const texto2 = 'Sticker Bot';   // Texto de ejemplo

          // Verificar los textos antes de pasarlos a la función de sticker
          console.log('Texto1:', texto1, 'Texto2:', texto2);  // Registra los textos

          // Intentamos crear el sticker
          stiker = await sticker(img, false, texto1, texto2);
          console.log('Sticker generado:', stiker);  // Verifica si el sticker fue generado
        } catch (e) {
          console.error('Error al generar el sticker:', e);
        } finally {
          // Si no se pudo generar el sticker, probamos con otros formatos
          if (!stiker) {
            if (/webp/g.test(mime)) out = await webp2png(img);
            else if (/image/g.test(mime)) out = await uploadImage(img);
            else if (/video/g.test(mime)) out = await uploadFile(img);

            // Si 'out' no es un string, probamos con otra imagen
            if (typeof out !== 'string') out = await uploadImage(img);

            // Intentamos crear el sticker nuevamente
            stiker = await sticker(false, out, 'Sticker Pack', 'Sticker Bot');
          }
        }
      } else if (args[0]) {
        // Si el primer argumento es un URL, intentamos crear el sticker desde el URL
        if (isUrl(args[0])) {
          stiker = await sticker(false, args[0], 'Sticker Pack', 'Sticker Bot');
        } else {
          return wss.sendMessage(m.chat, { text: `❌ El URL es incorrecto...` }, { quoted: m });
        }
      }
    } catch (e) {
      // Si ocurre un error inesperado, lo registramos
      console.error('Error inesperado:', e);
      if (!stiker) stiker = e;
    } finally {
      // Si se generó un sticker, lo enviamos, de lo contrario, pedimos que envíen una imagen o video
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