const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Inizializza il client salvando la sessione (così non devi scansionare il QR ogni volta)
const client = new Client({
    authStrategy: new LocalAuth()
});

// Genera il QR code nel terminale per il primo accesso
client.on('qr', (qr) => {
    console.log('Scansiona questo QR code con il tuo WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Avviso quando il bot è connesso
client.on('ready', () => {
    console.log('Bot collegato e in ascolto per il menu della mensa!');
});

// Ascolta i messaggi in arrivo
client.on('message', async (msg) => {
    
    // --- PERSONALIZZA QUESTI DUE CAMPI ---
    const NOME_ADDETTA = "Nome esatto rubrica"; // Es: "Maria Mensa"
    const NOME_GRUPPO = "Nome esatto del gruppo"; // Es: "Gruppo Mensa Ufficio"
    // -------------------------------------

    const contact = await msg.getContact();

    // Controlla se il mittente è l'addetta alla mensa
    if (contact.name === NOME_ADDETTA) {
        
        // Filtro: il messaggio deve essere lungo (più di 50 caratteri)
        if (msg.body.length > 50) {
            console.log("Menu intercettato! Inoltro in corso...");

            // Cerca il gruppo tra tutte le tue chat
            const chats = await client.getChats();
            const gruppoMensa = chats.find(chat => chat.isGroup && chat.name === NOME_GRUPPO);

            if (gruppoMensa) {
                // Invia il messaggio al gruppo
                await client.sendMessage(gruppoMensa.id._serialized, msg.body);
                console.log("✅ Menu inviato con successo al gruppo!");
            } else {
                console.log("❌ Gruppo non trovato. Controlla il nome esatto.");
            }
        } else {
            console.log(`Messaggio troppo corto ignorato (${msg.body.length} car.): ${msg.body}`);
        }
    }
});

// Avvia il client
client.initialize();
