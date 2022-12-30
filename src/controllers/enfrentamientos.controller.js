import { getConnection } from "../database/database.js";
import fetch from "node-fetch";
import {methods as competitionController} from "./../controllers/competition.controller.js";
var enfrentamientos = [];
var enfrentamientosDeTodasLasCompActivas = [];

    // SE OBTIENEN ENFRENTAMIENTOS POR COMPETENCIA DIRECTOS DESDE LA API
    const getEnfrentamientosApi = async (req, res) => {
        const { id: id } = req.params;
        const { anio: anio } = req.params;
        console.log('Competencia seleccionada: ' +id + 'y el anio' + anio);
        const url = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?league='+id+'&season='+anio;
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
                'X-RapidAPI-Key': '71aabd654amsh246d1bc92892422p1dcdedjsnb909789c53e7'
            },
          };
          fetch(url, options).then((respuesta) => {
              return respuesta.json()
            }).then((data) => {
                res.json(data);
            }).catch((error)=> res.json({message:error}));
    }; 

    // SE OBTIENEN ENFRENTAMIENTOS POR COMPETENCIA DESDE LA BASE DE DATOS
    const getEnfrentamientosBD = async (req, res) => {
        try {
        const { id: id } = req.params;
        const { anio: anio } = req.params;
        console.log('Competencia seleccionada: ' +id + 'y el anio' + anio);
        const connection = await getConnection();
        const result = await connection.query("SELECT * FROM enfrentamientos WHERE idLiga = ?", id);
        res.status(200).json(result);
        } catch (error) {
            res.status(500);
            res.send(error.message);
        }
    }

     // SE OBTIENEN ENFRENTAMIENTOS PRONOSTICADOS POR COMPETENCIA POR USUARIO DESDE LA BASE DE DATOS
     const getEnfrentamientosBDPronosticados = async (req, res) => {
        try {
        const { idComp: idComp } = req.params;
        const { idUser: idUser } = req.params;
        console.log('Competencia seleccionada: ' +idComp + 'y el usuario' + idUser);
        const connection = await getConnection();
        const sqlSelectPronosticados = 'SELECT * FROM enfrentamientos JOIN pronosticos ON enfrentamientos.idEnfrentamiento = pronosticos.idEnfrentamiento where enfrentamientos.idLiga = '+idComp+' AND pronosticos.idUser = '+idUser;
        const result = await connection.query(sqlSelectPronosticados);
        res.status(200).json(result);
        } catch (error) {
            res.status(500);
            res.send(error.message);
        }
    }
    
        
    // SE GUARDAN LOS ENFRENTAMIENTOS DE LAS COMPETENCIAS ACTIVAS, PROCESO DE TAREA PROGRAMADA TODOS LOS DIAS
        const saveEnfrentamientosCompetenciasActivas = async (req, res) => {
            try {
                var compActivas  = [];
                enfrentamientosDeTodasLasCompActivas = [];
                const connection = await getConnection();
                let queryResult = await connection.query("SELECT idcompetition, name, anio FROM competitions");
                queryResult.forEach((element,i) => {
                    compActivas.push({id: element.idcompetition, anio: element.anio});
                });

                // SE OBTIENEN LOS ENFRENTAMIENTOS DE LAS COMPETENCIAS
                const enfrentamientos = await obtenerEnfrentamientos(compActivas);
                //console.log(enfrentamientos);

                 // SE ARMAN LOS ENFRENTAMIENTOS DE ACUERDO A LO QUE LLEGA DE LA API PARA LUEGO GUARDAR EN BD
                for (let index = 0; index < enfrentamientos.length; index++) {
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
                   // let partido = [idEnfrentamiento, fechaEnfrentamiento, short, idLiga, nameLiga, anioLiga, round, idLocal, nameLocal, logoLocal, ganaLocal, idVisit, nameVisit, logoVisit, ganaVisit, golLocal, golVisit, penalesLocal, penalesVisit, isModificado, isComparado];
                   let partido = [idEnfrentamiento, fechaEnfrentamiento, short, idLiga, nameLiga, anioLiga, round, idLocal, nameLocal, logoLocal, ganaLocal, idVisit, nameVisit, logoVisit, ganaVisit, golLocal, golVisit, penalesLocal, penalesVisit, isModificado, isComparado];
                    console.log('partido:', partido);
                    enfrentamientosDeTodasLasCompActivas.push(partido);                  
                });
            }

                // SE GUARDA EN BD TODOS LOS ENFRENTAMIENTOS
                guardaPartido(enfrentamientosDeTodasLasCompActivas, connection); 
                return res.status(200).json(resultGuardado);
            } catch (error) {
                res.status(500);
                res.send(error.message);
            }
        };
        
        function obtenerEnfrentamientos(compActivas){
            enfrentamientos = [];
            return new Promise((resolve, reject) => {
                compActivas.forEach(comp => {
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

        async function guardaPartido (enfrentamientosDeTodasLasCompActivas, connection) {
            console.log(enfrentamientosDeTodasLasCompActivas);
            var sql = "INSERT IGNORE INTO enfrentamientos (idEnfrentamiento, fechaEnfrentamiento, short, idLiga, nameLiga, anioLiga, round, idLocal, nameLocal, logoLocal, ganaLocal, idVisit, nameVisit, logoVisit, ganaVisit, golLocal, golVisit, penalesLocal, penalesVisit, isModificado, isComparado) VALUES ?";
            setTimeout(() => {
                  const resultado = connection.query(sql, [enfrentamientosDeTodasLasCompActivas], function(error, results){
                    if (error) {
                        return error;
                    } else {
                        console.log('RESULTADO DE GUARDADO DE ENFRENTAMIENTOS', results);
                        return results;
                    }
            }, 20000);
            return;
        });
        }   


        const addPronostico = async (req, res) => {
            try {
                const { golesLocal, golesVisit, idUser, idEnfrentamiento} = req.body;
                console.log('Se Pronostica el enfrentamiento con id: '+idEnfrentamiento+' el usuario con id: ', idUser);
                console.log('goles local: '+ golesLocal + ' goles visitante');
                if (idUser === undefined || idEnfrentamiento === undefined) {
                    res.status(400).json({ message: "Bad Request. Please fill all field." });
                }
                const connection = await getConnection();
                // inserta un nuevo pronostico
                const sqlInsertPronostico = `INSERT INTO pronosticos (golesLocalPronosticado, golesVisitPronosticado, idUser, idEnfrentamiento) VALUES ('${golesLocal}','${golesVisit}','${idUser}','${idEnfrentamiento}') ON DUPLICATE KEY UPDATE golesLocalPronosticado=VALUES(golesLocalPronosticado), golesVisitPronosticado=VALUES(golesVisitPronosticado)`;
                await connection.query(sqlInsertPronostico);
                res.status(200).json({cargoPronostico: true, message: "Pronostico agregado con exito"});
            } catch (error) {
                res.status(500).json({cargoPronostico: false, message: "No se pudo cargar el pronostico"});;
                res.send(error.message);
            }
        };

        async function partidoModificadoPorAdmin (connection) {
            var sql = "SELECT * FROM enfrentamientos";
           await connection.query(sql, function(error, results){
            if (error) throw error;
            console.log('Records inserted: ', results);
            let arrayEnfrentamientos = [];
            results.forEach((element, i) => {
                if(element.modificado != true){
                    arrayEnfrentamientos.push(element);
                }
            })
            return arrayEnfrentamientos;
           });
        }   
       
export const methods = {
    addPronostico,
    getEnfrentamientosApi,
    getEnfrentamientosBD,
    getEnfrentamientosBDPronosticados,
    saveEnfrentamientosCompetenciasActivas,

};
