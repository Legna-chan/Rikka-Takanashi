import fetch from 'node-fetch'

export default {
    commands: ["waifu"],
    description: "Envía una imagen aleatoria de una waifu.",
    category: "anime",
    flags: [],
    exec: async (wss, { m }) => {
        try {
            // Enviar mensaje de espera
            await wss.sendMessage(m.chat, { text: "❀ Buscando tu *Waifu*, espere un momento..." }, { quoted: m });
            
            // Hacer la solicitud a la API de waifu
            let res = await fetch('https://api.waifu.pics/sfw/waifu');
            if (!res.ok) return;

            let json = await res.json();
            if (!json.url) return;

            // Enviar la imagen de la waifu
            await wss.sendMessage(m.chat, {
                image: { url: json.url },
                caption: "✧ Aquí tienes tu *Waifu* ฅ^•ﻌ•^ฅ.",
            }, { quoted: m });
        } catch (err) {
            console.error("Error al obtener la waifu:", err);
            await wss.sendMessage(m.chat, { text: "❏ Error al buscar la *Waifu*." }, { quoted: m });
        }
    }
};