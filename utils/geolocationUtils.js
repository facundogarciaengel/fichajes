const axios = require('axios');

const obtenerDireccionGoogleMaps = async (coordenadas) => {
    try {
        const apiKey = 'AIzaSyBq6q5RaIyajDkj07RjmWznT26EB5imZmk'; // Tu API Key de Google Maps
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordenadas}&key=${apiKey}&language=es`;

        const response = await axios.get(url);

        if (response.data.status === 'OK') {
            return response.data.results[0].formatted_address;
        } else {
            console.error('Error en la geolocalización:', response.data.status);
            return 'Dirección no disponible';
        }
    } catch (error) {
        console.error('Error al obtener la dirección:', error.message);
        return 'Dirección no disponible';
    }
};

module.exports = obtenerDireccionGoogleMaps;
