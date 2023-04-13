class EnfrentModel {
    constructor(idEnfrentamiento, fechaEnfrentamiento, short, idLiga, nameLiga, anioLiga, round, idLocal, nameLocal, logoLocal, ganaLocal, idVisit, nameVisit, 
    logoVisit, ganaVisit, golLocal, golVisit, penalesLocal, penalesVisit, isModificado, isComparado) {
      this.idEnfrentamiento = idEnfrentamiento;
      this.fechaEnfrentamiento = fechaEnfrentamiento;
      this.short = short;
      this.idLiga = idLiga;
      this.nameLiga = nameLiga;
      this.anioLiga = anioLiga;
      this.round = round;
      this.idLocal = idLocal;
      this.nameLocal = nameLocal;
      this.logoLocal = logoLocal;
      this.ganaLocal = ganaLocal;
      this.idVisit = idVisit;
      this.nameVisit = nameVisit;
      this.logoVisit = logoVisit;
      this.ganaVisit = ganaVisit;
      this.golLocal = golLocal;
      this.golVisit = golVisit;
      this.penalesLocal = penalesLocal;
      this.penalesVisit = penalesVisit;
      this.isModificado = isModificado;
      this.isComparado = isComparado;
    }
}


export default EnfrentModel;