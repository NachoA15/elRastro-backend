const Producto = require('../db/model/producto')

class ServiceProducto {
    constructor() {}

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async findAll() {
        const res = await Producto.find().sort({fechaInicio: -1});
        return res;
    }
    
    async findById(id) {
        const res = await Producto.findById(id);
        return res;
    }

    async findByUsuario(usuario) {
        const res = await Producto.find(
            {
                usuario: usuario
            }
        ).sort({fechaInicio: -1});
        return res;
    }

    async findSubastasCerradas() {
        const fechaActual = Date();
        const res = await Producto.find(
            {
                fechaCierre: {$lt: fechaActual}
            }
        );
        return res;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async processProductosByPujas(productoId, puja, productosByPujas) {
        let j = 0;
        while (j < productosByPujas.length && productosByPujas[j].producto.id !== productoId) {
            j++;
        }

        if (j >= productosByPujas.length) {
            const producto = await this.findById(productoId);
            productosByPujas.push({producto: producto, pujas: [puja]});
        } else {
            productosByPujas[j].pujas.push(puja);
        }
    }

    async findByPujasUsuario(pujas) {
        let productosByPujas = [];
        for (let i = 0; i < pujas.length; i++) {
            await this.processProductosByPujas(pujas[i].producto, pujas[i], productosByPujas);
        }
        return productosByPujas;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async getPujaMasAlta(productoId) {
        const producto = await this.findById(productoId);

        return producto.puja !== null && typeof producto.puja !== undefined && producto.puja !== {}?
            producto.puja.cantidad : producto.precioInicial;
    }

    async filterProductos(usuario, texto, order) {
        let filtroBusqueda = {};

        if (typeof texto !== 'undefined') {
            filtroBusqueda = {
                $or: [
                    {
                        nombre:
                            {
                                '$regex': texto,
                                '$options': 'i'
                            }
                    },

                    {
                        descripcion:
                            {
                                '$regex': texto,
                                '$options': 'i'
                            }
                    }
                ]
            }
        }

        if (typeof usuario !== 'undefined') {
            filtroBusqueda.usuario = usuario;
        }

        let res = [];
        switch (String(order)) {
            case "Activa":
                filtroBusqueda.fechaCierre = {$gte: new Date()};
                res = await Producto.find(filtroBusqueda).sort({fechaInicio: -1});
                break;
            case "Finalizada":
                filtroBusqueda.fechaCierre = {$lte: new Date()};
                res = await Producto.find(filtroBusqueda).sort({fechaInicio: -1});
                break;
            case "Precio_Asc":
                res = await Producto.find(filtroBusqueda).sort({precioInicial: 1});
                break;
            case "Precio_Desc":
                res = await Producto.find(filtroBusqueda).sort({precioInicial: -1});
                break;
            case "Fecha_Asc":
                res = await Producto.find(filtroBusqueda).sort({fechaInicio: 1});
                break;
            case "Puja_Asc":
                let productos = await Producto.find(filtroBusqueda);

                // Create an array of promises to get the highest bid for each product
                let promises = productos.map(async (producto) => {
                    const pujaMasAlta = await this.getPujaMasAlta(producto._id);
                    return {producto, pujaMasAlta};
                });

                // Wait for all promises to resolve
                let results = await Promise.all(promises);

                // Sort the array based on the highest bid
                results.sort((a, b) => a.pujaMasAlta - b.pujaMasAlta);

                // Extract the sorted products
                res = results.map((result) => result.producto);
                break;

            case "Puja_Desc":
                let productos1 = await Producto.find(filtroBusqueda);

                // Create an array of promises to get the highest bid for each product
                let promises1 = productos1.map(async (producto) => {
                    const pujaMasAlta = await this.getPujaMasAlta(producto._id);
                    return {producto, pujaMasAlta};
                });

                // Wait for all promises to resolve
                let results1 = await Promise.all(promises1);

                // Sort the array based on the highest bid
                results1.sort((a, b) => b.pujaMasAlta - a.pujaMasAlta);

                // Extract the sorted products
                res = results1.map((result) => result.producto);

                break;

            default:
                res = await Producto.find(filtroBusqueda).sort({fechaInicio: -1});
                break;
        }

        return res;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async checkProducto(nombre, usuario) {
        const productosUsuario = await this.findByUsuario(usuario);
        let i = 0;
        while (i < productosUsuario.length && productosUsuario[i].nombre !== nombre) {
            i++;
        }

        return i < productosUsuario.length ?
            'Ya existe un producto con el mismo nombre para el usuario ' + usuario : 'ok';
    }

    async create(nombre, direccion, usuario, precioInicial, fechaCierre, descripcion, imagen) {
        const res = await Producto.create(
            {
                nombre: nombre,
                direccion: direccion,
                usuario: usuario,
                precioInicial: precioInicial,
                fechaInicio: Date(),
                fechaCierre: fechaCierre,
                descripcion: descripcion,
                imagen: imagen,
                puja: {}
            }
        );

        return res;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async checkProductoActualizable(id) {
        const producto = await this.findById(id);
        // COMPROBAR SI CUANDO SE ELIMINA ALGUNA PUJA LA CONDICIÓN SIGUE SIENDO VERDAD
        if (!producto.puja || typeof producto.puja === 'undefined' || producto.puja === {}) {
            return 'ok';
        } else {
            return 'No se puede actualizar el producto ' + id + ' porque ya han pujado sobre él';
        }
    }

    async update(id, nombre, direccion, descripcion, precioInicial, fechaCierre, imagen, puja) {
        const res = await Producto.findByIdAndUpdate(id,
            {
                nombre: nombre,
                direccion: direccion,
                descripcion: descripcion,
                precioInicial: precioInicial,
                fechaCierre: fechaCierre,
                imagen: imagen,
                puja: puja
            },
    {
                returnOriginal: true
            }
        );

        return res;
    }

    async periodicUpdate(id, precioInicial, fechaCierre) {
        const res = await Producto.findByIdAndUpdate(id,
            {
                precioInicial: precioInicial,
                fechaCierre: fechaCierre
            }
        );

        return res;
    }

    async updatePuja(id, puja) {
        const res = await Producto.findByIdAndUpdate(id,
            {
                puja: puja
            },
            {new: true}
        );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async delete(id) {
        const res = await Producto.findByIdAndDelete(id);
        return res;
    }
}

module.exports = ServiceProducto
