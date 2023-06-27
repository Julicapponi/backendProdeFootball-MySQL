import { getConnection } from "../database/database.js";
import fetch from "node-fetch";
import CompModel from "../models/Competition.js";
import { methods as enfrentamientoController } from "./../controllers/enfrentamientos.controller.js";
//OBTENER TODAS LAS COMPETENCIAS DEL MUNDO
const getCompetitionsApi = async (req, res) => {
    const url = 'https://api-football-v1.p.rapidapi.com/v3/leagues';
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
            'X-RapidAPI-Key': '71aabd654amsh246d1bc92892422p1dcdedjsnb909789c53e7'
        },
    };
    fetch(url, options).then((respuesta) => {
        return respuesta.json()}).then((data) => res.json(data))
        .catch((error)=> res.json({message:error}));
    };   

// AGREGAR UNA COMPETENCIA
const addCompetition = async (req, res) => {
    try {
        const { idcompetition, name, anio } = req.body;
        const newComp = new CompModel(idcompetition, name, anio);   
        if (newComp.idcompetition === undefined || newComp.name === undefined || newComp.anio === undefined) {
            return res.status(400).json({ message: "Faltan datos", checkbox: false });
        } 
        
        const currentYear = new Date().getFullYear();
        /** Validación: Si no es anio actual, ni anterior ni posterior al actual --> error
        Esto sucede porque a la hora de buscar la competencia en la api se la busca por el anio
        y existen ligas que se desarrollan en 2 años. Ej: comienza agosto 2022 culmina agosto 2023 pero se la busca por 2022
        O puede que se busquen competencias del anio siguiente y aun no ha comenzado pero si estan cargadas.
         */
        if (!(currentYear === newComp.anio || currentYear - 1 === newComp.anio || currentYear + 1 === newComp.anio)) {
            return res.status(400).json({ message: `Error, puede que su liga no sea actual o reciente. Esta es una liga del año '${newComp.anio}'.`, checkbox: false});
        }
        const connection = await getConnection();
        //valido si existe en bd alguna competencia
        const resultExistCompetitionInBD = await connection.query("SELECT * FROM competitions WHERE idcompetition = ?", newComp.idcompetition);
    
        if(resultExistCompetitionInBD.length == 0){
            //Inserto competencia
            const sqlInsertCompetition = "INSERT INTO competitions SET ?";
            await connection.query(sqlInsertCompetition, newComp);
            //Cargo/guardo enfrentamientos de la competencia
            saveEnfrentamientosCompetenciaRecienDadaAlta(newComp.idcompetition, newComp.anio);
            setTimeout(() => {
                return res.status(200).json({message: "Competencia dada de alta con éxito, recuerdá activarla para que los usuarios la visualicen", checkbox: true});
            }, 6000)
            
        } else {
            return res.status(200).json({ message: "Esta competicion ya está dada de alta, cierre sesión y vuelva a intentarlo", checkbox: false});
        }
    } catch (error) {
        res.status(500).json(error.message);
    }
};

async function saveEnfrentamientosCompetenciaRecienDadaAlta(id, anio) {
    try {
        var compRecienActiva  = [];
        var competicion =[]
        if(anio===undefined || anio ===null){
            competicion = await obtenerCompetenciaDadaDeAltaPorId(id);
            anio = competicion.anio;
        }
        let enfrentamientosDeLaCompetenciaRecienActivada = [];
        const connection = await getConnection();
        compRecienActiva.push({id: id, anio: anio});
        //Obtengo enfrentamientos de la competencia desde la api
        let enfrentamientos = await obtenerEnfrentamientos(compRecienActiva);
         // SE ARMAN LOS ENFRENTAMIENTOS DE ACUERDO A LO QUE LLEGA DE LA API PARA LUEGO GUARDAR EN BD
        for (let index = 0; index < enfrentamientos.length; index++) {
        // Se arma cada enfrentamiento con datos necesarios unicamente.
        enfrentamientos[index].forEach((element, i) => {
            let idEnfrentamiento = element.fixture.id;
            let fechaEnfrentamiento = element.fixture.date;
            let short = element.fixture.status.long;
            let idLiga = element.league.id;
            let nameLiga = element.league.name;
            let anioLiga = element.league.season;
            let round = element.league.round;
            let idLocal = element.teams.home.id;
            let nameLocal = element.teams.home.name;
            let logoLocal = element.teams.home.logo;
            let ganaLocal = element.teams.home.winner;
            let idVisit = element.teams.away.id;
            let nameVisit = element.teams.away.name;
            let logoVisit = element.teams.away.logo;
            let ganaVisit = element.teams.away.winner;
            let golLocal = element.goals.home;                 
            let golVisit = element.goals.away;
            let penalesLocal = element.score.penalty.home;
            let penalesVisit = element.score.penalty.away;
            let isModificado = null;
            let isComparado = null;
            let partido = [idEnfrentamiento, fechaEnfrentamiento, short, idLiga, nameLiga, anioLiga, round, idLocal, nameLocal, logoLocal, ganaLocal, idVisit, nameVisit, logoVisit, ganaVisit, golLocal, golVisit, penalesLocal, penalesVisit, isModificado, isComparado];
            console.log('partido:', partido);
            // Agrego cada partido a una lista
            enfrentamientosDeLaCompetenciaRecienActivada.push(partido);                  
        });
    }
        // Guarda los enfrentamientos en bd
        let resultado = guardaPartido(enfrentamientosDeLaCompetenciaRecienActivada, connection); 
        if(resultado == true){
            return res.status(200).json({message: "Competencia dada de alta con éxito.", checkbox: true});
        } else {
            return res.status(400).json({message: "Ocurrió un error al intentar guardar los enfrentamientos de la competencia", checkbox: false});
        }
      
    } catch (error) {
        return error;
    }
};

