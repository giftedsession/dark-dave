const axios = require('axios');
let handler = async (m, { Owner,appname, Gifted,herokuapi,Heroku }) => {
 if (!Owner) return m.reply(mess.owner)
     const heroku = new Heroku({  
         token: herokuapi, // Replace 'heroku' with your actual Heroku token 
     });  
     let baseUR = "/apps/" + appname;  
     let h9 = await heroku.get(baseUR + '/config-vars');  
     let stoy = '*DAVE-XMD Variables:*\n\n';  
     for ( vrt in h9) { // Added 'const' to declare 'vr' 
         stoy += vrt + '=' + h9[vrt] + '\n\n'; // Fixed variable name 'str' to 'sto' 
     }  
     m.reply(stoy); 
           };
handler.help = ['variables']
handler.tags = ['getvariables']
handler.command = ['getvars']


module.exports = handler;
