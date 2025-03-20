/**
 * Este es un ejemplo de como se veria un plugin.
 * 
 * - Recordemos que la estructura de nuestro plugin es:
 * commands => Array<string>, osea: ["comando1", "comando2", ...]
 * description => string, osea: "Descripción del comando"
 * category => string, osea: "categoria"
 * flags => Array<string>, osea: ["bandera1", "bandera2", ...]
 * exec => Promise<void>, osea: async (wss, { m, ...}) {}
 */
export default {
    commands: ["menu", "help"],
    description: "Muestra los comandos disponibles.",
    category: "main",
    flags: [], //vacio porque no require banderas.
    exec: async (wss, { m, plugins, usedPrefix }) => {
        let menu = `
*¡𝚑𝚘𝚕𝚊! _${m.pushName}_, 𝚎𝚜𝚝𝚎 𝚎𝚜 𝚖𝚒 𝚖𝚎𝚗𝚞*

*Bot:* Rikka Takanashi 
*Versión:* 1.0.0
*Desarrollador:* @Legna

*Comandos ➩* ${plugins.size}`;
        const groupedPlugins = Array.from(plugins.values()).reduce((acc, plugin) => {
            if (!acc[plugin.category])
                acc[plugin.category] = [];
            acc[plugin.category].push(plugin);
            return acc;
        }, {});
        for (const [category, plugins] of Object.entries(groupedPlugins)) {
            menu += `\n\n✐ *Categoria ➩* ${category.toUpperCase()}\n`;
            for (const plugin of plugins) {
                menu += `> ${plugin.commands.map((command) => usedPrefix + command).join(" - ")}\n`;
                menu += `> _${plugin.description}_\n`;
            }
        }
        await wss.sendMessage(m.chat, { image: { url: "https://qu.ax/JmOSN.jpg" }, caption: menu, mentions: [m.sender] }, { quoted: m });
    }
}