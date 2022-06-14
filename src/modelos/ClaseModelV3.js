export default class ClaseModelV3 {

    _attributes = {}

    constructor({atributos = {}, appends = [], metodos = {}, modelos = {}}){
        Object.defineProperty(this,'_attributes',{value:atributos, writable:false, enumerable:false})
        Object.defineProperty(this,'_updates',{value: {}, writable:true, enumerable:false})
        const propiedadesAtributos = {}
        Object.keys(atributos).forEach((key)=>{
            if(!(key in modelos)){
                propiedadesAtributos[key] = {
                    enumerable: true,
                    get: function () {
                        if (key in this._updates) {
                            return this._updates[key]
                        } else if (key in this._attributes) {
                            return this._attributes[key]
                        } else {
                            return undefined
                        }
                    },
                    set: function (nuevo) {
                        this._updates[key] = nuevo
                    }
                }
            }
        })
        const propiedadesGetters = {}
        Object.entries(metodos).forEach(([key,value])=>{
            const resultadoComprobacion = /^(get)(.+)(Attribute)$/.exec(key)
            if(resultadoComprobacion){
                const nuevoAtributo = resultadoComprobacion[2].charAt(0).toLowerCase() + resultadoComprobacion[2].slice(1)
                propiedadesGetters[nuevoAtributo] ={
                    enumerable: 0<=appends.indexOf(nuevoAtributo) ||  nuevoAtributo in atributos,
                    get: function(){
                        return value(this)
                    }
                }
            }
        })
        const propiedadesModelos = {}
        Object.entries(modelos).forEach(([key, {model,array=false}])=>{
            const objetoBaseModelo = (key in atributos)?atributos[key]:null
            propiedadesModelos[key] = {
                enumerable: true,
                value: array?(objetoBaseModelo?(objetoBaseModelo.map(o=>new model(o))):[]):(objetoBaseModelo?new model(objetoBaseModelo):null)
            }
        })
        const propiedades = {...propiedadesAtributos, ...propiedadesGetters, ...propiedadesModelos}
        Object.defineProperties(this,propiedades)
    }

}