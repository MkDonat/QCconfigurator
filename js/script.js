document.addEventListener('DOMContentLoaded', (event) => {
    const inputs = document.querySelectorAll('.key-input');

    inputs.forEach(input => {
        input.addEventListener('click', function() {
            const row = this.getAttribute('data-row');
            const rowInputs = document.querySelectorAll(`.key-input[data-row="${row}"]`);
            let currentIndex = 0;
            let timeoutId;

            const captureKey = (event) => {
                event.preventDefault(); // Empêche la touche d'être capturée dans le champ
                const currentInput = rowInputs[currentIndex];
                console.log(`Key pressed in ${currentInput.id}: ${event.key}`);
                
                // Affiche la touche pressée dans le champ de texte
                if (event.keyCode.toString(16).toUpperCase() === '20') {
                    currentInput.value = 'BACKSPACE';
                } else {
                    currentInput.value = event.key;
                }

                currentInput.dataset.keyCode = event.keyCode.toString(16).toUpperCase(); // Stocke le code hexadécimal dans un attribut de données

                currentInput.disabled = false; // Réactive le champ de texte
                document.removeEventListener('keydown', captureKey);
                clearTimeout(timeoutId); // Annule le délai d'attente

                currentIndex++;
                if (currentIndex < rowInputs.length) {
                    rowInputs[currentIndex].disabled = true; // Désactive temporairement le champ de texte suivant
                    document.addEventListener('keydown', captureKey);
                    startTimeout(); // Redémarre le délai d'attente pour le champ suivant
                }
            };

            const startTimeout = () => {
                timeoutId = setTimeout(() => {
                    // Annule la capture et vide les champs non remplis
                    for (let i = currentIndex; i < rowInputs.length; i++) {
                        rowInputs[i].value = '';
                        rowInputs[i].disabled = false;
                    }
                    document.removeEventListener('keydown', captureKey);
                }, 1000); // Délai de 1 secondes
            };

            rowInputs[currentIndex].disabled = true; // Désactive temporairement le premier champ de texte
            document.addEventListener('keydown', captureKey);
            startTimeout(); // Démarre le délai d'attente pour le premier champ
        });
    });

    document.getElementById('SEND_CONFIG').addEventListener('click', async function() {
        const table = document.getElementById('configTable');
        const rows = table.querySelectorAll('tr[data-row]');
        const JSONCONFIG = {};
    
        rows.forEach(row => {
            const buttonName = row.querySelector('td').innerText.trim().replace(' ', '_').toUpperCase();
            const inputs = row.querySelectorAll('input');
            JSONCONFIG[buttonName] = Array.from(inputs).map(input => `${input.value}:${input.dataset.keyCode}`);
        });
    
        //console.log(JSONCONFIG); // Affiche l'objet JSONCONFIG dans la console
        // Vous pouvez également envoyer cet objet à un serveur ou l'utiliser comme bon vous semble
    
        try { // Setting Characteristic
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b'] }]
            });

            const server = await device.gatt.connect();
            const service = await server.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
            const characteristic = await service.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8');

            const encoder = new TextEncoder();

            // Diviser JSONCONFIG en deux parties
            const keys = Object.keys(JSONCONFIG);
            const half = Math.ceil(keys.length / 2);
            const firstHalf = keys.slice(0, half).reduce((obj, key) => {
                obj[key] = JSONCONFIG[key];
                return obj;
            }, {});
            const secondHalf = keys.slice(half).reduce((obj, key) => {
                obj[key] = JSONCONFIG[key];
                return obj;
            }, {});

            // Encoder et envoyer la première moitié
            const encodedData1 = encoder.encode(JSON.stringify(firstHalf));
            if (encodedData1.length > 512) {
                throw new Error('Les données de la première moitié dépassent la limite de 512 octets.');
            }
            await characteristic.writeValue(encodedData1);
            console.log('Première moitié des données envoyées:', JSON.stringify(firstHalf));

            // Encoder et envoyer la deuxième moitié
            const encodedData2 = encoder.encode(JSON.stringify(secondHalf));
            if (encodedData2.length > 512) {
                throw new Error('Les données de la deuxième moitié dépassent la limite de 512 octets.');
            }
            await characteristic.writeValue(encodedData2);
            console.log('Deuxième moitié des données envoyées:', JSON.stringify(secondHalf));

            // Concaténer les deux parties pour obtenir un JSON valide
            const concatenatedData = JSON.stringify({ ...firstHalf, ...secondHalf });
            console.log('Données concaténées:', concatenatedData);

        } catch (error) {
            console.error('Erreur lors de l\'envoi des données Bluetooth:', error);
        }
    
    });

    // Ajout de l'écouteur d'événements pour le bouton RESET
    document.getElementById('RESET').addEventListener('click', () => {
        inputs.forEach(input => {
            input.value = ''; // Efface le contenu du champ de texte
            delete input.dataset.keyCode; // Supprime l'attribut de données
        });
    });
});