var file =require("file");
var fs = require('fs');

file.walk("bills", billsindir);
var walki=0;

function billsindir(nothing,dirPath,dirs,files) {
  folderBills = [];
  for (f in files) {
    json = JSON.parse(fs.readFileSync(files[f],"utf8"));
    folderBills.push(toPopolo(json));
  }
  console.log(folderBills);
  if (folderBills.length > 0) {
    var fileName = "mongo"+walki+".json";
    fs.writeFileSync(fileName, JSON.stringify(folderBills));
    walki++;
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
    billitPaperwork.date = dictum["date"]
    billitPaperwork.description = dictum["result"]
    billitPaperwork.stage = "Con dictámen"
    billitPaperwork.chamber = dictum["source"]

    billitPaperworks.push(billitPaperwork);
  }

  var billitDirectives = [];
  for (p in ogovBill.procedures) {
    var procedure = ogovBill.procedures[p];

    var billitDirective = {};
    billitDirective.date = procedure["date"];
    billitDirective.step = "Votación";
    billitDirective.stage = procedure["result"];
    billitDirective.link = "";

    billitDirectives.push(billitDirective);
  } 


  var billitBill = {
    "uid": ogovBill.file,
    "short_uid": ogovBill.file.split("-")[0],
    "title": capitaliseFirstLetter(ogovBill.summary),
    "creation_date": ogovBill.creationTime,
    "source": ogovBill.source,
    "initial_chamber": ogovBill.source, //This we have to find out more, becase it cannot be "PE"
    "bill_draft_link":"http://www1.hcdn.gov.ar/proyxml/expediente.asp?fundamentos=si&numexp="+ogovBill.file,
    "subject_areas": ogovBill.committees,
    "authors": billitAuthors,
    "paperworks": ogovBill.dictums,
    "directives": ogovBill.procedures,
    "stage": "Ingresado",
    "project_type": capitaliseFirstLetter(ogovBill.type.replace("PROYECTO DE ","")),

    "current_priority": "Normal",

    //We don't have any of these
    "priorities":[],
    "reports":[],
    "documents":[],
    "remarks":[],
    "revisions":[],
  }
  if (billitBill.paperworks.length > 0) {
    billitBill.stage = "Con dictámen en Cámara de Orígen";
    if (billitBill.paperworks.length > 1) {
      billitBill.stage = "Con dictámen en Cámara Revisora";
    }
  }
  if (billitBill.directives.length > 0) {
    //console.log(billitBill.directives[0]);
    if (billitBill.directives[0].result == "APROBADO") {
      billitBill.stage = "Con media sanción";
    }
    else {
      billitBill.stage = "Rechazado";
    }
    if (billitBill.directives.length > 1) {
      if (billitBill.directives[1].result == "APROBADO") {
        billitBill.stage = "Sanción definitiva (ley)";
      }
      else {
        billitBill.stage = "Rechazado";
      }
    }
  }
  return billitBill;
}


function capitaliseFirstLetter(string) {
    if(!string) { return 'null' }
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
