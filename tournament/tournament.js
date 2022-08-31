const Discord = require('discord.js');
const config = require("./config.json");

const tournamentType = require("./templates.json");

var fs = require('fs');

module.exports.processMessage = processMessage;

async function processMessage(message, client){
    if(message.author.bot) return;
    if(message.guild === null) return;
    let hasEventAdminAuthorization;
    if(message.member.roles.cache.some(role => role.id === config.adminRoleId)){
        hasEventAdminAuthorization = true;
    }
    else{
        hasEventAdminAuthorization = false;
    }


    let processedMessage = message.content.toLowerCase().split(' ');

    switch(processedMessage[0]){
        case config.commandPrefix + config.commands.createTournament.usage:
            createTournament(message);
            break;
        case config.commandPrefix + config.commands.startRegistration.usage:
            startRegistration(message);
            break;
        case config.commandPrefix + config.commands.generateBracket.usage:
            closeRegistration(message);
            generateBracket(message);
            break;
        case config.commandPrefix + config.commands.stopTournament.usage:
            stopTournament(message);
            break;           
        case config.commandPrefix + config.commands.forceWin.usage:
            updateResult(message, true, true);
            break;   
        case config.commandPrefix + config.commands.win.usage:
            updateResult(message, false, true);
            break;  
        case config.commandPrefix + config.commands.loose.usage:
            updateResult(message, false, false);
            break;  

        default:
            return;
    }
}

async function createTournament(message){
    message.channel.send("Tournois crée");
}

async function startRegistration(message){
    message.channel.send("inscription ouvertes");
}

async function closeRegistration(message){
    message.channel.send("Inscription fermées");
}

async function generateBracket(message){
    message.channel.send("Bracket généré");
}

async function updateResult(message, force, isWin){
}

async function stopTournament(message){
}
