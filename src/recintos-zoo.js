import fs from 'fs';
import path from 'path';

const animais = JSON.parse(fs.readFileSync((path.resolve('data', 'animais.json')), 'utf-8'))

class RecintosZoo {
    analisaRecintos(animal, quantidade) {
        animal = animal.toUpperCase()//prever erro
        // Retorna resposta
        const resposta = {recintosViaveis:[] }

        //Psso1: Verificar animal pertence ao grupo;
        var passo1 = this.verificarAnimalExiste(animal)
        if (!passo1) return {erro: "Animal inválido"}

        //Passo2: Verificar quantidade valida;
        if(quantidade < 1) return {erro: "Quantidade inválida"}

        //Tratar json
        const jsonData = JSON.parse(fs.readFileSync((path.resolve('data', 'recinto.json')), 'utf-8'))['recintos'];
        var animalObj = animais[animal]

        jsonData.forEach(recinto => {
            // Passo3: Verificar o Bioma;
            if(!this.conferirBioma(animalObj, recinto)) return;
            // Passo4: Verificar se tem Espaço
            var novoEspaço = this.verificarEspacoRecinto(animalObj, recinto, quantidade);
            if(novoEspaço<0) return;
            //Passo5: Aplicar regras;
            const espacoOcupado = recinto['animais_existentes'].length;
            if (espacoOcupado > 0) {
              if(!this.verificarCarnivoro(animal, animalObj, recinto['animais_existentes'])) return; // regra1: Carnivoro somente com a mesma especie
              if(!this.regraHipopotamo(animal,recinto)) return; // Regra2: Hipopótamo com outra especie somente me savana e rio
              novoEspaço -= this.regraEspecieDiferente(animal, recinto); //Regra4: Aumentar espaço em caso de duas especies ou mais
            }
            if(!this.regraMacaco(animal,espacoOcupado,quantidade)) return; //Regra3: macaco não pode ficar sozinho
            if(novoEspaço<0) return;
            var retorno = `Recinto ${recinto['numero']} (espaço livre: ${novoEspaço} total: ${recinto['total']})`
            resposta.recintosViaveis.push(retorno)
        });

        if(resposta.recintosViaveis.length == 0){return {erro: "Não há recinto viável"}}
        return resposta;
    }

    verificarAnimalExiste(animal) {
      return animais[animal] || null;
    }

    conferirBioma = (animal, recinto) =>{
        // Verificar se o bioma do recinto é compativel com o animal
        const regex = new RegExp(animal.bioma);
        return regex.test(recinto.bioma);
    }

    verificarEspacoRecinto(animal, recinto, quantidade){
        // verificar se a espaço para o(s) novo(s) Animal(is).
        return recinto.espacoLivre - (animal['tamanho'] * quantidade)
    }

    verificarCarnivoro(animal, animalObj, recinto) {
      if (animalObj.carnivoro) {
        return recinto.every(existingAnimal => existingAnimal.toLowerCase() === animal.toLowerCase());
      }
      return !recinto.some(existingAnimal => animais[existingAnimal.toUpperCase()].carnivoro);
    }
    
    regraHipopotamo(animal, recinto){
      if (animal === 'HIPOPOTAMO') {
        return recinto.bioma === 'savana e rio' || recinto['animais_existentes'].includes('HIPOPOTAMO');
      }
      return !(recinto['animais_existentes'].includes('HIPOPOTAMO') && recinto.bioma !== 'savana e rio');
    }

    regraMacaco(animal, recinto, quantidade){
      return animal !== 'MACACO' || quantidade > 1;
    }

    regraEspecieDiferente(Animal, recinto) {
      return recinto['animais_existentes'].includes(Animal.toLowerCase()) ? 0 : 1;
    }
}

export { RecintosZoo as RecintosZoo };