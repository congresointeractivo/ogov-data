//This scripts maps bills form ogov-data to the bill it format and the popolo standard
//It takes the ogovBill variable and outputs a billitBill and a popoloMotion

var billitAuthors = [];
for (s in ogovBill.subscribers) {
	billitAuthors.push(ogovBill.subscribers[s].name);
}

var billitBill = {
  "uid": ogovBill.file,
  "short_uid": ogovBill.file.split("-")[0],
  "title": ogovBill.summary,
  "creation_date": ogov.creationTime,
  "source": ogovBill.sourc
  "initial_chamber": ogovBill.source, //This we have to find out more, becase it cannot be "PE"
  "bill_draft_link":"http://www1.hcdn.gov.ar/proyxml/expediente.asp?fundamentos=si&numexp="+ogovBill.file,
  "subject_areas": ogovBill.committees,
  "authors": billitAuthors,
  "paperworks": ogovBill.dictums,
  "directives": ogovBill.procedures,

  "current_priority": window.undefined, //I think we can adapt this to add priority when the project is expected to be voted on shortly (but this was not the original use case)

  //We don't have any of these
  "priorities":[],
  "reports":[],
  "documents":[],
  "remarks":[],
  "revisions":[],
}


//This scripts maps bills form ogov-data to the popolo standard http://popoloproject.com
//It takes the ogovBill variable and outputs a popoloMotion

var popoloMotion = {
  "organization_id": ogovBill.source
  "creator_id": ogovBill.subscribers, //The popolo spect defines this as string, but it should actually be an array. Besides, I don't now if we have access to the id at this point?
  "text": ogovBill.summary
  "object_id": ogovBill.file,
  "date": ogovBill.dictums[0].date, //I believe this is the date of the last time this was considered before being voted
  "result": (ogovBill.procedures[0].result == "APROBADO" ? "pass" : "fail"),

  "requirement":  window.undefined, //This depends on the type of dictum (majority or minority) being voted, I don't know how to determine it at this point
  "vote_events": window.undefined, // This should be retroactively updated with each voting event on this motion
  "context": {
    "parliament": window.undefined,
    "session": window.undefined,
    "sitting": window.undefined
  },
}