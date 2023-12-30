const ServiceUsuario = require('../service/usuarioService');
const serviceUsuario = new ServiceUsuario();

let cache = [];
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const createUsuarioController = async (req, res, next) => {
    if (!req.body){
        return res.status(400).json({
            error: "El usuario no existe"
        })
    }
    try{
        const usuario = await serviceUsuario.createUsuario(req.body);
        if (usuario.message !== 'ok') {
            res.status(409).send({message: usuario.message});
        } else {
            res.status(201).send({message: "Usuario " + usuario.usuario.correo + " creado con éxito", usuario: usuario.usuario});
        }
    }catch (error) {
        res.status(500).send({success: false, message: error.message});
    }

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const getUsuarioByIdController = async (req, res, next) => {
    try{
        if(req.query.nombre){
            usuario = await serviceUsuario.getUsuarioByNombre(req.query.nombre)
        }else if(req.query.correo){
            usuario = await serviceUsuario.getUsuarioByCorreo(req.query.correo)
        }else{
            usuario = await serviceUsuario.getUsuarios()
        }

        res.status(200).send(usuario);

    }catch(error){
        res.status(500).send({success: false, message: error.message});
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const deleteUsuarioController = async (req, res, next) => {
    try{
        const response = await serviceUsuario.deleteUsuario(req.params.correo)
        res.status(response.status).send(response.res);
    }catch(error){
        res.status(500).send({success: false, message: error.message});
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const updateUsuarioController = async (req, res, next) => {
    try{
        const response = await serviceUsuario.updateUsuario(req.body.id, req.body.nombre, req.body.correo)
        if(response === null){
            res.status(400).send("El usuario que quiere actualizar no existe");
        }else{
            res.status(200).send({usuario: response});
        }
    }catch(error){
        res.status(500).send({success: false, message: error.message});
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const checkTokenInCache =  (tokenToCheck) => {
    const tokenIndex = cache.findIndex(([token, caducidad]) => token === tokenToCheck)
    if (tokenIndex !== -1) {
        const [, caducidad] = cache[tokenIndex];
        if(caducidad < new Date().getTime()/1000){
            cache.splice(tokenIndex, 1);
            throw new Error("Caducado");
        }else{
            return "ok"
        }
    }else{
        throw new Error("No esta en la cache");
    }
}

const checkToken = async (req, res, next) => {
    try{
        const tokenToCheck = req.headers.authorization
        const tokenIndex = cache.findIndex(([token, caducidad]) => token === tokenToCheck)

        if (tokenIndex !== -1) {
            const [, caducidad] = cache[tokenIndex];
            if(caducidad < new Date().getTime()){
                cache.splice(tokenIndex, 1);
                res.status(401).send("Caducado");
            }else{
                let user = await serviceUsuario.getDataFromGoogleToken(tokenToCheck);
                res.status(200).send({email: user.res.email, token: tokenToCheck});
            }
        } else {
            const isValid = await serviceUsuario.verifyGoogleToken(tokenToCheck);
            if(isValid.status === 200){
                let user = await serviceUsuario.createOrUpdateUsuarioFromGoogle(isValid.res.token);
                cache.push([isValid.res.token, parseInt(isValid.res.exp)]);
                res.status(isValid.status).send({email: user.res, token: tokenToCheck});
            }else{
                res.status(401).send("No autorizado");
            }

        }

    }catch (error) {
        throw new Error(`Error al agregar el token a la caché: ${error.message}`);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const updateValoracionController = async (req, res, next) => {
    try{
        const response = await serviceUsuario.checkValoracion(req.body.valorado, req.body.valorador, req.body.producto)
        if(response !== "ok"){
            res.status(400).send(response);
        }else{
            const usuario = await serviceUsuario.valorar(req.body.valoracion, req.body.valorado, req.body.valorador, req.body.producto)
            res.status(200).send({usuario: usuario});
        }
    }catch(error){
        res.status(500).send({success: false, message: error.message});
    }
}

const getRatingUsuarioController = async (req, res, next) => {
    try{
        const media = await serviceUsuario.getValoracionMedia(req.query.correo)
        res.status(200).send({usuario: media});
    }catch(error){
        res.status(500).send({success: false, message: error.message});
    }
}


const getValoracionUsuarioController = async (req, res, next) => {
    try{
        const valoracion = await serviceUsuario.getValoracion(req.query.correo)
        res.status(200).send({usuario: valoracion});
    }catch(error){
        res.status(500).send({success: false, message: error.message});
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
    createUsuarioController,
    getUsuarioByIdController,
    deleteUsuarioController,
    updateUsuarioController,
    updateValoracionController,
    getRatingUsuarioController,
    getValoracionUsuarioController,
    checkToken,
    checkTokenInCache
}