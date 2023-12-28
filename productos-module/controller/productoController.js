const ServiceProducto = require('../service/productoService');
const serviceProducto = new ServiceProducto();

const axios = require("axios");

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const listarProductos = async(req, res) => {
    try {
        if (typeof req.params.id !== 'undefined' && req.params.id !== null && req.params.id !== '') {
            const producto = await serviceProducto.findById(req.params.id);
            res.status(200).send({producto: producto});
        } else if (typeof req.query.usuario !== 'undefined' && req.query.usuario !== null && req.query.usuario !== '') {
            const productos = await serviceProducto.findByUsuario(req.query.usuario);
            res.status(200).send({productos: productos});
        } else {
            const productos = await serviceProducto.findAll();
            res.status(200).send({productos: productos});
        }
    } catch (error) {
        res.status(500).send({success: false, message: error.message});
    }
}

const filtrarProductos = async(req, res) => {
    try {
        const productos = await serviceProducto.filterProductos(req.body.usuario, req.body.texto, req.body.orden);
        res.status(200).send({productos: productos});
    } catch (error) {
        res.status(500).send({success: false, message: error.message});
    }
}

const listarProductosPorPujasUsuario = async(req, res) => {
    try {
        const pujas = await axios.get(`http://localhost:5002/api/v2/pujas?usuario=${req.query.usuario}`)
            .then((result) => {
                return result.data.pujas;
            });
        const productosByPujas = await serviceProducto.findByPujasUsuario(pujas);
        res.status(200).send({productos: productosByPujas});
    } catch (error) {
        res.status(500).send({success: false, message: error.message});
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const guardarProducto = async(req, res) => {
    try {

        if (typeof req.body.id !== "undefined" && req.body.id !== null && req.body.id !== '') {
            const check = await  serviceProducto.checkProductoActualizable(req.body.id);
            if (check !== 'ok' && typeof req.body.puja === 'undefined') {
                res.status(409).send({message: check});
            } else {
                const producto = await serviceProducto.update(
                    req.body.id,
                    req.body.nombre,
                    req.body.direccion,
                    req.body.descripcion,
                    req.body.precioInicial,
                    req.body.fechaCierre,
                    req.body.imagen,
                    req.body.puja
                );
                res.status(200).send({message: 'Producto ' + req.body.id + ' actualizado con éxito', producto: producto});
            }
        } else {
            const usuario = await axios.get(`http://localhost:5003/api/v2/usuarios?correo=${req.body.usuario}`)
                .then((result) => {
                    return result.data;
                })

            if(usuario === null || typeof usuario === 'undefined'){
                res.status(400).send("El usuario no existe")
            }else{
                const check = await serviceProducto.checkProducto(req.body.nombre, req.body.usuario);

                if (check !== 'ok'){
                    res.status(409).send({message: check});
                } else {
                    const producto = await serviceProducto.create(
                        req.body.nombre,
                        req.body.direccion,
                        req.body.usuario,
                        req.body.precioInicial,
                        req.body.fechaCierre,
                        req.body.descripcion,
                        req.body.imagen
                    )
                    res.status(201).send({message: 'Producto creado con éxito', producto: producto});
                }
            }
        }
    } catch (error) {
        res.status(500).send({success: false, message: error.message});
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const borrarProducto = async (req, res) => {
    try {
        const producto = await serviceProducto.delete(req.params.id);
        if (producto) {
            await axios.delete(`http://localhost:5002/api/v2/pujas?producto=${req.params.id}`);
            res.status(200).send({message: 'Producto ' + req.params.id + ' borrado con éxito', producto: producto});
        } else {
            res.status(400).send({message: 'No existe el producto ' + req.params.id});
        }

    } catch (error) {
        res.status(500).send({success: false, message: error.message});
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const reabrirSubastas = async () => {
    try{
        const productos = await serviceProducto.findSubastasCerradas();
        for(const producto of productos){
            if(!producto.puja){
                const duracion = producto.fechaCierre - producto.fechaInicio;
                const nuevaFechaCierre = new Date();
                nuevaFechaCierre.setTime(nuevaFechaCierre.getTime() + duracion);
                const nuevoPrecio = Math.round(producto.precioInicial * 0.9 * 100) / 100;
                await serviceProducto.periodicUpdate(
                    producto.id,
                    nuevoPrecio,
                    nuevaFechaCierre
                );
            }
        }
    } catch (error) {
        console.log(error)
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const notificarCorreo = async () => {
    try{
        const productos = await serviceProducto.findSubastasCerradas();
        for(const producto of productos){
            const duracion = new Date() - producto.fechaCierre;
            if(producto.puja && duracion <= 24*60*60*1000){
                const vendedor = producto.usuario;
                const comprador = producto.puja.usuario;
                await axios.post('http://localhost:5005/api/v2/email/confirm',
                    {
                        producto: producto.nombre,
                        comprador: comprador,
                        vendedor: vendedor
                    }
                )
            }
        }
    } catch (error) {
        console.log(error)
    }
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {listarProductos, listarProductosPorPujasUsuario, guardarProducto, borrarProducto, filtrarProductos, reabrirSubastas, notificarCorreo}