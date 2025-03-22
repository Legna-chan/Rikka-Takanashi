import tiktokdl from 'tiktok-dl';
import fetch from 'node-fetch';

export default {
    commands: ["tiktok", "tt"],
    description: "Descargar video de TikTok",
    category: "descargas",
    flags: [],
    exec: async (wss, { m, args, usedPrefix }) => {
        if (!args[0]) {
            return wss.sendMessage(m.chat, { text: "✰ Por favor, ingresa un enlace de TikTok." }, { quoted: m });
        }

        try {
            await wss.sendMessage(m.chat, { text: `❀ Espere un momento, estoy descargando su video...` }, { quoted: m });

            const tiktokData = await tiktokdl.getInfo(args[0]);

            if (!tiktokData || !tiktokData.play) {
                return wss.sendMessage(m.chat, { text: "❀ Error: No se pudo obtener el video." }, { quoted: m });
            }

            const videoURL = tiktokData.play;

            if (videoURL) {
                await wss.sendFile(m.chat, videoURL, "tiktok.mp4", { caption: "❏ Aquí tienes tu video." }, { quoted: m });
            } else {
                return wss.sendMessage(m.chat, { text: "No se pudo descargar." }, { quoted: m });
            }
        } catch (error1) {
            return wss.sendMessage(m.chat, { text: `Error: ${error1.message}` }, { quoted: m });
        }
    }
};