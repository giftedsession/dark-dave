const axios = require('axios');
let handler = async (m, { Owner,appname,text, Gifted,herokuapi,Heroku }) => {
 if (!Owner) return m.reply(mess.owner)
 if(!text.split('=')[1]) return m.reply('Incorrect Usage:\nProvide the key and value correctly\nExample: setvar AUTOVIEW_STATUS=TRUE')  
 const herok = new Heroku({  
            token: herokuapi,  
          });  
          let baseURI = "/apps/" + appname;  
 await herok.patch(baseURI + "/config-vars", {  
            body: {  
                    [text.split('=')[0]]: text.split('=')[1],  
            },  
 });  
          await m.reply(`✅ The variable ${text.split('=')[0]} = ${text.split('=')[1]} has been set Successfuly.\nWait 20s for changes to effect!`);  

           };
handler.help = ['setvariable']
handler.tags = ['changevar']
handler.command = ['setvar']


module.exports = handler;
