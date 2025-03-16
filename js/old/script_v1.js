let ConfigHexKeys = [];
function AddToConfigToHexKeys(event, input) {
    const elementId = input.id;
    const hexCode = event.keyCode.toString(16).toUpperCase();
    let keyExists = false;

    for (let i = 0; i < ConfigHexKeys.length; i++) {
        if (ConfigHexKeys[i][0] === elementId) { // Key already exists
            ConfigHexKeys[i][1] = `0x${hexCode}`; // Store hexCode
            keyExists = true;
            break;
        }
    }

    if (!keyExists) { // Create new key
        ConfigHexKeys.push([elementId, `0x${hexCode}`]);
    }

    input.value = event.key.toUpperCase(); // Display the key label
    if(event.keyCode.toString(16).toUpperCase() === '20') { // If key is BACKSPACE
        input.value = 'SPACE';
    }
    input.setAttribute('data-hex', `0x${hexCode}`); // Store hexCode in data attribute
    //console.log(ConfigHexKeys);
}

function hexbyID(id){
    let hexExists = false;
    for (let i = 0; i < ConfigHexKeys.length; i++) {
        if (ConfigHexKeys[i][0] === id) { // hex found
            hexExists = true;
            return ConfigHexKeys[i][1];
        }
    }
    if (!hexExists) {
        return '0x00';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('input[type="text"]').forEach(input => {
        input.addEventListener('click', function() {
            const captureKey = (event) => {
                event.preventDefault(); // Empêche la touche d'être capturée dans le champ
                AddToConfigToHexKeys(event, this); //This = input
                document.removeEventListener('keydown', captureKey);
                this.disabled = false; // Réactive le champ de texte
            };
            this.disabled = true; // Désactive temporairement le champ de texte
            document.addEventListener('keydown', captureKey);
        });
    });

    document.getElementById('SEND_CONFIG').addEventListener('click', async function(event) {
        event.preventDefault(); // Empêche le comportement par défaut du bouton submit
        const JsonConfig = { //Config JSONfile To send
            BUTTON_A_KEYS:      [hexbyID('BUTTON_A_KEY_1'),     hexbyID('BUTTON_A_KEY_2'),      hexbyID('BUTTON_A_KEY_3')],
            BUTTON_X_KEYS:      [hexbyID('BUTTON_X_KEY_1'),     hexbyID('BUTTON_X_KEY_2'),      hexbyID('BUTTON_X_KEY_3')],
            BUTTON_Y_KEYS:      [hexbyID('BUTTON_Y_KEY_1'),     hexbyID('BUTTON_Y_KEY_2'),      hexbyID('BUTTON_Y_KEY_3')],
            BUTTON_B_KEYS:      [hexbyID('BUTTON_B_KEY_1'),     hexbyID('BUTTON_B_KEY_2'),      hexbyID('BUTTON_B_KEY_3')],
            BUTTON_SET_KEYS:    [hexbyID('BUTTON_SET_KEY_1'),   hexbyID('BUTTON_SET_KEY_2'),    hexbyID('BUTTON_SET_KEY_3')],
            BUTTON_RST_KEYS:    [hexbyID('BUTTON_RST_KEY_1'),   hexbyID('BUTTON_RST_KEY_2'),    hexbyID('BUTTON_RST_KEY_3')],
            BUTTON_M_KEYS:      [hexbyID('BUTTON_M_KEY_1'),     hexbyID('BUTTON_M_KEY_2'),      hexbyID('BUTTON_M_KEY_3')],
            BUTTON_UP_KEYS:     [hexbyID('BUTTON_UP_KEY_1'),    hexbyID('BUTTON_UP_KEY_2'),     hexbyID('BUTTON_UP_KEY_3')],
            BUTTON_DOWN_KEYS:   [hexbyID('BUTTON_DOWN_KEY_1'),  hexbyID('BUTTON_DOWN_KEY_2'),   hexbyID('BUTTON_DOWN_KEY_3')],
            BUTTON_LEFT_KEYS:   [hexbyID('BUTTON_LEFT_KEY_1'),  hexbyID('BUTTON_LEFT_KEY_2'),   hexbyID('BUTTON_LEFT_KEY_3')],
            BUTTON_RIGHT_KEYS:  [hexbyID('BUTTON_RIGHT_KEY_1'), hexbyID('BUTTON_RIGHT_KEY_2'),  hexbyID('BUTTON_RIGHT_KEY_3')],
            BUTTON_SIDE_KEYS:   [hexbyID('BUTTON_SIDE_KEY_1'),  hexbyID('BUTTON_SIDE_KEY_2'),   hexbyID('BUTTON_SIDE_KEY_3')]
        };
        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b'] }]
            });

            const server = await device.gatt.connect();
            const service = await server.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
            const characteristic = await service.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8');

            const encoder = new TextEncoder();
            const encodedData = encoder.encode(JSON.stringify(JsonConfig));

            await characteristic.writeValue(encodedData);
            //console.log('Données envoyées au périphérique Bluetooth');
            console.log('Données envoyées:', JSON.stringify(JsonConfig));
        } catch (error) {
            console.error('Erreur lors de l\'envoi des données Bluetooth:', error);
        }
    });
});