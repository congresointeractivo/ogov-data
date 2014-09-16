var file =require("file");
var fs = require('fs');

var walki=0;
var folderBills = [];

file.walk("bills", billsindir);

var fileName = "pbills/mongo"+walki+".json";
console.log(fileName);
fs.writeFileSync(fileName, JSON.stringify(folderBills).replace("}","}\n"));


function billsindir(nothing,dirPath,dirs,files) {
  for (f in files) {
    json = JSON.parse(fs.readFileSync(files[f],"utf8"));
    folderBills.push(toPopolo(json));
  }
  //console.log(dirPath,fileName);
  if (folderBills.length > 1000) {
    var fileName = "pbills/mongo"+walki+".json";
    fs.writeFileSync(fileName, JSON.stringify(folderBills).replace("}","}\n"));
    walki++;
    folderBills = []
  }
}



var toPopolo = function(ogovBill) {

  var billitAuthors = [];
  for (s in ogovBill.subscribers) {
    billitAuthors.push(ogovBill.subscribers[s].name);
  }

  var billitPaperworks = [];
  for (d in ogovBill.dictums) {
    var dictum = ogovBill.dictums[d];

    var billitPaperwork =  {}
    billitPaperwork.session = dictum["orderPaper"]
    billitPaperwork.date = { "$date": new Date(dictum["date"]).getTime() }
    billitPaperwork.description = dictum["result"]
    billitPaperwork.stage = "Con dictámen"
    billitPaperwork.chamber = dictum["source"]

    billitPaperwork.bill_uid = ogovBill.file
    billitPaperwork.timeline_status = "Indicaciones"


    billitPaperworks.push(billitPaperwork);
  }

  var billitDirectives = [];
  for (p in ogovBill.procedures) {
    var procedure = [p];

    var billitDirective = {};
    billitDirective.date = { "$date": new Date(procedure["date"]).getTime() };
    billitDirective.step = procedure["topic"];
    billitDirective.stage = procedure["result"];
    billitDirective.link = "";
    billitDirective.bill_uid = procedure["file"]
    billitDirective.source = procedure["source"]

    billitDirectives.push(billitDirective);
  } 


  var billitBill = {
    "uid": ogovBill.file,
    "short_uid": ogovBill.file.split("-")[0],
    "title": ogovBill.summary,
    "creation_date": { "$date": new Date(ogovBill.creationTime).getTime() },
    "source": ogovBill.source,
    "initial_chamber": ogovBill.source, //This we have to find out more, becase it cannot be "PE"
    "bill_draft_link": ogovBill.textUrl,
    "subject_areas": ogovBill.committees,
    "authors": billitAuthors,
    "paperworks": billitPaperworks,
    "directives": billitDirectives,
    "lawNumber": ogovBill.lawNumber,
    "stage": "Ingresado",
    "project_type": ogovBill.type.replace("PROYECTO DE ",""),

    "current_priority": "Normal",

    //We don't have any of these
    "priorities":[],
    "reports":[],
    "documents":[],
    "remarks":[],
    "revisions":[],
  }







  // Si existe, se considera "Ingresado"

  //Si tiene un dictámen, considero que el estado es "Con dictámen en Cámara de Orígen"
  if (billitBill.paperworks.length > 0) {
    billitBill.stage = "Con dictámen en Cámara de Orígen";
    //Si tiene dos dictámenes, considero que el estado es "Con dictámen en Cámara Revisora"
    //Todavía no encontré un ejemplo en el que esto no sea cierto, pero creo que debe haber y que esto está mal.
    if (billitBill.paperworks.length > 1) {
      billitBill.stage = "Con dictámen en Cámara Revisora";
    }
  }

  //Si tiene un trámite cuyo estado es APROBADO, entonces lo considero "Con media sanción" 
  //si es una ley, o Aprobado si es un proyecto de declaración, resolución o mensaje.
  if (billitBill.directives.length > 0) {
    if (billitBill.directives[0].stage == "APROBADO") {
      if (billitBill.project_type == "LEY") {
        billitBill.stage = "Con media sanción";
      }
      else {
        billitBill.stage = "Aprobado o sancionado";        
      }
    }
    // Si en el primer trámite, el estado NO ES APROBADO, entonces lo considero "Rechazado"
    else {
      console.log(billitBill.project_type,ogovBill.procedures);
      billitBill.stage = "Rechazado";
    }
    //Si tiene más de un trámite y el resultado del segundo trámite es SANCIONADO, lo considero Sancionado.
    if (billitBill.directives.length > 1) {
      if (billitBill.directives[1].result == "SANCIONADO") {
        billitBill.stage = "Aprobado o sancionado";
      }
      //Si el resultado del segundo trámite NO ES SANCIONADO lo considero "Rechazado".
      else {
        billitBill.stage = "Rechazado";
      }
    }
  }


  // Si tiene número de ley es porque está aprobada
  if (billitBill.lawNumber) {
        billitBill.stage = "Aprobado o sancionado";    
  }
  return billitBill;
}

