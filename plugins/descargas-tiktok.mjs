import fetch from 'node-fetch';

export default {
    commands: ["tiktok", "tt"],
    description: "Descargar video de TikTok",
    category: "descargas",
    flags: [],
    exec: async (wss, { m, args, usedPrefix }) => {
        if (!args[0]) {
            return wss.sendMessage(m.chat, { text: "❌ Por favor proporciona un enlace válido de TikTok." }, { quoted: m });
        }

        try {
            await wss.sendMessage(m.chat, { text: "❀ Espere un momento, estoy descargando su video..." }, { quoted: m });

            const apiUrl = `https://api.dorratz.com/v2/tiktok-dl?url=${encodeURIComponent(args[0])}`;
            const response = await fetch(apiUrl);
            const result = await response.json();

            // Log para inspeccionar la respuesta de la API
            console.log('Respuesta de la API:', result);

            // Verifica que el estado sea exitoso y que los datos estén presentes
            if (!result || !result.status || result.status !== 'success' || !result.data || !result.data.media || !result.data.media.org) {
                return wss.sendMessage(m.chat, { text: "❌ No se pudo obtener el video. Verifica el enlace e intenta nuevamente." }, { quoted: m });
            }

            const videoUrl = result.data.media.org;

            if (videoUrl) {
                await wss.sendFile(m.chat, videoUrl, "tiktok.mp4", { caption: "❏ Aquí tienes tu video de TikTok." }, { quoted: m });
            } else {
                return wss.sendMessage(m.chat, { text: "❌ No se pudo descargar el video. Intenta nuevamente." }, { quoted: m });
            }
        } catch (error1) {
            console.error('Error al descargar el video:', error1);
            return wss.sendMessage(m.chat, { text: `❌ Ocurrió un error al intentar descargar el video: ${error1.message}` }, { quoted: m });
        }
    }
};