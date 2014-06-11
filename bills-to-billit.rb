require 'httparty'
require 'json'
require 'billit_representers/models/bill'


def newbillit ogovBill
	bill = Billit::Bill.new

	p ogovBill


	billitAuthors = [];
	ogovBill["subscribers"].each { |s|
		billitAuthors.push s["name"]
	}


	billitPaperworks = [];
	ogovBill["dictums"].each { |dictum|
		billitPaperwork =  BillitPaperwork.new;
		billitPaperwork.session = dictum["orderPaper"]
		billitPaperwork.date = dictum["date"]
		billitPaperwork.description = dictum["result"]
		billitPaperwork.stage = "Con dictámen"
		billitPaperwork.chamber = dictum["source"]

		billitPaperworks.push(billitPaperwork);
	}

	billitDirectives = [];
	ogovBill["procedures"].each { |procedure|
		billitDirective = BillitDirective.new;
		billitDirective.date = procedure["date"];
		billitDirective.step = "Votación";
		billitDirective.stage = procedure["result"];
		billitDirective.link = "";

		billitDirectives.push(billitDirective);
	}	

  	bill.uid = ogovBill["file"]
  	bill.short_uid = ogovBill["file"].split("-")[0]
	bill.title = ogovBill["summary"].downcase.capitalize
	bill.creation_date = ogovBill["creationTime"]
	bill.source = ogovBill["source"]
	bill.initial_chamber = ogovBill["source"] #This we have to find out more becase it cannot be "PE"
	bill.bill_draft_link = "http://www1.hcdn.gov.ar/proyxml/expediente.asp?fundamentos=si&numexp="+ogovBill["file"]
	bill.subject_areas = ogovBill["committees"]
	bill.authors = billitAuthors
	bill.paperworks = billitPaperworks;
	bill.directives = billitDirectives;

	bill.current_priority = nil; #I think we can adapt this to add priority when the project is expected to be voted on shortly (but this was not the original use case)

	#We don't have any of these
	bill.priorities =[]
	bill.reports =[]
	bill.documents =[]
	bill.remarks =[]
	bill.revisions =[]

	return bill;
end

def save bill
	@model =  'bills'
    @API_url = 'http://billit.congresointeractivo.org'
	@format = 'application/json'

    req = HTTParty.get([@API_url, @model, bill.uid].join("/"), headers: {"Accept"=>"*/*"});
    # p req 
    # abort
    puts "Checking if bill exists. Server responded code: " + req.code.to_s
		if req.code == 200
			puts "Updating bill."
			put bill
		else
			puts "Creating new bill."
			post bill
		end
end

def put bill
    p "put bill"
    bill.put([@API_url, @model, bill.uid].join("/"), @format)
end

def post bill
    p "post bill"
    bill.post([@API_url, @model].join("/"), @format)
end


startbill = 0;

if (ARGV[0]) then
	startbill = ARGV[0]
end


billcount = 0

allbills = Dir["bills/*/*/*"].select { |billfile|
	if (startbill > billcount) then
		next;
	end
	p billfile;
	jsontext = File.read(billfile)
	jsonbill = JSON.parse(jsontext)
	bill = newbillit(jsonbill);
	p bill;
	save bill;
	billcount = billcount + 1;
	p billcount
}

