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

    async deleteUsuario(correo, token) {
        const productos = await axios.get(`https://el-rastro-a7-backend.vercel.app/api/v2/productos?usuario=${correo}`, {
            headers: {
                'authorization': token
            }
        }).then((result) => {
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
    async createOrUpdateUsuarioFromGoogle(token) {
        try {
            const data = await this.getDataFromGoogleToken(token);
            const usuario = await this.getUsuarioByCorreo(data.res.email);
            let result;
            if (usuario === [] || usuario === null) {
                result = await Usuario.create(
                    {
                        nombre: data.res.name,
                        correo: data.res.email,
                        imagen: data.res.picture
                    }
                )
            } else {
                if (usuario.imagen !== null|| usuario.imagen === data.picture) {

                    result = await Usuario.findOneAndUpdate({correo: data.res.email}, { imagen: data.res.picture },
                        { new: true });
                } else {
                    result = usuario;
                }
            }
            return {status: 200, res: result.correo};
        } catch (error) {
            return {status: 401, res: error};
        }
    }

    async getDataFromGoogleToken(token) {
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + token);
        return {status: response.status, res: response.data};

    }

    async verifyGoogleToken(googleToken) {
        try {
            let response = await axios.get('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + googleToken);
            if(response.status === 200){
                return {status: 200, res: {token:googleToken, exp:response.data.exp}}
            }else{
                return {status: 401, res: "El token de sesión no es válido"}
            }
        }
        catch (error) {
            console.error('Error al verificar el token de Google');
            return {status: 401, res: "Token no valido"};
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

    async checkValoracion(usuarioValorado, usuarioValorador, producto, token) {
        const foundValorado = await Usuario.findOne({correo: usuarioValorado})
        const foundValorador = await Usuario.findOne({correo: usuarioValorador})
        const foundProducto = await axios.get(`https://el-rastro-a7-backend.vercel.app/api/v2/productos/${producto}`, {
            headers: {
                'authorization': token
            }
        })
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
        }else if(new Date(foundProducto.fechaCierre) < currentDate){

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
