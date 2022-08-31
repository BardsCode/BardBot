
require('dotenv').config();
const axios = require('axios').default;
const Discord = require('discord.js');
const { MessageEmbed } = require("discord.js");
const config = require("./config.json");

const guildId = "935614580942573620";


const pendingVerification = new Map();

axios.defaults.headers.common['X-Riot-Token'] = process.env.RIOT_API_KEY;


async function processMessage(message, client){
    if(message.author.bot) return;
    if(!message.content.startsWith(config.commandPrefix)) return;
    if(message.guild === null){
        let processedMessage = message.content.toLowerCase().split(' ');
        switch(processedMessage[0]){
            case config.commandPrefix + config.commands.link.usage:
                await initiateVerification(message, processedMessage);
                break;
            case config.commandPrefix + config.commands.cancel.usage:
                await cancelVerification(message.author.id + "#" + guildId, message.channel);
                break;
            case config.commandPrefix + config.commands.done.usage:
                await completeVerification(message);
                break;
            default:
                return;
        }
    }
}

async function cancelVerification(userGuildId, channel, config){
    if(pendingVerification.has(userGuildId)){
        pendingVerification.delete(userGuildId);
        channel.send("Votre vérification en cours a été annulé");
    }
}

async function initiateVerification(message, processedMessage){

    if(pendingVerification.has(message.author.id + "#" + guildId)){
        message.channel.send("Une vérification est déjà en cours pour votre compte. \n Si il s'agit d'une erreur, annulez avec la commande !cancel");
        return;
    }
    if(processedMessage.length < 3){
        message.channel.send("Mauvaise utilisation de la commande");
        return;
    }
    console.log(processedMessage);
    let summonerEndpoint;
    let region;
    switch(processedMessage[1]){
        case 'euw':
            summonerEndpoint = config.endpoint.SUMMONER_EUW_ENDOINT;
            region = "EUW";
            break
        case 'eune':
            summonerEndpoint = config.endpoint.SUMMONER_EUNE_ENDOINT;
            region = "EUNE";
            break
        case 'na':
            summonerEndpoint = config.endpoint.SUMMONER_NA_ENDOINT;
            region = "NA";
            break
        default:
            message.channel.send("région non supportée");
            return;
    }
    playerName = processedMessage.slice(2).join(' ');
    if(!playerNameValidityCheck(playerName)){
        message.channel.send("Le nom d'invocateur n'est pas valide");
        return;
    }
    console.log(playerName);
    console.log(summonerEndpoint);
    account = await getSummonerByName(summonerEndpoint, playerName);
    if(account != null){  

        let choosenIcon
        if(account["profileIconId"] === config.parameters.profileIconId_1.id){
            choosenIcon = config.parameters.profileIconId_2
        }
        else{
            choosenIcon = config.parameters.profileIconId_1
        }
        
        const embedMessage = new Discord.EmbedBuilder();
        embedMessage.setColor(config.embedColor);
        embedMessage.setAuthor({name: config.embedAuthor, iconURL: config.embedIcon});
        embedMessage.setImage("attachment://"+ choosenIcon.image);
        embedMessage.setTitle(account['name'] + "#" + region +" - Niveau " + account['summonerLevel']);
        embedMessage.setDescription("Compte trouvé ! \n\n Afin de prouver qu'il s'agit bien de votre compte, veuillez vous équiper de cette icone de profil\n\n Puis écrivez **!done** ici en message privé afin de compléter la vérification \n\n *Si il ne s'agit pas de votre compte, annulez la demande en écrivant* **!cancel** \n\n Vous avez **" + config.parameters.verificationTimeout / 60000 + "** Minutes pour compléter la vérification");
        
        userGuildId = message.author.id + "#" + guildId;
        pendingVerification.set(userGuildId, [account['name'], choosenIcon.id, summonerEndpoint]); 

        message.channel.send({embeds: [embedMessage], files: [new Discord.AttachmentBuilder("./leagueAccount/images/" + choosenIcon.image)] });
        console.log("icone demandé: " + choosenIcon.id);
        setTimeout(cancelVerification, config.parameters.verificationTimeout, userGuildId, message.channel);
        
    }
    else{
        message.channel.send("Joueur introuvable ");
    }

}

async function completeVerification(message){
    if(!pendingVerification.has(message.author.id + '#' + guildId)){
        message.channel.send("Vous n'avez pas de vérification en cours");
        return;
    }
    else{
        let playerVerification = pendingVerification.get(message.author.id + '#' + guildId);
        account = await getSummonerByName(playerVerification[2], playerVerification[0]);

        if(account['profileIconId'] === playerVerification[1]){
            message.channel.send("Verification réussie!");
            pendingVerification.delete(message.author.id + '#' + guildId);

            setRoles(guildId, message.author.id, account);
            setPlayerName(guildId, message.author.id, account["name"] );
            registerPlaye(message.author.id, account['puuid']);
            
        }
        else{
            message.channel.send("Vous n'avez pas équipé la bonne icone");
        }
    }
}
async function getSummonerByName(endpoint, name){
    name = encodeURI(name);
    return axios.get(endpoint + name)
    .then( (response) => {
        console.log(response.data['puuid']);
        console.log(response.data);
        return(response.data);
    })
    .catch( (error) =>{
        console.log(error);
    })
}

function playerNameValidityCheck(name){
    if(name.length < 3) {
        return false;
    }
    if(name.length > 16){
        return false;
    }
    return true;
}

// Ajouter les rôles du joueur vérifié sur le serveur discord
function setRoles(guildId, memberId, account){

}

// Renommer le joueur avec son pseudo en jeu sur le serveur discord
function setPlayerName(guildId, memberId, playerName){

}

// Enregistrer en base l'id discord du joueur et son puuid Riot (nécessaire pour mettre à jour ses rôles dans le futur)
function registerPlaye(memberId, puuid){

}

module.exports.processMessage = processMessage;