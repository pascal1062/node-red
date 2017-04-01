 module.exports = function(RED) {
    var pic = require('node-ioboard');
	var time = require('time');
	
	I2CInUse = 0;
    
    function readIPNode(config) {
        RED.nodes.createNode(this,config);
        
		this.prefix = config.prefix;
        this.address = config.address;
  		this.scan = config.scan;
  		this.interval_id = null;
		var node = this;
		var value;  
		var lasttime = time.time() - 2 * parseInt(node.scan);

		// Set interval
		this.interval_id = setInterval(function()
							{
								if (time.time() < (lasttime + parseInt(node.scan))) return;
							    if (I2CInUse == 1) return;
								I2CInUse = 1;
							    // read IP  
								pic.readIP(parseInt(node.address),function(err,data)
								{
									if (err) {
										 node.log(err);
										 node.status({fill:"red",shape:"ring",text:"disconnected"});
									} 
									
									if (data != null) 
									{
										value = data;
										// emit on input
										node.emit("input",{});
									}	
									I2CInUse = 0;
								}); 
							    // remember time from last read
			                    lasttime = time.time();	
							},100);

			this.on('input', function(msg) 
						{
							
							this.status({fill:"green",shape:"dot",text:"connected "+value.toString()});
										
							var IP1 = {payload:value[0]};
							var IP2 = {payload:value[1]};
							var IP3 = {payload:value[2]};
							var IP4 = {payload:value[3]};
							var IP5 = {payload:value[4]};
							var IP6 = {payload:value[5]};
							var IP7 = {payload:value[6]};
							var IP8 = {payload:value[7]};
							var msg = {topic:node.name};
							
							this.send([IP1,IP2,IP3,IP4,IP5,IP6,IP7,IP8,msg]);
								
							msg = null;
						});
	
	}
    
    RED.nodes.registerType("readIP",readIPNode);
	
	readIPNode.prototype.close = function(){
		if (this.interval_id != null) 
		{
			clearInterval(this.interval_id);
		}
	}
}
