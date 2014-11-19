

json_data = {
  "vidjil_json_version": ["2014.09"], 
  "reads": {
    "segmented": [200,100,200,100], 
    "total": [200,100,200,100], 
    "germline": {
      "TRG": [100,50,100,50], 
      "IGH": [100,50,100,50]
    }
  }, 
  "samples": {
    "timestamp": ["2014-10-20 13:59:02", "2014-10-25 14:00:32", "2014-11-20 14:03:13", "2014-12-20 14:04:48"], 
    "commandline": [
      "./vidjil -c clones -g germline/ -r 1 -o ./out0 -z 200 -n 5 Leu+0_BCD.cut.fa ", 
      "./vidjil -c clones -g germline/ -r 1 -o ./out1 -z 200 -n 5 Leu+1_BCD.cut.fa ", 
      "./vidjil -c clones -g germline/ -r 1 -o ./out2 -z 200 -n 5 Leu+2_BCD.cut.fa ", 
      "./vidjil -c clones -g germline/ -r 1 -o ./out3 -z 200 -n 5 Leu+3_BCD.cut.fa "
    ], 
    "number": 4, 
    "original_names": [
      "Leu+0_BCD.cut.fa", 
      "Leu+1_BCD.cut.fa", 
      "Leu+2_BCD.cut.fa", 
      "Leu+3_BCD.cut.fa"
    ], 
    "log": [
      "  ==> segmented 362296 reads (38.7%)\n  ==> found 11526 40-windows in 335725 segments (35.8%) inside 937164 sequences\n ", 
      "  ==> segmented 407095 reads (56.5%)\n  ==> found 35801 40-windows in 396776 segments (55.1%) inside 720531 sequences\n ", 
      "  ==> segmented 419506 reads (46.2%)\n  ==> found 19567 40-windows in 400435 segments (44.1%) inside 908909 sequences\n ", 
      "  ==> segmented 448435 reads (48.2%)\n  ==> found 43444 40-windows in 418595 segments (45%) inside 929901 sequences\n " 
    ]
  }, 
  "clones": [
    { 
        "sequence" : "aaaaaaaaaaaaaaaaaaaaa",
        "name" : "test1",
        "id" : "riri",
        "reads" : [10,10,15,15] ,
        "top" : 1,
        "germline" : "TRG",
    },
    { 
        "sequence" : "bbbbbbbbbbbbbbb",
        "name" : "test2",
        "id" : "fifi",
        "reads" : [20,20,10,10] ,
        "top" : 2,
        "germline" : "TRG",
    },
    { 
        "sequence" : "cccccccccccccccccccc",
        "name" : "test3",
        "id" : "loulou",
        "reads" : [25,25,50,50] ,
        "top" : 3,
        "germline" : "IGH",
    }
  ]
}

var myConsole = new Com("flash_container", "log_container", "popup-container", "data-container")

    var m = new Model();
    m.parseJsonData(json_data)
    
test("model : load", function() {
    var m = new Model();
    m.parseJsonData(json_data)
    
    equal(m.samples.number, 4, "timepoint : number==4");
    equal(m.samples.number, m.samples.original_names.length, "timepoint : check if array have the expected length");
});

test("model : time control", function() {
    var m = new Model();
    m.parseJsonData(json_data)
    
    
    equal(m.t, 0, "default timepoint = 0");                     // [0,1,2,3] => 0
    deepEqual(m.samples.order, [0,1,2,3], "default order = [0,1,2,3]")
    equal(m.nextTime(), 1, "next timepoint = 1");               // [0,1,2,3] => 1
    equal(m.changeTime(3) , 3, "changeTime to 3");              // [0,1,2,3] => 3
    equal(m.previousTime(), 2, "previous timepoint = 2");       // [0,1,2,3] => 2
    m.switchTimeOrder(0,3)                                      // [3,1,2,0] => 2
    deepEqual(m.samples.order, [3,1,2,0], "switch time order, exchange position of time 0 and 3 => [3,1,2,0]")
    equal(m.nextTime(), 0, "next timepoint = 0");               // [3,1,2,0] => 0
    equal(m.nextTime(), 3, "loop end to start");                // [3,1,2,0] => 3
    equal(m.previousTime(), 0, "loop start to end");            // [3,1,2,0] => 0
    m.changeTimeOrder([3,2,1])                                  // [3,2,1] => 0
    deepEqual(m.samples.order, [3,2,1], "change time order to [3,2,1]")
    
    
    equal(m.getStrTime(0, "sampling_date"), "2014-10-20", "get sampling date")
    equal(m.getStrTime(0, "name"), "Leu+0_BCD", "get time original name")
    equal(m.dateDiffInDays("2014-10-05", "2014-10-10"), "+5", "datediffindays")
    equal(m.getStrTime(1, "delta_date"), "+5", "get day since diag")
    
});

test("model : select/focus", function() {
    var m = new Model();
    m.parseJsonData(json_data,100)
    
    m.select(0)
    equal(m.clone(0).isSelected(), true, "select clone : check if clone has been selected");
    deepEqual(m.getSelected(), [0], "select clone : check selection");
    m.select(2)
    deepEqual(m.getSelected(), [0,2], "select a second clone : check selection");
    m.unselectAll()
    deepEqual(m.getSelected(), [], "unselect all");
    m.multiSelect([0,2,3])
    deepEqual(m.getSelected(), [0,2,3], "multi-select");
    m.unselectAll()
    
    m.focusIn(0)
});

test("model : cluster", function() {
    var m = new Model();
    m.parseJsonData(json_data,100)
    
    equal(m.clone(0).getSize(), 0.05, "clone 0 : getsize = 0.05");
    equal(m.clone(1).getSize(), 0.1, "clone 1 : getsize = 0.1");
    equal(m.clone(2).getSize(), 0.125, "clone 2 : getsize = 0.125");

    m.select(0)
    m.select(1)
    m.merge()
    deepEqual(m.clusters[0], [0,1], "merge 0 and 1: build cluster [0,1]");
    equal(m.clone(0).getSize(), 0.15, "cluster [0,1] : getsize = 0.15");
    
    m.select(0)
    m.select(2)
    m.merge()
    deepEqual(m.clusters[0], [0,1,2], "merge [0,1] and 2: build cluster [0,1,2]");
    equal(m.clone(0).getSize(), 0.275, "cluster [0,1,2] : getsize = 0.275");
    
    m.split(0,1)
    deepEqual(m.clusters[0], [0,2], "remove clone 1 from cluster [0,1,2]: build cluster [0,2]");
    equal(m.clone(0).getSize(), 0.175, "cluster [0,2] : getsize = 0.175");
    
    m.clusterBy(function(id){return m.clone(id).germline})
    deepEqual(m.clusters[0], [0,1], "clusterBy germline");
    
    m.restoreClusters()
    deepEqual(m.clusters[0], [0,2], "restore previous clusters (made by user with merge whithout using clusterby function)");
    
    m.resetClusters()
    deepEqual(m.clusters, [[0],[1],[2],[3]], "resetClusters");
});












