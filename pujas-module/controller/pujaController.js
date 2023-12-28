const ServicePuja = require('../service/pujaService');
const servicePuja = new ServicePuja();

const axios = require("axios");

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const listarPujas = async (req, res) => {
    try {
        if (typeof req.query.usuario === 'undefined' && typeof req.query.producto === 'undefined') {
            const pujas = await servicePuja.findAll();
            res.status(200).send({pujas: pujas});
        } else if (typeof req.query.producto === 'undefined') {
            const pujas = await servicePuja.findByUser(req.query.usuario);
            res.status(200).send({pujas: pujas});
        } else if (typeof req.query.usuario === 'undefined') {
            const pujas = await servicePuja.findByProduct(req.query.producto);
            res.status(200).send({pujas: pujas});
        } else {
            const pujas = await servicePuja.findByUserAndProduct(req.query.usuario, req.query.producto);
            res.status(200).send({pujas: pujas});
        }

    } catch (error) {
        res.status(500).send({success: false, message: error.message});
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const guardarPuja = async (req, res) => {
    try {
        if (typeof req.body.id !== "undefined" && req.body.id !== null && req.body.id !== '') {
            const pujaActualizada = await servicePuja.update(
                req.body.id,
                req.body.usuario,
                req.body.cantidad,
                Date(),
                req.body.producto
            )

            res.status(200).send({message: 'Puja actualizada con éxito', puja: pujaActualizada});
        } else {
            const check = await servicePuja.checkPuja(req.body.usuario, req.body.cantidad, req.body.producto);
            if (check !== 'ok') {
                res.status(409).send(check);
            } else {
                const pujaCreada = await servicePuja.create(
                    req.body.usuario,
                    req.body.cantidad,
                    req.body.producto
                )
                await axios.put(`http://localhost:5001/api/v2/productos/`,
                    {
                        id: req.body.producto,
                        puja: pujaCreada
                    }
                );

                res.status(201).send({message: 'Puja creada con éxito', puja: pujaCreada});
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({success: false, message: error.message});
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const borrarPuja = async (req, res) => {
    try {
        const puja = await servicePuja.delete(req.params.id);
        if (puja) {
            const pujasProducto = await servicePuja.findByProduct(puja.producto);
            let nuevaPujaMasAlta;

            // Una vez borrada la puja, se actualiza la puja más alta del producto si procede
            if (pujasProducto.length === 0) {
                nuevaPujaMasAlta = {};
                await axios.put(`http://localhost:5001/api/v2/productos/`,
                    {
                        id: puja.producto,
                        puja: nuevaPujaMasAlta
                    }
                );
            }else if (pujasProducto[pujasProducto.length - 1].cantidad < puja.cantidad) {
                nuevaPujaMasAlta = pujasProducto[pujasProducto.length - 1];
                await axios.put(`http://localhost:5001/api/v2/productos/`,
                    {
                        id: puja.producto,
                        puja: nuevaPujaMasAlta
                    }
                );
            }

            res.status(200).send({message: 'Puja ' + req.params.id + ' borrada con éxito', puja: puja});
        } else {
            res.status(400).send({message: 'No existe la puja ' + req.params.id});
        }
    } catch (error) {
        res.status(500).send({success: false, message: error.message});
    }
}

const borrarPujasPorProducto = async (req, res) => {
    try {
        if (typeof req.query.producto !== 'undefined') {
            await servicePuja.deletePujasByProduct(req.query.producto);
        }
    } catch (error) {
        res.status(500).send({success: false, message: error.message});
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {listarPujas, guardarPuja, borrarPuja, borrarPujasPorProducto}