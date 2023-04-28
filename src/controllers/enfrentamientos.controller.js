import { getConnection } from "../database/database.js";
import fetch from "node-fetch";

var enfrentamientos = [];
var enfrentamientosDeTodasLasCompActivas = [];
var enfrentamientosDeLaComp = [];
    const calcularPuntajes = async (req, res) => {
      const now = new Date();
        try {
            var compActivas  = [];
            var partidosRespuestaOk = [];
            var listIdsDePartidosApiCulminados = [];
            var partidosApiCulminados = [];
            enfrentamientosDeTodasLasCompActivas = [];
            const connection = await getConnection();
            let queryResult = await connection.query("SELECT idcompetition, name, anio FROM competitions");
            queryResult.forEach((element,i) => {
                compActivas.push({id: element.idcompetition, anio: element.anio});
            });
            //Se obtienen enfrentamientos de los partidos disputados del dia de hoy y anterior
            const enfrentamientos = await getEnfrentamientosApiPorDiaDeHoy(compActivas);


            for (let index = 0; index < enfrentamientos.length; index++) {
                enfrentamientos[index].forEach((part, i) => {
                  //si el partido esta finalizado los sumo al array de partidos finalizados
                if(part.fixture.status.long === 'Match Finished'){
                    partidosApiCulminados.push(part);
                    listIdsDePartidosApiCulminados.push(part.fixture.id);
                }
                });
            }

            // Si no hay partidos culminados a la hora de ejecutar la tarea programada no se realiza nada, se esperaría a la siguiente tarea programada si algún partido culminó.
            if(partidosApiCulminados.length != 0){
                const pronosticosDePartidosCulminadosDeHoy =  await obtenerPronosticosPorId(listIdsDePartidosApiCulminados);
                for (let i = 0; i < partidosApiCulminados.length; i++) {
                    const partidoApi = partidosApiCulminados[i];
                    for (let j = 0; j < pronosticosDePartidosCulminadosDeHoy.length; j++) {
                        const partidoPronosticado = pronosticosDePartidosCulminadosDeHoy[j];
                        if(partidoPronosticado.idEnfrentamiento === partidoApi.fixture.id && partidoPronosticado.isCalculoResultado === 0){
                            partidosRespuestaOk.push(partidoPronosticado);
                            var puntos = 0;
                            if(partidoPronosticado.golesLocalPronosticado === partidoApi.goals.home && partidoPronosticado.golesVisitPronosticado === partidoApi.goals.away){
                                //GANA 3 PUNTOS
                                puntos = 3;
                              } else if(partidoPronosticado.golesLocalPronosticado > partidoPronosticado.golesVisitPronosticado && partidoApi.goals.home > partidoApi.goals.away){
                                puntos = 1;
                                //GANA 1 PUNTO
                              } else if(partidoPronosticado.golesVisitPronosticado > partidoPronosticado.golesLocalPronosticado &&  partidoApi.goals.away > partidoApi.goals.home) {
                                //GANA 1 PUNTO
                                puntos = 1;
                              } else if(partidoPronosticado.golesLocalPronosticado !== partidoApi.goals.home && partidoPronosticado.golesVisitPronosticado !== partidoApi.goals.away && partidoApi.goals.home === partidoApi.goals.away && partidoPronosticado.golesLocalPronosticado === partidoPronosticado.golesVisitPronosticado){
                                //GANA 1 PUNTO
                                puntos = 1;
                              } else {
                                puntos = 0;
                                //GANA 0 PUNTO
                              }
                                const connection = await getConnection();  
                                
                                    //INSERTA PUNTAJES PARA EL PRONOSTICO DEL USUARIO DADO EN LA TABLA PUNTAJES
                                    try {
                                        const sqlInsertPuntaje = `INSERT INTO puntajes (id_user, id_pronostico, puntosSumados, idEnfrentamiento, idComp, roundFecha) VALUES ('${partidoPronosticado.idUser}','${partidoPronosticado.idpronostico}','${puntos}','${partidoPronosticado.idEnfrentamiento}','${partidoApi.league.id}','${partidoApi.league.round}')`;
                                        const resultInsertPuntaje = await new Promise((resolve, reject) => {
                                        connection.query(sqlInsertPuntaje, (err, result) => {
                                            if (err) {
                                            console.error('Error al ejecutar la consulta: ', err);
                                            reject(err);
                                            } else {
                                            console.log('Puntaje calculado con exito para el partido: '+ partidoPronosticado.idEnfrentamiento+' pronosticado por el usuario: '+partidoPronosticado.idUser+'. Este es el resultado: ', result);
                                            resolve(result);
                                            }
                                        });
                                        });
                                        
                                        // SI LA ANTERIOR INSERCION DE PUNTAJES FUE OK, SETEA 1 EN EL PRONOSTICO QUE FUE CALCULADO (isCalculoResultado = 1)
                                        if(resultInsertPuntaje){
                                            try {
                                                const resultInsertCalculadoEnPronostico = await new Promise((resolve, reject) => {
                                                    const sqlInsertCalculadoEnPronostico = `UPDATE pronosticos SET isCalculoResultado = 1 WHERE idUser = ${partidoPronosticado.idUser} AND idEnfrentamiento = ${partidoPronosticado.idEnfrentamiento}`;
                                                    connection.query(sqlInsertCalculadoEnPronostico, (err, result) => {
                                                        if (err) {
                                                            console.error('Error al ejecutar la consulta: ', err);
                                                            reject(err);
                                                        } else {
                                                            console.log('Parametro agregado isCalculoResultado a la tabla pronosticos con exito: ', result);
                                                            resolve(result);
                                                        }
                                                  });
                                                });
                                                console.log(resultInsertCalculadoEnPronostico);
                                              } catch (err) {
                                                console.error(err);
                                              }
                                        }      
                                        console.log(resultInsertPuntaje);
                                    } catch (err) {
                                        console.error(err);
                                    }

                                            
                        }
                    }
                }
                if(partidosRespuestaOk!=null && partidosRespuestaOk.length != 0){
                  console.log("/////// Termino exitosamente la sincro de calculo de puntajes ////////");
                  console.log("/////// HUBO calculo de puntajes ////////");
                  console.log(partidosRespuestaOk);
                  return res.status(200).json({partidosCalculados: partidosRespuestaOk, message: "Termino exitosamente la sincro de calculo de puntajes"});
                } else {
                  console.log("/////// Termino exitosamente la sincro de calculo de puntajes ////////");
                  console.log("/////// NO HUBO calculo de puntajes hasta el momento, se espera proxima tarea programada. ////////");
                  return res.status(200).json({message: "No hubo calculo de puntajes hasta el momento, se espera proxima tarea programada."});
                }

            } 
            return res.status(200).json({message: "No hubo calculo de puntajes hasta el momento, se espera proxima tarea programada."});
        }catch (error) {
            res.status(500).json({message: error.message});
        }
    };


     // SE OBTIENEN ENFRENTAMIENTOS POR COMPETENCIA DIRECTOS DESDE LA API
     async function getEnfrentamientosApiPorDiaDeHoy(compActivas) {
        const now = new Date();
        const timeZoneOffset = -3 * 60; // offset en minutos para GMT-3
        const date = new Date(now.getTime() + timeZoneOffset * 60 * 1000).toISOString().split('T')[0];
        console.log('Calcula puntajes para pronosticos del dia de hoy: ', now); // Por ejemplo: "2023-03-05"
        const enfrentamientos = [];
    
      
        try {
          for (const comp of compActivas) {
            if (comp.id) {
                let url, fechaConsulta;
              //  if (now.getHours() < 5) {
                  // Si la hora actual está entre las 00:00 y las 03:00, obtiene los enfrentamientos del día anterior y el actual
                  const fechaAnterior = new Date(now.getTime() + timeZoneOffset * 60 * 1000 - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?league=${comp.id}&season=${comp.anio}&from=${fechaAnterior}&to=${date}`;
                /*} else {
                  // Si la hora actual es posterior a las 03:00, solo obtiene los enfrentamientos del día actual
                  fechaConsulta = date;
                  url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?league=${comp.id}&season=${comp.anio}&date=${fechaConsulta}`;
                }*/
              const options = {
                method: 'GET',
                headers: {
                  'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
                  'X-RapidAPI-Key': '71aabd654amsh246d1bc92892422p1dcdedjsnb909789c53e7'
                }
              };
              const respuesta = await fetch(url, options);
              const data = await respuesta.json();
      
              if (data.response.length !== 0) {
                enfrentamientos.push(data.response);
              }
            }
          }
      
          return enfrentamientos;
        } catch (error) {
          throw new Error(error.message);
        }
      }
        

        async function obtenerPronosticosPorId(listIdsDePartidosApiCulminados){
            // Consulta SQL
            return new Promise(async resolve => {
                const connection = await getConnection();
                const sql = `SELECT * FROM pronosticos WHERE idEnfrentamiento IN (?)`;
                // Ejecutar la consulta con los IDs como parámetros
                connection.query(sql, [listIdsDePartidosApiCulminados], async (err, results) => {
                    if (err) {
                        console.error(err);
                    }
                    resolve (results);
                });
            });
        }


        const getPositionTablePorComp = async (req, res) => {
            const { idComp: idComp } = req.params;
            const { anio: anio } = req.params;
            if(idComp !=null || idComp != undefined && anio !=null || anio != undefined){
                const url = 'https://api-football-v1.p.rapidapi.com/v3/standings?season='+anio+'&league='+idComp;
                const options = {
                  method: 'GET',
                  headers: {
                    'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
                    'X-RapidAPI-Key': '71aabd654amsh246d1bc92892422p1dcdedjsnb909789c53e7'
                  }
                };
                
                fetch(url, options).then((respuesta) => {
                    return respuesta.json()}).then((data) => {
                        if(!data.response.length == 0){
                            if(data.response[0].league.standings.length === 1){
                                res.status(200).json(data.response[0].league.standings[0]);
                            } else {
                                res.status(200).json(data.response[0].league.standings);
                            }
                        
                        }
                    }).catch((error)=> res.json({message:error}));
            } else {
                res.status(400).json({message:'liga null'});
            }
                      
              
        };


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
    
       // SE GUARDAN LOS ENFRENTAMIENTOS DE X COMPETENCIA EN ESPECIFICO
