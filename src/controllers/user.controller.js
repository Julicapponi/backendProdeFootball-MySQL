import { getConnection } from "../database/database.js";
import * as bcryptjs from 'bcryptjs';

const loginUsuario = async (req, res) => {
    try {
        const email = req.body.email;
        const pass = req.body.password;
        console.log(email, pass);
        const connection = await getConnection();
        if (email && pass) {
            const result = await connection.query("SELECT * FROM users WHERE email = ?", email);
            if(result.length == 0){
                console.log(result);
                res.status(200).json({message:"Usuario o password incorrectos"});
            } else {
                console.log(result);
                const user = result;
                res.status(200).json({user, message:"Usuario logueado con exito"});
            }
        }
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
  
};

const getUsuarios = async (req, res) => {
    try {
        const connection = await getConnection();
        const result = await connection.query("SELECT iduser, name, userName, email, password, admin FROM users");
        console.log(result);
        res.json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
  
};

const getUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await getConnection();
        const result = await connection.query("SELECT iduser, name, userName, email, password, admin FROM users WHERE iduser = ?", id);
        res.json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const addUsuario = async (req, res) => {
    try {
        const { name, userName, email, password, admin } = req.body;
        console.log( name, userName, email, password, admin);
        if (name === undefined || userName === undefined || email === undefined || password === undefined || admin === undefined) {
            res.status(400).json({ message: "Bad Request. Please fill all field." });
        }
        const connection = await getConnection();
        // inserta un nuevo usuario
        const sqlInsertUser = `INSERT INTO users ( name, username, email, password, admin) VALUES ('${name}','${userName}','${email}','${password}','${admin}')`;
        //valido si existe en bd el correo ingresado
        const resultExistUserInBD = await connection.query("SELECT * FROM users WHERE email = ?", email);
        if(resultExistUserInBD.length == 0){
            await connection.query(sqlInsertUser);
            res.status(200).json({message: "Usuario agregado con exito"});
        } else {
            res.status(200).json({ message: "Este correo electronico ya est?? registrado"});
        }
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, userName, email, password } = req.body;
        if (name === undefined || userName === undefined || email === undefined || password === undefined) {
            res.status(400).json({ message: "Bad Request. Please fill all field." });
        }
        console.log('Edita usuario', id, name, userName, email, password);
        const user = {name, userName, email, password};
        console.log('usuario', user);
        const connection = await getConnection();
        const result = await connection.query("UPDATE users SET ? WHERE iduser = ?",[user,id]);
        res.json({ message: "Usuario modificado con exito"});
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await getConnection();
        const result = await connection.query("DELETE FROM users WHERE iduser = ?", id);
        const sqlDeleteGroup = `DELETE FROM grupos WHERE idUserCreador='${id}'`;
        await connection.query(sqlDeleteGroup);
        res.json({ message: "Usuario eliminado con exito"});
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
    
};

export const methods = {
    getUsuarios,
    getUsuario,
    addUsuario,
    updateUsuario,
    deleteUsuario,
    loginUsuario
};
