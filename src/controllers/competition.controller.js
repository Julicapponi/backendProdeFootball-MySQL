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
            return res.status(200).json({message: "Competencia activada con exito, ahora los usuarios podrán visualizarla", checkbox: true});
        } else {
            return res.status(200).json({ message: "Esta competicion ya está activa, cierre sesión y vuelva a intentarlo", checkbox: false});
        }
    } catch (error) {
        res.status(500).json(error.message);
    }
};

const deleteCompetition = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await getConnection();
        const result = await connection.query("DELETE FROM competitions WHERE idcompetition = ?", id);
        res.json({ message: "Competencia desactivada, los usuarios no podrán visualizarla"});
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
    
};

const getCompetitionsActivas = async (req, res) => {
    try {
        const connection = await getConnection();
        const result = await connection.query("SELECT idcompetition, name, anio FROM competitions");
        console.log(result);
        return res.status(200).json(result);
    } catch (error) {
        res.status(500);
        return res.send(error.message);
    }
};


export const methods = {
    getCompetitions,
    getCompetition,
    addCompetition,
    deleteCompetition,
    getCompetitionsActivas
    
};