async function saveEnfrentamientosCompetencia(idCompetencia){
  try {
    enfrentamientosDeLaComp = [];
    const connection = await getConnection();

    // SE OBTIENEN LOS ENFRENTAMIENTOS DESDE LA API 
    const enfrentamientos = await obtenerEnfrentamientos(idCompetencia);

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
        let partido = [
          idEnfrentamiento,
          fechaEnfrentamiento,
          short,
          idLiga,
          nameLiga,
          anioLiga,
          round,
          idLocal,
          nameLocal,
          logoLocal,
          ganaLocal,
          idVisit,
          nameVisit,
          logoVisit,
          ganaVisit,
          golLocal,
          golVisit,
          penalesLocal,
          penalesVisit,
          isModificado,
          isComparado,
        ];
        console.log("partido:", partido);
        enfrentamientosDeLaComp.push(partido);
      });
    }

    // SE GUARDA EN BD TODOS LOS ENFRENTAMIENTOS
    await guardaPartido(enfrentamientosDeLaComp, connection);
    return Promise.resolve("Operación exitosa");
  } catch (error) {
    console.error(error);
    return Promise.reject(error.message);
  }
};
        
    // SE GUARDAN LOS ENFRENTAMIENTOS DE LAS COMPETENCIAS ACTIVAS, PROCESO DE TAREA PROGRAMADA TODOS LOS DIAS
