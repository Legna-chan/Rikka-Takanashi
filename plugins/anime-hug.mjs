export default {
    commands: ["hug", "abrazar"],
    description: "Envía un abrazo con un video aleatorio",
    category: "anime",
    flags: [], // Sin banderas necesarias.
    group: true, // Solo en grupos.
    exec: async (wss, { m }) => {
        let who;

        if (m.mentionedJid.length > 0) {
            who = m.mentionedJid[0];
        } else if (m.quoted) {
            who = m.quoted.sender;
        } else {
            who = m.sender;
        }

        // Obtener nombres de los usuarios
        let name = await getName(wss, who);
        let name2 = m.pushName || "Alguien"; // El nombre del remitente

        // Enviar reacción al mensaje
        await wss.sendMessage(m.chat, { react: { text: "🫂", key: m.key } });

        let message;
        if (m.mentionedJid.length > 0 || m.quoted) {
            message = `\`${name2}\` *le dio un fuerte abrazo a* \`${name}\`.`;
        } else {
            message = `\`${name2}\` *se abrazó a sí mismo.*`;
        }

        if (m.isGroup) {
            const videos = [
                "https://telegra.ph/file/6a3aa01fabb95e3558eec.mp4",
                "https://telegra.ph/file/0e5b24907be34da0cbe84.mp4",
                "https://telegra.ph/file/6bc3cd10684f036e541ed.mp4",
                "https://telegra.ph/file/3e443a3363a90906220d8.mp4",
                "https://telegra.ph/file/56d886660696365f9696b.mp4",
                "https://telegra.ph/file/3eeadd9d69653803b33c6.mp4",
                "https://telegra.ph/file/436624e53c5f041bfd597.mp4",
                "https://telegra.ph/file/5866f0929bf0c8fe6a909.mp4"
            ];
            const video = videos[Math.floor(Math.random() * videos.length)];

            await wss.sendMessage(m.chat, {
                video: { url: video },
                gifPlayback: true,
                caption: message,
                mentions: [who]
            }, { quoted: m });
        }
    }
};

// Función para obtener el nombre del usuario
async function getName(wss, jid) {
    try {
        const [result] = await wss.onWhatsApp(jid);
        return result?.notify || result?.jid.split("@")[0] || "Alguien";
    } catch {
        return "Alguien";
    }
}