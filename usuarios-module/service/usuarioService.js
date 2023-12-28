const Usuario = require('../db/model/usuario');
const axios = require("axios");

class ServiceUsuario {
    constructor() {}

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async getUsuarios() {
        const res = await Usuario.find()
        return res;
    }

    async getUsuarioByNombre(nombreUsuario) {
        const res = await Usuario.findOne({nombre: nombreUsuario})
        return res;
    }

    async getUsuarioByCorreo(correo) {
        const res = await Usuario.findOne({correo: correo})
        return res;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async createUsuario(usuario) {
        try {
            const foundUsuario = await Usuario.find({});
            const existingUsuarios = foundUsuario.map(usuario => usuario.toJSON());

            for (const existingUsuario of existingUsuarios) {
                if (existingUsuario['correo'] === usuario['correo']) {
                    return {message: "Ya existe un usuario con el mismo correo"};
                }
            }

            const res = await Usuario.create(
                {
                    nombre: usuario.nombre,
                    correo: usuario.correo,
                }
            )


            return {message: 'ok', usuario: res};
        } catch (error) {
            return error;
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async updateUsuario(correo, nombreUsuario) {
        const usuario = await Usuario.findOneAndUpdate({correo: correo}, { nombre: nombreUsuario },
            { new: true });

        return usuario;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async deleteUsuario(correo) {
        const productos = await axios.get(`http://localhost:5001/api/v2/productos?usuario=${correo}`).then((result) => {
            return result.data.productos;
        });
        if (productos.length !== 0) {
            return {status: 409, res: "El usuario " + correo + " tiene productos y no se puede borrar"};
        } else {
            const res = await Usuario.deleteOne({correo: correo});
            return {status: 200, res: res};
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async valorar(valoracion, usuarioValorado, usuarioValorador, producto){
        const foundValorador = await Usuario.findOne({correo: usuarioValorador})
        const nuevaValoracion = {
            valorador: foundValorador.correo,
            calidad: valoracion.calidad,
            fiabilidad: valoracion.fiabilidad,
            descripcion: valoracion.descripcion,
            producto: producto
        }

        const foundUsuario  = await Usuario.findOneAndUpdate({correo: usuarioValorado}, {$push: {valoracion: nuevaValoracion}},
            { new: true });
        return foundUsuario.toJSON();
    }

    async getValoracionMedia(correo){
        const foundUsuario = await Usuario.findOne({correo: correo});

        const sumaPuntuaciones = foundUsuario.valoracion.reduce((total, val) => {
            const calidadNumerica = parseFloat(val.calidad) || 0; // parseFloat convierte a número de punto flotante, el '|| 0' maneja el caso en que no se pueda convertir
            const fiabilidadNumerica = parseFloat(val.fiabilidad) || 0;

            return total + calidadNumerica + fiabilidadNumerica;
        }, 0);

        const cantidadValoraciones = foundUsuario.valoracion.length * 2;

        const mediaPuntuaciones = cantidadValoraciones > 0 ? sumaPuntuaciones / cantidadValoraciones : 0;
        return mediaPuntuaciones;

    }

    async getValoracion(correo){
        const foundUsuario = await Usuario.findOne({correo: correo});
        const valoraciones = foundUsuario.valoracion;

        return valoraciones;

    }

    async checkValoracion(usuarioValorado, usuarioValorador, producto) {
        const foundValorado = await Usuario.findOne({correo: usuarioValorado})
        const foundValorador = await Usuario.findOne({correo: usuarioValorador})
        const foundProducto = await axios.get(`http://localhost:5001/api/v2/productos/${producto}`)
            .then((result) => {
                return result.data.producto;
            })
        const subastaClosed = foundProducto.puja;
        const currentDate = new Date();
        //const formatedDate = formatarFecha(currentDate)

        if (typeof foundValorado === 'undefined' || !foundValorado) {
            return "El usuario que se quiere valorar no existe";
        } else if (typeof foundValorador === 'undefined' || !foundValorador) {
            return "El usuario que valora no existe";
        } else if (typeof foundProducto === 'undefined' || !foundProducto){
            return "El producto sobre el que se quiere valorar no existe";
        }else if(foundProducto.fechaCierre < currentDate){

            const foundValoracion = foundValorado.valoracion.filter((val) => val.producto === producto && val.valorador === foundValorador.correo);


            if(foundValoracion.length !== 0){
                return "A este usuario ya se le ha valorado por este producto";
            }else if(subastaClosed.usuario !== foundValorador.correo && foundProducto.usuario !== foundValorador.correo){
                return "El usuario no ha sido el ganador del producto";
            }
            return "ok"
        }else{
            return "La subasta aun no se ha cerrado";
        }
    }

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = ServiceUsuario;
