export default {
    commands: ["consejo"],
    description: "Envía un consejo inspirador",
    category: "fun",
    flags: [], // vacío porque no requiere banderas.
    exec: async (wss, { m, plugins, usedPrefix }) => {
        // Muestra el mensaje de carga
        await wss.sendMessage(m.chat, { text: "✐ Buscando un consejo, espere un momento..." }, { quoted: m });

        // Selecciona un consejo aleatorio
        const consejo = pickRandom(global.consejo);

        // Envia directamente el consejo
        await wss.sendMessage(m.chat, { text: `❀ *"${consejo}"*`, mentions: [m.sender] }, { quoted: m });
    }
}

let pickRandom = (list) => {
    if (list.length === 0) return "No hay consejos disponibles en este momento.";  // mensaje por si la lista está vacía
    return list[Math.floor(Math.random() * list.length)];
};

// Definir global.consejo si no existe. 
if (typeof global.consejo === "undefined") {
    global.consejo = [
        "Recuerda que no puedes fallar en ser tú mismo (Wayne Dyer)",
        "Siempre es temprano para rendirse (Jorge Álvarez Camacho)",
        "Sólo una cosa convierte en imposible un sueño: el miedo a fracasar (Paulo Coelho)",
        "Lo que haces hoy puede mejorar todos tus mañanas (Ralph Marston)",
        "Las pequeñas acciones de cada día hacen o deshacen el carácter (Oscar Wilde)",
        "Cáete siete veces y levántate ocho (Proverbio japonés)",
        "Para que los cambios tengan un valor verdadero deben ser consistentes y duraderos (Anthony Robbins)",
        "Nada sucede hasta que algo se mueve (Albert Einstein)",
        "Ser un buen perdedor es aprender cómo ganar (Carl Sandburg)",
        "Todos nuestros sueños pueden hacerse realidad, si tenemos el coraje de perseguirlos (Walt Disney)",
        // Añadir más consejos aquí...
    ];
}