import { getConnection } from "../database/database.js";
import fetch from "node-fetch";


const getCompetitions = async (req, res) => {
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

const getCompetition = async (req, res) => {

};

const addCompetition = async (req, res) => {
    try {
        const {id, name, anio} = req.body;
        console.log(id, name, anio);
        if (id === undefined || name === undefined || anio === undefined) {
            res.status(400).json({ message: "Faltan datos" });
        }
        const connection = await getConnection();
        const sqlInsertUser = `INSERT INTO competitions ( idcompetition, name, anio) VALUES ('${id}','${name}','${anio}')`;
        //valido si existe en bd el correo ingresado
        const resultExistCompetitionInBD = await connection.query("SELECT * FROM competitions WHERE idcompetition = ?", id);
        if(resultExistCompetitionInBD.length == 0){
            await connection.query(sqlInsertUser);
            saveEnfrentamientosCompetenciaRecienActivada(id, anio);
            setTimeout(() => {
                return res.status(200).json({message: "Competencia activada con exito, ahora los usuarios podrán visualizarla", checkbox: true});
            }, 8000)
            
        } else {
            return res.status(200).json({ message: "Esta competicion ya está activa, cierre sesión y vuelva a intentarlo", checkbox: false});
        }
    } catch (error) {
        res.status(500).json(error.message);
    }
};

async function saveEnfrentamientosCompetenciaRecienActivada(id, anio) {
    try {
        var compRecienActiva  = [];
        let enfrentamientosDeLaCompetenciaRecienActivada = [];
        const connection = await getConnection();
        compRecienActiva.push({id: id, anio: anio});
        let enfrentamientos = await obtenerEnfrentamientos(compRecienActiva);
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
            enfrentamientosDeLaCompetenciaRecienActivada.push(partido);                  
        });
    }
        // SE GUARDA EN BD TODOS LOS ENFRENTAMIENTOS DE LA COMPETENCIA RECIEN ACTIVADA
        let resultado = guardaPartido(enfrentamientosDeLaCompetenciaRecienActivada, connection); 
        if(resultado == true){
            return res.status(200).json({message: "Competencia activada con exito, ahora los usuarios podrán visualizarla", checkbox: true});
        } else {

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



































const deleteCompetition = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await getConnection();
        const deleteCompetition = await connection.query("DELETE FROM competitions WHERE idcompetition = ?", id);
        const deleteEnfrentamientos = await connection.query("DELETE FROM enfrentamientos WHERE idLiga = ?", id);
        res.status(200).json({ message: "Competencia desactivada, los usuarios no podrán visualizarla"});
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};


const updateCompetition = async (req, res) => {
    try {
        const { id } = req.params;
        const {idcompetition, name, anio} = req.body;
        if (name === undefined) {
            res.status(400).json({ message: "Bad Request. Please fill all field." });
        }
        const competicion = {idcompetition, name, anio};
        const connection = await getConnection();
        const result = await connection.query("UPDATE competitions SET ? WHERE idcompetition = ?",[competicion,idcompetition]);
        res.json({ message: "Nombre de competencia modificada con exito"});
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const getCompetitionsActivas = async (req, res) => {
    try {
        console.log('entro a competencias activas');
        const connection = await getConnection();
        console.log('paso la conexion');
        let result;
        try{
            [result] = await connection.query("SELECT idcompetition, name, anio FROM competitions");
        } catch (error) {
            console.log(error.message);
            console.log(result);
        }
        console.log(result);
        connection.end();
        return res.status(200).json(result);
    } catch (error) {
        res.status(500);
        console.log(error.message);
        return res.send(error.message);
    }
};





export const methods = {
    getCompetitions,
    getCompetition,
    addCompetition,
    deleteCompetition,
    getCompetitionsActivas,
    updateCompetition
};
