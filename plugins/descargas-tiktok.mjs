import { downloadVideo } from 'tiktok-download'; // Importa la librería

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

            // Intenta descargar el video usando el enlace proporcionado
            const video = await downloadVideo(args[0]);

            if (!video || !video.download) {
                return wss.sendMessage(m.chat, { text: "❀ Error: No se pudo obtener el video." }, { quoted: m });
            }

            // Obtiene la URL directa del video
            const videoUrl = video.download();

            // Envía el video al chat
            await wss.sendFile(m.chat, videoUrl, "tiktok_video.mp4", { caption: "❏ Aquí tienes tu video de TikTok." }, { quoted: m });
        } catch (error) {
            return wss.sendMessage(m.chat, { text: `Error: ${error.message}` }, { quoted: m });
        }
    }
};