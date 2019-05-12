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
    let toPull = [];
    let i=0;

    data.forEach((element)=>{
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
          } else {
            //Recupérer l'objet dans une liste
            console.log("on garde\n" + merchant.firstName);
            toPull.push(element);
          }
        } else {
          //Faire un insert
          console.log("on crée\n" + element.firstName);
          toInsert.push(element);
        }
        i++;
        //Lorsque toutes les actions sont terminées
        if (i===data.length){
          Merchant.create(toInsert, function(error, response){
            if(error) console.log(error);
            else console.log("réponse du create:\n"+response);
          });

          toUpdate.forEach((itemToUpdate)=>{
            i=0;
            Merchant.upsert(itemToUpdate, function(error, response){
              if(error) console.log(error);
              else console.log("réponse du update:\n"+response);
              i++;
              if(i===toUpdate.length){
                console.log("-----TO UPDATE--------\n"+JSON.stringify(toUpdate)+"\n---TO INSERT---\n"+JSON.stringify(toInsert)+"\n---TO PULL---\n"+JSON.stringify(toPull));
                callback();
              }
            });
          });
        }
      });
    });











  };









};


