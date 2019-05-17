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
    let picToUpload = [];
    let picToDownload = [];
    let i=0;
  // On récupère la date de dernière synchro du client
      let lastSync = new Date((data.lastSync));
      try{
        if (isNaN(lastSync)) throw BreakException;
      } catch (e) {
        callback("first object must be a valid date");
        return;
      }

      console.log("On récupère la date");
      console.log(typeof lastSync+lastSync);
      let promise2 = new Promise (function (resolve,reject){
        Merchant.find({where:{creationDate : {gt: lastSync}}},function (err, response){
          if (err){
            callback(err);
            return;
          }
          resolve(response);
        });
      });
      promise2.then((value)=>{
        clientToInsert = value;
        cientToInsert.forEach((merchant)=>{
          if (merchant.picture!=null)
            picToDownload.push(merchant.picture);
        });
      });
    console.log("Résultat de la requête de populate du toInsert\n"+JSON.stringify(clientToInsert));


    if (data.localChanges.length===0){
    //Il n'y a rien à updater, on renvoie les nouvelles entrées
    callback(null,null,clientToInsert);
    return;
  }

    /* Tentative de faire une recherche dans un array
  let idList = [];
  //On récupère les objets présent dans la liste
    data.localChanges.forEach((merchant)=>{
      idList.push(merchant.id);
    });
    let serverMerchantList = [];
    let promise1 = new Promise (function (resolve,reject){
      console.log("idList:\n"+idList);
      Merchant.find({where:{id:{inq:["[\"cabc3a40-76f1-11e9-8f65-453b218fe36f\"]"]}}},function (response) {
        console.log("recherche lancée : " +response);
        resolve(response);
      });
    });

    promise1.then((value)=>{
      console.log("réponse de la recherche:\n"+value);
    });
*/

    data.localChanges.forEach((element,index)=>{


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
              if (element.lastUpdated != null && element.lastUpdated != merchant.lastUpdated){
                picToUpload.push(element.picture);
                //TODO Supprimer le fichier merchant.picture du serveur
              }
              
            } else if(element.lastUpdated < merchant.lastUpdated.toISOString()){
              //Recupérer l'objet dans une liste
              console.log("on garde\n" + merchant.firstName);
              clientToUpdate.push(element);
              if (merchant.lastUpdated != null && element.lastUpdated != merchant.lastUpdated){
                picToUpload.push(merchant.picture);
                //TODO Ajouter dans une liste les fichiers à effacer sur le client, an ajoutant element.picture
              }
            }
          } else {
            //Faire un insert
            console.log("on crée\n" + element.firstName);
            toInsert.push(element);
            if (element.lastUpdated != null){
                picToUpload.push(element.picture);
          }
          i++;
          //Lorsque toutes les actions sont terminées
          if (i===data.localChanges.length){
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
            callback(null,clientToUpdate,clientToInsert,picToUpload,picToDownload);
          }
        });
    });
  };
};


