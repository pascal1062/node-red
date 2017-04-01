module.exports = function(RED) {
    var pic = require('node-ioboard');
	
	I2CInUse = 0;
    
    function writeOPNode(config) {
        RED.nodes.createNode(this,config);
        this.prefix = config.prefix;
		this.name = config.name;
        this.address = config.address;
        this.output = config.output;
        var node = this;
        var val = 0;
		var writeflag = 0;
		
    	// Set interval
		this.interval_id = setInterval(function()
							{
							    if ((writeflag == 0) || (I2CInUse == 1)) return;
								I2CInUse = 1;
								// set write flag
							    writeflag = 0;
								pic.writeOP(parseInt(node.address),parseInt(node.output),val,function(err)
								{
									if (err) {
										node.error(err);
										node.status({fill:"red",shape:"ring",text:"disconnected"});
									} else {
										node.status({fill:"green",shape:"dot",text: val.toString()});
									}
									
									I2CInUse = 0;
										
									var msg = {topic:node.name,payload:Number(val)};
									node.send(msg);
								});
							},100);
				
        this.on('input', function(msg) 
                         {
                           
              				val = parseInt(msg.payload);
							// set write flag
							writeflag = 1;
                         });
    }
    
    RED.nodes.registerType("writeOP",writeOPNode);
	
	writeOPNode.prototype.close = function(){
		if (this.interval_id != null) 
		{
			clearInterval(this.interval_id);
		}
	}
}
