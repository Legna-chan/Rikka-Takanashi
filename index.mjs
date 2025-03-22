import { makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser } from "@whiskeysockets/baileys";
import cfonts from "cfonts";
import pino from "pino";
import { Boom } from "@hapi/boom";
import chalk from "chalk";
import { promises as fs } from "node:fs";
import path from "node:path";
import qrcodeTerminal from "qrcode-terminal";
import Plugin from "./lib/plugins.mjs";
import serialize from "./lib/serialize.mjs";
import handler from "./handler.mjs";
import { JSONFilePreset } from "lowdb/node";
const sessionFolder = path.join("RikkaSessions");

/**
 * Mensajes de inicio.
 */
console.log(chalk.green.bold("Iniciando..."));
cfonts.say("Rikka Takanashi", {
    font: "block",
    align: "center",
    gradient: ["blue", "green"]
});
cfonts.say("editado por legna", {
    font: "console",
    align: "center",
    color: "cyan"
});

/**
 * Iniciamos la base de datos.
 */
globalThis.db = await JSONFilePreset("database.json", {
    users: {},
    groups: {},
    settings: {},
});
await db.read();
console.log(chalk.green("Base de datos iniciada correctamente."));

/**
 * Cargamos los plugins.
 */
await Plugin.load();

/**
 * Observamos cualquier cambio en la carpeta de plugins.
 */
new Plugin();

/**
 * Iniciamos el cliente.
 */
await start();

async function start() {
    /**
     * version => Es la versión de WhatsApp que utilizará tu cliente.
     * isLatest => Indica si es la última versión.
     */
    const { version, isLatest } = await fetchLatestBaileysVersion();
    /**
     * state => Son las credenciales de tu cliente.
     * saveCreds => Guarda las credenciales necesarias en la carpeta de sesión.
     */
    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    /**
     * Estas son configuraciones simples, puedes visitar "https://baileys.whiskeysockets.io/types/SocketConfig.html" para saber más.
     */
    const wss = makeWASocket({
        markOnlineOnConnect: true,
        defaultQueryTimeoutMs: undefined,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(
                state.keys,
                pino({
                    level: "silent",
                }).child({
                    level: "silent",
                }),
            ),
        },
        logger: pino({
            level: "silent",
        }),
        browser: ["Ubuntu", "Edge", "131.0.2903.86"],
        connectTimeoutMs: 1000 * 60,
        qrTimeout: 1000 * 60,
        syncFullHistory: false,
        printQRInTerminal: false,
        patchMessageBeforeSending: async (message) => {
            try {
                await wss.uploadPreKeysToServerIfRequired();
            } catch (err) {
                console.warn(err);
            }
            return message;
        },
        generateHighQualityLinkPreview: true,
        version,
    });

    /**
     * Esto es para evitar mensajes molestos de las Pre-Keys en la consola.
     */
    console.info = () => { };
    console.debug = () => { };

    /**
     * Esto es para que se guarden las credenciales.
     */
    wss.ev.on("creds.update", saveCreds);

    /**
     * Aquí manejaremos la conexión y desconexión del cliente.
     */
    wss.ev.on("connection.update", async ({ lastDisconnect, qr, connection }) => {
        if (qr) {
            console.log(chalk.green.bold(`
╭───────────────────╼
│ ${chalk.cyan("Escanea este código QR para conectarte.")}
╰───────────────────╼`));
            /**
             * Generamos el QR en la terminal.
             */
            qrcodeTerminal.generate(qr, {
                small: true,
            });
        }
        if (connection === "close") {
            const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
            switch (code) {
                case DisconnectReason.loggedOut: // 401
                case DisconnectReason.badSession: // 500
                case DisconnectReason.forbidden: // 403
                case DisconnectReason.multideviceMismatch: // 411
                    console.log(chalk.red.bold(`
╭───────────────────╼
│ ${chalk.yellow("La sesión se cerró sin posibilidades de reconexión.")}
╰───────────────────╼`));
                    console.log(JSON.stringify(lastDisconnect, null, 2));
                    await fs.rm(sessionFolder, { recursive: true, force: true }).catch(() => void 0);
                    process.exit(1);
                default:
                    console.log(chalk.red.bold(`
╭───────────────────╼
│ ${chalk.yellow(`La sesión se cerró con el código de estado "${chalk.white(code)}", reconectando.`)}
╰───────────────────╼`));
                    await start();
                    break;
            }
        }
        if (connection === "open") {
            const userJid = jidNormalizedUser(wss.user.id);
            const userName = wss.user.name || wss.user.verifiedName || "Desconocido";
            console.log(chalk.green.bold(`
╭───────────────────╼
│ ${chalk.cyan("Conectado con éxito")}
│
│- ${chalk.cyan("Usuario :")} +${chalk.white(userJid.split("@")[0] + " - " + userName)}; 
│- ${chalk.cyan("Versión de WhatsApp :")} ${chalk.white(version)} es la última ? ${chalk.white(isLatest)} 
╰───────────────────╼`));
        }
    });

    /**
     * Manejando eventos de actualización de grupo.
     */
    wss.ev.on('groups.update', (update) => {
        console.log(chalk.blue("Evento 'groups.update':"));
        console.log(update);
    });

    /**
     * Manejando cambios de participantes en el grupo.
     */
    wss.ev.on('group-participants.update', (update) => {
        console.log(chalk.green("Evento 'group-participants.update':"));
        console.log(update);

        // Aquí puedes agregar la lógica que necesites. Por ejemplo:
        if (update.action === 'add') {
            console.log(`El usuario ${update.participants} fue agregado al grupo.`);
        }
        if (update.action === 'remove') {
            console.log(`El usuario ${update.participants} fue eliminado del grupo.`);
        }
    });

    /**
     * Aquí manejaremos los mensajes entrantes.
     */
    wss.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type === "notify" && messages && messages.length !== 0) {
            for (const message of messages) {
                const m = serialize(message, wss);
                if (m && m.chat.endsWith('@g.us')) {
                    console.log(chalk.green.bold(`
╭─────────< Rikka Takanashi - Vs 1.0.0 >──────────╼
│ ${chalk.cyan(`Mensaje recibido en grupo`)}
│
│- ${chalk.cyan("Chat :")} ${chalk.white(m.chat)}
│- ${chalk.cyan("Usuario :")} +${chalk.white(m.sender.split("@")[0] + " - " + m.pushName)}
│- ${chalk.cyan("Tipo :")} ${chalk.white(m.type)};
╰╼
${chalk.whiteBright(m.text)}`));
                    handler(wss, m);
                } else {
                    console.log(chalk.yellow(`Mensaje recibido en un chat privado, no procesado.`));
                }
            }
        }
    });
}