function obtenerEnfrentamientos(compRecienActiva){
    let enfrentamientos = [];
    return new Promise((resolve, reject) => {
        compRecienActiva.forEach(comp => {
            if(comp.id != undefined || comp.id || null){  
                const url = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?league='+comp.id+'&season='+comp.anio;
                    const options = {
                        method: 'GET',
                        headers: {
                            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
                            'X-RapidAPI-Key': '71aabd654amsh246d1bc92892422p1dcdedjsnb909789c53e7'
                        },
                    };
                    fetch(url, options).then((respuesta) => {
                        return respuesta.json()}).then((data) => {
                            if(!data.response.length == 0){
                                enfrentamientos.push(data.response);  
                            }
                        }).catch((error)=> res.json({message:error}));
                };        
        });
        setTimeout(() => {
        resolve(enfrentamientos);
        }, 3000)
  })};

  //Inserto la lista de enfrentamientos
async function guardaPartido (enfrentamientosDeLaCompetenciaRecienActivada, connection) {
    console.log(enfrentamientosDeLaCompetenciaRecienActivada);
    var sql = "INSERT INTO enfrentamientos (idEnfrentamiento, fechaEnfrentamiento, short, idLiga, nameLiga, anioLiga, round, idLocal, nameLocal, logoLocal, ganaLocal, idVisit, nameVisit, logoVisit, ganaVisit, golLocal, golVisit, penalesLocal, penalesVisit, isModificado, isComparado) VALUES ?";
    setTimeout(() => {
          const resultado = connection.query(sql, [enfrentamientosDeLaCompetenciaRecienActivada], function(error, results){
            if (error) {
                return error;
            } else {
                console.log('RESULTADO DE GUARDADO DE ENFRENTAMIENTOS DE LA COMP RECIEN ACTIVADA', results);
                return true;
            }
    }, 10000);
});
}   

//DESACTIVAR ESTADO COMPETENCIA
const deleteCompetition = async (req, res) => {
    try {
        const { idcompetition} = req.params;
        const competition = new CompModel(idcompetition);
        const connection = await getConnection();
        const deleteCompetitionResult = await connection.query("DELETE FROM competitions WHERE idcompetition = ?", competition.idcompetition);
        //Borro los enfrentamientos de la competencia si elimino exitosamente la competencia.
        if (deleteCompetitionResult.affectedRows === 1) {
            const deleteEnfrentamientos = await connection.query("DELETE FROM enfrentamientos WHERE idLiga = ?", competition.idcompetition);
            res.status(200).json({ message: "Competencia dada de baja."});
          } else {
            res.status(400).json({ message: "No se encontró la competencia a eliminar." });
        }
    } catch (error) {
        res.status(400);
        res.send(error.message);
    }
};

//ACTUALIZAR NOMBRE COMPETENCIA
const updateCompetition = async (req, res) => {
    try {
        const { idcompetition, name, anio, activa } = req.body;
        const comp = new CompModel(idcompetition, name, anio, activa);   

        if (comp.name === undefined ) {
            return res.status(400).json({ message: "Hubo un error, cierre sesión y modifique su competencia nuevamente"});
        } 
        const connection = await getConnection();
        const result = await connection.query("UPDATE competitions SET ? WHERE idcompetition = ?",[comp,idcompetition]);
        if (result.affectedRows === 1) {
            res.status(200).json({ message: "Nombre de competencia modificada con exito"});
          } else {
            res.status(400).json({ message: "Hubo un error con la modificación de la competencia" });
        }
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

//OBTENER COMPETENCIAS DADAS DE ALTA
const getCompetitionsAltasBD = async (req, res) => {
    try {
        const connection = await getConnection();
        const resultListComp = await connection.query("SELECT * FROM competitions");
        const competitions = resultListComp.map(comp => new CompModel(comp.idcompetition, comp.name, comp.anio, comp.activa));
        return res.status(200).json(competitions);

    } catch (error) {
        res.status(400);
        console.log(error.message);
        return res.send(error.message);
    }
};

//OBTENER COMPETENCIAS ACTIVAS
const getCompetitionsActivas = async (req, res) => {
    try {
        const connection = await getConnection();
        const resultListComp = await connection.query("SELECT * FROM competitions WHERE activa='1'");
        return res.status(200).json(resultListComp);
    } catch (error) {
        res.status(400);
        console.log(error.message);
        return res.send(error.message);
    }
};

//ACTUALIZAR NOMBRE COMPETENCIA
const estadoCompetition = async (req, res) => {
    try {
        const { id } = req.params;
        const { activa } = req.body;
        const connection = await getConnection();
        const result = await connection.query("UPDATE competitions SET activa = ? WHERE idcompetition = ?", [activa, id]);
        if (result.affectedRows === 1) {
            if(activa === 1){
                await saveEnfrentamientosCompetenciaRecienDadaAlta(id);
            } else {
                await enfrentamientoController.borrarEnfrentamientosPorLiga(id);
                
            }
            res.status(200).json({ message: "Estado de competencia actualizado con éxito" });
        } else {
            res.status(400).json({ message: "Hubo un error con la modificación de la competencia" });
        }
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

function obtenerCompetenciaDadaDeAltaPorId(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const connection = await getConnection();
        let idLiga = Number(id);
        const competenciaResult = await connection.query("SELECT * FROM competitions WHERE idcompetition = ?", idLiga);
        resolve(competenciaResult[0]);
      } catch (error) {
        reject(error);
      }
    });
  }


export const methods = {
    getCompetitionsApi,
    getCompetitionsAltasBD,
    getCompetitionsActivas,
    addCompetition,
    deleteCompetition,
    updateCompetition,
    estadoCompetition
};
