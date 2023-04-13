import { getConnection } from "../database/database.js";
import * as bcryptjs from 'bcryptjs';
import nodemailer from 'nodemailer';
import UserModel from "../models/User.js"

const loginUsuario = async (req, res) => {

    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).send('El nombre de usuario y la contraseña son obligatorios');
    }
  
    // Agregar validaciones
    /*
    if (username.length < 4 || username.length > 20) {
      return res.status(400).send('El nombre de usuario debe tener entre 4 y 20 caracteres');
    }
  
    if (!password.match(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{5,}$/)) {
        return res.status(400).send('La contraseña debe tener al menos 5 caracteres, una letra mayúscula y un número');
      }
  */
    try {
      const connection = await getConnection();
      const results = await connection.query('SELECT * FROM users WHERE BINARY userName = ? AND BINARY password = ?', [username, password]);
      if (results.length === 1) {
        const user =results[0];
        res.status(200).send({user, message:"Usuario logueado con exito"});
      } else {
        res.status(401).send({message:'Nombre de usuario o contraseña incorrectos'});
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error del servidor al procesar la solicitud');
    }
}


const getUsuarios = async (req, res) => {
    try {
        const connection = await getConnection();
        const result = await connection.query("SELECT iduser, name, userName, email, password, admin FROM users");
        const usuarios = result.map(row => new UserModel(row.iduser, row.name, row.userName, row.email, row.password, row.admin));
        console.log(usuarios);
        res.json(usuarios);
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
        const { name, username, email, password, confirmPassword, admin } = req.body;
        console.log( name, username, email, password, admin);

        if (!name || !username || !email || !password || admin === undefined) {
            res.status(400).json({ message: "Bad Request. Please fill all fields." });
            return;
        }
        const nameRegex = /^.{2,20}$/;
        if (!nameRegex.test(username)) {
            res.status(400).json({ message: "Nombre con caracteres inferiores a 2 o mayor a 20, corrijalo" });
            return;
        }

        // Validar el nombre de usuario
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        if (!usernameRegex.test(username)) {
            res.status(400).json({ message: "Nombre de usuario inválido. Debe tener entre 3 y 20 caracteres y solo puede contener letras, números, guiones y guiones bajos." });
            return;
        }

        // Validar el correo electrónico
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!emailRegex.test(email)) {
            res.status(400).json({ message: "Correo electrónico inválido. Por favor, ingrese una dirección de correo electrónico válida." });
            return;
        }

        // Validar la contraseña
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        if (!passwordRegex.test(password)) {
            res.status(400).json({ message: "Contraseña inválida. Debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula y un número." });
            return;
        }

        if(password != confirmPassword){
            res.status(400).json({ message: "Las contraseñas no son iguales, salga y vuelva a reintentar" });
            return;
        }


        const connection = await getConnection();

        // Verificar si el email o el username ya existen en la base de datos
        const sqlCheckUser = `SELECT * FROM users WHERE email = ? OR username = ?`;
        const [resultExistUserInBD] = await connection.query(sqlCheckUser, [email, username]);

        if (resultExistUserInBD.length > 0) {
            if (resultExistUserInBD[0].username === username) {
                res.status(400).json({ message: "Este usuario ya está registrado, pruebe con otro" });
            } else {
                res.status(400).json({ message: "Este correo electrónico o usuario ya está registrado" });
            }
            return;
        }

        // Insertar un nuevo usuario
        const sqlInsertUser = `INSERT INTO users (name, username, email, password, admin) VALUES (?, ?, ?, ?, ?)`;
        await connection.query(sqlInsertUser, [name, username, email, password, admin]);
        res.status(200).json({ message: "Usuario agregado con éxito" });
    } catch (error) {
        res.status(500).send(error.message);
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
    loginUsuario,
};