const saveEnfrentamientosCompetenciasActivas = async (req, res) => {
    try {
      var compActivas = [];
      enfrentamientosDeTodasLasCompActivas = [];
      const connection = await getConnection();
      let queryResult = await connection.query(
        "SELECT idcompetition, name, anio FROM competitions"
      );
      queryResult.forEach((element, i) => {
        compActivas.push({ id: element.idcompetition, anio: element.anio });
      });
  
      // SE OBTIENEN LOS ENFRENTAMIENTOS DESDE LA API DE LAS COMPETENCIAS ACTIVAS
      const enfrentamientos = await obtenerEnfrentamientos(compActivas);
      console.log(enfrentamientos);
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
          let partido = [
            idEnfrentamiento,
            fechaEnfrentamiento,
            short,
            idLiga,
            nameLiga,
            anioLiga,
            round,
            idLocal,
            nameLocal,
            logoLocal,
            ganaLocal,
            idVisit,
            nameVisit,
            logoVisit,
            ganaVisit,
            golLocal,
            golVisit,
            penalesLocal,
            penalesVisit,
            isModificado,
            isComparado,
          ];
          console.log("partido:", partido);
          enfrentamientosDeTodasLasCompActivas.push(partido);
        });
      }
  
      // SE GUARDA EN BD TODOS LOS ENFRENTAMIENTOS
      await guardaPartido(enfrentamientosDeTodasLasCompActivas, connection);
      return res.sendStatus(200);
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
  };


  
  async function obtenerEnfrentamientos(compActivas) {
    const enfrentamientos = [];
    const urlBase = 'https://api-football-v1.p.rapidapi.com/v3/fixtures';
    const headers = {
      'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
      'X-RapidAPI-Key': '71aabd654amsh246d1bc92892422p1dcdedjsnb909789c53e7'
    };
    
    if (Array.isArray(compActivas)) {
      const promesas = compActivas.map(comp => {
        if (comp.id) {
          const url = `${urlBase}?league=${comp.id}&season=${comp.anio}`;
          const options = { method: 'GET', headers };

          return fetch(url, options)
            .then(respuesta => respuesta.json())
            .then(data => {
              if (data.response.length) {
                enfrentamientos.push(data.response);
              }
            })
            .catch(error => console.error(error));
        }
      });

      await Promise.all(promesas); // Esperar a que todas las promesas se resuelvan
      return enfrentamientos;
      } else if (typeof compActivas === 'string') {
        return new Promise((resolve, reject) => {
          const fechaActual = new Date();
          const anioActual = fechaActual.getFullYear();
          const enfrentamientos = [];
      
          if (compActivas) {
            const url = `${urlBase}?league=${compActivas}&season=${anioActual}`;
            const options = { method: 'GET', headers };
      
            fetch(url, options)
              .then(respuesta => respuesta.json())
              .then(data => {
                if (data.response.length) {
                  enfrentamientos.push(data.response);
                }
                resolve(enfrentamientos);
              })
              .catch(error => reject(error));
          } else {
            resolve(enfrentamientos);
          }
        });
      } else {
        // compActivas no es ni un array ni un string
      }
  }

  async function guardaPartido (enfrentamientosDeTodasLasCompActivas, connection) {
    console.log(enfrentamientosDeTodasLasCompActivas);

    const sql = "REPLACE INTO enfrentamientos (idEnfrentamiento, fechaEnfrentamiento, short, idLiga, nameLiga, anioLiga, round, idLocal, nameLocal, logoLocal, ganaLocal, idVisit, nameVisit, logoVisit, ganaVisit, golLocal, golVisit, penalesLocal, penalesVisit, isModificado, isComparado) VALUES ?";
    
    try {
        if(enfrentamientosDeTodasLasCompActivas.length!=0){
          const resultado = await connection.query(sql, [enfrentamientosDeTodasLasCompActivas]);
          console.log('RESULTADO DE GUARDADO DE ENFRENTAMIENTOS', resultado);
          return resultado;
        }
    return;
    } catch (error) {
        console.log('ERROR EN GUARDADO DE ENFRENTAMIENTOS', error);
        throw error;
    }
}


        const addPronostico = async (req, res) => {
            try {
                const { golesLocal, golesVisit, idUser, idEnfrentamiento, idLiga} = req.body;
                console.log('Se Pronostica el enfrentamiento con id: '+idEnfrentamiento+' el usuario con id: ', idUser);
                console.log('goles local: '+ golesLocal + ' goles visitante');
                if (idUser === undefined || golesLocal === undefined || golesVisit === undefined || idEnfrentamiento === undefined || idLiga === undefined) {
                    res.status(400).json({ message: "No se pudo crear el pronostico, cierra sesion y reintenta"});
                    res.send("No se pudo crear el pronostico, cierra sesion y reintenta");
                }
                const connection = await getConnection();
                // inserta un nuevo pronostico
                const sqlInsertPronostico = `INSERT INTO pronosticos (golesLocalPronosticado, golesVisitPronosticado, idUser, idLiga, idEnfrentamiento, idCompetencia) VALUES ('${golesLocal}','${golesVisit}','${idUser}','${idLiga}','${idEnfrentamiento}','${idLiga}') ON DUPLICATE KEY UPDATE golesLocalPronosticado=VALUES(golesLocalPronosticado), golesVisitPronosticado=VALUES(golesVisitPronosticado)`;
                await connection.query(sqlInsertPronostico);
                res.status(200).json({cargoPronostico: true, message: "Pronostico agregado con exito"});
            } catch (error) {
                res.status(500).json({cargoPronostico: false, message: "No se pudo cargar el pronostico"});;
                res.send(error.message);
            }
        };
        
        const editEnfrentamiento = async (req, res) => {
            try {
                const {id, nameLocal, nameVisit, golLocal, golVisit, isModificado} = req.body;
                console.log("Enfrentamiento a editar:", id);
                if (id === undefined) {
                    return res.status(400).json({ message: "No se pudo editar el enfrentamiento" });
                }
                const connection = await getConnection();
                connection.query(
                    "UPDATE enfrentamientos SET nameLocal = ?, nameVisit = ?, golLocal = ?, golVisit = ?, isModificado = true WHERE idEnfrentamiento = ?",
                    [nameLocal, nameVisit, golLocal, golVisit, isModificado, id],
                    function (error, results, fields) {
                      if(error){
                        res.status(400).json({message: error});
                      } else {
                        res.status(200).json({message: "Enfrentamiento editado con exito"});
                      }
                    }
                  );
            } catch (error) {
                res.status(500);
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

        async function borrarEnfrentamientosPorLiga(idComp){
          try {
            const connection = await getConnection();
            const deleteEnfrentamientos = await connection.query("DELETE FROM enfrentamientos WHERE idLiga = ?", idComp);
            return deleteEnfrentamientos;
            } catch (error) {
                return error;
            }
      }  
export const methods = {
    addPronostico,
    getEnfrentamientosApi,
    getEnfrentamientosBD,
    getEnfrentamientosBDPronosticados,
    saveEnfrentamientosCompetenciasActivas,
    editEnfrentamiento,
    calcularPuntajes,
    getPositionTablePorComp,
    saveEnfrentamientosCompetencia,
    borrarEnfrentamientosPorLiga

};
