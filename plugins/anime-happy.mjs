export default {
    commands: ["happy", "feliz"],
    description: "Expresa felicidad con un video de anime",
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
        await wss.sendMessage(m.chat, { react: { text: "😁", key: m.key } });

        // Mensaje de felicidad
        let message;
        if (m.mentionedJid.length > 0 || m.quoted) {
            message = `\`${name2}\` *está feliz por* \`${name || who}\`.`;
        } else {
            message = `\`${name2}\` *está muy feliz hoy.*`;
        }

        // Si el mensaje es en un grupo
        if (m.isGroup) {
            const videos = [
                "https://files.catbox.moe/92bs9b.mp4",
                "https://files.catbox.moe/d56pfs.mp4",
                "https://files.catbox.moe/kh6ii0.mp4",
                "https://files.catbox.moe/gmya70.mp4",
                "https://files.catbox.moe/6mjruj.mp4",
                "https://files.catbox.moe/kgggyv.mp4",
                "https://files.catbox.moe/84d71w.mp4",
                "https://files.catbox.moe/hlifrw.mp4"
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