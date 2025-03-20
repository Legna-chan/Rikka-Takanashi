import { exec } from 'child_process';
import { owner } from '../settings.mjs';

export default {
    commands: ["update"],
    description: "Actualiza el bot desde el repositorio remoto.",
    category: "owner",
    flags: [],
    rowner: true, // Solo el dueño del bot puede ejecutar este comando.
    exec: async (wss, { m }) => {
        console.log("Owner cargado:", owner); // Verifica que owner se esté importando bien

        // Validar si `owner` está definido y es un array
        if (!owner || !Array.isArray(owner)) {
            console.log("⚠ Error: 'owner' no está definido o no es un array.");
            return wss.sendMessage(m.chat, { text: "❌ Error interno en la configuración del owner." }, { quoted: m });
        }

        // Verificar si el usuario que ejecuta el comando es el owner
        const senderNumber = m.sender.split("@")[0]; // Obtener solo el número sin @s.whatsapp.net
        if (!owner.includes(senderNumber)) {
            return wss.sendMessage(m.chat, { text: "❌ No tienes permiso para ejecutar este comando." }, { quoted: m });
        }

        await wss.sendMessage(m.chat, { text: "🔄 Actualizando el bot..." }, { quoted: m });

        exec("git pull", async (err, stdout, stderr) => {
            if (err) {
                await wss.sendMessage(m.chat, { text: `❌ Error: No se pudo realizar la actualización.\nRazón: ${err.message}` }, { quoted: m });
                return;
            }

            if (stderr) {
                console.warn("Advertencia durante la actualización:", stderr);
            }

            if (stdout.includes("Already up to date.")) {
                await wss.sendMessage(m.chat, { text: "✅ El bot ya está actualizado." }, { quoted: m });
            } else {
                await wss.sendMessage(m.chat, { text: `✅ Actualización realizada con éxito.\n\n${stdout}` }, { quoted: m });
            }
        });
    }
};