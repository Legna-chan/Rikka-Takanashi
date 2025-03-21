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

      if (/webp|image|video/g.test(mime)) {
        if (/video/g.test(mime) && (q.msg || q).seconds > 15) {
          return wss.sendMessage(m.chat, { text: `❌ ¡El video no puede durar más de 15 segundos!` }, { quoted: m });
        }

        let img = await q.download?.();

        if (!img) {
          return wss.sendMessage(m.chat, { text: `❌ Por favor, envía una imagen o video para hacer un sticker.` }, { quoted: m });
        }

        let out;
        try {
          const packstickers = { text1: 'Mi Pack', text2: 'Mi Autor' };  // Aquí defines el texto del pack
          const texto1 = packstickers?.text1 || 'Mi Pack';
          const texto2 = packstickers?.text2 || 'Mi Autor';

          stiker = await sticker(img, false, texto1, texto2);
        } catch (e) {
          console.error(e);
        } finally {
          if (!stiker) {
            if (/webp/g.test(mime)) out = await webp2png(img);
            else if (/image/g.test(mime)) out = await uploadImage(img);
            else if (/video/g.test(mime)) out = await uploadFile(img);
            if (typeof out !== 'string') out = await uploadImage(img);
            stiker = await sticker(false, out, 'Mi Pack', 'Mi Autor');
          }
        }
      } else if (args[0]) {
        if (isUrl(args[0])) {
          stiker = await sticker(false, args[0], 'Mi Pack', 'Mi Autor');
        } else {
          return wss.sendMessage(m.chat, { text: `❌ El URL es incorrecto...` }, { quoted: m });
        }
      }
    } catch (e) {
      console.error(e);
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