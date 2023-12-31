const ServiceCarbono = require('../service/carbonoService');
const serviceCarbono = new ServiceCarbono();

const axios = require("axios");
const getCoordinatesFromPostalCode = async (req, res, next) => {
    try {
        let checkToken = await axios.get("https://el-rastro-a7-backend.vercel.app/api/v2/usuarios/checkLocalCache",{
            headers: {
                'authorization': req.headers.authorization
            }
        })
        if(checkToken.status !== 200){
            res.status(checkToken.status).send(checkToken.data)
        }else {
            const coordenadas = await serviceCarbono.getCoordenadasByCodPostal(req.query.codPostal)
            res.status(200).json(coordenadas)
        }
    } catch (error) {
        res.status(401).send({success: false, message: 'No se ha podido obtener las coordenadas para el código postal ' + req.query.codPostal});
    }
}

const getHuellaCarbono = async (req, res) => {
    try {
        let checkToken = await axios.get("https://el-rastro-a7-backend.vercel.app/api/v2/usuarios/checkLocalCache",{
            headers: {
                'authorization': req.headers.authorization
            }
        })
        if(checkToken.status !== 200){
            res.status(checkToken.status).send(checkToken.data)
        }else{
        const huella = await serviceCarbono.getHuellaCarbono(req.query.userLat,req.query.userLong, req.query.codPostalProducto);
        res.status(200).send(huella);
        }
    } catch (error) {
        res.status(500).send({success: false, message: error.message});
    }
}

module.exports = {getCoordinatesFromPostalCode, getHuellaCarbono}