import { getConnection } from "../database/database.js";
import * as bcryptjs from 'bcryptjs';



const addGroup = async (req, res) => {
    try {
        const { nameGrupo, idUserGreaGrupo } = req.body;
        console.log('grupo:', nameGrupo);
        console.log('idUserGreaGrupo:', idUserGreaGrupo);
        if (idUserGreaGrupo === undefined) {
            res.status(400).json({ message: "No se pudo crear el grupo, falta el id del usuario creador " });
            return;
        }
        if (nameGrupo === undefined) {
            res.status(400).json({ message: "No se pudo crear el grupo, nombre de grupo nulo" });
            return;
        }
        const connection = await getConnection();
        // inserta un nuevo grupo
        const sqlInsertGroup = `INSERT INTO grupos (nameGrupo, idUserCreador) VALUES('${nameGrupo}','${idUserGreaGrupo}')`;
        await connection.query(sqlInsertGroup, async (error, resultGrupo) => {
            if (error) {
                throw error;
            } else {
                // Inserta el usuario que creó el grupo al grupo creado
                const sqlListUsersGroup = `INSERT INTO miembros_grupo(user_id, group_id) values ('${idUserGreaGrupo}','${resultGrupo.insertId}');`;
                await connection.query(sqlListUsersGroup, (error, resp) => {
                    if (error) {
                        throw error;
                    } else {
                        res.status(200).json({idGrupo: resultGrupo.insertId, idUserGreaGrupo: idUserGreaGrupo, message: "Usuario agregado al grupo", respuesta: resp});
                    }
                });
            }
        });
        res.status(200).json({message: "Grupo agregado con exito"});
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const addPostularGroup = async (req, res) => {
    try {
        const { userId, groupId } = req.body;
        console.log("usuario con id:", userId);
        console.log("grupo a Postularse:", groupId);
        if (userId === undefined || groupId === undefined) {
            return res.status(400).json({ message: "No se pudo postular el usuario al grupo" });
        }
        const connection = await getConnection();
        const sqlInsertUserPostularGroup = `INSERT INTO postulaciones_grupo (user_id, group_id) VALUES('${userId}','${groupId}')`;
        await connection.query(sqlInsertUserPostularGroup);
        return res.status(200).json({message: "Usuario postulado al grupo con exito"});
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};


 async function addUserGroup (req, res) {
    try {
        const { userId, groupId } = req.body;
        console.log("usuario con id:", userId);
        console.log("grupo a unir:", groupId);
        if (userId === undefined || groupId === undefined) {
            return res.status(400).json({ message: "No se pudo agregar el usuario al grupo" });
        }
        const connection = await getConnection();
        // inserta un nuevo grupo
        const sqlInsertUserGroup = `INSERT INTO miembros_grupo (user_id, group_id) VALUES('${userId}','${groupId}')`;
        await connection.query(sqlInsertUserGroup);
        return res.status(200).json({message: "Usuario agregado al grupo con exito"});
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

//eliminar postulacion
async function deletePostulacion (req, res) {
    try {
        const { userId, groupId } = req.body;
        console.log("usuario con id:", userId);
        console.log("grupo a unir:", groupId);
        if (userId === undefined || groupId === undefined) {
            return res.status(400).json({ message: "No se pudo eliminar el usuario de la postulacion del grupo" });
        }
        const connection = await getConnection();
        // elimina user de la postulacion del grupo
        const sqlDeletePostulacion = `DELETE FROM postulaciones_grupo WHERE user_id='${userId}' AND group_id='${groupId}'`;
        await connection.query(sqlDeletePostulacion);
        return res.status(200).json({message: "Usuario eliminado de la postulacion con exito"});
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const aceptarPostulante = async (req, res) => {
    const connection = await getConnection();
    await addUserGroup(req, res);
    await deletePostulacion(req, res);

};

const rechazarPostulante = async (req, res) => {
    const connection = await getConnection();
    await deletePostulacion(req, res);
};




const listPostulaciones = async (req, res) => {
    try {
        const {idUser } = req.params;
        console.log(idUser);
        if (idUser === undefined) {
            res.status(400).json({ message: "No se pudo obtener el user"});
        }
        const connection = await getConnection();
        const sqlListUsersPostulaciones = `SELECT * FROM postulaciones_grupo WHERE user_id = '${idUser}'`;
        const result = await connection.query(sqlListUsersPostulaciones);
        return res.status(200).json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const listPostulacionesPendientes = async (req, res) => {
    try {
        const {idUser } = req.params;
        console.log(idUser);
        if (idUser === undefined) {
            res.status(400).json({ message: "No se pudo obtener el user"});
        }
        const connection = await getConnection();
        const sqlListUsersPostulacionesPendientes = `SELECT * FROM grupos JOIN postulaciones_grupo ON grupos.idGrupo = postulaciones_grupo.group_id JOIN users ON users.iduser = postulaciones_grupo.user_id WHERE grupos.idUserCreador = '${idUser}'`;
        const result = await connection.query(sqlListUsersPostulacionesPendientes);
        return res.status(200).json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const listUsersGroup = async (req, res) => {
    try {
        const {groupId } = req.body;
        console.log(groupId);
        if (groupId === undefined) {
            res.status(400).json({ message: "No se pudo obtener el grupo"});
        }
        const connection = await getConnection();
        // usuarios pertenenciente a x grupo
        const sqlListUsersGroup = `SELECT users.name FROM users JOIN miembros_grupo ON users.iduser = miembros_grupo.user_id JOIN grupos ON grupos.idgrupo = miembros_grupo.group_id WHERE grupos.idgrupo = '${groupId}'`;
        const result = await connection.query(sqlListUsersGroup);
        return res.status(200).json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const gruposPorUser = async (req, res) => {
        const {id} = req.params;
        console.log('user id: ',id);
        if (id === undefined) {
            res.status(200).json({ message: "No se pudo obtener el usuario"});
        }
        const connection = await getConnection();
        const result = await connection.query(`SELECT grupos.idgrupo, grupos.nameGrupo, grupos.idUserCreador FROM grupos JOIN miembros_grupo ON grupos.idgrupo = miembros_grupo.group_id JOIN users ON users.iduser = miembros_grupo.user_id WHERE users.iduser = '${id}'`);
        console.log(result);
        return res.status(200).json(result);
};

const listGroupsBusqueda = async (req, res) => {
    const {nameGrupo} = req.params;
    console.log('name Grupo: ',nameGrupo);
    if (nameGrupo === undefined) {
        res.status(200).json({ message: "No se pudo obtener el grupo"});
    }
    const connection = await getConnection();
    const result = await connection.query(`SELECT * FROM grupos WHERE nameGrupo LIKE '${nameGrupo}%'`);
    console.log(result);
    return res.status(200).json(result);
};

const deleteUserGroup = async (req, res) => {
        try {
            const { userId, groupId } = req.body;
            console.log("usuario con id:", userId);
            console.log("grupo:", groupId);
            if (userId === undefined || groupId === undefined) {
                return res.status(400).json({ message: "No se pudo eliminar al usuario del grupo" });
            }
            const connection = await getConnection();
            // inserta un nuevo grupo = '${id}'`)
            const sqlDeleteUserGroup = `DELETE FROM miembros_grupo WHERE user_id='${userId}' AND group_id='${groupId}'`;
            await connection.query(sqlDeleteUserGroup);
            return res.status(200).json({message: "Usuario salió del grupo con exito"});
        } catch (error) {
            res.status(500);
            res.send(error.message);
        }
};

const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.body;
        console.log("grupo a eliminar:", groupId);
        if (groupId === undefined) {
            return res.status(400).json({ message: "No se pudo eliminar el grupo" });
        }
        const connection = await getConnection();
        // inserta un nuevo grupo = '${id}'`)
        const sqlDeleteGroup = `DELETE FROM grupos WHERE idgrupo='${groupId}'`;
        await connection.query(sqlDeleteGroup);
        return res.status(200).json({message: "Grupo eliminado con exito"});
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};



export const methods = {
    addGroup,
    addPostularGroup,
    addUserGroup,
    deletePostulacion,
    aceptarPostulante,
    rechazarPostulante,
    listUsersGroup,
    listPostulaciones,
    listPostulacionesPendientes,
    gruposPorUser,
    listGroupsBusqueda,
    deleteUserGroup,
    deleteGroup
};
