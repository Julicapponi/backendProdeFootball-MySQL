# Instalación y Configuración

## Instalación de Node.js

1. Visita el sitio oficial de Node.js en [este enlace](https://nodejs.org/).
2. Descarga la versión LTS recomendada para tu sistema operativo.
3. Ejecuta el instalador descargado y sigue las instrucciones del asistente de instalación.
4. Verifica la instalación abriendo una terminal y ejecutando los siguientes comandos:
 node -v
 npm -v

## Instalación de Git

1. Abre una terminal en tu computadora.
2. Visita el sitio oficial de Git en [este enlace](https://git-scm.com/download/win).
3. Descarga la versión compatible recomendada y sigue las instrucciones.

## Clonar localmente el repositorio desde GitHub

1. Una vez instalado Git, podrás clonar el repositorio localmente.
2. Abre una ventana de comandos y navega a la ubicación deseada para clonar el repositorio utilizando el comando `cd ruta/del/directorio`.
3. Clona el repositorio desde GitHub utilizando el siguiente comando:

git clone https://github.com/Julicapponi/backendProdeFutbol.git

## Instalación de una IDE

1. Una vez que hayas configurado el repositorio local, instala una IDE para abrir y examinar el proyecto de manera eficiente. Se recomienda considerar la opción de instalar Visual Studio Code. Descárgalo desde [este enlace](https://code.visualstudio.com/download).
2. Abre el proyecto en la ubicación almacenada.

## Instalación de Dependencias

1. Abre una terminal y asegúrate de estar en la raíz del proyecto.
2. Ejecuta el siguiente comando para instalar las dependencias del proyecto:

npm install

## Despliegue de la Base de Datos

1. Descarga e instala SQLWorkspace desde: [https://dev.mysql.com/downloads/workbench/](https://dev.mysql.com/downloads/workbench/).
2. Inicia SQL Workbench y abre la conexión predeterminada "localhost".
3. Dirígete a la pestaña "Server" y selecciona "Data Import".
4. Importa la base de datos ubicada en la carpeta del proyecto: `src/database/bdImport/bd-prode.sql`.

## Configuración del archivo .env

1. Ubica el archivo `.env` en la raíz del proyecto.
2. Completa los campos con la información solicitada para la configuración de la base de datos.

## Inicio

1. En la terminal de Visual Studio Code previamente instalado, ejecuta el siguiente comando para iniciar:

npm start

2. Una vez completados estos pasos, el backend debería estar en funcionamiento y listo para ser utilizado.

