var ws,output=$('.ChatRoom .Output'),DOC_title=$('title');
var MSGC=0,WFocus=true,M_Notice=true;
var User=new Object(),Server=new Object(),isAdmin=new Object(),isBanned=new Object();
var isBannedNow=false;
var Commands={
	"cls":{
		fun:()=>{output.empty();}
	},
	"exit":{
		fun:()=>{ws.close()}
	},
	"notice":{
		fun:()=>{
			M_Notice=!M_Notice;
			document.getElementById('AlertS').className=(M_Notice?"fas fa-bell":"fas fa-bell-slash");
			Write(`<i class="fas fa-wrench" style="width:20px"></i> Message notice = ${M_Notice}\n`,{"color":"#13c60d"})
		}
	}
},S_Status=0,S_Interface=true;
if (!window.WebSocket){
	output.html('');
	Write(`Fucking Error: No Websocket support.\n`,{'color':"#e7483f"});
}
function ChangeInputContent(str){
	$('.Input').val(str);
}
function AddInputContent(str){
	$('.Input').val($('.Input').val()+str);
}
function unbanSelf(){
	ws.send(JSON.stringify({
		headers:{
			"Content_Type":'application/unbanUser',
			"Set_Name":User.name
		}
	}));
}
function Initalize(){
	ws=new WebSocket(`ws://${User.host}:${User.port}`);
	ws.onopen=()=>{
		ws.send(JSON.stringify({
			headers:{
				"Content_Type":'application/userlist'
			}
		}));
	}
	ws.onclose=(CS_E)=>{
		$('.Status .Output').html(`<span style='color:#e7483f;'><i class="fas fa fa-exclamation-circle" style="width:20px"></i>Cannot find the service</span>`);
		Write(`<i class="fa fa-exclamation-circle" style="width:20px"></i> Error Code : ${CS_E.code}\nCannot find the service.`,{'color':"#e7483f"});
	}
	ws.onmessage=(msg)=>{
		msg=JSON.parse(msg.data);
		if(msg.headers['Content_Type']==='application/userlist'){
			Server=msg.headers.Set_serverinfo;
			Write(`<i class="fas fa-users" style="width:20px"></i> User(s) : ${Server.usrList.join(', ')}\n`);
		}
		if(msg.headers['Content_Type']==='application/init'){
			Server=msg.headers.Set_serverinfo;
			isAdmin=Server.isAdmin;
			$('.Status .Output').html('<i class="fas fa-close" onclick="Send(\'/exit\')" style="cursor:pointer;color:#e7483f;width:20px"></i><i class="fas fa-bell" id="AlertS" onclick="Send(\'/notice\')" style="width:20px;cursor:pointer;color:#ffff00"></i> Chat Room');
			$('.UserInfo .Output').html(`<i class="fas fa-comments" style="width:20px"></i> Chat Name : ${Server.name}\n<i class="fas fa-user" style="width:20px"></i> User : ${User.name}\n<i class="fas fa-users" style="width:20px"></i> User List : \n${Server.usrList.map(x=>'   '+(isBanned[x]?`<i class="fas fa-times" style="cursor:pointer;color:#e7483f;width:20px" onclick="ChangeInputContent(\'/unban `+x+`\')"></i>`:(isAdmin[x]?'<i class="fas fa-user-secret" style="width:20px"></i>':'<i class="fas fa-check" style="cursor:pointer;color:#13c60d;width:20px" onclick="ChangeInputContent(\'/ban '+x+'\')"></i>'))+'<i class="fas fa-at" style="cursor:pointer" onclick="AddInputContent(\'@'+x+' \')" style="width:20px"></i> '+x).join('\n')}`);
			output.html('');
			Write(`<i class="fas fa-info-circle" style="width:20px"></i> Chat name : ${Server.name}\nUser(s) : ${Server.usrList.join(', ')}\n			   JS Chat Room\n/cls	  | to clear the messages.\n/exit     | to exit the chat room.\n/notice   | notice on new message.\n`,{"color":"#13c60d"});
		}
		if(msg.headers['Content_Type']==='application/message'){
			if(S_Status!=3)	return;
			if(msg.headers['Style']){
				Write(msg.body,msg.headers['Style']);
			}else Write(msg.body);
		}
		if(msg.headers['Content_Type']==='application/command'){
			RemoteCommands[msg.headers['Command']](msg.headers['Parameter']);
		}
		if(msg.headers['Content_Type']==='application/adminChange'){
			Server=msg.headers.Set_serverinfo;
			if(!isAdmin[User.name] && Server.isAdmin[User.name])
				Write("<i class='fas fa-cogs' style='width:20px'></i> You are set as adminstrator from the server.\n",{"color":"#13c60d"});
			else if(isAdmin[User.name] && !Server.isAdmin[User.name])
				Write("<i class='fas fa-cogs' style='width:20px'></i> You are set as common user from the server.\n",{"color":"#e7483f"});
			else	Write(msg.body,msg.headers['Style']);
			isAdmin=Server.isAdmin;
			$('.UserInfo .Output').html(`<i class="fas fa-comments" style="width:20px"></i> Chat Name : ${Server.name}\n<i class="fas fa-user" style="width:20px"></i> User : ${User.name}\n<i class="fas fa-users" style="width:20px"></i> User List : \n${Server.usrList.map(x=>'   '+(isBanned[x]?`<i class="fas fa-times" style="cursor:pointer;color:#e7483f;width:20px" onclick="ChangeInputContent(\'/unban `+x+`\')"></i>`:(isAdmin[x]?'<i class="fas fa-user-secret" style="width:20px"></i>':'<i class="fas fa-check" style="cursor:pointer;color:#13c60d;width:20px" onclick="ChangeInputContent(\'/ban '+x+'\')"></i>'))+'<i class="fas fa-at" style="cursor:pointer" onclick="AddInputContent(\'@'+x+' \')" style="width:20px"></i> '+x).join('\n')}`);
		}
		if(msg.headers['Content_Type']==='application/banChange'){
			Server=msg.headers.Set_serverinfo;
			let banTime=Server.BanTime;
			isBanned=Server.isBanned;
			$('.UserInfo .Output').html(`<i class="fas fa-comments" style="width:20px"></i> Chat Name : ${Server.name}\n<i class="fas fa-user" style="width:20px"></i> User : ${User.name}\n<i class="fas fa-users" style="width:20px"></i> User List : \n${Server.usrList.map(x=>'   '+(isBanned[x]?`<i class="fas fa-times" style="cursor:pointer;color:#e7483f;width:20px" onclick="ChangeInputContent(\'/unban `+x+`\')"></i>`:(isAdmin[x]?'<i class="fas fa-user-secret" style="width:20px"></i>':'<i class="fas fa-check" style="cursor:pointer;color:#13c60d;width:20px" onclick="ChangeInputContent(\'/ban '+x+'\')"></i>'))+'<i class="fas fa-at" style="cursor:pointer" onclick="AddInputContent(\'@'+x+' \')" style="width:20px"></i> '+x).join('\n')}`);
			if(Server.BanName===User.name){
				Write(`<i class='fas fa-ban' style='width:20px'></i> You are banned for ${banTime/1000}s from the server.\n`,{"color":"#e7483f"});
				isBannedNow=true;
				$(".Input").attr("readOnly",true);
				setTimeout("unbanSelf()",banTime);
			}
			else	Write(msg.body,msg.headers['Style']);;
		}
		if(msg.headers['Content_Type']==='application/unbanChange'){
			Server=msg.headers.Set_serverinfo;
			isBanned=Server.isBanned;
			$('.UserInfo .Output').html(`<i class="fas fa-comments" style="width:20px"></i> Chat Name : ${Server.name}\n<i class="fas fa-user" style="width:20px"></i> User : ${User.name}\n<i class="fas fa-users" style="width:20px"></i> User List : \n${Server.usrList.map(x=>'   '+(isBanned[x]?`<i class="fas fa-times" style="cursor:pointer;color:#e7483f;width:20px" onclick="ChangeInputContent(\'/unban `+x+`\')"></i>`:(isAdmin[x]?'<i class="fas fa-user-secret" style="width:20px"></i>':'<i class="fas fa-check" style="cursor:pointer;color:#13c60d;width:20px" onclick="ChangeInputContent(\'/ban '+x+'\')"></i>'))+'<i class="fas fa-at" style="cursor:pointer" onclick="AddInputContent(\'@'+x+' \')" style="width:20px"></i> '+x).join('\n')}`);
			if(Server.BanName===User.name){
				isBannedNow=false;
				$(".Input").attr("readOnly",false);
				Write(`<i class='fas fa-commenting' style='width:20px'></i> You are unbanned.\n`,{"color":"#13c60d"});
			}
			else	Write(msg.body,msg.headers['Style']);
		}
	}
}
var RemoteCommands={
	"UsrAdd":(Para)=>{
		if(Server.usrList){
			Server.usrList.push(Para[0]);
			$('.UserInfo .Output').html(`<i class="fas fa-comments" style="width:20px"></i> Chat Name : ${Server.name}\n<i class="fas fa-user" style="width:20px"></i> User : ${User.name}\n<i class="fas fa-users" style="width:20px"></i> User List : \n${Server.usrList.map(x=>'   '+(isBanned[x]?`<i class="fas fa-times" style="cursor:pointer;color:#e7483f;width:20px" onclick="ChangeInputContent(\'/unban `+x+`\')"></i>`:(isAdmin[x]?'<i class="fas fa-user-secret" style="width:20px"></i>':'<i class="fas fa-check" style="cursor:pointer;color:#13c60d;width:20px" onclick="ChangeInputContent(\'/ban '+x+'\')"></i>'))+'<i class="fas fa-at" style="cursor:pointer" onclick="AddInputContent(\'@'+x+' \')" style="width:20px"></i> '+x).join('\n')}`);
		}
	},
	"UsrDel":(Para)=>{
		if(Server.usrList){
			Server.usrList.splice(Server.usrList.indexOf(Para[0]),1);
			isAdmin[Para[0]]=false;
			$('.UserInfo .Output').html(`<i class="fas fa-comments" style="width:20px"></i> Chat Name : ${Server.name}\n<i class="fas fa-user" style="width:20px"></i> User : ${User.name}\n<i class="fas fa-users" style="width:20px"></i> User List : \n${Server.usrList.map(x=>'   '+(isBanned[x]?`<i class="fas fa-times" style="cursor:pointer;color:#e7483f;width:20px" onclick="ChangeInputContent(\'/unban `+x+`\')"></i>`:(isAdmin[x]?'<i class="fas fa-user-secret" style="width:20px"></i>':'<i class="fas fa-check" style="cursor:pointer;color:#13c60d;width:20px" onclick="ChangeInputContent(\'/ban '+x+'\')"></i>'))+'<i class="fas fa-at" style="cursor:pointer" onclick="AddInputContent(\'@'+x+' \')" style="width:20px"></i> '+x).join('\n')}`);
		}
	}
}
function checkEmpty(msg){
	for(var i=0;i<msg.length;i++)
		if(!(msg[i]==' ' || msg[i]=='\n' || msg[i]=='\r' || msg[i]=='\t'))
			return false;
	return true;
}
function parseCommand(msg){
	let cmd=msg.trim().split(/\s+/);
	if(cmd.length==1 && Commands[cmd[0]])
		Commands[cmd[0]].fun();
	else if(cmd[0]==="ban"){
		if(!isAdmin[User.name])
			Write(`<i class="fas fa-times" style="width:20px"></i> The command is unabled as you are not an adminstrator.\n`,{"color":"#e7483f"});
		else if(Server.usrList.indexOf(cmd[1])===-1)
			Write(`<i class="fas fa-times" style="width:20px"></i> User ${cmd[1]} Not Found.\n`,{"color":"#e7483f"});
		else{
			var banSecond=60;
			if(cmd.length>2)	banSecond=parseInt(cmd[2]);
			ws.send(JSON.stringify({
				headers:{
					"Content_Type":'application/banUser',
					"Set_Name":cmd[1],
					"Ban_Time":banSecond*1000
				}
			}));
		}
	}
	else if(cmd[0]==="unban"){
		if(!isAdmin[User.name])
			Write(`<i class="fas fa-times" style="width:20px"></i> The command is unabled as you are not an adminstrator.\n`,{"color":"#e7483f"});
		else if(Server.usrList.indexOf(cmd[1])===-1)
			Write(`<i class="fas fa-times" style="width:20px"></i> User ${cmd[1]} Not Found.\n`,{"color":"#e7483f"});
		else{
			ws.send(JSON.stringify({
				headers:{
					"Content_Type":'application/unbanUser',
					"Set_Name":cmd[1]
				}
			}));
		}
	}
	else{
		ws.send(JSON.stringify({
			headers:{
				Content_Type:'application/message'
			},
			body:'/'+msg
		}))
	}
}
function Send(msg){
	if(checkEmpty(msg))	return;
	S_Interface=false;
	snsArr=msg.split(/[(\r\n)\r\n]+/);
	let idx=0;
	for(;idx<snsArr.length;idx++)
		if($.trim(snsArr[idx])!="")
			break;
	if(S_Status!==3){
		if(S_Status===0){
			User.host=$.trim(snsArr[idx]);
			S_Status++;
			Write(`<i class="fas fa-check" style="color:#13c60d;width:20px"></i> Get Host IP : ${User.host}\n`,{'color':'#13c60d'});
			Write(`Service Port : \n`);
		}else if(S_Status===1){
			User.port=parseInt(msg);
			S_Status++;
			Write(`<i class="fas fa-check" style="color:#13c60d;width:20px"></i> Get Service Port : ${User.port}\n`,{'color':'#13c60d'});
			Initalize();
			Write(`Your Unique Name : \n`);
		}else if(S_Status===2){
			User.name=$.trim(snsArr[idx]);
			S_Status++;
			Commands.cls.fun();
			ws.send(JSON.stringify({
				headers:{
					"Content_Type":'application/init',
					"Set_Name":User.name
				}
			}));
		}
	}
	else if(msg[0]==='/'){
		parseCommand(msg.substr(1));
	}else {
		ws.send(JSON.stringify({
			headers:{
				Content_Type:'application/message'
			},
			body:msg
		}))
	}
}
window.onload=()=>{
	Write(`Host IP : \n<i class="fa fa-spinner fa-spin" style="width:20px"></i> Public Room: 49.234.17.22:8080 <span style='color:grey;'>·Pending</span>\n`);
	let Ping=new WebSocket('ws://49.234.17.22:8080');
	Ping.onerror=()=>{
		if(S_Interface===true){
			output.empty();
			Write(`Host IP : \n<i class="fas fa-chain-broken" style="color:#e7483f;width:20px"></i> Public Room: 49.234.17.22:8080 <span style='color:#e7483f;'>·Offline</span>\n`);
		}
	};
	Ping.onopen=()=>{
		if(S_Interface===true){
			output.empty();
			Write(`Host IP : \n<i class="fas fa-link" style="color:#13c60d;width:20px"></i> Public Room: 49.234.17.22:8080 <span style='color:#13c60d;'>·Online</span>\n`);
			Ping.close();
		}
	}
}
window.onfocus=()=>{
	WFocus=true;
	DOC_title.html(`JS Chat Room`);
}
window.onblur=()=>{
	WFocus=false;
	MSGC=0;
}
function MSGC_SS(){
	if(WFocus===false&&M_Notice){
		MSGC++;
		DOC_title.html(`(${MSGC}) JS Chat Room`);
	}
}
function Write(msg,style){
	let scrollBotton=false;
	if(output[0].scrollTop+14>output[0].scrollHeight-287)
		scrollBotton=true;
	MSGC_SS();
	let EXC='';
	var nextCharacter;
	//在实现@功能的时候，我只能通过创建一个用于Exchange的数组来完成/fn
	for(let i=0,r;i<msg.length;i=r+1){
		r=i;
		let ifMatched=false;
		if(msg[i]==='@'){
			for(let j=0;j<Server.usrList.length;j++)
				if(User.name === Server.usrList[j] && i+Server.usrList[j].length<msg.length){
					ifMatched=true;
					for(let k=1;k<=Server.usrList[j].length;k++)
						if(Server.usrList[j][k-1]!=msg[i+k]){
							ifMatched=false;
							break;
						}
					let nextCharacter = i+Server.usrList[j].length+1;
					if(ifMatched && (nextCharacter>=msg.length-14 || msg[nextCharacter]===' ' || msg[nextCharacter]==='\t' || msg[nextCharacter]==='\n')){
						EXC+=`<span class='fuckat'>${msg.substr(i,Server.usrList[j].length+1)}</span>`;
						r=i+Server.usrList[j].length;
						break;
					}
					ifMatched=false;
				}
		}
		if(ifMatched===false)
			EXC+=msg[i];
	}
	msg=EXC;
	if(style){
		let StyleText=[];
		Object.keys(style).forEach(key=>{
			StyleText.push(`${key}:${style[key]}`);
		});
		StyleText=StyleText.join(';');
		output.html(`${output.html()}<span style='${StyleText}'>${msg}</span>`);
	}else {
		output.html(output.html()+msg);
	}
	if(scrollBotton)
		output.scrollTop(output[0].scrollHeight);
}
