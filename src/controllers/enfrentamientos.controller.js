import { getConnection } from "../database/database.js";
import fetch from "node-fetch";

const getEnfrentamientos = async (req, res) => {
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
          return respuesta.json()}).then((data) => res.json(data))
          .catch((error)=> res.json({message:error}));
    }; 

    const getEnfrentamientosCompetition = async (req, res) => {
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
    


export const methods = {
    getEnfrentamientos,
    getEnfrentamientosCompetition
};
