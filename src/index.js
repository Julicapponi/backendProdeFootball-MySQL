import app from "./app.js";

const main = () => {
    app.listen(app.get("port"),app.get("host"));
    console.log(`Server on port ${app.get("port")} en el host ${app.get("host")}`);
};

main();