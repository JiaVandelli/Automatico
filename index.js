const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Inizializza il client salvando la sessione (così non devi scansionare il QR ogni volta)
const client = new Client({ 
    authStrategy: new LocalAuth() 
});

// Genera il QR code nel terminale per il primo accesso
client.on('qr', (qr) => {
    console.log('Scansiona questo QR code con l\'app di WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Avviso quando il bot è connesso e operativo
client.on('ready', () => {
    console.log('✅ Bot collegato! In ascolto per il menù della mensa.');
});

// ----- CONFIGURAZIONE (INSERISCI I TUOI DATI QUI) -----

// Inserisci il numero dell'addetta con il prefisso, senza il + e senza spazi, seguito da @c.us
// Esempio: se il numero è +39 333 1234567, scrivi "393331234567@c.us"
const ID_ADDETTA = "393331234567@c.us"; 

// Nome esatto del gruppo su WhatsApp
const NOME_GRUPPO = "MENÙ Arena 2.0"; 

// ------------------------------------------------------

// Ascolta i messaggi in arrivo
client.on('message', async (msg) => {
    try {
        // 1. Filtra il mittente in modo infallibile usando l'ID univoco
        if (msg.from !== ID_ADDETTA) return;

        // 2. Filtra il contenuto: controlla le caratteristiche del menù
        const lines = msg.body.split('\n').filter(line => line.trim().length > 0);
        const commaCount = (msg.body.match(/,/g) || []).length;

        const isMenu = (
            msg.body.length > 60 &&
            (lines.length >= 3 || commaCount >= 3)
        );

        if (!isMenu) {
            console.log(`⏩ Ignorato (non è un menù): ${msg.body.substring(0, 50)}...`);
            return;
        }

        console.log(`🍝 Menù rilevato! Cerco il gruppo...`);

        // 3. Cerca il gruppo tra tutte le tue chat
        const chats = await client.getChats();
        const gruppo = chats.find(chat => chat.isGroup && chat.name === NOME_GRUPPO);

        if (!gruppo) {
            console.log(`❌ Gruppo "${NOME_GRUPPO}" non trovato. Controlla le maiuscole/minuscole.`);
            return;
        }

        // 4. Inoltra il messaggio originale in modo nativo
        await msg.forward(gruppo.id._serialized);
        console.log('✅ Menù inoltrato con successo!');

    } catch (error) {
        console.error('❌ Errore durante l\'elaborazione:', error);
    }
});

// Avvia il client
client.initialize();
