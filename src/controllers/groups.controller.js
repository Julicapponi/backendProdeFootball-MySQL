import { getConnection } from "../database/database.js";
import * as bcryptjs from 'bcryptjs';
import GrupoModel from "../models/Grupo.js"


const addGroup = async (req, res) => {
    try {
        const { nameGrupo, idUserGreaGrupo, idCompetencia } = req.body;
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
        const sqlInsertGroup = `INSERT INTO grupos (nameGrupo, idUserCreador, idCompetencia) VALUES('${nameGrupo}','${idUserGreaGrupo}','${idCompetencia}')`;
        await connection.query(sqlInsertGroup, async (error, resultGrupo) => {
            if (error) {
                throw error;
            } else {
                // Inserta el usuario que creó el grupo al grupo (accion default)
                const sqlListUsersGroup = `INSERT INTO miembros_grupo(user_id, group_id) values ('${idUserGreaGrupo}','${resultGrupo.insertId}');`;
                await connection.query(sqlListUsersGroup, (error, resp) => {
                    if (error) {
                        throw error;
                    } else {
                        res.status(200).json({ idGrupo: resultGrupo.insertId, idUserGreaGrupo: idUserGreaGrupo, message: "Usuario agregado al grupo", respuesta: resp });
                    }
                });
            }
        });
        res.status(200).json({ message: "Grupo agregado con exito" });
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
        return res.status(200).json({ message: "Usuario postulado al grupo con exito" });
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};


async function addUserGroup(req, res) {
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
        return res.status(200).json({ message: "Usuario agregado al grupo con exito" });
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

//eliminar postulacion
async function deletePostulacion(req, res) {
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
        return res.status(200).json({ message: "Usuario eliminado de la postulacion con exito" });
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
        const { idUser } = req.params;
        console.log(idUser);
        if (idUser === undefined) {
            res.status(400).json({ message: "No se pudo obtener el user" });
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
        const { idUser } = req.params;
        console.log(idUser);
        if (idUser === undefined) {
            res.status(400).json({ message: "No se pudo obtener el user" });
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
        const { idGrupo: idGrupo } = req.params;
        console.log(idGrupo);
        if (idGrupo === undefined) {
            res.status(400).json({ message: "No se pudo obtener el grupo" });
        }
        const connection = await getConnection();
        // usuarios pertenenciente a x grupo
        const sqlListUsersGroup = `SELECT users.* FROM users JOIN miembros_grupo ON users.iduser = miembros_grupo.user_id JOIN grupos ON grupos.idgrupo = miembros_grupo.group_id WHERE grupos.idgrupo = '${idGrupo}'`;
        const result = await connection.query(sqlListUsersGroup);
        return res.status(200).json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const gruposPorUser = async (req, res) => {
    const { id } = req.params;
    console.log('user id: ', id);
    if (id === undefined) {
        res.status(200).json({ message: "No se pudo obtener el usuario" });
    }
    const connection = await getConnection();
    const result = await connection.query(`SELECT grupos.idgrupo, grupos.nameGrupo, grupos.idUserCreador FROM grupos JOIN miembros_grupo ON grupos.idgrupo = miembros_grupo.group_id JOIN users ON users.iduser = miembros_grupo.user_id WHERE users.iduser = '${id}'`);
    console.log(result);
    return res.status(200).json(result);
};

const listGroupsBusqueda = async (req, res) => {
    const { nameGrupo, idUser } = req.params;
    console.log('name Grupo: ', nameGrupo);
    if (nameGrupo === undefined) {
        res.status(200).json({ message: "No se pudo obtener el grupo" });
    }

    // Se obtiene una conexión a la base de datos.
    const connection = await getConnection();

    // Se realiza una consulta a la tabla 'grupos' para buscar todos los grupos que coinciden con el nombre proporcionado.
    const resultGrupos = await connection.query(`SELECT * FROM grupos WHERE nameGrupo LIKE '%${nameGrupo}%'`);
    console.log(resultGrupos);

    // Se realiza una consulta a la tabla 'miembros_grupo' para buscar todos los grupos a los que pertenece el usuario.
    const resultMiembros = await connection.query(`SELECT group_id FROM miembros_grupo WHERE user_id = ${idUser}`);

    // Se crea un array con los 'idgrupo' de los grupos a los que pertenece el usuario.
    const gruposPertenecientes = resultMiembros.map(miembro => miembro.group_id);

    // Se filtran los grupos coincidentes para excluir aquellos a los que pertenece el usuario.
    const gruposSinMiembro = resultGrupos.filter(grupo => !gruposPertenecientes.includes(grupo.idgrupo));

    // Se devuelve la lista de grupos que no tienen al usuario como miembro.
    return res.status(200).json(gruposSinMiembro);
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
        return res.status(200).json({ message: "Usuario salió del grupo con exito" });
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};



const editGroup = async (req, res) => {
    try {
        const { groupId } = req.body;
        console.log("grupo a editar:", groupId);
        if (groupId === undefined) {
            return res.status(400).json({ message: "No se pudo eliminar el grupo" });
        }
        const connection = await getConnection();
        // inserta un nuevo grupo = '${id}'`)
        const sqlEditGroup = `UPDATE FROM grupos WHERE idgrupo='${groupId}'`;
        await connection.query(sqlDeleteGroup);
        return res.status(200).json({ message: "Grupo editado con exito" });
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
        return res.status(200).json({ message: "Grupo eliminado con exito" });
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const obtenerPuntajesGeneralPorUser = async (req, res) => {
    try {
        const { idGrupo: idGrupo } = req.params;

        const connection = await getConnection();

        const grupo = parseInt(idGrupo);
        //const puntajesGeneralPorUser = `SELECT users.iduser, users.name, COALESCE(SUM(CASE WHEN puntajes.fechaYHoraCalculado > grupos.fechaYHoraCreado THEN puntajes.puntosSumados ELSE 0 END), 0) AS puntos_acumulados FROM users LEFT JOIN miembros_grupo ON users.iduser = miembros_grupo.user_id LEFT JOIN grupos ON miembros_grupo.group_id = grupos.idgrupo LEFT JOIN puntajes ON users.iduser = puntajes.id_user WHERE grupos.idgrupo = '${idGrupo}' AND grupos.fechaYHoraCreado < puntajes.fechaYHoraCalculado GROUP BY users.iduser`;
        const puntajesGeneralPorUser = `SELECT users.iduser, users.name, COALESCE(SUM(CASE WHEN puntajes.fechaYHoraCalculado > grupos.fechaYHoraCreado AND puntajes.idComp = grupos.idCompetencia THEN puntajes.puntosSumados ELSE 0 END), 0) AS puntos_acumulados FROM users LEFT JOIN miembros_grupo ON users.iduser = miembros_grupo.user_id LEFT JOIN grupos ON miembros_grupo.group_id = grupos.idgrupo LEFT JOIN puntajes ON users.iduser = puntajes.id_user WHERE grupos.idgrupo = '${idGrupo}' AND grupos.fechaYHoraCreado < puntajes.fechaYHoraCalculado GROUP BY users.iduser ORDER BY puntos_acumulados DESC`;
        const result = await connection.query(puntajesGeneralPorUser);
        return res.status(200).json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};


const obtenerPuntajesPorFechaPorUser = async (req, res) => {
    try {
        const { idGrupo: idGrupo } = req.params;
        const connection = await getConnection();
        const grupo = parseInt(idGrupo);
        const puntajesTodasLasFechasPorUser = `SELECT puntajes.roundFecha AS fecha, users.iduser, users.name, 
        COALESCE(SUM(CASE WHEN puntajes.idComp = grupos.idCompetencia 
        THEN puntajes.puntosSumados ELSE 0 END), 0) AS puntos_acumulados
        FROM users 
        LEFT JOIN miembros_grupo ON users.iduser = miembros_grupo.user_id 
        LEFT JOIN grupos ON miembros_grupo.group_id = grupos.idgrupo 
        LEFT JOIN puntajes ON users.iduser = puntajes.id_user 
        WHERE grupos.idgrupo = '${idGrupo}' 
        GROUP BY puntajes.roundFecha, users.iduser 
        ORDER BY puntajes.roundFecha DESC, puntos_acumulados DESC`;
        const result = await connection.query(puntajesTodasLasFechasPorUser);
        return res.status(200).json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const obtenerReporteAciertos = async (req, res) => {
    try {
        const connection = await getConnection();
        /**
         * Esta query selecciona el id y el nombre de cada grupo, y calcula la cantidad de aciertos exactos, aciertos parciales y no aciertos de cada grupo 
         * en función de los pronósticos realizados por sus miembros. Luego, agrupa los resultados por grupo y los ordena por el id del grupo.
         * El primer join es entre la tabla "grupos" y "miembros_grupo" para obtener la lista de miembros que pertenecen a cada grupo.
         * El segundo join es entre la tabla "pronosticos" y "miembros_grupo" para obtener los pronósticos realizados por cada miembro en los grupos.
         * El tercer join es entre la tabla "puntajes" y "pronosticos" para obtener los puntos obtenidos por cada pronóstico realizado.
         */
        const obtenerReporte = `
        SELECT g.idgrupo, g.nameGrupo,
        SUM(CASE WHEN p.puntosSumados = 3 THEN 1 ELSE 0 END) AS aciertos_exactos,
        SUM(CASE WHEN p.puntosSumados = 1 THEN 1 ELSE 0 END) AS aciertos_parciales,
        SUM(CASE WHEN p.puntosSumados = 0 THEN 1 ELSE 0 END) AS no_aciertos
        FROM grupos g
        JOIN miembros_grupo mg ON g.idgrupo = mg.group_id
        JOIN pronosticos pr ON pr.idUser = mg.user_id AND pr.idLiga = g.IdCompetencia
        JOIN puntajes p ON p.id_pronostico = pr.idpronostico AND p.idComp = g.IdCompetencia
        GROUP BY g.idgrupo, g.nameGrupo
        ORDER BY g.idgrupo`;
        const result = await connection.query(obtenerReporte);
        return res.status(200).json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const obtenerCompetenciaPorGrupo = async (req, res) => {
    try {
        const connection = await getConnection();
        const idGrupo = req.params.idGrupo; // id del grupo que quieres buscar

        const query = `SELECT * FROM grupos g INNER JOIN competitions c ON g.idCompetencia = c.idcompetition WHERE g.idgrupo = ?`;
        const result = await connection.query(query, [idGrupo]);
        return res.status(200).json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const updateGrupo = async (req, res) => {
    try {
        const { id } = req.params;
        const { name} = req.body;
        if (name === undefined) {
            res.status(400).json({ message: "Error con el nombre del grupo" });
        }
        const connection = await getConnection();
        const queryEditGroup = `UPDATE grupos SET nameGrupo='${name}' WHERE idgrupo='${id}'`;
        const result = await connection.query(queryEditGroup);
        return res.status(200).json(result);
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
    deleteGroup,
    editGroup,
    obtenerPuntajesGeneralPorUser,
    obtenerPuntajesPorFechaPorUser,
    obtenerReporteAciertos,
    obtenerCompetenciaPorGrupo,
    updateGrupo
};
