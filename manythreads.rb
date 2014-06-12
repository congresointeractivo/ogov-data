startingbill = ARGV[0].to_i
endingbill = ARGV[1].to_i
threads = ARGV[2].to_i

billamount = endingbill - startingbill
threadspacing = billamount / threads

currentthread = 0;

for currentthread in 0..threads
  currentstart = startingbill + (threadspacing * currentthread)
  system("nohup ruby bills-to-billit.rb "+currentstart.to_s+" > thread"+currentthread.to_s+".log &")
end
