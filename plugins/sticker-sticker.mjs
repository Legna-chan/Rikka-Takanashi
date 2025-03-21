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
      // Verificar si m.quoted está definido, si no, asignamos m
      let q = m.quoted ? m.quoted : m;
      console.log('q:', q);  // Registra el valor de q para verificar

      // Verifica que 'mime' esté bien definido
      let mime = (q.msg || q).mimetype || q.mediaType || '';
      console.log('mime:', mime);  // Registra el tipo de mime

      if (mime && /webp|image|video/g.test(mime)) {
        if (/video/g.test(mime) && (q.msg || q).seconds > 15) {
          return wss.sendMessage(m.chat, { text: `❌ ¡El video no puede durar más de 15 segundos!` }, { quoted: m });
        }

        // Verificar que la descarga sea posible
        let img = await q.download?.();
        console.log('img:', img);  // Registra la descarga de la imagen

        if (!img) {
          return wss.sendMessage(m.chat, { text: `❌ Por favor, envía una imagen o video para hacer un sticker.` }, { quoted: m });
        }

        let out;
        try {
          // Definir los textos predeterminados para el sticker
          const texto1 = 'Sticker Pack';  // Texto de ejemplo
          const texto2 = 'Sticker Bot';   // Texto de ejemplo

          // Verificar que los textos sean cadenas antes de pasarlas a la función sticker
          console.log('Texto1:', texto1, 'Texto2:', texto2);  // Registra los textos

          stiker = await sticker(img, false, texto1, texto2);
          console.log('Sticker generado:', stiker);  // Verifica si el sticker fue generado
        } catch (e) {
          console.error('Error al generar el sticker:', e);
        } finally {
          // Intentar generar el sticker con otro formato si el anterior falla
          if (!stiker) {
            if (/webp/g.test(mime)) out = await webp2png(img);
            else if (/image/g.test(mime)) out = await uploadImage(img);
            else if (/video/g.test(mime)) out = await uploadFile(img);

            if (typeof out !== 'string') out = await uploadImage(img);
            stiker = await sticker(false, out, 'Sticker Pack', 'Sticker Bot');
          }
        }
      } else if (args[0]) {
        // Verificar si el primer argumento es una URL válida
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
      // Verifica si se generó un sticker, si no, responde con un mensaje
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