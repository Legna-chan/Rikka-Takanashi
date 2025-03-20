import { exec } from 'child_process';
import './settings.mjs';

export default {
    commands: ["update"],
    description: "Actualiza la bot desde el repositorio de github.",
    category: "owner",
    flags: [],
    exec: async (wss, { m }) => {
        // Verificar si el usuario es el propietario
        if (!global.owner.includes(m.sender)) {
            await wss.sendMessage(m.chat, { text: "❍ Solo el propietario puede actualizar a la bot." }, { quoted: m });
            return;
        }

        // Enviar mensaje de actualización en curso
        await wss.sendMessage(m.chat, { text: "❀ Actualizando la bot..." }, { quoted: m });

        exec("git pull", async (err, stdout, stderr) => {
            if (err) {
                await wss.sendMessage(m.chat, { text: `❀ Error: No se pudo realizar la actualización.\nRazón: ${err.message}` }, { quoted: m });
                return;
            }

            if (stderr) {
                console.warn("Advertencia durante la actualización:", stderr);
            }

            if (stdout.includes("Already up to date.")) {
                await wss.sendMessage(m.chat, { text: "✐ La bot ya está actualizado." }, { quoted: m });
            } else {
                await wss.sendMessage(m.chat, { text: `✧ Actualización realizada con éxito.\n\n${stdout}` }, { quoted: m });
            }
        });
    }
};