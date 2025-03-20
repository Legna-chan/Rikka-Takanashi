export default {
    commands: ["sad", "triste"],
    description: "Expresa tristeza con un video de anime",
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
        let name = await getName(wss, who); // Obtenemos el nombre del usuario mencionado
        let name2 = m.pushName || "Alguien"; // Si no se obtiene el nombre del remitente, ponemos "Alguien"

        // Enviar reacción al mensaje
        await wss.sendMessage(m.chat, { react: { text: "😢", key: m.key } });

        // Mensaje de tristeza
        let message;
        if (m.mentionedJid.length > 0 || m.quoted) {
            message = `\`${name2}\` *está triste por* \`${name || who}\`.`;
        } else {
            message = `\`${name2}\` *se siente muy triste hoy.*`;
        }

        // Si el mensaje es en un grupo
        if (m.isGroup) {
            const videos = [
                "https://files.catbox.moe/1a2b3c.mp4",
                "https://files.catbox.moe/4d5e6f.mp4",
                "https://files.catbox.moe/7g8h9i.mp4",
                "https://files.catbox.moe/jk1lm2.mp4",
                "https://files.catbox.moe/n3o4p5.mp4",
                "https://files.catbox.moe/q6r7s8.mp4",
                "https://files.catbox.moe/t9u0v1.mp4",
                "https://files.catbox.moe/w2x3y4.mp4"
            ];
            const video = videos[Math.floor(Math.random() * videos.length)];

            // Enviar video con el mensaje
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
        return "Alguien"; // Si no se puede obtener el nombre, retornamos "Alguien"
    }
}