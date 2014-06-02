//This scripts maps people form ogov-data to the popolo standard http://popoloproject.com
//It takes the ogovPerson variable and outputs a popoloPerson

var popoloPerson = {
	name: ogovPerson.name,
	other_names: [
	{
		name: ogovPerson.user
		note: "Username"
	},
	email: ogovPerson.email,
	image: ogovPerson.pictureUrl,
	summary: ogovPerson.role,
	national_identity: "Argentino", //Podemos estar seguros de que todos los legisladores son argentinos?
	contact_details: [
		{
			type: "email"
			label: "Correo electrónico oficial"
			value: ogovPerson.email
			note: window.undefined
		}
	],
	popolo.links: window.undefined, // Podemos incluir aquí el link a la página oficial en el congreso?
	popolo.comittees: ogovPerson.comittees //Para comittees en realidad lo que hay que hacer es crear relationships en PopIt con la API de popit. Así que vamos a guardarlas así y después cuando lo parseamos creamos la relación.

	gender = window.undefined, //De dónde podríamos sacar esto?
	birth_date = window.undefined,  //De dónde podríamos sacar esto?
	death_date = window.undefined, // Ninguno murió, están todavía en el cargo
	biography: window.undefined,  //Esto lo podremos sacar de wikipedia? 

}