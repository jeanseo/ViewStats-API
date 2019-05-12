'use strict';

module.exports = function(Merchant) {


  /**
   * push method for synchronization
   * @param {object} data description_argument
   * @param {Function(Error)} callback
   */

  Merchant.push = function(data, callback) {


    // TODO
    let toUpdate = [];
    let toInsert = [];
    let clientToUpdate = [];
    let clientToInsert = [];
    let i=0;
    data.forEach((element,index)=>{
      if (index===0){
        let lastSync = new Date((element.lastUpdated));
        try{
          if (isNaN(lastSync)) throw BreakException;
        } catch (e) {
          callback("first object must be a valid date");
          return;
        }

        console.log("On récupère la date");
        console.log(typeof lastSync+lastSync);
        Merchant.find({"where":{"creationDate" : {"gt": lastSync}}},function (err, response){
          console.log("Erreur dans la recherche de nouvelles entrées\n"+err);
          clientToInsert = response;
          console.log("Résultat de la requête de populate du toInsert\n"+JSON.stringify(response));
          i++;
        });
      }
      else{
        Merchant.findById(element.id, function (err, merchant) {
          console.log("-------------------");
          if (err) {
            console.log(err);
          }
          if (merchant) {
            if (element.lastUpdated > merchant.lastUpdated.toISOString()) {
              //Update
              console.log("on fait l'update\n" + element.firstName);
              toUpdate.push(element);
            } else if(element.lastUpdated < merchant.lastUpdated.toISOString()){
              //Recupérer l'objet dans une liste
              console.log("on garde\n" + merchant.firstName);
              clientToUpdate.push(element);
            }
          } else {
            //Faire un insert
            console.log("on crée\n" + element.firstName);
            toInsert.push(element);
          }
          i++;
          //Lorsque toutes les actions sont terminées
          if (i===data.length){
            //On fait un Bulk Insert
            if (toInsert.length>0){
              Merchant.create(toInsert, function(error, response){
                if(error) console.log(error);
                else console.log("réponse du create:\n"+response);
              });
            }
            if (toUpdate.length>0){
              //On fait une boucle pour faire un upsert (remplace l'update)
              toUpdate.forEach((itemToUpdate)=>{
                console.log("on rentre dans la boucle du update");
                i=0;
                Merchant.upsert(itemToUpdate, function(error, response){
                  if(error) console.log(error);
                  else console.log("réponse du update:\n"+response);
                  i++;
                  if(i===toUpdate.length){
                    console.log("upsert terminé");
                  }
                });
              });
            }

            console.log("-----TO UPDATE--------\n"+JSON.stringify(toUpdate)+"\n---TO INSERT---\n"+JSON.stringify(toInsert)+"\n---TO PULL---\n"+JSON.stringify(clientToUpdate));
            callback(null,clientToUpdate,clientToInsert);
          }
        });
      }
    });
  };
};


